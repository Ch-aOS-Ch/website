---
title: "Soul Development"
description: "Architecture, package structure, entry points, and lifecycle for authoring Ch-aOS Souls (roles, explain, aliases, keys, providers, boats, limanis, isles)."
---

Ch-aOS is designed to be an SDK and an extensible CLI. Most functionalities are provided through external **Souls**. This guide covers the fundamentals of creating and distributing your own Souls.

A Soul is a standard Python package that uses standard `entry_points` to register its classes and functionality with the Ch-aOS engine.

---

## Project Structure

A standard Soul project layout:

```
my-chaos-soul/
├── pyproject.toml
└── src/
    └── my_chaos_soul/
        ├── __init__.py
        ├── roles.py
        └── explain.py
```

---

## `pyproject.toml` Registration

The `pyproject.toml` file defines your Soul's package metadata and its entry point hooks:

```toml
[project]
name = "my-chaos-soul"
version = "0.1.0"
description = "A new Soul for Ch-aOS."
requires-python = ">=3.10"

[project.entry-points]
# Entry points discovered dynamically by Ch-aOS
"chaos.roles" = { my-role = "my_chaos_soul.roles:MyRoleClass" }
"chaos.explain" = { my-role = "my_chaos_soul.explain:MyRoleExplain" }
"chaos.aliases" = { mr = "my-role" }
"chaos.keys" = { my-role = "my_chaos_soul.roles:my_role_keys" }
"chaos.providers" = { myprovider = "my_chaos_soul.providers:REGISTRATION" }
"chaos.boats" = { myboat = "my_chaos_soul.boats:MyBoatClass" }
"chaos.limanis" = { mylimani = "my_chaos_soul.limanis:MyLimaniClass" }
"chaos.isles" = { myisle = "my_chaos_soul.isles:MyIsleClass" }
```

---

## Entry Point Groups

Ch-aOS uses several entry point groups to discover Soul capabilities at runtime.

### `chaos.roles`

Registers a **Role** class executed during `chaos apply`.

- **Key**: The name of the role tag (e.g. `my-role`).
- **Value**: A string pointing to a Python class in the format `path.to.module:ClassName`.

This class inherits from `chaos.lib.roles.role.Role` and implements the 3-stage SDK lifecycle (`get_context`, `delta`, `plan`).

```python
# src/my_chaos_soul/roles.py
from chaos.lib.roles.role import Role
from chaos.lib.args.dataclasses import Delta, ResultPayload
from pyinfra.operations import server


class MyRoleClass(Role):
    def __init__(self):
        super().__init__(name="my-role", necessary_chobolo_keys=["my_role_dirs"])

    def plan(self, state, host, delta: Delta) -> ResultPayload:
        """Ensure directories exist based on delta."""
        for d in delta.to_add.get("dirs", []):
            server.dir(
                name=f"Ensure {d} exists",
                path=d,
                present=True,
                user="root",
                mode="755",
            )
        return ResultPayload(success=True)
```
*(For full details on `get_context` and `delta`, see the [Roles Soul Documentation](./roles.md).)*

---

### `chaos.explain`

Registers a class that provides structured interactive documentation for your role, accessible via `chaos explain`.

- **Key**: The topic name, usually matching your role tag (e.g. `my-role`).
- **Value**: A string pointing to an explain class `path.to.module:ClassName`.

```python
# src/my_chaos_soul/explain.py
class MyRoleExplain:
    _order = ['usage'] # Controls display ordering in `chaos explain my-role.list`

    def explain_my_role(self, detail_level='basic'):
        return {
            'concept': 'My Custom Role',
            'what': 'This role ensures specific directories exist.',
            'why': 'To demonstrate how to create a Ch-aOS soul using the SDK.',
            'how': 'It utilizes the Role class lifecycle and pyinfra operations.',
        }

    def explain_usage(self, detail_level='basic'):
        return {
            'concept': 'Usage Example',
            'examples': [{
                'yaml': '# Run the role\nchaos apply my-role'
            }]
        }
```

---

### `chaos.aliases`

Registers short aliases for role tags.

- **Key**: The short alias (e.g. `mr`).

- **Value**: The full role tag it points to (e.g. `my-role`).

Allows executing `chaos apply mr` as a direct shortcut for `chaos apply my-role`.

---

### `chaos.keys`

Registers the configuration schema keys that your role requires. This allows `chaos init chobolo` to automatically scaffold default YAML configuration blocks into user templates.

- **Key**: The role tag (e.g. `my-role`).

- **Value**: A string pointing to a list of dict objects `path.to.module:object_name`.

```python
# src/my_chaos_soul/roles.py
my_role_keys = [{
    'my_role_dirs': [
        '/tmp/dir1',
        '/tmp/dir2',
    ]
}]
```

---

### `chaos.providers`

Registers an external secret manager provider plugin (e.g. Bitwarden, 1Password, Doppler, Infisical). See [Provider Souls](./provider-plugins.md).

---

### `chaos.boats`

Registers a dynamic inventory provider for `chaos apply --fleet`. See [Boat Souls](../advanced/boats.md).

---

### `chaos.limanis`

Registers a storage backend for execution telemetry with `chaos apply --logbook --limani`. See [Limani Souls](./limani.md).

---

### `chaos.isles`

Registers a composite cloud infrastructure blueprint for Pelago (`chaos provision up`). See [Isle Souls](./isles.md).

---

## Verifying Installed Souls

You can inspect all discovered Souls installed in your Python environment with the `chaos check` command suite:

```bash
chaos check roles
chaos check providers
chaos check boats
chaos check limanis
chaos check isles
chaos check templates
```
