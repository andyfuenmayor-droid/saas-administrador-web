export interface ClientProfile {
  id: string;
  email: string;
  nombre_banca: string;
  plan: string;
  limite_agencias: number;
  status: 'activo' | 'suspendido' | 'vencido' | string;
  fecha_inicio?: string;
  fecha_vencimiento: string;
  representante?: string;
  telefono?: string;
  estado?: string;
  direccion?: string;
  role?: string;
  rol?: string;
  created_at?: string;
}

export interface Lead {
  id: string | number;
  banca: string;
  representante: string;
  email?: string;
  telefono?: string;
  puntos_venta: number | string;
  estado?: string;
  direccion?: string;
  created_at?: string;
}

export interface TrackingLead {
  id: string | number;
  banca: string;
  representante: string;
  email?: string;
  telefono?: string;
  puntos_venta: number;
  plan_cotizado: string;
  total_cotizado: number;
  estado_seguimiento: string;
  estado?: string;
  direccion?: string;
  created_at?: string;
}

export interface PlanConfig {
  costo_base: number;
  costo_por_punto: number;
  descripcion: string;
  modulos: string[];
}

export type CatalogPlans = Record<string, PlanConfig>;

export const TODOS_LOS_MODULOS_CMS: string[] = [
  "Inicio", "Pizarra Confirmaciones", "Sistemas", "Monedas", "Cuentas Bancarias", "Agencias", "Cobradores",
  "Cargar Ventas", "Pagos Agencias", "Gastos Agencias", "Saldo Agencias", 
  "Venta Real", "Rep. Agencia", "Auditoría", "Caja Maestra",
  "Pagos a Operador", "Venta Operadora", "Reporte Operadora", "Cierre Operadora", "Config. Proveedores",
  "Gastos Administrativos", "Cierre ", "Ajustes"
];

export const PLANES_DEFAULT_DICT: CatalogPlans = {
  "Básico (SaaS)": {
    costo_base: 150.0,
    costo_por_punto: 5.0,
    descripcion: "Gestión operativa completa de agencias hasta Caja Maestra.",
    modulos: [
      "Inicio", "Pizarra Confirmaciones", "Sistemas", "Monedas", "Cuentas Bancarias", "Agencias", "Cobradores",
      "Cargar Ventas", "Pagos Agencias", "Gastos Agencias", "Saldo Agencias", 
      "Venta Real", "Rep. Agencia", "Caja Maestra",
      "Cierre ", "Ajustes"
    ]
  },
  "Profesional": {
    costo_base: 250.0,
    costo_por_punto: 8.0,
    descripcion: "Gestión integral de Agencias, Operadoras y Proveedores.",
    modulos: [
      "Inicio", "Pizarra Confirmaciones", "Sistemas", "Monedas", "Cuentas Bancarias", "Agencias", "Cobradores",
      "Cargar Ventas", "Pagos Agencias", "Gastos Agencias", "Saldo Agencias", 
      "Venta Real", "Rep. Agencia", "Caja Maestra",
      "Pagos a Operador", "Venta Operadora", "Reporte Operadora", "Cierre Operadora", "Config. Proveedores",
      "Cierre ", "Ajustes"
    ]
  },
  "Elite": {
    costo_base: 500.0,
    costo_por_punto: 12.0,
    descripcion: "Control total sin límites: Incluye Auditoría Híbrida y Gastos Administrativos.",
    modulos: [...TODOS_LOS_MODULOS_CMS]
  }
};
