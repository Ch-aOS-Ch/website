# Ch-aOS Language & Format Specifications

Comprehensive specification guide for Ch-aOS declarative formats, infrastructure blueprints, fleet definitions, and design system tokens.

---

## 1. Ch-obolo Format (System State Declarations)

A **Ch-obolo** is the declarative single source of truth for machine state. It uses YAML parsed via OmegaConf.

* **Schema**: [`ch-obolo.schema.json`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/specs/ch-obolo.schema.json)
* **Sample**: [`ch-obolo.spec.yaml`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/specs/ch-obolo.spec.yaml)

```yaml
hostname: "ch-workstation-01"
timezone: "America/Sao_Paulo"
locale: "en_US.UTF-8"

users:
  - name: "dex"
    shell: "/bin/zsh"
    sudo: true
    groups: [wheel, docker]

packages:
  - git
  - neovim
  - tmux
```

---

## 2. Pelago Isle Format (Infrastructure as Code)

**Pelago** blueprints define virtualized and cloud resources provisioned via `chaos provision`.

* **Schema**: [`pelago-isle.schema.json`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/specs/pelago-isle.schema.json)
* **Sample**: [`pelago-isle.spec.yaml`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/specs/pelago-isle.spec.yaml)

```yaml
apiVersion: "pelago.chaos/v1"
kind: "Isle"
metadata:
  name: "staging-cluster-node"
  provider: "proxmox"
spec:
  resources:
    - name: "k3s-master-01"
      type: "compute.vm"
      properties:
        cores: 4
        memory_mb: 8192
```

---

## 3. Boat Fleet Inventory Format

**Boats** define multi-host inventories for agentless orchestration with `chaos apply --fleet`.

* **Schema**: [`boat-inventory.schema.json`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/specs/boat-inventory.schema.json)
* **Sample**: [`boat-inventory.spec.yaml`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/specs/boat-inventory.spec.yaml)

```yaml
boats:
  - name: "boat-styx-01"
    host: "10.0.10.21"
    port: 22
    user: "dex"
    tags: [edge, gateway]
```

---

## 4. Soul Extension Manifest Format

**Souls** are modular plugin packages extending Ch-aOS functionality via Python entrypoints.

* **Schema**: [`soul-manifest.schema.json`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/specs/soul-manifest.schema.json)

---

## 5. Design System Tokens

Design system tokens are exported in machine-readable formats for TUI, Web, and IDE integrations:
* **JSON Tokens**: [`design-tokens.json`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/specs/design-tokens.json)
* **YAML Tokens**: [`design-tokens.yaml`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/specs/design-tokens.yaml)
* **CSS Variables**: [`design-tokens.css`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/specs/design-tokens.css)
* **Visual Reference Card**: [`color-palette.svg`](file:///home/dexmachina/projetos/Ch-aOS/Ch-aOS/website/public/color-palette.svg)
