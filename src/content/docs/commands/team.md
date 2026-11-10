---
title: "Command: `chaos team`"
description: "CLI guide for managing collaborative team repositories, multi-tenant SOPS Shamir secret sharing, and team workspaces."
---

The `chaos team` subsystem provides a structured way to manage and share Ch-aOS configurations, encrypted secrets, and knowledge base pages ([Rambles](./ramble.md)) across teams using standard Git repositories.

A team repository is a version-controlled Git repository containing:
- `.chaos.yml`: Team and company metadata.

- `sops-config.yml`: SOPS encryption rules configured with multi-recipient [Shamir Secret Sharing](../advanced/sdk/secrets.md).

- `secrets/`: Encrypted team secrets.

- `ramblings/`: Shared encrypted and plaintext documentation pages.

---

## Team Hierarchy Naming

Ch-aOS enforces a hierarchical dot-notation naming convention for team structures:

```
company.team.person
```

For example: `acme-corp.infrastructure.alice` or `mycompany.platform`.

---

## Subcommands Overview

### 1. `team init`

Initializes a standard team repository structure in the current working directory or at a specified path.

```bash
# Initialize a team repository for a member
chaos team init acme-corp.platform.alice

# Initialize at a specific directory path
chaos team init acme-corp.platform.alice ./platform-repo
```

What `team init` performs:
1. Generates `.chaos.yml` containing the declared company and team metadata.

2. Generates `sops-config.yml` configured with secure defaults (e.g. Shamir threshold rules).

3. Creates `secrets/` and `ramblings/` directories.

4. Initializes a local Git repository if `.git` is not already present.

---

### 2. `team clone`

Clones an existing team Git repository and automatically registers/activates it in your local environment.

```bash
chaos team clone git@github.com:acme-corp/platform-chaos.git
```

`chaos` clones the repository and executes activation.

:::danger[Automatic Rollback Protection]
If the cloned repository does not contain a valid `.chaos.yml` metadata file, the activation fails, and `chaos` automatically removes the cloned directory to prevent environment corruption.
:::

---

### 3. `team activate`

Registers a local team repository with your Ch-aOS environment. Useful if you cloned a repository manually or manage multiple working trees.

```bash
# Activate the team repository in the current directory
chaos team activate

# Activate a team repository located at a specific path
chaos team activate ./infra/platform-chaos
```

`team activate` inspects `.chaos.yml` and creates a symbolic link under `~/.local/share/chaos/teams/<company>/<team>` pointing to your local repository directory. This enables team-scoped operations such as:

```bash
# Target the activated team's secrets and configurations
chaos apply web_server --team acme-corp.platform
```

---

### 4. `team deactivate`

Un-registers a team repository from your local environment by removing its symlink. The underlying Git repository and files remain intact.

```bash
# Deactivate a specific team
chaos team deactivate acme-corp platform

# Deactivate all teams registered under a company
chaos team deactivate acme-corp
```

---

### 5. `team list`

Displays all team workspaces currently activated on your machine:

```bash
# List all active companies and teams
chaos team list

# List active teams for a specific company
chaos team list acme-corp
```

---

### 6. `team prune`

Scans `~/.local/share/chaos/teams/` and removes broken or stale symlinks pointing to directories that no longer exist on your filesystem.

```bash
chaos team prune
```
