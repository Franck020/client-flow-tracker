export interface Manager {
  id: string;
  name: string;
  password: string;
}

export interface Client {
  id: string;
  code: string;
  name: string;
  bi: string;
  phone: string;
  location: string;
  tap: string;
  contractDate: Date;
  hasSignal: boolean;
  monthsWithoutPayment: number;
  debt: number;
  payments: Payment[];
  isActive: boolean;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  date: Date;
  method: 'cash' | 'transfer';
  type: 'mensalidade' | 'multa';
  referenceMonth: string;
}

export interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  category: 'pagamento' | 'alimentacao' | 'salario' | 'agua' | 'outro';
  description: string;
  amount: number;
  date: Date;
  method?: 'cash' | 'transfer';
  clientId?: string;
  clientName?: string;
  managerName?: string;
}

export interface DailyReport {
  date: Date;
  totalEntradas: number;
  totalSaidas: number;
  balance: number;
  transactions: Transaction[];
}

export const PAYMENT_CONFIG = {
  MONTHLY_FEE: 3500,
  LATE_FEE: 500,
  HALF_MONTH_FEE: 1750,
  DUE_DAY: 15,
  INACTIVE_MONTHS_THRESHOLD: 3,
} as const;

export const BOSS_PASSWORD = '123454321';

export function calculatePaymentAmount(
  contractDate: Date,
  paymentDate: Date,
  referenceMonth: Date
): { amount: number; hasLateFee: boolean } {
  const contractDay = contractDate.getDate();
  const paymentDay = paymentDate.getDate();
  const isFirstMonthAfterContract =
    referenceMonth.getMonth() === contractDate.getMonth() + 1 ||
    (contractDate.getMonth() === 11 && referenceMonth.getMonth() === 0);

  const isHalfPayment = isFirstMonthAfterContract && contractDay >= 15 && contractDay <= 25;

  const baseAmount = isHalfPayment ? PAYMENT_CONFIG.HALF_MONTH_FEE : PAYMENT_CONFIG.MONTHLY_FEE;
  const hasLateFee = paymentDay > PAYMENT_CONFIG.DUE_DAY;

  return {
    amount: hasLateFee ? baseAmount + PAYMENT_CONFIG.LATE_FEE : baseAmount,
    hasLateFee,
  };
}

export function sortClientsByCode(clients: Client[]): Client[] {
  return [...clients].sort((a, b) => {
    const letterA = a.code.charAt(0);
    const letterB = b.code.charAt(0);

    if (letterA !== letterB) {
      return letterA.localeCompare(letterB);
    }

    const numA = parseInt(a.code.slice(1), 10);
    const numB = parseInt(b.code.slice(1), 10);

    return numA - numB;
  });
}

export function generateNextCode(existingCodes: string[], letter: string): string {
  const codesWithLetter = existingCodes.filter(code => code.startsWith(letter.toUpperCase()));
  const numbers = codesWithLetter.map(code => parseInt(code.slice(1), 10));
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `${letter.toUpperCase()}${maxNumber + 1}`;
}
