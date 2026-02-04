import { Client } from '@/types/client';
import { StatusBadge, SignalIndicator, PaymentStatus } from './StatusBadge';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ClientRowProps {
  client: Client;
  onClick: (client: Client) => void;
}

export function ClientRow({ client, onClick }: ClientRowProps) {
  const rowClass = client.hasSignal && client.monthsWithoutPayment < 3 
    ? 'client-row-active' 
    : 'client-row-inactive';

  return (
    <button
      onClick={() => onClick(client)}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200",
        "hover:scale-[1.01] cursor-pointer animate-slide-in",
        rowClass
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <SignalIndicator hasSignal={client.hasSignal} size="sm" />
          <span className="font-mono font-bold text-sm bg-foreground/10 px-2 py-0.5 rounded">
            {client.code}
          </span>
        </div>
        <div className="text-left">
          <p className="font-semibold">{client.name}</p>
          <p className="text-sm text-muted-foreground">
            {client.location} • TAP: {client.tap}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <PaymentStatus debt={client.debt} />
          <StatusBadge 
            hasSignal={client.hasSignal} 
            monthsWithoutPayment={client.monthsWithoutPayment}
            className="mt-1"
          />
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </button>
  );
}

interface ClientListProps {
  clients: Client[];
  onClientClick: (client: Client) => void;
  emptyMessage?: string;
}

export function ClientList({ clients, onClientClick, emptyMessage = "Nenhum cliente encontrado" }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clients.map((client, index) => (
        <div
          key={client.id}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ClientRow client={client} onClick={onClientClick} />
        </div>
      ))}
    </div>
  );
}
