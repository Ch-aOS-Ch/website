---
title: "Command: `chaos secrets`"
description: "Guide to managing encrypted secrets, key rotation, SOPS orchestration, and Shamir policies in Ch-aOS."
---

In real life, we don't use "words" to enter our homes, nor do we use them to enter secure establishments or offices. Instead, we use keys, keycards, or biometric authenticators that are unique to us and difficult to replicate. For these reasons, Ch-aOS believes that "passwords" are an outdated and insecure method of protecting sensitive infrastructure data.

Because of this philosophy, Ch-aOS does not have a built-in traditional password manager. Instead, it provides an interface for managing encrypted secrets using standard asymmetric cryptography tools—such as `age`, `pgp`, `ssh`, and HashiCorp `vault` (transit engine), orchestrating CNCF's `sops` tool.

---

## `secrets edit`

Securely edits a secrets file. This command decrypts the file into a temporary in-memory buffer, opens it in your default text editor (`$EDITOR`), and automatically re-encrypts it upon save and exit.

**Why?** It provides a seamless and secure workflow for editing secrets without ever writing an unencrypted plaintext file to disk.

**Usage:**
```bash
# Edit the default secrets file
chaos secrets edit

# Edit a specific secrets file for a team
chaos secrets edit -t my-company.my-team.dev

# Edit the .sops.yaml configuration file directly
chaos secrets edit -s

# Edit using an ephemeral key provider
chaos secrets edit -p bw.age
chaos secrets edit -dp "my-project/prd/AGE_KEY" age
```

**Options:**
- `-t, --team <TEAM>`: Target team scope (`company.team.group`).

- `-s, --sops`: Edit the `.sops.yaml` configuration file instead of the encrypted secrets file.

- `-S, --sops-file <PATH>`: Explicit path to `.sops.yaml`.

- `-F, --secrets-file <PATH>`: Explicit path to the encrypted secrets file.

- Provider flags.

---

## `secrets print`

Decrypts a secrets file and prints its entire contents to standard output in YAML or JSON format.

**Usage:**
```bash
# Print secrets as YAML (default)
chaos secrets print

# Print secrets in JSON format
chaos secrets print -j

# Print the resolved .sops.yaml configuration
chaos secrets print -s -t my-company.my-team.my-group
```

:::caution[Security Risk]
Decrypted secrets will be displayed directly in your terminal screen and potentially recorded in shell history or logging streams. Avoid using this command in shared or untrusted environments.
:::

**Options:**
- `-t, --team <TEAM>`: Target team scope.

- `-s, --sops`: Print the decrypted `.sops.yaml` file instead of the secrets file.

- `-y, --yaml`: Output in YAML format.

- `-j, --json`: Output in JSON format.

- `-S, --sops-file <PATH>`: Override path to `.sops.yaml`.

- `-F, --secrets-file <PATH>`: Override path to secrets file.

- Provider flags.

---

## `secrets cat`

Decrypts a secrets file and retrieves only the specific value(s) of the key(s) you request. Supports nested keys using standard dot notation (e.g., `databases.primary.password`).

Use the `-v` or `--values` flag to print *only* the raw value without formatting or key names, making it ideal for shell scripting, pipelines, and CI/CD automation.

**Usage:**
```bash
# Print specific key with key name
chaos secrets cat user_secrets.dex.password

# Print raw value for piping directly to environment variables
export DB_PASS=$(chaos secrets cat databases.prod.password -v)

# Fetch multiple nested keys simultaneously in JSON format
chaos secrets cat aws.access_key_id aws.secret_access_key -j
```

**Options:**
- `keys`: One or more dot-separated keys to retrieve.

- `-v, --values`: Output only the value(s), suitable for piping.

- `-y, --yaml`: Format output as YAML.

- `-j, --json`: Format output as JSON.

- `-t, --team <TEAM>`: Target team scope.

- `-s, --sops`: Read key values from `.sops.yaml` instead of the secrets file.

- `-S, --sops-file <PATH>`: Override path to `.sops.yaml`.

- `-F, --secrets-file <PATH>`: Override path to secrets file.

- Provider flags.

---

## Key Management & Rotation

Ch-aOS supports four cryptographic key backends:

- `age`: Modern, lightweight X25519-based keys (`age1...`), can be used with post quantum secure algorithms.

- `pgp`: GnuPG public key fingerprints or key IDs.

- `vault`: HashiCorp Vault transit engine keys (`vault://...`).

- `ssh`: SSH public keys for SOPS integration.

### `secrets rotate-add`

Adds a new encryption key to your `.sops.yaml` configuration and optionally re-encrypts all managed secret files to grant immediate access to the new recipient.

**Usage:**
```bash
# Add a new age public key
chaos secrets rotate-add age 'age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p'

# Add a GPG key by fingerprint and fetch it from a public keyserver
chaos secrets rotate-add pgp '1347065F348F37146A94F5BD1934C7EB07BFB4F4' --pgp-server hkps://keys.openpgp.org

# Add a key to rule index 0 and automatically re-encrypt without prompting
chaos secrets rotate-add age 'age1...' -i 0 -y
```

**Options:**
- `type`: Key type (`age`, `pgp`, `vault`, `ssh`).

- `keys`: One or more public keys, fingerprints, or key URIs.

