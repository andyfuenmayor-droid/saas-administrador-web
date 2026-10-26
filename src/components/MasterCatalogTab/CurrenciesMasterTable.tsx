import React, { useState } from 'react';
import { MasterCurrency } from '../../types';
import { Search, Plus, Edit2, Trash2, Coins, CheckCircle2 } from 'lucide-react';

interface Props {
  currencies: MasterCurrency[];
  onOpenCreate: () => void;
  onOpenEdit: (cur: MasterCurrency) => void;
  onDelete: (cur: MasterCurrency) => void;
}

export const CurrenciesMasterTable: React.FC<Props> = ({
  currencies,
  onOpenCreate,
  onOpenEdit,
  onDelete,
}) => {
  const [search, setSearch] = useState('');

  const filtered = currencies.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.codigo.toLowerCase().includes(q) ||
      c.nombre.toLowerCase().includes(q) ||
      c.simbolo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Controles de barra superior */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, nombre o símbolo..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <button
          onClick={onOpenCreate}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Moneda Global</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-white/5 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5 font-bold">Código ISO</th>
                <th className="px-4 py-3.5 font-bold">Nombre Completo</th>
                <th className="px-4 py-3.5 font-bold">Símbolo</th>
                <th className="px-4 py-3.5 font-bold">Decimales</th>
                <th className="px-4 py-3.5 font-bold">Tipo</th>
                <th className="px-4 py-3.5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No se encontraron monedas globales registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((cur) => (
                  <tr key={cur.id || cur.codigo} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 font-bold font-mono">
                          {cur.codigo}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm font-['Outfit']">
                            {cur.codigo}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            ID: #{cur.id || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-slate-200">
                      {cur.nombre}
                    </td>

                    <td className="px-4 py-3.5 font-bold font-mono text-emerald-400 text-sm">
                      {cur.simbolo}
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 font-mono">
                      {cur.decimales} dec
                    </td>

                    <td className="px-4 py-3.5">
                      {cur.es_base ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Moneda Base
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 text-[10px] font-semibold">
                          Secundaria
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEdit(cur)}
                          title="Editar divisa"
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(cur)}
                          title="Eliminar divisa global"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
