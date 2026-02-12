import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RegisterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterManagerModal({ isOpen, onClose }: RegisterManagerModalProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [bossPassword, setBossPassword] = useState('');
  const { registerManager, bossConfig } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bossConfig || bossPassword !== bossConfig.password) {
      toast.error('Senha do chefe incorrecta');
      return;
    }
    if (!name.trim() || !password.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    const success = await registerManager(name.trim(), password);
    if (success) {
      toast.success(`Gerente "${name}" registado com sucesso!`);
      setName('');
      setPassword('');
      setBossPassword('');
      onClose();
    } else {
      toast.error('Já existe um gerente com esse nome');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Registrar Gerente</DialogTitle>
              <DialogDescription>Necessário a senha do chefe</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name">Nome *</Label>
            <Input id="reg-name" placeholder="Nome do gerente" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-pass">Senha *</Label>
            <Input id="reg-pass" type="password" placeholder="Criar senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="boss-pass" className="flex items-center gap-1">
              <Shield className="h-3 w-3" /> Senha do Chefe *
            </Label>
            <Input id="boss-pass" type="password" placeholder="Senha de autorização" value={bossPassword} onChange={(e) => setBossPassword(e.target.value)} required />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Registrar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
