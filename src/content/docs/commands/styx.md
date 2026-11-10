---
title: "Command: `chaos styx`"
description: "CLI guide for managing external Ch-aOS Souls via the decentralized Styx registry (list, invoke, destroy, private registries)."
---

The `chaos styx` command manages and interacts with the **Styx** Soul registry.

This command allows you to install (`invoke`), list (`list`), and remove (`destroy`) community and private Souls that extend the capabilities of Ch-aOS.

---

## Command Syntax

```bash
chaos styx <action> [soul_names...] [options]
```

### Actions

- `list`: Query and display Souls available in the Styx registry.

- `invoke`: Download, verify (SHA256), and install one or more Souls locally into `~/.local/share/chaos/souls/`.

- `destroy`: Remove locally installed Souls.

---

## Options & Flags

- `-y`, `--yaml`: Output registry listings or command results in YAML format.

- `-j`, `--json`: Output registry listings or command results in JSON format.

- `-u <url>`, `--url <url>`: Override the default Styx registry URL with a custom or internal registry.

- `-p`, `--private`: Authenticate against private Styx registries by decrypting a `styx_token` from your active [SOPS Secrets](./secrets.md).

- `-t <team>`, `--team <team>`: Target a specific team workspace when authenticating private registry tokens.

---

## Usage Examples

### 1. Listing Available Souls

```bash
# List all registered Souls with human-friendly formatting
chaos styx list

# Inspect a specific Soul
chaos styx list chaos-dots

# Export full registry catalog as JSON
chaos styx list -j
```

### 2. Installing Souls (`invoke`)

```bash
# Install the dotfile management Soul
chaos styx invoke chaos-dots

# Install multiple Souls at once
chaos styx invoke chaos-dots chaos-k8s
```

`chaos` fetches the Soul's `.whl` package, verifies its SHA256 cryptographic checksum against the registry entry, and installs the wheel into user space (`~/.local/share/chaos/souls/`).

### 3. Uninstalling Souls (`destroy`)

```bash
# Remove a Soul
chaos styx destroy chaos-dots
```

### 4. Querying Private Registries

```bash
# Query an enterprise or internal private Styx registry using decrypted team credentials
chaos styx list --url https://gitlab.internal.corp/infra/styx.yaml -p -t my-company.platform
```

---

## Contributing a Soul to Styx

If you have created a Soul and wish to share it with the community via Styx, open a Pull Request against the [Styx GitHub repository](https://github.com/Ch-aOS-Ch/styx).

Entries are declared in `registry.yaml`:

```yaml
styx:
  chaos-dots:
    name: chaos_dots
    repo: https://github.com/Ch-aOS-Ch/chaos-dots
    about: "Declarative dotfile and workstation configuration Soul."
    version: "v0.1.1"
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
```

---

## Security & Architecture Principles

:::important[Plugin Registry, Not a General Package Manager]
Styx was created specifically as a **pluggable registry**, not an open-ended dependency resolver. Souls must be self-contained solutions.

If your Soul requires external libraries, manage and audit them via PyPI (`pip-audit`) and bundle or declare standard Python dependencies in your wheel.
:::

1. **Mandatory Peer Review**: All community Souls submitted to Styx undergo human review by the Styx reviewer team.

2. **Open Source & License Required**: Every Soul must be open source with an explicit `LICENSE` and `SECURITY.md`.

3. **Signed Commits**: Registry additions and updates require cryptographically signed Git commits (GPG/SSH).

4. **Immutable Checksum Validation**: The CLI downloads `.whl` files and validates their SHA256 checksum against `registry.yaml` prior to installation, preventing supply chain tampering.

5. **Rootless Installation**: Souls install into unprivileged user directories (`~/.local/share/chaos/souls/`) without requiring elevated root privileges.
