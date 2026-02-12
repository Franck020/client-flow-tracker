import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wifi, Settings, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Setup() {
  const [step, setStep] = useState(1);
  const [bossName, setBossName] = useState('');
  const [bossEmail, setBossEmail] = useState('');
  const [bossPassword, setBossPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const { setupBoss, registerManager, login } = useAuth();
  const navigate = useNavigate();

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bossName.trim() || !bossEmail.trim() || !bossPassword.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (bossPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (bossPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerName.trim() || !managerPassword.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    await setupBoss(bossName.trim(), bossEmail.trim(), bossPassword);
    await registerManager(managerName.trim(), managerPassword);
    const success = await login(managerName.trim(), managerPassword);
    if (success) {
      toast.success('Configuração concluída! Bem-vindo ao GestorTV');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <Wifi className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">GestorTV</CardTitle>
            <CardDescription>
              {step === 1 ? 'Configuração Inicial — Dados do Chefe' : 'Configuração Inicial — Primeiro Gerente'}
            </CardDescription>
          </div>
          <div className="flex justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground flex items-start gap-2">
                <Settings className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Configure os dados do chefe. A senha do chefe será necessária para registar ou remover gerentes.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="boss-name">Nome do Chefe</Label>
                <Input id="boss-name" placeholder="Ex: Carlos Mendes" value={bossName} onChange={e => setBossName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boss-email">Email do Chefe</Label>
                <Input id="boss-email" type="email" placeholder="chefe@empresa.com" value={bossEmail} onChange={e => setBossEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boss-pass">Senha do Chefe</Label>
                <Input id="boss-pass" type="password" placeholder="Mínimo 6 caracteres" value={bossPassword} onChange={e => setBossPassword(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boss-pass-confirm">Confirmar Senha</Label>
                <Input id="boss-pass-confirm" type="password" placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" size="lg">
                Próximo <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStep2} className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground flex items-start gap-2">
                <Settings className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Crie o primeiro gerente que irá utilizar o sistema no dia-a-dia.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mgr-name">Nome do Gerente</Label>
                <Input id="mgr-name" placeholder="Ex: João Silva" value={managerName} onChange={e => setManagerName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mgr-pass">Senha do Gerente</Label>
                <Input id="mgr-pass" type="password" placeholder="Criar senha" value={managerPassword} onChange={e => setManagerPassword(e.target.value)} required />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
                <Button type="submit" className="flex-1">Concluir</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
