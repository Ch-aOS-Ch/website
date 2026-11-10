---
title: "Limani Soul Development"
description: "Developing custom Limani storage Souls for the Ch-aOS Logbook telemetry engine, database backends, and run metrics."
---

The Ch-aOS Logbook captures comprehensive execution telemetry, but what if you want to store and query it across distributed teams, centralized SQL databases, or time-series dashboards? That is where **Limani Souls** come in.

*Limani* (Λιμάνι) is the Greek word for harbor. Just as a harbor provides a secure dock for ships, a Limani Soul provides a standardized storage backend where your Logbook execution journals dock and persist.

---

## Why Limani?

The default Logbook implementation uses the built-in `chrima` Soul, which stores execution logs in a local SQLite database (`~/.local/share/chaos/logbooks/logbook.db`) and a working directory JSON file (`./chaos-logbook.json`).

If you manage enterprise fleets or require centralized audit logging, you can implement a custom Limani Soul to stream execution records directly into PostgreSQL, MySQL, ClickHouse, ElasticSearch, or internal data warehouses.

---

## Using Limani Souls

To use a specific Limani storage plugin during an apply run:

```bash
# Execute roles with logbook recorded to PostgreSQL
chaos apply system_packages --logbook --limani chaos-limani-postgresql
```

You can configure a default storage backend in `~/.config/chaos/config.yml`:

```yaml
# ~/.config/chaos/config.yml
limani: chrima
```

---

## The `Limani` Base Contract

All Limani Souls inherit from `chaos.lib.limani.limani.Limani` and implement standard read and write telemetry methods:

```python
from abc import ABC, abstractmethod
from typing import Any


class Limani(ABC):
    """Abstract base class for Limani telemetry storage backends.

    Limanis provide an endpoint-agnostic interface for the Ch-aOS Logbook engine
    to initialize schemas, record runs, store operations and facts, and query historical data.
    """

    def __init__(self, config: dict[str, Any]):
        self.config = config or {}
        self.warehouse = config.get("warehouse", "")

    @abstractmethod
    def connect(self) -> Any:
        """Establish connection to the target database or data store."""
        raise NotImplementedError

    @abstractmethod
    def disconnect(self) -> None:
        """Close connection to the data store."""
        raise NotImplementedError

    @abstractmethod
    def init_db(self) -> None:
        """Initialize required tables, indexes, or collections if they do not exist."""
        raise NotImplementedError

    @abstractmethod
    def create_run(
        self,
        run_id: str,
        run_id_human: str,
        start_time: float,
        hailer_info: dict[str, Any],
    ) -> str:
        """Create a new top-level execution run entry."""
        raise NotImplementedError

    @abstractmethod
    def start_update_run(self, run_id: str, status: str) -> None:
        """Update run status to 'in_progress' or active state."""
        raise NotImplementedError

    @abstractmethod
    def end_run_update(
        self,
        run_id: str,
        end_time: float,
        status: str,
        summary: dict[str, Any],
    ) -> None:
        """Update the run upon completion with final timing and status."""
        raise NotImplementedError

    @abstractmethod
    def get_or_create_host(self, run_id: str, host_name: str) -> int:
        """Idempotently register a target host for the given run."""
        raise NotImplementedError

    @abstractmethod
    def insert_snapshot(
        self,
        run_id: str,
        host_id: int,
        stage: str,
        timestamp: float,
        metrics: dict[str, Any],
    ) -> None:
        """Record pre- or post-operation health check metrics (CPU load, RAM)."""
        raise NotImplementedError

    @abstractmethod
    def insert_fact_log(
        self,
        run_id: str,
        timestamp: float,
        log_level: str,
        context: str,
        command: str,
    ) -> None:
        """Insert a fact gathering command or evaluation record."""
        raise NotImplementedError

    @abstractmethod
    def insert_operation(
        self,
        run_id: str,
        host_id: int,
        op_hash: str,
        name: str,
        changed: bool,
        success: bool,
        duration: float,
        timestamp: float,
        logs: dict[str, Any],
        diff: str,
        arguments: dict[str, Any],
        retry_stats: dict[str, Any],
        command_n_facts: list[dict[str, Any]],
    ) -> None:
        """Insert an executed operation with diffs, outputs, and timings."""
        raise NotImplementedError

    @abstractmethod
    def get_run_data(self, run_id: str) -> dict[str, Any]:
        """Fetch full structured execution telemetry for a given run ID."""
        raise NotImplementedError

    @abstractmethod
    def get_facts_for_timespan(
        self, run_id: str, start_time: float, end_time: float
    ) -> list[dict[str, Any]]:
        """Query fact logs within a specific time window."""
        raise NotImplementedError

    @abstractmethod
    def get_run_summary_stats(self, run_id: str) -> dict[str, Any]:
        """Calculate and return aggregate summary statistics for a run."""
        raise NotImplementedError
```

---

## Registering and Checking Limani Souls

1. Register in `pyproject.toml`:
   ```toml
   [project.entry-points."chaos.limanis"]
   postgres = "my_limani_pkg.postgres:PostgreSqlLimani"
   ```

2. Discover registered Limanis using the CLI:
   ```bash
   chaos check limanis
   ```
