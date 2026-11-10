---
title: "Command: `chaos provision`"
description: "Declarative Infrastructure as Code (IaC) engine powered by Pelago and Pulumi Automation API."
---

Why stop at configuring machines when you can create them from scratch?

The `chaos provision` command is Ch-aOS' Infrastructure as Code (IaC) engine, powered by [Pelago](../advanced/pelago.md) and Pulumi Automation API. It allows you to provision cloud infrastructure (VMs, VPCs, storage, containers, etc.) declaratively defined in your [Ch-obolo file](../core-concepts.md#ch-obolos-the-data), and immediately configure them with Ch-aOS roles in a single command.

---

## Usage

```bash
chaos provision <subcommand> <stack_name> <project_name> [options]
```

- `<subcommand>`: One of `up`, `down`, or `preview`.

- `<stack_name>`: The name of the Pulumi stack (e.g., `dev`, `staging`, `prod`).

- `<project_name>`: The name of the Pelago project (e.g., `my-app`, `infra-fleet`).

- `[options]`: Flags to modify provisioning, secrets, logging, or post-provision role application.

---

## Subcommands

### `chaos provision up`

Provisions or updates your infrastructure resources as declared in the `pelago` section of your Ch-obolo. When combined with the `-A / --apply` flag, it automatically registers the provisioned host endpoints and executes your selected roles on them.

```bash
# Provision resources for the 'dev' stack in project 'my-cloud'
chaos provision up dev my-cloud

# Provision and immediately apply 'packages' and 'docker' roles to the new machines
chaos provision up dev my-cloud -A packages docker

# Pass encrypted secrets and run non-interactively
chaos provision up prod my-cloud -s -A nginx -y
```

### `chaos provision preview`

Generates a plan/preview of the infrastructure changes without creating, updating, or deleting any cloud resources. It displays a summary table detailing how many resources will be created, updated, replaced, or deleted.

```bash
# Preview what changes will happen on the 'dev' stack
chaos provision preview dev my-cloud
```

### `chaos provision down`

Tears down and destroys all provisioned cloud resources in the specified stack.

```bash
# Interactively confirm and destroy resources
chaos provision down dev my-cloud

# Skip confirmation prompt
chaos provision down dev my-cloud -y
```

---

## Key Options

### Post-Provision Role Apply (`-A`, `--apply`)

Applies one or more role tags (or aliases) to the provisioned hosts immediately after the infrastructure update succeeds.

**Why?** This provides a seamless "0 to fully configured server" experience. Outputs exported by Pelago (like `hosts` or IP addresses) are automatically merged into the Ch-obolo `fleet.hosts` inventory, allowing Pyinfra and Ch-aOS roles to connect over SSH and reconcile system state without manual intervention.

```bash
# Provision infrastructure and immediately configure it with multiple roles
chaos provision up dev my-cloud -A users base-packages docker
```

### Dry Run / Preview (`-d`, `--dry`)

When running `chaos provision up`, the `--dry` flag forces the execution into preview mode, printing the planned resource changes and skipping any post-provision role execution.

```bash
chaos provision up dev my-cloud --dry -A nginx
```

### Skip Confirmations (`-y`, `-ikwid`, `--i-know-what-im-doing`)

Skips all interactive confirmations during provisioning, teardown, and role application. Required for non-interactive CI/CD pipelines.

```bash
chaos provision down dev my-cloud -y
```

### Sudo Password Handling (`-P`, `-w`)

When applying roles post-provision, privilege escalation may require a sudo password:

- `-P, --sudo-password-file <file>`: Reads the sudo password from a specified file.

- `-w, --password [password]`: Passes the sudo password directly (useful when piping from password vaults or `stdin`).

```bash
# Provide sudo password via file for post-provision apply
chaos provision up dev my-cloud -A packages -P ~/.secrets/sudo_pass

# Read sudo password from stdin in a CI pipeline
echo "$SUDO_PASS" | chaos provision up prod my-cloud -A packages -y -w
```

---

## Provisioning Stacks with Specific Secrets

Cloud provisioning and system configuration often require sensitive credentials (cloud provider tokens, SSH private keys, database root passwords, API keys). Pelago integrates directly with Ch-aOS' [SOPS secret management](./secrets.md) and [Secret Provider plugins](../advanced/providers.md).

### 1. Declaring Required Secrets in Ch-obolo

You can declare required secrets directly on any Pelago resource entry using `secrets_needed:`:

```yaml
pelago:
  - name: "prod-cluster"
    isle: "aws-eks"
    secrets_needed: # <~ btw, this works with non-isle resources too
      - "aws_access_key_id"
      - "aws_secret_access_key"
      - "cluster_admin_password"
    config:
      region: "us-east-1"
      node_count: 3
```

Installed Isle blueprints can also declare `secrets_needed` internally.

### 2. Secret & Variable Interpolation (`${secrets:...}`)

Pelago supports explicit `${secrets:secret_name}` and variable interpolation in your `properties:`, `config:`, and `exports:` blocks:

