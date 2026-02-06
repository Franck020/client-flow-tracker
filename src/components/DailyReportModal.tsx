import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DailyReport } from '@/types/client';
import { Printer, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DailyReport;
  managerName: string;
}

const categoryLabels: Record<string, string> = {
  pagamento: 'Pagamento',
  alimentacao: 'Alimentação',
  salario: 'Salário',
  agua: 'Água',
  outro: 'Outro',
};

export function DailyReportModal({ isOpen, onClose, report, managerName }: DailyReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const entradas = report.transactions.filter(t => t.type === 'entrada');
  const saidas = report.transactions.filter(t => t.type === 'saida');

  const cashEntradas = entradas.filter(t => t.method === 'cash');
  const transferEntradas = entradas.filter(t => t.method === 'transfer');
  const totalCash = cashEntradas.reduce((s, t) => s + t.amount, 0);
  const totalTransfer = transferEntradas.reduce((s, t) => s + t.amount, 0);

  const categorySums: Record<string, number> = {};
  saidas.forEach(t => {
    categorySums[t.category] = (categorySums[t.category] || 0) + t.amount;
  });

  const handlePrint = () => {
    const content = reportRef.current;
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Relatório Diário - GestorNet</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #1a1a2e; max-width: 700px; margin: 0 auto; }
        h1 { font-size: 20px; margin-bottom: 4px; text-align: center; }
        h2 { font-size: 15px; margin: 16px 0 8px; border-bottom: 2px solid #333; padding-bottom: 4px; }
        .meta { font-size: 12px; color: #666; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
        th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        .right { text-align: right; }
        .summary { margin-top: 16px; padding: 12px; border: 2px solid #333; }
        .row { display: flex; justify-content: space-between; padding: 3px 0; }
        .income { color: #16a34a; }
        .expense { color: #dc2626; }
        .bold { font-weight: bold; }
        .footer { margin-top: 30px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #ccc; padding-top: 8px; }
        hr { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
      </style></head><body>
      <h1>GestorNet - Relatório Diário</h1>
      <p class="meta">${format(report.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
      <p class="meta">Gerente: ${managerName}</p>
      <hr/>
      <h2>📥 Entradas (${entradas.length} transacções)</h2>
      ${entradas.length > 0 ? `<table><tr><th>Descrição</th><th>Método</th><th>Hora</th><th class="right">Valor</th></tr>
      ${entradas.map(t => `<tr><td>${t.description}</td><td>${t.method === 'cash' ? 'Dinheiro' : 'Transferência'}</td><td>${format(new Date(t.date), 'HH:mm')}</td><td class="right income">${t.amount.toLocaleString('pt-AO')} Kz</td></tr>`).join('')}
      </table>` : '<p>Nenhuma entrada</p>'}
      <div class="row"><span>💵 Dinheiro (${cashEntradas.length})</span><span>${totalCash.toLocaleString('pt-AO')} Kz</span></div>
      <div class="row"><span>🏦 Transferência (${transferEntradas.length})</span><span>${totalTransfer.toLocaleString('pt-AO')} Kz</span></div>
      <div class="row bold income"><span>Total Entradas</span><span>${report.totalEntradas.toLocaleString('pt-AO')} Kz</span></div>
      <hr/>
      <h2>📤 Saídas (${saidas.length} transacções)</h2>
      ${saidas.length > 0 ? `<table><tr><th>Descrição</th><th>Categoria</th><th>Hora</th><th class="right">Valor</th></tr>
      ${saidas.map(t => `<tr><td>${t.description}</td><td>${categoryLabels[t.category] || t.category}</td><td>${format(new Date(t.date), 'HH:mm')}</td><td class="right expense">${t.amount.toLocaleString('pt-AO')} Kz</td></tr>`).join('')}
      </table>` : '<p>Nenhuma saída</p>'}
      ${Object.entries(categorySums).map(([cat, sum]) => `<div class="row"><span>${categoryLabels[cat] || cat}</span><span>${sum.toLocaleString('pt-AO')} Kz</span></div>`).join('')}
      <div class="row bold expense"><span>Total Saídas</span><span>${report.totalSaidas.toLocaleString('pt-AO')} Kz</span></div>
      <hr/>
      <div class="summary">
        <h2>📊 Resumo</h2>
        <div class="row income bold"><span>Total Entradas</span><span>+${report.totalEntradas.toLocaleString('pt-AO')} Kz</span></div>
        <div class="row expense bold"><span>Total Saídas</span><span>-${report.totalSaidas.toLocaleString('pt-AO')} Kz</span></div>
        <hr/>
        <div class="row bold" style="font-size:16px;color:${report.balance >= 0 ? '#16a34a' : '#dc2626'}"><span>Balanço</span><span>${report.balance >= 0 ? '+' : ''}${report.balance.toLocaleString('pt-AO')} Kz</span></div>
      </div>
      <div class="footer">GestorNet • Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</div>
      </body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <DialogTitle>Relatório do Dia</DialogTitle>
            </div>
            <Button onClick={handlePrint} size="sm">
              <Printer className="h-4 w-4 mr-2" /> Imprimir
            </Button>
          </div>
        </DialogHeader>

        <div ref={reportRef} className="space-y-4 py-2">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {format(report.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-sm text-muted-foreground">Gerente: {managerName}</p>
          </div>

          <Separator />

          {/* Entradas */}
          <div>
            <h3 className="font-semibold text-income mb-2">📥 Entradas ({entradas.length})</h3>
            {entradas.length > 0 ? (
              <div className="space-y-1">
                {entradas.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm p-2 rounded bg-income-bg">
                    <div>
                      <span className="font-medium">{t.description}</span>
                      <span className="text-muted-foreground ml-2">
                        ({t.method === 'cash' ? 'Dinheiro' : 'Transferência'} • {format(new Date(t.date), 'HH:mm')})
                      </span>
                    </div>
                    <span className="font-bold text-income">+{t.amount.toLocaleString('pt-AO')} Kz</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Nenhuma entrada</p>}
            <div className="mt-2 text-sm space-y-1 pl-2">
              <div className="flex justify-between"><span>💵 Dinheiro ({cashEntradas.length})</span><span>{totalCash.toLocaleString('pt-AO')} Kz</span></div>
              <div className="flex justify-between"><span>🏦 Transferência ({transferEntradas.length})</span><span>{totalTransfer.toLocaleString('pt-AO')} Kz</span></div>
              <div className="flex justify-between font-bold text-income"><span>Total</span><span>{report.totalEntradas.toLocaleString('pt-AO')} Kz</span></div>
            </div>
          </div>

          <Separator />

          {/* Saídas */}
          <div>
            <h3 className="font-semibold text-expense mb-2">📤 Saídas ({saidas.length})</h3>
            {saidas.length > 0 ? (
              <div className="space-y-1">
                {saidas.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-sm p-2 rounded bg-expense-bg">
                    <div>
                      <span className="font-medium">{t.description}</span>
                      <span className="text-muted-foreground ml-2">
                        ({categoryLabels[t.category] || t.category} • {format(new Date(t.date), 'HH:mm')})
                      </span>
                    </div>
                    <span className="font-bold text-expense">-{t.amount.toLocaleString('pt-AO')} Kz</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Nenhuma saída</p>}
            <div className="mt-2 text-sm space-y-1 pl-2">
              {Object.entries(categorySums).map(([cat, sum]) => (
                <div key={cat} className="flex justify-between">
                  <span>{categoryLabels[cat] || cat}</span>
                  <span>{sum.toLocaleString('pt-AO')} Kz</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-expense"><span>Total</span><span>{report.totalSaidas.toLocaleString('pt-AO')} Kz</span></div>
            </div>
          </div>

          <Separator />

          {/* Resumo */}
          <div className="p-4 rounded-lg bg-secondary">
            <h3 className="font-bold mb-3">📊 Resumo do Dia</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-income"><span>Total Entradas</span><span className="font-bold">+{report.totalEntradas.toLocaleString('pt-AO')} Kz</span></div>
              <div className="flex justify-between text-expense"><span>Total Saídas</span><span className="font-bold">-{report.totalSaidas.toLocaleString('pt-AO')} Kz</span></div>
              <Separator />
              <div className={`flex justify-between text-lg font-bold ${report.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                <span>Balanço</span>
                <span>{report.balance >= 0 ? '+' : ''}{report.balance.toLocaleString('pt-AO')} Kz</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
