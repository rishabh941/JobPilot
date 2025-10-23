import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { JobStats } from '@/lib/types';

interface StatusChartProps {
  stats: JobStats;
}

export default function StatusChart({ stats }: StatusChartProps) {
  const data = [
    { name: 'Applied', value: stats.applied, fill: '#22c55e' },
    { name: 'Pending', value: stats.pending + stats.new, fill: '#eab308' },
    { name: 'Failed', value: stats.failed, fill: '#ef4444' },
  ];
  
  return (
    <Card className="hover-lift transition-smooth border-border/40 bg-card/90 backdrop-blur-md shadow-lg hover:shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-bold tracking-tight">
            Status Distribution
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={13}
              fontWeight={600}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              fontWeight={500}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '14px',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(16px)',
                padding: '12px',
              }}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}