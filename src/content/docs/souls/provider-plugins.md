---
title: "Provider Soul Development"
description: "Developing external secret manager provider Souls for Ch-aOS, REGISTRATION schemas, zero-disk RAM workflows, and SOPS key retrieval."
---

A **Provider Soul** integrates Ch-aOS with an external secret manager (e.g. Bitwarden, Bitwarden Secrets CLI, rbw, 1Password, Doppler, Infisical, Vault), enabling secure, ephemeral storage and retrieval of master encryption keys.

---

## Core Architecture

A Provider Soul is a standard Python package that:
1. Defines a `REGISTRATION` dictionary that specifies dynamic CLI flags and subcommands.

2. Implements the `Provider` abstract base class from `chaos.lib.secret_backends.base`.

3. Exposes the `REGISTRATION` object under the `chaos.providers` entry point group.

The `Provider` architecture abstracts interactions with external secret manager CLIs or REST APIs for:
- **Ephemeral key reading**: Fetching Age/PGP keys directly into in-memory RAM disks (`/dev/shm` on Linux, volatile ramdisk on macOS).

- **Exporting/Importing keys**: Backing up and restoring keys between Ch-aOS and external vaults (`chaos secrets export <provider>` / `chaos secrets import <provider>`).

- **CLI & authentication validation**: Checking if CLI binaries are installed and logged in before execution.

---

## 1. The `REGISTRATION` Dictionary Schema

In Ch-aOS, Provider Souls use a declarative `REGISTRATION` dictionary to expose CLI flags, argument parsing rules, and subcommands without requiring Ch-aOS to eagerly import the entire provider class at startup.

```python
# src/my_chaos_provider/main.py
REGISTRATION = {
    # 1. Fully-qualified Python path to the Provider subclass (enables lazy-loading)
    "class_ref": "my_chaos_provider.main:MyProvider",

    # 2. Canonical CLI identifier
    "cli_name": "myprovider",

    # 3. Dynamic ephemeral flags injected into commands (`chaos apply`, `chaos provision`, etc.)
    "flags": [
        {
            "args": ["--from-myprovider", "-m"],
            "kwargs": {
                "type": "str",
                "nargs": 2,
                "metavar": ("ITEM_ID", "KEY_TYPE"),
                "help": "Retrieve ephemeral keys from MyProvider. Provide ITEM_ID and KEY_TYPE (age/gpg/vault).",
            },
        }
    ],

    # 4. Dynamic subcommands for `chaos secrets export <provider>`
    "export_subcommands": {
        "name": "myprovider",
        "help": "MyProvider CLI export options",
        "arguments": [
            {
                "args": ["-o", "--organization-id"],
                "kwargs": {
                    "dest": "organization_id",
                    "help": "Organization ID where to create the item.",
                },
            },
            {
                "args": ["-c", "--collection-id"],
                "kwargs": {
                    "dest": "collection_id",
                    "help": "The ID of the collection to add the item to.",
                },
            },
        ],
    },

    # 5. Dynamic subcommands for `chaos secrets import <provider>`
    "import_subcommands": {
        "name": "myprovider",
        "help": "MyProvider CLI import options",
        "arguments": [],
    },
}
```

---

## 2. Implementing the `Provider` Class

Subclass `Provider` (`chaos.lib.secret_backends.base.Provider`) and implement the abstract methods corresponding to your registration schema:

