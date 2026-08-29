import type { Lead, Client } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchLeads(): Promise<Lead[]> {
  return request<Lead[]>('/api/leads');
}

export async function fetchClients(): Promise<Client[]> {
  return request<Client[]>('/api/clients');
}

export async function createLead(payload: {
  customerName: string;
  insight: string;
  intent?: Lead['intent'];
  product?: string;
  lastActive?: string;
  phone?: string;
}): Promise<Lead & { duplicate?: boolean }> {
  return request('/api/leads', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function checkApiHealth(): Promise<{ ok: boolean; db: string }> {
  return request('/api/health');
}

export async function sendChatMessage(payload: {
  message: string;
  history: { sender: 'user' | 'ai'; text: string }[];
  language?: 'en' | 'mm';
}): Promise<{ reply: string; educationLead: boolean }> {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'rm';
  phone?: string;
};

export async function signupUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'customer' | 'rm';
}): Promise<{ user: ApiUser }> {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<{ user: ApiUser }> {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
