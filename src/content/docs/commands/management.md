---
title: "Commands: Management (`init`, `set`, `check`)"
description: "CLI environment initialization, configuration persistence, and subsystem inspection in Ch-aOS."
---

Well, Ch-aOS needs a way to manage itself, right? After all, it's not just about managing external infrastructure; you also need to initialize, configure, and inspect the `chaos` CLI environment itself.

The management command suite consists of three core tools:
- **`chaos init`**: Scaffolding wizards to generate configuration templates and initialize SOPS environments.

- **`chaos set`**: Persists default workspace file paths in your global configuration.

- **`chaos check`**: Subsystem introspection and health inspection across all core systems and installed Souls.

---

## `chaos init`

The `chaos init` command creates boilerplate configuration files and cryptographic environments, lowering the barrier to entry by generating schemas for you.

### 1. `init chobolo`
Generates a starter `ch-obolo.yml` configuration. 

Under the hood, `init chobolo` queries `plug_discovery.get_plugins()["keys"]` to locate all registered schema templates provided by installed Souls. It loads the schemas, detects key collisions across plugins (warning if a key is redefined), merges them in memory, and formats the output.

```bash
# Generate complete configuration template for all installed plugins
chaos init chobolo

# Generate template targeting only specific plugins
chaos init chobolo packages users docker

# Print generated configuration directly to stdout instead of saving to file
chaos init chobolo -t

# Print pretty-formatted YAML to stdout
chaos init chobolo -tu
```

**Options:**
- `targets`: Optional plugin identifiers to target (e.g. `packages`, `users`).

- `-t, --template`: Outputs generated configuration directly to standard output without saving to disk.

- `-u, --human`: When used with `-t`, formats output as clean, indented YAML.

- Default save path: `~/.config/chaos/chobolo_template.yml` (or `$CHAOS_CONFIG_DIR`).

---

### 2. `init secrets`
An interactive setup wizard to configure secret management via Mozilla's `sops`.

The wizard guides you through:
1. **Backend Selection & Key Generation**:
   - **`ssh-to-age`**: Inspects `~/.ssh/*.pub` for existing SSH keys and derives an Age public key in memory. Passphrases are passed securely through volatile file descriptor pipes (`/dev/fd/`), ensuring zero unencrypted key exposure on disk.

- **Native `ssh`**: Inspects `~/.ssh/*.pub` for existing SSH keys or creates a new SSH key pair if none are found.

   - **Native `age`**: Generates a standard X25519 Age key pair.

   - **GPG**: Imports existing keys or generates new PGP key pairs.

2. **SOPS Creation Rules**:
   - Generates `.sops.yaml` with creation rules targeting secrets files (`(.*)?secrets.*\.yml$`) and ramble files (`.*\.local/share/chaos/ramblings/.*\.yml$`).

3. **Initial Secret Encryption**:
   - Creates a template `secrets.yml` (`user_secrets: {your_user: {password: "your_password"}}`) and immediately encrypts it in-place using `sops --config .sops.yaml encrypt -i secrets.yml`.

   - Automatically registers the new `.sops.yaml` path in `~/.config/chaos/config.yml`.

```bash
# Run the interactive secrets initialization wizard
chaos init secrets
```

---

## `chaos set`

Persists default paths for your most frequently used files, eliminating the need to pass explicit flags on every command invocation. Values are saved to `~/.config/chaos/config.yml`.

### Subcommands

#### `set chobolo <PATH>`
Sets the default active Ch-obolo file for `chaos apply` and `chaos provision`.

```bash
chaos set chobolo ~/infrastructure/ch-obolo.yml
```

#### `set secrets <PATH>`
Sets the default encrypted secrets file.

```bash
chaos set secrets ~/infrastructure/secrets.sops.yml
```

#### `set sops <PATH>`
Sets the default `.sops.yaml` configuration file.

```bash
chaos set sops ~/infrastructure/.sops.yaml
```

---

## `chaos check`

Provides inspection and verification across all installed Souls, providers, and subsystems.

### Subcommands

#### `check roles`
Lists all available role tags executable via `chaos apply`.

```bash
chaos check roles
```

#### `check aliases`
Lists all role aliases. Merges custom user aliases defined under `aliases:` in `~/.config/chaos/config.yml` with aliases registered by Souls, alerting on naming conflicts.

```bash
chaos check aliases
```

#### `check explanations`
Lists all documentation topics queryable via `chaos explain`.

```bash
chaos check explanations
```

#### `check providers`
Lists all active Secret Providers (`bw`, `bws`, `dp`, `in`, `op`).

```bash
chaos check providers
```

#### `check boats`
Lists all dynamic fleet inventory boat plugins (e.g. `PaperBoat`, `TestBoat`).

```bash
chaos check boats
```

#### `check limanis`
Lists all registered database telemetry plugins (e.g. SQLite, PostgreSQL).

```bash
chaos check limanis
```

#### `check templates`
Lists all registered fleet templates.

```bash
chaos check templates
```

#### `check isles`
Lists all registered Isle infrastructure blueprints for Pelago IaC.

```bash
chaos check isles
```

#### `check secrets`
Validates the configured secrets file and displays the flattened key hierarchy without decrypting or exposing confidential values.

```bash
chaos check secrets
```
