import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api';
import type { ScraperConfig, FilterParams } from '@/lib/types';

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await jobsApi.getAll();
      return data;
    },
  });
};

export const useUnappliedJobs = () => {
  return useQuery({
    queryKey: ['jobs', 'unapplied'],
    queryFn: async () => {
      const { data } = await jobsApi.getUnapplied();
      return data;
    },
  });
};

export const useFilteredJobs = (filters: FilterParams) => {
  return useQuery({
    queryKey: ['jobs', 'filtered', filters],
    queryFn: async () => {
      const { data } = await jobsApi.filter(filters);
      return data;
    },
    enabled: Object.values(filters).some(v => v !== undefined && v !== ''),
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, appliedAt }: { id: string; status: string; appliedAt?: string }) =>
      jobsApi.updateStatus(id, status, appliedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useScrapeJobs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (config: ScraperConfig) => jobsApi.scrape(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};