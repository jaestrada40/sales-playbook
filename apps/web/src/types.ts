export type ViewMode =
  | 'login'
  | 'dashboard'
  | 'call-assistant'
  | 'playbooks'
  | 'playbook-editor'
  | 'knowledge-base'
  | 'operations';

export type CallStageId =
  | 'apertura'
  | 'descubrimiento'
  | 'necesidades'
  | 'propuesta'
  | 'objeciones'
  | 'cierre';

export interface CallStage {
  id: CallStageId;
  name: string;
  description: string;
  script: string;
  suggestedQuestion: string;
  alternativeScript?: string;
  quickObjections: {
    id: string;
    trigger: string;
    responseScript: string;
    suggestedQuestion: string;
  }[];
}

export type CallOutcome =
  | 'no_contesto'
  | 'no_interesado'
  | 'seguimiento'
  | 'interesado'
  | 'cita_agendada';

export interface Prospect {
  id: string;
  businessName: string;
  contactName: string;
  role: string;
  phone: string;
  email: string;
  businessType: string;
  currentProvider: string;
  monthlyVolumeUSD: number;
  terminalCount: number;
  objective: string;
  mainPainPoint: string;
  address: string;
  tags: string[];
}

export interface ActiveCall {
  id: string;
  prospect: Prospect;
  startTime: Date;
  elapsedSeconds: number;
  currentStageId: CallStageId;
  isLiveTranscriptActive: boolean;
  notes: string;
  detectedPain: string;
  detectedProvider: string;
  detectedVolume: string;
  nextStep: string;
  stageProgress: Record<CallStageId, boolean>;
}

export interface PlaybookNode {
  id: string;
  stageId: CallStageId;
  title: string;
  script: string;
  suggestedQuestion: string;
  alternativeScript?: string;
  branches?: {
    customerResponse: string;
    targetNodeId: string;
  }[];
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  version: string;
  status: 'publicado' | 'borrador' | 'en_revision';
  language: 'Español' | 'Inglés';
  industry:
    | 'Restaurantes & Bares'
    | 'Retail'
    | 'Servicios Médicos'
    | 'E-Commerce'
    | 'General';
  conversionRate: number;
  usageCount: number;
  updatedAt: string;
  author: string;
  nodes: PlaybookNode[];
}

export type KBType =
  'faq' | 'objecion' | 'producto' | 'script' | 'caso_real' | 'nota';

export interface KBItem {
  id: string;
  title: string;
  type: KBType;
  category: string;
  content: string;
  keyTakeaway: string;
  tags: string[];
  timesUsed: number;
}

export interface CallLog {
  id: string;
  prospectName: string;
  businessName: string;
  phone: string;
  durationSeconds: number;
  timestamp: string;
  outcome: CallOutcome;
  playbookTitle: string;
  notes: string;
  dealValueEstimate?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Vendedor Senior' | 'Sales Lead' | 'Manager';
  todayCallsCount: number;
  todayMeetingsBooked: number;
  conversionRatePercent: number;
  apiRole: 'ADMIN' | 'MANAGER' | 'SELLER';
}
