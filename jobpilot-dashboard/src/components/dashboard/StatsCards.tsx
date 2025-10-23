import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { JobStats } from '@/lib/types';

interface StatsCardsProps {
  stats: JobStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Jobs',
      value: stats.total,
      icon: Briefcase,
      color: 'text-primary',
      bgColor: 'bg-primary/15',
      gradient: 'from-primary/25 to-primary/5',
      shadow: 'shadow-primary/20',
    },
    {
      title: 'Applied',
      value: stats.applied,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/15',
      gradient: 'from-success/25 to-success/5',
      shadow: 'shadow-success/20',
    },
    {
      title: 'Pending',
      value: stats.pending + stats.new,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/15',
      gradient: 'from-warning/25 to-warning/5',
      shadow: 'shadow-warning/20',
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/15',
      gradient: 'from-destructive/25 to-destructive/5',
      shadow: 'shadow-destructive/20',
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className={`hover-lift card-glow transition-smooth border-border/40 bg-card/90 backdrop-blur-md relative overflow-hidden ${card.shadow} hover:shadow-xl`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-60`} />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold text-muted-foreground/90">
                {card.title}
              </CardTitle>
              <motion.div 
                className={`p-3 rounded-xl ${card.bgColor} shadow-lg backdrop-blur-sm border border-white/10`}
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <card.icon className={card.color} size={22} strokeWidth={2.5} />
              </motion.div>
            </CardHeader>
            <CardContent className="relative z-10">
              <motion.div 
                className="text-3xl font-bold text-foreground/95"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                {card.value}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}