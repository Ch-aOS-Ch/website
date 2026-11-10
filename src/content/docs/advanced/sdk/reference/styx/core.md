---
title: "Styx Core Reference"
---

# Styx Core Reference

Python Module: `chaos.lib.styx`

## Functions and Operations

### `get_styx_registry()`

```python
get_styx_registry(payload: 'StyxPayload') -> 'tuple[str | None, str | None, str]'
```

Fetches the Styx registry data from the specified URL.

**Returns:**

- `tuple[str | None, str | None, str]`: A tuple containing the registry data (str), an error message (str), if applicable and the token.

---

### `handle_styx()`

```python
handle_styx(payload: 'StyxPayload') -> 'ResultPayload[dict[str, dict[str, str]] | None]'
```

Handles parsing and routing for the specified styx subcommands.

**Parameters:**

- **`payload`** (*`StyxPayload`*): The structured payload containing the requested action and corresponding details.

**Returns:**

- `ResultPayload[dict[str, dict[str, str]] | None]`: The generic result of the styx operation.

---

### `install_styx_entries()`

```python
install_styx_entries(payload: 'StyxPayload') -> 'ResultPayload[None]'
```

Installs the given Styx registry entries.

**Parameters:**

- **`payload`** (*`StyxPayload`*): The structured payload containing the list of registry entries to install and the force flag.

**Returns:**

- `ResultPayload[None]`: The status payload regarding the operation's outcome.

---

### `is_trusty_domain()`

```python
is_trusty_domain(url: 'str') -> 'bool'
```

Checks if the given URL belongs to a known trusty domain.

**Parameters:**

- **`url`** (*`str`*): The URL to check.

**Returns:**

- `bool`: True if the URL is from a trusty domain, False otherwise.

---

### `list_styx_entries()`

```python
list_styx_entries(payload: 'StyxPayload') -> 'ResultPayload[dict[str, dict[str, str]]]'
```

Lists the available Styx registry entries.

**Parameters:**

- **`payload`** (*`StyxPayload`*): The structured payload containing the list of registry entries to display.

**Returns:**

- `ResultPayload[dict[str, dict[str, str]]`: A payload containing matched registry details.

---

### `parse_styx_registry()`

```python
parse_styx_registry(registry_data: 'str', registry_names: 'list[str]') -> 'tuple[list[dict], list[str]]'
```

Parses the Styx registry data.

**Parameters:**

- **`registry_data`** (*`str`*): The raw string data of the registry YAML.
- **`registry_names`** (*`list[str]`*): The list of specific registry names to parse.

**Returns:**

- `tuple[list[dict], list[str]]`: A tuple of matched entries and a list of parsing errors.

---

### `uninstall_styx_entries()`

```python
uninstall_styx_entries(entries: 'list[str]') -> 'ResultPayload[None]'
```

Uninstalls the given Styx registry entries using pip.

**Parameters:**

- **`entries`** (*`list[str]`*): The list of registry entries to uninstall.

**Returns:**

- `ResultPayload[None]`: A payload summarizing the deletion state.

---
