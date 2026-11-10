---
title: "Ramble Core Reference"
---

# Ramble Core Reference

Python Module: `chaos.lib.ramble`

Module for managing ramble journals and pages.

Yeah, it's like a personal wiki or knowledge base, weird for a DevOps tool right? LMAO
Amazing for keeping track of random knowledge, scripts, concepts, and ideas related to chaos engineering and system administration.
Also, great for documenting secrets management strategies, configurations, and best practices.

## Classes and Data Structures

### `class SecretsContext`

Payload representing the environment context when interacting with secrets.

**Usage:**

Supplies secret decryption parameters, provider configurations, and file path overrides.
Use team (e.g. 'company.team.person') for hierarchical path resolution of secrets.yml and .sops.yaml.
Ephemeral keys can be injected in-memory via 'ephemeral_keys' (e.g. {'age': ['AGE-SECRET-KEY-...']}).

**Attributes:**

- **`team`** (*`str | None`*): The team string (e.g., 'company.team.person') used to resolve secrets and sops file paths.
- **`sops_file_override`** (*`str | None`*): Optional explicit path overriding the default .sops.yaml location.
- **`secrets_file_override`** (*`str | None`*): Optional explicit path overriding the default secrets.yml location.
- **`provider_config`** (*`ProviderConfigPayload | dict[str, Any] | None`*): The ephemeral secret provider configuration to use for operations.
- **`i_know_what_im_doing`** (*`bool`*): If True, suppresses interactive confirmation prompts.
- **`ephemeral_keys`** (*`dict[str, list[str]] | None`*): Ephemeral key material mapped by key type (e.g. {'age': [key1, key2]}).

**Methods:**

#### `.__init__()`