```python
# src/my_chaos_provider/main.py
import subprocess
from dataclasses import dataclass
from typing import Tuple, cast

from chaos.lib.args.dataclasses import (
    ProviderExportArgs,
    ProviderImportArgs,
    ResultPayload,
    SecretsExportPayload,
)
from chaos.lib.secret_backends.base import AuthCheck, KeyFetchCommand, Provider
from chaos.lib.utils import checkDep


@dataclass(frozen=True)
class MyProviderExportArgs(ProviderExportArgs):
    organization_id: str | None = None
    collection_id: str | None = None


class MyProvider(Provider):
    @classmethod
    def build_export_args(cls, **kwargs) -> MyProviderExportArgs:
        """Constructs the typed export arguments dataclass from CLI kwargs."""
        return MyProviderExportArgs(**kwargs)

    @classmethod
    def build_import_args(cls, **kwargs) -> ProviderImportArgs:
        """Constructs the typed import arguments dataclass from CLI kwargs."""
        return ProviderImportArgs(**kwargs)

    @staticmethod
    def get_export_arg_names() -> list[str]:
        return ["organization_id", "collection_id"]

    @staticmethod
    def get_import_arg_names() -> list[str]:
        return []

    @staticmethod
    def get_cli_name() -> Tuple[str, str]:
        """Returns the flag attribute name and the config key in ~/.config/chaos/config.yml."""
        return "from_myprovider", "myprovider"

    def check_status(self) -> Tuple[bool, str]:
        """Validates CLI installation and active authentication state."""
        if not checkDep("myprovider-cli"):
            raise OSError("The 'myprovider-cli' tool is required but not found in PATH.")

        # Verify authentication status via CLI check
        return True, "MyProvider is ready and authenticated."

    def readKeys(self, item_id: str) -> str:
        """Reads raw secret key content from the vault."""
        try:
            result = subprocess.run(
                ["myprovider-cli", "get", "secret", item_id],
                capture_output=True,
                text=True,
                check=True,
            )
            key_content = result.stdout.strip()
            if not key_content:
                raise ValueError(f"No content found for item ID '{item_id}'.")
            return key_content
        except subprocess.CalledProcessError as e:
            raise RuntimeError(
                f"Error retrieving secret from MyProvider (ID: '{item_id}'): {e.stderr.strip()}"
            ) from e

    def export_secrets(self, payload: SecretsExportPayload) -> ResultPayload:
        """Exports an Age/PGP key into the external vault."""
        self.check_status()
        provider_args = cast(MyProviderExportArgs, payload.provider_specific_args)

        # Implementation logic to create secret item via CLI or REST API...
        return ResultPayload(
            success=True,
            message=[f"Successfully exported {payload.key_type} key '{payload.item_name}' to MyProvider."],
        )

    def get_key_fetch_command(
        self, item_id: str, key_type: str = ""
    ) -> KeyFetchCommand:
        """Returns client execution descriptor for fetching keys."""
        resolved_key_type = self._resolve_key_type(key_type)
        return KeyFetchCommand(
            provider="myprovider",
            binary="myprovider-cli",
            command=["myprovider-cli", "get", "secret", item_id],
            key_type=resolved_key_type,
            auth_check=AuthCheck(
                check_type="exec",
                target="myprovider-cli status",
                expected_status=0,
                prompt_message="MyProvider is locked. Run 'myprovider-cli login' before proceeding.",
            ),
        )
```

---

## 3. Registering Entry Points in `pyproject.toml`

Point the `chaos.providers` entry point directly to your `REGISTRATION` dictionary:

```toml
# pyproject.toml
[project.entry-points."chaos.providers"]
myprovider = "my_chaos_provider.main:REGISTRATION"
```

Ch-aOS inspects this entry point during plugin discovery, registers your flags and subcommands in the global CLI parser, and only imports `my_chaos_provider.main.MyProvider` when the user invokes `--from-myprovider` or `chaos secrets export myprovider`.

---

## Ephemeral RAM-Disk Security Guarantee

The `setupEphemeralEnv()` context manager in the base `Provider` class ensures that keys fetched via `readKeys()` are written exclusively to volatile RAM disks (`/dev/shm` on Linux, volatile RAM disks on macOS) and bound to environment variables (`SOPS_AGE_KEY_FILE`, `GNUPGHOME`).

When the execution terminates or encounters an interruption, the RAM disk files and file descriptors are wiped, guaranteeing zero plaintext key persistence to non-volatile storage.

:::tip[Do Not Override setupEphemeralEnv]
Avoid overriding `setupEphemeralEnv()`. The base class handles memory lifecycle, signal traps, and cleanup logic. You only need to implement `readKeys()`, `check_status()`, and the `REGISTRATION` dictionary.
:::

---

## Verifying Installed Providers

Discover and check all registered provider Souls in your environment with:

```bash
chaos check providers
```
