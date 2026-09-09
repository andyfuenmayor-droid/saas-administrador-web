import React, { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface FactoryResetProps {
  onResetToFactory: () => Promise<boolean>;
}

export const FactoryReset: React.FC<FactoryResetProps> = ({ onResetToFactory }) => {
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('¿Restablecer el catálogo a los 3 planes de fábrica (Básico $150, Profesional $250, Elite $500)?')) return;
    setResetting(true);
    await onResetToFactory();
    setResetting(false);
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Opciones Avanzadas de Mantenimiento</span>
        </div>
        <span className="text-slate-500">{open ? '▲ Ocultar' : '▼ Mostrar'}</span>
      </div>

      {open && (
        <div className="pt-3 border-t border-white/5 space-y-3 text-xs text-slate-400">
          <p>
            Si deseas restaurar los 3 planes estándar oficiales de Multibanca Express (Básico $150, Profesional $250, Elite $500) con sus módulos predeterminados:
          </p>

          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetting ? 'Restableciendo...' : 'Restablecer Catálogo de Fábrica'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
