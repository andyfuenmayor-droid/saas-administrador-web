import React from 'react';
import { CatalogPlans, TODOS_LOS_MODULOS_CMS } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Layers, ShieldCheck } from 'lucide-react';

interface PlansSummaryProps {
  catalog: CatalogPlans;
}

export const PlansSummary: React.FC<PlansSummaryProps> = ({ catalog }) => {
  const planEntries = Object.entries(catalog);

  return (
    <div className="glass-panel overflow-hidden border border-white/5 rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5 font-semibold">
            <tr>
              <th className="py-3.5 px-4">Plan</th>
              <th className="py-3.5 px-4">Costo Base</th>
              <th className="py-3.5 px-4">Límite Agencias</th>
              <th className="py-3.5 px-4">Costo / Punto Adic.</th>
              <th className="py-3.5 px-4">Total Módulos Activos</th>
              <th className="py-3.5 px-4">Descripción Comercial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {planEntries.map(([name, data]) => {
              const modsCount = (data.modulos || []).length;
              const isElite = name.toLowerCase().includes('elite');
              const isPro = name.toLowerCase().includes('profesional');
              const limVal = data.limite_puntos !== undefined && data.limite_puntos !== null ? Number(data.limite_puntos) : (isElite ? 0 : isPro ? 50 : 15);
              return (
                <tr key={name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border inline-flex items-center gap-1.5 ${
                      isElite
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : isPro
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {isElite ? '🏆' : isPro ? '⭐' : '📦'} {name}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-extrabold text-emerald-400 text-sm font-['Outfit']">
                    {formatCurrency(Number(data.costo_base) || 0)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {limVal === 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                        ♾️ Ilimitado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold font-mono">
                        🏢 Hasta {limVal} ag.
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-200 text-xs">
                    {formatCurrency(Number(data.costo_por_punto) || 0)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-semibold">
                      {modsCount} / {TODOS_LOS_MODULOS_CMS.length} módulos
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs max-w-md">
                    {data.descripcion || 'Plan operativo Multibanca Express'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