- **SOPS Secret Substitution**: When secrets are decrypted with `-s`, Pelago replaces `${secrets:secret_name}` placeholders directly with their decrypted values at runtime:
  ```yaml
  pelago:
    - name: "database"
      type: "aws:rds:Instance"
      secrets_needed:
        - "db_master_password"
      properties:
        instanceClass: "db.t3.micro"
        allocatedStorage: 20
        engine: "postgres"
        password: "${secrets:db_master_password}" # <~ injected directly from decrypted secrets
  ```

  :::note
  Pelago also accepts `${secrets.key}` and `${secret:key}` for flexibility.
  :::

- **Cross-Resource References & String Templates (`${resource.id}` / `http://${resource.property}:8080`)**: You can reference output IDs, URNs, or properties of previously declared resources, either as standalone exact matches or within composite string templates:
  ```yaml
  pelago:
    - name: "my-ip"
      type: "aws:ec2:Eip"
      properties:
        domain: "vpc"

    - name: "web-server"
      type: "aws:ec2:Instance"
      properties:
        ami: "ami-0c55b159cbfafe1f0"
        instanceType: "t3.small"

    - name: "ip-assoc"
      type: "aws:ec2:EipAssociation"
      depends_on: ["my-ip", "web-server"]
      properties:
        instanceId: "${web-server.id}"    # <~ References web-server resource output ID!
        allocationId: "${my-ip.id}"        # <~ References my-ip resource output ID!
      exports:
        api_endpoint: "http://${my-ip.publicIp}:8080/v1" # <~ Composite string template combined with Pulumi Output.concat!
  ```

- **Ch-obolo Variables**: Ch-obolo keys can also be referenced across the YAML file using standard OmegaConf syntax `${key}` or `${oc.env:VAR}` for environment variables.

### 3. How Pelago Protects Your Secrets

- **In-Memory Decryption**: Decrypted secrets are never written to unencrypted disk files.

- **HCL Zero-Disk Protection**: Secret placeholders (`${secrets:...}`) are strictly forbidden inside raw `hcl:` text to avoid writing plaintext credentials to disk caches. Secrets for Terraform modules must be declared as `variable "name" {}` and passed via `inputs:`, which travels 100% in-memory over gRPC.

- **Pulumi Secret Encryption**: Keys matching the `project:secret_name` format are set in Pulumi stack config with `secret=True` (`stack.set_config(..., secret=True)`).

- **Automatic Teardown**: When provisioning completes, Pelago cleans up the stack configuration so sensitive values do not linger in local state. Don't worry tho, this doesn't mean that your infra isn't up or not using secrets, they're just not stored in plaintext on your local machine. Ephemerality baby!

---

## Isles vs. Native Resources vs. Terraform Modules: Pros & Cons

Pelago supports three distinct ways of defining infrastructure: Isles (reusable Python blueprints packaged as Souls), Native Resources (raw Pulumi resource types in YAML), and Terraform / OpenTofu Modules (direct consumption of `.tf` files or inline HCL).

### Isles (`isle:`)

**Pros:**
- Concise configuration: A few lines of YAML in your Ch-obolo declare an entire server topology (VM, security group, network interface, storage, and keypair).

- Automatic dynamic IP resolution: The Isle captures dynamic cloud IPs during allocation and formats them directly into `fleet.hosts` for instant SSH connectivity when running with `-A / --apply`.

- Python validation and logic: Custom logic, defaults, conditional resources, and assertions can be defined directly in the Isle class.

- Reusability: Blueprints can be shared and installed across projects using Styx.

**Cons:**
- Requires creating or installing an Isle plugin class in Python.

### Native Resources (`type:`)

**Pros:**
- Zero Python required: Everything is declared directly in YAML.

- Full ecosystem access: Direct access to all resource types across official Pulumi providers (AWS, GCP, Azure, Cloudflare, Kubernetes, etc.).

- Cross-resource references: Supports linking outputs from one resource to inputs of another via `${resource_name.id}`.

**Cons:**
- More verbose: Creating full compute topologies requires declaring each supporting resource (VPC, subnet, security group, elastic IP, instance) separately.

- Manual SSH mapping: Does not automatically format dynamic IPs into the Ch-aOS fleet format unless an Elastic IP or explicit export reference is provided.

### Terraform & OpenTofu Modules (`module:` / `hcl:`)

**Pros:**
- Reuse existing `.tf` configurations and public registry modules directly without rewriting into Python.

- Supports inline HCL (`hcl: |`) and external modules with secure in-memory `${secrets:...}` passing via `inputs:` in Ch-obolo.

- Outputs seamlessly bridge into Pulumi and Ch-aOS fleet management.

**Cons:**
- First run requires downloading the Pulumi HCL provider bridge plugin (~3s on first run, ~1s cached).

- Heavy import tax (about 200ms) to load the Pulumi HCL provider and parse the module.

### When to choose which:
- Use **Isles** for complete clusters and infrastructure topologies that require complex orchestration and scripting logic.

- Use **Native Resources** for auxiliary cloud services (managed databases, storage buckets, DNS records, IAM roles) that do not require OS-level role management.

- Use **Terraform Modules / HCL** when bringing existing Terraform modules, legacy infrastructure, or inline HCL into your Ch-aOS project.

---