- `-i, --index <INT>`: Target creation rule index in `.sops.yaml`.

- `-c, --create`: Create a new key group within the rule.

- `-y, -ikwid, --i-know-what-im-doing`: Automatically update and re-encrypt all secret files without interactive confirmation prompts.

- `-s, --pgp-server <URL>`: Keyserver URL to fetch PGP keys.

- `--skip-rambles`: Skip re-encrypting ramble files.

- `-t, --team <TEAM>`: Target team scope.

- `-S, --sops-file <PATH>`: Override `.sops.yaml` path.

- Provider flags (needed to rotate the secrets file)

---

### `secrets rotate-rm`

Removes an existing encryption key from `.sops.yaml`, revoking access for that key. Critical when offboarding a team member or decommissioning a server.

**Usage:**
```bash
# Remove an age key and re-encrypt secrets
chaos secrets rotate-rm age 'age1...' -y

# Remove a PGP key from rule index 0
chaos secrets rotate-rm pgp 'FINGERPRINT_TO_REMOVE' -i 0
```

**Options:**
- `type`: Key type (`age`, `pgp`, `vault`, `ssh`).

- `keys`: Keys or fingerprints to remove.

- `-i, --index <INT>`: Target rule index in `.sops.yaml`.

- `-y, -ikwid, --i-know-what-im-doing`: Auto-confirm secret re-encryption.

- `--skip-rambles`: Skip updating rambles.

- `-t, --team <TEAM>`: Target team scope.

- `-S, --sops-file <PATH>`: Override `.sops.yaml` path.

- Provider flags (needed to rotate the secrets file).

---

### `secrets list`

Inspects and lists all registered keys in your `.sops.yaml` configuration grouped by creation rule.

**Usage:**
```bash
# List all registered age keys
chaos secrets list age

# Output as JSON
chaos secrets list pgp -j

# Extract raw key values for shell automation
chaos secrets list age -v
```

**Options:**
- `type`: Key type to list (`age`, `pgp`, `vault`).

- `-y, --yaml`: Output in YAML format.

- `-j, --json`: Output in JSON format.

- `-v, --values`: Print only key identifiers.

- `-t, --team <TEAM>`: Target team scope.

- `-S, --sops-file <PATH>`: Override `.sops.yaml` path.

---

### `secrets reencrypt`

Re-encrypts all managed secret files using the latest key configuration defined in `.sops.yaml`.

**Usage:**
```bash
# Re-encrypt default secrets
chaos secrets reencrypt

# Re-encrypt team secrets with an ephemeral provider
chaos secrets reencrypt -t my-company.my-team -p bw.age
```

**Options:**
- `-t, --team <TEAM>`: Target team scope.

- `-S, --sops-file <PATH>`: Override `.sops.yaml` path.

- `-F, --secrets-file <PATH>`: Override secrets file path.

- `--skip-rambles`: Skip re-encrypting ramble files.

- Provider flags (needed to re-encrypt the secrets file).

---

## Shamir's Secret Sharing (`secrets set-shamir`)

Configures Shamir's Secret Sharing threshold for a given creation rule in `.sops.yaml`. This enforces an $M$-of-$N$ threshold policy where $M$ distinct keys from different key groups are required to decrypt the secret file.

**Usage:**
```bash
# Enforce that rule 0 requires at least 2 key groups to decrypt
chaos secrets set-shamir 0 2 -y

# Remove the Shamir threshold (set to 0)
chaos secrets set-shamir 0 0 -y
```

**Options:**
- `index`: Creation rule index in `.sops.yaml` (0-indexed).

- `share`: Number of required key groups ($M$ threshold).

- `-y, -ikwid, --i-know-what-im-doing`: Auto-confirm applying the threshold across existing secret files.

- `--skip-rambles`: Skip re-encrypting ramble files.

- `-t, --team <TEAM>`: Target team scope.

- `-S, --sops-file <PATH>`: Override `.sops.yaml` path.

---

## `secrets import` & `secrets export`

Ch-aOS provides secure subcommands to transfer master private keys to and from external password managers and secrets vaults (Bitwarden, Doppler, Infisical, etc) with zero plaintext footprint on disk.

For full architectural details and provider configuration, see [Secret Providers](../advanced/providers.md).

### `secrets export`
Exports a local private key into an external provider. Supports opening an in-memory RAM buffer in your editor to safely paste keys.

```bash
# Export age key to Bitwarden
chaos secrets export bw age --item-name 'My Team Age Key' --keys ~/.config/chaos/keys.txt

# Export age key to Doppler with masked visibility
chaos secrets export dp -p my-project -c prd -v masked

# Export age key to Infisical
chaos secrets export in -e prd --secret-path /infrastructure

# Export age key to 1Password
chaos secrets export op -i "op://DevOps/ClusterAgeKey"
```

Use the `-N` or `--no-import` flag to inject a `# NO-IMPORT` marker that prevents the key from ever being re-imported back to disk through Ch-aOS.

### `secrets import`
Imports a master key from a provider into the local environment (e.g. `keys.txt` or GPG keyring):

```bash
# Import age key from Bitwarden item
chaos secrets import bw age --item-id '00000000-0000-0000-0000-000000000000'

# Import age key from Doppler
chaos secrets import dp -p my-project -c prd -s AGE_PRIVATE_KEY
```
