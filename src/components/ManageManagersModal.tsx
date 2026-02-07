import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ManageManagersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageManagersModal({ isOpen, onClose }: ManageManagersModalProps) {
  const { managers, manager: currentManager, deleteManager } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bossPassword, setBossPassword] = useState('');

  const handleDelete = async (id: string) => {
    const success = await deleteManager(id, bossPassword);
    if (success) {
      toast.success('Gerente excluído com sucesso');
      setDeletingId(null);
      setBossPassword('');
    } else {
      toast.error('Senha do chefe incorrecta ou não pode excluir a si mesmo');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Gerentes</DialogTitle>
              <DialogDescription>{managers.length} gerente(s) registado(s)</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {managers.map((mgr) => (
            <div key={mgr.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <span className="font-medium">{mgr.name}</span>
                {mgr.id === currentManager?.id && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Você</span>
                )}
              </div>
              {mgr.id !== currentManager?.id && (
                <>
                  {deletingId === mgr.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        placeholder="Senha do chefe"
                        value={bossPassword}
                        onChange={(e) => setBossPassword(e.target.value)}
                        className="h-8 w-36 text-sm"
                      />
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(mgr.id)}>
                        <Shield className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setDeletingId(null); setBossPassword(''); }}>
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeletingId(mgr.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