```python
SecretsContext.__init__(self, team: 'str | None' = None, sops_file_override: 'str | None' = None, secrets_file_override: 'str | None' = None, provider_config: 'ProviderConfigPayload | dict[str, Any] | None' = None, i_know_what_im_doing: 'bool' = False, skip_rambles: 'bool' = False, ephemeral_keys: 'dict[str, list[str]] | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SecretsContext.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

## Functions and Operations

### `decrypt_secrets()`

```python
decrypt_secrets(secrets_file: 'str', sops_file: 'str', config, context: 'SecretsContext') -> 'ResultPayload[str]'
```

Decrypts a secrets file using the active environment context.

Delegates decryption to the Engine.

---

### `gatherCreateRamble()`

```python
gatherCreateRamble(payload: 'RambleCreatePayload') -> 'DataGatherRequest | None'
```

Checks if the ramble already exists and asks for confirmation to edit.

**Parameters:**

- **`payload`** (*`RambleCreatePayload`*): The context and target payload for creating the ramble.

**Returns:**

- `DataGatherRequest | None`: A request for user confirmation if the page already exists, otherwise None.

---

### `gatherDelRamble()`

```python
gatherDelRamble(payload: 'RambleDeletePayload') -> 'DataGatherRequest | None'
```

Returns a DataGatherRequest for confirming the deletion of a ramble or journal.

**Parameters:**

- **`payload`** (*`RambleDeletePayload`*): Represents context parameters necessary for deletion process.

**Returns:**

- `DataGatherRequest | None`: Object representation defining prompt requirement or None.

---

### `gatherEditRamble()`

```python
gatherEditRamble(payload: 'RambleEditPayload') -> 'DataGatherRequest | None'
```

If a journal is passed, returns a DataGatherRequest for page selection.

**Parameters:**

- **`payload`** (*`RambleEditPayload`*): Context for editing a ramble.

**Returns:**

- `DataGatherRequest | None`: Request prompting for the page to edit, or None if valid file format supplied.

---

### `gatherReadRamble()`

```python
gatherReadRamble(payload: 'RambleReadPayload') -> 'DataGatherRequest | None'
```

Analyzes the read targets and returns a DataGatherRequest if any journals need page selection.

**Parameters:**

- **`payload`** (*`RambleReadPayload`*): Payload specifying the reading target context.

**Returns:**

- `DataGatherRequest | None`: The user prompt to select a page, if applicable.

---

### `handleCreateRamble()`

```python
handleCreateRamble(payload: 'RambleCreatePayload') -> 'ResultPayload[CreateRambleData]'
```

Creates a new ramble journal or page, and returns the file path to open.

**Parameters:**

- **`payload`** (*`RambleCreatePayload`*): The creation instructions including the target and confirmation status.

**Returns:**

- `ResultPayload[dict[str, Any]]`: A payload containing the created file path or editing instructions on success.

---

### `handleDelRamble()`

```python
handleDelRamble(payload: 'RambleDeletePayload') -> 'ResultPayload[None]'
```

Deletes a ramble journal or page.

**Parameters:**

- **`payload`** (*`RambleDeletePayload`*): The confirmed target payload state.

**Returns:**

- `ResultPayload[None]`: The status payload regarding operation's termination status.

---

### `handleEditRamble()`

```python
handleEditRamble(payload: 'RambleEditPayload') -> 'ResultPayload[EditRambleData]'
```

Prepares editing of an existing ramble journal or page, returning info for the interface to handle it.

**Parameters:**

- **`payload`** (*`RambleEditPayload`*): Details on what to edit and encryption state context.

**Returns:**

- `ResultPayload[dict[str, Any]]`: The result holding the requested file's path and its encryptability state.

---

### `handleEncryptRamble()`

```python
handleEncryptRamble(payload: 'RambleEncryptPayload') -> 'ResultPayload[None]'
```

Encrypts specified keys in a ramble page using sops.

**Parameters:**

- **`payload`** (*`RambleEncryptPayload`*): The payload outlining the ramble to encrypt and which keys specifically.

**Returns:**

- `ResultPayload[None]`: A payload summarizing encryption state messages or failure.

!!! note
    If -k not passed, encrypts everything except base keys.
    The tags key is never encrypted, helping to optimize searching.

---

### `handleFindRamble()`

```python
handleFindRamble(payload: 'RambleFindPayload') -> 'ResultPayload[list[str]]'
```

Searches for rambles containing a specific term, optionally filtered by tag.

**Parameters:**

- **`payload`** (*`RambleFindPayload`*): Definition of constraints to find target rambles.

**Returns:**

- `ResultPayload[list[str]]`: The list of matches, or an appropriate error response.

!!! note
    If nothing passed, lists all rambles.

---

### `handleMoveRamble()`

```python
handleMoveRamble(payload: 'RambleMovePayload') -> 'ResultPayload[None]'
```

Moves or renames a ramble journal or page.

**Parameters:**

- **`payload`** (*`RambleMovePayload`*): Context describing the origin point, and intended target point.

**Returns:**

- `ResultPayload[None]`: Status payload of the operation.

---

### `handleReadRamble()`

```python
handleReadRamble(payload: 'RambleReadPayload') -> 'ResultPayload[dict[str, Any]]'
```

Reads the content of specified rambles and returns them.

**Parameters:**

- **`payload`** (*`RambleReadPayload`*): Contains targets and state required to retrieve rambles.

**Returns:**

- `ResultPayload[dict[str, Any]]`: A payload wrapping the read content for matching rambles.

---

### `handleUpdateEncryptRamble()`

```python
handleUpdateEncryptRamble(payload: 'RambleUpdateEncryptPayload') -> 'ResultPayload[None]'
```

Updates encryption keys for all encrypted rambles in the ramble directory.

**Parameters:**

- **`payload`** (*`RambleUpdateEncryptPayload`*): Details regarding environment needed to update everything.

**Returns:**

- `ResultPayload[None]`: Response mapping successes and errors of the operation.

---

### `is_safe_path()`

```python
is_safe_path(target_path: 'Path', team: 'str | None') -> 'bool'
```

Validates that the target path is within the ramble directory to prevent path traversal.

**Parameters:**

- **`target_path`** (*`Path`*): The path that is being accessed.
- **`team`** (*`str | None`*): The current team context.

**Returns:**

- `bool`: True if the path is secure and valid.

**Raises:**

- **`PermissionError`**: If path traversal is detected.
- **`FileNotFoundError`**: If the underlying ramble directory doesn't exist.
- **`ValueError`**: On generic path issues.
- **`RuntimeError`**: For other unexpected failures.

---
