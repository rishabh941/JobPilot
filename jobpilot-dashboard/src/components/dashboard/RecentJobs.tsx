import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import type { Job } from '@/lib/types';
import { ExternalLink } from 'lucide-react';

interface RecentJobsProps {
  jobs: Job[];
}

const getStatusColor = (status: Job['status']) => {
  switch (status) {
    case 'applied':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'failed':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  }
};

export default function RecentJobs({ jobs }: RecentJobsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No jobs found. Start by scraping some jobs!
            </p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">
                      {job.title}
                    </h4>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status || 'new'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.company} • {job.location}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(job.postedAt)}
                  </p>
                </div>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}