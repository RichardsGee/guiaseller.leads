const API_BASE = '/api/v1';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Auto-logout on 401 (token expired/invalid)
  if (response.status === 401) {
    const currentPath = window.location.pathname;
    // Only auto-logout if we thought we were authenticated
    if (token && currentPath !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data;
}

// --- Auth ---
export const authAPI = {
  signin: (idToken: string) =>
    apiFetch<{ success: true; data: { token: string; user: any } }>('/auth/signin', {
      method: 'POST',
      body: { idToken },
    }),
  devLogin: (email: string) =>
    apiFetch<{ success: true; data: { token: string; user: any } }>('/auth/dev-login', {
      method: 'POST',
      body: { email },
    }),
  me: () => apiFetch<{ success: true; data: { user: any } }>('/auth/me'),
  refresh: (idToken: string) =>
    apiFetch<{ success: true; data: { token: string; user: any } }>('/auth/refresh', {
      method: 'POST',
      body: { idToken },
    }),
};

// --- Leads ---
export interface LeadFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  status?: string;
  segment?: string;
  marketplace?: string;
  scoreMin?: number;
  scoreMax?: number;
}

export const leadsAPI = {
  list: (filters: LeadFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    return apiFetch<{ success: true; data: { leads: any[]; pagination: any } }>(
      `/leads?${params.toString()}`
    );
  },
  get: (id: string) =>
    apiFetch<{ success: true; data: { lead: any } }>(`/leads/${id}`),
  create: (data: any) =>
    apiFetch<{ success: true; data: { lead: any } }>('/leads', {
      method: 'POST',
      body: data,
    }),
  update: (id: string, data: any) =>
    apiFetch<{ success: true; data: { lead: any } }>(`/leads/${id}`, {
      method: 'PATCH',
      body: data,
    }),
  delete: (id: string) =>
    apiFetch<{ success: true; data: { lead: any } }>(`/leads/${id}`, {
      method: 'DELETE',
    }),
  rescore: (id: string) =>
    apiFetch<{ success: true; data: any }>(`/leads/${id}/score`, {
      method: 'POST',
    }),
  segment: (id: string) =>
    apiFetch<{ success: true; data: any }>(`/leads/${id}/segment`, {
      method: 'POST',
    }),
  bulk: (action: string, leadIds: string[]) =>
    apiFetch<{ success: true; data: any }>('/leads/bulk', {
      method: 'POST',
      body: { action, leadIds },
    }),
};

// --- Analytics ---
export const analyticsAPI = {
  overview: () =>
    apiFetch<{ success: true; data: any }>('/analytics/overview'),
  marketplace: () =>
    apiFetch<{ success: true; data: any }>('/analytics/marketplace'),
  segments: () =>
    apiFetch<{ success: true; data: any }>('/analytics/segments'),
  trends: (days = 30) =>
    apiFetch<{ success: true; data: any }>(`/analytics/trends?days=${days}`),
  funnel: () =>
    apiFetch<{ success: true; data: any }>('/analytics/funnel'),
};

// --- Admin ---
export const adminAPI = {
  listUsers: () =>
    apiFetch<{ success: true; data: { users: any[] } }>('/admin/users'),
  createUser: (data: any) =>
    apiFetch<{ success: true; data: { user: any } }>('/admin/users', {
      method: 'POST',
      body: data,
    }),
  updateUser: (id: string, data: any) =>
    apiFetch<{ success: true; data: { user: any } }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: data,
    }),
  deleteUser: (id: string) =>
    apiFetch<{ success: true; data: { user: any } }>(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
};
