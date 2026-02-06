import { useState, useCallback, useMemo, useEffect } from 'react';
import { Transaction, DailyReport } from '@/types/client';
import { isToday, startOfDay, isSameDay } from 'date-fns';
import { getAll, put, remove as dbRemove } from '@/lib/db';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAll<Transaction>('transactions').then(stored => {
      const parsed = stored.map(t => ({ ...t, date: new Date(t.date) }));
      setTransactions(parsed);
      setLoaded(true);
    });
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    put('transactions', newTransaction);
    return newTransaction;
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    dbRemove('transactions', id);
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
    loaded,
  };
}
