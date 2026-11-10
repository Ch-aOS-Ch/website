export interface ArchNode {
  id: string;
  kind?: 'stage' | 'store' | 'service' | 'engine' | 'security' | 'gateway';
  gridArea: string;
  pill?: string;
  pillVariant?: 'mint' | 'pink' | 'slate' | 'muted';
  title: string;
  subtitle: string;
  tags?: string[];
  badges?: string[];
  go?: string; // Sub-architecture view ID if it drills down
  details?: {
    howItWorks?: string;
    whyThisWay?: string[];
    technicalFacts?: string[];
    guarantees?: string[];
    codeSnippets?: { title: string; lang: string; code: string }[];
    relatedFiles?: string[];
    metrics?: { label: string; value: string; desc: string }[];
  };
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
  type?: 'exec' | 'data' | 'secret' | 'flow' | 'telemetry';
  bidirectional?: boolean;
}

export interface ArchZone {
  title: string;
  nodeIds: string[];
  variant?: 'solid' | 'dashed';
}

export interface ArchView {
  id: string;
  number?: number;
  title: string;
  kicker: string;
  lead: string;
  focusContext?: string;
  gridCols: string;
  gridAreas: string[];
  zones?: ArchZone[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  footerNote?: string;
}

export interface SystemArchitecture {
  id: string;
  title: string;
  subtitle: string;
  systemName: string;
  description: string;
  overviewViewId: string;
  views: Record<string, ArchView>;
}
