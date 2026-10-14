export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' USD';
}

export function cleanPhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

export function getWhatsAppPitchUrl(
  phone: string | undefined,
  representative: string,
  banca: string,
  plan: string,
  total: number,
  methods: string[]
): string {
  const tel = cleanPhone(phone);
  const metodosStr = methods.map(m => `🔹 ${m}`).join('\n');
  const msg = `Hola *${representative}*! 👋\n\nSoy el admin de *Multibanca Express*. Recibimos tu solicitud para *${banca}*.\n\n🏆 *PLAN: ${plan.toUpperCase()}*\n💰 *INVERSIÓN FINAL: ${formatCurrency(total)}*\n\n💳 *MÉTODOS DE PAGO:*\n${metodosStr}\n\n¿Agendamos hoy? 😊`;
  return `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`;
}

export function getWhatsAppCredentialsUrl(
  phone: string | undefined,
  representative: string,
  banca: string,
  email: string,
  pass: string,
  taquillaUser?: string,
  taquillaPass?: string,
  agencyName?: string
): string {
  const tel = cleanPhone(phone);
  let msg = `¡Hola ${representative}! 👋\n\nTu SaaS para *${banca}* ha sido activado con éxito en *Multibanca Express*. 🚀\n\n`;
  msg += `🖥️ *ACCESO AL CRM MAESTRO:*\n🔗 https://crm.multibancaexpress.com\n📧 *Usuario:* ${email}\n🔑 *Contraseña:* ${pass}\n\n`;
  
  if (taquillaUser && taquillaPass) {
    msg += `🎟️ *ACCESO A TERMINAL TAQUILLA POS (DEMO):*\n🔗 https://taq.multibancaexpress.com\n🏢 *Agencia:* ${agencyName || 'AGENCIA 01 - DEMO'}\n👤 *Usuario Cajero:* ${taquillaUser}\n🔑 *Clave:* ${taquillaPass}\n\n`;
  }
  
  msg += `✅ Tu sistema ya incluye las monedas activas en base de datos (BS, USD, COP), sistemas de lotería y tu primera taquilla lista para operar.\n\n¡Bienvenido a Multibanca Express!`;
  return tel ? `https://wa.me/${tel}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

export function getWhatsAppPasswordUpdatedUrl(
  phone: string | undefined,
  banca: string,
  email: string,
  pass: string
): string {
  const tel = cleanPhone(phone);
  const msg = `¡Hola! 👋\n\nSe ha actualizado tu contraseña de acceso para *${banca}*.\n\n📧 *Usuario/Email:* ${email}\n🔑 *Nueva Contraseña:* ${pass}\n\n¡Gracias!`;
  return tel ? `https://wa.me/${tel}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
