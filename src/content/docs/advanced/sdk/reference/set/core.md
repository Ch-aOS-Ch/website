---
title: "Set Core Reference"
---

# Set Core Reference

Python Module: `chaos.lib.set`

Orchestration/Explanation Handlers for Chaos CLI

## Functions and Operations

### `setMode()`

```python
setMode(payload: 'SetPayload') -> 'None'
```

Handles configuring the tool by writing default settings to the chaos configuration directory.

**Parameters:**

- **`payload`** (*`SetPayload`*): The payload containing the file paths to set as defaults (chobolo, secrets, or sops files).

**Raises:**

- **`FileNotFoundError`**: If any of the provided file paths do not exist.

---
