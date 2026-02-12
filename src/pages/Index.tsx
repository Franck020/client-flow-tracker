import { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { Client, Transaction as TxType, PAYMENT_CONFIG } from '@/types/client';
import { StatCard } from '@/components/StatCard';
import { ClientList } from '@/components/ClientList';
import { ClientDetailsModal } from '@/components/ClientDetailsModal';
import { AddClientModal } from '@/components/AddClientModal';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { TransactionList } from '@/components/TransactionList';
import { DailyReportModal } from '@/components/DailyReportModal';
import { RegisterManagerModal } from '@/components/RegisterManagerModal';
import { ManageManagersModal } from '@/components/ManageManagersModal';
import { EditClientModal } from '@/components/EditClientModal';
import { BackupModal } from '@/components/BackupModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Users, UserX, TrendingUp, Plus, Search,
  Calendar, BarChart3, Wifi, LogOut, FileText, UserPlus, Users as UsersIcon, Database
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Index = () => {
  const { manager, logout } = useAuth();
  const {
    clients, activeClients, inactiveClients,
    addClient, updateClient, removeClient, toggleSignal, makePayment, loaded: clientsLoaded
  } = useClients();
  const {
    addTransaction, getTodayTransactions, getTodayReport, getReportByDate, loaded: txLoaded
  } = useTransactions();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isManagersOpen, setIsManagersOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
  };

  const handleMakePayment = (clientId: string, amount: number, method: 'cash' | 'transfer') => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      makePayment(clientId, {
        amount, date: new Date(), method,
        type: 'mensalidade',
        referenceMonth: format(new Date(), 'yyyy-MM'),
      });
      addTransaction({
        type: 'entrada', category: 'pagamento',
        description: `Pagamento mensalidade - ${client.name}`,
        amount, date: new Date(), method,
        clientId: client.id, clientName: client.name,
        managerName: manager?.name,
      });
    }
  };

  const handleAddClient = (clientData: Parameters<typeof addClient>[0] & { initialPayment?: { amount: number; method: 'cash' | 'transfer' } }) => {
    const { initialPayment, ...data } = clientData;
    const newClient = addClient(data);
    if (initialPayment) {
      makePayment(newClient.id, {
        amount: initialPayment.amount, date: new Date(),
        method: initialPayment.method, type: 'mensalidade',
        referenceMonth: format(new Date(), 'yyyy-MM'),
      });
      addTransaction({
        type: 'entrada', category: 'pagamento',
        description: `Pagamento contrato - ${newClient.name}`,
        amount: initialPayment.amount, date: new Date(),
        method: initialPayment.method,
        clientId: newClient.id, clientName: newClient.name,
        managerName: manager?.name,
      });
    }
  };

  const handleAddTransaction = (transaction: Omit<TxType, 'id'>) => {
    addTransaction({ ...transaction, managerName: manager?.name });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayReport = getTodayReport;

  if (!clientsLoaded || !txLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">A carregar dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Wifi className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">GestorTV</h1>
              <p className="text-xs text-muted-foreground">Gerente: {manager?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setIsReportOpen(true)}>
              <FileText className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Relatório</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsAddTransactionOpen(true)}>
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Transacção</span>
            </Button>
            <Button size="sm" onClick={() => setIsAddClientOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Novo Cliente</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsRegisterOpen(true)} title="Registrar gerente">
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsManagersOpen(true)} title="Gerentes">
              <UsersIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsBackupOpen(true)} title="Backup">
              <Database className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Clientes" value={clients.length} subtitle={`${activeClients.length} activos`} type="info" icon={<Users className="h-5 w-5" />} />
          <StatCard title="Clientes Inativos" value={inactiveClients.length} subtitle="3+ meses sem sinal" type="warning" icon={<UserX className="h-5 w-5" />} />
          <StatCard title="Entradas Hoje" value={`${todayReport.totalEntradas.toLocaleString('pt-AO')} Kz`} subtitle={`${getTodayTransactions.filter(t => t.type === 'entrada').length} transacções`} type="income" />
          <StatCard title="Saídas Hoje" value={`${todayReport.totalSaidas.toLocaleString('pt-AO')} Kz`} subtitle={`${getTodayTransactions.filter(t => t.type === 'saida').length} transacções`} type="expense" />
        </div>

        {/* Daily Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Relatório do Dia</CardTitle>
              </div>
              <div className={`text-xl font-bold ${todayReport.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                Saldo: {todayReport.balance >= 0 ? '+' : ''}{todayReport.balance.toLocaleString('pt-AO')} Kz
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-income-bg">
                <p className="text-2xl font-bold text-income">+{todayReport.totalEntradas.toLocaleString('pt-AO')} Kz</p>
                <p className="text-sm text-muted-foreground">Total Entradas</p>
              </div>
              <div className="p-4 rounded-lg bg-expense-bg">
                <p className="text-2xl font-bold text-expense">-{todayReport.totalSaidas.toLocaleString('pt-AO')} Kz</p>
                <p className="text-sm text-muted-foreground">Total Saídas</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <p className={`text-2xl font-bold ${todayReport.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                  {todayReport.balance.toLocaleString('pt-AO')} Kz
                </p>
                <p className="text-sm text-muted-foreground">Balanço</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="inactive" className="gap-2">
              <UserX className="h-4 w-4" />
              <span className="hidden sm:inline">Inativos</span>
              {inactiveClients.length > 0 && (
                <span className="ml-1 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {inactiveClients.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Transacções</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Lista de Clientes</CardTitle>
                    <CardDescription>{clients.length} clientes registados • Ordenados por código</CardDescription>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar cliente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <ClientList clients={filteredClients} onClientClick={handleClientClick} emptyMessage={searchQuery ? "Nenhum cliente encontrado" : "Nenhum cliente registado"} />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-destructive" /> Clientes Inativos
                </CardTitle>
                <CardDescription>Clientes com 3 ou mais meses sem sinal ou pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <ClientList clients={inactiveClients} onClientClick={handleClientClick} emptyMessage="Nenhum cliente inativo 🎉" />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transacções de Hoje</CardTitle>
                    <CardDescription>{getTodayTransactions.length} movimentações</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddTransactionOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Nova Transacção
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <TransactionList transactions={getTodayTransactions} />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-card mt-8">
        <div className="container py-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>💰 Mensalidade: <strong>{PAYMENT_CONFIG.MONTHLY_FEE.toLocaleString('pt-AO')} Kz</strong></span>
            <span>•</span>
            <span>📅 Vencimento: até dia <strong>{PAYMENT_CONFIG.DUE_DAY}</strong></span>
            <span>•</span>
            <span>⚠️ Multa: <strong>{PAYMENT_CONFIG.LATE_FEE.toLocaleString('pt-AO')} Kz</strong></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ClientDetailsModal
        client={selectedClient}
        isOpen={isClientModalOpen}
        onClose={() => { setIsClientModalOpen(false); setSelectedClient(null); }}
        onMakePayment={handleMakePayment}
        onToggleSignal={toggleSignal}
        onRemoveClient={removeClient}
        onEditClient={(client) => setEditingClient(client)}
      />
      <EditClientModal
        client={editingClient}
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSave={updateClient}
      />
      <AddClientModal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} onAddClient={handleAddClient} />
      <AddTransactionModal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} onAddTransaction={handleAddTransaction} />
      <DailyReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} report={todayReport} managerName={manager?.name || ''} getReportByDate={getReportByDate} />
      <RegisterManagerModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ManageManagersModal isOpen={isManagersOpen} onClose={() => setIsManagersOpen(false)} />
      <BackupModal isOpen={isBackupOpen} onClose={() => setIsBackupOpen(false)} onRestore={() => {}} />
    </div>
  );
};

export default Index;
