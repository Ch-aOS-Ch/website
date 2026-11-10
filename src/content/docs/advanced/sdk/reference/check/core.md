---
title: "Check Core Reference"
---

# Check Core Reference

Python Module: `chaos.lib.checkers`

Handles listing of roles/explanations/aliases with rich rendering.

!!! note
    + some validity checks for vault

## Functions and Operations

### `checkAliases()`

```python
checkAliases(ROLE_ALIASES: 'dict[str, str]') -> 'ResultPayload[dict[str, str]]'
```

Checks if the provided aliases are valid.

**Parameters:**

- **`ROLE_ALIASES`** (*`dict`*): A dictionary of role aliases to check.

**Returns:**

- `ResultPayload[dict[str, str]]`: The result payload containing the valid aliases, and any warnings/messages.

---

### `checkBoats()`

```python
checkBoats(boats: 'dict[str, str]') -> 'ResultPayload[list[str]]'
```

Checks if the provided boats are valid.

**Parameters:**

- **`boats`** (*`dict`*): A dictionary of boats to check.

**Returns:**

- `ResultPayload[list[str]]`: The result payload containing a list of valid boats.

---

### `checkExplanations()`

```python
checkExplanations(EXPLANATIONS: 'dict[str, str]') -> 'ResultPayload[list[str]]'
```

Checks if the provided explanations are valid.

**Parameters:**

- **`EXPLANATIONS`** (*`dict`*): A dictionary of explanations to check.

**Returns:**

- `ResultPayload[list[str]]`: The result payload containing a list of valid explanations.

---

### `checkIsles()`

```python
checkIsles(isles: 'dict[str, str]') -> 'ResultPayload[list[str]]'
```

Checks if the provided isles are valid.

**Parameters:**

- **`isles`** (*`dict`*): A dictionary of isles to check.

**Returns:**

- `ResultPayload[list[str]]`: The result payload containing a list of valid isles.

---

### `checkLimanis()`

```python
checkLimanis(limanis: 'dict[str, str]') -> 'ResultPayload[list[str]]'
```

Checks if the provided limanis are valid.

**Parameters:**

- **`limanis`** (*`dict`*): A dictionary of limanis to check.

**Returns:**

- `ResultPayload[list[str]]`: The result payload containing a list of valid limanis.

---

### `checkProviders()`

```python
checkProviders(providers: 'dict[str, str]') -> 'ResultPayload[list[str]]'
```

Checks if the provided providers are valid.

**Parameters:**

- **`providers`** (*`dict`*): A dictionary of providers to check.

**Returns:**

- `ResultPayload[list[str]]`: The result payload containing a list of valid providers.

---

### `checkRoles()`

```python
checkRoles(ROLES_DISPATCHER: 'dict[str, str]') -> 'ResultPayload[list[str]]'
```

Checks if the provided roles are valid.

**Parameters:**

- **`ROLES_DISPATCHER`** (*`dict`*): A dictionary of roles to check.

**Returns:**

- `ResultPayload[list[str]]`: The result payload containing a list of valid roles.

---

### `checkSecrets()`

```python
checkSecrets(secrets_file: 'str') -> 'ResultPayload[list[str]]'
```

Checks if the secrets in the specified file are valid.

**Parameters:**

- **`secrets_file`** (*`str`*): The path to the secrets file.

**Returns:**

- `ResultPayload[list[str]]`: The result payload containing a list of flattened secrets keys if successful.

---

### `checkTemplates()`

```python
checkTemplates(keys: 'dict[str, str]') -> 'ResultPayload[list[str]]'
```

Checks if the provided templates are valid.

**Parameters:**

- **`keys`** (*`dict`*): A dictionary of templates to check.

**Returns:**

- `ResultPayload[list[str]]`: The result payload containing a list of valid templates.

---

### `handle_check()`

```python
handle_check(payload: 'CheckPayload') -> 'ResultPayload[list[str] | dict[str, str] | None]'
```

Handles various check commands based on the payload.

**Parameters:**

- **`payload`** (*`CheckPayload`*): The payload containing the check command and related context.

**Returns:**

- `ResultPayload[list[str] | dict[str, str] | None]`: The result payload of the requested check.

---
