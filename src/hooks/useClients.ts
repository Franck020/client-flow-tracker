import { useState, useCallback, useMemo, useEffect } from 'react';
import { Client, Payment, sortClientsByCode, generateNextCode, PAYMENT_CONFIG } from '@/types/client';
import { getAll, put, remove as dbRemove, replaceAll } from '@/lib/db';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAll<Client>('clients').then(stored => {
      const parsed = stored.map(c => ({
        ...c,
        contractDate: new Date(c.contractDate),
        payments: (c.payments || []).map(p => ({ ...p, date: new Date(p.date) })),
      }));
      setClients(parsed);
      setLoaded(true);
    });
  }, []);

  const sortedClients = useMemo(() => sortClientsByCode(clients), [clients]);

  const activeClients = useMemo(
    () => sortedClients.filter(c => c.isActive),
    [sortedClients]
  );

  const inactiveClients = useMemo(
    () => sortedClients.filter(c => !c.isActive || c.monthsWithoutPayment >= PAYMENT_CONFIG.INACTIVE_MONTHS_THRESHOLD),
    [sortedClients]
  );

  const addClient = useCallback((clientData: Omit<Client, 'id' | 'code' | 'payments' | 'isActive' | 'monthsWithoutPayment' | 'debt' | 'hasSignal'>) => {
    const firstLetter = clientData.name.charAt(0).toUpperCase();
    const existingCodes = clients.map(c => c.code);
    const newCode = generateNextCode(existingCodes, firstLetter);

    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      code: newCode,
      payments: [],
      isActive: true,
      monthsWithoutPayment: 0,
      debt: 0,
      hasSignal: true,
    };

    setClients(prev => [...prev, newClient]);
    put('clients', newClient);
    return newClient;
  }, [clients]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => {
      const updated = prev.map(client =>
        client.id === id ? { ...client, ...updates } : client
      );
      const changed = updated.find(c => c.id === id);
      if (changed) put('clients', changed);
      return updated;
    });
  }, []);

  const removeClient = useCallback((id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    dbRemove('clients', id);
  }, []);

  const toggleSignal = useCallback((id: string) => {
    setClients(prev => {
      const updated = prev.map(client => {
        if (client.id === id) {
          const newHasSignal = !client.hasSignal;
          const newMonthsWithoutPayment = newHasSignal ? 0 : client.monthsWithoutPayment;
          return {
            ...client,
            hasSignal: newHasSignal,
            monthsWithoutPayment: newMonthsWithoutPayment,
            isActive: newMonthsWithoutPayment < PAYMENT_CONFIG.INACTIVE_MONTHS_THRESHOLD,
          };
        }
        return client;
      });
      const changed = updated.find(c => c.id === id);
      if (changed) put('clients', changed);
      return updated;
    });
  }, []);

  const makePayment = useCallback((clientId: string, payment: Omit<Payment, 'id' | 'clientId'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      clientId,
    };

    setClients(prev => {
      const updated = prev.map(client => {
        if (client.id === clientId) {
          const newDebt = Math.max(0, client.debt - payment.amount);
          return {
            ...client,
            debt: newDebt,
            monthsWithoutPayment: 0,
            hasSignal: true,
            isActive: true,
            payments: [...client.payments, newPayment],
          };
        }
        return client;
      });
      const changed = updated.find(c => c.id === clientId);
      if (changed) put('clients', changed);
      return updated;
    });

    return newPayment;
  }, []);

  const getClientById = useCallback((id: string) => {
    return clients.find(c => c.id === id);
  }, [clients]);

  return {
    clients: sortedClients,
    activeClients,
    inactiveClients,
    addClient,
    updateClient,
    removeClient,
    toggleSignal,
    makePayment,
    getClientById,
    loaded,
  };
}
