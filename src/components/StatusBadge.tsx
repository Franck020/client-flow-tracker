import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  hasSignal: boolean;
  monthsWithoutPayment: number;
  className?: string;
}

export function StatusBadge({ hasSignal, monthsWithoutPayment, className }: StatusBadgeProps) {
  if (monthsWithoutPayment >= 3) {
    return (
      <Badge className={cn("status-badge-inactive gap-1", className)}>
        <AlertTriangle className="h-3 w-3" />
        Inativo
      </Badge>
    );
  }

  if (!hasSignal) {
    return (
      <Badge className={cn("status-badge-inactive gap-1", className)}>
        <WifiOff className="h-3 w-3" />
        Sem Sinal
      </Badge>
    );
  }

  if (monthsWithoutPayment > 0) {
    return (
      <Badge className={cn("status-badge-warning gap-1", className)}>
        <Clock className="h-3 w-3" />
        Em Atraso
      </Badge>
    );
  }

  return (
    <Badge className={cn("status-badge-active gap-1", className)}>
      <CheckCircle className="h-3 w-3" />
      Ativo
    </Badge>
  );
}

interface SignalIndicatorProps {
  hasSignal: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SignalIndicator({ hasSignal, size = 'md' }: SignalIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return hasSignal ? (
    <Wifi className={cn(sizeClasses[size], "text-status-active")} />
  ) : (
    <WifiOff className={cn(sizeClasses[size], "text-status-inactive")} />
  );
}

interface PaymentStatusProps {
  debt: number;
  className?: string;
}

export function PaymentStatus({ debt, className }: PaymentStatusProps) {
  if (debt === 0) {
    return (
      <span className={cn("text-status-active font-medium", className)}>
        Em dia
      </span>
    );
  }

  return (
    <span className={cn("text-status-inactive font-medium", className)}>
      {debt.toLocaleString('pt-AO')} Kz
    </span>
  );
}
