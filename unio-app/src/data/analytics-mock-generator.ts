// ─── Seeded PRNG (Mulberry32) ─────────────────────────────────────────────────
// Same filter combination always produces the same numbers (deterministic).

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(filters: string) {
  return mulberry32(hashStr(filters));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(r: () => number, min: number, max: number) {
  return Math.round(r() * (max - min) + min);
}
function randF(r: () => number, min: number, max: number, decimals = 1) {
  return parseFloat((r() * (max - min) + min).toFixed(decimals));
}
function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VacancyStat {
  key: string;
  label: string;
  value: number;
  sub: string;
  accentColor: string;
  selectedBg: string;
}

export interface KpiCard {
  key: string;
  label: string;
  value: string;
  sub: string;
  detail: string;
  detailColor: string;
}

export interface FunnelStage {
  label: string;
  value: number;
  pct: number;
  convLabel: string;
  dropoff: string | null;
}

export interface DropoffRow {
  reason: string;
  count: number;
  pct: string;
}

export interface TimePhase {
  label: string;
  days: number;
  bottleneck: boolean;
}

export interface HrResponseRow {
  from: string;
  days: number;
  warning: boolean;
}

export interface AgingRow {
  vacante: string;
  area: string;
  days: number;
}

export interface HmRow {
  name: string;
  area: string;
  vacantes: number;
  entrevistas: number;
  contratados: number;
  ratio: string;
  ratioOk: boolean;
  ttf: string;
}

export interface DetailRow {
  vacante: string;
  area: string;
  tipo: string;
  estado: string;
  aplicados: number;
  contratados: number;
  ratio: string;
  ttf: string;
  aging: boolean;
  ahorro: string;
}

export interface AnalyticsMockData {
  vacancyStats: VacancyStat[];
  kpiCards: KpiCard[];
  funnelStages: FunnelStage[];
  dropoffTable: DropoffRow[];
  timePhases: TimePhase[];
  hrResponse: HrResponseRow[];
  agingCritico: AgingRow[];
  hmTable: HmRow[];
  detailTable: DetailRow[];
}

// ─── Generator ────────────────────────────────────────────────────────────────

export function generateAnalyticsData(
  periodo: string,
  tipo: string,
  estado: string,
  channel: string
): AnalyticsMockData {
  const seed = `${periodo}|${tipo}|${estado}|${channel}`;
  const r = rng(seed);

  // ── Vacancy counts (scaled by tipo/estado scope)
  const totalVacantes = rand(r, 28, 65);
  const abiertas = rand(r, 4, Math.floor(totalVacantes * 0.35));
  const completadas = rand(r, 8, Math.floor(totalVacantes * 0.55));
  const pausadas = rand(r, 1, 6);
  const desiertas = rand(r, 0, 4);

  const vacancyStats: VacancyStat[] = [
    { key: 'Abierta',    label: 'Abiertas',    value: abiertas,    sub: 'En proceso actualmente',    accentColor: 'var(--color-brand-accent)',  selectedBg: 'var(--color-secondary-50)' },
    { key: 'Completada', label: 'Completadas', value: completadas, sub: 'Cerradas con contratado',   accentColor: 'var(--color-positive-500)', selectedBg: '#edfaf3' },
    { key: 'Pausada',    label: 'Pausadas',    value: pausadas,    sub: 'En espera de decisión',     accentColor: 'var(--color-warning-500)',  selectedBg: '#fffbeb' },
    { key: 'Desierta',   label: 'Desiertas',   value: desiertas,   sub: 'Sin candidato contratado',  accentColor: 'var(--color-neutral-400)',  selectedBg: 'var(--color-surface-subtle)' },
  ];

  // ── KPIs
  const ahorroH   = rand(r, 320, 620);
  const costoHora = pick(r, [40000, 45000, 50000, 55000, 60000]);
  const ahorroM   = Math.round((ahorroH * costoHora * completadas) / 1_000_000);
  const ttfDays   = rand(r, 18, 42);
  const ttfManual = ttfDays + rand(r, 10, 22);
  const ttfSaving = Math.round(((ttfManual - ttfDays) / ttfManual) * 100);
  const totalApps = rand(r, 1200, 4000);
  const ratio     = Math.round(totalApps / Math.max(completadas, 1));
  const tasa      = ((1 / ratio) * 100).toFixed(2);
  const vsAnterior = rand(r, 5, 28);

  const kpiCards: KpiCard[] = [
    {
      key: 'ahorro_h',
      label: 'AHORRO DE HORAS',
      value: `${ahorroH}h`,
      sub: 'promedio por vacante',
      detail: `↑ +${vsAnterior}% vs mes anterior`,
      detailColor: 'var(--color-positive-600)',
    },
    {
      key: 'ahorro_v',
      label: 'VALOR DEL AHORRO',
      value: `$${ahorroM}M`,
      sub: 'COP por vacante',
      detail: `Costo hora: $${costoHora.toLocaleString('es-CO')}`,
      detailColor: 'var(--color-text-muted)',
    },
    {
      key: 'ttf',
      label: 'TIME-TO-FILL',
      value: `${ttfDays} días`,
      sub: 'promedio',
      detail: `vs ${ttfManual} días manual (-${ttfSaving}%)`,
      detailColor: 'var(--color-positive-600)',
    },
    {
      key: 'ratio',
      label: 'RATIO DE CONVERSIÓN',
      value: `${ratio}:1`,
      sub: 'CVs por contratado',
      detail: `Tasa: ${tasa}%`,
      detailColor: 'var(--color-text-muted)',
    },
  ];

  // ── Funnel
  const aplicados   = totalApps;
  const scoringPct  = randF(r, 78, 92);
  const scoring     = Math.round(aplicados * scoringPct / 100);
  const dropoffN    = aplicados - scoring;
  const prePct      = randF(r, 44, 62);
  const prescreen   = Math.round(scoring * prePct / 100);
  const entPct      = randF(r, 16, 28);
  const entrevistas = Math.round(prescreen * entPct / 100);
  const evalPct     = randF(r, 30, 50);
  const evaluacion  = Math.round(entrevistas * evalPct / 100);
  const finPct      = randF(r, 25, 40);
  const finalistas  = Math.round(evaluacion * finPct / 100);
  const contratados = Math.max(1, Math.round(finalistas * randF(r, 0.08, 0.18)));
  const ratioFinal  = Math.round(aplicados / Math.max(contratados, 1));
  const tasaFinal   = ((contratados / aplicados) * 100).toFixed(2);

  const funnelStages: FunnelStage[] = [
    { label: 'APLICADOS',        value: aplicados,   pct: 100,                                                    convLabel: '100% · inicio del funnel',              dropoff: null },
    { label: 'SCORING',          value: scoring,     pct: scoringPct,                                             convLabel: `${scoringPct}% conversión`,              dropoff: `${dropoffN} por no negociables` },
    { label: 'PRE-SCREENING',    value: prescreen,   pct: Math.round(prescreen / aplicados * 100),                convLabel: `${Math.round(prescreen/scoring*100)}% conversión`,    dropoff: null },
    { label: 'VAL. RUNT', value: entrevistas, pct: Math.round(entrevistas / aplicados * 100),             convLabel: `${Math.round(entrevistas/prescreen*100)}% conversión`, dropoff: null },
    { label: 'VAL. DOCUMENTAL',  value: evaluacion,  pct: Math.round(evaluacion / aplicados * 100),              convLabel: `${Math.round(evaluacion/entrevistas*100)}% conversión`, dropoff: null },
    { label: 'SHORTLIST',        value: finalistas,  pct: parseFloat((finalistas / aplicados * 100).toFixed(1)), convLabel: `${(finalistas/aplicados*100).toFixed(1)}% conversión`, dropoff: null },
    { label: 'CONTRATADOS',      value: contratados, pct: parseFloat((contratados / aplicados * 100).toFixed(2)), convLabel: `${tasaFinal}% · ratio ${ratioFinal}:1`, dropoff: null },
  ];

  // ── Dropoff
  const total3 = dropoffN;
  const p1 = rand(r, 40, 58); const c1 = Math.round(total3 * p1 / 100);
  const p2 = rand(r, 25, 38); const c2 = Math.round(total3 * p2 / 100);
  const c3 = total3 - c1 - c2;
  const p3 = 100 - p1 - p2;

  const dropoffTable: DropoffRow[] = [
    { reason: 'Licencia C2 vencida o sin categoría requerida', count: c1, pct: `${p1}%` },
    { reason: 'Comparendos activos o suspensiones RUNT',       count: c2, pct: `${p2}%` },
    { reason: 'Expectativa salarial fuera de rango',           count: Math.max(c3, 0), pct: `${Math.max(p3, 0)}%` },
  ];

  // ── Time phases
  const phaseDays = [
    rand(r, 1, 3),
    rand(r, 3, 8),
    rand(r, 5, 12),
    rand(r, 4, 10),
    rand(r, 3, 8),
  ];
  const bottleneckIdx = phaseDays.indexOf(Math.max(...phaseDays));
  const timePhases: TimePhase[] = [
    { label: 'Scoring',           days: phaseDays[0], bottleneck: bottleneckIdx === 0 },
    { label: 'Pre-screening',     days: phaseDays[1], bottleneck: bottleneckIdx === 1 },
    { label: 'Val. RUNT',  days: phaseDays[2], bottleneck: bottleneckIdx === 2 },
    { label: 'Val. Documental',   days: phaseDays[3], bottleneck: bottleneckIdx === 3 },
    { label: 'Shortlist',         days: phaseDays[4], bottleneck: bottleneckIdx === 4 },
  ];

  // ── HR Response
  const hrDays = [randF(r, 0.8, 2.2), randF(r, 1.5, 5.0), randF(r, 1.2, 3.5), randF(r, 0.8, 2.5)];
  const hrMax = Math.max(...hrDays);
  const hrResponse: HrResponseRow[] = [
    { from: 'Scoring → Pre-screening',       days: hrDays[0], warning: hrDays[0] === hrMax },
    { from: 'Pre-screening → Val. RUNT',     days: hrDays[1], warning: hrDays[1] === hrMax },
    { from: 'Val. RUNT → Val. Documental',   days: hrDays[2], warning: hrDays[2] === hrMax },
    { from: 'Val. Documental → Shortlist',   days: hrDays[3], warning: hrDays[3] === hrMax },
  ];

  // ── Aging crítico
  const VACANTES_AGING = [
    { vacante: 'Conductor C2 Transporte Público',  area: 'Operaciones' },
    { vacante: 'Conductor C2 Carga Refrigerada',   area: 'Logística' },
    { vacante: 'Conductor/a Bus Zonal – Bogotá', area: 'Logística' },
    { vacante: 'Conductor C2 Líquidos a Granel',   area: 'Operaciones' },
    { vacante: 'Conductor C2 Carga Seca',          area: 'Logística' },
    { vacante: 'Conductor C2 Materiales Peligrosos', area: 'Operaciones' },
  ];
  const agingCount = rand(r, 2, 4);
  const shuffled = [...VACANTES_AGING].sort(() => r() - 0.5).slice(0, agingCount);
  const agingCritico: AgingRow[] = shuffled.map((v) => ({
    ...v,
    days: rand(r, 31, 58),
  })).sort((a, b) => b.days - a.days);

  // ── HM Table
  const HM_NAMES = [
    { name: 'Carlos Vargas',    area: 'Operaciones' },
    { name: 'Paola Moreno',     area: 'Gestión Humana' },
    { name: 'Andrés Castillo',  area: 'Logística' },
    { name: 'Diana Rojas',      area: 'Operaciones' },
    { name: 'Mauricio Peña',    area: 'Transporte Público' },
    { name: 'Sandra Gómez',     area: 'Distribución' },
  ];
  const hmCount = rand(r, 3, 5);
  const hmTable: HmRow[] = HM_NAMES.slice(0, hmCount).map((hm) => {
    const vac = rand(r, 1, 5);
    const cont = rand(r, 1, vac);
    const ent = rand(r, cont * 5, cont * 22);
    const ratioN = Math.round(ent / Math.max(cont, 1));
    const ok = ratioN <= 10;
    const ttfV = rand(r, 18, 50);
    return {
      name: hm.name,
      area: hm.area,
      vacantes: vac,
      entrevistas: ent,
      contratados: cont,
      ratio: `${ratioN}:1`,
      ratioOk: ok,
      ttf: `${ttfV} días`,
    };
  });

  // ── Detail Table
  const VACANTE_POOL = [
    { vacante: 'Conductor C2 Transporte Público',    area: 'Operaciones',       tipo: 'Operativa' },
    { vacante: 'Conductor C2 Carga Refrigerada',     area: 'Logística',         tipo: 'Operativa' },
    { vacante: 'Conductor/a Bus Zonal – Bogotá',   area: 'Logística',         tipo: 'Operativa' },
    { vacante: 'Conductor C2 Líquidos a Granel',     area: 'Operaciones',       tipo: 'Operativa' },
    { vacante: 'Conductor C2 Carga Seca',            area: 'Logística',         tipo: 'Operativa' },
    { vacante: 'Conductor C2 Materiales Peligrosos', area: 'Operaciones',       tipo: 'Operativa' },
    { vacante: 'Supervisor de Flota',                area: 'Operaciones',       tipo: 'Administrativa' },
    { vacante: 'Coord. de Seguridad Vial',           area: 'HSEQ',              tipo: 'Administrativa' },
    { vacante: 'Despachador de Rutas',               area: 'Operaciones',       tipo: 'Operativa' },
    { vacante: 'Coord. Transporte Masivo',           area: 'Transporte Público', tipo: 'Estratégica' },
  ];
  const ESTADOS = ['COMPLETADA', 'COMPLETADA', 'ABIERTA', 'ABIERTA', 'PAUSADA', 'DESIERTA'];
  const rowCount = rand(r, 5, 8);
  const detailRows = [...VACANTE_POOL].sort(() => r() - 0.5).slice(0, rowCount);

  const detailTable: DetailRow[] = detailRows.map((v) => {
    const est = pick(r, ESTADOS);
    const apps = rand(r, 90, 780);
    const cont2 = est === 'COMPLETADA' ? rand(r, 1, 3) : 0;
    const ratioStr = cont2 > 0 ? `${Math.round(apps / cont2)}:1` : '—';
    const ttfV = rand(r, 18, 65);
    const agingV = ttfV > 38;
    const ahorroV = cont2 > 0 ? `${rand(r, 360, 580)}h` : '—';
    return {
      ...v,
      estado: est,
      aplicados: apps,
      contratados: cont2,
      ratio: ratioStr,
      ttf: `${ttfV} días`,
      aging: agingV,
      ahorro: ahorroV,
    };
  });

  return {
    vacancyStats,
    kpiCards,
    funnelStages,
    dropoffTable,
    timePhases,
    hrResponse,
    agingCritico,
    hmTable,
    detailTable,
  };
}
