import { TrendingUp, TrendingDown, Wallet, Users, UserX, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  type?: 'default' | 'income' | 'expense' | 'info' | 'warning';
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  type = 'default',
  icon,
  trend,
  trendValue,
}: StatCardProps) {
  const cardClasses = {
    default: 'stat-card',
    income: 'income-card',
    expense: 'expense-card',
    info: 'stat-card border-l-4 border-l-primary',
    warning: 'stat-card border-l-4 border-l-status-warning',
  };

  const iconContainerClasses = {
    default: 'bg-secondary text-foreground',
    income: 'bg-income-bg text-income',
    expense: 'bg-expense-bg text-expense',
    info: 'bg-accent text-primary',
    warning: 'bg-status-warning-bg text-status-warning',
  };

  const defaultIcons = {
    default: <Wallet className="h-5 w-5" />,
    income: <TrendingUp className="h-5 w-5" />,
    expense: <TrendingDown className="h-5 w-5" />,
    info: <Users className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
  };

  return (
    <div className={cn(cardClasses[type], "animate-fade-in")}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend === 'up' ? 'text-income' : 'text-expense'
            )}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className={cn(
          "rounded-lg p-2.5",
          iconContainerClasses[type]
        )}>
          {icon || defaultIcons[type]}
        </div>
      </div>
    </div>
  );
}
