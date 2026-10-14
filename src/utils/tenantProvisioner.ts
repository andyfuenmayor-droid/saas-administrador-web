import { supabase } from '../lib/supabase';

export interface ProvisioningResult {
  success: boolean;
  currenciesCount: number;
  systemsCount: number;
  agencyId: number | null;
  agencyName: string;
  taquillaUser: string;
  taquillaPass: string;
  error?: string;
}

/**
 * Normaliza nombres eliminando espacios sobrantes
 */
function cleanName(str: string): string {
  return (str || '').trim();
}

/**
 * Extrae dinámicamente el catálogo maestro de monedas y sistemas actualmente activos en la base de datos
 */
export async function fetchDatabaseCatalog(): Promise<{
  currencies: { Nombre_Moneda: string; Simbolo: string }[];
  systems: string[];
}> {
  try {
    // 1. Obtener todas las monedas de la base de datos
    const { data: rawCurrencies } = await supabase
      .from('monedas')
      .select('Nombre_Moneda, Simbolo');

    const currencyMap = new Map<string, { Nombre_Moneda: string; Simbolo: string }>();

    if (rawCurrencies && rawCurrencies.length > 0) {
      rawCurrencies.forEach((c: any) => {
        const name = cleanName(c.Nombre_Moneda || c.nombre_moneda || '');
        const symbol = cleanName(c.Simbolo || c.simbolo || name);
        if (name) {
          const key = name.toUpperCase();
          if (!currencyMap.has(key)) {
            currencyMap.set(key, { Nombre_Moneda: name, Simbolo: symbol });
          }
        }
      });
    }

    // Si la BD no tuviese monedas, fallback de seguridad a las 3 principales
    if (currencyMap.size === 0) {
      currencyMap.set('BS', { Nombre_Moneda: 'Bs', Simbolo: 'Bs' });
      currencyMap.set('USD', { Nombre_Moneda: 'USD', Simbolo: '$' });
      currencyMap.set('COP', { Nombre_Moneda: 'COP', Simbolo: 'COP' });
    }

    // 2. Obtener todos los sistemas de lotería y apuestas de la base de datos
    const { data: rawSystems } = await supabase
      .from('sistemas')
      .select('nombre_sistema');

    const systemSet = new Set<string>();

    if (rawSystems && rawSystems.length > 0) {
      rawSystems.forEach((s: any) => {
        const name = cleanName(s.nombre_sistema || '');
        if (name) {
          systemSet.add(name.toUpperCase());
        }
      });
    }

    // Fallback de seguridad si no hubiera ninguno
    if (systemSet.size === 0) {
      ['BETM3', 'CDAPUESTAS', 'GATOWEB', 'KENO', 'BETF4', 'GATO PESOS'].forEach((s) =>
        systemSet.add(s)
      );
    }

    return {
      currencies: Array.from(currencyMap.values()),
      systems: Array.from(systemSet.values()),
    };
  } catch (err) {
    console.warn('Error extrayendo catálogo dinámico de la BD, usando predeterminados:', err);
    return {
      currencies: [
        { Nombre_Moneda: 'Bs', Simbolo: 'Bs' },
        { Nombre_Moneda: 'USD', Simbolo: '$' },
        { Nombre_Moneda: 'COP', Simbolo: 'COP' },
      ],
      systems: ['BETM3', 'CDAPUESTAS', 'GATOWEB', 'KENO', 'BETF4', 'GATO PESOS'],
    };
  }
}

/**
 * Aprovisiona completamente un nuevo SaaS Tenant con Monedas, Sistemas,
 * Agencia Demo y Terminal Taquilla con cajero operativo.
 */
