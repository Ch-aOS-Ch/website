---
title: "Common Payloads"
---

# Common Payloads

Python Module: `chaos.lib.args.dataclasses`

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

### `class BasePayload`

Base class for all payloads.

!!! note
    These are mutable DTOs optimized for CLI startup performance.
    We use __slots__ instead of dataclasses to keep import time minimal.

**Methods:**

- **`__repr__`**: A string representation of the object, useful for debugging.

- **`__eq__`**: A method to compare two payload objects for equality.

- **`to_dict`**: A method to convert the object to a dictionary recursively, useful for serialization.

- **`from_dict`** (*`dict[str, Any]`*): A class method to create a payload object from a dictionary, useful for deserialization.
  Please note that from_dict is NOT recursive, and will not convert nested dicts to payloads.

**Methods:**

#### `.to_dict()`

```python
BasePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class CheckPayload`

Payload for checking and listing available Ch-aOS components.

**Attributes:**

- **`checks`** (*`Literal`*): The specific type of component to check (e.g., 'roles', 'aliases', 'secrets').
- **`yaml`** (*`bool`*): If True, forces the output of the check to be in YAML format.
- **`json`** (*`bool`*): If True, forces the output of the check to be in JSON format.
- **`team`** (*`str | None`*): Optional team context string to resolve paths when checking team-specific components.
- **`sops_file_override`** (*`str | None`*): Optional override for the .sops.yaml configuration file path.
- **`secrets_file_override`** (*`str | None`*): Optional override for the secrets file path.
- **`update_plugins`** (*`bool`*): If True, forces a refresh of the plugin cache before performing the check.

**Methods:**

#### `.__init__()`

