import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Client, PAYMENT_CONFIG } from '@/types/client';
import { StatusBadge, SignalIndicator } from './StatusBadge';
import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar,
  Wifi,
  WifiOff,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ClientDetailsModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onMakePayment: (clientId: string, amount: number, method: 'cash' | 'transfer') => void;
  onToggleSignal: (clientId: string) => void;
  onRemoveClient: (clientId: string) => void;
}

export function ClientDetailsModal({
  client,
  isOpen,
  onClose,
  onMakePayment,
  onToggleSignal,
  onRemoveClient,
}: ClientDetailsModalProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!client) return null;

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      onMakePayment(client.id, amount, paymentMethod);
      setPaymentAmount('');
      setShowPaymentForm(false);
    }
  };

  const handleDelete = () => {
    onRemoveClient(client.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const suggestedAmount = client.debt > 0 ? client.debt : PAYMENT_CONFIG.MONTHLY_FEE;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
              client.hasSignal ? "bg-status-active-bg text-status-active" : "bg-status-inactive-bg text-status-inactive"
            )}>
              {client.code}
            </div>
            <div>
              <DialogTitle className="text-xl">{client.name}</DialogTitle>
              <DialogDescription>
                <StatusBadge 
                  hasSignal={client.hasSignal} 
                  monthsWithoutPayment={client.monthsWithoutPayment}
                />
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Informações do Cliente
            </h3>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nº do BI</p>
                  <p className="font-medium">{client.bi}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Localização</p>
                  <p className="font-medium">{client.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Wifi className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">TAP</p>
                  <p className="font-medium">{client.tap}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Data do Contrato</p>
                  <p className="font-medium">
                    {format(client.contractDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Situação Financeira
            </h3>
            
            <div className={cn(
              "p-4 rounded-lg",
              client.debt > 0 ? "bg-status-inactive-bg" : "bg-status-active-bg"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dívida Atual</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    client.debt > 0 ? "text-status-inactive" : "text-status-active"
                  )}>
                    {client.debt.toLocaleString('pt-AO')} Kz
                  </p>
                </div>
                {client.monthsWithoutPayment > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Meses em atraso</p>
                    <p className="text-lg font-bold text-status-warning">
                      {client.monthsWithoutPayment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Signal Control */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Controlo do Sinal
            </h3>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <SignalIndicator hasSignal={client.hasSignal} size="lg" />
                <div>
                  <p className="font-medium">
                    {client.hasSignal ? 'Sinal Activo' : 'Sinal Cortado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {client.hasSignal ? 'Cliente a receber serviço' : 'Serviço suspenso'}
                  </p>
                </div>
              </div>
              <Switch
                checked={client.hasSignal}
                onCheckedChange={() => onToggleSignal(client.id)}
              />
            </div>
          </div>

          <Separator />

          {/* Payment Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Pagamento
            </h3>
            
            {!showPaymentForm ? (
              <Button 
                onClick={() => setShowPaymentForm(true)}
                className="w-full"
                size="lg"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Registrar Pagamento
              </Button>
            ) : (
              <div className="space-y-4 p-4 rounded-lg border bg-card">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (Kz)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={`Sugerido: ${suggestedAmount.toLocaleString('pt-AO')} Kz`}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPaymentAmount(PAYMENT_CONFIG.MONTHLY_FEE.toString())}
                    >
                      {PAYMENT_CONFIG.MONTHLY_FEE.toLocaleString('pt-AO')} Kz
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setPaymentAmount((PAYMENT_CONFIG.MONTHLY_FEE + PAYMENT_CONFIG.LATE_FEE).toString())}
                    >
                      {(PAYMENT_CONFIG.MONTHLY_FEE + PAYMENT_CONFIG.LATE_FEE).toLocaleString('pt-AO')} Kz (c/ multa)
                    </Button>
                    {client.debt > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPaymentAmount(client.debt.toString())}
                      >
                        Quitar dívida
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Método de Pagamento</Label>
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={(v) => setPaymentMethod(v as 'cash' | 'transfer')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Dinheiro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label htmlFor="transfer">Transferência</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handlePayment}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                    className="flex-1"
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-4">
            {!showDeleteConfirm ? (
              <Button 
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover Cliente
              </Button>
            ) : (
              <div className="p-4 rounded-lg border border-destructive bg-destructive/5 space-y-3">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">Confirmar exclusão?</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Esta acção não pode ser desfeita. Todos os dados do cliente serão perdidos.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDelete}
                    className="flex-1"
                  >
                    Confirmar Exclusão
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
