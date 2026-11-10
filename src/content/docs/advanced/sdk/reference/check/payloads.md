---
title: "Check Payloads"
---

# Check Payloads

Python Module: `chaos.lib.checkers`

Handles listing of roles/explanations/aliases with rich rendering.

!!! note
    + some validity checks for vault

## Classes and Data Structures

### `class CheckPayload`

Payload for checking and listing available Ch-aOS components.

**Attributes:**

- **`checks`** (*`Literal`*): The specific type of component to check (e.g., 'roles', 'aliases', 'secrets').
- **`yaml`** (*`bool`*): If True, forces the output of the check to be in YAML format.
- **`json`** (*`bool`*): If True, forces the output of the check to be in JSON format.
- **`team`** (*`str | None`*): Optional team context string to resolve paths when checking team-specific components.
- **`sops_file_override`** (*`str | None`*): Optional override for the .sops.yaml configuration file path.
- **`secrets_file_override`** (*`str | None`*): Optional override for the secrets file path.
- **`update_plugins`** (*`bool`*): If True, forces a refresh of the plugin cache before performing the check.

**Methods:**

#### `.__init__()`

```python
CheckPayload.__init__(self, checks: "Literal['explanations', 'roles', 'aliases', 'providers', 'boats', 'secrets', 'limanis', 'templates', 'isles']", json: 'bool' = False, yaml: 'bool' = False, team: 'str | None' = None, sops_file_override: 'str | None' = None, secrets_file_override: 'str | None' = None, update_plugins: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
CheckPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class ResultPayload`

This payload is meant to be used as a STANDARD RETURN TYPE for all API calls in the library, and it should
    be used as such in the future for all API calls.

**Attributes:**

- **`success`**: A boolean indicating whether the operation was successful or not.
- **`message`**: A list of strings containing any messages that should be returned to the user.
- **`data`**: Any data that should be returned to the user, can be of any type
- **`error`**: A list of strings containing any error messages that should be returned to the user.

**Methods:**

#### `.__init__()`

```python
ResultPayload.__init__(self, success: 'bool', message: 'list[str] | None' = None, data: 'T | None' = None, error: 'list[str] | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
ResultPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---
