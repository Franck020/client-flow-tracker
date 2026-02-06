import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus, CreditCard } from 'lucide-react';
import { PAYMENT_CONFIG } from '@/types/client';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (clientData: {
    name: string;
    bi: string;
    phone: string;
    location: string;
    tap: string;
    contractDate: Date;
    initialPayment?: {
      amount: number;
      method: 'cash' | 'transfer';
    };
  }) => void;
}

export function AddClientModal({ isOpen, onClose, onAddClient }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    bi: '',
    phone: '',
    location: '',
    tap: '',
    contractDate: new Date().toISOString().split('T')[0],
  });
  const [includePayment, setIncludePayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(PAYMENT_CONFIG.MONTHLY_FEE.toString());
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.bi && formData.phone && formData.location && formData.tap) {
      onAddClient({
        ...formData,
        contractDate: new Date(formData.contractDate),
        initialPayment: includePayment && parseFloat(paymentAmount) > 0
          ? { amount: parseFloat(paymentAmount), method: paymentMethod }
          : undefined,
      });
      setFormData({
        name: '',
        bi: '',
        phone: '',
        location: '',
        tap: '',
        contractDate: new Date().toISOString().split('T')[0],
      });
      setIncludePayment(false);
      setPaymentAmount(PAYMENT_CONFIG.MONTHLY_FEE.toString());
      setPaymentMethod('cash');
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              <DialogDescription>Preencha os dados do novo cliente</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input id="name" placeholder="Ex: Francisco Zinova" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
            <p className="text-xs text-muted-foreground">O código será gerado automaticamente (ex: F1, F2...)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bi">Nº do Bilhete de Identidade *</Label>
            <Input id="bi" placeholder="Ex: 000123456LA001" value={formData.bi} onChange={(e) => handleChange('bi', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input id="phone" placeholder="Ex: +244 923 456 789" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localização *</Label>
              <Input id="location" placeholder="Ex: Sonef" value={formData.location} onChange={(e) => handleChange('location', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tap">TAP *</Label>
              <Input id="tap" placeholder="Ex: Gina" value={formData.tap} onChange={(e) => handleChange('tap', e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractDate">Data do Contrato *</Label>
            <Input id="contractDate" type="date" value={formData.contractDate} onChange={(e) => handleChange('contractDate', e.target.value)} required />
          </div>

          {/* Contract Payment Option */}
          <div className="space-y-3 p-4 rounded-lg border bg-secondary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <Label htmlFor="include-payment" className="font-medium">Pagamento do Contrato</Label>
              </div>
              <Switch id="include-payment" checked={includePayment} onCheckedChange={setIncludePayment} />
            </div>

            {includePayment && (
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="pay-amount">Valor (Kz)</Label>
                  <Input id="pay-amount" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} min="1" />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setPaymentAmount(PAYMENT_CONFIG.MONTHLY_FEE.toString())}>
                      {PAYMENT_CONFIG.MONTHLY_FEE.toLocaleString('pt-AO')} Kz
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setPaymentAmount(PAYMENT_CONFIG.HALF_MONTH_FEE.toString())}>
                      {PAYMENT_CONFIG.HALF_MONTH_FEE.toLocaleString('pt-AO')} Kz (metade)
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Método</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cash' | 'transfer')} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="add-cash" />
                      <Label htmlFor="add-cash">Dinheiro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="transfer" id="add-transfer" />
                      <Label htmlFor="add-transfer">Transferência</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Adicionar Cliente</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
