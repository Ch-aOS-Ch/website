---
title: "Command: `chaos ramble`"
description: "CLI guide for personal and collaborative team knowledge base, encrypted technical notes, YAML pages, and SOPS integration."
---

The `chaos ramble` subsystem is an integrated, file-based personal and team knowledge base and wiki system. It allows you to create, edit, search, and encrypt technical notes, architecture decisions, and operational runbooks directly from the command line.

---

## Why Ramble?

In system administration and DevOps workflows, critical operational knowledge (e.g. key locations, manual recovery steps, architecture diagrams, command recipes) is often scattered across external wikis or stored insecurely in unencrypted text files.

`ramble` solves this by co-locating documentation directly within your Ch-aOS management environment:
- **SOPS Encryption**: Notes containing sensitive passwords, tokens, or network topologies are encrypted with the same SOPS keys used by [Ch-aOS Secrets](./secrets.md).

- **Team Integration**: Notes can be scoped to personal storage or shared version-controlled repositories via [Team Workspaces](./team.md).

- **In-Memory Viewing**: Encrypted notes are decrypted directly into memory on read without writing plaintext to disk.

---

## Storage Organization: Journals & Pages

Rambles are organized into a two-tier hierarchy:
- **Journals**: Directories grouping related notes (e.g. `linux`, `networking`, `incident-response`).

- **Pages**: YAML document files within a journal (e.g. `linux.kernel_tuning` $\rightarrow$ `~/.local/share/chaos/ramblings/linux/kernel_tuning.yml`).

### Personal vs. Team Storage Paths
- **Personal Rambles**: Stored locally in `~/.local/share/chaos/ramblings/`.

- **Team Rambles**: Stored in `~/.local/share/chaos/teams/<company>/<team>/ramblings/<person>/` and enabled by passing `-t <company.team.person>`.

---

## Subcommands Overview

### 1. `ramble create`

Creates a new ramble page and opens it in your default terminal editor (`$EDITOR` or `nano`/`vim`):

```bash
# Create a new page 'networking' in the 'linux' journal
chaos ramble create linux.networking

# Create and immediately encrypt the page upon saving
chaos ramble create security.credentials -e

# Create a team-scoped ramble
chaos ramble create security.runbook -t acme-corp.platform.alice -e
```

---

### 2. `ramble read`

Renders the formatted content of a ramble page in the terminal. If the page is encrypted, it decrypts the file in memory:

```bash
# Read a specific page
chaos ramble read linux.networking

# Interactive journal browsing (lists all pages in the journal)
chaos ramble read linux.list

# Read from a team workspace
chaos ramble read security.runbook -t acme-corp.platform.alice
```

---

### 3. `ramble edit`

Opens an existing page in your editor. For encrypted notes, it handles the SOPS decryption, interactive editing, and automatic re-encryption transparently:

```bash
chaos ramble edit linux.networking
```

---

### 4. `ramble find`

Performs full-text case-insensitive searching across all your rambles, including within encrypted notes:

```bash
# Search for keyword 'wireguard' across all journals
chaos ramble find wireguard

# Search by specific metadata tag
chaos ramble find --tag production
```

---

### 5. `ramble encrypt`

Applies SOPS encryption to an existing unencrypted ramble:

```bash
# Encrypt the entire page
chaos ramble encrypt linux.networking

# Selectively encrypt specific YAML keys only
chaos ramble encrypt security.passwords -k db_password -k api_token
```

---

### 6. `ramble update`

Re-encrypts all encrypted ramble files with updated key recipients. Execute this after rotating or adding keys with `chaos secrets rotate-add` / `rotate-rm`:

```bash
chaos ramble update
```

---

### 7. `ramble move`

Renames a page or moves it between journals:

```bash
# Rename a page within the same journal
chaos ramble move linux.old_name linux.new_name

# Move a page to a different journal
chaos ramble move staging.app production.app
```

---

### 8. `ramble delete`

Permanently removes a page or an entire journal directory after interactive confirmation:

```bash
# Delete a single page
chaos ramble delete linux.networking

# Delete an entire journal and all containing pages
chaos ramble delete linux
```
