import { useMemo } from 'react';
import type { Job, JobStats } from '@/lib/types';

export const useJobStats = (jobs: Job[] | undefined): JobStats => {
  return useMemo(() => {
    if (!jobs) {
      return { total: 0, applied: 0, pending: 0, failed: 0, new: 0 };
    }
    
    return {
      total: jobs.length,
      applied: jobs.filter(j => j.status === 'applied').length,
      pending: jobs.filter(j => j.status === 'pending').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      new: jobs.filter(j => !j.status).length,
    };
  }, [jobs]);
};