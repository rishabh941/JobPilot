import { useJobs } from '@/hooks/useJobs';
import { useJobStats } from '@/hooks/useJobStats';
import StatsCards from '@/components/dashboard/StatsCards';
import StatusChart from '@/components/dashboard/StatusChart';
import RecentJobs from '@/components/dashboard/RecentJobs';
import AutoApplyPanel from '@/components/dashboard/AutoApplyPanel';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: jobs, isLoading } = useJobs();
  const stats = useJobStats(jobs);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your job applications
        </p>
      </div>
      
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StatusChart stats={stats} />
          <RecentJobs jobs={jobs?.slice(0, 5) || []} />
        </div>
        <div>
          <AutoApplyPanel />
        </div>
      </div>
    </div>
  );
}