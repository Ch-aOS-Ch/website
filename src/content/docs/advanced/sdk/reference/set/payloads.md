---
title: "Set Payloads"
---

# Set Payloads

Python Module: `chaos.lib.set`

Orchestration/Explanation Handlers for Chaos CLI

## Classes and Data Structures

### `class SetPayload`

Payload for setting default paths in the global chaos configuration.

**Attributes:**

- **`chobolo_file`** (*`str | None`*): Path to the default Ch-obolo file.
- **`sops_file`** (*`str | None`*): Path to the default .sops.yaml configuration file.
- **`secrets_file`** (*`str | None`*): Path to the default secrets file.

**Methods:**

#### `.__init__()`

```python
SetPayload.__init__(self, chobolo_file: 'str | None', sops_file: 'str | None', secrets_file: 'str | None')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SetPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---
