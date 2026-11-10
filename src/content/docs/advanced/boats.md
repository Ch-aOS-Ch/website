---
title: "Boat Creation and Management"
description: "Dynamic fleet configuration system, Boat protocol lifecycle, PaperBoat reference, and external cloud provider integration in Ch-aOS."
---

Well, you have a fleet of hosts, cool! Now, how do you codify your hosts? You certainly don't want to write down every single IP address of every single server you have, right? That would be tedious.

**Boats** are the dynamic fleet configuration system for Ch-aOS. As always, boats are both optional and pluggable, allowing you and your team to create custom dynamic fleet solutions that fit your infrastructure needs, or even use community-created boats.

---

## What is a Boat?

Boats, in their simplest form, are Python objects that merge the hosts inside of your fleet with dynamic data sources. This allows you to create fleets that adjust themselves to your needs at runtime.

### The Base `Boat` Contract

```python
from abc import ABC, abstractmethod
from typing import Any
from omegaconf import DictConfig, OmegaConf


class Boat(ABC):
    """Abstract base class representing a generic boat.

    A boat represents a dynamic provider for the fleet management system.
    Each boat implements methods to manage its lifecycle:
        1. Connecting to an external inventory provider (e.g., AWS EC2, Proxmox, GCP)
        2. Getting the current state of the fleet
        3. Processing instances into host definitions
        4. Merging dynamic hosts into the active Ch-aOS fleet
    """

    config: DictConfig

    @property
    @abstractmethod
    def name(self) -> str:
        """The name of the boat provider, used to match against the Ch-obolo configuration."""
        raise NotImplementedError

    def __init__(self, config: DictConfig):
        """Initializes the Boat with its specific configuration block from the Ch-obolo file."""
        self.config = config

    @abstractmethod
    def check_connection(self) -> bool:
        """Checks if the connection to the external provider is active."""
        raise NotImplementedError

    @abstractmethod
    def get_fleet_config(self) -> dict[str, Any]:
        """Handles the retrieval of the fleet configuration from the external provider."""
        raise NotImplementedError

    @abstractmethod
    def handle_boat_logic(self, fleet_config: dict[str, Any]) -> list[dict[str, Any]]:
        """Handles boat-specific logic for managing the fleet.

        Takes the extracted provider fleet configuration and returns the host dictionaries to be added.
        """
        raise NotImplementedError

    def get_fleet(self, old_state: DictConfig) -> DictConfig:
        """Orchestrates the process of fetching and merging dynamic fleet configuration."""
        if not self.check_connection():
            raise ConnectionError(
                f"Boat provider '{self.__class__.name}' failed to establish a connection."
            )

        this_fleet_config = self.get_fleet_config()
        hosts_to_add = self.handle_boat_logic(this_fleet_config)

        if isinstance(hosts_to_add, dict):
            hosts_to_add = [hosts_to_add]

        if not isinstance(hosts_to_add, list):
            raise ValueError(
                f"Boat provider '{self.__class__.name}' returned invalid hosts format."
            )

        current_hosts = old_state.get("fleet", {}).get("hosts", [])
        merged_hosts = current_hosts + hosts_to_add

        new_state = DictConfig(
            OmegaConf.create(OmegaConf.to_container(old_state, resolve=True))
        )
        new_state.fleet.hosts = merged_hosts

        return new_state
```

---

## Using Boats in Your Fleet

As shown in [Fleet Management](./fleet.md), you have a `hosts` mapping or list inside your fleet configuration. Boats add to this list of hosts dynamically at runtime.

Configure boats inside your Ch-obolo file:

```yaml
# ch-obolo.yml

fleet:
  # Optional: Set the max number of hosts to configure at once.
  # Defaults to 0 (unlimited parallelism).
  parallelism: 5

  # Optional: Define boats to dynamically manage your fleet
  # Each boat must specify a provider and its configuration
  boats:
    - provider: my-boat-provider
      config:
        region: us-east-1
        tag_key: Environment
        tag_value: production

  hosts:
    # --- Static hosts can coexist with dynamic boats ---
    my-server-01:
      ssh_user: root
      ssh_port: 22
      ssh_key: /path/to/private/key

    my-server-02:
      ssh_user: admin
      ssh_port: 2222
      ssh_key: /path/to/another/key

    my-server-03: {}
```

Ch-aOS provides a mock boat implementation called `PaperBoat` inside `cli/src/chaos/lib/boats/paper_boat.py` for testing and demonstration purposes.

---

## Why Use Boats?

1. **Specific Infrastructure Use Cases**: Boats are built for dynamic environments (e.g., auto-scaling groups, ephemeral fleets, cloud instances, Kubernetes nodes).

2. **Unified Data & Fleet Co-location**: Dynamic fleet discovery logic lives directly alongside your declarative configuration data in the Ch-obolo. You do not need to juggle separate inventory management tools or glue scripts.

3. **Pluggable Architecture**: You can create custom Boat classes to integrate with any external API, cloud provider, or internal CMDB and share them as Ch-aOS Souls.

---

## Executing Fleet Operations with Boats

To apply roles with dynamic boat resolution, use the `--fleet` (or `-f`) flag with `chaos apply`:

```bash
chaos apply [role_tags] --fleet
```

Ch-aOS automatically discovers all boats declared in `fleet.boats`, connects to the providers, merges the discovered hosts with your static inventory, and executes the requested roles.

---

## Creating Your Own Boat

To implement a custom Boat:

1. Subclass `Boat` from `chaos.lib.boats.base` and implement the abstract methods:
   ```python
   # my_boats/custom.py
   from typing import Any
   from chaos.lib.boats.base import Boat


   class MyCloudBoat(Boat):
       @property
       def name(self) -> str:
           return "my-cloud"

       def check_connection(self) -> bool:
           """Check if API credentials and network connectivity are valid."""
           return True

       def get_fleet_config(self) -> dict[str, Any]:
           """Query external cloud API for running instances."""
           return {
               "instances": [
                   {"id": "node-01", "ip": "10.0.1.10"},
                   {"id": "node-02", "ip": "10.0.1.11"},
               ]
           }

       def handle_boat_logic(self, fleet_config: dict[str, Any]) -> list[dict[str, Any]]:
           """Construct host connection dictionaries from API response."""
           hosts = []
           for inst in fleet_config.get("instances", []):
               hosts.append({
                   inst["id"]: {
                       "ssh_hostname": inst["ip"],
                       "ssh_user": self.config.get("ssh_user", "root"),
                   }
               })
           return hosts
   ```

2. Register your Boat class in your package's `pyproject.toml` entry points:
   ```toml
   [project.entry_points."chaos.boats"]
   my-cloud = "my_boats.custom:MyCloudBoat"
   ```

3. Verify the installed Boat using the CLI:
   ```bash
   chaos check boats
   ```
