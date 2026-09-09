import React, { useState } from 'react';
import { TrackingLead } from '../../types';
import { supabase } from '../../lib/supabase';
import { X, CheckCircle2, Key, Mail, Building2, ShieldCheck, AlertCircle } from 'lucide-react';

interface ActivationModalProps {
  lead: TrackingLead;
  onClose: () => void;
  onActivated: (credentials: {
    banca: string;
    representante: string;
    email: string;
    password: string;
    telefono?: string;
  }) => void;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({ lead, onClose, onActivated }) => {
  const [email, setEmail] = useState(lead.email || '');
  
  // Contraseña sugerida por defecto
  const cleanPhone = (lead.telefono || '').replace(/\D/g, '');
  const defaultPass = cleanPhone.length >= 6 ? `ME${cleanPhone.slice(-6)}` : 'ME2026!';
  const [password, setPassword] = useState(defaultPass);
  const [activating, setActivating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('El correo y la contraseña son obligatorios');
      return;
    }

    setActivating(true);
    setErrorMsg('');

    try {
      // 1. Crear usuario en Supabase Auth via Proxy Seguro /api/admin-users/
      const authRes = await fetch('/api/admin-users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          email_confirm: true,
          user_metadata: {
            telefono: lead.telefono || '',
            nombre_banca: lead.banca
          }
        })
      });

      let userId = '';
      if (authRes.ok) {
        const userData = await authRes.json();
        userId = userData.id || userData.user?.id || '';
      } else {
        // Fallback: intentar registro via Supabase Client si proxy responde error
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim()
        });
        if (signUpErr) throw signUpErr;
        userId = signUpData.user?.id || '';
      }

      // 2. Insertar perfil completo del suscriptor
      const now = new Date();
      const venc = new Date();
      venc.setDate(venc.getDate() + 365);

      const profileData = {
        id: userId,
        email: email.trim(),
        nombre_banca: lead.banca,
        plan: lead.plan_cotizado,
        status: 'activo',
        fecha_inicio: now.toISOString(),
        fecha_vencimiento: venc.toISOString().slice(0, 10),
        role: 'admin',
        rol: 'contador',
        limite_agencias: Number(lead.puntos_venta) || 5,
        representante: lead.representante,
        telefono: lead.telefono || '',
        direccion: lead.direccion || '',
        estado: lead.estado || ''
      };

      const { error: profileErr } = await supabase.from('perfiles').insert(profileData);
      if (profileErr) throw profileErr;

      // 3. Eliminar de la tabla leads_seguimiento
      await supabase.from('leads_seguimiento').delete().eq('id', lead.id);

      onActivated({
        banca: lead.banca,
        representante: lead.representante,
        email: email.trim(),
        password: password.trim(),
        telefono: lead.telefono
      });

    } catch (err: any) {
      console.error('Error al dar de alta al suscriptor:', err);
      setErrorMsg(err.message || 'Error al crear credenciales y activar perfil');
      setActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-emerald-500/20 shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white font-['Outfit']">
              Dar de Alta y Activar SaaS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleActivate} className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/5 space-y-1 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>{lead.banca}</span>
            </div>
            <div className="text-slate-400">👤 Representante: <span className="text-slate-200">{lead.representante}</span></div>
            <div className="text-slate-400">🏆 Plan Cotizado: <span className="text-emerald-400 font-bold">{lead.plan_cotizado} ({lead.puntos_venta} pts)</span></div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              📧 Correo de Acceso al Sistema
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              🔑 Contraseña Temporal Inicial
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              required
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Generada a partir del teléfono. Podrá cambiarla luego en cualquier momento.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={activating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {activating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  CREAR Y ACTIVAR
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
