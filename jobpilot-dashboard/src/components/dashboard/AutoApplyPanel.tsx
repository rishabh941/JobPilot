import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAutoApplyStatus, useStartAutoApply, useStopAutoApply } from '@/hooks/useAutoApply';
import { Play, Square, Activity, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/lib/utils';

export default function AutoApplyPanel() {
  const [limit, setLimit] = useState('10');
  const { data: status } = useAutoApplyStatus();
  const startAutoApply = useStartAutoApply();
  const stopAutoApply = useStopAutoApply();
  
  const handleStart = () => {
    const limitNum = parseInt(limit) || 10;
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
  
  const isRunning = status?.isRunning || false;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} />
              Auto Apply
            </CardTitle>
            <CardDescription>
              Automatically apply to jobs in your queue
            </CardDescription>
          </div>
          <Badge className={isRunning ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}>
            {isRunning ? 'Running' : 'Idle'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isRunning ? (
          <div className="space-y-4">
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
                Maximum number of jobs to process in this run
              </p>
            </div>
            
            <Button
              onClick={handleStart}
              disabled={startAutoApply.isPending}
              className="w-full gap-2"
            >
              <Play size={16} />
              {startAutoApply.isPending ? 'Starting...' : 'Start Auto Apply'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
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
            >
              <Square size={16} />
              {stopAutoApply.isPending ? 'Stopping...' : 'Stop Auto Apply'}
            </Button>
          </div>
        )}
        
        {status?.lastRunTime && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Last run: {formatRelativeTime(status.lastRunTime)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}