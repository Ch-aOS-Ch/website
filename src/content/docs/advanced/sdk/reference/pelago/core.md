---
title: "Pelago Core Reference"
---

# Pelago Core Reference

Python Module: `chaos.lib.pelago`

## Functions and Operations

### `create_pelago_program()`

```python
create_pelago_program(payload: 'PelagoPayload', loaded_isles: 'dict[str, type[Isle]]') -> 'ResultPayload[Callable[[], None]]'
```

Creates a Pulumi program function that dynamically routes configurations to their
respective Isle implementations or native Pulumi generic resources.

**Parameters:**

- **`payload`** (*`PelagoPayload`*): The payload containing stack configuration.
- **`loaded_isles`** (*`dict[str, type[Isle]]`*): A dictionary of loaded Isles keyed by their names.

**Returns:**

- `ResultPayload[Callable[[], None]]`: A result payload containing the created Pulumi program function.

---

### `gather_provision()`

```python
gather_provision(payload: 'PelagoPayload') -> 'tuple[DataGatherRequest | None, ResultPayload[dict[str, Any]]]'
```

Gathers necessary information for provisioning a Pulumi stack based on the provided payload.

**Parameters:**

- **`payload`** (*`PelagoPayload`*): The initial payload containing stack configuration.

**Returns:**

- `tuple[DataGatherRequest | None, ResultPayload[dict[str, Any]]]`: Discovered Isles/resources and required secrets.

---

### `get_pelago_outputs()`

```python
get_pelago_outputs(payload: 'PelagoPayload') -> 'ResultPayload[dict[str, Any]]'
```

Extracts the registered outputs from the Pulumi stack.

**Parameters:**

- **`payload`** (*`PelagoPayload`*): The payload containing the stack instance.

**Returns:**

- `ResultPayload[dict[str, Any]]`: A dictionary containing raw output key-values.

---

### `pulumi_destroy()`

```python
pulumi_destroy(payload: 'PelagoPayload', on_output: 'Callable[[str], None] | None' = None) -> 'ResultPayload[None]'
```

Destroys all resources in the Pulumi stack.

**Parameters:**

- **`payload`** (*`PelagoPayload`*): The payload containing stack configuration.
- **`on_output`** (*`Callable[[str], None] | None`*): Optional callback for streaming destroy logs.

**Returns:**

- `ResultPayload[None]`: A result payload indicating success or failure of the destroy operation.

---

### `pulumi_preview()`

```python
pulumi_preview(payload: 'PelagoPayload', on_output: 'Callable[[str], None] | None' = None) -> 'ResultPayload[dict[str, Any]]'
```

Generates a preview/plan of proposed changes without mutating cloud resources.

**Parameters:**

- **`payload`** (*`PelagoPayload`*): The payload containing stack configuration.
- **`on_output`** (*`Callable[[str], None] | None`*): Optional callback for streaming preview logs.

**Returns:**

- `ResultPayload[dict[str, Any]]`: A result payload containing change summary metrics (creates, updates, deletes).

---

### `pulumi_up()`

```python
pulumi_up(payload: 'PelagoPayload', on_output: 'Callable[[str], None] | None' = None) -> 'ResultPayload[dict[str, Any] | None]'
```

Executes the Pulumi program by calling `pulumi up` on the provided stack.

**Parameters:**

- **`payload`** (*`PelagoPayload`*): The payload containing stack configuration.
- **`on_output`** (*`Callable[[str], None] | None`*): Optional callback for streaming execution logs.

**Returns:**

- `ResultPayload[dict[str, Any] | None]`: A result payload containing the stack outputs upon success.

---

### `setup_pulumi()`

```python
setup_pulumi(payload: 'PelagoPayload') -> 'ResultPayload[Stack]'
```

Sets up a Pulumi stack based on the provided payload.

**Parameters:**

- **`payload`** (*`PelagoPayload`*): The payload containing stack configuration.

**Returns:**

- `ResultPayload[Stack]`: A result payload containing the created stack or error information.

---

### `teardown_pulumi()`

```python
teardown_pulumi(payload: 'PelagoPayload') -> 'ResultPayload[None]'
```

Cleans up a Pulumi stack by removing any secrets that were used during the setup phase.

**Parameters:**

- **`payload`** (*`PelagoPayload`*): The payload containing stack configuration.

**Returns:**

- `ResultPayload[None]`: A result payload indicating success or failure of the teardown operation.

!!! note
    This should be used inside of a try/finally block to ensure that the stack is properly cleaned up after use.

---
