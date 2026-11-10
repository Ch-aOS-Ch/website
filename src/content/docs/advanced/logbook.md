---
title: "Logbook: Execution Telemetry & Audit Journal"
description: "High-observability telemetry engine, latency percentiles, pre/post health checks, fact histories, and pluggable Limani database storage in Ch-aOS."
---

Ok, you've managed your system beautifully, incredible! But what if something goes wrong? What if you need to uncover why something is not going fast enough, or why a change didn't apply as expected? You don't want to be left to check massive `--verbose` logs, and most certainly not check each host individually.

Ch-aOS has a built-in data collection mechanism called the **Logbook**. It was designed to collect the most amount of pure useful data while minimizing the performance impact on the system.

It is a complete execution journal that captures a structured and replayable record of everything that happened during a `chaos apply` run, from the high-level operations down to the exact commands, facts, timestamps, and system state before and after each operation.

---

## What Data is Collected?

For each execution, the Logbook captures:

- **Per-operation metadata and outcomes**: Operation names, hashes, parent hashes, execution status, and duration.

- **Exact commands executed**: Full shell command strings with timestamps and exact execution order.

- **Fact history and fact changes**: Facts gathered (`RamUsage`, `LoadAverage`, `Directory`, `File`, `Sha1File`, etc.) that influenced execution decisions.

- **Retry statistics and execution timings**: Retry attempts, delays, and outcome statistics.

- **Diffs and change detection**: Line-by-line configuration diffs showing what changed.

- **Command outputs & secret masking**: Raw standard output and error, with sensitive secret values automatically sanitized to `[SENSITIVE DATA FILTERED]`.

- **Host-level metrics & health checks**: 1-minute and 5-minute CPU load averages, RAM percentage, and RAM used vs. total GB.

- **Latency percentiles**: Statistical duration breakdown per operation (`average_duration`, `p50_duration`, `p90_duration`, `p95_duration`, `p99_duration`).

---

## "No Ops"? Still Logged!

Even when no operations are executed (for instance, when your infrastructure is already in the desired state), the Logbook still captures:

- Pre- and post-operation health checks.

- The exact fact history and timestamps that led to the determination that no changes were needed.

In production debugging, "no operations ran" is still a state that must be understood and verified. The Logbook captures it completely.

---

## Storage Architecture & Limani Souls

The Logbook decouples telemetry gathering from storage backends. Telemetry events are collected in memory and passed via a queue to a dedicated background writer thread (`_db_writer_thread`), ensuring minimal latency impact on role execution.

When using the default `chrima` Soul, logbooks are stored in two locations:

1. `./chaos-logbook.json`: A structured JSON file created in the current working directory for immediate inspection and scripting.

2. `~/.local/share/chaos/logbooks/logbook.db`: A local SQLite database for persistent historical tracking.

### Pluggable Database Backends
You can redirect audit telemetry to external storage backends (such as remote PostgreSQL) using [Limani Souls](../souls/limani.md):

```bash
# Enable logbook and route storage to a specific Limani plugin
chaos apply system_packages --logbook --limani chrima.postgres

# Export JSON trace upon completion
chaos apply system_packages --logbook -x
```

You can configure a default Limani backend in `~/.config/chaos/config.yml`:
```yaml
# ~/.config/chaos/config.yml
limani: chrima
```

---

## Logbook JSON Structure Example

Below is an annotated example of a generated Logbook JSON report:

```json
{
    "api_version": "v1",
    "run_id": "chaos-2026/01/26-21:29:13",
    "uggly_run_id": "chaos-1769462953-7451800858269",
    "hailer": {
        "user": "deployer",
        "boatswain": "192.168.1.10",
        "hostname": "workstation-01"
    },
    "hosts": {
        "@local": {
            "total_operations": 3,
            "changed_operations": 1,
            "successful_operations": 3,
            "failed_operations": 0,
            "duration": 0.5561,
            "history": [
                {
                    "operation": "Deploy secret template to /home/user/app.conf",
                    "changed": true,
                    "success": true,
                    "duration": 0.1594,
                    "diff": "Will modify /home/user/app.conf\n  @@ -1 +1 @@\n  - old_value\n[SENSITIVE DATA FILTERED]\n\nSuccess",
                    "retry_statistics": {
                        "retry_attempts": 0,
                        "max_retries": 0,
                        "was_retried": false
                    }
                }
            ]
        }
    },
    "summary": {
        "total_operations": 3,
        "changed_operations": 1,
        "successful_operations": 3,
        "failed_operations": 0,
        "total_duration": 0.5911,
        "status": "completed"
    },
    "resource_history": [
        {
            "type": "health_check",
            "host": "@local",
            "stage": "pre_operations",
            "timestamp": 1769462953.652,
            "metrics": {
                "cpu_load_1min": 0.67,
                "cpu_load_5min": 0.71,
                "ram_percent": 24.0,
                "ram_used_gb": 3.69,
                "ram_total_gb": 15.37
            }
        },
        {
            "type": "health_check",
            "host": "@local",
            "stage": "post_operations",
            "timestamp": 1769462955.127,
            "metrics": {
                "cpu_load_1min": 0.67,
                "cpu_load_5min": 0.71,
                "ram_percent": 24.4,
                "ram_used_gb": 3.76,
                "ram_total_gb": 15.37
            }
        }
    ],
    "operation_summary": {
        "Deploy secret template to /home/user/app.conf": {
            "count": 1,
            "total_duration": 0.1594,
            "average_duration": 0.1594,
            "p50_duration": 0.1594,
            "p90_duration": 0.1594,
            "p95_duration": 0.1594,
            "p99_duration": 0.1594
        }
    }
}
```
