---
title: "Init Core Reference"
---

# Init Core Reference

Python Module: `chaos.lib.inits`

Scripts for initializing various parts of Ch-aOS, including Chobolo configurations and secret management.

## Functions and Operations

### `checkDep()`

```python
checkDep(bin: 'str') -> 'bool'
```

Checks if a shell command exists in the system PATH.

**Parameters:**

- **`bin`** (*`str`*): The name of the binary/executable to look for.

**Returns:**

- `bool`: True if the binary is accessible in the PATH, False otherwise.

---

### `checkForSsh()`

```python
checkForSsh() -> 'list[Path]'
```

Checks for SSH public keys in ~/.ssh directory.

**Returns:**

- `list[Path]`: A list of paths to public keys found.

---

### `genBatchGpg()`

```python
genBatchGpg(name: 'str', email: 'str') -> 'str'
```

Generate GPG key in batch mode using provided name and email.

**Parameters:**

- **`name`** (*`str`*): The full name to associate with the key.
- **`email`** (*`str`*): The email address to associate with the key.

**Returns:**

- `str`: The fingerprint of the newly generated key.

**Raises:**

- **`RuntimeError`**: If key generation fails or is cancelled.

!!! note
    Uses the best practices for key generation with EdDSA and Curve25519.
    Deps: gnupg

---

### `genGpgManual()`

```python
genGpgManual() -> 'tuple[str, str]'
```

Lists all existing GPG secret keys and prompts user to select one by fingerprint.

**Returns:**

- `tuple[str, str]`: A tuple containing the encryption engine ("pgp") and the chosen fingerprint.

**Raises:**

- **`RuntimeError`**: If the keys could not be listed.
- **`ValueError`**: If no secret keys are found or an invalid fingerprint is provided.

---

### `handle_init()`

```python
handle_init(payload: 'InitPayload') -> 'ResultPayload[DictConfig | ListConfig | None]'
```

Handles various initialization commands based on the payload.

**Parameters:**

- **`payload`** (*`InitPayload`*): The initialization configuration detailing the command and targets.

**Returns:**

- `ResultPayload[DictConfig | ListConfig | None]`: The result payload of the requested init action.

---

### `initChobolo()`

```python
initChobolo(keys: 'dict[str, str]', targets: 'list[str] | None' = None) -> 'ResultPayload[DictConfig | ListConfig | None]'
```

Script to initialize Chobolo configuration based on provided keys (100% in-memory).

**Parameters:**

- **`keys`** (*`dict`*): A dictionary of plugins.
- **`targets`** (*`list`*): A list of target configurations to initialize.

**Returns:**

- `ResultPayload[DictConfig | ListConfig | None]`: The result payload containing the final configuration.

!!! note
    See `plug_discovery.py` for more details on the keys format.

---

### `initSecrets()`

```python
initSecrets() -> 'None'
```

Main Entry point for initializing secrets management with SOPS.

**Raises:**

- **`EnvironmentError`**: If required dependencies (sops, gpg/age) are missing.
- **`RuntimeError`**: If initialization steps or SOPS encryption fail.

---

### `loadList()`

```python
loadList(spec: 'str') -> 'list[str] | None'
```

Load a key based on its specification.

---

### `setupAge()`

```python
setupAge() -> 'tuple[str, str]'
```

Setup Age keys for Sops encryption.

**Returns:**

- `tuple[str, str]`: A tuple containing the encryption engine ("age") and the derived public key.

**Raises:**

- **`EnvironmentError`**: If age-keygen is not installed.
- **`RuntimeError`**: If key generation or saving fails.

!!! note
    Deps: age-keygen

---

### `setupGpg()`

```python
setupGpg() -> 'tuple[str, str]'
```

Setup GPG keys for Sops encryption.

**Returns:**

- `tuple[str, str]`: A tuple containing the encryption engine ("pgp") and the generated or selected fingerprint.

**Raises:**

- **`EnvironmentError`**: If gpg is not installed.
- **`RuntimeError`**: If the operation is cancelled by the user.

---

### `setupSsh()`

```python
setupSsh() -> 'tuple[str, str]'
```

Setup SSH key for Sops encryption.

**Returns:**

- `tuple[str, str]`: A tuple containing the encryption engine ("age") and the public key content.

**Raises:**

- **`ValueError`**: If a selected key file is empty.

---

### `setupSshToAge()`

```python
setupSshToAge() -> 'tuple[str, str]'
```

Setup age keys using ssh-to-age conversion.

**Returns:**

- `tuple[str, str]`: A tuple containing the encryption engine ("age") and the derived public key.

**Raises:**

- **`EnvironmentError`**: If ssh-to-age is not installed.
- **`FileNotFoundError`**: If no SSH public keys are found.
- **`RuntimeError`**: If there's an error converting keys or saving to disk.

!!! note
    Deps: ssh-to-age

---

### `setup_pipe()`

```python
setup_pipe(token: 'str') -> 'tuple[str, int | None]'
```

Creates a Unix pipe or FIFO to pass a token securely.

**Parameters:**

- **`token`** (*`str`*): The secret token string to pass.

**Returns:**

- `tuple[str, int | None]`: The file path to access the pipe, and the file descriptor (FD) number if applicable.

---
