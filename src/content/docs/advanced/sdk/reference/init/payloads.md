---
title: "Init Payloads"
---

# Init Payloads

Python Module: `chaos.lib.inits`

Scripts for initializing various parts of Ch-aOS, including Chobolo configurations and secret management.

## Classes and Data Structures

### `class InitPayload`

Payload for generating boilerplate configuration files via the initialization wizard.

**Attributes:**

- **`init_command`** (*`Literal`*): The type of initialization to perform ('chobolo' or 'secrets').
- **`update_plugins`** (*`bool`*): If True, forces a refresh of the plugin cache before initialization.
- **`targets`** (*`list[str]`*): Optional list of target plugins to base the chobolo template on.
- **`template`** (*`bool`*): If True, prints the generated template to stdout instead of saving it to a file.
- **`human`** (*`bool`*): If True, formats the output of a templated chobolo as human-readable YAML instead of raw Python dict.

**Methods:**

#### `.__init__()`

```python
InitPayload.__init__(self, init_command: "Literal['chobolo', 'secrets']", update_plugins: 'bool' = False, targets: 'list[str] | None' = None, template: 'bool' = False, human: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
InitPayload.to_dict(self) -> 'dict[str, Any]'
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
