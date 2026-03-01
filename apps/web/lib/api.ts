import type { ApiResponse } from '@leaguelore/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Typed fetch wrapper for the LeagueLore API.
 *
 * Usage:
 *   const leagues = await api.get<LeagueOverview[]>('/leagues');
 *   const result = await api.post<ConnectLeagueResponse>('/leagues/connect', body);
 */
export const api = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}/api${path}`, {
      headers: getHeaders(),
    });
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}/api${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}/api${path}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}/api${path}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}/api${path}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<T>(res);
  },
};

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // TODO: Add Clerk auth token
  // const token = await getToken();
  // if (token) headers['Authorization'] = `Bearer ${token}`;

  // Dev mode: use mock user
  if (process.env.NODE_ENV === 'development') {
    headers['x-dev-user-id'] = 'dev_user_001';
  }

  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `API error: ${res.status}`);
  }

  return json.data;
}
