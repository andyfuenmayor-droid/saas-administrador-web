import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, ExternalLink, Globe, FileText, CheckCircle2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { adminName, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#071217]/85 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & Admin Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img 
              src="/logo.svg" 
              alt="Multibanca Express" 
              className="h-8 sm:h-9 w-auto object-contain" 
            />
            <div className="h-7 w-px bg-white/10 hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {adminName}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SaaS Master
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Administración Central de Suscripciones
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="md:hidden p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Ecosystem Cross-Links & Logout */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <a
            href="https://crm.multibancaexpress.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/50 flex items-center gap-1.5 transition-all hover:border-emerald-500/40"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ir al CRM</span>
          </a>

          <a
            href="https://multibancaexpress.com/#planes"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/50 flex items-center gap-1.5 transition-all hover:border-sky-500/40"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Ver Planes Web</span>
          </a>

          <a
            href="https://multibancaexpress.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/50 flex items-center gap-1.5 transition-all hover:border-amber-500/40"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Formulario Registro</span>
          </a>

          <button
            onClick={logout}
            className="hidden md:flex px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>

      </div>
    </header>
  );
};
