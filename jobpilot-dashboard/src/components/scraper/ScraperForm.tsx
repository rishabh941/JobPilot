import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useScrapeJobs } from '@/hooks/useJobs';
import { Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Job } from '@/lib/types';

export default function ScraperForm() {
  const [role, setRole] = useState('Software Engineer');
  const [location, setLocation] = useState('Bengaluru');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [posted, setPosted] = useState('');
  const [pages, setPages] = useState('1');
  const [scrapedJobs, setScrapedJobs] = useState<Job[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const scrapeJobs = useScrapeJobs();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role || !location) {
      toast.error('Role and Location are required');
      return;
    }
    
    setShowResults(false);
    setScrapedJobs([]);
    
    const config = {
      role,
      location,
      experienceFilter: experienceFilter || undefined,
      posted: posted || undefined,
      pages: parseInt(pages) || 1,
    };
    
    toast.info(`Starting scrape for ${role} in ${location}...`);
    
    scrapeJobs.mutate(config, {
      onSuccess: (response) => {
        const jobs = response.data as Job[];
        setScrapedJobs(jobs);
        setShowResults(true);
        
        if (jobs.length === 0) {
          toast.warning('No new jobs found matching your criteria');
        } else {
          toast.success(`Successfully scraped ${jobs.length} new job${jobs.length > 1 ? 's' : ''}!`);
        }
      },
      onError: (error: any) => {
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        toast.error(`Scraping failed: ${errorMsg}`);
        
        if (errorMsg.includes('Connection refused') || errorMsg.includes('ECONNREFUSED')) {
          toast.error('Make sure the FastAPI scraper is running on port 5000', {
            duration: 5000,
          });
        }
      },
    });
  };
  
  return (
    <Card className="border-2 border-primary/10 shadow-lg hover-lift">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Search className="text-primary" size={20} />
          </div>
          <CardTitle className="text-2xl text-foreground">Scraper Configuration</CardTitle>
        </div>
        <CardDescription className="text-base">
          Configure the parameters for scraping jobs from Naukri
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 slide-in-left" style={{ animationDelay: '0.1s' }}>
            <Label htmlFor="role" className="text-sm font-semibold">
              Job Role <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role"
              placeholder="e.g., Software Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="transition-smooth focus:ring-2 focus:ring-primary/20 border-2"
            />
          </div>
          
          <div className="space-y-2 slide-in-left" style={{ animationDelay: '0.2s' }}>
            <Label htmlFor="location" className="text-sm font-semibold">
              Location <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g., Bengaluru"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="transition-smooth focus:ring-2 focus:ring-primary/20 border-2"
            />
          </div>
          
          <div className="space-y-2 slide-in-left" style={{ animationDelay: '0.3s' }}>
            <Label htmlFor="experience" className="text-sm font-semibold">
              Experience Filter
            </Label>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger id="experience" className="transition-smooth border-2">
                <SelectValue placeholder="Select experience range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Experience</SelectItem>
                <SelectItem value="0-1">0-1 years</SelectItem>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="2-5">2-5 years</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="10-15">10-15 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 slide-in-left" style={{ animationDelay: '0.4s' }}>
            <Label htmlFor="posted" className="text-sm font-semibold">
              Posted Within
            </Label>
            <Select value={posted} onValueChange={setPosted}>
              <SelectTrigger id="posted" className="transition-smooth border-2">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any time</SelectItem>
                <SelectItem value="1day">Last 24 hours</SelectItem>
                <SelectItem value="3days">Last 3 days</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="15days">Last 15 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 slide-in-left" style={{ animationDelay: '0.5s' }}>
            <Label htmlFor="pages" className="text-sm font-semibold">
              Number of Pages
            </Label>
            <Input
              id="pages"
              type="number"
              min="1"
              max="10"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              className="transition-smooth focus:ring-2 focus:ring-primary/20 border-2"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-primary"></span>
              Each page contains approximately 20 jobs
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold transition-smooth hover:scale-[1.02] hover:shadow-lg slide-in-left relative overflow-hidden group"
            style={{ animationDelay: '0.6s' }}
            disabled={scrapeJobs.isPending}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            {scrapeJobs.isPending ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Scraping in progress...
              </>
            ) : (
              <>
                <Search size={18} className="mr-2" />
                Start Scraping
              </>
            )}
          </Button>
          
          {scrapeJobs.isPending && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-200 dark:border-blue-800 rounded-xl scale-in shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 size={20} className="animate-spin text-blue-600 dark:text-blue-400" />
                  <div className="absolute inset-0 animate-ping">
                    <Loader2 size={20} className="text-blue-400 dark:text-blue-600 opacity-40" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Scraping Naukri.com...
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    This may take 30-60 seconds depending on the number of pages
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse shimmer"></div>
              </div>
            </div>
          )}
          
          {showResults && !scrapeJobs.isPending && (
            <div className={`mt-4 p-4 rounded-xl border-2 scale-in shadow-md ${
              scrapedJobs.length > 0 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  scrapedJobs.length > 0 
                    ? 'bg-green-100 dark:bg-green-900/50' 
                    : 'bg-yellow-100 dark:bg-yellow-900/50'
                }`}>
                  {scrapedJobs.length > 0 ? (
                    <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
                <div className="flex-1">
                  {scrapedJobs.length > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                        Successfully scraped {scrapedJobs.length} new job{scrapedJobs.length > 1 ? 's' : ''}!
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-green-500"></span>
                        Check the Jobs page to view and manage them
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                        No new jobs found
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        Try adjusting your filters or search criteria
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}