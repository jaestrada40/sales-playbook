const API_BASE_URL = 'http://localhost:3000/api';

export type ApiUser = { id: string; email: string; name: string; role: string };
export type ApiAuthResponse = { user: ApiUser; accessToken: string };
export type ApiNode = { id: string; title: string; script: string; suggestedQuestion: string; type: string; sortOrder: number };
export type ApiSection = { id: string; title: string; sortOrder: number; nodes: ApiNode[] };
export type ApiPlaybook = {
  id: string; title: string; description: string; language: string; industry: string;
  version: string; status: string; updatedAt: string; sections: ApiSection[];
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return request<ApiAuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function getPlaybooks(accessToken: string) {
  return request<ApiPlaybook[]>('/playbooks', { headers: { Authorization: `Bearer ${accessToken}` } });
}
