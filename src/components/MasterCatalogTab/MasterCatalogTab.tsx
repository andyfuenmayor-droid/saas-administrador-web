import React, { useState } from 'react';
import { MasterSystem, MasterCurrency } from '../../types';
import { SystemsMasterTable } from './SystemsMasterTable';
import { SystemMasterModal } from './SystemMasterModal';
import { CurrenciesMasterTable } from './CurrenciesMasterTable';
import { CurrencyMasterModal } from './CurrencyMasterModal';
import { Layers, Coins, Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  systems: MasterSystem[];
  currencies: MasterCurrency[];
  onSaveSystem: (sys: Partial<MasterSystem>) => Promise<boolean>;
  onDeleteSystem: (sys: MasterSystem) => Promise<boolean>;
  onSaveCurrency: (cur: Partial<MasterCurrency>) => Promise<boolean>;
  onDeleteCurrency: (cur: MasterCurrency) => Promise<boolean>;
}

export const MasterCatalogTab: React.FC<Props> = ({
  systems,
  currencies,
  onSaveSystem,
  onDeleteSystem,
  onSaveCurrency,
  onDeleteCurrency,
}) => {
  const [subTab, setSubTab] = useState<'systems' | 'currencies'>('systems');

  // Modales
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<MasterSystem | null>(null);

  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<MasterCurrency | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEditSystem = (sys: MasterSystem) => {
    setSelectedSystem(sys);
    setIsSystemModalOpen(true);
  };

  const handleCreateSystem = () => {
    setSelectedSystem(null);
    setIsSystemModalOpen(true);
  };

  const handleDeleteSystem = async (sys: MasterSystem) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el sistema '${sys.nombre_sistema}' del catálogo maestro global?`)) {
      return;
    }
    const ok = await onDeleteSystem(sys);
    if (ok) {
      setFeedbackMsg({ type: 'success', text: `Sistema '${sys.nombre_sistema}' eliminado con éxito del catálogo maestro.` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: 'error', text: 'Error al eliminar sistema del catálogo maestro.' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleEditCurrency = (cur: MasterCurrency) => {
    setSelectedCurrency(cur);
    setIsCurrencyModalOpen(true);
  };

  const handleCreateCurrency = () => {
    setSelectedCurrency(null);
    setIsCurrencyModalOpen(true);
  };

  const handleDeleteCurrency = async (cur: MasterCurrency) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la moneda '${cur.codigo}' (${cur.nombre}) del catálogo maestro global?`)) {
      return;
    }
    const ok = await onDeleteCurrency(cur);
    if (ok) {
      setFeedbackMsg({ type: 'success', text: `Moneda '${cur.codigo}' eliminada con éxito del catálogo maestro.` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: 'error', text: 'Error al eliminar moneda del catálogo maestro.' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Database className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white font-['Outfit']">
              Catálogo Maestro Global (Sistemas y Monedas)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Administra las plataformas y divisas centrales del ecosistema. Los nombres y cabeceras configurados aquí
            se sincronizan y sugieren automáticamente a todas las bancas SaaS.
          </p>
        </div>

        {/* Píldoras de sub-pestañas */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/5 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setSubTab('systems')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'systems'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sistemas ({systems.length})</span>
          </button>

          <button
            onClick={() => setSubTab('currencies')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'currencies'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Monedas ({currencies.length})</span>
          </button>
        </div>
      </div>

      {/* Banner de feedback */}
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

      {/* Vista de contenido */}
      {subTab === 'systems' ? (
        <SystemsMasterTable
          systems={systems}
          onOpenCreate={handleCreateSystem}
          onOpenEdit={handleEditSystem}
          onDelete={handleDeleteSystem}
        />
      ) : (
        <CurrenciesMasterTable
          currencies={currencies}
          onOpenCreate={handleCreateCurrency}
          onOpenEdit={handleEditCurrency}
          onDelete={handleDeleteCurrency}
        />
      )}

      {/* Modales */}
      <SystemMasterModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        system={selectedSystem}
        onSave={onSaveSystem}
      />

      <CurrencyMasterModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currency={selectedCurrency}
        onSave={onSaveCurrency}
      />
    </div>
  );
};
