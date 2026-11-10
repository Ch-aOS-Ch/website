---
title: "Roles Core Reference"
---

# Roles Core Reference

Python Module: `chaos.lib.roles.role`

Abstract base class definition for Ch-aOS execution roles.

## Classes and Data Structures

### `class Delta`

Delta Payload, used as return by the Role.delta() method.

**Attributes:**

- **`to_add`** (*`dict[str, Any]`*): prettified dict for showing what is being changed as an ADDITION in CLI
- **`to_remove`** (*`dict[str, Any]`*): prettified dict for showing what is being changed as an REMOVAL in CLI
- **`metadata`** (*`dict[str, Any]`*): Other data (will not be shown in CLI)

**Methods:**

#### `.__init__()`

```python
Delta.__init__(self, to_add: 'dict[str, Any] | None' = None, to_remove: 'dict[str, Any] | None' = None, metadata: 'dict[str, Any] | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
Delta.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class Role`

Abstract base class for roles in the Ch-aOS framework.

!!! note
    Each role must implement the "get_context", "delta" and "plan" methods to define
    its behavior and interactions for system management and orchestration.

    get_context: This method should return the necessary data and information present
        in the system for the specific context of the role.

    delta: This method should calculate what it needs to do to achieve its goals based
        on the current context and the desired state.

    plan: This method should only stack the actions needed in pyinfra operations to achieve
        the desired state.

**Methods:**

#### `.__init__()`

```python
Role.__init__(self, name: 'str', needs_secrets: 'bool' = False, necessary_chobolo_keys: 'list[str]' = [], necessary_secret_dict_keys: 'list[str]' = [])
```

Initializes a Role.

**Parameters:**

- **`name`** (*`str`*): The name of the role.
- **`needs_secrets`** (*`bool, optional`*): Indicates if the role requires secrets to operate. Defaults to False.
- **`necessary_chobolo_keys`** (*`list[str], optional`*): The list of configuration keys required from the chobolo state. Defaults to [].
- **`necessary_secret_dict_keys`** (*`list[str], optional`*): The list of secret keys required from the secrets store. Defaults to [].

#### `.delta()`

```python
Role.delta(self, context: 'dict[str, Any]' = {}) -> 'Delta'
```

Optional method to implement for roles that require calculating a delta to achieve their goals.

**Parameters:**

- **`context`** (*`dict[str, Any], optional`*): The context for the role, as returned by the get_context method. Defaults to {}.

**Returns:**

- `Delta`: A Delta object containing the actions needed to achieve the desired state.

!!! note
    This method should be implemented by subclasses to calculate what it needs to do to
    achieve its goals based on the current context and the desired state.

#### `.get_context()`

```python
Role.get_context(self, state: 'State', host: 'Host', chobolo: 'dict[str, Any]' = {}, secrets: 'dict[str, Any]' = {}) -> 'dict[str, Any]'
```

Optional method to implement for roles that require context data from the system.

**Parameters:**

- **`state`**: Pyinfra state object.
- **`host`**: Pyinfra host object.
- **`chobolo`** (*`dict, optional`*): The desired state of the system as represented in the Chobolo.
  It contains only the keys specified in the "necessary_chobolo_keys" attribute of the role
  merged with the secret keys specified in the "necessary_secret_dict_keys" attribute of the role. Defaults to {}.
- **`secrets`** (*`dict[str, Any], optional`*): The secrets required for the role, if any. Defaults to {}.

**Returns:**

- `dict[str, Any]`: A dictionary containing the context for the role.

!!! note
    This method should be implemented by subclasses to return the necessary data and
    information present in the system for the specific context of the role.

#### `.plan()`

```python
Role.plan(self, state: 'State', host: 'Host', delta: 'Delta' = Delta(metadata={}, to_add={}, to_remove={})) -> 'ResultPayload'
```

Plan the actions needed to achieve the desired state.

**Parameters:**

- **`state`**: Pyinfra state object.
- **`host`**: Pyinfra host object.
- **`delta`** (*`Delta, optional`*): The delta for the role, as returned by the delta method. Defaults to Delta().

**Returns:**

- `ResultPayload`: A ResultPayload object containing the result of the operation addition process
  including relevant data.

!!! note
    This method should be implemented by subclasses to stack the actions needed in
    pyinfra operations to achieve the desired state.

---
