import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import { ClientProfile, Lead, TrackingLead, CatalogPlans, PLANES_DEFAULT_DICT, TODOS_LOS_MODULOS_CMS } from './types';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { Login } from './components/Login';
import { ClientsTable } from './components/ClientsTab/ClientsTable';
import { ClientModal } from './components/ClientsTab/ClientModal';
import { PasswordModal } from './components/ClientsTab/PasswordModal';
import { LeadsList } from './components/LeadsTab/LeadsList';
import { QuotationEngine } from './components/LeadsTab/QuotationEngine';
import { TrackingList } from './components/TrackingTab/TrackingList';
import { ActivationModal } from './components/TrackingTab/ActivationModal';
import { SuccessModal } from './components/TrackingTab/SuccessModal';
import { PlansSummary } from './components/PlansTab/PlansSummary';
import { PlanEditor } from './components/PlansTab/PlanEditor';
import { NewPlanForm } from './components/PlansTab/NewPlanForm';
import { FactoryReset } from './components/PlansTab/FactoryReset';
import { Users, Send, Clock, Settings2, RefreshCw, ExternalLink, Globe } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, adminId } = useAuth();

  const [activeTab, setActiveTab] = useState<'clients' | 'leads' | 'tracking' | 'plans'>('clients');
  const [loading, setLoading] = useState(true);

  // Data states
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [trackingLeads, setTrackingLeads] = useState<TrackingLead[]>([]);
  const [catalog, setCatalog] = useState<CatalogPlans>(PLANES_DEFAULT_DICT);

  // Modal states
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<ClientProfile | null>(null);
  const [selectedClientForPassword, setSelectedClientForPassword] = useState<ClientProfile | null>(null);
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState<Lead | null>(null);
  const [selectedLeadForActivation, setSelectedLeadForActivation] = useState<TrackingLead | null>(null);
  const [activationSuccessData, setActivationSuccessData] = useState<{
    banca: string;
    representante: string;
    email: string;
    password: string;
    telefono?: string;
  } | null>(null);

  // Normalizador de nombre de plan
  const normalizePlanName = (p: string): string => {
    const s = (p || '').toLowerCase().trim();
    if (s.includes('básic') || s.includes('basic') || s.includes('sico')) return 'basico';
    if (s.includes('profesional') || s.includes('pro')) return 'profesional';
    if (s.includes('elite') || s.includes('élit') || s.includes('premium') || s.includes('admin')) return 'elite';
    return s.replace(/[^a-zA-Z0-9_]/g, '') || 'plan';
  };

  // Carga de datos
  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Clientes (perfiles)
      const { data: pData } = await supabase.from('perfiles').select('*').order('nombre_banca', { ascending: true });
      if (pData) setClients(pData as ClientProfile[]);

      // 2. Leads (suscriptores_leads)
      const { data: lData } = await supabase.from('suscriptores_leads').select('*').order('id', { ascending: false });
      if (lData) {
        setLeads(lData as Lead[]);
        if (lData.length > 0 && !selectedLeadForQuote) {
          setSelectedLeadForQuote(lData[0] as Lead);
        }
      }

      // 3. Seguimiento (leads_seguimiento)
      const { data: sData } = await supabase.from('leads_seguimiento').select('*').eq('estado_seguimiento', 'esperando_pago').order('id', { ascending: false });
      if (sData) setTrackingLeads(sData as TrackingLead[]);

      // 4. Catálogo de planes
      const { data: cData } = await supabase.from('config_sistema').select('valor').eq('parametro', 'planes_saas_catalogo');
      if (cData && cData.length > 0 && cData[0].valor) {
        try {
          const parsed = JSON.parse(cData[0].valor);
          if (parsed && typeof parsed === 'object') {
            setCatalog(parsed);
          }
        } catch (e) {
          console.error('Error parseando planes_saas_catalogo:', e);
        }
      }
    } catch (err) {
      console.error('Error cargando datos del sistema:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // Guardar catálogo completo en DB y sincronizar con plan_modulos_*
  const saveCatalogToDb = async (newCatalog: CatalogPlans): Promise<boolean> => {
    try {
      const uId = adminId || 'f300c8ad-ddd5-4953-a267-d5b3eb80ce39';

      // 1. Guardar catálogo consolidado
      await supabase.from('config_sistema').delete().eq('parametro', 'planes_saas_catalogo');
      await supabase.from('config_sistema').insert({
        parametro: 'planes_saas_catalogo',
        valor: JSON.stringify(newCatalog),
        user_id: uId
      });

      // 2. Guardar plan_modulos_{norm} para compatibilidad con operadora-cms-web
      for (const [name, info] of Object.entries(newCatalog)) {
        const norm = normalizePlanName(name);
        await supabase.from('config_sistema').delete().eq('parametro', `plan_modulos_${norm}`);
        await supabase.from('config_sistema').insert({
          parametro: `plan_modulos_${norm}`,
          valor: JSON.stringify(info.modulos || TODOS_LOS_MODULOS_CMS),
          user_id: uId
        });
      }

      setCatalog(newCatalog);
      return true;
    } catch (err) {
      console.error('Error guardando catálogo en DB:', err);
      return false;
    }
  };

  const handleSavePlan = async (oldName: string, newName: string, updatedData: any): Promise<boolean> => {
    const updatedCatalog = { ...catalog };
    if (oldName !== newName) {
      delete updatedCatalog[oldName];
    }
    updatedCatalog[newName] = updatedData;
    return await saveCatalogToDb(updatedCatalog);
  };

  const handleCreatePlan = async (planName: string, planData: any): Promise<boolean> => {
    const updatedCatalog = {
      ...catalog,
      [planName]: planData
    };
    return await saveCatalogToDb(updatedCatalog);
  };

  const handleDeletePlan = async (planName: string): Promise<boolean> => {
    const updatedCatalog = { ...catalog };
    delete updatedCatalog[planName];
    return await saveCatalogToDb(updatedCatalog);
  };

  const handleResetToFactory = async (): Promise<boolean> => {
    return await saveCatalogToDb(PLANES_DEFAULT_DICT);
  };

  const handleDeleteTrackingLead = async (lead: TrackingLead) => {
    if (!window.confirm(`¿Eliminar la solicitud de ${lead.banca}?`)) return;
    try {
      await supabase.from('leads_seguimiento').delete().eq('id', lead.id);
      loadAllData();
    } catch (err) {
      console.error('Error eliminando lead en seguimiento:', err);
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#071217] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-emerald-500 selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Top KPIs */}
        <MetricsCards clients={clients} />

        {/* Tab Navigation Capsule */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'clients'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes ({clients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'leads'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-lg shadow-sky-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Solicitudes ({leads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'tracking'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Seguimiento ({trackingLeads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'plans'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>Planes ({Object.keys(catalog).length})</span>
            </button>
          </div>

          <button
            onClick={loadAllData}
            disabled={loading}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
            title="Recargar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {/* Tab 1: Clientes */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white font-['Outfit']">
                    Gestión de Clientes Activos y Licencias
                  </h2>
                  <p className="text-xs text-slate-400">
                    Edite bancos, amplíe puntos de venta, asigne planes y extienda suscripciones en tiempo real.
                  </p>
                </div>
              </div>

              <ClientsTable
                clients={clients}
                onSelectClient={(c) => setSelectedClientForEdit(c)}
                onOpenPasswordModal={(c) => setSelectedClientForPassword(c)}
              />
            </div>
          )}

          {/* Tab 2: Solicitudes */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-white font-['Outfit']">
                    Gestión Estratégica de Leads (Solicitudes Entrantes)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Prospectos capturados desde el formulario de la landing comercial pública.
                  </p>
                </div>

                <a
                  href="https://multibancaexpress.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-amber-500/40 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Formulario Público</span>
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <LeadsList
                    leads={leads}
                    selectedLead={selectedLeadForQuote}
                    onSelectLead={(l) => setSelectedLeadForQuote(l)}
                  />
                </div>

                <div className="lg:col-span-7">
                  {selectedLeadForQuote ? (
                    <QuotationEngine
                      lead={selectedLeadForQuote}
                      catalog={catalog}
                      onMovedToTracking={() => {
                        loadAllData();
                        setSelectedLeadForQuote(null);
                        setActiveTab('tracking');
                      }}
                    />
                  ) : (
                    <div className="glass-panel p-8 rounded-2xl text-center text-slate-500 text-xs">
                      Seleccione una solicitud de la lista izquierda para iniciar la cotización dinámica.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Seguimiento */}
          {activeTab === 'tracking' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit']">
                  Prospectos en Espera de Activación
                </h2>
                <p className="text-xs text-slate-400">
                  Verifique pagos acordados y active el SaaS creando las credenciales oficiales en un solo clic.
                </p>
              </div>

              <TrackingList
                trackingLeads={trackingLeads}
                onSelectToActivate={(t) => setSelectedLeadForActivation(t)}
                onDeleteLead={handleDeleteTrackingLead}
              />
            </div>
          )}

          {/* Tab 4: Planes */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-white font-['Outfit']">
                    Catálogo Dinámico de Planes SaaS y Matriz de Permisos
                  </h2>
                  <p className="text-xs text-slate-400">
                    Cree y modifique en tiempo real todos los renglones y columnas de los planes oficiales.
                  </p>
                </div>

                <a
                  href="https://multibancaexpress.com/#planes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 hover:border-sky-500/40 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Ver Planes en la Web (Público)</span>
                </a>
              </div>

              {/* 1. Summary Table */}
              <PlansSummary catalog={catalog} />

              {/* 2. Editor & New Plan */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PlanEditor
                  catalog={catalog}
                  onSavePlan={handleSavePlan}
                  onDeletePlan={handleDeletePlan}
                />
                <NewPlanForm
                  catalog={catalog}
                  onCreatePlan={handleCreatePlan}
                />
              </div>

              {/* 3. Factory Reset */}
              <FactoryReset onResetToFactory={handleResetToFactory} />
            </div>
          )}
        </div>

      </main>

      {/* MODALS */}
      {selectedClientForEdit && (
        <ClientModal
          client={selectedClientForEdit}
          catalog={catalog}
          onClose={() => setSelectedClientForEdit(null)}
          onSaved={() => loadAllData()}
        />
      )}

      {selectedClientForPassword && (
        <PasswordModal
          client={selectedClientForPassword}
          onClose={() => setSelectedClientForPassword(null)}
        />
      )}

      {selectedLeadForActivation && (
        <ActivationModal
          lead={selectedLeadForActivation}
          onClose={() => setSelectedLeadForActivation(null)}
          onActivated={(creds) => {
            setSelectedLeadForActivation(null);
            setActivationSuccessData(creds);
            loadAllData();
          }}
        />
      )}

      {activationSuccessData && (
        <SuccessModal
          credentials={activationSuccessData}
          onClose={() => setActivationSuccessData(null)}
        />
      )}

    </div>
  );
};

export default App;
