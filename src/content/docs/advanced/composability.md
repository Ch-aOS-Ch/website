---
title: "CLI Composability & Automation"
description: "Integrating Ch-aOS into external scripts, pipelines, and tooling via structured JSON, YAML, and raw stream outputs."
---

Ch-aOS is engineered to adhere to the core Unix philosophy: provide a focused, powerful interface that composes seamlessly with standard command-line utilities, pipelines, and external automation workflows.

While the default terminal output is formatted for human readability with interactive spinners, color codes, and tables, nearly every command in the Ch-aOS suite supports machine-readable serialization flags. This allows developers to consume Ch-aOS state, telemetry, secrets, and documentation directly from shell scripts, CI/CD runners, and custom tooling.

---

## Output Formats: `--json` and `--yaml`

To transition from human-centric output to structured streams, pass the `--json` (`-j`) or `--yaml` (`-y`) flags to any supported command:

### 1. Structured JSON Output (`-j`, `--json`)

Extracting structured definitions, metadata, or conceptual documentation:

```bash
chaos explain -j chaos
```

Returns a validated, schema-compliant JSON payload suitable for parsing with `jq` or external dashboards:

```json
{
  "concept": "The Ch-aOS Command-Line Interface",
  "what": "chaos is the main entry point for the Ch-aOS tool. It acts as a CLI to orchestrate system configuration, manage secrets, and handle team Ch-aOS configurations and documentation.",
  "why": "It provides a single unified interface to core backend engines (like pyinfra and sops), making system management declarative, reproducible, and idempotent.",
  "how": "When running commands such as 'chaos apply users -s', the CLI parses inputs, loads the declarative configuration from the target Ch-obolo, discovers corresponding roles from installed Souls, and executes the underlying lifecycle.",
  "learn_more": [
    "Run 'chaos --help' to inspect all available subcommands."
  ]
}
```

### 2. Structured YAML Output (`-y`, `--yaml`)

For environments that natively process YAML configurations:

```bash
chaos explain -y chaos
```

Returns clean, unadorned YAML:

```yaml
concept: The Ch-aOS Command-Line Interface
what: 'chaos is the main entry point for the Ch-aOS tool. It acts as a CLI to orchestrate
  system configuration, manage secrets, and handle team Ch-aOS configurations and
  documentation.'
why: It provides a single unified interface to core backend engines (like pyinfra
  and sops), making system management declarative, reproducible, and idempotent.
how: When running commands such as 'chaos apply users -s', the CLI parses inputs,
  loads the declarative configuration from the target Ch-obolo, discovers corresponding
  roles from installed Souls, and executes the underlying lifecycle.
learn_more:
- Run 'chaos --help' to inspect all available subcommands.
```

---

## Raw Value Extraction: `-v`, `--value`

When integrating with shell pipelines or environment variable exports, formatting syntax (such as JSON keys or YAML indentation) can introduce parsing overhead.

For specific commands that query values—such as `chaos secrets cat` and `chaos ramble read`—the `-v` (or `--value` / `--values`) flag outputs the raw, unquoted value directly to standard output without headers or newline padding:

```bash
# Export a decrypted database credential directly into an environment variable
export DB_PASSWORD=$(chaos secrets cat databases.prod.password -v)
```

### Piping and Workflow Composition

Because raw outputs avoid auxiliary logging to `stdout`, commands can be piped directly into subsequent processes or other `chaos` commands:

```bash
# Extract a decrypted credential and pipe directly into an apply execution
chaos secrets cat ssh_pass -v | chaos apply users --secrets -p bw.age --password -
```

:::tip[Headless Secret Streaming]
You can combine `chaos ramble read <journal.page> -y -v <keys...>` or `chaos secrets cat <key> -v` to fetch decrypted parameters in memory and stream them directly into third-party tools, preventing plaintext secrets from ever touching persistent storage.
:::

---

## Common Automation Scenarios

1. **CI/CD Build Pipelines**: Validate infrastructure requirements or check Soul discovery programmatically:
   ```bash
   chaos check roles -j | jq '.roles | keys'
   ```

2. **Automated Runbook Execution**: Retrieve runbook parameters or incident documentation from team repositories:
   ```bash
   chaos ramble read incident_response.failover -j -t acme.ops
   ```

3. **Dynamic Fleet Verification**: Inspect discovered hosts and check connectivity status before triggering production changes.

For advanced programmatic use cases that require deeper logic, state hooks, or Python-native execution without shell overhead, refer to the [Ch-aOS Python SDK Overview](./sdk/overview.md).
