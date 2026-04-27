const API_BASE = '/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An unexpected error occurred' }));
    throw new Error(error.error || response.statusText);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  notes: {
    getAll: () => request('/notes'),
    create: (data: any) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/notes/${id}`, { method: 'DELETE' }),
    getFolders: () => request('/notes/folders'),
    createFolder: (data: any) => request('/notes/folders', { method: 'POST', body: JSON.stringify(data) }),
  },
  tasks: {
    getAll: () => request('/tasks'),
    create: (data: any) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/tasks/${id}`, { method: 'DELETE' }),
  },
  diary: {
    getAll: () => request('/diary'),
    create: (data: any) => request('/diary', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request(`/diary/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request(`/diary/${id}`, { method: 'DELETE' }),
  },
};
