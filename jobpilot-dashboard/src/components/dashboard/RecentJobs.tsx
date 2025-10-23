import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Job } from '@/lib/types';
import { ExternalLink } from 'lucide-react';

interface RecentJobsProps {
  jobs: Job[];
}

const getStatusColor = (status: Job['status']) => {
  switch (status) {
    case 'applied':
      return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
    case 'pending':
      return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
    case 'failed':
      return 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20';
  }
};

export default function RecentJobs({ jobs }: RecentJobsProps) {
  return (
    <Card className="hover-lift transition-smooth border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Recent Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <motion.p 
              className="text-sm text-muted-foreground text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              No jobs found. Start by scraping some jobs!
            </motion.p>
          ) : (
            jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group flex items-start justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/30 transition-smooth hover-lift bg-card/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {job.title}
                    </h4>
                    <Badge className={`${getStatusColor(job.status)} transition-smooth font-medium`}>
                      {job.status || 'new'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {job.company} • {job.location}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    {formatRelativeTime(job.postedAt)}
                  </p>
                </div>
                <motion.a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth p-2 rounded-lg hover:bg-primary/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink size={18} strokeWidth={2.5} />
                </motion.a>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}