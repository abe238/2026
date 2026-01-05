const API_URL = import.meta.env.VITE_API_URL || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function getUserId(): string {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + crypto.randomUUID();
    localStorage.setItem('userId', userId);
  }
  return userId;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': getUserId(),
      ...options?.headers,
    },
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data as T;
}

export const api = {
  wins: {
    create: (data: any) => request('/api/wins', { method: 'POST', body: JSON.stringify(data) }),
    weekly: () => request('/api/wins/weekly'),
    vault: (limit = 50, offset = 0) => request(`/api/wins/vault?limit=${limit}&offset=${offset}`),
  },
  goalAreas: {
    list: () => request('/api/goal-areas'),
    update: (id: string, data: any) => request(`/api/goal-areas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  momentum: {
    get: () => request('/api/momentum'),
  },
};
