import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { MasterSystem } from '../../types';
import {
  X,
  ShieldCheck,
  FlaskConical,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Eye,
  Check,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  system: MasterSystem | null;
  onSave: (sys: Partial<MasterSystem>) => Promise<boolean>;
}

interface ParsedRowPreview {
  agencia: string;
  venta: number;
  premio: number;
  comision: number;
  neto: number;
}

const PRESET_SAMPLES: Record<
  string,
  {
    name: string;
    filename: string;
    defaultMoneda: string;
    route: string;
    rows: any[][];
  }
> = {
  GATOWEB: {
    name: 'GatoWeb (Análisis por período / Reporte por Agencia)',
    filename: 'Analisis_Periodo_Gatoweb_2026.xlsx',
    defaultMoneda: 'BS',
    route: 'Reportes ➔ Análisis por período (Agrupado por: Usuario) O Reporte por Agencia',
    rows: [
      ['DISTRIBUIDOR: BANKLOT', '', '', '', ''],
      ['USUARIO', 'VENTAS', 'COMISION', 'PREMIOS', 'SALDO'],
      ['chucho@banklot.net', '125.400,00', '0,00', '32.100,00', '93.300,00'],
      ['agencia_la_15', '85.200,50', '0,00', '15.000,00', '70.200,50'],
      ['taquilla_centro', '45.890,00', '0,00', '8.450,00', '37.440,00'],
      ['TOTALES', '256.490,50', '0,00', '55.550,00', '200.940,50'],
    ],
  },
  KENO: {
    name: 'Keno (LotteryAdmin - Virtual Games Report)',
    filename: 'LotteryAdmin_VirtualGames_Report.xlsx',
    defaultMoneda: 'COP',
    route: 'Reports ➔ Virtual Games Report (o Game History)',
    rows: [
      ['VIRTUAL GAMES REPORT - PERIOD 2026-10-19 / 2026-10-25', '', '', '', ''],
      ['AGENT', 'RECEIVED', 'PAID OUT', 'TOTAL ACCEPTED', 'TOTAL PAID', 'PROFIT'],
      ['MAXIMA CDA 02 T2 (5024)', '0,00', '0,00', '1.450.000', '820.000', '630.000'],
      ['CENTRO GUAJIRO (5025)', '0,00', '0,00', '980.000', '430.000', '550.000'],
      ['TAQUILLA NORTE (5026)', '0,00', '0,00', '650.000', '210.000', '440.000'],
      ['TOTAL', '0,00', '0,00', '3.080.000', '1.460.000', '1.620.000'],
    ],
  },
  BETM3: {
    name: 'BetM3 (Reporte General de Ventas BetM3)',
    filename: 'Reporte_General_BetM3_Pesos.xlsx',
    defaultMoneda: 'COP',
    route: 'Reportes ➔ Ventas por Concesionario / Taquillas',
    rows: [
      ['REPORTE GENERAL DE VENTAS BETM3 - PESO (COP)', '', '', ''],
      ['NOMBRE', 'VENTA', 'PREMIO', 'NETO'],
      ['MAXIMA CDA 02 T2', '2.500.000,00', '1.100.000,00', '1.400.000,00'],
      ['CENTRO GUAJIRO', '1.200.000,00', '600.000,00', '600.000,00'],
      ['TOTAL', '3.700.000,00', '1.700.000,00', '2.000.000,00'],
    ],
  },
  CDAPUESTAS: {
    name: 'CDAPuestas (Jugadas y Liquidación de Terminales)',
    filename: 'CDA_Liquidacion_Semanal.xlsx',
    defaultMoneda: 'USD',
    route: 'Reportes ➔ Jugadas y Liquidación de Terminales',
    rows: [
      ['CDAPUESTAS TERMINAL SETTLEMENT USD', '', '', ''],
      ['AGENCIA', 'TOTAL VENTA', 'TOTAL PREMIOS', 'BALANCE'],
      ['MAXIMA CDA 01', '540,50', '210,00', '330,50'],
      ['AGENCIA LA SUR', '320,00', '95,00', '225,00'],
      ['TOTAL', '860,50', '305,00', '555,50'],
    ],
  },
  GATO_PESOS: {
    name: 'Gato Pesos (Reporte de Ventas en Pesos)',
    filename: 'GatoPesos_Ventas.xlsx',
    defaultMoneda: 'COP',
    route: 'Reportes ➔ Ventas por Entidad / Concesionario',
    rows: [
      ['GATO PESOS COLOMBIA - VENTAS', '', '', ''],
      ['AGENCIA', 'VENTA', 'PREMIOS', 'SALDO'],
      ['MAXIMA CDA 0Z TZ', '1.800.000', '750.000', '1.050.000'],
      ['SUCURSAL 02', '900.000', '320.000', '580.000'],
      ['TOTAL', '2.700.000', '1.070.000', '1.630.000'],
    ],
  },
};

