---
title: "Pelago Payloads"
---

# Pelago Payloads

Python Module: `chaos.lib.pelago`

## Classes and Data Structures

### `class DataGatherPayload`

This payload is a data gathering payload, which is meant to gather data BEFORE the execution of the main
    logic, and it is meant to be used in the "pre" phase of the execution.

**Attributes:**

- **`name`**: The name of the data being gathered, e.g. "aws_credentials", "kubeconfig", etc.
- **`prompt`**: The prompt to show to the user when asking for the data, e.g. "Please enter your AWS credentials".
- **`input_type`**: The type of input expected, should be used by the CLI to manage how to gather the data.
  e.g. if input_type is "choice", the interface should show the choices to the user and let them select one, if it's "secret",
  the interface should hide the input, etc.
- **`required`**: A boolean indicating whether the data is required or not, if it's required, the interface should keep asking for the
  data until it is provided, if it's not required, the user should be able to skip it.
- **`default`**: The default value to use if the user decides to skip providing the data, should only be used if required is False.
- **`choices`**: A list of choices to show to the user if the input_type is "choice", should be None otherwise.
- **`metadata`**: A dictionary containing any additional information that might be useful for the interface when gathering the data,
  e.g. if the input_type is "secret", the metadata might contain information about how to validate the secret, etc.

**Methods:**

#### `.__init__()`

```python
DataGatherPayload.__init__(self, prompt: 'str | None' = None, name: 'str | None' = None, input_type: "Literal['string', 'integer', 'boolean', 'choice', 'secret']" = 'string', required: 'bool' = False, default: 'Any' = None, choices: 'list[Any] | None' = None, metadata: 'dict[str, Any] | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
DataGatherPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class DataGatherRequest`

This payload is a data gathering request, which is meant to be used as a request to gather data BEFORE the execution of the main
    logic, and it is meant to be used in the "pre" phase of the execution.

**Attributes:**

- **`name`**: The name of the data gathering request, e.g. "aws_credentials", "kubeconfig", etc.
- **`fields`**: A list of DataGatherPayload objects, each representing a piece of data that needs to be gathered for this request.

!!! note
    I KNOW its another layer of indirection. This is necessary for the interfaces to be able to group multiple data gathering fields
        under the same request, and to be able to show them to the user in a more organized way.


    Yes, I know I could just use return[DGP(), DGP(), DGP()] instead of return[DGR("aws_credentials", [DGP(), DGP()])], but this way
        we can have a name for the group of data being gathered, which can be useful for the interfaces to show a more user-friendly message
        to the user.

**Methods:**

#### `.__init__()`

```python
DataGatherRequest.__init__(self, name: 'str', fields: 'list[DataGatherPayload]')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
DataGatherRequest.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class PelagoPayload`

Payload for executing a Pulumi program via the Pelago interface.

**Attributes:**

- **`stack_name`** (*`str`*): The name of the Pulumi stack to create or select.
- **`project_name`** (*`str`*): The name of the Pulumi project to use.
- **`pulumi_program`** (*`PulumiFn`*): The Pulumi program function to execute, which should return a dictionary of outputs.
- **`stack`** (*`Stack`*): The Pulumi Stack object that is created or selected based on the stack_name and project_name.
- **`secrets_used`** (*`list[str]`*): A list of secrets that were used during the execution to be tear down later in the finally block.
- **`pelago`** (*`list[dict[str, Any]]`*): A list of Pelago programs to be executed.
- **`secrets`** (*`bool`*): A boolean indicating whether secrets are allowed to be used in this pelago run.
- **`provided_secrets`** (*`dict[str, Any]`*): A dict of secrets that are needed by the pelago programs, which are provided by the user.
- **`update_plugins`** (*`bool`*): If True, forces a refresh of the plugin cache.
- **`i_know_what_im_doing`** (*`bool`*): If True, bypasses all interactive confirmation prompts.
- **`dry`** (*`bool`*): If True, runs in dry-run mode (Pulumi preview).
- **`diff`** (*`bool`*): If True, displays detailed property diffs during Pulumi operations.
- **`verbose`** (*`int`*): The verbosity level for output.
- **`v`** (*`int`*): An alias for the verbosity level.
- **`chobolo`** (*`str | None`*): Optional path to explicitly override the Ch-obolo configuration file to use.
- **`secrets_context`** (*`SecretsContext | dict[str, Any]`*): The context containing secret file paths and provider configurations.
- **`global_config`** (*`dict[str, Any] | None`*): Internal state caching the global `~/.config/chaos/config.yml` data.

**Methods:**

#### `.__init__()`

```python
PelagoPayload.__init__(self, stack_name: 'str', project_name: 'str', pulumi_program: 'PulumiFn | Callable', stack: 'Stack | None' = None, secrets_used: 'list[str] | None' = None, pelago: 'list[dict[str, Any]] | None' = None, secrets: 'bool' = False, provided_secrets: 'dict[str, Any] | None' = None, update_plugins: 'bool' = False, i_know_what_im_doing: 'bool' = False, dry: 'bool' = False, diff: 'bool' = False, verbose: 'int' = 0, v: 'int' = 0, chobolo: 'str | None' = None, secrets_context: 'SecretsContext | dict[str, Any] | None' = None, global_config: 'dict[str, Any] | None' = None, needed_secrets: 'set[str]' = set())
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
PelagoPayload.to_dict(self) -> 'dict[str, Any]'
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
