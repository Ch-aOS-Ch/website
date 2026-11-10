---
title: "Apply Core Reference"
---

# Apply Core Reference

Python Module: `chaos.lib.apply`

Core orchestration logic for the apply command, handling data gathering, state computation, and execution.

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

## Functions and Operations

### `execute_plans()`

```python
execute_plans(payload: 'ApplyPayload') -> 'ResultPayload[None]'
```

Executes all computed state operations for the roles on the target hosts using pyinfra, and gathers the results of the execution.

**Parameters:**

- **`payload`**: the ApplyPayload containing the pyinfra state with the computed plans for each role and host
  as well as any flags for telemetry.

---

### `gather_apply()`

```python
gather_apply(payload: 'ApplyPayload') -> 'tuple[DataGatherRequest | None, ResultPayload[GatherApplyResultData | None]]'
```

Gather necessary data for applying roles, such as sudo password and secrets if needed.

**Parameters:**

- **`payload`**: the ApplyPayload containing the initial data and flags for the apply operation.

**Returns:**

- A DataGatherRequest if additional data needs to be gathered from the user, or None
- A ResultPayload indicating the success or failure of the data gathering process, or None if a DataGatherRequest is returned.
  The ResultPayload.data["loaded_roles"] field will contain the loaded role classes based on the tags in the payload.

---

### `gather_fleet()`

```python
gather_fleet(payload: 'ApplyPayload', chobolo_config: 'DictConfig | ListConfig', chobolo_path: 'str') -> 'tuple[DataGatherRequest | None, ResultPayload[GatherFleetResultData | None]]'
```

Gather necessary data for fleet configuration, such as host information and parallelism settings.

**Parameters:**

- **`payload`**: the ApplyPayload containing the initial data and flags for the apply operation.
- **`chobolo_config`**: the loaded chobolo configuration as a DictConfig object.
- **`chobolo_path`**: the file path to the chobolo configuration file, used for error messages.

**Returns:**

- A DataGatherRequest if additional data needs to be gathered from the user, or None
- A ResultPayload indicating the success or failure of the data gathering process.

!!! note
    Expected format in chobolo file:
    ```yaml
    fleet:
        parallelism: int (optional, default 0 for no parallelism)
        hosts:
            host1:
                param1: value1
                param2: value2

        # OPTIONAL
        boats:
            - provider: boat_provider_name
              config:
                  param1: value1
                  param2: value2

        # OPTIONAL
        restrictions:
            # Tag-based restrictions (role mapped to list of allowed/blocked tags)
            allow_tags:
                rke2:
                    - k8s
                    - chaosmox
                    # rke2 role will ONLY run on hosts having at least one of these tags
            black_tags:
                rke2:
                    - workstation
                    - legacy
                    # rke2 role will NEVER run on hosts having any of these tags

            # Hostname-based restrictions
            black_list:
                host1:
                    role1: true
                    role2: true
                    # host1 wont be able to run role1 nor role2
                host2:
                    role3: true
                    # host2 wont be able to run role3
            allow_list:
                host1:
                    role3: true
                    # host1 will ONLY be able to run role3
                host3:
                    role1: true
                    role4: true
                    # host3 will ONLY be able to run role1 and role4
    ```

---

### `get_configs()`

```python
get_configs(payload: 'ApplyPayload | PelagoPayload') -> 'tuple[DictConfig, ResultPayload[GetConfigsResultData | None]]'
```

Loads global configuration from a chobolo file and validates paths for chobolo,
     secrets file, and sops file based on the payload and global configuration.

**Parameters:**

- **`payload`**: the ApplyPayload or PelagoPayload containing any overrides for configuration paths,
  such as chobolo file path, secrets file path, and sops file path.

**Returns:**

- A DictConfig object representing the loaded global configuration, which may include overrides from the payload.
- A ResultPayload indicating the success or failure of the configuration loading and validation process, with
  any error messages in the error field, and the relevant configuration data (such as validated paths) in
  the data field if successful.

---

### `resolve_aliases()`

```python
resolve_aliases(payload: 'ApplyPayload') -> 'ResultPayload[list[str]]'
```

