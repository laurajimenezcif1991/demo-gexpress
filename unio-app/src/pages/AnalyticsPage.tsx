import { useState } from 'react';
import { Download, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import MainSidebar from '../components/layout/MainSidebar';

// ─── Mock data ────────────────────────────────────────────────────────────────

const VACANCY_STATS = [
  {
    key: 'abiertas',
    label: 'ABIERTAS',
    value: 8,
    sub: 'En proceso actualmente',
    accent: 'var(--color-brand-primary)',
    bg: '#18142E',
    fg: '#ffffff',
    dark: true,
  },
  {
    key: 'completadas',
    label: 'COMPLETADAS',
    value: 24,
    sub: 'Cerradas con contratado',
    accent: 'var(--color-positive-500)',
    bg: '#ffffff',
    fg: 'var(--color-text-primary)',
    dark: false,
  },
  {
    key: 'pausadas',
    label: 'PAUSADAS',
    value: 3,
    sub: 'En espera de decisión',
    accent: 'var(--color-warning-500)',
    bg: '#ffffff',
    fg: 'var(--color-text-primary)',
    dark: false,
  },
  {
    key: 'desiertas',
    label: 'DESIERTAS',
    value: 2,
    sub: 'Sin candidato contratado',
    accent: 'var(--color-neutral-400)',
    bg: '#ffffff',
    fg: 'var(--color-text-primary)',
    dark: false,
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'funnel' | 'predictiva'>('funnel');
  const [activeChannel, setActiveChannel] = useState('general');

  const sectionGap: React.CSSProperties = { marginBottom: '24px' };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', fontFamily: 'var(--font-display)' }}>
      <MainSidebar />

      <div style={{ marginLeft: '205px', minHeight: '100vh' }}>

        {/* Page header */}
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid var(--color-border-default)',
            padding: '0 40px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
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

        {/* Tab bar */}
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid var(--color-border-default)',
            padding: '0 40px',
            display: 'flex',
            gap: '0',
          }}
        >
          {[
            { id: 'funnel', label: 'Funnel & Eficiencia' },
            { id: 'predictiva', label: 'Analítica Predictiva' },
          ].map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'funnel' | 'predictiva')}
                style={{
                  padding: '12px 20px',
                  background: isActive ? 'var(--color-brand-primary)' : 'transparent',
                  border: 'none',
                  borderRight: '1px solid var(--color-border-default)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  color: isActive ? '#ffffff' : 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '28px 40px', maxWidth: '1400px' }}>

          {/* ── FILTERS ── */}
          <Card style={{ marginBottom: '24px' }}>
            <SectionTitle>Filtros</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'PERÍODO', options: ['Mes completo anterior', 'Último trimestre', 'Último semestre', 'Este año'] },
                { label: 'ÁREA', options: ['Todas las áreas', 'Operaciones', 'Finanzas', 'Ventas', 'Logística', 'Compras'] },
                { label: 'TIPO DE VACANTE', options: ['Todos los tipos', 'Operativa', 'Administrativa', 'Estratégica'] },
                { label: 'ESTADO VACANTE', options: ['Todas', 'Abierta', 'Completada', 'Pausada', 'Desierta'] },
              ].map(({ label, options }) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {label}
                  </div>
                  <select
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 32px 0 10px',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      fontFamily: 'var(--font-display)',
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2368686a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 10px center',
                    }}
                  >
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </Card>

          {/* ── ESTADO DE VACANTES ── */}
          <Card style={sectionGap}>
            <SectionTitle>Estado de Vacantes</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {VACANCY_STATS.map((s) => (
                <div
                  key={s.key}
                  style={{
                    background: s.dark ? s.bg : '#ffffff',
                    border: `1px solid ${s.dark ? s.bg : 'var(--color-border-default)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                  }}
                >
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: s.dark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: s.dark ? '#ffffff' : s.accent, lineHeight: 1, marginBottom: '4px' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '12px', color: s.dark ? 'rgba(255,255,255,0.55)' : 'var(--color-text-muted)' }}>
                    {s.sub}
                  </div>
                </div>
              ))}
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

            {/* Channel tabs */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '1px solid var(--color-border-default)' }}>
              {CHANNEL_TABS.map(({ id, label }) => {
                const isActive = activeChannel === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveChannel(id)}
                    style={{
                      padding: '8px 16px',
                      background: isActive ? 'var(--color-brand-primary)' : 'transparent',
                      border: 'none',
                      borderRight: '1px solid var(--color-border-default)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      color: isActive ? '#ffffff' : 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Funnel bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {FUNNEL_STAGES.map((stage, i) => {
                const isFirst = i === 0;
                const barWidth = `${Math.max(stage.pct, 0.5)}%`;
                return (
                  <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Bar label */}
                    <div
                      style={{
                        width: '130px',
                        flexShrink: 0,
                        background: isFirst || i === FUNNEL_STAGES.length - 1 ? 'var(--color-brand-primary)' : 'var(--color-brand-primary)',
                        padding: '10px 14px',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                      }}
                    >
                      {stage.label}
                    </div>

                    {/* Bar track */}
                    <div style={{ flex: 1, position: 'relative', height: '36px', background: '#f0f0f0' }}>
                      <div
                        style={{
                          height: '100%',
                          width: barWidth,
                          background: 'var(--color-brand-primary)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>

                    {/* Value + dropoff */}
                    <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {stage.value.toLocaleString('es-CO')}
                        </span>
                        {stage.dropoff && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: 'var(--color-negative-600)',
                              background: 'var(--color-danger-bg)',
                              border: '1px solid var(--color-negative-300)',
                              borderRadius: '4px',
                              padding: '2px 7px',
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
                    background: p.bottleneck ? 'var(--color-brand-primary)' : '#ffffff',
                    border: `1px solid ${p.bottleneck ? 'var(--color-brand-primary)' : 'var(--color-border-default)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: p.bottleneck ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', marginBottom: '6px' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: p.bottleneck ? '#ffffff' : 'var(--color-text-primary)', lineHeight: 1 }}>
                    {p.days}
                  </div>
                  <div style={{ fontSize: '11px', color: p.bottleneck ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', marginTop: '4px' }}>
                    {p.bottleneck ? 'días · CUELLO DE BOTELLA' : 'días promedio'}
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
                    <span
                      style={{
                        background: row.warning ? 'var(--color-warning-50)' : 'var(--color-surface-subtle)',
                        border: `1px solid ${row.warning ? 'var(--color-warning-300)' : 'var(--color-border-default)'}`,
                        color: row.warning ? 'var(--color-warning-600)' : 'var(--color-text-muted)',
                        borderRadius: '4px',
                        padding: '2px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {row.days} días {row.warning && '⚠'}
                    </span>
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
                    <span
                      style={{
                        background: 'var(--color-brand-primary)',
                        color: '#ffffff',
                        borderRadius: '4px',
                        padding: '3px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {row.days} días
                    </span>
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
