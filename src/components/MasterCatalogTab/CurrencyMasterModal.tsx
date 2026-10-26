import React, { useState, useEffect } from 'react';
import { MasterCurrency } from '../../types';
import { X, Save, AlertCircle, Coins } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currency: MasterCurrency | null;
  onSave: (cur: Partial<MasterCurrency>) => Promise<boolean>;
}

export const CurrencyMasterModal: React.FC<Props> = ({ isOpen, onClose, currency, onSave }) => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [simbolo, setSimbolo] = useState('');
  const [decimales, setDecimales] = useState('2');
  const [esBase, setEsBase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currency) {
      setCodigo(currency.codigo || '');
      setNombre(currency.nombre || '');
      setSimbolo(currency.simbolo || '');
      setDecimales(String(currency.decimales ?? 2));
      setEsBase(Boolean(currency.es_base));
    } else {
      setCodigo('');
      setNombre('');
      setSimbolo('');
      setDecimales('2');
      setEsBase(false);
    }
    setError(null);
  }, [currency, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCodigo = codigo.trim().toUpperCase();
    const cleanNombre = nombre.trim();
    const cleanSimbolo = simbolo.trim();

    if (!cleanCodigo || !cleanNombre || !cleanSimbolo) {
      setError('Código, nombre y símbolo son campos obligatorios.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ok = await onSave({
        ...(currency?.id ? { id: currency.id } : {}),
        codigo: cleanCodigo,
        nombre: cleanNombre,
        simbolo: cleanSimbolo,
        decimales: Math.max(0, parseInt(decimales, 10) || 0),
        es_base: esBase,
      });
      if (ok) {
        onClose();
      } else {
        setError('No se pudo guardar la divisa. Verifica que el código no esté duplicado.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error guardando divisa en el catálogo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0b171c] border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">
              {currency ? 'Editar Divisa Global' : 'Nueva Divisa Global'}
            </h3>
            <p className="text-xs text-slate-400">
              {currency
                ? 'Corrige el código, nombre, símbolo o decimales de la moneda.'
                : 'Registra una nueva moneda para el catálogo maestro.'}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Código ISO <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="USD, BS, COP..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Símbolo <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={simbolo}
                onChange={(e) => setSimbolo(e.target.value)}
                placeholder="$, Bs., COP$, €..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre de la Moneda <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Dólares Americanos, Bolívares..."
              required
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Decimales Contables
              </label>
              <select
                value={decimales}
                onChange={(e) => setDecimales(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="0">0 (Sin decimales - ej: COP)</option>
                <option value="2">2 (Estándar - ej: USD, BS)</option>
                <option value="4">4 (Cripto / Precisión)</option>
              </select>
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={esBase}
                  onChange={(e) => setEsBase(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-white/20 text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs font-semibold text-slate-300">
                  Moneda Base
                </span>
              </label>
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : currency ? 'Actualizar Divisa' : 'Crear Divisa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
