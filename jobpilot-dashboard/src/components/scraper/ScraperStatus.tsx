import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJobs } from '@/hooks/useJobs';
import { Activity, Database, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export default function ScraperStatus() {
  const { data: jobs, dataUpdatedAt } = useJobs();
  
  const latestJob = jobs?.[0];
  
  return (
    <Card className="border-2 border-primary/10 shadow-lg hover-lift">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="text-primary" size={20} />
          </div>
          <CardTitle className="text-2xl text-foreground">Scraper Status</CardTitle>
        </div>
        <CardDescription className="text-base">
          Current status and statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative overflow-hidden flex items-center justify-between p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 transition-smooth hover:shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/50">
              <Activity className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Status</p>
              <p className="text-lg font-bold text-green-800 dark:text-green-300">Ready</p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 px-4 py-1.5 text-sm font-semibold relative z-10">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Idle
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 transition-smooth hover:shadow-md hover:scale-[1.02]">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50">
              <Database className="text-blue-600 dark:text-blue-400" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Jobs in Database</p>
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-300 mt-1">{jobs?.length || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 transition-smooth hover:shadow-md hover:scale-[1.02]">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/50">
              <Clock className="text-purple-600 dark:text-purple-400" size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Last Updated</p>
              <p className="text-lg font-semibold text-purple-800 dark:text-purple-300 mt-1">
                {dataUpdatedAt ? formatRelativeTime(new Date(dataUpdatedAt)) : 'Never'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t-2 border-dashed border-border">
          <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
            <span className="inline-block w-1 h-5 bg-primary rounded-full"></span>
            Recent Activity
          </h4>
          {latestJob ? (
            <div className="p-4 rounded-xl bg-gradient-to-br from-accent to-accent/50 border border-border transition-smooth hover:shadow-md">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-semibold text-muted-foreground mt-0.5">Latest job:</span>
                  <span className="text-sm text-foreground font-bold flex-1">{latestJob.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-block w-1 h-1 rounded-full bg-primary"></span>
                  <span>at <span className="font-semibold text-foreground">{latestJob.company}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
                  <span>Added {formatRelativeTime(latestJob.postedAt)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-muted/30 border border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground">No jobs scraped yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start scraping to see activity here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}