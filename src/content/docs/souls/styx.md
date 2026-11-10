---
title: "The Styx Soul Registry"
description: "Decentralized Git-backed package registry for discovering, installing, managing, and publishing Ch-aOS Souls."
---

**Styx** is the official and decentralized Soul registry for Ch-aOS. It offers a transparent, secure mechanism for users to discover, install, and manage third-party Souls that extend the capabilities of `chaos`.

Instead of relying on a centralized proprietary server or opaque database, Styx uses a public Git repository containing a single declarative YAML file (`registry.yaml`) as its single source of truth.

---

## Interacting with the Registry: `chaos styx`

For CLI reference and syntax, see the [`chaos styx` Command Documentation](../commands/styx.md).

### 1. `chaos styx list`
Query the remote registry to list all registered Souls or view detailed metadata for a specific package:

```bash
# List all available Souls
chaos styx list

# Inspect a specific Soul
chaos styx list chaos-dots
```

Displays the Soul's name, current release version, description, and upstream source repository.

### 2. `chaos styx invoke`
Downloads and installs one or more Souls into your user environment (`~/.local/share/chaos/souls/`):

```bash
# Install the dotfiles management Soul
chaos styx invoke chaos-dots
```

`chaos` fetches the Soul's `.whl` release binary from the designated repository, verifies its SHA256 checksum against the registry, and installs it into your local environment.

### 3. `chaos styx destroy`
Uninstalls and removes a locally installed Soul package:

```bash
# Remove the chaos-dots Soul
chaos styx destroy chaos-dots
```

---

## Submitting a Soul to Styx

To publish a Soul to the community registry:

1. Package your Soul into a standard Python wheel (`.whl`) and publish it as a GitHub release.
2. Compute the SHA256 hash of the `.whl` file:
   ```bash
   sha256sum dist/my_soul-0.1.0-py3-none-any.whl
   ```
3. Open a Pull Request against the [Styx registry repository](https://github.com/Ch-aOS-Ch/styx) updating `registry.yaml`:

```yaml
styx:
  my-soul:
    name: my_soul
    repo: https://github.com/your-username/my-soul
    about: "A declarative Soul for managing custom service infrastructure."
    version: "v0.1.0"
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
```

---

## Security & Trust Model

1. **Human PR Auditing**: All new Souls and version updates undergo mandatory peer review by Ch-aOS maintainers.
2. **Open Source Mandate**: All listed Souls must link to public, inspectable source code repositories.
3. **Signed Commits**: Registry modifications must be made with cryptographically signed commits (GPG/SSH).
4. **Strict Checksum Verification**: Every `.whl` file is validated against the immutable SHA256 `hash` declared in `registry.yaml` prior to installation, preventing upstream tampering or payload substitution.
5. **Rootless User Installation**: Souls install into unprivileged user directories (`~/.local/share/chaos/souls/`) without requiring `sudo` or system root permissions.