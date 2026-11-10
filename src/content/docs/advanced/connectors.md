---
title: "Pyinfra Connectors"
description: "Using Pyinfra connection drivers in Ch-aOS fleets to manage local systems, remote servers, Docker, Podman, chroots, Vagrant, and Terraform instances."
---

Ch-aOS delegates transport communication and host execution to [Pyinfra](https://github.com/pyinfra-dev/pyinfra). While standard remote targets communicate over SSH, Pyinfra provides a pluggable transport abstraction called **Connectors**.

Connectors dictate *how* the execution engine reaches and commands target machines. With connectors, you can manage remote virtual machines, local Linux environments, Docker containers, ephemeral chroots, and Vagrant boxes using the exact same declarative Ch-obolo definitions and Python roles.

:::note[Looking to develop custom connectors?]
This guide focuses on **configuring and using** connectors within your Ch-obolo fleets. If you want to author a new transport driver from scratch using Python, refer to the [Developing Pyinfra Connectors](../souls/connectors.md) guide.
:::

---

## Supported Built-in Connectors

When declaring hosts under `fleet.hosts` in your Ch-obolo, prefixing the host identifier with `@<connector>/` instructs Ch-aOS to route all operations through that specific transport engine:

| Connector Prefix | Transport Target | Example Target String |
| :--- | :--- | :--- |
| *(None / default)* | Standard remote SSH connection | `prod-web-01` or `192.168.1.50` |
| `@ssh/` | Explicit remote SSH connection | `@ssh/gateway.internal` |
| `@local` | The local host running the `chaos` CLI | `@local` |
| `@docker/` | Docker daemon exec (no SSH daemon required inside container) | `@docker/web_container` |
| `@dockerssh/` | Docker container via exposed SSH port | `@dockerssh/staging_env` |
| `@podman/` | Podman container exec | `@podman/database_container` |
| `@chroot/` | Local directory mounted as a `chroot` filesystem | `@chroot/mnt/arch_root` |
| `@vagrant/` | Vagrant virtual machine running in local directory | `@vagrant/default` |
| `@terraform/` | Dynamic host state resolved from Terraform outputs | `@terraform/cluster_node` |

---

## Configuring Connectors in Ch-obolo

Connectors are configured directly inside the `fleet:` section of your Ch-obolo file. Each target inherits standard connection parameters:

```yaml
# ch-obolo.yml
fleet:
  parallelism: 4

  hosts:
    # 1. Standard remote host via SSH
    web-01:
      ssh_hostname: "192.168.1.10"
      ssh_user: "deployer"
      ssh_key: "~/.ssh/id_ed25519"
      tags: ["production", "web"]

    # 2. Local execution (manages the machine running chaos directly)
    "@local":
      tags: ["workstation"]

    # 3. Docker container via direct docker exec
    "@docker/ci-runner":
      docker_user: "root"
      tags: ["ephemeral"]

    # 4. Ephemeral chroot environment (e.g. bootstrapping fresh OS installations)
    "@chroot/mnt/target_os":
      tags: ["installer"]

    # 5. Local Vagrant environment
    "@vagrant/web_vm":
      tags: ["staging"]
```

---

## Executing Roles Across Connectors

Once defined in your fleet, targeting connector-backed hosts works identically to standard SSH nodes. The 3-stage role lifecycle (`get_context`, `delta`, and `plan`) runs transparently regardless of transport:

```bash
# Apply roles to the local system
chaos apply system_packages users -f

# Filter execution to specific tags across different connector types
chaos apply docker_setup -f
```

---

## Expanding Connectors via Styx & PyPI

Because Ch-aOS uses Pyinfra's connector interface, any connector package published on PyPI or distributed as a Ch-aOS Soul can be used immediately.

Third-party connector packages register themselves via Python's standard `entry_points` under the `pyinfra.connectors` group. Once installed in your environment (or invoked via [Styx](../commands/styx.md)):

```bash
# Example: Install a community connector soul
chaos styx invoke chaos-winrm-connector
```

The newly registered prefix (such as `@winrm/`) becomes automatically available in your Ch-obolo fleets without needing any modifications to the core CLI.

---

## Related Guides

- **[Fleet Management](./fleet.md)**: Configuring concurrency, tag filters (`allow_tags`, `black_tags`), and inventory policies.
- **[Dynamic Boats](./boats.md)**: Dynamically querying cloud APIs to discover hosts at runtime.
- **[Developing Pyinfra Connectors](../souls/connectors.md)**: Step-by-step guide on subclassing `BaseConnector` to build custom transport plugins.
