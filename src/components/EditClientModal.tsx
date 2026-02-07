import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Client } from '@/types/client';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface EditClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Client>) => void;
}

export function EditClientModal({ client, isOpen, onClose, onSave }: EditClientModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [tap, setTap] = useState('');
  const [bi, setBi] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPhone(client.phone);
      setLocation(client.location);
      setTap(client.tap);
      setBi(client.bi);
    }
  }, [client]);

  if (!client) return null;

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('O nome é obrigatório');
      return;
    }
    onSave(client.id, { name: name.trim(), phone: phone.trim(), location: location.trim(), tap: tap.trim(), bi: bi.trim() });
    toast.success('Dados do cliente actualizados');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" /> Editar Cliente
          </DialogTitle>
          <DialogDescription>Altere os dados do cliente {client.code}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {[
            { id: 'edit-name', label: 'Nome', value: name, setter: setName },
            { id: 'edit-bi', label: 'Nº do BI', value: bi, setter: setBi },
            { id: 'edit-phone', label: 'Telefone', value: phone, setter: setPhone },
            { id: 'edit-location', label: 'Localização', value: location, setter: setLocation },
            { id: 'edit-tap', label: 'TAP', value: tap, setter: setTap },
          ].map(({ id, label, value, setter }) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>{label}</Label>
              <Input id={id} value={value} onChange={(e) => setter(e.target.value)} />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleSave} className="flex-1">Guardar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
