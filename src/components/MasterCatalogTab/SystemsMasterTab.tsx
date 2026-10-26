import React, { useState } from 'react';
import { MasterSystem } from '../../types';
import { SystemsMasterTable } from './SystemsMasterTable';
import { SystemMasterModal } from './SystemMasterModal';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  systems: MasterSystem[];
  onSaveSystem: (sys: Partial<MasterSystem>) => Promise<boolean>;
  onDeleteSystem: (sys: MasterSystem) => Promise<boolean>;
}

export const SystemsMasterTab: React.FC<Props> = ({
  systems,
  onSaveSystem,
  onDeleteSystem,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<MasterSystem | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEdit = (sys: MasterSystem) => {
    setSelectedSystem(sys);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedSystem(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (sys: MasterSystem) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el sistema '${sys.nombre_sistema}' del catálogo maestro?`)) {
      return;
    }
    const ok = await onDeleteSystem(sys);
    if (ok) {
      setFeedbackMsg({ type: 'success', text: `Sistema '${sys.nombre_sistema}' eliminado con éxito del catálogo maestro.` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ type: 'error', text: 'Error al eliminar el sistema.' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Catálogo Sistemas
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Administra las plataformas y proveedores globales del ecosistema. Los nombres y cabeceras de Excel
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

      <SystemsMasterTable
        systems={systems}
        onOpenCreate={handleCreate}
        onOpenEdit={handleEdit}
        onDelete={handleDelete}
      />

      <SystemMasterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        system={selectedSystem}
        onSave={onSaveSystem}
      />
    </div>
  );
};
