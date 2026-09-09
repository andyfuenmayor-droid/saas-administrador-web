import React, { useState } from 'react';
import { ClientProfile } from '../../types';
import { Search, Edit3, KeyRound, Building2, Calendar, Phone, MapPin, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ClientsTableProps {
  clients: ClientProfile[];
  onSelectClient: (client: ClientProfile) => void;
  onOpenPasswordModal: (client: ClientProfile) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({ clients, onSelectClient, onOpenPasswordModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filtered = clients.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchText = (
      (c.nombre_banca || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.representante || '').toLowerCase().includes(term) ||
      (c.plan || '').toLowerCase().includes(term)
    );
    const matchStatus = statusFilter === 'todos' || (c.status || 'activo').toLowerCase() === statusFilter.toLowerCase();
    return matchText && matchStatus;
  });

  const getStatusBadge = (status?: string) => {
    const s = (status || 'activo').toLowerCase();
    if (s === 'activo') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" /> Activo
        </span>
      );
    }
    if (s === 'suspendido') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" /> Suspendido
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle className="w-3 h-3" /> Vencido
      </span>
    );
  };

  const getPlanBadge = (plan?: string) => {
    const p = (plan || 'Básico (SaaS)');
    if (p.toLowerCase().includes('elite')) {
      return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">🏆 {p}</span>;
    }
    if (p.toLowerCase().includes('profesional')) {
      return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">⭐ {p}</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{p}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por banca, email o representante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 self-stretch sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          {['todos', 'activo', 'suspendido', 'vencido'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                  : 'bg-slate-900/40 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel overflow-hidden border border-white/5 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Banca / Suscriptor</th>
                <th className="py-3.5 px-4">Plan Actual</th>
                <th className="py-3.5 px-4">Puntos</th>
                <th className="py-3.5 px-4">Estatus</th>
                <th className="py-3.5 px-4">Vencimiento</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 text-sm">
                    No se encontraron clientes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id || c.email} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{c.nombre_banca || 'Sin Nombre'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{c.email}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getPlanBadge(c.plan)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-200">
                      {c.limite_agencias || 5} pts
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{c.fecha_vencimiento ? c.fecha_vencimiento.slice(0, 10) : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{c.representante || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        {c.telefono && (
                          <span className="flex items-center gap-0.5 text-emerald-400/90 font-mono">
                            <Phone className="w-2.5 h-2.5" /> {c.telefono}
                          </span>
                        )}
                        {c.estado && (
                          <span className="flex items-center gap-0.5 text-slate-400">
                            <MapPin className="w-2.5 h-2.5" /> {c.estado}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectClient(c)}
                          title="Editar Licencia y Suscripción"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenPasswordModal(c)}
                          title="Actualizar Contraseña de Acceso"
                          className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
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
