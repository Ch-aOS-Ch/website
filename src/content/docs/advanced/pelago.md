---
title: "Pelago: Infrastructure as Code Engine"
description: "Declarative Infrastructure as Code (IaC) powered by Pulumi Automation API, Isle blueprints, Terraform modules, cross-resource references, and zero-disk secret protection."
---

In keeping with our nautical lore, having boats to manage your fleet is great—but where do you anchor them? Welcome to **Pelago** (Ch-aOS Archipelago), the declarative Infrastructure as Code (IaC) provisioning engine of Ch-aOS.

Pelago bridges the gap between **cloud infrastructure provisioning** and **declarative system configuration**. Powered under the hood by [Pulumi Automation API](https://www.pulumi.com/docs/iac/packages-and-providers/automation-api/), Pelago lets you define cloud resources directly in your [Ch-obolo](../core-concepts.md#ch-obolos-the-data), spin them up with `chaos provision up`, and seamlessly apply Ch-aOS roles to the newly provisioned machines in a single workflow.

---

## Why Pelago?

Traditional engineering workflows often treat infrastructure provisioning (Terraform, Pulumi, CloudFormation) and configuration management (Ansible, Puppet, Chef, Pyinfra) as disconnected silos. You write Terraform to deploy a VM, manually copy the resulting IP into an inventory file, and then run an Ansible playbook against it.

Pelago unifies these steps:

1. **Single Source of Truth**: Your cloud infrastructure topology and operating system configurations live together in the same declarative Ch-obolo file.

2. **Modular Blueprints (Isles)**: Infrastructure components are packaged as reusable Ch-aOS Souls called **Isles** (e.g., `aws-ec2`, `gcp-compute`, `digitalocean-droplet`, `proxmox-vm`).

3. **Native Pulumi Resources**: If an Isle doesn't exist for your specific resource, you can declare native Pulumi resources directly using `type:` and `properties:`.

4. **Terraform & OpenTofu Reusability**: Native consumption of existing `.tf` modules and inline HCL without rewriting infrastructure code into Python.

5. **Zero-Disk Secret Security**: Decrypted credentials travel 100% in-memory over gRPC and are immediately scrubbed from stack configuration upon completion.

6. **Automatic Fleet Injection**: Outputs exported from Pulumi (such as public IPs, SSH users, and ports) are automatically mapped into memory as Ch-aOS `fleet.hosts`, enabling instant SSH role execution via `chaos provision up <stack> <project> -A <roles...>`.

---

## Defining Resources in Ch-obolo

Pelago resources are declared under the `pelago:` list in your Ch-obolo file.

```yaml
# ch-obolo.yml
pelago:
  - name: "prod-vpc"
    type: "aws:ec2:Vpc"
    properties:
      cidrBlock: "10.0.0.0/16"
      enableDnsHostnames: true
      tags:
        Name: "prod-vpc"

  - name: "web-server"
    isle: "aws-ec2"
    depends_on:
      - "prod-vpc"
    config:
      instance_type: "t3.medium"
      ami: "ami-0c55b159cbfafe1f0"
      key_name: "deployer-key"
    exports:
      hosts:
        web-server:
          ssh_hostname: "198.51.100.24"
          ssh_user: "ubuntu"
```

---

## The 4 Resource Declaration Models

### 1. Isle Blueprints (`isle:`)

An **Isle** is a composite blueprint implemented as a Ch-aOS Soul. It packages entire infrastructure topologies (like a VM with its security group, network interface, and storage) into clean, high-level configuration blocks.

```yaml
- name: "app-node-01"
  isle: "aws-ec2"
  config:
    instance_type: "t3.large"
    ami: "ami-xxxxxx"
    key_name: "prod-key"
```

To list all installed Isles available on your system:
```bash
chaos check isles
```

### 2. Native Pulumi Resources (`type:`)

If you need a specific cloud resource that isn't wrapped by an Isle, Pelago allows you to instantiate any Pulumi resource type directly using `type:` and `properties:` without writing Python code:

```yaml
- name: "app-storage-bucket"
  type: "aws:s3:Bucket"
  properties:
    bucket: "my-app-production-assets"
    acl: "private"
    versioning:
      enabled: true
```

### 3. Terraform & OpenTofu Modules (`module:`)

Already have existing Terraform (`.tf`) code or wish to consume public Terraform modules without rewriting them? Pelago natively integrates with Terraform and OpenTofu modules directly in Python via `pulumi-labs-hcl`:

```yaml
- name: "proxmox-cluster"
  module: "./infra/terraform/proxmox" # Local directory containing .tf files
  inputs:
    node_name: "pve"
    api_token: "${secrets:proxmox_token}"
```

### 4. Inline HCL (`hcl:`)

Embed raw HCL configurations directly inside your Ch-obolo:

```yaml
- name: "inline-infra"
  hcl: |
    terraform {
      required_providers {
        local = {
          source  = "hashicorp/local"
          version = "2.4.0"
        }
      }
    }
    variable "server_ip" {
      type = string
    }
    resource "local_file" "config" {
      content  = "server_ip = ${var.server_ip}"
      filename = "/tmp/server_config.txt"
    }
    output "cfg_file" {
      value = local_file.config.filename
    }
  inputs:
    server_ip: "${secrets:server_ip}" # <~ injected in-memory via gRPC
```

Outputs declared in Terraform (`output "..." { ... }`) are automatically exposed as native Pulumi Outputs, accessible for cross-resource references (`${proxmox-cluster.vm_ip}`) and fleet auto-mapping.

:::caution[Zero-Disk Secret Guarantee]
Inlining secret placeholders (`${secrets:...}`) directly inside the raw `hcl:` text is strictly forbidden and will be rejected with a `Security violation` error during validation.

To prevent secrets from touching the disk cache, always declare a standard Terraform `variable "name" { type = string }` in your HCL code and pass the decrypted secret via the `inputs:` block. Secrets in `inputs:` travel 100% in-memory via Pulumi's gRPC layer.
:::

---

## Inter-Resource Dependencies (`depends_on`)

Pelago handles dependencies between resources using the `depends_on:` list. When specified, Pelago ensures that prerequisite resources are created and ready before downstream resources begin provisioning:

```yaml
pelago:
  - name: "backend-db"
    type: "aws:rds:Instance"
    properties:
      instanceClass: "db.t3.micro"
      allocatedStorage: 20
      engine: "postgres"

  - name: "api-server"
    isle: "aws-ec2"
    depends_on:
      - "backend-db"
    config:
      instance_type: "t3.small"
```

---

## Cross-Resource References & String Templates (`${resource_name.property}`)

Pelago allows you to wire outputs from one resource directly into the inputs, properties, or exports of another using `${resource_name.id}`, `${resource_name.urn}`, or custom output attributes. It supports both direct assignments and composite string templates combined with Pulumi's `Output.concat`:

```yaml
pelago:
  # 1. Allocate an Elastic IP
  - name: "my-ip"
    type: "aws:ec2:Eip"
    properties:
      domain: "vpc"

  # 2. Provision EC2 instance
  - name: "web-server"
    type: "aws:ec2:Instance"
    properties:
      ami: "ami-0c55b159cbfafe1f0"
      instanceType: "t3.small"

  # 3. Associate Elastic IP with the instance using cross-resource IDs and composite templates
  - name: "ip-assoc"
    type: "aws:ec2:EipAssociation"
    depends_on: ["my-ip", "web-server"]
    properties:
      instanceId: "${web-server.id}"    # <~ References web-server resource output ID!
      allocationId: "${my-ip.id}"        # <~ References my-ip resource output ID!
    exports:
      api_endpoint: "http://${my-ip.publicIp}:8080/v1" # <~ Composite string template combined with Pulumi Output.concat!
```

---

## Stack Exports and Fleet Auto-Mapping

When Pulumi creates cloud infrastructure, you can register outputs using the `exports:` block:

```yaml
pelago:
  - name: "load-balancer"
    isle: "aws-ec2"
    exports:
      lb_ip: "203.0.113.50"
      hosts:
        web-prod:
          ssh_hostname: "203.0.113.50"
          ssh_user: "ubuntu"
          ssh_port: 22
```

### Dynamic IP Export Requirement for `-A / --apply`

When applying configuration roles to freshly provisioned infrastructure via `chaos provision up <stack> <project> -A <roles...>`, Pelago intercepts stack outputs and automatically injects them into in-memory `fleet.hosts`.

Because cloud IP addresses are dynamically assigned at runtime (such as an EC2 Public IPv4 or a DigitalOcean Droplet IPv4), Pelago requires the resource to export its address so that the subsequent Pyinfra runner knows which IP to connect to via SSH.

Pelago supports three configuration patterns to export dynamic addresses:

#### Pattern 1: Explicit `exports.hosts` Mapping (Recommended for Complete Topology Control)
Define the SSH metadata in `fleet.hosts`, and let Pelago provide the dynamic `ssh_hostname`:
```yaml
fleet:
  hosts:
    web-prod:
      ssh_user: "ubuntu"
      ssh_port: 22
      ssh_key: "~/.ssh/id_ed25519"

pelago:
  - name: "web-server"
    type: "aws:ec2:Instance"
    properties:
      ami: "ami-0c55b159cbfafe1f0"
      instanceType: "t3.small"
    exports:
      hosts:
        web-prod:
          ssh_hostname: "${web-server.publicIp}" # <~ Maps dynamic runtime IP into fleet host
```

#### Pattern 2: Isle Automatic Host Export
Isles inherently know their primary network interface and automatically register their public or private IP under their declared resource name into `fleet.hosts`.

#### Pattern 3: Top-Level Output Key Matching
If an export key matches standard host attributes or matches the name of a host defined in `fleet.hosts`:
```yaml
pelago:
  - name: "my-droplet"
    type: "digitalocean:index:Droplet"
    properties:
      image: "ubuntu-24-04-x64"
      region: "nyc3"
      size: "s-1vcpu-1gb"
    exports:
      vm_ip: "${my-droplet.ipv4Address}" # <~ Recognized automatically by Pelago's IP heuristic
```
Recognized export heuristics include `exports.hosts`, `vm_ip`, `server_ip`, `public_ip`, `private_ip`, `*_ip`, `*_host`, `hostname`, `ipv4`, and `address`.

When `-A / --apply` is executed:
1. Pelago executes `pulumi up` to build the infrastructure.
2. It captures the resolved outputs via Pulumi's gRPC stream.
3. It merges all dynamic IP addresses into `fleet.hosts` in memory.
4. Ch-aOS immediately establishes SSH connections to the freshly provisioned hosts and executes your requested roles (`packages`, `docker`, `users`, etc.).

---

## Secret Management with Pelago

Pelago seamlessly integrates with Ch-aOS' [SOPS-based secret engine](../commands/secrets.md).

- **Declaring required secrets:** Resources and Isles can specify `secrets_needed: [api_token, db_password]`.
- **Decrypting and passing secrets:** Adding `-s / --secrets` (or ephemeral providers like `--from-bw` or `--from-op`) decrypts the necessary credentials and securely injects them into the Pulumi stack configuration and environment without persisting plaintext to disk.

```bash
chaos provision up prod my-infra -s -p op.vault -A production-role
```

---

## Pulumi State Backend & Environment Variables

By default, Pelago stores its state locally at `~/.pulumi/backend` (or uses the URL defined in the `PULUMI_BACKEND_URL` environment variable).

You can configure cloud storage backends (AWS S3, Google Cloud Storage, Azure Blob Storage) by setting standard Pulumi environment variables:

```bash
# 1. Store Pelago state in an S3 bucket
export PULUMI_BACKEND_URL="s3://my-chaos-state-bucket"
export PULUMI_CONFIG_PASSPHRASE="my-encryption-key"

# 2. Or sync state and graphs with Pulumi Cloud Web Dashboard
export PULUMI_ACCESS_TOKEN="pul-xxxxxxxxxxxx"
export PULUMI_BACKEND_URL=""

# Run provision
chaos provision up prod my-infra -s
```

### Environment Variables Reference

- `PULUMI_BACKEND_URL`: Destination URL for state storage. Supports `file://`, `s3://`, `gs://`, `azblob://` or `""` (Pulumi Cloud). Defaults to `file://~/.pulumi/backend`.

- `PULUMI_CONFIG_PASSPHRASE`: Encryption key for state files when using self-managed backends (local, S3, GCS).

- `PULUMI_CONFIG_PASSPHRASE_FILE`: Path to a file containing the encryption passphrase.

- `PULUMI_ACCESS_TOKEN`: Access token for [app.pulumi.com](https://app.pulumi.com) web UI integration.

- `PULUMI_HOME`: Directory for cached plugin binaries and schemas (defaults to `~/.pulumi`).

- `PULUMI_SKIP_UPDATE_CHECK`: Disable automatic update checks in non-interactive environments (`true`).
