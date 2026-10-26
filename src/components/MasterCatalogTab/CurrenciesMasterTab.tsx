import React, { useState } from 'react';
import { MasterCurrency } from '../../types';
import { CurrenciesMasterTable } from './CurrenciesMasterTable';
import { CurrencyMasterModal } from './CurrencyMasterModal';
import { Coins, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  currencies: MasterCurrency[];
  onSaveCurrency: (cur: Partial<MasterCurrency>) => Promise<boolean>;
  onDeleteCurrency: (cur: MasterCurrency) => Promise<boolean>;
}

export const CurrenciesMasterTab: React.FC<Props> = ({
  currencies,
  onSaveCurrency,
  onDeleteCurrency,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<MasterCurrency | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEdit = (cur: MasterCurrency) => {
    setSelectedCurrency(cur);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCurrency(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (cur: MasterCurrency) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la moneda '${cur.codigo}' (${cur.nombre}) del catálogo maestro?`)) {
      return;
    }
    const ok = await onDeleteCurrency(cur);
    if (ok) {
      setFeedbackMsg({ type: 'success', text: `Moneda '${cur.codigo}' eliminada con éxito del catálogo maestro.` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: 'error', text: 'Error al eliminar la moneda.' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Catálogo Monedas
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Administra las divisas globales del ecosistema. Los códigos, nombres, símbolos y decimales
            configurados aquí se sincronizan y sugieren automáticamente a todas las bancas SaaS.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      <CurrenciesMasterTable
        currencies={currencies}
        onOpenCreate={handleCreate}
        onOpenEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CurrencyMasterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currency={selectedCurrency}
        onSave={onSaveCurrency}
      />
    </div>
  );
};
