import axios from 'axios';
import type { Job, ScraperConfig, FilterParams } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;