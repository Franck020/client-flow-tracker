import { useState, useCallback, useMemo } from 'react';
import { Transaction, DailyReport } from '@/types/client';
import { format, isToday, startOfDay, isSameDay } from 'date-fns';

const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'entrada',
    category: 'pagamento',
    description: 'Pagamento mensalidade - Francisco Zinova',
    amount: 3500,
    date: new Date(),
    method: 'cash',
    clientId: '1',
    clientName: 'Francisco Zinova',
  },
  {
    id: '2',
    type: 'saida',
    category: 'alimentacao',
    description: 'Almoço equipe',
    amount: 5000,
    date: new Date(),
  },
  {
    id: '3',
    type: 'entrada',
    category: 'pagamento',
    description: 'Pagamento mensalidade + multa - Ana Beatriz',
    amount: 4000,
    date: new Date(),
    method: 'transfer',
    clientId: '5',
    clientName: 'Ana Beatriz',
  },
  {
    id: '4',
    type: 'saida',
    category: 'agua',
    description: 'Conta de água do escritório',
    amount: 8500,
    date: new Date(),
  },
];

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTodayTransactions = useMemo(() => {
    return transactions.filter(t => isToday(t.date));
  }, [transactions]);

  const getTodayReport = useMemo((): DailyReport => {
    const todayTx = getTodayTransactions;
    const entradas = todayTx.filter(t => t.type === 'entrada');
    const saidas = todayTx.filter(t => t.type === 'saida');
    
    const totalEntradas = entradas.reduce((sum, t) => sum + t.amount, 0);
    const totalSaidas = saidas.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: startOfDay(new Date()),
      totalEntradas,
      totalSaidas,
      balance: totalEntradas - totalSaidas,
      transactions: todayTx,
    };
  }, [getTodayTransactions]);

  const getReportByDate = useCallback((date: Date): DailyReport => {
    const dayTx = transactions.filter(t => isSameDay(t.date, date));
    const entradas = dayTx.filter(t => t.type === 'entrada');
    const saidas = dayTx.filter(t => t.type === 'saida');
    
    const totalEntradas = entradas.reduce((sum, t) => sum + t.amount, 0);
    const totalSaidas = saidas.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: startOfDay(date),
      totalEntradas,
      totalSaidas,
      balance: totalEntradas - totalSaidas,
      transactions: dayTx,
    };
  }, [transactions]);

  const totalEntradas = useMemo(() => {
    return transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalSaidas = useMemo(() => {
    return transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    removeTransaction,
    getTodayTransactions,
    getTodayReport,
    getReportByDate,
    totalEntradas,
    totalSaidas,
    balance: totalEntradas - totalSaidas,
  };
}