function parseNum(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).trim().replace(/\s/g, '');
  if (!str) return 0;
  str = str.replace(/[^0-9.,-]/g, '');
  if (!str) return 0;
  if (str.includes(',') && str.includes('.')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
    } else {
      return parseFloat(str.replace(/,/g, '')) || 0;
    }
  } else if (str.includes(',')) {
    return parseFloat(str.replace(',', '.')) || 0;
  }
  return parseFloat(str) || 0;
}

export const SystemMasterModal: React.FC<Props> = ({ isOpen, onClose, system, onSave }) => {
  // System Fields
  const [nombre, setNombre] = useState('');
  const [colAgencia, setColAgencia] = useState('');
  const [colVenta, setColVenta] = useState('');
  const [colPremio, setColPremio] = useState('');
  const [colComision, setColComision] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('BS');

  // Load Test State
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [columnsList, setColumnsList] = useState<string[]>([]);
  const [headerIndex, setHeaderIndex] = useState<number>(-1);
  const [fileName, setFileName] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<ParsedRowPreview[]>([]);
  const [isTestPassed, setIsTestPassed] = useState<boolean>(false);
  const [testSummary, setTestSummary] = useState<{ totalVenta: number; totalPremio: number; totalAgencias: number } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset when system or open state changes
  useEffect(() => {
    if (system) {
      setNombre(system.nombre_sistema || '');
      setColAgencia(system.col_agencia || '');
      setColVenta(system.col_venta || '');
      setColPremio(system.col_premio || '');
      setDescripcion(system.descripcion || '');
      
      const sUpper = (system.nombre_sistema || '').toUpperCase();
      if (sUpper === 'GATOWEB' || sUpper === 'HIPISMO' || sUpper === 'PARLEY INH') {
        setBaseCurrency('BS');
      } else if (sUpper === 'CDAPUESTAS') {
        setBaseCurrency('USD');
      } else {
        setBaseCurrency('COP');
      }

      // Check if system matches a preset to immediately pre-load sample rows
      const presetKey = Object.keys(PRESET_SAMPLES).find((k) => k === sUpper || k.replace('_', ' ') === sUpper);
      if (presetKey && PRESET_SAMPLES[presetKey]) {
        const sample = PRESET_SAMPLES[presetKey];
        analyzeRows(sample.rows, sample.filename, sample.defaultMoneda, sample.route, system.col_agencia, system.col_venta, system.col_premio);
      } else {
        setRawRows([]);
        setColumnsList(system.col_agencia ? [system.col_agencia, system.col_venta, system.col_premio].filter(Boolean) : []);
        setFileName('');
        setPreviewRows([]);
        setIsTestPassed(false);
        setTestSummary(null);
      }
    } else {
      setNombre('');
      setColAgencia('');
      setColVenta('');
      setColPremio('');
      setColComision('');
      setDescripcion('');
      setBaseCurrency('BS');
      setRawRows([]);
      setColumnsList([]);
      setHeaderIndex(-1);
      setFileName('');
      setPreviewRows([]);
      setIsTestPassed(false);
      setTestSummary(null);
    }
    setError(null);
  }, [system, isOpen]);

  if (!isOpen) return null;

  // Real-time analysis of tabular rows
  const analyzeRows = (
    rows: any[][],
    fName: string,
    presetMoneda?: string,
    presetRoute?: string,
    forceAg?: string,
    forceVenta?: string,
    forcePremio?: string
  ) => {
    setFileName(fName);
    setRawRows(rows);

    const agencyKeywords = ['AGENT', 'AGENCIA', 'NOMBRE', 'USUARIO', 'TAQUILLA', 'BANCA', 'CLIENTE'];
    const ventaKeywords = ['TOTAL ACCEPTED', 'ACCEPTED', 'VENTA', 'VENTAS', 'TOTAL VENTA', 'JUGADO', 'BRUTO'];
    const premioKeywords = ['TOTAL PAID', 'PAID OUT', 'PREMIO', 'PREMIOS', 'TOTAL PREMIOS', 'PAGADO'];
    const comisionKeywords = ['COMISION', 'COMISIÓN', 'COMISIONES', 'GANANCIA'];

    let foundHeaderIdx = -1;
    let foundCols: string[] = [];

    for (let i = 0; i < Math.min(25, rows.length); i++) {
      const rowStr = rows[i].map((c) => String(c ?? '').trim().toUpperCase()).join(' ');
      const hasAg = agencyKeywords.some((k) => rowStr.includes(k));
      const hasFin = ventaKeywords.some((k) => rowStr.includes(k)) || premioKeywords.some((k) => rowStr.includes(k));
      if (hasAg && hasFin) {
        foundHeaderIdx = i;
        foundCols = rows[i].map((c) => String(c ?? '').trim());
        break;
      }
    }

    if (foundHeaderIdx === -1 && rows.length > 0) {
      foundHeaderIdx = 0;
      foundCols = rows[0].map((c, idx) => String(c ?? '').trim() || `Columna_${idx + 1}`);
    }

    setHeaderIndex(foundHeaderIdx);
    const validCols = foundCols.filter(Boolean);
    setColumnsList(validCols);

    // Auto-detect matching columns if not forced
    let selectedAg = forceAg || '';
    let selectedVenta = forceVenta || '';
    let selectedPremio = forcePremio || '';
    let selectedComision = '';

    validCols.forEach((col) => {
      const u = col.toUpperCase().trim();
      if (!selectedAg && agencyKeywords.some((k) => u === k || u.includes(k))) selectedAg = col;
      if (!selectedVenta && ventaKeywords.some((k) => u === k || u.includes(k))) selectedVenta = col;
      if (!selectedPremio && premioKeywords.some((k) => u === k || u.includes(k))) selectedPremio = col;
      if (!selectedComision && comisionKeywords.some((k) => u === k || u.includes(k))) selectedComision = col;
    });

    setColAgencia(selectedAg);
    setColVenta(selectedVenta);
    setColPremio(selectedPremio);
    if (selectedComision) setColComision(selectedComision);

    // Currency Detection
    const fileDna = (fName + ' ' + rows.slice(0, 10).map((r) => r.join(' ')).join(' ')).toUpperCase();
    let detectedCurr = presetMoneda || '';
    if (!detectedCurr) {
      if (fileDna.includes('COP') || fileDna.includes('PESO')) detectedCurr = 'COP';
      else if (fileDna.includes('USD') || fileDna.includes('DOLAR') || fileDna.includes('DÓLAR')) detectedCurr = 'USD';
      else if (fileDna.includes('BS') || fileDna.includes('BOLIVAR') || fileDna.includes('BOLÍVAR') || fileDna.includes('VES')) detectedCurr = 'BS';
      else detectedCurr = 'BS';
    }
    setBaseCurrency(detectedCurr);

    // Guess system name if empty
    if (!nombre) {
      let guessed = '';
      if (fileDna.includes('GATOWEB') || fileDna.includes('BANKLOT')) guessed = 'GATOWEB';
      else if (fileDna.includes('KENO') || fileDna.includes('LOTTERYADMIN') || fileDna.includes('VIRTUAL GAMES')) guessed = 'KENO';
      else if (fileDna.includes('BETM3')) guessed = 'BETM3';
      else if (fileDna.includes('CDAPUESTAS') || fileDna.includes('CDA')) guessed = 'CDAPUESTAS';
      else if (fileDna.includes('GATO PESOS')) guessed = 'GATO PESOS';
      else if (fileDna.includes('HIPISMO')) guessed = 'HIPISMO';
      else if (fileDna.includes('PARLEY INH')) guessed = 'PARLEY INH';

      if (guessed) setNombre(guessed);
    }

    if (presetRoute) {
      setDescripcion(presetRoute);
    }

    // Run preview and validate test
    computePreview(rows, foundHeaderIdx, validCols, selectedAg, selectedVenta, selectedPremio, selectedComision);
  };

  const computePreview = (
    rows: any[][],
    hIdx: number,
    cols: string[],
    agCol: string,
    vCol: string,
    pCol: string,
    cCol: string
  ) => {
    if (hIdx === -1 || rows.length === 0 || !agCol || !vCol || !pCol) {
      setPreviewRows([]);
      setIsTestPassed(false);
      setTestSummary(null);
      return;
    }

    const dataRows = rows.slice(hIdx + 1);
    const agIdx = cols.indexOf(agCol);
    const vIdx = cols.indexOf(vCol);
    const pIdx = cols.indexOf(pCol);
    const cIdx = cCol ? cols.indexOf(cCol) : -1;

    const previews: ParsedRowPreview[] = [];
    let sumVenta = 0;
    let sumPremio = 0;

    for (const r of dataRows.slice(0, 10)) {
      const agVal = agIdx !== -1 ? String(r[agIdx] ?? '').trim() : '';
      if (!agVal || agVal.toUpperCase().includes('TOTAL')) continue;

      const vVal = vIdx !== -1 ? parseNum(r[vIdx]) : 0;
      const pVal = pIdx !== -1 ? parseNum(r[pIdx]) : 0;
      const cVal = cIdx !== -1 ? parseNum(r[cIdx]) : 0;
      const nVal = vVal - pVal - cVal;

      sumVenta += vVal;
      sumPremio += pVal;

      previews.push({
        agencia: agVal,
        venta: vVal,
        premio: pVal,
        comision: cVal,
        neto: nVal,
      });
    }

    setPreviewRows(previews);

    // Pass criteria: At least 1 valid agency with non-zero or calculated numbers
    const passed = previews.length > 0 && agIdx !== -1 && vIdx !== -1 && pIdx !== -1;
    setIsTestPassed(passed);
    if (passed) {
      setTestSummary({
        totalAgencias: previews.length,
        totalVenta: sumVenta,
        totalPremio: sumPremio,
      });
    } else {
      setTestSummary(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });
        analyzeRows(data, file.name);
      } catch (err: any) {
        setError(`Error al procesar archivo: ${err.message || 'Formato no soportado'}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleColumnChange = (field: 'agencia' | 'venta' | 'premio' | 'comision', val: string) => {
    let newAg = colAgencia;
    let newV = colVenta;
    let newP = colPremio;
    let newC = colComision;

    if (field === 'agencia') {
      newAg = val;
      setColAgencia(val);
    } else if (field === 'venta') {
      newV = val;
      setColVenta(val);
    } else if (field === 'premio') {
      newP = val;
      setColPremio(val);
    } else if (field === 'comision') {
      newC = val;
      setColComision(val);
    }

    computePreview(rawRows, headerIndex, columnsList, newAg, newV, newP, newC);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNombre = nombre.trim().toUpperCase();

    if (!cleanNombre) {
      setError('El nombre del sistema es obligatorio.');
      return;
    }
    if (!isTestPassed) {
      setError('Debes realizar una prueba de carga exitosa antes de certificar este sistema globalmente.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ok = await onSave({
        ...(system?.id ? { id: system.id } : {}),
        nombre_sistema: cleanNombre,
        col_agencia: colAgencia.trim(),
        col_venta: colVenta.trim(),
        col_premio: colPremio.trim(),
        descripcion: descripcion.trim() || `Certificado en Laboratorio con divisa base ${baseCurrency}`,
        icono: '🎰',
      });

      if (ok) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        onClose();
      } else {
        setError('No se pudo guardar el sistema. Verifica que el nombre no esté duplicado en el catálogo.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error guardando sistema en el catálogo maestro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0b171c] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-200 my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                {system ? `Probar y Actualizar: ${system.nombre_sistema}` : 'Nuevo Sistema: Prueba de Carga y Certificación'}
              </h3>
              <p className="text-xs text-slate-400">
                Regla inmutable: Ningún sistema se publica en el catálogo maestro sin superar antes una prueba de carga real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTestPassed ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <Check className="w-3.5 h-3.5" />
                <span>Prueba de Carga Aprobada</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Prueba Pendiente</span>
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 shrink-0 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-3 text-xs">
          {/* STEP 1: LOAD TEST LAB */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
              <span className="font-bold text-white text-xs flex items-center gap-2 uppercase tracking-wider text-cyan-300">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                Paso 1: Prueba de Carga del Archivo Real
              </span>
              <span className="text-[11px] text-slate-400">
                Sube el reporte o prueba una plantilla con 1 clic:
              </span>
            </div>

            {/* Presets quick test */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Plantillas rápidas:</span>
              {Object.entries(PRESET_SAMPLES).map(([key, sample]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => analyzeRows(sample.rows, sample.filename, sample.defaultMoneda, sample.route)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-white/10 hover:border-cyan-500/40 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>🎰</span>
                  <span>{key}</span>
                  <span className="text-[9px] px-1 rounded bg-black/40 text-cyan-300">{sample.defaultMoneda}</span>
                </button>
              ))}
            </div>

            {/* File upload dropzone */}
            <div className="p-4 rounded-xl border border-dashed border-cyan-500/30 bg-black/20 hover:border-cyan-500/60 transition-colors flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <div className="text-white font-bold text-xs flex items-center justify-center sm:justify-start gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>{fileName ? `Archivo: ${fileName}` : 'Seleccionar Archivo de Ventas (.xlsx, .xls, .csv, .txt)'}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {rawRows.length > 0 ? `✓ Se leyeron ${rawRows.length} filas del archivo.` : 'Arrastra o sube el reporte emitido por la plataforma del proveedor.'}
                </div>
              </div>

              <label className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{fileName ? 'Cambiar Archivo' : 'Subir Archivo'}</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Column Selectors */}
            {columnsList.length > 0 ? (
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-3">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Columnas Detectadas en el Archivo (Confirma el Mapeo):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Columna Agencia <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={colAgencia}
                      onChange={(e) => handleColumnChange('agencia', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="">-- Seleccionar --</option>
                      {columnsList.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Columna Venta <span className="text-emerald-400">*</span>
                    </label>
                    <select
                      value={colVenta}
                      onChange={(e) => handleColumnChange('venta', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">-- Seleccionar --</option>
                      {columnsList.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Columna Premio <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={colPremio}
                      onChange={(e) => handleColumnChange('premio', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-300 font-mono text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">-- Seleccionar --</option>
                      {columnsList.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center text-slate-400 text-xs bg-black/20 rounded-xl border border-white/5">
                💡 Sube un archivo de ventas o haz clic en una de las plantillas rápidas arriba para detectar sus columnas.
              </div>
            )}

            {/* Live Parsing Preview */}
            {previewRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    Resultado de la Prueba de Carga en Vivo:
                  </span>
                  {testSummary && (
                    <span className="text-emerald-400 font-mono font-bold">
                      ✓ {testSummary.totalAgencias} taquillas computadas con éxito
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto border border-white/5 rounded-xl bg-black/40">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Agencia / Taquilla</th>
                        <th className="p-2 text-right">Venta</th>
                        <th className="p-2 text-right">Premios</th>
                        <th className="p-2 text-right">Neto Calculado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {previewRows.map((r, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="p-2 text-cyan-300 font-semibold">{r.agencia}</td>
                          <td className="p-2 text-right text-emerald-300">
                            {r.venta.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-right text-rose-300">
                            {r.premio.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-right font-bold text-white">
                            {r.neto.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: GLOBAL CERTIFICATION DETAILS */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
            <span className="font-bold text-white text-xs flex items-center gap-2 uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Paso 2: Datos del Sistema y Certificación Global
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre del Sistema <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value.toUpperCase())}
                  placeholder="Ej: BETM3, KENO, GATOWEB..."
                  required
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Moneda Base Recomendada
                </label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                >
                  <option value="BS">🇻🇪 Bolívares (BS)</option>
                  <option value="COP">🇨🇴 Pesos Colombianos (COP)</option>
                  <option value="USD">🇺🇸 Dólares (USD)</option>
                  <option value="EUR">🇪🇺 Euros (EUR)</option>
                  <option value="USDT">🪙 Tether USDT</option>
                  <option value="BRL">🇧🇷 Real Brasileño (BRL)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ruta de Descarga / Notas para los SaaS (Guía Visual)
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Reportes ➔ Análisis por período (Agrupado por: Usuario)"
                className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 shrink-0">
          <div className="text-xs text-slate-400">
            {isTestPassed ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Prueba superada: Listo para certificar en toda la red SaaS.
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Sube un archivo y confirma las 3 columnas para habilitar la certificación.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !isTestPassed || !nombre.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>
                {system ? 'CERTIFICAR CAMBIOS' : 'CERTIFICAR Y PUBLICAR EN CATÁLOGO GLOBAL'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
