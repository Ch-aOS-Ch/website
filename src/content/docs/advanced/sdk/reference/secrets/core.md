---
title: "Secrets Core Reference"
---

# Secrets Core Reference

Python Module: `chaos.lib.secrets`

Module for handling secret management operations such as adding/removing keys, editing secrets, and printing secrets.

Please, note that most of our handlers are made to work with our SOPS engine, but, since that engine is just an
    implementation of the SecretsEngine interface, we can just change it later.

## Functions and Operations

### `gatherImportSec()`

```python
gatherImportSec(payload: 'SecretsImportPayload') -> 'DataGatherRequest | None'
```

Checks if confirmation is needed for importing keys.

**Parameters:**

- **`payload`** (*`SecretsImportPayload`*): The payload containing import context.

**Returns:**

- `DataGatherRequest | None`: A request for user confirmation if required, else None.

---

### `gatherRotateAdd()`

```python
gatherRotateAdd(payload: 'SecretsRotatePayload') -> 'DataGatherRequest | None'
```

Checks if confirmation is needed for rotating/adding keys.

**Parameters:**

- **`payload`** (*`SecretsRotatePayload`*): The payload containing rotation options and context.

**Returns:**

- `DataGatherRequest | None`: A request for user confirmation if required, else None.

---

### `gatherRotateRemove()`

```python
gatherRotateRemove(payload: 'SecretsRotatePayload') -> 'DataGatherRequest | None'
```

Checks if confirmation is needed for rotating/removing keys.

**Parameters:**

- **`payload`** (*`SecretsRotatePayload`*): The payload containing rotation options and context.

**Returns:**

- `DataGatherRequest | None`: A request for user confirmation if required, else None.

---

### `gatherSetShamir()`

```python
gatherSetShamir(payload: 'SecretsSetShamirPayload') -> 'DataGatherRequest | None'
```

Checks if confirmation is needed for setting/removing Shamir threshold.

**Parameters:**

- **`payload`** (*`SecretsSetShamirPayload`*): The payload containing shamir settings context.

**Returns:**

- `DataGatherRequest | None`: A request for user confirmation if required, else None.

---

### `handleExportSec()`

```python
handleExportSec(payload: 'SecretsExportPayload', global_config: 'DictConfig') -> 'ResultPayload[Any]'
```

Exports secrets via a resolved provider.

**Parameters:**

- **`payload`** (*`SecretsExportPayload`*): The payload details for the export.
- **`global_config`** (*`dict | DictConfig`*): The global configuration.

**Returns:**

- `ResultPayload`: The result payload of the export operation.

---

### `handleImportSec()`

```python
handleImportSec(payload: 'SecretsImportPayload', global_config) -> 'ResultPayload'
```

Imports secrets via a resolved provider.

**Parameters:**

- **`payload`** (*`SecretsImportPayload`*): The payload details for the import.
- **`global_config`** (*`dict | DictConfig`*): The global configuration.

**Returns:**

- `ResultPayload`: The result payload of the import operation.

---

### `handleReencryptSec()`

```python
handleReencryptSec(payload: 'SecretsReencryptPayload') -> 'ResultPayload[None]'
```

Re-encrypts secrets via the crypto engine.

**Parameters:**

- **`payload`** (*`SecretsReencryptPayload`*): The payload details for the reencryption.

**Returns:**

- `ResultPayload[None]`: The result payload of the reencrypt operation.

---

### `handleRotateAdd()`

```python
handleRotateAdd(payload: 'SecretsRotatePayload') -> 'ResultPayload[None]'
```

Adds a new key to the secrets backend configuration and updates secrets if requested.

**Parameters:**

- **`payload`** (*`SecretsRotatePayload`*): The payload defining the rotation target and context.

**Returns:**

- `ResultPayload[None]`: The result payload of the rotation add operation.

---

### `handleRotateRemove()`

```python
handleRotateRemove(payload: 'SecretsRotatePayload') -> 'ResultPayload[None]'
```

Removes a key from the secrets backend configuration and updates secrets if requested.

**Parameters:**

- **`payload`** (*`SecretsRotatePayload`*): The payload defining the rotation removal target and context.

**Returns:**

- `ResultPayload[None]`: The result payload of the rotation remove operation.

---

### `handleSecCat()`

```python
handleSecCat(payload: 'SecretsCatPayload') -> "ResultPayload[dict[Literal['values'], list[tuple[str, str]]]]"
```

Decrypts the secrets file and returns the values of the specified keys.

**Parameters:**

- **`payload`** (*`SecretsCatPayload`*): The payload detailing the keys to extract.

**Returns:**

- `ResultPayload[dict[Literal["values"], list[tuple[str, str]]]]`: The result payload containing a list of values found for the keys.

---

### `handleSecEdit()`

```python
handleSecEdit(payload: 'SecretsEditPayload') -> 'ResultPayload[SecEditData]'
```

Resolves target files and provider details to open secrets for editing.

**Parameters:**

- **`payload`** (*`SecretsEditPayload`*): The payload containing context for editing secrets.

**Returns:**

- `ResultPayload[SecEditData]`: The result payload containing related file paths and settings.

---

### `handleSecPrint()`

```python
handleSecPrint(payload: 'SecretsPrintPayload') -> 'ResultPayload[dict[str, str]]'
```

Decrypts the secrets file and returns the decrypted content.

**Parameters:**

- **`payload`** (*`SecretsPrintPayload`*): The payload indicating what to print.

**Returns:**

- `ResultPayload[dict[str, str]]`: The result payload containing the decrypted content under 'dec'.

---

### `handleSetShamir()`

```python
handleSetShamir(payload: 'SecretsSetShamirPayload') -> 'ResultPayload[None]'
```

Sets or removes the Shamir threshold for a given creation rule in the configuration.

**Parameters:**

- **`payload`** (*`SecretsSetShamirPayload`*): The payload containing the shamir configuration details.

**Returns:**

- `ResultPayload[None]`: The result payload indicating success or failure.

---

### `listFp()`

```python
listFp(payload: 'SecretsListPayload') -> 'ResultPayload[set[str]]'
```

Lists registered keys in the secrets backend configuration.

**Parameters:**

- **`payload`** (*`SecretsListPayload`*): The payload defining the target type and context.

**Returns:**

- `ResultPayload[set[str]]`: The result payload containing a set of key fingerprints or names.

---