Resolves any aliases in the payload tags based on the plugin aliases and user configuration aliases,
     while also checking for circular references and conflicts.

**Parameters:**

- **`payload`**: the ApplyPayload containing the initial tags and global configuration for resolving aliases.

**Returns:**

- A ResultPayload indicating the success or failure of the alias resolution process, with any error messages in the error field,

---

### `resolve_allowlist_blacklist()`

```python
resolve_allowlist_blacklist(restrictions: 'dict[str, dict[str, dict[str, bool]]]', role_tag: 'str', role_name: 'str', host: 'Host') -> 'ResultPayload[None] | None'
```

This function resolves all blacklist and allowlist restrictions given for a role and host, and determines if the role should be ran
    in said host or if there are any conflicts in the configuration that should be reported as errors.

**Parameters:**

- **`role_name`**: the name of the role for which to check restrictions, used for error messages.
- **`host`**: the Host object representing the target host for which to check restrictions, used for error messages.
- **`role_tag`**: the tag of the role for which to check restrictions, used for looking up in the restrictions dictionary.
- **`restrictions`**: a dictionary containing any allowlist or blacklist restrictions for roles and hosts, used
  to determine if the role should be applied to the host or if there are any conflicts in the configuration.

**Returns:**

- `ResultPayload[None] | None`: A ResultPayload indicating the success or failure of the resolution process.

!!! note
    It should be called before running the get_context for a role on a host.

    This dictionary should be inside of the chobolo file, and should have the following structure:
    ```yaml
        fleet:
            host1:
                tags:
                    - workstation # role2 and 3 will be skipped for this host due to black_tags
            restrictions:
                allow_tags:
                    role1: ["k8s", "chaosmox"]
                black_tags:
                    role2: ["workstation"]
                    role3: ["workstation"]

                black_list:
                    host1:
                        role1: true
                        role2: true
                    host2:
                        role3: true

                allow_list:
                    host1:
                        role3: true # doesn't matter if this is allowlisted, it will be skipped due to black_tags
                    host3:
                        role1: true
                        role4: true
    ```

    The function will check the restrictions in the following order:
        1. Tag-based black_tags check: if host matches any blacklisted tag for the role, it is skipped.
        2. Tag-based allow_tags check: if role specifies allowed tags and host has no matching tag, it is skipped.
        3. A conflict check to see if the role is both blacklisted and allowlisted for the host, which will result in an error.
        4. A check to see if the role is blacklisted for the host, which will skip the role for that host.
        5. A check to see if the host is completely blacklisted (if it is host: {} and not in an allow_list), which will skip all roles
            for that host.
        6. A check to see if the host is allowlisted but the role is not on the allowlist, which will skip it.

---

### `run_context()`

```python
run_context(payload: 'ApplyPayload', role: 'Role', host: 'Host', chobolo_data: 'dict[str, Any]') -> 'ResultPayload[dict[str, Any]]'
```

Run the context method for a given role and host, gathering necessary configuration and secrets.

**Parameters:**

- **`payload`**: the ApplyPayload containing the initial data and flags for the apply operation.
- **`role`**: the Role class for which to run the context method.
- **`host`**: the Host object representing the target host for which to gather context.

**Returns:**

- A ResultPayload indicating the success or failure of the context gathering process, with the gathered context data if successful.
  The context data is inside of the ResultPayload.data field, and any error messages are in the error field.

---

### `run_delta()`

```python
run_delta(context: 'dict[str, Any]', role: 'Role', role_name: 'str') -> 'ResultPayload[Delta]'
```

Run the delta method for a given role and context, computing the necessary changes to apply the role.

**Parameters:**

- **`context`**: the context data gathered for the role, which should contain all necessary information for computing the delta.
  this should be the data returned in the ResultPayload.data field from the run_context function.
- **`role`**: the Role class for which to run the delta method.
- **`role_name`**: the name of the role, used for error messages.

**Returns:**

- A ResultPayload indicating the success or failure of the delta computation process, with any error
  messages in the error field.

- A Delta object representing the changes that need to be applied for the role, if the
  computation was successful. If there was an error, this will be an empty Delta with no changes.

---

### `run_filtered_context()`

