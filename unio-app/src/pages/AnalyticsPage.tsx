import { useState } from 'react';
import { Download, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import MainSidebar from '../components/layout/MainSidebar';
import DateRangePicker, { type DateRange } from '../components/ui/DateRangePicker';

// ─── Mock data ────────────────────────────────────────────────────────────────

const VACANCY_STATS = [
  {
    key: 'Abierta',
    label: 'Abiertas',
    value: 8,
    sub: 'En proceso actualmente',
    accentColor: 'var(--color-brand-accent)',
    selectedBg: 'var(--color-secondary-50)',
  },
  {
    key: 'Completada',
    label: 'Completadas',
    value: 24,
    sub: 'Cerradas con contratado',
    accentColor: 'var(--color-positive-500)',
    selectedBg: '#edfaf3',
  },
  {
    key: 'Pausada',
    label: 'Pausadas',
    value: 3,
    sub: 'En espera de decisión',
    accentColor: 'var(--color-warning-500)',
    selectedBg: '#fffbeb',
  },
  {
    key: 'Desierta',
    label: 'Desiertas',
    value: 2,
    sub: 'Sin candidato contratado',
    accentColor: 'var(--color-neutral-400)',
    selectedBg: 'var(--color-surface-subtle)',
  },
];

const KPI_CARDS = [
  {
    key: 'ahorro_h',
    label: 'AHORRO DE HORAS',
    value: '480h',
    sub: 'promedio por vacante',
    detail: '↑ +15% vs mes anterior',
    detailColor: 'var(--color-positive-600)',
  },
  {
    key: 'ahorro_v',
    label: 'VALOR DEL AHORRO',
    value: '$24M',
    sub: 'COP por vacante',
    detail: 'Costo hora: $50,000',
    detailColor: 'var(--color-text-muted)',
  },
  {
    key: 'ttf',
    label: 'TIME-TO-FILL',
    value: '28 días',
    sub: 'promedio',
    detail: 'vs 45 días manual (-38%)',
    detailColor: 'var(--color-positive-600)',
  },
  {
    key: 'ratio',
    label: 'RATIO DE CONVERSIÓN',
    value: '350:1',
    sub: 'CVs por contratado',
    detail: 'Tasa: 0.29%',
    detailColor: 'var(--color-text-muted)',
  },
];

const FUNNEL_STAGES = [
  { label: 'APLICADOS', value: 2450, pct: 100, convLabel: '100% · inicio del funnel', dropoff: null },
  { label: 'SCORING', value: 2083, pct: 85, convLabel: '85% conversión', dropoff: '367 por no negociables' },
  { label: 'PRE-SCREENING', value: 1176, pct: 56, convLabel: '48% conversión', dropoff: null },
  { label: 'ENTREVISTAS', value: 490, pct: 20, convLabel: '20% conversión', dropoff: null },
  { label: 'EVALUACIÓN', value: 196, pct: 8, convLabel: '8% conversión', dropoff: null },
  { label: 'FINALISTAS', value: 59, pct: 2.4, convLabel: '2.4% conversión', dropoff: null },
  { label: 'CONTRATADOS', value: 7, pct: 0.29, convLabel: '0.29% · ratio 350:1', dropoff: null },
];

const DROPOFF_TABLE = [
  { reason: 'Años mínimos de experiencia', count: 180, pct: '49%' },
  { reason: 'Dominio de herramientas (SAP, Excel)', count: 120, pct: '33%' },
  { reason: 'Ubicación geográfica', count: 67, pct: '18%' },
];

const CHANNEL_TABS = [
  { id: 'general', label: 'GENERAL' },
  { id: 'redes', label: 'REDES SOCIALES' },
  { id: 'portales', label: 'PORTALES' },
  { id: 'web', label: 'PÁGINA WEB' },
  { id: 'fisico', label: 'FÍSICO (QR)' },
];

const TIME_PHASES = [
  { label: 'Scoring', days: 2, bottleneck: false },
  { label: 'Pre-screening', days: 5, bottleneck: true },
  { label: 'Entrevistas', days: 8, bottleneck: false },
  { label: 'Evaluaciones', days: 7, bottleneck: false },
  { label: 'Finalistas', days: 6, bottleneck: false },
];

const HR_RESPONSE = [
  { from: 'Scoring → Pre-screening', days: 1.2, warning: false },
  { from: 'Pre-screening → Entrevistas', days: 3.8, warning: true },
  { from: 'Entrevistas → Evaluaciones', days: 2.1, warning: false },
  { from: 'Evaluaciones → Finalistas', days: 1.5, warning: false },
];

const AGING_CRITICO = [
  { vacante: 'Analista Financiero Sr.', area: 'Finanzas', days: 42 },
  { vacante: 'Coord. de Compras', area: 'Compras', days: 35 },
  { vacante: 'Supervisor Almacén', area: 'Logística', days: 28 },
];

const HM_TABLE = [
  { name: 'María García', area: 'Operaciones', vacantes: 4, entrevistas: 28, contratados: 4, ratio: '7:1', ratioOk: true, ttf: '26 días' },
  { name: 'Carlos Ruiz', area: 'Ventas', vacantes: 3, entrevistas: 45, contratados: 3, ratio: '15:1', ratioOk: false, ttf: '38 días' },
  { name: 'Andrea López', area: 'Finanzas', vacantes: 2, entrevistas: 18, contratados: 1, ratio: '18:1', ratioOk: false, ttf: '44 días' },
  { name: 'Juan Morales', area: 'Logística', vacantes: 3, entrevistas: 24, contratados: 3, ratio: '8:1', ratioOk: true, ttf: '24 días' },
];

const DETAIL_TABLE = [
  { vacante: 'Coordinador de Logística', area: 'Operaciones', tipo: 'Operativa', estado: 'COMPLETADA', aplicados: 520, contratados: 1, ratio: '520:1', ttf: '32 días', aging: false, ahorro: '450h' },
  { vacante: 'Analista Financiero Sr.', area: 'Finanzas', tipo: 'Administrativa', estado: 'ABIERTA', aplicados: 380, contratados: 0, ratio: '—', ttf: '42 días', aging: true, ahorro: '—' },
  { vacante: 'Ejecutivo de Ventas', area: 'Ventas', tipo: 'Operativa', estado: 'COMPLETADA', aplicados: 650, contratados: 2, ratio: '325:1', ttf: '28 días', aging: false, ahorro: '480h' },
  { vacante: 'Supervisor de Almacén', area: 'Logística', tipo: 'Operativa', estado: 'ABIERTA', aplicados: 420, contratados: 0, ratio: '—', ttf: '35 días', aging: true, ahorro: '—' },
  { vacante: 'Gerente Comercial', area: 'Ventas', tipo: 'Estratégica', estado: 'DESIERTA', aplicados: 180, contratados: 0, ratio: '—', ttf: '60 días', aging: false, ahorro: '—' },
  { vacante: 'Coord. de Compras', area: 'Compras', tipo: 'Administrativa', estado: 'PAUSADA', aplicados: 280, contratados: 0, ratio: '—', ttf: '35 días', aging: false, ahorro: '—' },
];

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  COMPLETADA: { bg: '#E6FAEE', color: '#17723F', border: '#A2ECC2' },
  ABIERTA: { bg: '#F2ECFE', color: '#5C11F3', border: '#D0BBFC' },
  DESIERTA: { bg: '#FBEAEA', color: '#A82424', border: '#EDABAB' },
  PAUSADA: { bg: '#FFF8E5', color: '#A37800', border: '#FFE59E' },
};