```python
CheckPayload.__init__(self, checks: "Literal['explanations', 'roles', 'aliases', 'providers', 'boats', 'secrets', 'limanis', 'templates', 'isles']", json: 'bool' = False, yaml: 'bool' = False, team: 'str | None' = None, sops_file_override: 'str | None' = None, secrets_file_override: 'str | None' = None, update_plugins: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
CheckPayload.to_dict(self) -> 'dict[str, Any]'
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

### `class InitPayload`

Payload for generating boilerplate configuration files via the initialization wizard.

**Attributes:**

- **`init_command`** (*`Literal`*): The type of initialization to perform ('chobolo' or 'secrets').
- **`update_plugins`** (*`bool`*): If True, forces a refresh of the plugin cache before initialization.
- **`targets`** (*`list[str]`*): Optional list of target plugins to base the chobolo template on.
- **`template`** (*`bool`*): If True, prints the generated template to stdout instead of saving it to a file.
- **`human`** (*`bool`*): If True, formats the output of a templated chobolo as human-readable YAML instead of raw Python dict.

**Methods:**

#### `.__init__()`

```python
InitPayload.__init__(self, init_command: "Literal['chobolo', 'secrets']", update_plugins: 'bool' = False, targets: 'list[str] | None' = None, template: 'bool' = False, human: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
InitPayload.to_dict(self) -> 'dict[str, Any]'
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

### `class ProviderConfigPayload`

Payload containing configuration for secret providers, usually governing ephemeral decryption keys.

**Attributes:**

- **`provider`** (*`str | None`*): The name of the provider backend mapped in the global config (e.g., 'bw.age').
- **`ephemeral_provider_args`** (*`dict[str, Any] | None`*): A dictionary mapping specific provider CLI flags to their arguments (e.g., {'from_bw': ('item_id', 'age')}).

**Methods:**

#### `.__init__()`

```python
ProviderConfigPayload.__init__(self, provider: 'str | None' = None, ephemeral_provider_args: 'dict[str, Any] | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
ProviderConfigPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class RambleCreatePayload`

Payload for creating a new encrypted or unencrypted ramble (journal note).

**Attributes:**

- **`target`** (*`str`*): The target journal and page name in dot notation (e.g., 'journal.page').
- **`context`** (*`SecretsContext | dict[str, Any]`*): The context resolving the team directory and potential `.sops.yaml` configuration.
- **`encrypt`** (*`bool`*): If True, encrypts the ramble immediately after creation using SOPS.
- **`keys`** (*`list[str] | None`*): Optional list of specific YAML keys within the ramble to encrypt (instead of encrypting all values).
- **`confirmed`** (*`bool`*): Internal state tracking whether the user confirmed overwriting or editing an existing ramble.

**Methods:**

#### `.__init__()`

```python
RambleCreatePayload.__init__(self, target: 'str', context: 'SecretsContext | dict[str, Any]', encrypt: 'bool', keys: 'list[str] | None' = None, confirmed: 'bool' = False, content: 'str | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
RambleCreatePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class RambleDeletePayload`

Payload for deleting a ramble journal or page.

**Attributes:**

- **`ramble`** (*`str`*): The target journal or page to delete.
- **`context`** (*`SecretsContext | dict[str, Any]`*): The context used to resolve the team directories.
- **`confirmed`** (*`bool`*): Internal state tracking whether the user confirmed the deletion.

**Methods:**

#### `.__init__()`

```python
RambleDeletePayload.__init__(self, ramble: 'str', context: 'SecretsContext | dict[str, Any]', confirmed: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
RambleDeletePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class RambleEditPayload`

Payload for editing an existing ramble file.

**Attributes:**

- **`target`** (*`str`*): The target journal and page name in dot notation (e.g., 'journal.page').
- **`context`** (*`SecretsContext | dict[str, Any]`*): The context resolving the team directory and `.sops.yaml` location.
- **`edit_sops_file`** (*`bool`*): If True, opens the `.sops.yaml` configuration file for the ramble namespace instead of the ramble itself.

**Methods:**

#### `.__init__()`

```python
RambleEditPayload.__init__(self, target: 'str', context: 'SecretsContext | dict[str, Any]', edit_sops_file: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
RambleEditPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class RambleEncryptPayload`

Payload for encrypting an existing, unencrypted ramble file.

**Attributes:**

- **`target`** (*`str`*): The target journal and page name to encrypt.
- **`context`** (*`SecretsContext | dict[str, Any]`*): The context resolving the `.sops.yaml` configuration.
- **`keys`** (*`list[str] | None`*): Optional list of specific YAML keys within the ramble to encrypt. If None, encrypts all values except base metadata.

**Methods:**

#### `.__init__()`

```python
RambleEncryptPayload.__init__(self, target: 'str', context: 'SecretsContext | dict[str, Any]', keys: 'list[str] | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
RambleEncryptPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class RambleFindPayload`

Payload for searching through all ramble files for specific terms or tags.

**Attributes:**

- **`context`** (*`SecretsContext | dict[str, Any]`*): The context containing decryption configurations for searching encrypted rambles.
- **`find_term`** (*`str | None`*): The keyword or phrase to search for within the ramble content.
- **`tag`** (*`str | None`*): Optional tag to filter the search results.
- **`yaml`** (*`bool`*): If True, formats the search results list as YAML.
- **`json`** (*`bool`*): If True, formats the search results list as JSON.

**Methods:**

#### `.__init__()`

```python
RambleFindPayload.__init__(self, context: 'SecretsContext | dict[str, Any]', find_term: 'str | None' = None, tag: 'str | None' = None, yaml: 'bool' = False, json: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
RambleFindPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class RambleMovePayload`

Payload for renaming or moving a ramble journal or page.

**Attributes:**

- **`old`** (*`str`*): The current target path of the journal or page.
- **`new`** (*`str`*): The new target path for the journal or page.
- **`context`** (*`SecretsContext | dict[str, Any]`*): The context used to resolve the team directories.

**Methods:**

#### `.__init__()`

```python
RambleMovePayload.__init__(self, old: 'str', new: 'str', context: 'SecretsContext | dict[str, Any]')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
RambleMovePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class RambleReadPayload`

Payload for reading and displaying the content of one or more ramble files.

**Attributes:**

- **`targets`** (*`list[str]`*): A list of target rambles to read (e.g., 'journal.page' or 'journal.list').
- **`context`** (*`SecretsContext | dict[str, Any]`*): The context containing decryption provider configurations if the rambles are encrypted.
- **`yaml`** (*`bool`*): If True, formats the raw read output as YAML.
- **`json`** (*`bool`*): If True, formats the raw read output as JSON.
- **`values`** (*`list[str] | None`*): Optional list of specific YAML keys to extract and print from the read ramble (useful for piping).

**Methods:**

#### `.__init__()`

```python
RambleReadPayload.__init__(self, targets: 'list[str]', context: 'SecretsContext | dict[str, Any]', yaml: 'bool' = False, json: 'bool' = False, values: 'list[str] | None' = None, content: 'str | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
RambleReadPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class RambleUpdateEncryptPayload`

Payload for triggering a re-encryption (`sops updatekeys`) on all encrypted ramble files.

**Attributes:**

- **`context`** (*`SecretsContext | dict[str, Any]`*): The context containing the paths to the `.sops.yaml` configuration and the decryption providers.

**Methods:**

#### `.__init__()`

```python
RambleUpdateEncryptPayload.__init__(self, context: 'SecretsContext | dict[str, Any]')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
RambleUpdateEncryptPayload.to_dict(self) -> 'dict[str, Any]'
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

### `class SecretsCatPayload`

Payload for decrypting a secrets file and querying specific keys from it.

**Attributes:**

- **`keys`** (*`list[str]`*): A list of keys (using dot notation) to extract from the decrypted secrets file.
- **`context`** (*`SecretsContext | dict[str, Any]`*): The context containing the file paths and provider for decryption.
- **`cat_sops_file`** (*`bool`*): If True, queries the `.sops.yaml` configuration file instead.
- **`as_json`** (*`bool`*): If True, formats the queried output as JSON.
- **`value_only`** (*`bool`*): If True, prints only the raw value of the keys without keys names or formatting (useful for piping).

**Methods:**

#### `.__init__()`

```python
SecretsCatPayload.__init__(self, keys: 'list[str]', context: 'SecretsContext | dict[str, Any]', cat_sops_file: 'bool' = False, as_json: 'bool' = False, value_only: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SecretsCatPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class SecretsEditPayload`

Payload for securely editing a secrets file using `sops`.

**Attributes:**

- **`context`** (*`SecretsContext | dict[str, Any]`*): The context containing the paths to the secrets file, SOPS config, and the provider used for decryption.
- **`edit_sops_file`** (*`bool`*): If True, opens the `.sops.yaml` configuration file for editing instead of the encrypted secrets file.

**Methods:**

#### `.__init__()`

```python
SecretsEditPayload.__init__(self, context: 'SecretsContext | dict[str, Any]', edit_sops_file: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SecretsEditPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class SecretsExportPayload`

Payload for exporting a master secret key (age, gpg, vault) to an external secret provider.

**Attributes:**

- **`provider_name`** (*`str`*): The CLI name of the provider to use for the export (e.g., 'bw').
- **`key_type`** (*`Literal`*): The type of key being exported ('age', 'gpg', 'vault').
- **`no_import`** (*`bool`*): If True, adds a `# NO-IMPORT` flag to the secret to prevent it from being re-imported later.
- **`save_to_config`** (*`bool`*): If True, saves the resulting item ID/URL to the global chaos configuration.
- **`item_name`** (*`str | None`*): The name or title of the item to be created in the provider's vault.
- **`keys`** (*`str | None`*): The path to the local file containing the keys to export (e.g., age or vault key files).
- **`vault_addr`** (*`str | None`*): The address of the HashiCorp Vault server, if exporting a vault token.
- **`fingerprints`** (*`list[str] | None`*): A list of GPG fingerprints to export.
- **`provider_specific_args`** (*`ProviderExportArgs | None`*): A subclass of ProviderExportArgs containing provider-specific options.

**Methods:**

#### `.__init__()`

```python
SecretsExportPayload.__init__(self, provider_name: 'str', key_type: "Literal['age', 'gpg', 'vault', 'ssh']", no_import: 'bool', save_to_config: 'bool', item_name: 'str | None' = None, keys: 'str | None' = None, vault_addr: 'str | None' = None, fingerprints: 'list[str] | None' = None, provider_specific_args: 'ProviderExportArgs | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SecretsExportPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class SecretsImportPayload`

Payload for importing a master secret key (age, gpg, vault) from an external secret provider to the local machine.

**Attributes:**

- **`provider_name`** (*`str`*): The CLI name of the provider to use for the import (e.g., 'bw').
- **`key_type`** (*`Literal`*): The type of key being imported ('age', 'gpg', 'vault').
- **`item_id`** (*`str | None`*): The provider's unique identifier or URL for the item containing the key.
- **`provider_specific_args`** (*`ProviderImportArgs | None`*): A subclass of ProviderImportArgs containing provider-specific options.
- **`confirmed`** (*`bool`*): Internal state tracking whether the user confirmed overriding an existing local key.

**Methods:**

#### `.__init__()`

```python
SecretsImportPayload.__init__(self, provider_name: 'str', key_type: "Literal['age', 'gpg', 'vault']", item_id: 'str | None' = None, provider_specific_args: 'ProviderImportArgs | None' = None, confirmed: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SecretsImportPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class SecretsListPayload`

Payload for listing all active encryption keys of a specific type within a `.sops.yaml` configuration file.

**Attributes:**

- **`type`** (*`Literal`*): The type of key to search for and list ('age', 'pgp', 'vault').
- **`context`** (*`SecretsContext | dict[str, Any]`*): The context resolving the target `.sops.yaml` file.
- **`yaml`** (*`bool`*): If True, formats the output in YAML format.
- **`json`** (*`bool`*): If True, formats the output as a JSON array.
- **`value`** (*`bool`*): If True, prints only the raw key values, one per line (useful for shell piping).

**Methods:**

#### `.__init__()`

```python
SecretsListPayload.__init__(self, type: "Literal['age', 'pgp', 'vault']", context: 'SecretsContext | dict[str, Any]', yaml: 'bool' = False, json: 'bool' = False, value: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SecretsListPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class SecretsPrintPayload`

Payload for decrypting and printing an entire secrets file to standard output.

**Attributes:**

- **`context`** (*`SecretsContext | dict[str, Any]`*): The context containing the file paths and provider for decryption.
- **`print_sops_file`** (*`bool`*): If True, prints the unencrypted `.sops.yaml` configuration file instead.
- **`as_json`** (*`bool`*): If True, parses the decrypted secrets and outputs them as a JSON string.

**Methods:**

#### `.__init__()`

```python
SecretsPrintPayload.__init__(self, context: 'SecretsContext | dict[str, Any]', print_sops_file: 'bool' = False, as_json: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SecretsPrintPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class SecretsReencryptPayload`

Base class for all payloads.

!!! note
    These are mutable DTOs optimized for CLI startup performance.
    We use __slots__ instead of dataclasses to keep import time minimal.

**Methods:**

- **`__repr__`**: A string representation of the object, useful for debugging.

- **`__eq__`**: A method to compare two payload objects for equality.

- **`to_dict`**: A method to convert the object to a dictionary recursively, useful for serialization.

- **`from_dict`** (*`dict[str, Any]`*): A class method to create a payload object from a dictionary, useful for deserialization.
  Please note that from_dict is NOT recursive, and will not convert nested dicts to payloads.

**Methods:**

#### `.__init__()`

```python
SecretsReencryptPayload.__init__(self, context: 'SecretsContext')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SecretsReencryptPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class SecretsRotatePayload`

Payload for adding or removing an encryption key from a `.sops.yaml` configuration file.

**Attributes:**

- **`type`** (*`Literal`*): The type of key being rotated ('age', 'pgp', 'vault').
- **`keys`** (*`list[str]`*): The list of keys (e.g., public age keys, GPG fingerprints, Vault URIs) to add or remove.
- **`context`** (*`SecretsContext | dict[str, Any]`*): The context resolving the target `.sops.yaml` file and team.
- **`index`** (*`int | None`*): The specific rule index in the `.sops.yaml` file to modify. If None, affects all applicable rules.
- **`pgp_server`** (*`str | None`*): Optional PGP keyserver to download missing public keys from.
- **`create`** (*`bool`*): If True, creates a new key group if it doesn't already exist.
- **`update_confirmed`** (*`bool`*): Internal state tracking whether the user confirmed applying `sops updatekeys` after the rotation.

**Methods:**

#### `.__init__()`

```python
SecretsRotatePayload.__init__(self, type: "Literal['age', 'pgp', 'vault']", keys: 'list[str]', context: 'SecretsContext | dict[str, Any]', index: 'int | None' = None, pgp_server: 'str | None' = None, create: 'bool' = False, update_confirmed: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SecretsRotatePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class SecretsSetShamirPayload`

Payload for configuring Shamir's Secret Sharing threshold for a specific rule in a `.sops.yaml` configuration file.

**Attributes:**

- **`index`** (*`int`*): The index of the creation rule to modify in the `.sops.yaml` file.
- **`share`** (*`int`*): The required number of key shares (threshold) to decrypt the secret. Setting this to 0 removes the threshold.
- **`context`** (*`SecretsContext | dict[str, Any]`*): The context resolving the target `.sops.yaml` file.
- **`confirmed`** (*`bool`*): Internal state tracking whether the user confirmed the removal of a threshold.
- **`update_confirmed`** (*`bool`*): Internal state tracking whether the user confirmed updating existing secrets to apply the new threshold.

**Methods:**

#### `.__init__()`

```python
SecretsSetShamirPayload.__init__(self, index: 'int', share: 'int', context: 'SecretsContext', confirmed: 'bool' = False, update_confirmed: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SecretsSetShamirPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class SetPayload`

Payload for setting default paths in the global chaos configuration.

**Attributes:**

- **`chobolo_file`** (*`str | None`*): Path to the default Ch-obolo file.
- **`sops_file`** (*`str | None`*): Path to the default .sops.yaml configuration file.
- **`secrets_file`** (*`str | None`*): Path to the default secrets file.

**Methods:**

#### `.__init__()`

```python
SetPayload.__init__(self, chobolo_file: 'str | None', sops_file: 'str | None', secrets_file: 'str | None')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
SetPayload.to_dict(self) -> 'dict[str, Any]'
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

### `class TeamActivatePayload`

Payload for activating a team configuration repository.

**Attributes:**

- **`path`** (*`str | None`*): The path to the team repository that should be symlinked and activated.

**Methods:**

#### `.__init__()`

```python
TeamActivatePayload.__init__(self, path: 'str | None')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
TeamActivatePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class TeamApprovePayload`

Base class for all payloads.

!!! note
    These are mutable DTOs optimized for CLI startup performance.
    We use __slots__ instead of dataclasses to keep import time minimal.

**Methods:**

- **`__repr__`**: A string representation of the object, useful for debugging.

- **`__eq__`**: A method to compare two payload objects for equality.

- **`to_dict`**: A method to convert the object to a dictionary recursively, useful for serialization.

- **`from_dict`** (*`dict[str, Any]`*): A class method to create a payload object from a dictionary, useful for deserialization.
  Please note that from_dict is NOT recursive, and will not convert nested dicts to payloads.

**Methods:**

#### `.__init__()`

```python
TeamApprovePayload.__init__(self, team: 'str | None', name: 'str | None', approver_name: 'str | None')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
TeamApprovePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class TeamClonePayload`

Payload for cloning a team's Git repository.

**Attributes:**

- **`target`** (*`str`*): The target repository URL or identifier to clone.
- **`path`** (*`str | None`*): Optional local path where the repository should be cloned. If None, clones to the current directory or default structure.

**Methods:**

#### `.__init__()`

```python
TeamClonePayload.__init__(self, target: 'str', path: 'str | None')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
TeamClonePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class TeamDeactivatePayload`

Payload for deactivating active team configurations.

**Attributes:**

- **`company`** (*`str`*): The company name under which the teams reside.
- **`teams`** (*`list[str]`*): The specific teams to deactivate. If empty, all teams for the company are deactivated.
- **`confirmed`** (*`bool`*): Internal state tracking whether the deactivation action was confirmed by the user.

**Methods:**

#### `.__init__()`

```python
TeamDeactivatePayload.__init__(self, company: 'str', teams: 'list[str]', confirmed: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
TeamDeactivatePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class TeamInitPayload`

Payload for initializing a new team repository structure.

**Attributes:**

- **`target`** (*`str`*): The target team identifier, usually in the format 'company.team.person'.
- **`path`** (*`str | None`*): Optional directory path where the team should be initialized.
- **`i_know_what_im_doing`** (*`bool`*): If True, bypasses interactive confirmation prompts.
- **`confirmed`** (*`bool`*): Internal state tracking whether the user confirmed the initialization.
- **`init_git`** (*`bool`*): Internal state tracking whether a new Git repository should be initialized.
- **`overwrite_sops`** (*`bool`*): Internal state tracking whether to overwrite an existing SOPS config.
- **`key_backends`** (*`str | None`*): The encryption engine to use (e.g., 'age', 'gpg', or 'both').
- **`use_vault`** (*`bool`*): Internal state tracking whether HashiCorp Vault integration should be configured.
- **`continue_no_vault`** (*`bool`*): Internal state tracking whether to continue if Vault is not present.

**Methods:**

#### `.__init__()`

```python
TeamInitPayload.__init__(self, target: 'str', path: 'str | None', i_know_what_im_doing: 'bool', confirmed: 'bool' = False, init_git: 'bool' = False, overwrite_sops: 'bool' = False, key_backends: 'str | None' = None, use_vault: 'bool' = False, continue_no_vault: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
TeamInitPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class TeamJoinPayload`

Base class for all payloads.

!!! note
    These are mutable DTOs optimized for CLI startup performance.
    We use __slots__ instead of dataclasses to keep import time minimal.

**Methods:**

- **`__repr__`**: A string representation of the object, useful for debugging.

- **`__eq__`**: A method to compare two payload objects for equality.

- **`to_dict`**: A method to convert the object to a dictionary recursively, useful for serialization.

- **`from_dict`** (*`dict[str, Any]`*): A class method to create a payload object from a dictionary, useful for deserialization.
  Please note that from_dict is NOT recursive, and will not convert nested dicts to payloads.

**Methods:**

#### `.__init__()`

```python
TeamJoinPayload.__init__(self, team: 'str | None', name: 'str | None', key_type: 'str | None', key: 'str | None', sops_file: 'str | None')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
TeamJoinPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class TeamListPayload`

Payload for listing active team configurations.

**Attributes:**

- **`company`** (*`str | None`*): Optional company name to filter the listed teams. If None, all teams from all companies are listed.
- **`yaml`** (*`bool`*): If True, formats the output as YAML.
- **`json`** (*`bool`*): If True, forces the output to be in JSON format.

**Methods:**

#### `.__init__()`

```python
TeamListPayload.__init__(self, company: 'str | None', yaml: 'bool' = False, json: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
TeamListPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class TeamPermitPayload`

Base class for all payloads.

!!! note
    These are mutable DTOs optimized for CLI startup performance.
    We use __slots__ instead of dataclasses to keep import time minimal.

**Methods:**

- **`__repr__`**: A string representation of the object, useful for debugging.

- **`__eq__`**: A method to compare two payload objects for equality.

- **`to_dict`**: A method to convert the object to a dictionary recursively, useful for serialization.

- **`from_dict`** (*`dict[str, Any]`*): A class method to create a payload object from a dictionary, useful for deserialization.
  Please note that from_dict is NOT recursive, and will not convert nested dicts to payloads.

**Methods:**

#### `.__init__()`

```python
TeamPermitPayload.__init__(self, name: 'str | None', team: 'str | None', environment: 'str | None', key: 'str | None', key_type: 'str | None', sops_file: 'str | None')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
TeamPermitPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class TeamPrunePayload`

Payload for pruning stale team configurations.

**Attributes:**

- **`companies`** (*`list[str]`*): Optional list of specific company names to prune. If empty, all companies are checked.
- **`i_know_what_im_doing`** (*`bool`*): If True, bypasses interactive confirmation prompts.
- **`confirmed`** (*`bool`*): Internal state tracking whether the user has confirmed the pruning action.

**Methods:**

#### `.__init__()`

```python
TeamPrunePayload.__init__(self, companies: 'list[str]', i_know_what_im_doing: 'bool', confirmed: 'bool' = False)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
TeamPrunePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class TeamRemovePayload`

Base class for all payloads.

!!! note
    These are mutable DTOs optimized for CLI startup performance.
    We use __slots__ instead of dataclasses to keep import time minimal.

**Methods:**

- **`__repr__`**: A string representation of the object, useful for debugging.

- **`__eq__`**: A method to compare two payload objects for equality.

- **`to_dict`**: A method to convert the object to a dictionary recursively, useful for serialization.

- **`from_dict`** (*`dict[str, Any]`*): A class method to create a payload object from a dictionary, useful for deserialization.
  Please note that from_dict is NOT recursive, and will not convert nested dicts to payloads.

**Methods:**

#### `.__init__()`

```python
TeamRemovePayload.__init__(self, team: 'str | None', name: 'str | None', sops_file: 'str | None')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
TeamRemovePayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---
