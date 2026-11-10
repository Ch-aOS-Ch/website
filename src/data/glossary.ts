export interface GlossaryEntry {
  term: string;
  pronunciation?: string;
  definition: string;
  comparison?: string;
  analogy?: string;
  link?: string;
  theme?: 'mint' | 'pink';
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  'ch-aos': {
    term: 'Ch-aOS',
    pronunciation: 'Pronounced "Kaos"',
    definition: 'Open-source suite that unifies IaC, agentless CM, and Secret Management into a single programmable workflow. Inspired by Greek mythology and UNIX "change" commands (chown, chmod).',
    comparison: 'Like Ansible + Terraform + SOPS unified into a single engine.',
    theme: 'mint',
  },
  'ch-obolo': {
    term: 'Ch-obolo',
    pronunciation: 'The coin paid to Charon',
    definition: 'Pure declarative YAML data file representing the single source of truth for the entire OS, systems, and fleets. Completely decoupled from execution logic.',
    comparison: 'Think of it as config/state files for the entire OS, like Ansible playbooks but pure declarative data.',
    theme: 'mint',
  },
  'pelago': {
    term: 'Pelago',
    pronunciation: 'The Archipelago',
    definition: 'Ch-aOS\' Infrastructure as Code (IaC) engine, powered by Pulumi Automation API. Provisions cloud and virtualized infrastructure declaratively and immediately applies configuration roles.',
    comparison: 'Terraform / Pulumi, but unified directly with configuration management.',
    theme: 'mint',
  },
  'isle': {
    term: 'Isle(s)',
    definition: 'Blueprints and composite infrastructure components packaged as Souls (e.g. chaosmox Proxmox VMs, aws-ec2, gcp-compute).',
    comparison: 'Terraform modules or Pulumi ComponentResources, but discoverable via Ch-aOS.',
    theme: 'mint',
  },
  'soul': {
    term: 'Soul(s)',
    definition: 'Ch-aOS plugins written in Python used to extend any capability across the ecosystem.',
    comparison: 'Plugins / modules that extend the core system.',
    theme: 'mint',
  },
  'styx': {
    term: 'Styx',
    definition: 'Decentralized registry of Souls where you can discover, publish, and invoke plugins created by the community.',
    comparison: 'Ansible Galaxy or Terraform Registry, but decentralized.',
    theme: 'mint',
  },
  'roles': {
    term: 'Roles',
    definition: 'Soul Python/Pyinfra scripts that consume declarative Ch-obolo data and implement idempotent 3-stage changes on the system (get_context -> delta -> plan).',
    comparison: 'Ansible roles/modules, but written in typed, inspectable Python.',
    theme: 'mint',
  },
  'fleet': {
    term: 'Fleet',
    definition: 'A collection of hosts that share the same Ch-obolo. Defined in the Ch-obolo itself and controlled via restrictions.',
    comparison: 'Inventory groups in Ansible.',
    theme: 'mint',
  },
  'boats': {
    term: 'Boats',
    definition: 'Soul Python scripts used to generate dynamic inventories and fleets at runtime.',
    comparison: 'Dynamic inventory scripts in Ansible.',
    theme: 'mint',
  },
  'logbook': {
    term: 'Logbook',
    definition: 'Ch-aOS observability and monitoring system that collects structured execution data from Roles and stores it in Limani.',
    comparison: 'Structured audit log & monitoring daemon.',
    theme: 'mint',
  },
  'limani': {
    term: 'Limani',
    pronunciation: 'Greek for Harbor / Safe Port',
    definition: 'Soul database engine used by the Logbook to store observability and execution logs (SQLite locally, PostgreSQL remotely).',
    comparison: 'Audit database backend for execution history.',
    theme: 'mint',
  },
  'black_tags': {
    term: 'black_tags',
    definition: 'Restriction mechanism in the Ch-obolo preventing dangerous roles (like cluster bootstrapping) from executing on protected nodes (like your workstation).',
    comparison: 'Negative execution filters and safety guards.',
    theme: 'mint',
  },
  'restrictions': {
    term: 'Restrictions',
    definition: 'Field in the Ch-obolo that restricts role execution to specific hosts, tags, or execution environments.',
    comparison: 'Tag filters and conditional guards in CM tools.',
    theme: 'mint',
  },
  'secret-providers': {
    term: 'Secret Provider(s)',
    pronunciation: 'Ephemeral Vault Bridge',
    definition: 'Plugins that authenticate with external password managers (like Bitwarden or 1Password) to fetch the master decryption key directly into volatile RAM (/dev/shm) during execution.',
    comparison: 'Like External Secrets Operator or Vault Agent, but agentless and strictly zero-disk.',
    analogy: 'Like External Secrets Operator or Vault Agent, but agentless and strictly zero-disk.',
    link: '/commands/secrets/',
    theme: 'mint',
  },
};
