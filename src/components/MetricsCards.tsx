import React from 'react';
import { Users, CheckCircle, Crown, Activity } from 'lucide-react';
import { ClientProfile } from '../types';

interface MetricsCardsProps {
  clients: ClientProfile[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ clients }) => {
  const total = clients.length;
  const activos = clients.filter(c => (c.status || '').toLowerCase() === 'activo').length;
  const activosPct = total > 0 ? ((activos / total) * 100).toFixed(1) : '0.0';
  const premium = clients.filter(c => {
    const p = (c.plan || '').toLowerCase();
    return p.includes('elite') || p.includes('premium') || p.includes('profesional');
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
      
      {/* Total Clientes */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span>Total Clientes</span>
          <Users className="w-4 h-4 text-sky-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
          {total}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Suscriptores registrados</p>
      </div>

      {/* Cuentas Activas */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span>Cuentas Activas</span>
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-['Outfit']">
            {activos}
          </span>
          <span className="text-xs font-bold text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {activosPct}%
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Operando al día</p>
      </div>

      {/* Cuentas Pro/Elite */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span>Planes Superiores</span>
          <Crown className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
          {premium}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Profesional & Elite</p>
      </div>

      {/* Estatus Sistema */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span>Estatus Plataforma</span>
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Online
          </span>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <p className="text-[11px] text-emerald-400 mt-1 font-semibold">Sistemas operativos OK</p>
      </div>

    </div>
  );
};
