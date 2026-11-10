---
title: "Command: `chaos explain`"
description: "Interactive in-terminal documentation, conceptual introspection, and architecture breakdown."
---

The `chaos explain` command provides a built-in documentation directly inside your terminal. Its meant to be a didactic way to explore Ch-aOS concepts, command architectures, and soul extensions without leaving your shell.

Because explanations are pluggable and supplied directly by installed souls, the documentation stays strictly in sync with the codebase.

---

## Discovering Topics & Subtopics

To discover all available explanation domains, use the `.list` suffix on any root topic, or inspect registered souls with `chaos check explanations`:

```bash
# Check all registered explanation modules
chaos check explanations

# List all available subtopics for the secrets domain
chaos explain secrets.list

# List all core architectural topics
chaos explain chaos.list
```

## Complexity & Detail Levels

Every explanation class implements granular responses mapped to three levels of complexity (`-d / --details` or `-c / --complexity`):

- `basic` (default): High-level summary, purpose, and standard command examples.

- `intermediate`: Operational breakdown, configuration schemas, parameter flags, and common workflows.

- `advanced`: Deep technical architecture, Python class contracts, internal payloads (`ResultPayload`, `Delta`), and memory structures.

Note that complexity are how deep the explanation gets, while detail levels are how verbose the output is. You can combine both flags to get a more verbose explanation of a complex topic.

```bash
# High-level overview
chaos explain secrets.sops

# Intermediate operational guide
chaos explain secrets.sops -d intermediate

chaos explain secrets.sops -d advanced -c advanced
```

---

## Machine-Readable Output

`chaos explain` supports structured output formatting for tooltips, shell integrations, or documentation generation pipelines:

```bash
# Format explanation as YAML
chaos explain apply -y

# Format explanation as JSON
chaos explain secrets.edit -j
```
