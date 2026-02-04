import { useState, useCallback, useMemo } from 'react';
import { Client, Payment, sortClientsByCode, generateNextCode, PAYMENT_CONFIG } from '@/types/client';

// Mock initial data
const initialClients: Client[] = [
  {
    id: '1',
    code: 'F1',
    name: 'Francisco Zinova',
    bi: '000123456LA001',
    phone: '+244 923 456 789',
    location: 'Sonef',
    tap: 'Gina',
    contractDate: new Date('2024-01-10'),
    hasSignal: true,
    monthsWithoutPayment: 0,
    debt: 0,
    payments: [],
    isActive: true,
  },
  {
    id: '2',
    code: 'F2',
    name: 'Francisco Pedro',
    bi: '000123457LA002',
    phone: '+244 923 456 790',
    location: 'Sonef',
    tap: 'Gina',
    contractDate: new Date('2024-02-15'),
    hasSignal: true,
    monthsWithoutPayment: 1,
    debt: 3500,
    payments: [],
    isActive: true,
  },
  {
    id: '3',
    code: 'M4',
    name: 'Maria Afonso',
    bi: '000123458LA003',
    phone: '+244 923 456 791',
    location: 'Sonef',
    tap: 'Gina',
    contractDate: new Date('2023-11-20'),
    hasSignal: true,
    monthsWithoutPayment: 0,
    debt: 0,
    payments: [],
    isActive: true,
  },
  {
    id: '4',
    code: 'M32',
    name: 'Marcelo Coelho',
    bi: '000123459LA004',
    phone: '+244 923 456 792',
    location: 'Sonef',
    tap: 'Gina',
    contractDate: new Date('2023-10-05'),
    hasSignal: false,
    monthsWithoutPayment: 4,
    debt: 14500,
    payments: [],
    isActive: false,
  },
  {
    id: '5',
    code: 'A1',
    name: 'Ana Beatriz',
    bi: '000123460LA005',
    phone: '+244 923 456 793',
    location: 'Morro Bento',
    tap: 'Central',
    contractDate: new Date('2024-01-01'),
    hasSignal: true,
    monthsWithoutPayment: 0,
    debt: 0,
    payments: [],
    isActive: true,
  },
  {
    id: '6',
    code: 'J3',
    name: 'João Silva',
    bi: '000123461LA006',
    phone: '+244 923 456 794',
    location: 'Talatona',
    tap: 'Norte',
    contractDate: new Date('2023-09-12'),
    hasSignal: false,
    monthsWithoutPayment: 5,
    debt: 18000,
    payments: [],
    isActive: false,
  },
  {
    id: '7',
    code: 'C2',
    name: 'Carlos Mendes',
    bi: '000123462LA007',
    phone: '+244 923 456 795',
    location: 'Kilamba',
    tap: 'Sul',
    contractDate: new Date('2024-01-20'),
    hasSignal: true,
    monthsWithoutPayment: 2,
    debt: 7000,
    payments: [],
    isActive: true,
  },
];

export function useClients() {
  const [clients, setClients] = useState<Client[]>(initialClients);

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
    return newClient;
  }, [clients]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
  }, []);

  const removeClient = useCallback((id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  }, []);

  const toggleSignal = useCallback((id: string) => {
    setClients(prev => prev.map(client => {
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
    }));
  }, []);

  const makePayment = useCallback((clientId: string, payment: Omit<Payment, 'id' | 'clientId'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      clientId,
    };

    setClients(prev => prev.map(client => {
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
    }));

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
  };
}
