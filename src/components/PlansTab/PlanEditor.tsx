import React, { useState, useEffect } from 'react';
import { CatalogPlans, TODOS_LOS_MODULOS_CMS } from '../../types';
import { Edit3, Save, Trash2, Check, AlertCircle } from 'lucide-react';

interface PlanEditorProps {
  catalog: CatalogPlans;
  onSavePlan: (oldName: string, newName: string, updatedData: any) => Promise<boolean>;
  onDeletePlan: (planName: string) => Promise<boolean>;
}

export const PlanEditor: React.FC<PlanEditorProps> = ({ catalog, onSavePlan, onDeletePlan }) => {
  const planNames = Object.keys(catalog);
  const [selectedPlan, setSelectedPlan] = useState<string>(planNames[0] || '');
  
  const [nombre, setNombre] = useState('');
  const [costoBase, setCostoBase] = useState<number | string>(150);
  const [costoPunto, setCostoPunto] = useState<number | string>(5);
  const [limitePuntos, setLimitePuntos] = useState<number | string>(0);
  const [descripcion, setDescripcion] = useState('');
  const [modulos, setModulos] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (planNames.length > 0) {
      const current = catalog[selectedPlan] ? selectedPlan : planNames[0];
      setSelectedPlan(current);
      const data = catalog[current];
      if (data) {
        setNombre(current);
        setCostoBase(
          data.costo_base !== undefined && data.costo_base !== null && !isNaN(Number(data.costo_base))
            ? Number(data.costo_base)
            : 150
        );
        setCostoPunto(
          data.costo_por_punto !== undefined && data.costo_por_punto !== null && !isNaN(Number(data.costo_por_punto))
            ? Number(data.costo_por_punto)
            : 5
        );
        setLimitePuntos(
          data.limite_puntos !== undefined && data.limite_puntos !== null && !isNaN(Number(data.limite_puntos))
            ? Number(data.limite_puntos)
            : 0
        );
        setDescripcion(data.descripcion || '');
        setModulos(data.modulos || []);
      }
    }
  }, [selectedPlan, catalog]);

  const toggleModule = (mod: string) => {
    if (mod === 'Inicio') return; // Inicio is required
    if (modulos.includes(mod)) {
      setModulos(modulos.filter(m => m !== mod));
    } else {
      setModulos([...modulos, mod]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setMsg({ text: 'El nombre del plan no puede estar vacío', type: 'error' });
      return;
    }

    setSaving(true);
    setMsg(null);

    const finalMods = ['Inicio', ...modulos.filter(m => m !== 'Inicio')];
    const numericBase = costoBase === '' || isNaN(Number(costoBase)) ? 0 : Number(costoBase);
    const numericPunto = costoPunto === '' || isNaN(Number(costoPunto)) ? 0 : Number(costoPunto);
    const numericLimite = limitePuntos === '' || isNaN(Number(limitePuntos)) ? 0 : Number(limitePuntos);

    const success = await onSavePlan(selectedPlan, nombre.trim(), {
      costo_base: numericBase,
      costo_por_punto: numericPunto,
      limite_puntos: numericLimite,
      descripcion: descripcion.trim(),
      modulos: finalMods
    });

    setSaving(false);
    if (success) {
      setMsg({ text: `Plan ${nombre} actualizado correctamente`, type: 'success' });
      setSelectedPlan(nombre.trim());
    } else {
      setMsg({ text: 'Error al actualizar el plan en la base de datos', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (planNames.length <= 1) {
      alert('No puedes eliminar el único plan activo.');
      return;
    }
    if (!window.confirm(`¿Estás seguro de eliminar el plan "${selectedPlan}"?`)) return;

    setDeleting(true);
    const ok = await onDeletePlan(selectedPlan);
    setDeleting(false);
    if (ok) {
      const remaining = planNames.filter(p => p !== selectedPlan);
      if (remaining.length > 0) setSelectedPlan(remaining[0]);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base font-['Outfit']">
            Modificar Plan Existente
          </h3>
        </div>

        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
        >
          {planNames.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
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

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            🏢 Nombre Comercial del Plan:
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              🏢 Límite Puntos / Agencias:
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={limitePuntos}
              onChange={(e) => setLimitePuntos(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0 = Ilimitado"
              className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              required
            />
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
              {Number(limitePuntos) === 0 ? '♾️ Ilimitado (sin límite)' : `Hasta ${limitePuntos} agencias`}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              📍 Costo / Punto Adicional (USD):
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={costoPunto}
              onChange={(e) => setCostoPunto(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
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
            className="w-full px-3.5 py-2 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Modules Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-400">
              🛠️ Módulos Habilitados:
            </label>
            <span className="text-[11px] font-mono font-bold text-emerald-400">
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
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                  <span>{m}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Guardando...' : 'GUARDAR CAMBIOS'}</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar</span>
          </button>
        </div>

      </form>
    </div>
  );
};
