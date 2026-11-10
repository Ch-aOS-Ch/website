import type { SystemArchitecture } from './types';

export const applyArchitecture: SystemArchitecture = {
  id: 'apply',
  title: 'Architecture · chaos apply',
  subtitle: 'Declarative Role Execution, 3-Stage Lifecycle & Microkernel Lazy Dispatch',
  systemName: 'Ch-aOS Apply Core',
  description: 'The end-to-end execution pipeline: lazy module loading, declarative Ch-obolo state, centralized set-theoretic delta resolution, Pyinfra API batch dispatch, and Limani audit telemetry.',
  overviewViewId: 'overview',
  views: {
    overview: {
      id: 'overview',
      title: 'How chaos apply Works',
      kicker: 'Overview · System Pipeline',
      lead: 'An agentless Green Configuration Management pipeline. It combines a lazy-loading microkernel, zero-disk volatile secrets, Pyinfra API command dispatching, centralized in-memory delta resolution via set theory, and real-time Limani audit telemetry — eliminating redundant syscalls and reducing CPU idle-wait energy waste.',
      gridCols: 'repeat(3, minmax(0, 1fr))',
      gridAreas: [
        'spec secrets fleet',
        'phase_inspect phase_delta phase_plan',
        'logbook limani infra',
      ],
      zones: [
        {
          title: '1 · Inputs',
          nodeIds: ['node-spec', 'node-secrets', 'node-fleet'],
        },
        {
          title: '2 · 3-Stage Delta-Driven Engine',
          nodeIds: ['node-phase-inspect', 'node-phase-delta', 'node-phase-plan'],
        },
        {
          title: '3 · Target Fleet & Audit Telemetry',
          nodeIds: ['node-infra', 'node-limani', 'node-logbook'],
        },
      ],
      nodes: [
        {
          id: 'node-spec',
          kind: 'store',
          gridArea: 'spec',
          pill: 'Specification & Discovery',
          pillVariant: 'mint',
          title: 'Ch-obolo & Lazy Discovery',
          subtitle: 'Declarative desired-state YAML (ch-obolo.yml) paired with on-demand dynamic role discovery via importlib.metadata.',
          tags: ['YAML', 'OmegaConf', 'Lazy Import', 'Entry Points'],
          badges: ['Input', 'Subsystem'],
          go: 'discovery_subsystem',
          details: {
            howItWorks: 'Evaluated by the configuration engine to resolve team scopes (company.team.group), target role tags, and variables. Instead of eager loading all modules at startup, Ch-aOS reads static entry-point metadata from installed .whl packages and defers module compilation (.load()) strictly until the requested role is invoked.',
            whyThisWay: [
              'Separates pure declaration from execution logic: operations are scripted in Python classes, but desired state data lives in YAML.',
              'Eliminates the initialization tax observed in traditional CM tools (Ansible, Pyinfra CLI), cutting median import time to ~41.3ms.',
              'Discovery mapping is cached locally in a single JSON file, reducing file system traversal across N plugins to a single read.',
            ],
            technicalFacts: [
              'Parsed via OmegaConf with support for recursive includes, team workspace inheritance, and Soul tag aliases (e.g. pkgs -> system_packages).',
              'Packaged and distributed as a self-contained PYZ archive in /opt to prevent host environment pollution.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/apply.py',
              'cli/src/chaos/lib/utils.py',
              'cli/src/chaos/lib/args/dataclasses.py',
            ],
            codeSnippets: [
              {
                title: 'ch-obolo.yml (Excerpt)',
                lang: 'yaml',
                code: 'hostname: "production-node-01"\nroles:\n  system_packages:\n    present:\n      - ripgrep\n      - zsh\n      - wireguard-tools\n  services:\n    enabled:\n      - thinkfan\n      - throttled',
              },
            ],
          },
        },
        {
          id: 'node-secrets',
          kind: 'security',
          gridArea: 'secrets',
          pill: 'Security Context',
          pillVariant: 'pink',
          title: 'Ephemeral RAM Secrets',
          subtitle: 'Decrypts credentials into temporary /dev/shm memory buffer via SOPS. Never touches physical NVMe/SSD storage.',
          tags: ['SOPS', '/dev/shm', 'Zero-Disk', 'tmpfs'],
          badges: ['RAM Only'],
          details: {
            howItWorks: 'Before roles execute, necessary age/PGP keys or credentials are unsealed from external vaults (Bitwarden, 1Password, Doppler, Infisical) into a temporary POSIX tmpfs mount (/dev/shm). Ch-aOS uses these credentials to decrypt the secrets and inject them in-memory into the role secrets dictionary.',
            whyThisWay: [
              'Protects sensitive passwords, SSH private keys, and API tokens from disk persistence, swap dumps, or SSD wear-leveling artifacts.',
              'Automatic cleanup: Python context manager guarantees unmount and memory zeroing even if an unhandled exception or SIGINT interrupts apply.',
            ],
            technicalFacts: [
              'Mount directory uses strict POSIX permissions 0600 readable only by current UID.',
              'Subsystem handles Shamir threshold key combinations (e.g. 2 of 3 keys required) seamlessly.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/secret_backends/utils.py',
              'cli/src/chaos/lib/secrets.py',
            ],
          },
        },
        {
          id: 'node-fleet',
          kind: 'gateway',
          gridArea: 'fleet',
          pill: 'Host Discovery',
          pillVariant: 'slate',
          title: 'Target Fleet Inventory',
          subtitle: 'Resolves execution targets: local localhost, SSH remote hosts, or dynamic cloud clusters discovered via Boats.',
          tags: ['Boats', 'Agentless'],
          badges: ['Fleet'],
          details: {
            howItWorks: 'Connects to remote hosts using native SSH agent multiplexing. Conducts connectivity health checks and inventory resolution. Supports sequential rolling updates (-e/--serial) or concurrent parallel execution (-N/--no-wait).',
            whyThisWay: [
              'Agentless architecture requires zero resident daemons or background processes on target servers.',
              'Translates orchestration directly into pure POSIX shell commands, bypassing remote Python interpreter startup overhead.',
            ],
            technicalFacts: [
              'Dynamic inventory discovery is extensible through Boats plugins (e.g. AWS EC2, Proxmox VM).',
              'Target nodes execute with full root/sudo privileges dynamically without leaving permanent operational traces.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/apply.py',
              'cli/src/chaos/lib/boats/base.py',
            ],
          },
        },
        {
          id: 'node-phase-inspect',
          kind: 'stage',
          gridArea: 'phase_inspect',
          pill: 'Phase 1 · get_context',
          pillVariant: 'mint',
          title: '1 · Context Fetching',
          subtitle: 'Executes role.get_context() on the control node. Batches state inspection queries via Pyinfra API without remote Python runtime.',
          tags: ['get_context()', 'Batch Fetching', 'Read-Only', 'Control Node'],
          badges: ['Subsystem'],
          go: 'lifecycle_subsystem',
          details: {
            howItWorks: 'The control node calls role.get_context(state, host, chobolo, secrets). Instead of iterative round-trip queries during execution, it dispatches a batched sequence of commands (e.g. package lists, file stats, service status) via the Pyinfra API to collect the target state in a single initialization phase.',
            whyThisWay: [
              'Strict isolation of inspection prevents side-effects during dry-runs and plan calculations.',
              'Batch collection reduces network round-trips and eliminates the redundant syscall overhead typical of traditional iterative tools.',
            ],
            technicalFacts: [
              'Strictly read-only: no state mutation is permitted within get_context().',
              'All role logic executes locally on the control node; remote nodes only execute raw POSIX shell queries.',
              'Sensitive values in secrets are tracked and automatically masked from logs.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/roles/role.py',
              'cli/src/chaos/lib/apply.py',
            ],
          },
        },
        {
          id: 'node-phase-delta',
          kind: 'stage',
          gridArea: 'phase_delta',
          pill: 'Phase 2 · delta',
          pillVariant: 'pink',
          title: '2 · Centralized Delta Resolution',
          subtitle: 'Pure set-theoretic state drift calculation in control node memory.',
          tags: ['delta()', 'Dry-Run Gate'],
          badges: ['Subsystem'],
          go: 'lifecycle_subsystem',
          details: {
            howItWorks: 'Computes state drift entirely in the control node CPU cache using set theory. Presence checks use relative set complements (I = D \\ C); complex configurations (users, permissions, files) evaluate structural equality C(e) = D(e). Returns a typed Delta(to_add, to_remove, metadata) object.',
            whyThisWay: [
              'Delegating structural evaluation to CPU memory reduces system calls by over 51% compared to Pyinfra and 58% compared to Ansible.',
              'In dry-run mode (-d/--dry), execution halts here, displaying a clear ANSI visual diff without touching target hosts.',
              'Eliminates the "double idempotency check" penalty by calculating state centrally rather than repeatedly querying remote targets.',
            ],
            technicalFacts: [
              'Deterministic and reproducible: identical context + specification always yields the exact same Delta.',
              'No network or I/O calls permitted during delta calculation.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/roles/role.py',
              'cli/src/chaos/lib/args/dataclasses.py',
            ],
          },
        },
        {
          id: 'node-phase-plan',
          kind: 'stage',
          gridArea: 'phase_plan',
          pill: 'Phase 3 · plan',
          pillVariant: 'mint',
          title: '3 · Plan Stacking & Batch Dispatch',
          subtitle: 'Stacks Pyinfra operations into unified execution plans via add_op() and commits state changes in bulk.',
          tags: ['plan()', 'Plan Stacking'],
          badges: ['Subsystem'],
          go: 'lifecycle_subsystem',
          details: {
            howItWorks: 'Calls role.plan(state, host, delta) to queue operations (server.packages, files.directory, systemd.service) onto the Pyinfra State object. Returns a ResultPayload. Enqueued operations are then batch-dispatched across the fleet.',
            whyThisWay: [
              'Plan stacking aggregates operations to prevent iterative network degradation across remote hosts.',
              'Guaranteed idempotency: executing the plan when the target is already in the desired state produces zero operations.',
              'Translates orchestration into pure shell commands, bypassing remote Python interpreter startup.',
            ],
            technicalFacts: [
              'Operations execute with rollback awareness where supported by OS backends.',
              'Streams real-time operation hashes, exit codes, and diffs to the Logbook queue.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/roles/role.py',
              'cli/src/chaos/lib/apply.py',
            ],
          },
        },
        {
          id: 'node-infra',
          kind: 'service',
          gridArea: 'infra',
          pill: 'Target Fleet',
          pillVariant: 'slate',
          title: 'Agentless Target Fleet',
          subtitle: 'Pure shell execution over SSH or local shell. Linux workstations, hypervisors, and cloud VMs with zero remote Python runtime.',
          tags: ['Pure Shell'],
          badges: ['Endpoints'],
          details: {
            howItWorks: 'Receives streaming shell operations over encrypted SSH tunnels or local subprocess pipes. Does NOT require Python on the target host, unlike Ansible Ansiballz payloads.',
            whyThisWay: [
              'Zero agent and zero remote runtime footprint leaves target machines clean and eliminates remote dependency vulnerabilities.',
              'Compatible with any POSIX system containing a standard shell (sh/bash) and SSH server.',
              'Bypassing remote Python initialization provides a tested structural advantage in target-node energy efficiency.',
            ],
            technicalFacts: [
              'Privilege escalation (sudo) is deferred to the final Pyinfra dispatch phase.',
              'Supports Arch Linux, Debian, Ubuntu, Alpine, Fedora, Proxmox VE, and container/VM instances.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/apply.py',
            ],
          },
        },
        {
          id: 'node-limani',
          kind: 'store',
          gridArea: 'limani',
          pill: 'Audit Storage',
          pillVariant: 'pink',
          title: 'Pluggable Limani Harbors',
          subtitle: 'Decoupled execution telemetry storage (default: chrima SQLite WAL, PostgreSQL, ClickHouse).',
          tags: ['chrima', 'SQLite WAL', 'PostgreSQL', 'Decoupled I/O'],
          badges: ['Subsystem', 'Storage'],
          go: 'logbook_subsystem',
          details: {
            howItWorks: 'Decouples telemetry persistence from role execution. Events in memory are sent through a thread-safe queue to a dedicated background writer thread, writing to local SQLite WAL (default chrima Soul) or external enterprise databases.',
            whyThisWay: [
              'Asynchronous background writer ensures zero I/O blocking during mission-critical role execution.',
              'Every state mutation is permanently recorded with timestamp, run ID, operator ID, and pre/post health checks.',
              'Provides complete audit trail for compliance (SOC 2, ISO 27001).',
            ],
            technicalFacts: [
              'Default chrima Soul stores in ~/.local/share/chaos/logbooks/logbook.db and ./chaos-logbook.json.',
              'Custom Limani Souls inherit from chaos.lib.limani.limani.Limani and register under chaos.limanis entry point.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/limani/limani.py',
              'cli/src/chaos/lib/limani/chrima.py',
            ],
          },
        },
        {
          id: 'node-logbook',
          kind: 'service',
          gridArea: 'logbook',
          pill: 'Observability & Metrics',
          pillVariant: 'slate',
          title: 'Logbook & Green Telemetry',
          subtitle: 'Granular per-operation latency percentiles, CPU/RAM metrics, secret masking, and ANSI/JSON export.',
          tags: ['Latency Percentiles', 'Health Checks'],
          badges: ['Subsystem', 'Observer'],
          go: 'logbook_subsystem',
          details: {
            howItWorks: 'Captures full execution telemetry: operation hashes, 1m/5m CPU load, RAM used vs total, latency percentiles (p50, p90, p95, p99), and diffs. Even logs runs where zero operations executed to verify desired-state stability.',
            whyThisWay: [
              'Operators get immediate, human-readable ANSI logbook verification (-l/--logbook).',
              'CI/CD pipelines can ingest JSON traces (-x/--export-logs) for automated verification.',
              'Empirically validated in CSBC SEMISH 2026: demonstrates 46.56% faster execution vs Pyinfra, 63.54% vs Ansible, cutting energy from ~175J to <90J.',
            ],
            technicalFacts: [
              'Sensitive strings matching decrypted secrets are automatically sanitized to [SENSITIVE DATA FILTERED].',
              'Captures pre-operation and post-operation health snapshots for anomaly detection.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/limani/logbook.py',
            ],
          },
        },
      ],
      edges: [
        { from: 'node-spec', to: 'node-phase-inspect', label: 'spec schema', type: 'data' },
        { from: 'node-secrets', to: 'node-phase-inspect', label: 'RAM keys', type: 'secret' },
        { from: 'node-fleet', to: 'node-phase-plan', label: 'host inventory', type: 'flow' },
        { from: 'node-phase-inspect', to: 'node-phase-delta', label: 'context dict', type: 'data' },
        { from: 'node-phase-delta', to: 'node-phase-plan', label: 'Delta(diff)', type: 'flow' },
        { from: 'node-phase-plan', to: 'node-infra', label: 'batch dispatch', type: 'exec' },
        { from: 'node-infra', to: 'node-limani', label: 'async queue', type: 'telemetry' },
        { from: 'node-limani', to: 'node-logbook', label: 'telemetry stream', type: 'telemetry' },
      ],
      footerNote: 'Sequential U-shaped pipeline: declarative inputs feed into the 3-stage engine, which applies state to targets via batch dispatch and streams audit telemetry into Limani.',
    },

    lifecycle_subsystem: {
      id: 'lifecycle_subsystem',
      number: 1,
      title: 'The 3-Stage Role Lifecycle',
      kicker: 'Subsystem · get_context → delta → plan',
      lead: 'Inside every Ch-aOS Role class: strict separation of fact gathering (get_context), pure functional set-theoretic diffing (delta), and idempotent mutation planning (plan).',
      gridCols: 'repeat(3, minmax(0, 1fr))',
      gridAreas: [
        'context delta plan',
        'facts diff mutations',
      ],
      zones: [
        {
          title: 'Execution Lifecycle Phases',
          nodeIds: ['role-context', 'role-delta', 'role-plan'],
        },
        {
          title: 'Data & Operation Artifacts',
          nodeIds: ['art-facts', 'art-diff', 'art-mutations'],
        },
      ],
      nodes: [
        {
          id: 'role-context',
          kind: 'stage',
          gridArea: 'context',
          pill: 'Phase 1 · Read-Only',
          pillVariant: 'mint',
          title: 'role.get_context(state, host, chobolo, secrets)',
          subtitle: 'Gathers target state. Strictly read-only query inspecting packages, files, or services via Pyinfra API.',
          tags: ['get_context()', 'Pyinfra Facts', 'Batched'],
          badges: ['Phase 1'],
          details: {
            howItWorks: 'The control node calls get_context() passing Pyinfra state, host, filtered Ch-obolo configuration, and decrypted secrets. Dispatches fact extractors (server.Packages, files.File, systemd.ServiceStatus) over SSH in a single batched sequence.',
            whyThisWay: [
              'Zero side-effects during inspection: cannot modify target host state.',
              'Batched queries prevent iterative back-and-forth round-trips.',
              'Executes in user space on the control node without needing a remote Python runtime.',
            ],
            codeSnippets: [
              {
                title: 'role.get_context Implementation',
                lang: 'python',
                code: 'def get_context(\n    self,\n    state: State,\n    host: Host,\n    chobolo: dict[str, Any] = {},\n    secrets: dict[str, Any] = {},\n) -> dict[str, Any]:\n    installed = host.get_fact(server.Packages) or {}\n    target_pkgs = chobolo.get("packages", [])\n    return {\n        "installed_pkgs": set(installed.keys()),\n        "desired_pkgs": set(target_pkgs),\n    }',
              },
            ],
            relatedFiles: ['cli/src/chaos/lib/roles/role.py'],
          },
        },
        {
          id: 'role-delta',
          kind: 'stage',
          gridArea: 'delta',
          pill: 'Phase 2 · Set Theory Logic',
          pillVariant: 'pink',
          title: 'role.delta(context)',
          subtitle: 'Pure set-theoretic state drift calculation in control node memory. Evaluates presence and structural equality.',
          tags: ['delta()', 'Pure Function', 'Set Theory', 'Dry-Run Gate'],
          badges: ['Phase 2'],
          details: {
            howItWorks: 'Compares gathered context against desired state in CPU cache. Resolves presence checks via relative set complement (I = D \\ C) and complex attributes via structural equality. Returns a typed Delta(to_add, to_remove, metadata).',
            whyThisWay: [
              'Dry-run mode stops here. If delta is empty, execution terminates safely with zero side effects.',
              'In-memory resolution prevents unnecessary remote queries and reduces system calls by over 51%.',
              'Eliminates configuration drift before any mutation is enqueued.',
            ],
            codeSnippets: [
              {
                title: 'role.delta Implementation',
                lang: 'python',
                code: 'def delta(self, context: dict[str, Any] = {}) -> Delta:\n    desired = context.get("desired_pkgs", set())\n    installed = context.get("installed_pkgs", set())\n    to_add = sorted(list(desired - installed))\n    to_remove = sorted(list(installed - desired))\n    return Delta(\n        to_add={"packages": to_add},\n        to_remove={"packages": to_remove},\n        metadata={},\n    )',
              },
            ],
            relatedFiles: [
              'cli/src/chaos/lib/roles/role.py',
              'cli/src/chaos/lib/args/dataclasses.py',
            ],
          },
        },
        {
          id: 'role-plan',
          kind: 'stage',
          gridArea: 'plan',
          pill: 'Phase 3 · Idempotent Apply',
          pillVariant: 'mint',
          title: 'role.plan(state, host, delta)',
          subtitle: 'Stacks Pyinfra operations onto execution graph using add_op(). Returns typed ResultPayload.',
          tags: ['plan()', 'add_op()', 'Plan Stacking', 'ResultPayload'],
          badges: ['Phase 3'],
          details: {
            howItWorks: 'Translates computed Delta into Pyinfra operations (server.packages, files.directory, systemd.service) using add_op(state, op_func, ...). Returns ResultPayload(success=True, ...).',
            whyThisWay: [
              'Pyinfra manages low-level OS differences and POSIX command translation.',
              'Unified execution plans are applied in bulk (batch dispatch), preventing iterative network degradation.',
              'Running plan twice against converged infrastructure yields zero queued operations.',
            ],
            codeSnippets: [
              {
                title: 'role.plan Implementation',
                lang: 'python',
                code: 'def plan(\n    self,\n    state: State,\n    host: Host,\n    delta: Delta = Delta(),\n) -> ResultPayload:\n    for pkg in delta.to_add.get("packages", []):\n        add_op(state, server.packages, name=f"Install {pkg}", packages=[pkg], present=True)\n    for pkg in delta.to_remove.get("packages", []):\n        add_op(state, server.packages, name=f"Remove {pkg}", packages=[pkg], present=False)\n    return ResultPayload(success=True, message=["Packages planned successfully"])',
              },
            ],
            relatedFiles: [
              'cli/src/chaos/lib/roles/role.py',
              'cli/src/chaos/lib/args/dataclasses.py',
            ],
          },
        },
        {
          id: 'art-facts',
          kind: 'store',
          gridArea: 'facts',
          pill: 'Data Container',
          pillVariant: 'slate',
          title: 'Context Dictionary',
          subtitle: 'In-memory state snapshot gathered during the single batched inspection phase.',
          tags: ['Dictionary', 'In-Memory', 'Read-Only'],
          details: {
            howItWorks: 'Holds serialized representation of target facts (packages, service states, config file hashes) for pure set-theoretic diffing.',
          },
        },
        {
          id: 'art-diff',
          kind: 'store',
          gridArea: 'diff',
          pill: 'Diff Object',
          pillVariant: 'pink',
          title: 'Delta(to_add, to_remove, metadata)',
          subtitle: 'Structured diff object containing typed addition and removal dictionaries. Rendered as ANSI visual tree.',
          tags: ['Delta Dataclass', 'Auditable', 'Zero-Drift'],
          details: {
            howItWorks: 'Encapsulates exact changes to be performed. Rendered as colored ANSI tree in CLI and stored permanently in Logbook history.',
          },
        },
        {
          id: 'art-mutations',
          kind: 'service',
          gridArea: 'mutations',
          pill: 'Execution Result',
          pillVariant: 'mint',
          title: 'Batch Dispatch Commit',
          subtitle: 'Unified Pyinfra execution plan applied in bulk over SSH/local shell and verified via exit codes.',
          tags: ['Pyinfra Ops', 'POSIX Exit Codes', 'Audit Verified'],
          details: {
            howItWorks: 'Executes via SSH and records change status, duration, and diffs into Limani journal via background queue.',
          },
        },
      ],
      edges: [
        { from: 'role-context', to: 'art-facts', label: 'emits facts', type: 'data' },
        { from: 'art-facts', to: 'art-diff', label: 'facts input', type: 'data' },
        { from: 'role-delta', to: 'art-diff', label: 'computes diff', type: 'flow' },
        { from: 'art-diff', to: 'art-mutations', label: 'Delta(diff)', type: 'flow' },
        { from: 'role-plan', to: 'art-mutations', label: 'stacks ops', type: 'exec' },
      ],
      footerNote: 'Each stage has exactly one responsibility. Inspection never modifies; delta never executes remote queries; plan only stacks operations into unified batches.',
    },

    discovery_subsystem: {
      id: 'discovery_subsystem',
      number: 2,
      title: 'Microkernel & Lazy Import Dispatch',
      kicker: 'Subsystem · Entry Points → Static Metadata → Deferred .load()',
      lead: 'Ch-aOS implements a microkernel architecture where all non-essential functionality is modular and loaded strictly on-demand. By reading static wheel metadata via importlib.metadata and caching plugin discovery in a single JSON file, Ch-aOS eliminates the initialization tax of eager loading.',
      gridCols: 'repeat(3, minmax(0, 1fr))',
      gridAreas: [
        'disc_entry disc_cache disc_loader',
        'disc_deps disc_registry disc_bench',
      ],
      zones: [
        {
          title: 'Plugin Discovery & Lazy Compilation',
          nodeIds: ['disc-entry', 'disc-cache', 'disc-loader'],
        },
        {
          title: 'Ecosystem Trust & Green Computing Impact',
          nodeIds: ['disc-deps', 'disc-registry', 'disc-bench'],
        },
      ],
      nodes: [
        {
          id: 'disc-entry',
          kind: 'gateway',
          gridArea: 'disc_entry',
          pill: 'Packaging & Entry Points',
          pillVariant: 'mint',
          title: 'Standard Entry Points & PYZ',
          subtitle: 'Modular Souls packaged as Wheel files (.whl) registering under standard chaos.* entry points in a self-contained PYZ.',
          tags: ['pyproject.toml', 'chaos.roles'],
          badges: ['Packaging'],
          details: {
            howItWorks: 'Souls define entry points under namespaces such as "chaos.roles", "chaos.limanis", "chaos.providers", and "chaos.boats" in their pyproject.toml. The entire suite is distributed as a self-contained PYZ archive in /opt/chaos to avoid polluting host environment.',
            whyThisWay: [
              'Microkernel architecture dictates that all non-essential functionality must be modular and pluggable.',
              'Self-contained packaging prevents Python dependency conflicts across target distributions.',
            ],
            technicalFacts: [
              'Role entry point registration format: [project.entry-points."chaos.roles"] tag_name = "module.path:RoleClass".',
              'Managed through Ch-aOS Styx package manager.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/utils.py',
              'cli/src/chaos/lib/apply.py',
            ],
          },
        },
        {
          id: 'disc-cache',
          kind: 'store',
          gridArea: 'disc_cache',
          pill: 'Metadata Cache',
          pillVariant: 'slate',
          title: 'Single-File Discovery Cache',
          subtitle: 'Static metadata cached locally in a single JSON file, reducing filesystem traversal across N plugins to a single read.',
          tags: ['plugins.json', 'I/O Reduction'],
          badges: ['Cache'],
          details: {
            howItWorks: 'Instead of running arbitrary Python code to inspect installed plugins, Ch-aOS reads the static metadata generated during wheel installation and caches entry-point mappings into a local JSON cache file.',
            whyThisWay: [
              'Drastically reduces open(), read(), and stat() system calls during command startup.',
              'Prevents CPU idle-wait states caused by scanning large site-packages directories.',
            ],
            technicalFacts: [
              'Validates cache freshness against wheel installation timestamps.',
              'Mitigates startup I/O overhead on low-power devices and container environments.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/utils.py',
            ],
          },
        },
        {
          id: 'disc-loader',
          kind: 'stage',
          gridArea: 'disc_loader',
          pill: 'Dynamic Dispatch',
          pillVariant: 'pink',
          title: 'Dynamic Import Dispatcher',
          subtitle: 'Deferred code compilation: .load() is strictly invoked only for roles explicitly specified in command tags.',
          tags: ['importlib.metadata', '.load()', 'Deferred Loading'],
          badges: ['Dispatcher'],
          details: {
            howItWorks: 'Function _load_role_eps(tags) matches CLI arguments against the entry-point map. Only matching plugin classes are compiled into memory via entry_point.load() and instantiated.',
            whyThisWay: [
              'If the user runs "chaos apply pkgs", modules for users, docker, firewalls, and storage are NEVER imported or compiled.',
              'Solves the fundamental Green Computing flaw of traditional tools (Ansible, Pyinfra CLI) that load all modules regardless of context.',
            ],
            codeSnippets: [
              {
                title: '_load_role_eps Dispatcher',
                lang: 'python',
                code: 'def _load_role_eps(role_names: list[str]) -> ResultPayload[dict[str, Role]]:\n    role_eps = get_roleEps()\n    ep_map = {ep.name: ep for ep in role_eps}\n    loaded_roles = {}\n    for role_name in role_names:\n        if role_name in ep_map:\n            # Code compilation deferred until this exact call:\n            loaded_role_cls = ep_map[role_name].load()\n            loaded_roles[role_name] = loaded_role_cls()\n    return ResultPayload(success=True, data=loaded_roles)',
              },
            ],
            relatedFiles: [
              'cli/src/chaos/lib/apply.py',
              'cli/src/chaos/lib/utils.py',
            ],
          },
        },
        {
          id: 'disc-deps',
          kind: 'service',
          gridArea: 'disc_deps',
          pill: 'Dependency Isolation',
          pillVariant: 'slate',
          title: 'Lazy Heavy Dependencies',
          subtitle: 'Heavy internal dependencies (Rich, cryptography, cloud SDKs) are strictly imported inside handler scopes.',
          tags: ['Rich', 'Cryptography', 'Cloud SDKs', 'Deferred'],
          badges: ['Optimization'],
          details: {
            howItWorks: 'Imports of resource-intensive libraries are moved inside functions or behind TYPE_CHECKING guards, preventing startup latency when executing simple tasks or dry-runs.',
            whyThisWay: [
              'Keeps baseline CLI startup instant and predictable.',
              'Ensures minimal memory allocation in headless or automated CI/CD runners.',
            ],
            technicalFacts: [
              'Aligns with Python PEP 810 (Explicit lazy imports) standardizing industry-wide deferred module loading.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/apply.py',
              'cli/src/chaos/lib/roles/role.py',
            ],
          },
        },
        {
          id: 'disc-registry',
          kind: 'security',
          gridArea: 'disc_registry',
          pill: 'Ecosystem Trust',
          pillVariant: 'pink',
          title: 'Wheel Registry & Trust Policies',
          subtitle: 'Cryptographic signatures, SHA256 checksums, and automated pip-audit vulnerability checks.',
          tags: ['pip-audit', 'SHA256', 'Signatures', 'Supply Chain'],
          badges: ['Security'],
          details: {
            howItWorks: 'Plugins accepted into the Ch-aOS ecosystem must comply with 5 strict rules: (1) fully open-source; (2) verified cryptographic signatures; (3) distributed exclusively as pre-built .whl files; (4) mandatory SHA256 checksums; (5) automated pip-audit vulnerability scans.',
            whyThisWay: [
              'Protects infrastructure automation against supply chain poisoning and malicious wheel injection.',
              'Ensures consistent reproducible builds across heterogeneous nodes.',
            ],
            technicalFacts: [
              'Enforced during installation via chaos styx plugin management.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/styx/styx.py',
            ],
          },
        },
      ],
      edges: [
        { from: 'disc-entry', to: 'disc-cache', label: 'static metadata', type: 'data' },
        { from: 'disc-cache', to: 'disc-loader', label: 'cached mapping', type: 'data' },
        { from: 'disc-loader', to: 'disc-deps', label: 'imports on demand', type: 'flow' },
        { from: 'disc-registry', to: 'disc-entry', label: 'verified .whl', type: 'secret' },
        { from: 'disc-loader', to: 'disc-bench', label: 'verified metrics', type: 'telemetry' },
      ],
      footerNote: 'Deferred execution pipeline: wheel static metadata enables dynamic import dispatch without executing Python code, slashing startup syscalls and idle-wait power draw.',
    },

    logbook_subsystem: {
      id: 'logbook_subsystem',
      number: 3,
      title: 'Logbook Telemetry & Pluggable Limani Harbors',
      kicker: 'Subsystem · In-Memory Queue → Background Writer → Pluggable Limani',
      lead: 'The Ch-aOS Logbook decouples observability from execution performance. Telemetry events are collected in memory and streamed via a thread-safe queue to a dedicated background writer thread, persisting to local SQLite WAL or remote databases without blocking role execution.',
      gridCols: 'repeat(3, minmax(0, 1fr))',
      gridAreas: [
        'lb_collector lb_filter lb_queue',
        'lb_chrima lb_plugins lb_stats',
      ],
      zones: [
        {
          title: 'Telemetry Capture & Sanitization',
          nodeIds: ['lb-collector', 'lb-filter', 'lb-queue'],
        },
        {
          title: 'Pluggable Persistence & Statistical Analytics',
          nodeIds: ['lb-chrima', 'lb-plugins', 'lb-stats'],
        },
      ],
      nodes: [
        {
          id: 'lb-collector',
          kind: 'gateway',
          gridArea: 'lb_collector',
          pill: 'Event Collector',
          pillVariant: 'mint',
          title: 'Runtime Telemetry Collector',
          subtitle: 'Captures per-operation outcomes, exact shell commands, fact histories, and host health checks.',
          tags: ['Operations', 'Fact History', 'Health Checks'],
          badges: ['Collector'],
          details: {
            howItWorks: 'Binds into the Pyinfra state machine and execution loop. For each operation and fact check, captures timestamps, hashes, stdout/stderr, retry counts, and pre/post host resource metrics (CPU load 1m/5m, RAM usage GB and %).',
            whyThisWay: [
              'Provides complete observability without requiring operators to parse unwieldy verbose logs.',
              'Even logs runs where no operations executed ("no ops") to certify that the infrastructure is stable and compliant.',
            ],
            technicalFacts: [
              'Health checks capture 1-minute and 5-minute CPU load averages and memory utilization before and after operations.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/limani/logbook.py',
            ],
          },
        },
        {
          id: 'lb-filter',
          kind: 'security',
          gridArea: 'lb_filter',
          pill: 'Data Sanitization',
          pillVariant: 'pink',
          title: 'Secret Masking Filter',
          subtitle: 'Automatically detects decrypted credentials and sanitizes log streams to [SENSITIVE DATA FILTERED].',
          tags: ['Sanitization', 'Zero-Leak', 'Compliance'],
          badges: ['Security'],
          details: {
            howItWorks: 'Tracks plaintext secret values loaded from volatile RAM and applies real-time regex/token filtering across command strings, stdout, stderr, and configuration diffs.',
            whyThisWay: [
              'Prevents accidental leakage of passwords, private keys, or API tokens into audit journals, JSON dumps, or shared observability dashboards.',
            ],
            technicalFacts: [
              'Replaces sensitive occurrences with the exact marker [SENSITIVE DATA FILTERED].',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/limani/logbook.py',
            ],
          },
        },
        {
          id: 'lb-queue',
          kind: 'stage',
          gridArea: 'lb_queue',
          pill: 'Async Decoupling',
          pillVariant: 'slate',
          title: 'In-Memory Telemetry Queue',
          subtitle: 'Thread-safe event queue feeding a dedicated background writer thread (_db_writer_thread).',
          tags: ['Queue', 'Worker Thread', 'Lock-Free'],
          badges: ['Async Core'],
          details: {
            howItWorks: 'Execution threads push structured telemetry events into a memory queue. A dedicated background daemon thread (_db_writer_thread) consumes events and writes them to the configured Limani storage backend.',
            whyThisWay: [
              'Decouples database I/O from role execution, guaranteeing zero disk latency penalties on infrastructure convergence.',
              'Ensures all pending events are cleanly flushed on process teardown or unexpected interruptions.',
            ],
            technicalFacts: [
              'Implements graceful flush during teardown_pyinfra lifecycle phase.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/limani/logbook.py',
              'cli/src/chaos/lib/apply.py',
            ],
          },
        },
        {
          id: 'lb-chrima',
          kind: 'store',
          gridArea: 'lb_chrima',
          pill: 'Default Storage',
          pillVariant: 'mint',
          title: 'chrima SQLite WAL Soul',
          subtitle: 'Default built-in Limani Soul persisting execution records to SQLite Write-Ahead Log and local JSON.',
          tags: ['JSON Trace', 'Local DB'],
          badges: ['Default Harbor'],
          details: {
            howItWorks: 'Persists records to ~/.local/share/chaos/logbooks/logbook.db with SQLite Write-Ahead Logging (WAL) enabled for concurrent lock-free writes, and creates ./chaos-logbook.json in the working directory.',
            whyThisWay: [
              'Zero-configuration out of the box: works immediately without external database dependencies.',
              'WAL mode ensures fast concurrent writes without database locking errors.',
            ],
            technicalFacts: [
              'Named after Chrima (Χρήμα - money/coin to pay Charon at the harbor Limani).',
              'Maintains complete historical runs index with human-readable run IDs (e.g. chaos-2026/01/26-21:29:13).',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/limani/chrima.py',
            ],
          },
        },
        {
          id: 'lb-plugins',
          kind: 'service',
          gridArea: 'lb_plugins',
          pill: 'Enterprise Backends',
          pillVariant: 'pink',
          title: 'Pluggable Limani Harbors',
          subtitle: 'Extensible database souls streaming execution journals to PostgreSQL, MySQL, ClickHouse, or ElasticSearch.',
          tags: ['chaos.limanis', 'PostgreSQL', 'Enterprise Audit'],
          badges: ['Extensible'],
          details: {
            howItWorks: 'Third-party Limani plugins inherit from chaos.lib.limani.limani.Limani and register under the "chaos.limanis" entry point. Selected via --limani <plugin> or configured in ~/.config/chaos/config.yml.',
            whyThisWay: [
              'Enables distributed enterprise fleets to centralize audit telemetry across thousands of workstations and servers into a single data lake.',
            ],
            technicalFacts: [
              'Base contract defines connect(), init_db(), create_run(), insert_snapshot(), insert_operation(), and get_run_summary_stats().',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/limani/limani.py',
            ],
          },
        },
        {
          id: 'lb-stats',
          kind: 'store',
          gridArea: 'lb_stats',
          pill: 'Analytics Engine',
          pillVariant: 'slate',
          title: 'Percentiles & Analytics',
          subtitle: 'Calculates statistical duration breakdowns: average, p50, p90, p95, and p99 duration per operation.',
          tags: ['p50/p90/p99', 'Timing Analytics', 'ANSI Logbook'],
          badges: ['Analytics'],
          details: {
            howItWorks: 'Aggregates operation runtimes to compute latency percentiles. Displays an interactive summary table (-l/--logbook) and exports full machine-readable telemetry (-x/--export-logs).',
            whyThisWay: [
              'Pinpoints slow operations, network jitter, or package repository lag across large fleets.',
              'Enables automated regression detection in CI/CD pipelines.',
            ],
            technicalFacts: [
              'Generates JSON reports compliant with versioned v1 telemetry schema.',
            ],
            relatedFiles: [
              'cli/src/chaos/lib/limani/logbook.py',
            ],
          },
        },
      ],
      edges: [
        { from: 'lb-collector', to: 'lb-filter', label: 'raw telemetry', type: 'telemetry' },
        { from: 'lb-filter', to: 'lb-queue', label: 'sanitized stream', type: 'telemetry' },
        { from: 'lb-queue', to: 'lb-chrima', label: 'async write', type: 'data' },
        { from: 'lb-queue', to: 'lb-plugins', label: 'external harbor', type: 'data' },
        { from: 'lb-chrima', to: 'lb-stats', label: 'persisted data', type: 'flow' },
      ],
      footerNote: 'Decoupled telemetry pipeline: runtime events are sanitized and buffered in memory before being persisted asynchronously by the background writer thread to SQLite WAL or external Limani harbors.',
    },
  },
};
