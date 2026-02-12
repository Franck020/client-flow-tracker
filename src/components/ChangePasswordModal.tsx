import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KeyRound, Shield, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { manager, changeBossPassword, changeManagerPassword } = useAuth();

  // Boss password state
  const [currentBossPass, setCurrentBossPass] = useState('');
  const [newBossPass, setNewBossPass] = useState('');
  const [confirmBossPass, setConfirmBossPass] = useState('');

  // Manager password state
  const [currentMgrPass, setCurrentMgrPass] = useState('');
  const [newMgrPass, setNewMgrPass] = useState('');
  const [confirmMgrPass, setConfirmMgrPass] = useState('');

  const resetBoss = () => { setCurrentBossPass(''); setNewBossPass(''); setConfirmBossPass(''); };
  const resetMgr = () => { setCurrentMgrPass(''); setNewMgrPass(''); setConfirmMgrPass(''); };

  const handleChangeBoss = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBossPass.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newBossPass !== confirmBossPass) {
      toast.error('As senhas não coincidem');
      return;
    }
    const success = await changeBossPassword(currentBossPass, newBossPass);
    if (success) {
      toast.success('Senha do chefe alterada com sucesso!');
      resetBoss();
      onClose();
    } else {
      toast.error('Senha actual do chefe incorrecta');
    }
  };

  const handleChangeMgr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMgrPass.length < 4) {
      toast.error('A nova senha deve ter pelo menos 4 caracteres');
      return;
    }
    if (newMgrPass !== confirmMgrPass) {
      toast.error('As senhas não coincidem');
      return;
    }
    const success = await changeManagerPassword(currentMgrPass, newMgrPass);
    if (success) {
      toast.success('Sua senha foi alterada com sucesso!');
      resetMgr();
      onClose();
    } else {
      toast.error('Senha actual incorrecta');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetBoss(); resetMgr(); onClose(); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Alterar Senha</DialogTitle>
              <DialogDescription>Altere a senha do chefe ou a sua própria</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="manager" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manager" className="gap-1.5">
              <User className="h-3.5 w-3.5" /> Minha Senha
            </TabsTrigger>
            <TabsTrigger value="boss" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Senha do Chefe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manager">
            <form onSubmit={handleChangeMgr} className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Alterar a senha do gerente <strong>{manager?.name}</strong>
              </p>
              <div className="space-y-2">
                <Label htmlFor="cur-mgr-pass">Senha Actual</Label>
                <Input id="cur-mgr-pass" type="password" placeholder="Sua senha actual" value={currentMgrPass} onChange={e => setCurrentMgrPass(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-mgr-pass">Nova Senha</Label>
                <Input id="new-mgr-pass" type="password" placeholder="Mínimo 4 caracteres" value={newMgrPass} onChange={e => setNewMgrPass(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conf-mgr-pass">Confirmar Nova Senha</Label>
                <Input id="conf-mgr-pass" type="password" placeholder="Repita a nova senha" value={confirmMgrPass} onChange={e => setConfirmMgrPass(e.target.value)} required />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
                <Button type="submit" className="flex-1">Alterar</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="boss">
            <form onSubmit={handleChangeBoss} className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Alterar a senha mestra do chefe. Necessária para registar/remover gerentes.
              </p>
              <div className="space-y-2">
                <Label htmlFor="cur-boss-pass">Senha Actual do Chefe</Label>
                <Input id="cur-boss-pass" type="password" placeholder="Senha actual" value={currentBossPass} onChange={e => setCurrentBossPass(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-boss-pass">Nova Senha do Chefe</Label>
                <Input id="new-boss-pass" type="password" placeholder="Mínimo 6 caracteres" value={newBossPass} onChange={e => setNewBossPass(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conf-boss-pass">Confirmar Nova Senha</Label>
                <Input id="conf-boss-pass" type="password" placeholder="Repita a nova senha" value={confirmBossPass} onChange={e => setConfirmBossPass(e.target.value)} required />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
                <Button type="submit" className="flex-1">Alterar</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