function StatusTag({
  label,
  variant,
}: {
  label: string;
  variant: keyof typeof STATUS_STYLE;
}) {
  const s = STATUS_STYLE[variant];
  return (
    <span
      style={{
        display: 'inline-block',
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: '4px',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '12px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: 'var(--color-text-primary)',
        marginBottom: '16px',
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Shared filter styles ─────────────────────────────────────────────────────

const filterLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.8px',
  color: 'var(--color-text-muted)',
  marginBottom: '5px',
  textTransform: 'uppercase',
};

const chevronSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2368686a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

const selectStyle: React.CSSProperties = {
  height: '38px',
  padding: '0 32px 0 10px',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-display)',
  fontSize: '13px',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: chevronSvg,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  minWidth: '160px',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeChannel, setActiveChannel] = useState('general');
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [estadoFilter, setEstadoFilter] = useState<string>('Todas');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [tipoFilter, setTipoFilter] = useState<string>('todos');

  const sectionGap: React.CSSProperties = { marginBottom: '24px' };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', fontFamily: 'var(--font-display)' }}>
      <MainSidebar />

      <div style={{ marginLeft: '205px', minHeight: '100vh' }}>

        {/* ── STICKY HEADER with filters ── */}
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid var(--color-border-default)',
            padding: '0 40px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Top row: title */}
          <div
            style={{
              height: '52px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '15px',
                color: 'var(--color-text-primary)',
                letterSpacing: '0.3px',
              }}
            >
              Analytics &amp; Reportes
            </span>
          </div>

          {/* Filter row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '12px',
              paddingBottom: '12px',
              flexWrap: 'wrap',
            }}
          >
            {/* Período */}
            <div>
              <div style={filterLabelStyle}>PERÍODO</div>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>

            {/* Tipo de vacante — unified with Área, grouped by optgroup */}
            <div>
              <div style={filterLabelStyle}>TIPO DE VACANTE</div>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                style={{
                  ...selectStyle,
                  border: tipoFilter !== 'todos'
                    ? '1px solid var(--color-brand-accent)'
                    : '1px solid var(--color-border-default)',
                  background: tipoFilter !== 'todos' ? 'var(--color-secondary-50)' : '#ffffff',
                  color: tipoFilter !== 'todos'
                    ? 'var(--color-brand-accent)'
                    : 'var(--color-text-primary)',
                  minWidth: '210px',
                }}
              >
                <option value="todos">Todos los tipos</option>
                <optgroup label="Operativa">
                  <option value="operativa">Operativa (todas)</option>
                  <option value="operaciones">Operaciones</option>
                  <option value="logistica">Logística</option>
                </optgroup>
                <optgroup label="Administrativa">
                  <option value="administrativa">Administrativa (todas)</option>
                  <option value="finanzas">Finanzas</option>
                  <option value="ventas">Ventas</option>
                  <option value="compras">Compras</option>
                </optgroup>
                <optgroup label="Estratégica">
                  <option value="estrategica">Estratégica (todas)</option>
                  <option value="transformacion">Transformación Digital</option>
                  <option value="expansion">Expansión Comercial</option>
                  <option value="liderazgo">Liderazgo Organizacional</option>
                </optgroup>
              </select>
            </div>

            {/* Estado vacante — controlled, synced with cards */}
            <div>
              <div style={filterLabelStyle}>ESTADO VACANTE</div>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                style={{
                  ...selectStyle,
                  border: estadoFilter !== 'Todas'
                    ? '1px solid var(--color-brand-accent)'
                    : '1px solid var(--color-border-default)',
                  background: estadoFilter !== 'Todas' ? 'var(--color-secondary-50)' : '#ffffff',
                  color: estadoFilter !== 'Todas'
                    ? 'var(--color-brand-accent)'
                    : 'var(--color-text-primary)',
                }}
              >
                {['Todas', 'Abierta', 'Completada', 'Pausada', 'Desierta'].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 40px', maxWidth: '1400px' }}>

          {/* Exportar informe — not sticky */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                background: 'transparent',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
              }}
            >
              <Download size={13} />
              Exportar informe
            </button>
          </div>

          {/* ── ESTADO DE VACANTES ── */}
          <Card style={sectionGap}>
            <SectionTitle>Estado de Vacantes</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {VACANCY_STATS.map((s) => {
                const isSelected = estadoFilter === s.key;
                const isHovered = hoveredCard === s.key;
                return (
                  <div
                    key={s.key}
                    onClick={() => setEstadoFilter(isSelected ? 'Todas' : s.key)}
                    onMouseEnter={() => setHoveredCard(s.key)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: isSelected
                        ? s.selectedBg
                        : isHovered
                        ? 'var(--color-surface-subtle)'
                        : '#ffffff',
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px 18px',
                      borderTop: isSelected
                        ? `1.5px solid ${s.accentColor}`
                        : '1px solid var(--color-border-default)',
                      borderRight: isSelected
                        ? `1.5px solid ${s.accentColor}`
                        : '1px solid var(--color-border-default)',
                      borderBottom: isSelected
                        ? `1.5px solid ${s.accentColor}`
                        : '1px solid var(--color-border-default)',
                      borderLeft: `4px solid ${s.accentColor}`,
                      cursor: 'pointer',
                      transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                      userSelect: 'none',
                      boxShadow: isSelected ? `0 0 0 3px ${s.accentColor}22` : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '28px',
                        color: isSelected ? s.accentColor : 'var(--color-brand-primary)',
                        lineHeight: 1,
                        marginBottom: '5px',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: isSelected ? s.accentColor : 'var(--color-text-muted)',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {s.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-placeholder)', marginTop: '2px' }}>
                      {s.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── MÉTRICAS CLAVE ── */}
          <Card style={sectionGap}>
            <SectionTitle>Métricas Clave</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {KPI_CARDS.map((k) => (
                <div
                  key={k.key}
                  style={{
                    borderLeft: '3px solid var(--color-brand-accent)',
                    paddingLeft: '14px',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {k.label}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-brand-primary)', lineHeight: 1, marginBottom: '4px' }}>
                    {k.value}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{k.sub}</div>
                  <div style={{ fontSize: '11px', color: k.detailColor, fontWeight: 500 }}>{k.detail}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── FUNNEL DE CANDIDATOS ── */}
          <Card style={sectionGap}>
            <SectionTitle>Funnel de Candidatos</SectionTitle>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px', marginTop: '-10px' }}>
              Haz click en un canal para filtrar el funnel
            </div>

            {/* Channel tabs — pill navigation */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--color-surface-subtle)',
                borderRadius: '9999px',
                padding: '4px',
                gap: '2px',
                marginBottom: '24px',
              }}
            >
              {CHANNEL_TABS.map(({ id, label }) => {
                const isActive = activeChannel === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveChannel(id)}
                    style={{
                      padding: '7px 18px',
                      background: isActive ? '#ffffff' : 'transparent',
                      border: 'none',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-muted)',
                      boxShadow: isActive
                        ? '0 1px 4px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)'
                        : 'none',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Funnel bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {FUNNEL_STAGES.map((stage) => {
                const barWidth = `${Math.max(stage.pct, 0.5)}%`;
                return (
                  <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                    {/* Stage label — plain text, no background */}
                    <div
                      style={{
                        width: '130px',
                        flexShrink: 0,
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        color: 'var(--color-text-primary)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {stage.label}
                    </div>

                    {/* Bar track — pill shaped */}
                    <div
                      style={{
                        flex: 1,
                        height: '28px',
                        background: 'var(--color-neutral-100)',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: barWidth,
                          background: 'var(--color-brand-accent)',
                          borderRadius: '9999px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>

                    {/* Value + dropoff — no background on labels */}
                    <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {stage.value.toLocaleString('es-CO')}
                        </span>
                        {stage.dropoff && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: 'var(--color-negative-600)',
                            }}
                          >
                            {stage.dropoff}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {stage.convLabel}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Dropoff table */}
            <div
              style={{
                marginTop: '24px',
                border: '1px solid var(--color-warning-300)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'var(--color-warning-50)',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-warning-300)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-warning-600)',
                }}
              >
                <AlertTriangle size={14} />
                DROP-OFF POR NO NEGOCIABLES (367 candidatos descartados en Scoring)
              </div>
              <div>
                {/* Header */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 120px',
                    padding: '8px 16px',
                    background: 'var(--color-surface-subtle)',
                    borderBottom: '1px solid var(--color-border-default)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  <span>No Negociable</span>
                  <span>Descartados</span>
                  <span>% del Total</span>
                </div>
                {DROPOFF_TABLE.map((row) => (
                  <div
                    key={row.reason}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 120px 120px',
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--color-border-default)',
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <span>{row.reason}</span>
                    <span style={{ fontWeight: 600 }}>{row.count}</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-negative-600)' }}>{row.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* ── EFICIENCIA DE TIEMPO ── */}
          <Card style={sectionGap}>
            <SectionTitle>Eficiencia de Tiempo</SectionTitle>

            {/* Phase cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {TIME_PHASES.map((p) => (
                <div
                  key={p.label}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                    {p.days}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {p.bottleneck ? (
                      <StatusTag label="CUELLO DE BOTELLA" variant="PAUSADA" />
                    ) : (
                      'días promedio'
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Two-column section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* HR response time */}
              <div
                style={{
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--color-surface-subtle)',
                    borderBottom: '1px solid var(--color-border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  <Clock size={13} />
                  Tiempo de respuesta HR (promedio por fase)
                </div>
                {HR_RESPONSE.map((row) => (
                  <div
                    key={row.from}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--color-border-default)',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: 'var(--color-text-primary)' }}>{row.from}</span>
                    <StatusTag
                      label={`${row.days} días${row.warning ? ' ⚠' : ''}`}
                      variant={row.warning ? 'PAUSADA' : 'COMPLETADA'}
                    />
                  </div>
                ))}
              </div>

              {/* Aging crítico */}
              <div
                style={{
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--color-surface-subtle)',
                    borderBottom: '1px solid var(--color-border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    color: 'var(--color-warning-600)',
                    textTransform: 'uppercase',
                  }}
                >
                  <AlertTriangle size={13} />
                  Vacantes con aging crítico (+30 días sin avanzar)
                </div>
                {AGING_CRITICO.map((row) => (
                  <div
                    key={row.vacante}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--color-border-default)',
                      fontSize: '13px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.vacante}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.area}</div>
                    </div>
                    <StatusTag label={`${row.days} días`} variant="DESIERTA" />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* ── KPI HIRING MANAGER ── */}
          <Card style={sectionGap}>
            <SectionTitle>KPI Hiring Manager</SectionTitle>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px', marginTop: '-10px' }}>
              Entrevistas realizadas por contratado — eficiencia del proceso de entrevistas
            </div>

            {/* Table */}
            <div style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {/* Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 80px 160px 110px 150px 130px',
                  padding: '8px 16px',
                  background: 'var(--color-surface-subtle)',
                  borderBottom: '1px solid var(--color-border-default)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                <span>Hiring Manager</span>
                <span>Área</span>
                <span>Vacantes</span>
                <span>Entrevistas realizadas</span>
                <span>Contratados</span>
                <span>Entrevistas/contratado</span>
                <span>Time-to-fill prom.</span>
              </div>
              {HM_TABLE.map((row) => (
                <div
                  key={row.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr 80px 160px 110px 150px 130px',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-border-default)',
                    fontSize: '13px',
                    color: 'var(--color-text-primary)',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{row.name}</span>
                  <span>{row.area}</span>
                  <span>{row.vacantes}</span>
                  <span>{row.entrevistas}</span>
                  <span>{row.contratados}</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: row.ratioOk ? 'var(--color-positive-600)' : 'var(--color-warning-600)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {row.ratio}
                    {row.ratioOk
                      ? <CheckCircle2 size={13} />
                      : <AlertTriangle size={13} />
                    }
                  </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{row.ttf}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* ── DETALLE POR VACANTE ── */}
          <Card style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <SectionTitle>Detalle por Vacante</SectionTitle>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                <Download size={12} />
                Exportar CSV
              </button>
            </div>

            <div style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {/* Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.8fr 1fr 1fr 110px 80px 100px 80px 100px 90px',
                  padding: '8px 16px',
                  background: 'var(--color-surface-subtle)',
                  borderBottom: '1px solid var(--color-border-default)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                <span>Vacante</span>
                <span>Área</span>
                <span>Tipo</span>
                <span>Estado</span>
                <span>Aplicados</span>
                <span>Contratados</span>
                <span>Ratio</span>
                <span>Time-to-Fill</span>
                <span>Ahorro (h)</span>
              </div>
              {DETAIL_TABLE.map((row) => {
                const s = STATUS_STYLE[row.estado] ?? { bg: '#f7f7f8', color: '#68686a', border: '#c0c0c1' };
                return (
                  <div
                    key={row.vacante}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.8fr 1fr 1fr 110px 80px 100px 80px 100px 90px',
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--color-border-default)',
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{row.vacante}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{row.area}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{row.tipo}</span>
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          background: s.bg,
                          color: s.color,
                          border: `1px solid ${s.border}`,
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.3px',
                        }}
                      >
                        {row.estado}
                      </span>
                    </span>
                    <span>{row.aplicados.toLocaleString('es-CO')}</span>
                    <span>{row.contratados || '—'}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{row.ratio}</span>
                    <span style={{ color: row.aging ? 'var(--color-warning-600)' : 'var(--color-text-muted)' }}>
                      {row.ttf} {row.aging ? '⚠' : ''}
                    </span>
                    <span style={{ fontWeight: row.ahorro !== '—' ? 600 : 400, color: row.ahorro !== '—' ? 'var(--color-positive-600)' : 'var(--color-text-muted)' }}>
                      {row.ahorro}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>{/* /content padding */}
      </div>{/* /main offset */}
    </div>
  );
}
