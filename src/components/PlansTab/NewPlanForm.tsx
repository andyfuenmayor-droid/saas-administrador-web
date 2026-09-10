import React, { useState } from 'react';
import { CatalogPlans, TODOS_LOS_MODULOS_CMS } from '../../types';
import { PlusCircle, Check, AlertCircle } from 'lucide-react';

interface NewPlanFormProps {
  catalog: CatalogPlans;
  onCreatePlan: (planName: string, planData: any) => Promise<boolean>;
}

export const NewPlanForm: React.FC<NewPlanFormProps> = ({ catalog, onCreatePlan }) => {
  const [nombre, setNombre] = useState('');
  const [costoBase, setCostoBase] = useState<number | string>(180);
  const [costoPunto, setCostoPunto] = useState<number | string>(6);
  const [descripcion, setDescripcion] = useState('');
  const [modulos, setModulos] = useState<string[]>([
    "Inicio", "Pizarra Confirmaciones", "Sistemas", "Monedas", "Cuentas Bancarias",
    "Agencias", "Cobradores", "Cargar Ventas", "Saldo Agencias", "Caja Maestra"
  ]);

  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const toggleModule = (mod: string) => {
    if (mod === 'Inicio') return;
    if (modulos.includes(mod)) {
      setModulos(modulos.filter(m => m !== mod));
    } else {
      setModulos([...modulos, mod]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nombre.trim();
    if (!cleanName) {
      setMsg({ text: 'Ingresa un nombre para el nuevo plan', type: 'error' });
      return;
    }
    if (catalog[cleanName]) {
      setMsg({ text: `Ya existe un plan con el nombre "${cleanName}"`, type: 'error' });
      return;
    }

    setCreating(true);
    setMsg(null);

    const finalMods = ['Inicio', ...modulos.filter(m => m !== 'Inicio')];
    const numericBase = costoBase === '' || isNaN(Number(costoBase)) ? 0 : Number(costoBase);
    const numericPunto = costoPunto === '' || isNaN(Number(costoPunto)) ? 0 : Number(costoPunto);

    const ok = await onCreatePlan(cleanName, {
      costo_base: numericBase,
      costo_por_punto: numericPunto,
      descripcion: descripcion.trim() || 'Plan operativo Multibanca Express',
      modulos: finalMods
    });

    setCreating(false);
    if (ok) {
      setMsg({ text: `¡Plan ${cleanName} creado con éxito!`, type: 'success' });
      setNombre('');
      setDescripcion('');
    } else {
      setMsg({ text: 'Error al crear el nuevo plan en la base de datos', type: 'error' });
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
        <PlusCircle className="w-5 h-5 text-sky-400" />
        <h3 className="font-bold text-white text-base font-['Outfit']">
          Crear Nuevo Plan SaaS
        </h3>
      </div>

      {msg && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
          msg.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
        }`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            🏢 Nombre del Nuevo Plan:
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Plan Especial Agencias / Oro"
            className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              💰 Costo Base (USD):
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={costoBase}
              onChange={(e) => setCostoBase(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              📍 Costo / Punto (USD):
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={costoPunto}
              onChange={(e) => setCostoPunto(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            📝 Descripción Comercial:
          </label>
          <textarea
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Para redes con más de 10 puntos y soporte 24/7..."
            className="w-full px-3.5 py-2 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Modules Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-400">
              🛠️ Módulos Habilitados:
            </label>
            <span className="text-[11px] font-mono font-bold text-sky-400">
              {modulos.length} / {TODOS_LOS_MODULOS_CMS.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-900/40 rounded-xl border border-white/5">
            {TODOS_LOS_MODULOS_CMS.map(m => {
              const isSelected = modulos.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleModule(m)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-sky-400" />}
                  <span>{m}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{creating ? 'Creando...' : 'CREAR Y GUARDAR NUEVO PLAN'}</span>
        </button>

      </form>
    </div>
  );
};
