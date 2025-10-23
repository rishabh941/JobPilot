import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Building2, MapPin, Calendar, Briefcase } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Job } from '@/lib/types';

interface JobDetailsModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
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

export default function JobDetailsModal({ job, open, onClose }: JobDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{job.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(job.status)}>
              {job.status || 'new'}
            </Badge>
            {job.jobType && (
              <Badge variant="outline">{job.jobType}</Badge>
            )}
            {job.seniorityLevel && (
              <Badge variant="outline">{job.seniorityLevel}</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-sm">
              <Building2 size={18} className="text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium">{job.company}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={18} className="text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{job.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Briefcase size={18} className="text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Experience</p>
                <p className="font-medium">{job.experience}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={18} className="text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Posted</p>
                <p className="font-medium">{formatDate(job.postedAt)}</p>
              </div>
            </div>
          </div>
          
          {job.skills && (
            <div>
              <h3 className="font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.split(',').map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {job.jobCategory && (
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <p className="text-muted-foreground">{job.jobCategory}</p>
            </div>
          )}
          
          {job.source && (
            <div>
              <h3 className="font-semibold mb-2">Source</h3>
              <p className="text-muted-foreground">{job.source}</p>
            </div>
          )}
          
          {job.appliedAt && (
            <div>
              <h3 className="font-semibold mb-2">Applied On</h3>
              <p className="text-muted-foreground">{formatDate(job.appliedAt)}</p>
            </div>
          )}
          
          <div className="flex gap-3 pt-4 border-t">
            <Button asChild className="flex-1">
              <a href={job.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} className="mr-2" />
                Open in Naukri
              </a>
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}