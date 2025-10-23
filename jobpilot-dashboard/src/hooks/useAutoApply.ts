import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { autoApplyApi } from '@/lib/api';

export const useAutoApplyStatus = () => {
  return useQuery({
    queryKey: ['autoApply', 'status'],
    queryFn: async () => {
      const { data } = await autoApplyApi.getStatus();
      return data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

export const useStartAutoApply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (limit: number) => autoApplyApi.start(limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoApply', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useStopAutoApply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => autoApplyApi.stop(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoApply', 'status'] });
    },
  });
};