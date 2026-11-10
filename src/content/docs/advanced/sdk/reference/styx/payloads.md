---
title: "Styx Payloads"
---

# Styx Payloads

Python Module: `chaos.lib.styx`

## Classes and Data Structures

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

### `class StyxPayload`

Payload for interacting with the Styx plugin registry.

**Attributes:**

- **`styx_commands`** (*`Literal`*): The Styx action to perform ('invoke' for install, 'list', or 'destroy' for uninstall).
- **`entries`** (*`list[str]`*): The names of the plugins to install, list, or uninstall.
- **`yaml`** (*`bool`*): If True, formats the output in YAML format.
- **`json`** (*`bool`*): If True, forces the output of the command to be in JSON format.
- **`force`** (*`bool`*): If True, forces the action without confirmation (applicable for 'invoke' command).
- **`registry_url`** (*`str | None`*): Optional custom URL for the Styx plugin registry, if not using the default registry.
- **`context`** (*`SecretsContext | dict[str, Any] | None`*): Optional context for resolving secrets when invoking from private repos.
- **`private`** (*`bool`*): If True, indicates that the Styx command is being invoked to a private repository, which may require additional context for secret resolution.
- **`config`** (*`str`*): config file path.

**Methods:**

#### `.__init__()`

```python
StyxPayload.__init__(self, styx_commands: "Literal['invoke', 'list', 'destroy']", entries: 'list[str]', yaml: 'bool' = False, json: 'bool' = False, config: 'DictConfig | None' = None, force: 'bool' = False, registry_url: 'str | None' = None, private: 'bool' = False, context: 'SecretsContext | dict[str, Any] | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
StyxPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---
