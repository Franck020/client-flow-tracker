import { Transaction } from '@/types/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Banknote, CreditCard, Utensils, Droplets, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  showDate?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  pagamento: <Wallet className="h-4 w-4" />,
  alimentacao: <Utensils className="h-4 w-4" />,
  salario: <Banknote className="h-4 w-4" />,
  agua: <Droplets className="h-4 w-4" />,
  outro: <CreditCard className="h-4 w-4" />,
};

const categoryLabels: Record<string, string> = {
  pagamento: 'Pagamento',
  alimentacao: 'Alimentação',
  salario: 'Salário',
  agua: 'Água',
  outro: 'Outro',
};

export function TransactionList({ transactions, showDate = true }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma transacção registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction, index) => (
        <div
          key={transaction.id}
          className={cn(
            "flex items-center justify-between p-4 rounded-lg animate-fade-in",
            transaction.type === 'entrada' ? 'bg-income-bg' : 'bg-expense-bg'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              transaction.type === 'entrada' 
                ? 'bg-income/10 text-income' 
                : 'bg-expense/10 text-expense'
            )}>
              {transaction.type === 'entrada' 
                ? <TrendingUp className="h-5 w-5" /> 
                : <TrendingDown className="h-5 w-5" />
              }
            </div>
            <div>
              <p className="font-medium text-sm">{transaction.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {categoryIcons[transaction.category]}
                  {categoryLabels[transaction.category]}
                </span>
                {transaction.method && (
                  <>
                    <span>•</span>
                    <span>{transaction.method === 'cash' ? 'Dinheiro' : 'Transferência'}</span>
                  </>
                )}
                {showDate && (
                  <>
                    <span>•</span>
                    <span>{format(transaction.date, "HH:mm", { locale: ptBR })}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={cn(
            "text-right font-bold",
            transaction.type === 'entrada' ? 'text-income' : 'text-expense'
          )}>
            {transaction.type === 'entrada' ? '+' : '-'}
            {transaction.amount.toLocaleString('pt-AO')} Kz
          </div>
        </div>
      ))}
    </div>
  );
}