```python
run_filtered_context(host: 'Host', roles: 'dict[str, Role]', payload: 'ApplyPayload', chobolo_config: 'dict[str, Any]') -> 'ResultPayload[FilteredContextResultData]'
```

run_context implementation integrated with resolve_allowlist_blacklist to filter out roles that should not be applied to the host
    based on the restrictions specified in the chobolo configuration.

**Parameters:**

- **`host`** (*`Host`*): The Host object representing the target host for which to gather context.
- **`roles`** (*`dict[str, Role]`*): A dictionary of role tags to Role classes that are applicable to the host.
- **`payload`** (*`ApplyPayload`*): The ApplyPayload containing the initial data and flags for the apply operation.
- **`chobolo_config`** (*`dict[str, Any]`*): The entire chobolo configuration data, used for passing to the context method of the roles.
- **`restrictions`** (*`dict[str, dict[str, dict[str, bool]]]`*): A dictionary containing any allowlist or blacklist restrictions for
  roles and hosts, used to determine if each role should be applied to the host or if there are any conflicts in the configuration.

**Returns:**

- `ResultPayload[FilteredContextResultData]`: A ResultPayload indicating the success or failure of the context gathering process for the host,
  with the gathered context data for all applicable roles in the data field if successful, and any error messages in the
  error field.

!!! note
        It should be called before running the get_context for a role on a host.

        This dictionary should be inside of the chobolo file, and should have the following structure:
    ```yaml
        fleet:
            restrictions:
                allow_tags:
                    role1: ["k8s", "chaosmox"]
                black_tags:
                    role2: ["workstation"]

                black_list:
                    host1:
                        role1: true
                        role2: true
                    host2:
                        role3: true

                allow_list:
                    host1:
                        role3: true
                    host3:
                        role1: true
                        role4: true
    ```

---

### `run_plan()`

```python
run_plan(payload: 'ApplyPayload', delta: 'Delta', role: 'Role', role_name: 'str', host: 'Host') -> "ResultPayload[dict[Literal['plan'], ResultPayload[Any]]]"
```

Runs the plan method for a given role and host, computing the necessary
    operations to apply the role, while also checking against any allowlist or blacklist restrictions for the role and host.

**Parameters:**

- **`payload`**: the ApplyPayload containing the initial data and flags for the apply operation.
- **`delta`**: the Delta object representing the changes that need to be applied for the role, which should be the output from
  the run_delta function. this should be the data returned in the ResultPayload.data field from the run_delta function.
- **`role`**: the Role class for which to run the plan method.
- **`role_name`**: the name of the role, used for error messages and checking restrictions.
- **`host`**: the Host object representing the target host for which to compute the plan.

**Returns:**

- A ResultPayload indicating the success or failure of the plan computation process, with any error
  messages in the error field, and the computed plan in the data field if successful.
  The plan should be the data returned from the role.plan() method if all checks pass and the plan is computed successfully.
  If there are any errors or if the role is skipped due to restrictions, the plan will not be included in the data field.

---

### `setup_pyinfra()`

```python
setup_pyinfra(payload: 'ApplyPayload') -> 'ResultPayload[State | None]'
```

Set up the pyinfra state and inventory based on the gathered fleet configuration, and establish connections to the target hosts.

**Parameters:**

- **`payload`**: the ApplyPayload containing the gathered data for the apply operation, including fleet configuration and sudo password.

**Returns:**

- ResultPayload indicating the success or failure of the pyinfra setup process, with any error messages in the error field.
  Additionally, if successful, the ResultPayload.data field will contain the initialized pyinfra State object that is ready
  for executing plans.

---

### `teardown_pyinfra()`

```python
teardown_pyinfra(payload: 'ApplyPayload', run_status: "Literal['success', 'failure']") -> 'ResultPayload[None]'
```

Teardown the pyinfra state and connections after the apply operation is complete.

**Parameters:**

- **`payload`**: the ApplyPayload containing the pyinfra state to be torn down.

**Returns:**

- ResultPayload indicating the success or failure of the pyinfra teardown process, with any error messages in the error field.

!!! note
    Should be used inside of a finally block to ensure all connections will be properly closed.

---
