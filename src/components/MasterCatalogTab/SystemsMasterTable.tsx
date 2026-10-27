import React, { useState } from 'react';
import { MasterSystem } from '../../types';
import { Search, Plus, Edit2, Trash2, Layers, FileSpreadsheet, FlaskConical, ShieldCheck, Check } from 'lucide-react';

interface Props {
  systems: MasterSystem[];
  onOpenCreate: () => void;
  onOpenEdit: (sys: MasterSystem) => void;
  onOpenTest?: (sys: MasterSystem) => void;
  onDelete: (sys: MasterSystem) => void;
}

export const SystemsMasterTable: React.FC<Props> = ({
  systems,
  onOpenCreate,
  onOpenEdit,
  onOpenTest,
  onDelete,
}) => {
  const [search, setSearch] = useState('');

  const filtered = systems.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      s.nombre_sistema.toLowerCase().includes(q) ||
      (s.col_agencia && s.col_agencia.toLowerCase().includes(q)) ||
      (s.col_venta && s.col_venta.toLowerCase().includes(q)) ||
      (s.col_premio && s.col_premio.toLowerCase().includes(q)) ||
      (s.descripcion && s.descripcion.toLowerCase().includes(q))
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
            placeholder="Buscar por nombre, columna o descripción..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <button
          onClick={onOpenCreate}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Sistema (Con Prueba de Carga)</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-white/5 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5 font-bold">Sistema / Proveedor</th>
                <th className="px-4 py-3.5 font-bold">Mapeo Cabeceras Excel (Agencia / Venta / Premio)</th>
                <th className="px-4 py-3.5 font-bold">Descripción</th>
                <th className="px-4 py-3.5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No se encontraron sistemas globales registrados.
                  </td>
                </tr>
              ) : (
                filtered.map((sys) => (
                  <tr key={sys.id || sys.nombre_sistema} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm font-['Outfit']">
                            {sys.nombre_sistema}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: #{sys.id || 'N/A'}
                            </span>
                            {sys.nombre_sistema.toUpperCase() === 'PRUEBA' ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                🟡 Pendiente de Prueba
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" />
                                <span>Certificado con Prueba</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3 text-sky-400" />
                          <span className="text-slate-500">Ag:</span> {sys.col_agencia}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                          <span className="text-slate-500">Vta:</span> {sys.col_venta}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-[11px] font-mono text-slate-300 flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3 text-amber-400" />
                          <span className="text-slate-500">Prm:</span> {sys.col_premio}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate">
                      {sys.descripcion || '—'}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => (onOpenTest ? onOpenTest(sys) : onOpenEdit(sys))}
                          title="Ejecutar prueba de carga con un archivo real de este sistema"
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>Probar Carga</span>
                        </button>
                        <button
                          onClick={() => onOpenEdit(sys)}
                          title="Editar sistema o cabeceras"
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(sys)}
                          title="Eliminar del catálogo maestro"
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
