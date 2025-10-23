import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAutoApplyStatus, useStartAutoApply, useStopAutoApply } from '@/hooks/useAutoApply';
import { useJobs } from '@/hooks/useJobs';
import { Play, Square, Activity, CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/utils';

export default function AutoApply() {
  const [limit, setLimit] = useState('10');
  const { data: status } = useAutoApplyStatus();
  const { data: jobs } = useJobs();
  const startAutoApply = useStartAutoApply();
  const stopAutoApply = useStopAutoApply();
  
  const unappliedCount = jobs?.filter(j => !j.status || j.status === 'pending').length || 0;
  const isRunning = status?.isRunning || false;
  
  const handleStart = () => {
    const limitNum = parseInt(limit) || 10;
    if (limitNum > unappliedCount) {
      toast.warning(`Only ${unappliedCount} unapplied jobs available`);
    }
    startAutoApply.mutate(limitNum, {
      onSuccess: () => {
        toast.success(`Auto-apply started for ${limitNum} jobs`);
      },
      onError: (error: Error) => {
        toast.error('Failed to start auto-apply: ' + error.message);
      },
    });
  };
  
  const handleStop = () => {
    stopAutoApply.mutate(undefined, {
      onSuccess: () => {
        toast.info('Auto-apply stopped');
      },
      onError: (error: Error) => {
        toast.error('Failed to stop auto-apply: ' + error.message);
      },
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Auto Apply</h1>
        <p className="text-muted-foreground mt-1">
          Automatically apply to jobs in your queue
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isRunning ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                <Activity className={isRunning ? 'text-green-500' : 'text-gray-500'} size={20} />
              </div>
              <div>
                <Badge className={isRunning ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}>
                  {isRunning ? 'Running' : 'Idle'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unapplied Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{unappliedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for auto-apply
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {status?.processedJobs ? 
                Math.round((status.successfulApplications / status.processedJobs) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {status?.successfulApplications || 0} of {status?.processedJobs || 0} successful
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={20} />
              Control Panel
            </CardTitle>
            <CardDescription>
              Start or stop the auto-apply process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isRunning ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="limit">Number of Jobs to Apply</Label>
                  <Input
                    id="limit"
                    type="number"
                    min="1"
                    max="50"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum: {Math.min(50, unappliedCount)} jobs
                  </p>
                </div>
                
                <Button
                  onClick={handleStart}
                  disabled={startAutoApply.isPending || unappliedCount === 0}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Play size={18} />
                  {startAutoApply.isPending ? 'Starting...' : 'Start Auto Apply'}
                </Button>
                
                {unappliedCount === 0 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <AlertCircle size={18} className="text-yellow-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-500">No unapplied jobs</p>
                      <p className="text-muted-foreground mt-1">
                        Scrape some jobs first to use auto-apply
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock size={16} />
                      Processed
                    </div>
                    <div className="text-2xl font-bold">{status?.processedJobs || 0}</div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <CheckCircle size={16} />
                      Successful
                    </div>
                    <div className="text-2xl font-bold text-green-500">
                      {status?.successfulApplications || 0}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleStop}
                  disabled={stopAutoApply.isPending}
                  variant="destructive"
                  className="w-full gap-2"
                  size="lg"
                >
                  <Square size={18} />
                  {stopAutoApply.isPending ? 'Stopping...' : 'Stop Auto Apply'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Automated job application process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Fetch Unapplied Jobs</p>
                  <p className="text-sm text-muted-foreground">
                    Retrieves jobs with 'pending' or no status
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Login to Naukri</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically logs in using your credentials
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Apply to Jobs</p>
                  <p className="text-sm text-muted-foreground">
                    Visits each job and clicks apply button
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  4
                </div>
                <div>
                  <p className="font-medium">Update Status</p>
                  <p className="text-sm text-muted-foreground">
                    Marks jobs as 'applied' or 'failed' in database
                  </p>
                </div>
              </div>
            </div>
            
            {status?.lastRunTime && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Last run: {formatRelativeTime(status.lastRunTime)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}