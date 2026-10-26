import React, { useState, useEffect } from 'react';
import { MasterSystem } from '../../types';
import { X, Save, AlertCircle, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  system: MasterSystem | null;
  onSave: (sys: Partial<MasterSystem>) => Promise<boolean>;
}

export const SystemMasterModal: React.FC<Props> = ({ isOpen, onClose, system, onSave }) => {
  const [nombre, setNombre] = useState('');
  const [colAgencia, setColAgencia] = useState('Agencia');
  const [colVenta, setColVenta] = useState('Venta');
  const [colPremio, setColPremio] = useState('Premio');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (system) {
      setNombre(system.nombre_sistema || '');
      setColAgencia(system.col_agencia || 'Agencia');
      setColVenta(system.col_venta || 'Venta');
      setColPremio(system.col_premio || 'Premio');
      setDescripcion(system.descripcion || '');
    } else {
      setNombre('');
      setColAgencia('Agencia');
      setColVenta('Venta');
      setColPremio('Premio');
      setDescripcion('');
    }
    setError(null);
  }, [system, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNombre = nombre.trim().toUpperCase();
    if (!cleanNombre) {
      setError('El nombre del sistema es obligatorio.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ok = await onSave({
        ...(system?.id ? { id: system.id } : {}),
        nombre_sistema: cleanNombre,
        col_agencia: colAgencia.trim() || 'Agencia',
        col_venta: colVenta.trim() || 'Venta',
        col_premio: colPremio.trim() || 'Premio',
        descripcion: descripcion.trim() || undefined,
      });
      if (ok) {
        onClose();
      } else {
        setError('No se pudo guardar el sistema. Verifica que el nombre no esté duplicado.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error guardando sistema en el catálogo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0b171c] border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">
              {system ? 'Editar Sistema Global' : 'Nuevo Sistema Global'}
            </h3>
            <p className="text-xs text-slate-400">
              {system
                ? 'Corrige el nombre o las cabeceras de Excel asignadas a este proveedor.'
                : 'Agrega un nuevo proveedor para que esté disponible en todos los SaaS.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre del Sistema <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value.toUpperCase())}
              placeholder="Ej: BETM3, KENO, GATOWEB..."
              required
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Se guarda en mayúsculas para estandarización en todo el ecosistema.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Columna Agencia
              </label>
              <input
                type="text"
                value={colAgencia}
                onChange={(e) => setColAgencia(e.target.value)}
                placeholder="Agencia"
                className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Columna Venta
              </label>
              <input
                type="text"
                value={colVenta}
                onChange={(e) => setColVenta(e.target.value)}
                placeholder="Venta"
                className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Columna Premio
              </label>
              <input
                type="text"
                value={colPremio}
                onChange={(e) => setColPremio(e.target.value)}
                placeholder="Premio"
                className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descripción / Notas (Opcional)
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Apuestas deportivas y juegos virtuales"
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : system ? 'Actualizar Sistema' : 'Crear Sistema'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
