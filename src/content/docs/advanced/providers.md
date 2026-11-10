---
title: "Secret Providers"
description: "Zero-Disk ephemeral key management and password manager integrations in Ch-aOS."
---

So, you don't use passwords for file encryption—you use cryptographic keys. Fantastic! But then, where in the nine hells of Dante do you *store* those master keys? They aren't physical objects you can put on a keychain, nor are they something you want to leave lying around unencrypted on a developer workstation or CI runner filesystem.

While sops provides file-level envelope encryption, a **Secret Provider** in Ch-aOS answers the fundamental security question: *"Where and how do you securely store and retrieve the master private keys themselves?"*

Providers are direct and pluggable integrations with modern secrets managers that enable Ch-aOS to fetch master decryption keys **on the fly**, holding them exclusively in volatile RAM for the duration of a command and purging them immediately afterward.

---

## The Zero-Disk Ephemeral Key Workflow

The primary advantage of using a Secret Provider is the **Ephemeral Key Workflow**:

1. **Secure Storage**: The master private key (e.g. your team's `age` private key) resides safely inside your organization's secrets manager.

2. **Ephemeral Retrieval**: When running a command like `chaos apply --secrets -p bw.age`, Ch-aOS requests the key from the provider using secure local CLI sessions.

3. **In-Memory Residency**: On Linux, keys are mounted to `/dev/shm` (POSIX shared memory); on macOS, Ch-aOS dynamically initializes a secure `mac_ram_disk()`. Key file descriptors are passed via `pass_fds` with strict `0600` permissions.

4. **Immediate Eviction**: Once the command execution or SOPS decryption cycle finishes, the in-memory keys and temporary mount points are immediately destroyed.

### Security Guarantees
- **Zero Disk Footprint**: Master private keys are never persisted to disk or flash storage blocks.

- **IAM & RBAC Delegation**: Storing master keys in enterprise password managers bridges local asymmetric encryption with IAM access controls, multi-factor authentication (MFA), and centralized access audit logs. So basically, your local `age` key can become a "cloud-native" key with all the security benefits of a managed secrets vault.

- **Auditability**: Every key retrieval is recorded in your secret provider's access logs.

---

## Global Configuration

You can configure named provider aliases in your global Ch-aOS configuration file (`~/.config/chaos/config.yml`):

```yaml
# ~/.config/chaos/config.yml

secret_providers:
  # Sets the default provider alias when '-p' is specified without an explicit name
  default: bw.age

  # Bitwarden (standard CLI 'bw' or Rust client 'rbw')
  bw:
    age_id: "00000000-0000-0000-0000-000000000000"
    gpg_id: "11111111-1111-1111-1111-111111111111"
    organization_id: "22222222-2222-2222-2222-222222222222"
    collection_id: "33333333-3333-3333-3333-333333333333"

  # Bitwarden Secrets Manager ('bws')
  bws:
    project_id: "44444444-4444-4444-4444-444444444444"
    age_id: "55555555-5555-5555-5555-555555555555"
    gpg_id: "66666666-6666-6666-6666-666666666666"

  # Doppler
  dp:
    project_name: "infrastructure-core"
    config_name: "prd"
    age_secret_name: "PROD_AGE_KEY"
    gpg_secret_name: "PROD_GPG_KEY"

  # Infisical
  in:
    project_id: "inf_proj_123456"
    env_name: "prod"
    secret_path: "/keys"
    age_secret_name: "AGE_PRIVATE_KEY"

  # 1Password CLI ('op')
  op:
    age_url: "op://DevOps/ClusterAgeKey/notesPlain"
    gpg_url: "op://DevOps/ClusterGpgKey/notesPlain"
```

---

## Supported Providers & CLI Flags

Ch-aOS includes built-in first-class integrations for some of the industry's leading secrets managers:

### 1. Bitwarden (`bw`, `rbw`, `bws`)
- **CLI Options**: `-b, --from-bw <ITEM_ID> <KEY_TYPE>`

- **Export/Import Subcommands**: `chaos secrets export bw`, `chaos secrets import bw`

- Supports standard `bw`, accelerated `rbw`, and Machine-to-Machine Bitwarden Secrets Manager (`bws`).

```bash
# Ephemeral decryption with Bitwarden item
chaos apply system --secrets -b "9d8e7f6a-..." "age"

# Export existing key into Bitwarden
chaos secrets export bw age --item-name "Production Age Master" --keys ~/.config/chaos/keys.txt
```

### 2. Doppler (`dp`)
- **CLI Options**: `-dp, --from-dp <ITEM_ID> <KEY_TYPE>`

- **Export/Import Subcommands**: `chaos secrets export dp`, `chaos secrets import dp`

- Item ID format: `project_id/config/secret` (or configured via `config.yml`).

```bash
# Ephemeral decryption with Doppler secret
chaos secrets edit -dp "core-infra/prd/AGE_KEY" age

# Export key to Doppler with masked visibility
chaos secrets export dp -p core-infra -c prd -v masked
```

### 3. Infisical (`in`)
- **CLI Options**: `-I, --from-in <ITEM_ID> <KEY_TYPE>`

- **Export/Import Subcommands**: `chaos secrets export in`, `chaos secrets import in`

- Item ID format: `project_id/secret_path/env/secret_name`.

```bash
# Ephemeral decryption with Infisical
chaos apply app --secrets -I "my-proj//prod/AGE_KEY" age

# Export key to Infisical
chaos secrets export in -e prod --secret-path /keys
```

### 4. 1Password (`op`)
- **CLI Options**: `-o, --from-op <ITEM_ID> <KEY_TYPE>`

- **Export/Import Subcommands**: `chaos secrets export op`, `chaos secrets import op`

- Item ID format: `op://vault/item/field`.

```bash
# Ephemeral decryption with 1Password item URI
chaos secrets print -o "op://DevOps/ProductionKey/notesPlain" age

# Export key directly to 1Password vault
chaos secrets export op -i "op://DevOps/ClusterKey"
```

---

## Interactive Ephemeral Export & Security Barriers

### Interactive RAM Editor Buffer
When exporting a private key without pointing to a file on disk, Ch-aOS spawns a volatile, temporary editor session directly in RAM:

```bash
chaos secrets export bw age --item-name "Prod-Key"
```

The CLI opens `$EDITOR` inside an isolated `/dev/shm` or RAM disk buffer, allowing you to safely paste your private key and save. The key is securely pushed over TLS to the provider and immediately purged from memory.

### One-Way marker (`--no-import`)
When storing sensitive keys via `secrets export`, pass the `-N` or `--no-import` flag:

```bash
chaos secrets export bw age --item-name 'Locked Infrastructure Key' -N
```

This embeds a security marker `# NO-IMPORT` inside the provider payload. The `chaos secrets import` command strictly refuses to pull or save any key containing this header back to local storage, creating an one-way distribution channel. Note that this is purely a text-based marker, and does not encrypt or sign the key itself. This type of behaviour should be done within the secrets manager itself, and therefore falls outside of Ch-aOS's scope, but it is a useful convention to prevent accidental key leakage.
