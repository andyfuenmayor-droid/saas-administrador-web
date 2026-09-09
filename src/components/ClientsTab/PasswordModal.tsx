import React, { useState } from 'react';
import { ClientProfile } from '../../types';
import { getWhatsAppPasswordUpdatedUrl } from '../../utils/formatters';
import { X, KeyRound, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';

interface PasswordModalProps {
  client: ClientProfile;
  onClose: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ client, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Llamada al endpoint de proxy seguro /api/admin-users/{id}
      const res = await fetch(`/api/admin-users/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword.trim() })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al actualizar contraseña en el servidor');
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error al actualizar contraseña:', err);
      setErrorMsg(err.message || 'Error al conectar con el servidor de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = getWhatsAppPasswordUpdatedUrl(
    client.telefono,
    client.nombre_banca,
    client.email,
    newPassword
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-sky-500/20 shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white font-['Outfit']">
              Actualizar Contraseña
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">¡Contraseña Actualizada con Éxito!</h3>
              <p className="text-xs text-slate-400">
                La nueva clave de acceso para <b className="text-white">{client.nombre_banca}</b> ({client.email}) es: <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-400 font-mono font-bold">{newPassword}</code>
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-colors"
                >
                  <span>🟢 Compartir por WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-xs text-slate-300">
                Suscriptor: <strong className="text-white">{client.nombre_banca}</strong><br/>
                Email: <span className="font-mono text-slate-400">{client.email}</span>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita la contraseña..."
                  className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  required
                />
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
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 flex items-center gap-1.5 transition-all"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Clave'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
