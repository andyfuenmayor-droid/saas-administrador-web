import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getWhatsAppCredentialsUrl } from '../../utils/formatters';
import { CheckCircle2, ExternalLink, Mail, Copy, X } from 'lucide-react';

interface SuccessModalProps {
  credentials: {
    banca: string;
    representante: string;
    email: string;
    password: string;
    telefono?: string;
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
    credentials.password
  );

  const mailtoUrl = `mailto:${credentials.email}?subject=${encodeURIComponent(`Credenciales de acceso - ${credentials.banca}`)}&body=${encodeURIComponent(`Hola ${credentials.representante},\n\nTu SaaS para ${credentials.banca} ha sido activado con éxito en Multibanca Express.\n\nAquí tienes tus credenciales de acceso al sistema:\nUsuario/Email: ${credentials.email}\nContraseña: ${credentials.password}\n\n¡Bienvenido al sistema!`)}`;

  const copyToClipboard = () => {
    const text = `Credenciales de acceso - ${credentials.banca}\nUsuario: ${credentials.email}\nContraseña: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    alert('Credenciales copiadas al portapapeles');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-emerald-500/30 shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-6">
        
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">
            ¡SaaS Activado con Éxito!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Se ha creado la cuenta y el perfil oficial para <strong className="text-emerald-400">{credentials.banca}</strong>
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/5 text-left space-y-2">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Usuario / Email:</span>
            <span className="font-mono text-white font-bold">{credentials.email}</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Contraseña Temporal:</span>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {credentials.password}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <span>🟢 Compartir por WhatsApp</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={mailtoUrl}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              <span>Enviar por Correo</span>
            </a>

            <button
              onClick={copyToClipboard}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Copiar Texto</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Volver a la Lista de Seguimiento
          </button>
        </div>

      </div>
    </div>
  );
};
