import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Navbar() {
  const queryClient = useQueryClient();
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
    toast.success('Data refreshed');
  };
  
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Job Management Dashboard
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>
    </header>
  );
}