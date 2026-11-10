---
title: "Isles Soul Development"
description: "Creating composite cloud infrastructure blueprints as Ch-aOS Isles, Pulumi ComponentResource bridging, and dynamic fleet exports."
---

In Ch-aOS, **Isles** are infrastructure blueprints packaged as reusable Souls. They wrap Pulumi `ComponentResource` objects to provide clean, high-level building blocks for cloud and on-premise infrastructures.

When you declare `isle: "aws-ec2"` in your Ch-obolo, Ch-aOS discovers and instantiates your Isle class, builds the underlying Pulumi resources, and exposes the resulting outputs for subsequent role execution.

---

## The Isle Lifecycle

An Isle class inherits from `chaos.lib.isles.isle.Isle` (which extends Pulumi's `ComponentResource`).

When an Isle is instantiated during `chaos provision up`, the Pelago engine passes:

1. `name` (`str`): The unique resource name from the Ch-obolo.

2. `config` (`dict`): The dictionary of parameters declared under `config:` in the Ch-obolo.

3. `opts` (`pulumi.ResourceOptions`): Resource options, including `depends_on` dependency trees.

---

## How to Declare an Isle Soul

### 1. Register the Entry Point in `pyproject.toml`

Expose your Isle class under the `chaos.isles` entry point group:

```toml
[project.entry-points."chaos.isles"]
aws-ec2 = "my_chaos_soul.isles:AwsEc2Isle"
proxmox-vm = "my_chaos_soul.isles:ProxmoxVmIsle"
```

### 2. Implement the Isle Class

In your Python package, subclass `Isle` and define your composite infrastructure topology:

```python
# src/my_chaos_soul/isles.py
from typing import Any
import pulumi
import pulumi_aws as aws
from chaos.lib.isles.isle import Isle


class AwsEc2Isle(Isle):
    """An Isle blueprint that provisions an AWS EC2 instance with security groups."""

    # Declare required secret keys (prompts user or queries provider)
    secrets_needed = ["aws_access_key", "aws_secret_key"]

    def __init__(
        self,
        name: str,
        config: dict[str, Any],
        opts: pulumi.ResourceOptions | None = None,
    ):
        super().__init__(name=name, config=config, opts=opts)

        instance_type = config.get("instance_type", "t3.micro")
        ami = config.get("ami")
        key_name = config.get("key_name")

        # Create Security Group for SSH
        sec_group = aws.ec2.SecurityGroup(
            f"{name}-sg",
            description="Allow SSH inbound traffic",
            ingress=[
                aws.ec2.SecurityGroupIngressArgs(
                    protocol="tcp",
                    from_port=22,
                    to_port=22,
                    cidr_blocks=["0.0.0.0/0"],
                )
            ],
            egress=[
                aws.ec2.SecurityGroupEgressArgs(
                    protocol="-1",
                    from_port=0,
                    to_port=0,
                    cidr_blocks=["0.0.0.0/0"],
                )
            ],
            opts=pulumi.ResourceOptions(parent=self),
        )

        # Create EC2 Instance
        instance = aws.ec2.Instance(
            f"{name}-instance",
            instance_type=instance_type,
            ami=ami,
            key_name=key_name,
            vpc_security_group_ids=[sec_group.id],
            opts=pulumi.ResourceOptions(parent=self),
        )

        # Register outputs for Ch-aOS fleet injection
        self.public_ip = instance.public_ip
        self.register_outputs({
            "public_ip": instance.public_ip,
            "hosts": {
                name: {
                    "ssh_hostname": instance.public_ip,
                    "ssh_user": config.get("ssh_user", "ubuntu"),
                }
            },
        })
```

---

## Discovering Installed Isles

Users can list all available Isle blueprints discovered across installed Souls using:

```bash
chaos check isles
```

---

## Best Practices for Isle Development

1. **Always set `parent=self`**: When creating child Pulumi resources inside `__init__`, pass `opts=pulumi.ResourceOptions(parent=self)` to maintain hierarchical tracking in the Pulumi resource tree.

2. **Sensible Defaults**: Provide fallback values for common configuration parameters (like default instance sizes or volume types).

3. **Structured Host Exports**: If the Isle provisions a compute host intended to receive configuration roles, always register a `hosts` mapping in `self.register_outputs()` with `ssh_hostname` and `ssh_user` to enable seamless `-A / --apply` execution.
