import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['jobs'] });
    toast.success('Data refreshed');
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  return (
    <motion.header 
      className="h-16 border-b border-border/40 bg-card/90 backdrop-blur-2xl px-6 flex items-center justify-between shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="text-xl font-semibold bg-gradient-to-r from-foreground via-primary/80 to-accent/80 bg-clip-text text-transparent tracking-tight">
          Job Management Dashboard
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2 hover-lift transition-smooth border-border/40 hover:border-primary/60 hover:bg-primary/10 hover:text-primary hover:shadow-lg hover:shadow-primary/20"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 1, ease: "linear", repeat: isRefreshing ? Infinity : 0 }}
          >
            <RefreshCw size={16} />
          </motion.div>
          Refresh
        </Button>
      </div>
    </motion.header>
  );
}