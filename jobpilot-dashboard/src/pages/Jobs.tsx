import { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import JobsTable from '@/components/jobs/JobsTable';
import JobFilters from '@/components/jobs/JobFilters';
import { Skeleton } from '@/components/ui/skeleton';
import type { Job } from '@/lib/types';

export default function Jobs() {
  const { data: jobs, isLoading } = useJobs();
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const displayJobs = searchTerm || filteredJobs.length > 0 
    ? filteredJobs 
    : jobs || [];
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Jobs</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track your job applications
        </p>
      </div>
      
      <JobFilters 
        jobs={jobs || []}
        onFilter={setFilteredJobs}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <JobsTable jobs={displayJobs} />
    </div>
  );
}