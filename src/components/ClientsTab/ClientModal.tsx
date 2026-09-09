import React, { useState } from 'react';
import { ClientProfile, CatalogPlans } from '../../types';
import { supabase } from '../../lib/supabase';
import { X, Save, Calendar, Building2, User, Phone, MapPin, Layers, AlertCircle } from 'lucide-react';

interface ClientModalProps {
  client: ClientProfile;
  catalog: CatalogPlans;
  onClose: () => void;
  onSaved: () => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({ client, catalog, onClose, onSaved }) => {
  const [nombreBanca, setNombreBanca] = useState(client.nombre_banca || '');
  const [plan, setPlan] = useState(client.plan || 'Básico (SaaS)');
  const [limiteAgencias, setLimiteAgencias] = useState<number>(client.limite_agencias || 5);
  const [status, setStatus] = useState<string>(client.status || 'activo');
  const [representante, setRepresentante] = useState(client.representante || '');
  const [telefono, setTelefono] = useState(client.telefono || '');
  const [estado, setEstado] = useState(client.estado || '');
  const [direccion, setDireccion] = useState(client.direccion || '');

  // Extension date handling
  const origDate = client.fecha_vencimiento ? client.fecha_vencimiento.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const [extensionPreset, setExtensionPreset] = useState<string>('No cambiar');
  const [customDate, setCustomDate] = useState<string>(origDate);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const calculateNewDate = (): string => {
    if (extensionPreset === 'No cambiar') return origDate;
    if (extensionPreset === 'Personalizada') return customDate;
    
    const d = new Date(origDate + 'T00:00:00');
    if (extensionPreset === '1 Mes') d.setDate(d.getDate() + 30);
    else if (extensionPreset === '3 Meses') d.setDate(d.getDate() + 90);
    else if (extensionPreset === '6 Meses') d.setDate(d.getDate() + 180);
    else if (extensionPreset === '1 Año') d.setDate(d.getDate() + 365);
    return d.toISOString().slice(0, 10);
  };

  const newDateString = calculateNewDate();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const updateData = {
        nombre_banca: nombreBanca.trim(),
        plan: plan,
        limite_agencias: Number(limiteAgencias),
        status: status,
        fecha_vencimiento: newDateString,
        representante: representante.trim(),
        telefono: telefono.trim(),
        estado: estado.trim(),
        direccion: direccion.trim()
      };

      let query = supabase.from('perfiles').update(updateData);
      if (client.id) {
        query = query.eq('id', client.id);
      } else {
        query = query.eq('email', client.email);
      }

      const { error } = await query;
      if (error) throw error;

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error al guardar cliente:', err);
      setErrorMsg(err.message || 'Error al actualizar datos en Supabase');
    } finally {
      setSaving(false);
    }
  };

  const planOptions = Object.keys(catalog);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-emerald-500/20 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/40">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-['Outfit']">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Editar Suscriptor y Licencia
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{client.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="m-6 mb-0 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nombre de la Banca */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                🏢 Nombre de la Banca / Negocio
              </label>
              <input
                type="text"
                value={nombreBanca}
                onChange={(e) => setNombreBanca(e.target.value)}
                placeholder="Ej: BANCA ANDY VENTAS"
                className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Plan SaaS */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                🚀 Plan SaaS (Upgrade / Downgrade)
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {planOptions.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Límite de Puntos */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                📍 Límite de Puntos de Venta
              </label>
              <input
                type="number"
                min="1"
                max="9999"
                value={limiteAgencias}
                onChange={(e) => setLimiteAgencias(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Estatus */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                🛡️ Estatus de la Licencia
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-900/70 p-1 border border-slate-700/60 rounded-xl">
                {['activo', 'suspendido', 'vencido'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      status === st
                        ? 'bg-emerald-600 text-white font-bold shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Representante */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                👤 Representante Legal
              </label>
              <input
                type="text"
                value={representante}
                onChange={(e) => setRepresentante(e.target.value)}
                placeholder="Nombre del responsable..."
                className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                📞 WhatsApp / Teléfono
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: +584121234567"
                className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Estado / Ciudad */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                📍 Ubicación (Estado / Ciudad)
              </label>
              <input
                type="text"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                placeholder="Ej: Zulia, Maracaibo"
                className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                📫 Dirección o Sede Principal
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Sede o dirección física..."
                className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          {/* Extensión de Suscripción */}
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">📅 Vencimiento Actual:</span>
              <span className="font-mono text-slate-300 font-bold">{origDate}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Extender Suscripción:
                </label>
                <select
                  value={extensionPreset}
                  onChange={(e) => setExtensionPreset(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {["No cambiar", "1 Mes", "3 Meses", "6 Meses", "1 Año", "Personalizada"].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {extensionPreset === 'Personalizada' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Nueva Fecha Específica:
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div className="flex flex-col justify-center">
                  <span className="text-[11px] text-slate-400">Nueva Fecha de Vencimiento:</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    ✨ {newDateString}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  GUARDAR CAMBIOS
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
