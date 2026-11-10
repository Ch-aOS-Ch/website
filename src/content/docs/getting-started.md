---
title: "Getting Started"
---

This guide will walk you through the initial setup of the `chaos` CLI and its core components.

## Installation

:::note[Installation Method]
Ch-aOS is distributed and installed via the official standalone bootstrap installer script:
:::
```bash
curl -LsSf https://raw.githubusercontent.com/Ch-aOS-Ch/Ch-aOS/refs/heads/main/install.sh | sudo bash
```

## Verify Installation

After installation, you can verify that the CLI is working and see the available commands.

1.  **Update the Soul cache:**
    Run the following command to make sure `chaos` discovers all installed Souls.
    ```bash
    chaos -u
    ```

2.  **View the help menu:**
    ```bash
    chaos -h
    ```

3.  **Check available components:**
    You can list all the roles, explanations, and aliases provided by your installed Souls.
    ```bash
    chaos check roles
    chaos check explanations
    ```

## First Run: Declarative Dotfiles on Your Workstation

The fastest way to experience the safety and power of Ch-aOS on your local machine without needing cloud accounts or hypervisors is managing your dotfiles.

### 1. Invoke the `chaos-dots` Soul from Styx
Download the official, cryptographically verified dotfiles Soul from the decentralized Styx registry:
```bash
chaos styx invoke chaos-dots
```

### 2. Generate a Documented Template
Bootstrap a human-friendly Ch-obolo template populated with helpful comments:
```bash
chaos init chobolo dotfiles --template --human > first-chobolo.yaml
```

Edit `first-chobolo.yaml` with your repository URL and target links:
```yaml
dotfiles:
  - url: "https://github.com/your-username/dotfiles.git"
    pull: false
    branch: "main"
    user: your-username
    links:
      - from: bookmarks
        to: .
      - from: .config
        to: .
      - from: bash
        to: .
        open: true
      - from: zsh
        to: .
        open: true
      - from: ramble
        to: .local/share/chaos/ramble
```

### 3. Safe Simulation (`--dry` mode)
Run a dry-run preview to inspect every planned symlink and automatic backup before touching disk:
```bash
chaos apply dotfiles --dry -c first-chobolo.yaml
```

The terminal will report the exact delta:
```text
INFO: Role 'dotfiles' on host: '@local' has the following delta:
  ----- To add: backups -----
    + Backup /home/user/.zsh_history to /home/user/.zsh_history.bak_1792500145

  ----- To add: links -----
    + Link /home/user/.dotfiles/chaos/dotfiles/zsh/.zsh_history -> /home/user/.zsh_history

INFO: dry mode is enabled. finishing the execution without applying changes.
```

When satisfied with the preview, apply the changes idempotently by removing the `--dry` flag:
```bash
chaos apply dotfiles -c first-chobolo.yaml
```

You are now ready to start using Ch-aOS!