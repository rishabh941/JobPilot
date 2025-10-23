import ScraperForm from '@/components/scraper/ScraperForm';
import ScraperStatus from '@/components/scraper/ScraperStatus';
import { Sparkles } from 'lucide-react';

export default function Scraper() {
  return (
    <div className="space-y-8 pb-8 min-h-full">
      <div className="fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-primary shadow-lg">
            <Sparkles className="text-primary-foreground" size={24} />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Job Scraper
          </h1>
        </div>
        <p className="text-muted-foreground text-lg ml-16">
          Configure and trigger job scraping from Naukri
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScraperForm />
        <ScraperStatus />
      </div>
      
      {/* Decorative Elements */}
      <div className="fixed top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
    </div>
  );
}

// export default function Scraper() {
//   return <h1 className="text-4xl text-center mt-10">Scraper Page Loaded ✅</h1>;
// }


