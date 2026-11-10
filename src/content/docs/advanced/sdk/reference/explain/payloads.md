---
title: "Explain Payloads"
---

# Explain Payloads

Python Module: `chaos.lib.explain`

## Classes and Data Structures

### `class ExplainPayload`

Payload for retrieving explanatory documentation about Ch-aOS concepts and roles.

**Attributes:**

- **`topics`** (*`list[str]`*): A list of topics or sub-topics to explain (e.g., 'apply', 'secrets.edit').
- **`yaml`** (*`bool`*): If True, formats the raw explanation output as YAML.
- **`json`** (*`bool`*): If True, formats the raw explanation output as JSON.
- **`details`** (*`str`*): The level of detail requested ('basic', 'intermediate', or 'advanced').
- **`complexity`** (*`str`*): The complexity level of the explanation.

**Methods:**

#### `.__init__()`

```python
ExplainPayload.__init__(self, topics: 'list[str]', yaml: 'bool' = False, json: 'bool' = False, details: 'str' = 'basic', complexity: 'str' = 'basic')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
ExplainPayload.to_dict(self) -> 'dict[str, Any]'
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
