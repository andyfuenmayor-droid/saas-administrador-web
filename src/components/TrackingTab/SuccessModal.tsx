import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getWhatsAppCredentialsUrl } from '../../utils/formatters';
import { CheckCircle2, ExternalLink, Mail, Copy, X, Monitor, Store, Coins, Layers } from 'lucide-react';

interface SuccessModalProps {
  credentials: {
    banca: string;
    representante: string;
    email: string;
    password: string;
    telefono?: string;
    agencyName?: string;
    taquillaUser?: string;
    taquillaPass?: string;
    currenciesCount?: number;
    systemsCount?: number;
  };
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ credentials, onClose }) => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const whatsappUrl = getWhatsAppCredentialsUrl(
    credentials.telefono || '',
    credentials.representante,
    credentials.banca,
    credentials.email,
    credentials.password,
    credentials.taquillaUser,
    credentials.taquillaPass,
    credentials.agencyName
  );

  const mailBody = `Hola ${credentials.representante},\n\nTu SaaS para ${credentials.banca} ha sido activado con éxito en Multibanca Express.\n\n` +
    `🖥️ ACCESO AL CRM OPERADORA:\nURL: https://crm.multibancaexpress.com\nUsuario: ${credentials.email}\nContraseña: ${credentials.password}\n\n` +
    (credentials.taquillaUser ? `🎟️ ACCESO TERMINAL TAQUILLA POS:\nURL: https://taq.multibancaexpress.com\nAgencia: ${credentials.agencyName || 'AGENCIA 01 - DEMO'}\nUsuario Cajero: ${credentials.taquillaUser}\nClave: ${credentials.taquillaPass}\n\n` : '') +
    `¡Bienvenido a Multibanca Express!`;

  const mailtoUrl = `mailto:${credentials.email}?subject=${encodeURIComponent(`Credenciales de acceso oficiales - ${credentials.banca}`)}&body=${encodeURIComponent(mailBody)}`;

  const copyToClipboard = () => {
    let text = `==============================\nMULTIBANCA EXPRESS - CREDENCIALES\nCliente: ${credentials.banca}\n==============================\n\n`;
    text += `🖥️ CRM OPERADORA (Control Maestro)\nURL: https://crm.multibancaexpress.com\nUsuario: ${credentials.email}\nContraseña: ${credentials.password}\n\n`;
    if (credentials.taquillaUser && credentials.taquillaPass) {
      text += `🎟️ TERMINAL TAQUILLA POS (Demo)\nURL: https://taq.multibancaexpress.com\nAgencia: ${credentials.agencyName || 'AGENCIA 01 - DEMO'}\nUsuario Cajero: ${credentials.taquillaUser}\nClave: ${credentials.taquillaPass}\n\n`;
    }
    text += `✅ Monedas, sistemas y taquilla inicial aprovisionados con éxito.`;
    navigator.clipboard.writeText(text);
    alert('Credenciales completas (CRM + Taquilla) copiadas al portapapeles');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-emerald-500/30 shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-5 my-8">
        
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">
            ¡SaaS Aprovisionado y Activado!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Se ha creado la cuenta y los catálogos de base de datos para <strong className="text-emerald-400">{credentials.banca}</strong>
          </p>
        </div>

        {/* Resumen de Aprovisionamiento */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1">
            <Coins className="w-3 h-3" />
            {credentials.currenciesCount || 3} Monedas activas
          </span>
          <span className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 font-semibold flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {credentials.systemsCount || 6} Sistemas de lotería
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold flex items-center gap-1">
            <Store className="w-3 h-3" />
            1 Taquilla Demo lista
          </span>
        </div>

        {/* Credenciales 1: CRM Operadora */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/5 text-left space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span>CRM Operadora (Control Maestro)</span>
            </span>
            <a
              href="https://crm.multibancaexpress.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>crm.multibancaexpress.com</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Usuario / Email:</span>
            <span className="font-mono text-white font-bold">{credentials.email}</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Contraseña:</span>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {credentials.password}
            </span>
          </div>
        </div>

        {/* Credenciales 2: Terminal Taquilla POS Demo */}
        {credentials.taquillaUser && (
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-sky-500/20 text-left space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-sky-400" />
                <span>Terminal Taquilla POS (Demo)</span>
              </span>
              <a
                href="https://taq.multibancaexpress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
              >
                <span>taq.multibancaexpress.com</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Agencia Asignada:</span>
              <span className="font-semibold text-slate-200">{credentials.agencyName || 'AGENCIA 01 - DEMO'}</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Usuario Cajero:</span>
              <span className="font-mono text-white font-bold">{credentials.taquillaUser}</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Clave Terminal:</span>
              <span className="font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {credentials.taquillaPass || '123456'}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <span>🟢 Compartir Todo por WhatsApp</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={mailtoUrl}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>Enviar Correo</span>
            </a>

            <button
              onClick={copyToClipboard}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Copiar Ambos</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cerrar y Volver al Panel
          </button>
        </div>

      </div>
    </div>
  );
};