export async function provisionTenantFromDatabase(
  userId: string,
  bancaName: string
): Promise<ProvisioningResult> {
  const result: ProvisioningResult = {
    success: false,
    currenciesCount: 0,
    systemsCount: 0,
    agencyId: null,
    agencyName: 'AGENCIA 01 - DEMO',
    taquillaUser: 'taquilla1',
    taquillaPass: '123456',
  };

  if (!userId) {
    result.error = 'No se proporcionó un ID de usuario válido';
    return result;
  }

  try {
    // 1. Consultar catálogo vivo de la base de datos
    const { currencies, systems } = await fetchDatabaseCatalog();

    // 2. Insertar monedas para el nuevo suscriptor
    const currenciesPayload = currencies.map((c) => ({
      Nombre_Moneda: c.Nombre_Moneda,
      Simbolo: c.Simbolo,
      user_id: userId,
    }));

    const { error: currErr } = await supabase.from('monedas').insert(currenciesPayload);
    if (!currErr) {
      result.currenciesCount = currenciesPayload.length;
    } else {
      console.error('Error insertando monedas para el tenant:', currErr);
    }

    // 3. Insertar sistemas para el nuevo suscriptor
    const systemsPayload = systems.map((sys) => ({
      nombre_sistema: sys,
      user_id: userId,
    }));

    const { error: sysErr } = await supabase.from('sistemas').insert(systemsPayload);
    if (!sysErr) {
      result.systemsCount = systemsPayload.length;
    } else {
      console.error('Error insertando sistemas para el tenant:', sysErr);
    }

    // 4. Preparar credenciales de Taquilla Demo
    const safeBancaSlug = (bancaName || 'banca')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 8);
    const taquillaUser = `taq_${safeBancaSlug || 'demo'}`;
    const taquillaPass = '123456';
    const agencyName = 'AGENCIA 01 - DEMO';

    result.taquillaUser = taquillaUser;
    result.taquillaPass = taquillaPass;
    result.agencyName = agencyName;

    // 5. Construir condiciones de sistemas por defecto (15% de comisión estándar)
    const currencyNames = currencies.map((c) => c.Nombre_Moneda);
    const condicionesSistemas: Record<string, any> = {};

    systems.forEach((sys) => {
      currencyNames.forEach((mon) => {
        const comboKey = `${sys}_${mon}`;
        condicionesSistemas[comboKey] = {
          sistema: sys,
          moneda: mon,
          codigo: agencyName,
          comision: 15,
          participacion: 0,
        };
      });
      // Fallback base por sistema
      condicionesSistemas[sys] = {
        sistema: sys,
        codigo: agencyName,
        comision: 15,
      };
    });

    // 6. Insertar Agencia Demo en 'agencias'
    const agencyPayload = {
      nombre_agencia: agencyName,
      sistemas: systems.join(', '),
      monedas: currencyNames.join(', '),
      comision: 15,
      participacion_ag: 0,
      saldo_inicial_bs: 0,
      saldo_inicial_usd: 0,
      saldo_inicial_cop: 0,
      Saldo_BS: 0,
      Saldo_USD: 0,
      Saldo_COP: 0,
      auditoria_activa: true,
      cuentas_asignadas: 'NINGUNA',
      usuario_taquilla: taquillaUser,
      clave_taquilla: taquillaPass,
      condiciones_sistemas: JSON.stringify(condicionesSistemas),
      user_id: userId,
    };

    const { data: agencyData, error: agErr } = await supabase
      .from('agencias')
      .insert(agencyPayload)
      .select('id')
      .single();

    if (agErr) {
      console.error('Error creando agencia demo:', agErr);
    } else if (agencyData) {
      result.agencyId = agencyData.id;

      // 7. Insertar Taquilla / Cajero en 'taquilla_usuarios'
      const cashierPayload = {
        user_id: userId,
        agencia_id: agencyData.id,
        usuario: taquillaUser,
        clave: taquillaPass,
        nombre_cajero: 'Cajero Demo 01',
        rol: 'cajero',
        activo: true,
      };

      const { error: cashierErr } = await supabase
        .from('taquilla_usuarios')
        .insert(cashierPayload);

      if (cashierErr) {
        console.error('Error creando usuario taquilla demo:', cashierErr);
      }
    }

    result.success = true;
    return result;
  } catch (err: any) {
    console.error('Error general en aprovisionamiento dinámico:', err);
    result.error = err.message || 'Error desconocido';
    return result;
  }
}
