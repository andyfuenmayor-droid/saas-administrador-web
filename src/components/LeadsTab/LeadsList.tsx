import React from 'react';
import { Lead } from '../../types';
import { Building2, User, Phone, Mail, MapPin, Layers, Clock } from 'lucide-react';

interface LeadsListProps {
  leads: Lead[];
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({ leads, selectedLead, onSelectLead }) => {
  if (leads.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs border border-white/5">
        💡 No hay solicitudes nuevas en este momento.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        🎯 Solicitudes Entrantes ({leads.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {leads.map((lead) => {
          const isSelected = selectedLead?.id === lead.id;
          return (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all glass-card-hover ${
                isSelected
                  ? 'bg-sky-500/10 border-sky-500/50 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/60 border-white/5 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm tracking-tight">{lead.banca}</h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" /> {lead.representante}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold text-xs border border-sky-500/30">
                  {lead.puntos_venta} pts
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-white/5">
                {lead.email && (
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                    <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.telefono && (
                  <div className="flex items-center gap-1.5 text-emerald-400/90 font-mono">
                    <Phone className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span>{lead.telefono}</span>
                  </div>
                )}
                {lead.estado && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span>{lead.estado}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
