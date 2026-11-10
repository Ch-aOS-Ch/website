---
title: "Limani Core Reference"
---

# Limani Core Reference

Python Module: `chaos.lib.limani.limani`

Abstract base class for Limani logbook and telemetry database drivers.

## Classes and Data Structures

### `class Limani`

Abstract base class for Limani implementations.

!!! note
    Limanis are responsible for connecting to, setting, getting and disconnecting
    From databases or other data sources.

    They are meant to give an endpoint-agnostic interface to the Logbook system.

    The Logbook should _require_ a Limani to be used as its data source.

    The Limanis should be easily pluggable, so that different data sources can be used.
    Also, the only abstract methods should be required to be implemented by the subclasses.

    The only abstract methods required are connect, disconnect, set, get, export, init_db.

**Methods:**

#### `.__init__()`

```python
Limani.__init__(self, config: dict[str, typing.Any])
```

Initializes the Limani with the given configuration.

**Parameters:**

- **`config`** (*`dict`*): A dictionary containing configuration parameters.

#### `.connect()`

```python
Limani.connect(self) -> Any
```

Connects to the data source.

**Returns:**

- `Any`: A connection object or similar depending on the subclass implementation.

#### `.create_run()`

```python
Limani.create_run(self, run_id: str, run_id_human: str, start_time: float, hailer_info: dict[str, str], needed_secrets: set[str]) -> str
```

Creates a new run entry in the database.

**Parameters:**

- **`run_id`** (*`str`*): The ID of the run.
- **`run_id_human`** (*`str`*): The human-readable ID of the run.
- **`start_time`** (*`float`*): The start time of the run.
- **`hailer_info`** (*`dict`*): The hailer information of the run.

**Returns:**

- `str`: The ID of the created run.

#### `.disconnect()`

```python
Limani.disconnect(self) -> None
```

Disconnects from the data source.

#### `.end_run_update()`

```python
Limani.end_run_update(self, run_id: str, end_time: float, status: str, summary: dict[str, int | float | str]) -> None
```

Updates a run at the end with final status, time, and summary.

**Parameters:**

- **`run_id`** (*`str`*): The ID of the run to update.
- **`end_time`** (*`float`*): The end time of the run.
- **`status`** (*`str`*): The final status of the run.
- **`summary`** (*`dict`*): The summary of the run.

#### `.get_facts_for_timespan()`

```python
Limani.get_facts_for_timespan(self, run_id: str, start_time: float, end_time: float) -> list[dict[str, str | int | float]]
```

Gets all facts for a given run within a specific time span.

**Parameters:**

- **`run_id`** (*`str`*): The ID of the run to get facts for.
- **`start_time`** (*`float`*): The start time of the time span.
- **`end_time`** (*`float`*): The end time of the time span.

**Returns:**

- `list[dict]`: A list of fact logs within the specified time span.

#### `.get_or_create_host()`

```python
Limani.get_or_create_host(self, run_id: str, host_name: str) -> int
```

Gets or creates a host in the data source.

**Parameters:**

- **`run_id`** (*`str`*): The ID of the host the host belongs to.
- **`host_name`** (*`str`*): The name of the host to get or create.

**Returns:**

- `int`: The ID of the host.

!!! note
    Should be idempotent.

#### `.get_run_data()`

```python
Limani.get_run_data(self, run_id: str) -> dict[str, typing.Any]
```

Gets all data for a given run.

**Parameters:**

- **`run_id`** (*`str`*): The ID of the run to get data for.

**Returns:**

- `dict`: A dictionary containing all data for the run.

#### `.get_run_summary_stats()`

```python
Limani.get_run_summary_stats(self, run_id: str) -> dict[str, int | float | str]
```

Gets summary statistics for a given run.

**Parameters:**

- **`run_id`** (*`str`*): The ID of the run to get summary statistics for.

**Returns:**

- `dict`: A dictionary containing summary statistics for the run.

#### `.init_db()`

```python
Limani.init_db(self) -> None
```

Initializes the data source.

!!! note
    This should create any necessary tables or structures in the data source.
    This should only create if not exists.

#### `.insert_fact_log()`

```python
Limani.insert_fact_log(self, run_id: str, timestamp: float, log_level: str, context: str, command: str) -> None
```

Inserts a fact log into the data source.

**Parameters:**

- **`run_id`** (*`str`*): The ID of the run the fact log belongs to.
- **`timestamp`** (*`float`*): The timestamp of the fact log.
- **`log_level`** (*`str`*): The log level of the fact log.
- **`context`** (*`str`*): The context of the fact log.
- **`command`** (*`str`*): The command of the fact log.

#### `.insert_operation()`

```python
Limani.insert_operation(self, run_id: str, host_id: int, op_hash: str, name: str, changed: bool, success: bool, duration: float, timestamp: float, logs: dict[str, str], diff: str, arguments: dict[str, str], retry_stats: dict[str, int | dict[str, int | bool | None]], command_n_facts: list[dict[str, str | int | float]]) -> None
```

Inserts an operation into the data source.

**Parameters:**

- **`run_id`** (*`str`*): The ID of the run the operation belongs to.
- **`host_id`** (*`int`*): The ID of the host the operation belongs to.
- **`op_hash`** (*`str`*): The hash of the operation.
- **`name`** (*`str`*): The name of the operation.
- **`changed`** (*`bool`*): Whether the operation changed anything.
- **`success`** (*`bool`*): Whether the operation was successful.
- **`duration`** (*`float`*): The duration of the operation.
- **`timestamp`** (*`float`*): The timestamp of the operation.
- **`logs`** (*`dict`*): The logs of the operation.
- **`diff`** (*`str`*): The diff of the operation.
- **`arguments`** (*`dict`*): The arguments of the operation.
- **`retry_stats`** (*`dict`*): The retry stats of the operation.
- **`command_n_facts`** (*`list`*): The command and facts associated with the operation.

#### `.insert_snapshot()`

```python
Limani.insert_snapshot(self, run_id: str, host_id: int, stage: str, timestamp: float, metrics: dict[str, str | int | float | dict[str, float]]) -> None
```

Inserts a resource snapshot into the data source.

**Parameters:**

- **`run_id`** (*`str`*): The ID of the run the snapshot belongs to.
- **`host_id`** (*`int`*): The ID of the host the snapshot belongs to.
- **`stage`** (*`str`*): The stage of the snapshot.
- **`timestamp`** (*`float`*): The timestamp of the snapshot.
- **`metrics`** (*`dict`*): The metrics of the snapshot.

#### `.start_update_run()`

```python
Limani.start_update_run(self, run_id: str, status: str) -> None
```

Updates the status of a run in the data source.

**Parameters:**

- **`run_id`** (*`str`*): The ID of the run to update.
- **`status`** (*`str`*): The new status of the run.

---
