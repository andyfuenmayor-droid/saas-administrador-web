import React from 'react';
import { TrackingLead } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Building2, User, Phone, Mail, CheckCircle2, Trash2, Clock, MapPin } from 'lucide-react';

interface TrackingListProps {
  trackingLeads: TrackingLead[];
  onSelectToActivate: (lead: TrackingLead) => void;
  onDeleteLead: (lead: TrackingLead) => void;
}

export const TrackingList: React.FC<TrackingListProps> = ({
  trackingLeads,
  onSelectToActivate,
  onDeleteLead
}) => {
  if (trackingLeads.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs border border-white/5">
        💡 No hay clientes en espera de pago en este momento.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Prospectos Cotizados en Espera de Activación ({trackingLeads.length})</span>
        </h3>
      </div>

      <div className="glass-panel overflow-hidden border border-white/5 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Banca / Prospecto</th>
                <th className="py-3.5 px-4">Plan Cotizado</th>
                <th className="py-3.5 px-4">Total Cotizado</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Ubicación</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trackingLeads.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{t.banca}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      👤 {t.representante}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {t.plan_cotizado} ({t.puntos_venta} pts)
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-extrabold text-emerald-400 text-sm font-['Outfit']">
                    {formatCurrency(Number(t.total_cotizado) || 0)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-[11px] text-slate-300">{t.email || 'N/A'}</div>
                    {t.telefono && (
                      <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5" /> {t.telefono}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    <div>{t.estado || 'N/A'}</div>
                    <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{t.direccion || ''}</div>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onSelectToActivate(t)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ACTIVAR</span>
                      </button>

                      <button
                        onClick={() => onDeleteLead(t)}
                        title="Descartar solicitud"
                        className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
