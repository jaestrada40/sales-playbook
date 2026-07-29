const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
).replace(/\/$/, '');

export type ApiUser = { id: string; email: string; name: string; role: string };
export type ApiAuthResponse = { user: ApiUser; accessToken: string };
export type ApiNode = {
  id: string;
  title: string;
  script: string;
  suggestedQuestion: string;
  type: string;
  sortOrder: number;
  branches?: { customerResponse: string; targetNodeId: string }[];
};
export type ApiSection = {
  id: string;
  title: string;
  sortOrder: number;
  nodes: ApiNode[];
};
export type ApiPlaybook = {
  id: string;
  title: string;
  description: string;
  language: string;
  industry: string;
  version: string;
  status: string;
  updatedAt: string;
  sections: ApiSection[];
};
export type ApiCall = {
  id: string;
  prospectName: string;
  businessName: string;
  durationSeconds: number;
  createdAt: string;
  outcome?: string;
  notes: string;
  playbook: { title: string };
};
export type ApiKnowledge = {
  id: string;
  type: string;
  title: string;
  category: string;
  content: string;
  language: string;
  tags: string[];
  updatedAt: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      body?.message ?? `Request failed with status ${response.status}`,
    );
  }
  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return request<ApiAuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getPlaybooks(accessToken: string) {
  return request<ApiPlaybook[]>('/playbooks', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export type SavePlaybookInput = {
  title: string;
  description: string;
  language: string;
  industry: string;
  version: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED';
  sections: Array<{
    title: string;
    sortOrder: number;
    nodes: Array<{
      id: string;
      title: string;
      script: string;
      suggestedQuestion: string;
      sortOrder: number;
      branches: Array<{ customerResponse: string; targetNodeId: string }>;
    }>;
  }>;
};

export function createPlaybook(
  accessToken: string,
  input: Pick<
    SavePlaybookInput,
    'title' | 'description' | 'language' | 'industry'
  >,
) {
  return request<ApiPlaybook>('/playbooks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(input),
  });
}

export function updatePlaybook(
  accessToken: string,
  id: string,
  input: SavePlaybookInput,
) {
  return request<ApiPlaybook>(`/playbooks/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(input),
  });
}

export function getCalls(accessToken: string) {
  return request<ApiCall[]>('/calls', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function getKnowledge(accessToken: string) {
  return request<ApiKnowledge[]>('/knowledge', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function startCall(
  accessToken: string,
  playbookId: string,
  prospectName: string,
  businessName: string,
  prospectId?: string,
  campaignId?: string,
  consentConfirmed?: boolean,
) {
  return request<{ id: string }>('/calls', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      playbookId,
      prospectName,
      businessName,
      prospectId,
      campaignId,
      consentConfirmed,
    }),
  });
}

export type ApiProspect = {
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
  status: string;
  attempts: number;
  doNotCall: boolean;
  consentStatus: string;
  campaign: { id: string; name: string; playbookId?: string };
  assignee?: { id: string; name: string };
  opportunity?: { stage: string; estimatedValue: number };
  tasks: Array<{ id: string; title: string; dueAt: string }>;
};
export type ApiCampaign = {
  id: string;
  name: string;
  description: string;
  direction: string;
  status: string;
  teamId: string;
  playbookId?: string;
  dailyCallGoal: number;
  _count: { prospects: number; calls: number };
  manager?: { id: string; name: string };
};
export type ApiOverview = {
  callsToday: number;
  attemptsToday: number;
  shortCallsToday: number;
  minimumValidDurationSeconds: number;
  meetingsToday: number;
  conversionRate: number;
  averageDurationSeconds: number;
  pipelineValue: number;
  opportunities: number;
  pendingTasks: number;
  prospectStatus: Array<{ status: string; count: number }>;
  agents: Array<{
    id: string;
    name: string;
    role: string;
    _count: { calls: number; assignedProspects: number };
  }>;
};
export type ApiTeam = {
  id: string;
  name: string;
  users: Array<{ id: string; name: string; email: string; role: string }>;
};

export const getOperationsOverview = (token: string) =>
  request<ApiOverview>('/operations/overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getProspects = (token: string) =>
  request<ApiProspect[]>('/operations/prospects', {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getCampaigns = (token: string) =>
  request<ApiCampaign[]>('/operations/campaigns', {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getTeams = (token: string) =>
  request<{ teams: ApiTeam[] }>('/operations/team', {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getCompliance = (token: string) =>
  request<
    Array<{
      id: string;
      jurisdiction: string;
      timezone: string;
      callingStartHour: number;
      callingEndHour: number;
      retentionDays: number;
      requireConsent: boolean;
      recordingEnabled: boolean;
    }>
  >('/operations/compliance', {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getAudit = (token: string) =>
  request<
    Array<{
      id: string;
      action: string;
      entityType: string;
      entityId: string;
      createdAt: string;
      actor: { name: string };
    }>
  >('/operations/audit', { headers: { Authorization: `Bearer ${token}` } });
export const updateProspect = (
  token: string,
  id: string,
  data: Record<string, unknown>,
) =>
  request(`/operations/prospects/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
export const importProspects = (
  token: string,
  campaignId: string,
  prospects: Array<Record<string, unknown>>,
) =>
  request<{ imported: number; blockedByDnc: number }>(
    '/operations/prospects/import',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ campaignId, prospects }),
    },
  );
export const createCampaign = (token: string, data: Record<string, unknown>) =>
  request('/operations/campaigns', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
export const saveCompliance = (token: string, data: Record<string, unknown>) =>
  request('/operations/compliance', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
export const purgeExpiredData = (token: string) =>
  request<{ cutoff: string; callsDeleted: number; auditDeleted: number }>(
    '/operations/compliance/purge',
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
  );
export const addDnc = (token: string, phone: string, reason: string) =>
  request('/operations/dnc', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ phone, reason }),
  });

export function finishCall(
  accessToken: string,
  callId: string,
  outcome: string,
  notes: string,
  durationSeconds: number,
  followUpAt?: string,
) {
  return request('/calls/' + callId + '/finish', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      outcome,
      notes,
      durationSeconds,
      followUpAt: followUpAt || undefined,
    }),
  });
}

export function updateCall(
  accessToken: string,
  callId: string,
  notes: string,
  durationSeconds: number,
) {
  return request(`/calls/${callId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ notes, durationSeconds }),
  });
}
