export interface Job {
  id: string;
  title: string;
  url: string;
  location: string;
  company: string;
  experience: string;
  postedAt: string;
  jobHash: string;
  skills: string;
  jobType: string;
  seniorityLevel: string;
  source: string;
  posted: string;
  jobCategory: string;
  status: 'applied' | 'pending' | 'failed' | null;
  appliedAt: string | null;
}

export interface JobStats {
  total: number;
  applied: number;
  pending: number;
  failed: number;
  new: number;
}

export interface ScraperConfig {
  role: string;
  location: string;
  experienceFilter?: string;
  posted?: string;
  pages: number;
}

export interface FilterParams {
  jobType?: string;
  seniorityLevel?: string;
  location?: string;
  company?: string;
  title?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}