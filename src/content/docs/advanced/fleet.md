---
title: "Fleet Management"
description: "Multi-host orchestration, static inventory, tag-based restrictions (black_tags / allow_tags), host allow/blacklists, and Pyinfra connectors in Ch-aOS."
---

Ok, so you've mastered using `chaos` to configure a local machine. But what if you have multiple servers, VMs, or containers that need the same setup? What if you want to manage an entire fleet of machines with ease?

The **Fleet** feature extends `chaos` to orchestrate multiple machines simultaneously. By adding a `fleet:` block to your Ch-obolo file, you can define a group of remote hosts, control concurrency, and run roles across all of them from a single command.

This is essential for managing any infrastructure with more than one machine, such as a cluster of web servers, a set of development VMs, or any group of computers that need consistent configuration.

---

## How It Works

When you run an `apply` command with the `--fleet` (or `-f`) flag, `chaos` will:

1. **Read Inventory**: Parse the `fleet:` block from your Ch-obolo file (or external fleet YAML).

2. **Merge Dynamic Discovery**: Ingest dynamic hosts from registered [Boats](./boats.md) into the active inventory.

3. **Evaluate Restrictions Engine**: Filter roles per host using tag-based (`black_tags`, `allow_tags`) and host-specific (`black_list`, `allow_list`) policies.

4. **Establish Connections**: Connect to target hosts via SSH or specialized Pyinfra connectors.

5. **Execute Roles**: Run the 3-stage role lifecycle (`get_context` $\rightarrow$ `delta` $\rightarrow$ `plan`) across all hosts, either in sequence or concurrently respecting `parallelism`.

---

## Defining Your Fleet

To define your fleet, create a `fleet:` key in your Ch-obolo file.

```yaml
# ch-obolo.yml

fleet:
  # Optional: Set the max number of hosts to configure at once.
  # Defaults to 0 (unlimited parallelism).
  parallelism: 5

  hosts:
    # --- Host definition using a dictionary ---
    my-server-01:
      ssh_user: root
      ssh_port: 22
      ssh_key: /path/to/private/key
      tags:
        - production
        - web

    # --- Pyinfra Connector (Docker container via SSH) ---
    "@dockerssh/my-server-02":
      ssh_user: admin
      ssh_port: 2222
      ssh_key: /path/to/another/key
      tags:
        - staging

    # --- Minimal definition, relying on defaults or ~/.ssh/config ---
    "@chroot/mnt/my/root": {}
```

:::note[Supported Pyinfra Connectors]
Since Ch-aOS uses base `pyinfra` for remote execution, all Pyinfra connectors are supported. This includes special connection types like `@dockerssh/`, `@chroot/`, `@vagrant/`, `@terraform/`, and more. All `pyinfra` connection arguments (such as `ssh_user`, `ssh_port`, `ssh_key`, `ssh_password`, etc.) are fully supported.
:::

---

## Applying Roles to the Fleet

To apply roles to the fleet, use the `-f` or `--fleet` flag with the `chaos apply` command:

```bash
# Apply the 'packages' role to all hosts in the fleet
chaos apply packages --fleet

# Apply multiple roles to the fleet with a dry run
chaos apply users services --fleet --dry

# Target an external fleet inventory file
chaos apply packages -f /etc/chaos/custom-fleet.yml
```

`chaos` will connect to each host defined in your fleet and execute the roles, respecting the `parallelism` setting.

:::tip[Dynamic Fleets with Boats]
Want dynamic discovery for your fleet (such as querying cloud APIs, Proxmox, or Kubernetes)? Take a look at our [Boats](./boats.md) documentation to learn how to use the built-in dynamic fleet management system.
:::

---

## Limiting Your Fleet Apply: The Restrictions Engine

When managing fleets, you often need to limit which roles get run where. To achieve this, Ch-aOS provides a comprehensive restrictions engine inside the `fleet.restrictions` block.

The restrictions engine supports both **tag-based filtering** (`black_tags`, `allow_tags`) and **host-specific rules** (`black_list`, `allow_list`).

```yaml
# ch-obolo.yml

fleet:
  hosts:
    host1:
      tags:
        - workstation
      ssh_user: root
      ssh_key: ~/.ssh/id_ed25519

    host2:
      tags:
        - k8s
      ssh_user: admin
      ssh_key: ~/.ssh/id_ed25519

    host3:
      tags:
        - dmz
      ssh_user: admin
      ssh_key: ~/.ssh/id_ed25519

  restrictions:
    # 1. Tag-based allowlist: Role is restricted to ONLY run on hosts having at least one of these tags
    allow_tags:
      role1: ["k8s", "chaosmox"]

    # 2. Tag-based blacklist: Role will be SKIPPED on hosts possessing any of these tags
    black_tags:
      role2: ["workstation"]
      role3: ["workstation"]

    # 3. Host-specific blacklist: Explicitly block roles or entire hosts
    black_list:
      host1:
        role1: true
      host2: {} # host2 is completely blacklisted (no roles will run)

    # 4. Host-specific allowlist: Explicitly allow only specified roles
    allow_list:
      host1:
        role3: true # Note: If host1 has tag 'workstation', black_tags will still take precedence!
      host3:
        role1: true
        role4: true
```

### Restriction Evaluation Order

When `chaos apply` gathers role context for each host, it checks restrictions in the following strict order:

1. **Tag-Based Blacklist (`black_tags`)**: If the target host matches any blacklisted tag for the given role, the role is skipped immediately.

2. **Tag-Based Allowlist (`allow_tags`)**: If the role specifies allowed tags and the host does not possess at least one matching tag, the role is skipped.

3. **Conflict Detection**: If a role is explicitly defined in both `allow_list` and `black_list` for the same host, Ch-aOS aborts execution with a configuration conflict error.

4. **Host-Specific Blacklist (`black_list`)**: If the role is marked `true` under the host's `black_list`, the role is skipped for that host.

5. **Host-Wide Blacklist (`host: {}`)**: If the host is empty-mapped in `black_list` and not present in `allow_list`, all roles are skipped for that host.

6. **Host-Specific Allowlist (`allow_list`)**: If the host is present in `allow_list` but the specified role is not on its allowlist, the role is skipped.

This evaluation happens before `get_context` runs, avoiding unnecessary remote SSH fact collection on restricted machines.
