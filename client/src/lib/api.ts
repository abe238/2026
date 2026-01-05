const API_URL = import.meta.env.VITE_API_URL || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function getUserId(): string {
  // MVP: Use fixed user ID to match seeded database
  // TODO: Implement proper auth later
  return '00000000-0000-0000-0000-000000000001';
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

interface VoiceProcessResult {
  transcript: string;
  wins: Array<{
    title: string;
    goalAreaId: string;
    goalAreaName: string;
    confidence: number;
  }>;
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
  voice: {
    process: async (audioBlob: Blob): Promise<VoiceProcessResult> => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const res = await fetch(`${API_URL}/api/voice/process`, {
        method: 'POST',
        headers: { 'x-user-id': getUserId() },
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Voice processing failed');
      return json.data;
    },
  },
};
