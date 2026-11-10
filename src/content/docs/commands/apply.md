---
title: "Command: `chaos apply`"
description: "Declarative role execution, 3-stage lifecycle, Pyinfra engine, and fleet orchestration in Ch-aOS."
---

Well duh, how is a system management framework supposed to manage your infrastructure if it can't apply changes?

The `chaos apply` command is the core execution and orchestration engine of Ch-aOS. It executes declarative [Roles](../souls/roles.md) against target hosts to reconcile actual system state with the desired state declared in your [Ch-obolo configuration files](../core-concepts.md#ch-obolos-the-data).

Under the hood, Ch-aOS leverages `pyinfra` as its orchestration core while wrapping it in a structured 3-stage idempotent lifecycle:

---

## The 9-Phase Execution Lifecycle

When you execute `chaos apply`, the command progresses through 9 distinct operational phases:

1. **Configuration Resolution (`get_configs`)**: Resolves the active team workspace (`company.team.group`), active Ch-obolo path (or explicit `-c <chobolo>` override), `.sops.yaml`, and secrets files.

2. **Recursive Alias Expansion (`resolve_aliases`)**: Expands shorthand tags defined by installed Souls (e.g., `pkgs` -> `system_packages`, `usr` -> `users`).

3. **Dependency & Secret Pre-Flight (`gather_apply`)**: Validates that all required Ch-obolo keys (`necessary_chobolo_keys`) and secrets (`necessary_secrets`) exist before modifying any host. If a role requires secrets and `--secrets` was omitted, Ch-aOS prompts for provider decryption.

4. **Dynamic Fleet Discovery (`gather_fleet`)**: If running in fleet mode (`-f / --fleet`), loads [Boats](../advanced/boats.md) to discover inventory hosts and conducts parallel connectivity health checks.

5. **Pyinfra State Initialization (`setup_pyinfra`)**: Configures concurrency mode, sudo authentication, applies Paramiko encoding safety patches, and binds the [Limani database plugin](../souls/limani.md) for telemetry.

6. **Context Inspection (`run_context`)**: Executes `role.get_context(state, host, chobolo, secrets)`. Secret values are automatically tracked to ensure they are masked across stdout and audit logs.

7. **Delta Diffing (`run_delta`)**: Calls `role.delta(context)` returning a typed `Delta(to_add=..., to_remove=..., metadata=...)` object, rendering a visual diff in the terminal.

8. **Plan & Execution (`run_plan` & `execute_plans`)**:
   - In dry-run mode (`-d / --dry`), execution halts here after printing the delta.

   - In apply mode, calls `role.plan(state, host, delta)` and runs pyinfra operations across target hosts.

9. **Teardown & Audit Logbook (`teardown_pyinfra`)**: Displays execution metrics, records audit logs via Limani, optionally dumps JSON telemetry (`-x / --export-logs`), and unmounts all in-memory ephemeral key mounts.

---

## Key Options & Flags

### Tag Selection & Alias Support
Tags define which Roles run. Multiple tags can be passed to execute roles sequentially:

```bash
# Apply users and system-packages
chaos apply users system_packages

# Apply using Soul tag aliases
chaos apply usr pkgs
```

### Execution Control
- `-d, --dry`: Dry-run mode. Computes context and renders the `Delta` diff without executing any changes on the host.

- `-e, --serial`: Runs operations sequentially, one host at a time. Recommended for rolling updates or stateful services.

- `-N, --no-wait`: Runs operations concurrently across all fleet hosts in parallel.

- `-y, -ikwid, --i-know-what-im-doing`: Bypasses all interactive confirmation prompts.

```bash
# Preview changes safely
chaos apply --dry system_packages

# Run sequentially across the fleet
chaos apply database_migration -f --serial
```

### Secrets & Authentication
- `-s, --secrets`: Signals that executed roles require decrypted secrets. Decrypts credentials into volatile RAM for the duration of the command.

- `-p, --provider [NAME]`: Use a configured Secret Provider (Bitwarden, Doppler, Infisical, 1Password) for zero-disk key retrieval.

- `-P, --sudo-password-file <PATH>`: Reads the sudo password from a file.

- `-w, --password [PASSWORD]`: Passes sudo password via flag or standard input pipe:

```bash
# Pass sudo password securely via pipe
echo "$SUDO_PASS" | chaos apply users -sp bw.age -w # since this is a pipe, the system implies -y or --i-know-what-im-doing
```

### Fleet Management (`-f`, `--fleet`)
- `-f, --fleet [PATH]`: Targets remote hosts defined in the Ch-obolo or an external fleet inventory YAML file:

```bash
# Apply to fleet defined in Ch-obolo
chaos apply web_server -f

# Apply to external fleet inventory
chaos apply web_server -f /etc/chaos/fleet-production.yml
```

### Logging, Telemetry & Logbook
- `-l, --logbook`: Displays an interactive summary of execution events, operations run, and state deltas upon completion.

- `-x, --export-logs`: Automatically exports a full JSON execution trace to disk.

- `-i, --limani <PLUGIN>`: Selects a specific [Limani database soul](../souls/limani.md) (e.g. SQLite, PostgreSQL) to persist audit history.

- `-v, -vv, -vvv` or `--verbose <1|2|3>`: Configures logging verbosity.

```bash
# Apply with telemetry logbook and JSON export
chaos apply system_packages -lxi chrima.sqlite
```

### Configuration Overrides
- `-c <PATH>`: Explicitly overrides the Ch-obolo YAML path.

- `-t, --team <TEAM>`: Sets team context (`company.team.group`).

- `-S, --sops-file <PATH>`: Overrides `.sops.yaml` configuration file path.

- `-F, --secrets-file <PATH>`: Overrides encrypted secrets file path.
