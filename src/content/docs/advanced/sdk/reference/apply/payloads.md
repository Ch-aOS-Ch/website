---
title: "Apply Payloads"
---

# Apply Payloads

Python Module: `chaos.lib.apply`

Core orchestration logic for the apply command, handling data gathering, state computation, and execution.

## Classes and Data Structures

### `class ApplyPayload`

Payload for orchestrating the `apply` lifecycle of Ch-aOS.

This represents the core orchestration data structure required to resolve roles, configurations, secrets, and execute them on hosts.

**Attributes:**

- **`update_plugins`** (*`bool`*): If True, forces a refresh of the plugin cache before starting orchestration.
- **`i_know_what_im_doing`** (*`bool`*): If True, bypasses all interactive confirmation prompts before execution.
- **`dry`** (*`bool`*): If True, runs pyinfra in dry-run mode, calculating but not executing operations.
- **`verbose`** (*`int`*): The verbosity level for Pyinfra output (1=Warning, 2=Info, 3=Debug).
- **`v`** (*`int`*): An alias for the verbosity level.
- **`tags`** (*`list[str]`*): The list of role tags or aliases to apply to the target hosts.
- **`chobolo`** (*`str | None`*): Optional path to explicitly override the Ch-obolo configuration file to use.
- **`limani`** (*`str | None`*): Optional Limani plugin name to use for the Logbook database.
- **`logbook`** (*`bool`*): If True, enables telemetry and execution recording into the Logbook.
- **`fleet`** (*`bool | str`*): If True, parses the fleet configuration from chobolo. If a string, loads the fleet configuration from that specific file path.
- **`sudo_password_file`** (*`str | None`*): Optional path to a file containing the sudo password.
- **`password`** (*`str | None`*): Optional string containing the sudo password.
- **`secrets`** (*`bool`*): If True, signals that the operations require secrets and that they must be decrypted.
- **`serial`** (*`bool`*): If True, executes pyinfra operations serially across the fleet instead of in parallel.
- **`no_wait`** (*`bool`*): If True, executes pyinfra operations concurrently without waiting for slow hosts.
- **`export_logs`** (*`bool`*): If True, exports the telemetry logbook to a JSON file after the run finishes.
- **`secrets_context`** (*`SecretsContext | dict[str, Any]`*): The context containing secret file paths and provider configurations.
- **`confirmed_password`** (*`str`*): Internal state holding the verified sudo password if gathered interactively.
- **`pyinfra_state`** (*`State | None`*): Internal state storing the initialized pyinfra State object after setup.
- **`target_hosts`** (*`list | None`*): Internal state containing the parsed list of hosts to apply the roles to.
- **`is_fleet_active`** (*`bool`*): Internal state tracking whether a remote fleet is actively being targeted.
- **`parallelism`** (*`int`*): Internal state tracking the maximum number of concurrent hosts to apply changes to.
- **`fallback_to_local`** (*`bool`*): Internal state tracking if fleet failed to resolve and fallback to local was permitted.
- **`decrypted_secrets`** (*`dict[str, Any] | None`*): Internal state caching the decrypted YAML/JSON secrets dictionary for role consumption.
- **`global_config`** (*`dict[str, Any] | None`*): Internal state caching the global `~/.config/chaos/config.yml` data.

**Methods:**

#### `.__init__()`

```python
ApplyPayload.__init__(self, update_plugins: 'bool', i_know_what_im_doing: 'bool', dry: 'bool', verbose: 'int', v: 'int', tags: 'list[str]', chobolo: 'str | None', limani: 'str | None', logbook: 'bool', fleet: 'bool | str', sudo_password_file: 'str | None', password: 'str | None', secrets: 'bool', serial: 'bool', no_wait: 'bool', export_logs: 'bool', secrets_context: 'SecretsContext | dict[str, Any]', confirmed_password: 'str' = '', pyinfra_state: 'State | None' = None, target_hosts: 'list | None' = None, is_fleet_active: 'bool' = False, parallelism: 'int' = 0, fallback_to_local: 'bool' = False, decrypted_secrets: 'dict[str, Any] | None' = None, global_config: 'dict[str, Any] | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
ApplyPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

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
