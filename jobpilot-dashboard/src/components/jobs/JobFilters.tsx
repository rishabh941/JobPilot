import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import type { Job } from '@/lib/types';

interface JobFiltersProps {
  jobs: Job[];
  onFilter: (filtered: Job[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function JobFilters({ jobs, onFilter, searchTerm, onSearchChange }: JobFiltersProps) {
  const [status, setStatus] = useState<string>('all');
  const [jobType, setJobType] = useState<string>('all');
  const [location, setLocation] = useState<string>('');
  
  useEffect(() => {
    let filtered = [...jobs];
    
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (status !== 'all') {
      filtered = filtered.filter(job => 
        status === 'new' ? !job.status : job.status === status
      );
    }
    
    if (jobType !== 'all') {
      filtered = filtered.filter(job => 
        job.jobType?.toLowerCase() === jobType.toLowerCase()
      );
    }
    
    if (location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    onFilter(filtered);
  }, [searchTerm, status, jobType, location, jobs, onFilter]);
  
  const handleReset = () => {
    onSearchChange('');
    setStatus('all');
    setJobType('all');
    setLocation('');
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by title or company..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger>
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <X size={16} />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}