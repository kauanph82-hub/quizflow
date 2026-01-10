import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  index?: number;
}

export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  index = 0,
}: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {change && (
          <span
            className={cn(
              'text-sm font-medium px-2 py-1 rounded-lg',
              changeType === 'positive' && 'text-green-400 bg-green-400/10',
              changeType === 'negative' && 'text-red-400 bg-red-400/10',
              changeType === 'neutral' && 'text-muted-foreground bg-secondary'
            )}
          >
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </motion.div>
  );
};
