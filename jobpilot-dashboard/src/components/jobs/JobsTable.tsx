import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useUpdateJobStatus } from '@/hooks/useJobs';
import { formatDate, truncateText } from '@/lib/utils';
import JobDetailsModal from './JobDetailsModal';
import type { Job } from '@/lib/types';
import { toast } from 'sonner';

interface JobsTableProps {
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

export default function JobsTable({ jobs }: JobsTableProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const updateStatus = useUpdateJobStatus();
  
  const handleStatusUpdate = (id: string, status: string) => {
    const appliedAt = status === 'applied' ? new Date().toISOString() : undefined;
    updateStatus.mutate(
      { id, status, appliedAt },
      {
        onSuccess: () => {
          toast.success(`Job marked as ${status}`);
        },
        onError: () => {
          toast.error('Failed to update job status');
        },
      }
    );
  };
  
  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            No jobs found. Try adjusting your filters or scrape new jobs.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium max-w-xs">
                      {truncateText(job.title, 50)}
                    </TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell className="text-sm">{job.experience}</TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-muted-foreground">
                        {truncateText(job.skills || 'N/A', 40)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status || 'new'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(job.postedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedJob(job)}
                        >
                          <Eye size={16} />
                        </Button>
                        {job.status !== 'applied' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(job.id, 'applied')}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle size={16} className="text-green-500" />
                          </Button>
                        )}
                        {job.status !== 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusUpdate(job.id, 'failed')}
                            disabled={updateStatus.isPending}
                          >
                            <XCircle size={16} className="text-red-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={job.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
}