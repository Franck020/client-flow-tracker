import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/types/client';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const expenseCategories = [
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'salario', label: 'Salário' },
  { value: 'agua', label: 'Água' },
  { value: 'outro', label: 'Outro' },
];

export function AddTransactionModal({ isOpen, onClose, onAddTransaction }: AddTransactionModalProps) {
  const [type, setType] = useState<'entrada' | 'saida'>('entrada');
  const [category, setCategory] = useState<string>('pagamento');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0 && description) {
      onAddTransaction({
        type,
        category: category as Transaction['category'],
        description,
        amount: parsedAmount,
        date: new Date(),
        method: type === 'entrada' ? method : undefined,
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setType('entrada');
    setCategory('pagamento');
    setDescription('');
    setAmount('');
    setMethod('cash');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Nova Transacção</DialogTitle>
              <DialogDescription>
                Registre uma entrada ou saída
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Tipo de Transacção</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('entrada');
                  setCategory('pagamento');
                }}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                  type === 'entrada' 
                    ? "border-income bg-income-bg text-income" 
                    : "border-border hover:border-income/50"
                )}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Entrada</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('saida');
                  setCategory('alimentacao');
                }}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all",
                  type === 'saida' 
                    ? "border-expense bg-expense-bg text-expense" 
                    : "border-border hover:border-expense/50"
                )}
              >
                <TrendingDown className="h-5 w-5" />
                <span className="font-medium">Saída</span>
              </button>
            </div>
          </div>

          {/* Category */}
          {type === 'saida' && (
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Payment Method for entries */}
          {type === 'entrada' && (
            <div className="space-y-2">
              <Label>Método de Pagamento</Label>
              <RadioGroup 
                value={method} 
                onValueChange={(v) => setMethod(v as 'cash' | 'transfer')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash-tx" />
                  <Label htmlFor="cash-tx">Dinheiro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transfer" id="transfer-tx" />
                  <Label htmlFor="transfer-tx">Transferência</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder={type === 'entrada' ? "Ex: Pagamento mensalidade - João" : "Ex: Almoço da equipe"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (Kz) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Ex: 3500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className={cn(
                "flex-1",
                type === 'saida' && "bg-expense hover:bg-expense/90"
              )}
            >
              {type === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
