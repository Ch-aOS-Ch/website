---
title: "Managing Secrets via SDK"
description: "Programmatic secrets management, in-memory decryption, and key rotation using the Ch-aOS Python SDK."
---

Handling secrets programmatically can be delicate. You want to enforce strict encryption, prevent credential leakage into logs or stack traces, and eliminate unencrypted plaintext files from disk.

The Ch-aOS Python SDK exposes its complete cryptographic engine directly to your Python applications, allowing you to decrypt YAML/JSON secrets files on the fly, fetch keys from external providers (Bitwarden, Doppler, Infisical, 1Password), and manage key rotation programmatically.

---

## The Secrets Context (`SecretsContext`)

Every secret operation in the SDK is parameterized through a `SecretsContext` DTO. This payload defines the environment, team scope, file overrides, and ephemeral provider configuration.

```python
from chaos.lib.args.dataclasses import SecretsContext, ProviderConfigPayload

# 1. Standard context for local workspace
local_context = SecretsContext(
    team=None,
    sops_file_override=None,
    secrets_file_override=None,
    i_know_what_im_doing=True # Skips interactive confirmation prompts
)

# 2. Context with a configured provider (e.g., Bitwarden via alias)
# optional
provider_cfg = ProviderConfigPayload(
    provider="bw.age", # Resolves provider alias from ~/.config/chaos/config.yml
    ephemeral_provider_args=None
)

# 3. Context with dynamic ephemeral arguments (e.g., Doppler or 1Password)
advanced_context = SecretsContext(
    team="my_company.my_team.backend",
    provider_config=ProviderConfigPayload(
        provider=None,
        ephemeral_provider_args={"from_dp": ("core-infra/prd/AGE_KEY", "age")}
    ),
    i_know_what_im_doing=True
)
```

---

## Decrypting Secrets on the Fly

The primary use case is decrypting secrets files directly into memory to instantiate runtime configurations without persisting credentials to disk.

The `decrypt_secrets` helper handles path resolution, provider authentication, volatile memory buffers, and SOPS execution under the hood:

```python
import omegaconf
from chaos.lib.args.dataclasses import SecretsContext
from chaos.lib.secret_backends.utils import decrypt_secrets, get_sops_files

context = SecretsContext(team="my_company.my_team.backend")

# Resolve full file paths and global config
# This exists so we can use these loaded files
# in other operations (so you don't need to
#   re-load them, which is expensive (IO))
secrets_file, sops_file, global_config = get_sops_files(
    sops_file_override=context.sops_file_override,
    secrets_file_override=context.secrets_file_override,
    team=context.team
)

try:
    # Decrypt the file! Returns the raw decrypted YAML/JSON string from RAM
    raw_decrypted_yaml = decrypt_secrets(
        secrets_file=secrets_file,
        sops_file=sops_file,
        config=global_config,
        context=context
    )

    # Parse into an OmegaConf dictionary
    secrets_dict = omegaconf.OmegaConf.create(raw_decrypted_yaml)
    print(f"Database Host: {secrets_dict.databases.primary.host}")
    print(f"Database Password: {secrets_dict.databases.primary.password}")

except Exception as err:
    print(f"Decryption failed: {err}")
```

---

## Programmatic Key Rotation & Management

You can automate security workflows—such as adding a developer's public key upon onboarding or updating key groups in CI/CD pipelines—using the SDK handlers:

```python
from chaos.lib.args.dataclasses import SecretsRotatePayload, SecretsContext
from chaos.lib.secrets import handleRotateAdd

context = SecretsContext(
    team="my_company.my_team.backend",
    i_know_what_im_doing=True
)

# Define rotation payload for an Age public key
payload = SecretsRotatePayload(
    type="age",
    keys=["age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p"],
    context=context,
    update_confirmed=True # Automatically re-encrypt all secret files
)

result = handleRotateAdd(payload)

if result.success:
    print("Key added and secrets re-encrypted successfully!")
    for msg in result.message:
        print(f"[INFO] {msg}")
else:
    print(f"Key rotation failed:")
    for err in result.error:
        print(f"[ERROR] {err}")
```

---

## Shamir's Secret Sharing Configuration

To configure Shamir $M$-of-$N$ threshold policies programmatically:

```python
from chaos.lib.args.dataclasses import SecretsSetShamirPayload, SecretsContext
from chaos.lib.secrets import handleSetShamir

context = SecretsContext(i_know_what_im_doing=True)

# Enforce a 2-of-N threshold on rule index 0
shamir_payload = SecretsSetShamirPayload(
    index=0,
    share=2,
    context=context,
    update_confirmed=True
)

result = handleSetShamir(shamir_payload)
if result.success:
    print("Shamir threshold successfully updated across all secrets!")
else:
    print(f"Failed to update Shamir threshold:")
    for err in result.error:
        print(f"[ERROR] {err}")
```

---

## Ephemeral Memory Guarantees

When using Secret Providers, the SDK wraps operations in ephemeral context managers (POSIX `/dev/shm` or temporary RAM disks on macOS). All credentials and private keys are wiped immediately after the operation concludes:

```python
from chaos.lib.secret_backends.engines.factory import get_crypto_engine
from chaos.lib.args.dataclasses import SecretsPrintPayload, SecretsContext

engine = get_crypto_engine()
payload = SecretsPrintPayload(
    context=SecretsContext(team="my_company.my_team"),
    json=True
)

result = engine.decrypt(payload)
if result.success:
    # Decrypted content is available in result.data['dec']
    print("Decrypted payload loaded into memory.")
else:
    print(f"Decryption failed:")
    for err in result.error:
        print(f"[ERROR] {err}")
```
