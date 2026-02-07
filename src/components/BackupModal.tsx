import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getAll, replaceAll } from '@/lib/db';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: () => void;
}

export function BackupModal({ isOpen, onClose, onRestore }: BackupModalProps) {
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const handleExport = async () => {
    try {
      const [managers, clients, transactions] = await Promise.all([
        getAll('managers'),
        getAll('clients'),
        getAll('transactions'),
      ]);
      const data = { version: 1, exportedAt: new Date().toISOString(), managers, clients, transactions };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gestornet-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Backup exportado com sucesso');
    } catch {
      toast.error('Erro ao exportar backup');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.managers || !data.clients || !data.transactions) {
          toast.error('Ficheiro de backup inválido');
          return;
        }
        await Promise.all([
          replaceAll('managers', data.managers),
          replaceAll('clients', data.clients),
          replaceAll('transactions', data.transactions),
        ]);
        toast.success('Backup restaurado com sucesso! A recarregar...');
        setTimeout(() => {
          onRestore();
          window.location.reload();
        }, 1000);
      } catch {
        toast.error('Erro ao ler ficheiro de backup');
      }
    };
    input.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Backup de Dados</DialogTitle>
          <DialogDescription>Exporte ou importe todos os dados do sistema</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Download className="h-4 w-4" /> Exportar Backup
            </h3>
            <p className="text-sm text-muted-foreground">
              Descarregue um ficheiro JSON com todos os gerentes, clientes e transacções.
            </p>
            <Button onClick={handleExport} className="w-full">
              <Download className="h-4 w-4 mr-2" /> Exportar Dados
            </Button>
          </div>

          <Separator />

          <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Upload className="h-4 w-4" /> Restaurar Backup
            </h3>
            <p className="text-sm text-muted-foreground">
              Importe um ficheiro de backup previamente exportado. Os dados actuais serão substituídos.
            </p>
            {!showRestoreConfirm ? (
              <Button variant="outline" onClick={() => setShowRestoreConfirm(true)} className="w-full">
                <Upload className="h-4 w-4 mr-2" /> Importar Dados
              </Button>
            ) : (
              <div className="space-y-3 p-3 rounded-lg border border-destructive bg-destructive/5">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-medium">Todos os dados actuais serão substituídos!</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowRestoreConfirm(false)} className="flex-1">Cancelar</Button>
                  <Button variant="destructive" size="sm" onClick={handleImport} className="flex-1">Confirmar</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