## Fleet Setup for Pelago

Pelago can link together cloud infrastructure with Ch-aOS' [Fleet Management](../advanced/fleet.md) engine. When you run `chaos provision up <stack> <project> -A <roles...>`, Pelago resolves the provisioned cloud outputs and automatically merges them into the in-memory `fleet.hosts` inventory before running Pyinfra.

### Configuration Patterns

#### Pattern 1: Explicit `exports.hosts` (Recommended)

Define the exact host connection parameters directly in the `exports:` section of your Pelago resource:

```yaml
pelago:
  - name: "web-server"
    isle: "aws-ec2"
    config:
      instance_type: "t3.small"
      ami: "ami-0c55b159cbfafe1f0"
      key_name: "deployer"
    exports:
      hosts:
        web-server:
          ssh_hostname: "203.0.113.10"
          ssh_user: "ubuntu"
          ssh_port: 22
          ssh_key: "~/.ssh/id_ed25519"
```

#### Pattern 2: Pre-defined `fleet.hosts` Skeleton in `ch-obolo.yml`

You can pre-configure host settings (like `ssh_user`, `ssh_key`, or custom ports) under `fleet.hosts`, and let Pelago inject the provisioned IP address (I personally use this one):

```yaml
# ch-obolo.yml
fleet:
  hosts:
    web-prod:
      ssh_user: "dexmachina"
      ssh_port: 22
      ssh_key: "~/.ssh/id_ed25519"

pelago:
  - name: "web-prod"
    isle: "aws-ec2"
    exports:
      vm_ip: "203.0.113.88" # <~ automatically injected into fleet.hosts.web-prod.ssh_hostname

packages:
  - nginx
  - git
  - ufw
```

Pelago automatically matches output keys matching your host name or common IP output patterns (`vm_ip`, `server_ip`, `*_ip`, `*_host`, `hostname`, `ipv4` and `address` specifically) and binds them to the target host.

#### Pattern 3: Cluster / Multi-Host List Output

If an Isle provisions multiple nodes (e.g. Kubernetes cluster or auto-scaling group), export a list under `hosts`:

```yaml
pelago:
  - name: "k8s-nodes"
    isle: "cluster-nodes"
    exports:
      hosts:
        - name: "worker-01"
          ssh_hostname: "10.0.1.10"
          ssh_user: "ubuntu"
        - name: "worker-02"
          ssh_hostname: "10.0.1.11"
          ssh_user: "ubuntu"
```

---

## Complete Workflow Example

Here is a complete Ch-obolo demonstrating Pelago IaC, SOPS secrets, Dynamic Fleet Setup, and Role Apply (this took too long to test, please read):

```yaml
# ch-obolo.yml
pelago:
  - name: "web-server"
    isle: "aws-ec2"
    config:
      instance_type: "t3.small"
      ami: "ami-0c55b159cbfafe1f0"
      key_name: "prod-deployer"
    exports:
      hosts:
        web-server:
          ssh_hostname: "203.0.113.10"
          ssh_user: "ubuntu"
          ssh_port: 22

packages:
  - nginx
  - htop
  - ufw

users:
  - name: "dexmachina" # <~ since this role uses secrets to get the user password, it will also decrypt the secrets in memory
    shell: "zsh"
    sudo: true
```

### Step 1: Preview the infrastructure plan
```bash
chaos provision preview dev my-infra -s
```

### Step 2: Provision infrastructure and configure roles in one command
```bash
chaos provision up dev my-infra -s -A packages users
```

### Step 3: Destroy infrastructure when no longer needed
```bash
chaos provision down dev my-infra -y
```

---

## Environment Variables

Pelago relies on standard environment variables to control state storage backends, encryption passphrases, cloud provider authentication, and web dashboard integration.

### 1. State Backend & Encryption
- `PULUMI_BACKEND_URL`: State backend location. Defaults to local disk (`file://~/.pulumi/backend`). Set to `s3://`, `gs://`, `azblob://` for remote object storage, or leave empty `""` when using Pulumi Cloud SaaS.

- `PULUMI_CONFIG_PASSPHRASE`: Passphrase used to encrypt stack configuration and secrets in self-managed backends (local, S3, GCS).

- `PULUMI_CONFIG_PASSPHRASE_FILE`: Path to a file containing the passphrase instead of exposing it in shell history.

### 2. Pulumi Cloud (Web Dashboard)
- `PULUMI_ACCESS_TOKEN`: API token for [app.pulumi.com](https://app.pulumi.com). When set and `PULUMI_BACKEND_URL=""`, all executions, resource graphs, diffs, and timelines sync to the Pulumi Web Interface.

### 3. Cloud Provider Credentials
If not passed through SOPS secrets or Isle configurations, Pulumi automatically detects standard cloud environment variables required for the utilized infrastructure providers (AWS, GCP, Azure, etc.).

### 4. Engine & Plugin Cache
- `PULUMI_HOME`: Root directory for Pulumi runtime caches, binaries, and installed plugins (default: `~/.pulumi`).

- `PULUMI_SKIP_UPDATE_CHECK`: Set to `true` in CI/CD environments to disable automatic update checking.
