---
title: "Boats Core Reference"
---

# Boats Core Reference

Python Module: `chaos.lib.boats.base`

Base definitions and abstract base classes for boat resource provisioner plugins.

## Classes and Data Structures

### `class Boat`

Abstract base class representing a generic boat.

!!! note
    A boat represents a dynamic provider for the fleet management system.
    This means that each boat has to implement methods to manage its lifecycle
    which include:
    connecting to an external inventory provider (e.g., ec2)
    getting the current state of the fleet
    creating new instances
    returning instances to the pool to list of fleets.

    A boat is configured in a Ch-obolo file like so:
    ```yaml
    fleet:
      parallelism: x<=5
      boats:
        - provider: {name of this boat}
          config:
            {config parameters specific to this boat}

      hosts:
        - host1:
            ssh_user: user1
            ssh_key: /path/to/key1.pem
    ```

    The 'provider' name is used to find the corresponding Boat class, and the
    'config' block is passed to its constructor.

**Methods:**

#### `.__init__()`

```python
Boat.__init__(self, config: omegaconf.dictconfig.DictConfig)
```

Initializes the Boat with its specific configuration block from the Ch-obolo file.

**Parameters:**

- **`config`** (*`DictConfig`*): A DictConfig object containing the configuration for this boat.

#### `.check_connection()`

```python
Boat.check_connection(self) -> bool
```

Checks if the connection to the external provider is active.

**Returns:**

- `bool`: True if the connection is successfully verified.

#### `.get_fleet()`

```python
Boat.get_fleet(self, old_state: omegaconf.dictconfig.DictConfig) -> omegaconf.dictconfig.DictConfig
```

Orchestrates the process of fetching and merging dynamic fleet configuration.

**Parameters:**

- **`old_state`** (*`DictConfig`*): The existing OmegaConf configuration state.

**Returns:**

- `DictConfig`: A new state with the dynamic hosts merged in.

**Raises:**

- **`ConnectionError`**: If the boat fails to connect to its provider.
- **`ValueError`**: If mapping properties returned fall out of bounds representation rules.

#### `.get_fleet_config()`

```python
Boat.get_fleet_config(self) -> dict[str, typing.Any]
```

Handles the retrieval of the fleet configuration from the external provider.

**Returns:**

- `dict`: A dictionary representing the fleet configuration parameters.

#### `.handle_boat_logic()`

```python
Boat.handle_boat_logic(self, fleet_config: dict[str, typing.Any]) -> list[dict[str, typing.Any]]
```

Handles any boat-specific logic for managing the fleet.

**Parameters:**

- **`fleet_config`** (*`dict`*): The current extracted parameters detailing external fleet state representation.

**Returns:**

- `dict | list`: Processed structured mapped objects (like hosts arrays) needed to inject back to original state maps.

---
