import axios from 'axios';
import type { Job, ScraperConfig, FilterParams, AuthResponse } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const jobsApi = {
  getAll: () => api.get<Job[]>('/api/jobs'),
  
  getUnapplied: () => api.get<Job[]>('/api/jobs/unapplied'),
  
  filter: (params: FilterParams) => 
    api.get<Job[]>('/api/jobs/filter', { params }),
  
  updateStatus: (id: string, status: string, appliedAt?: string) => {
    const params: Record<string, string> = { status };
    if (appliedAt) {
      params.appliedAt = appliedAt;
    }
    return api.patch<Job>(`/api/jobs/${id}/status`, null, { params });
  },
  
  scrape: (config: ScraperConfig) => 
    api.get('/api/jobs/scrape', { 
      params: {
        role: config.role,
        location: config.location,
        experience_filter: config.experienceFilter,
        posted: config.posted,
        pages: config.pages,
      }
    }),
  
  addJob: (job: Partial<Job>) => 
    api.post<Job>('/api/jobs/add', job),
};

export const autoApplyApi = {
  start: (limit: number = 10) => 
    api.post('/api/autoapply/start', null, { params: { limit } }),
  
  getStatus: () => 
    api.get<{
      isRunning: boolean;
      processedJobs: number;
      successfulApplications: number;
      lastRunTime: string | null;
    }>('/api/autoapply/status'),
  
  stop: () => 
    api.post('/api/autoapply/stop'),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),
  
  signup: (email: string, password: string, firstName: string, lastName: string) =>
    api.post<AuthResponse>('/api/auth/signup', { email, password, firstName, lastName }),
  
  logout: () =>
    api.post('/api/auth/logout'),
  
  getCurrentUser: () =>
    api.get('/api/auth/me'),
};

export default api;