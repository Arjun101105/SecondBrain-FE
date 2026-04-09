const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('secondbrain_jwt');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  signin: (payload: { username: string; password: string }) =>
    apiClient<{ user: any; token: string }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  signup: (payload: { username: string; password: string; email?: string }) =>
    apiClient<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// ─── Content ──────────────────────────────────────────────
export const contentApi = {
  getAll: (params?: { page?: number; limit?: number; type?: string; tag?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.type) searchParams.set('type', params.type);
    if (params?.tag) searchParams.set('tag', params.tag);
    const qs = searchParams.toString();
    return apiClient<{ contents: any[]; pagination: any }>(`/content${qs ? `?${qs}` : ''}`);
  },
  getOne: (id: string) => apiClient<{ content: any }>(`/content/${id}`),
  create: (payload: any) =>
    apiClient<{ content: any }>('/content', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: any) =>
    apiClient<{ content: any }>(`/content/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiClient<void>(`/content/${id}`, { method: 'DELETE' }),
  upload: (formData: FormData) =>
    apiClient<{ content: any }>('/content/upload', {
      method: 'POST',
      body: formData,
    }),
  search: (query: string) =>
    apiClient<{ contents: any[] }>(`/content/search/${encodeURIComponent(query)}`),
};

// ─── Collections ──────────────────────────────────────────
export const collectionsApi = {
  getAll: () => apiClient<{ collections: any[] }>('/collections'),
  getOne: (id: string) => apiClient<{ collection: any }>(`/collections/${id}`),
  create: (payload: { name: string; description?: string }) =>
    apiClient<{ collection: any }>('/collections', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: { name?: string; description?: string }) =>
    apiClient<{ collection: any }>(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  delete: (id: string) =>
    apiClient<void>(`/collections/${id}`, { method: 'DELETE' }),
  addContent: (collectionId: string, contentId: string) =>
    apiClient<{ collection: any }>(`/collections/${collectionId}/content`, {
      method: 'POST',
      body: JSON.stringify({ contentId }),
    }),
  removeContent: (collectionId: string, contentId: string) =>
    apiClient<{ collection: any }>(`/collections/${collectionId}/content/${contentId}`, {
      method: 'DELETE',
    }),
};

// ─── Brain Share ──────────────────────────────────────────
export const brainApi = {
  createShareLink: (payload?: { permissions?: string; expiresAt?: string }) =>
    apiClient<{ shareLink: any }>('/brain/share', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),
  getShareLink: () => apiClient<{ shareLink: any }>('/brain/share'),
  deleteShareLink: () =>
    apiClient<void>('/brain/share', { method: 'DELETE' }),
  getSharedBrain: (hash: string) =>
    apiClient<{ user: any; contents: any[]; collections: any[]; permissions: string }>(
      `/brain/${hash}`
    ),
};

// ─── Legacy compat (used by existing CommandPalette) ──────
export const api = {
  getContents: contentApi.getAll,
  createContent: contentApi.create,
};
