---
title: "Roles Soul Development"
description: "Developing custom Ch-aOS Roles, implementing the 3-stage SDK lifecycle (get_context, delta, plan), managing secrets, and Pyinfra API integration."
---

In Ch-aOS, roles are Python classes that inherit from our base SDK `Role` class (`chaos.lib.roles.role.Role`). They leverage Pyinfra's [API mode](https://docs.pyinfra.com/en/3.x/api/reference.html) to orchestrate infrastructure, giving you the full power of Python and OOP.

This documentation covers everything you need to know about developing robust, declarative, and idempotent roles in Ch-aOS.

---

## The 3-Stage SDK Lifecycle

Ch-aOS roles are not just linear bash scripts. They adhere to a strict 3-stage lifecycle to ensure atomicity, clear change diffs, and deep execution tracking:

1. **`get_context(state, host, chobolo, secrets)`**: Gathers remote facts from the target host (e.g. installed packages, user accounts, files, directory state).

2. **`delta(context)`**: Compares the host context against the desired state defined in your Ch-obolo. Returns a `Delta` object containing `to_add` and `to_remove`.

3. **`plan(state, host, delta)`**: Enqueues Pyinfra operations onto the execution graph based on the computed delta.

By adhering to this lifecycle, your role supports accurate dry-runs (`--dry`), live diff inspection, fast parallel fact gathering, and comprehensive telemetry in the [Logbook](../advanced/logbook.md).

---

## Declaring and Implementing a Role

### 1. Register Entry Point in `pyproject.toml`

```toml
[project.entry-points."chaos.roles"]
my-role = "my_chaos_soul.roles:MyAwesomeRole"
```

### 2. Implement the Role Class

```python
# src/my_chaos_soul/roles.py
from typing import Any
from pyinfra.api.host import Host
from pyinfra.api.state import State
from pyinfra.api.operation import add_op
from pyinfra.operations import server, files
from pyinfra.facts.files import Directory, File

from chaos.lib.roles.role import Role
from chaos.lib.args.dataclasses import Delta, ResultPayload


class MyAwesomeRole(Role):
    def __init__(self):
        super().__init__(
            name="my-role",
            needs_secrets=True,
            necessary_chobolo_keys=["my_role_dirs"],
            necessary_secret_dict_keys=["api_token"],
        )

    def get_context(
        self,
        state: State,
        host: Host,
        chobolo: dict[str, Any] = {},
        secrets: dict[str, Any] = {},
    ) -> dict[str, Any]:
        """Fetch current state from the remote host using facts."""
        existing_dirs = []
        target_dirs = chobolo.get("my_role_dirs", [])

        for dir_path in target_dirs:
            if host.get_fact(Directory, path=dir_path):
                existing_dirs.append(dir_path)

        return {
            "existing_dirs": existing_dirs,
            "target_dirs": target_dirs,
        }

    def delta(self, context: dict[str, Any] = {}) -> Delta:
        """Compute the diff between actual host state and desired state."""
        target = set(context.get("target_dirs", []))
        existing = set(context.get("existing_dirs", []))

        to_create = list(target - existing)
        to_delete = []

        return Delta(
            to_add={"dirs": to_create},
            to_remove={"dirs": to_delete},
            metadata={},
        )

    def plan(
        self,
        state: State,
        host: Host,
        delta: Delta = Delta(),
    ) -> ResultPayload:
        """Stack Pyinfra operations based on the calculated delta."""
        for d in delta.to_add.get("dirs", []):
            add_op(
                state,
                files.directory,
                name=f"Create directory {d}",
                path=d,
                present=True,
                user="root",
                mode="755",
            )

        return ResultPayload(
            success=True,
            message=["Directories planned successfully"],
            error=[],
            data={},
        )
```

---

## Simplified Direct Roles

If you are developing a simple utility role and do not require pre-computed diff calculations:

```python
from pyinfra.api.operation import add_op
from pyinfra.operations import server
from chaos.lib.roles.role import Role
from chaos.lib.args.dataclasses import ResultPayload


class MySimpleRole(Role):
    def __init__(self):
        super().__init__(name="my-simple-role")

    def plan(self, state, host, delta):
        add_op(
            state,
            server.shell,
            name="Run simple update command",
            commands=["apt-get update -y"],
        )
        return ResultPayload(success=True, message=["Done!"])
```

:::caution[Why the 3-Stage Lifecycle is Recommended]
While skipping `get_context` and `delta` is allowed, adhering to the 3-stage lifecycle gives you:
1. **Accurate Dry-Runs**: Users can preview changes without altering target systems.
2. **Parallel Context Gathering**: Ch-aOS gathers facts across all fleet hosts simultaneously before execution.
3. **Structured Audit Logs**: Fact histories and configuration diffs are automatically captured in the [Logbook](../advanced/logbook.md).
:::

---

## SDK Tips & Best Practices

1. **Immediate Execution during Context Gathering**: If you need to evaluate dynamic system conditions before generating the plan, you can query facts immediately using `host.get_fact(Command, 'command')` inside `get_context()`.

2. **Declarative Idempotency**: Always calculate changes in `delta()` using sets (`target - existing`). This ensures your role only runs operations when actual differences exist.

3. **Secret Injection**: Specify `needs_secrets=True` and `necessary_secret_dict_keys=["my_key"]` in your constructor. Ch-aOS will ensure decrypted secrets are safely injected in-memory into the `secrets` dictionary passed to `get_context()`.
