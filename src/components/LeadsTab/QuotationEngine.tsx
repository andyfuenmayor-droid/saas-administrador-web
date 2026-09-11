import React, { useState, useEffect } from 'react';
import { Lead, CatalogPlans } from '../../types';
import { formatCurrency, getWhatsAppPitchUrl } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';
import { Calculator, Send, ArrowRight, ExternalLink, ShieldAlert, Check } from 'lucide-react';

interface QuotationEngineProps {
  lead: Lead;
  catalog: CatalogPlans;
  onMovedToTracking: () => void;
}

export const QuotationEngine: React.FC<QuotationEngineProps> = ({ lead, catalog, onMovedToTracking }) => {
  const planKeys = Object.keys(catalog);
  const [selectedPlan, setSelectedPlan] = useState<string>(planKeys[0] || 'Básico (SaaS)');
  const [discount, setDiscount] = useState<number>(0);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(['Zelle', 'Binance (USDT)']);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (planKeys.length > 0 && !catalog[selectedPlan]) {
      setSelectedPlan(planKeys[0]);
    }
  }, [catalog]);

  const planData = catalog[selectedPlan] || { costo_base: 150.0, costo_por_punto: 5.0, descripcion: '', modulos: [] };
  const pts = typeof lead.puntos_venta === 'number' ? lead.puntos_venta : parseInt(String(lead.puntos_venta)) || 5;

  const baseCost =
    planData.costo_base !== undefined && planData.costo_base !== null && !isNaN(Number(planData.costo_base))
      ? Number(planData.costo_base)
      : 150.0;
  const pointCost =
    planData.costo_por_punto !== undefined && planData.costo_por_punto !== null && !isNaN(Number(planData.costo_por_punto))
      ? Number(planData.costo_por_punto)
      : 0.0;
  const pointLimit =
    planData.limite_puntos !== undefined && planData.limite_puntos !== null && !isNaN(Number(planData.limite_puntos))
      ? Number(planData.limite_puntos)
      : 0;

  const extraPts = pointLimit > 0 ? Math.max(0, pts - pointLimit) : 0;
  const totalRaw = baseCost + (extraPts * pointCost) - Number(discount);
  const finalTotal = Math.max(0, totalRaw);

  const paymentOptions = ['Zelle', 'PayPal', 'Binance (USDT)', 'Pago Móvil', 'Transferencia ACH', 'Efectivo'];

  const toggleMethod = (method: string) => {
    if (selectedPaymentMethods.includes(method)) {
      setSelectedPaymentMethods(selectedPaymentMethods.filter(m => m !== method));
    } else {
      setSelectedPaymentMethods([...selectedPaymentMethods, method]);
    }
  };

  const whatsappUrl = getWhatsAppPitchUrl(
    lead.telefono || '',
    lead.representante,
    lead.banca,
    selectedPlan,
    finalTotal,
    selectedPaymentMethods
  );

  const handleMoveToTracking = async () => {
    setMoving(true);
    try {
      const trackingData = {
        banca: lead.banca,
        representante: lead.representante,
        email: lead.email || '',
        telefono: lead.telefono || '',
        puntos_venta: pts,
        plan_cotizado: selectedPlan,
        total_cotizado: finalTotal,
        estado_seguimiento: 'esperando_pago',
        estado: lead.estado || '',
        direccion: lead.direccion || ''
      };

      const { error: insertErr } = await supabase.from('leads_seguimiento').insert(trackingData);
      if (insertErr) throw insertErr;

      const { error: delErr } = await supabase.from('suscriptores_leads').delete().eq('id', lead.id);
      if (delErr) throw delErr;

      onMovedToTracking();
    } catch (err) {
      console.error('Error al mover lead a seguimiento:', err);
      alert('Ocurrió un error al mover la solicitud a seguimiento');
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
        <Calculator className="w-5 h-5 text-emerald-400" />
        <h3 className="font-bold text-white text-base font-['Outfit']">
          Cotizador Dinámico en Vivo
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Plan Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Plan a Cotizar:
          </label>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            {planKeys.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Descuento */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            💸 Aplicar Descuento Especial (USD):
          </label>
          <input
            type="number"
            min="0"
            step="5"
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
            className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-slate-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Métodos de Pago */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2">
          💳 Métodos de Pago a Ofrecer al Cliente:
        </label>
        <div className="flex flex-wrap gap-2">
          {paymentOptions.map(m => {
            const active = selectedPaymentMethods.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMethod(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {active && <Check className="w-3 h-3 text-emerald-400" />}
                <span>{m}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Total Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border border-emerald-500/30 shadow-lg">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Inversión Calculada ({selectedPlan}):</span>
          <span>{pts} Puntos de Venta</span>
        </div>
        <div className="text-3xl font-extrabold text-emerald-400 font-['Outfit']">
          {formatCurrency(finalTotal)}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Base: {formatCurrency(baseCost)}
          {pointLimit > 0 ? ` (hasta ${pointLimit} ag. incl.)` : ' (ilimitado)'}
          {extraPts > 0 ? ` + (${extraPts} pts adic. × ${formatCurrency(pointCost)})` : ''}
          {discount > 0 && ` - Descuento: ${formatCurrency(discount)}`}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all text-center"
        >
          <span>🟢 ENVIAR PROPUESTA POR WHATSAPP</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          type="button"
          onClick={handleMoveToTracking}
          disabled={moving}
          className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition-all disabled:opacity-50"
        >
          {moving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>🚀 Mover a Seguimiento (Cotizado)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
