import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ChevronLeft, ArrowRight, HelpCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import StepBreadcrumb from '../components/ui/StepBreadcrumb';
import WizardBar from '../components/layout/WizardBar';

// ─── Mock helpers keyed by cargo keyword ─────────────────────────────────────

interface JDExtracted { seniority: string; skills: string; modalidad: string }

function getJDExtracted(cargo: string): JDExtracted {
  const c = cargo.toLowerCase();
  if (c.includes('big data') || c.includes('analítica') || c.includes('datos')) {
    return { seniority: 'Senior / Liderazgo', skills: 'Python, Power BI, Databricks, SQL', modalidad: 'Presencial' };
  }
  if (c.includes('talento') || c.includes('rrhh')) {
    return { seniority: 'Semi-senior', skills: 'Nómina (Siigo), gestión de clima, selección', modalidad: 'Presencial — sede Buga' };
  }
  if (c.includes('odonto')) {
    return { seniority: 'Especialista', skills: 'Odontopediatría, RETHUS vigente, adaptación conductual', modalidad: 'Presencial — medio tiempo' };
  }
  if (c.includes('bdm') || c.includes('business') || c.includes('comercial')) {
    return { seniority: 'Semi-senior / Senior', skills: 'CRM, venta consultiva B2B, prospección', modalidad: 'Presencial con visitas a clientes' };
  }
  return { seniority: 'Mid-level', skills: 'Herramientas del cargo, Office 365', modalidad: 'Presencial' };
}

function getFiltrosDuros(cargo: string): { label: string; checked: boolean }[] {
  const c = cargo.toLowerCase();
  if (c.includes('big data') || c.includes('analítica') || c.includes('datos')) {
    return [
      { label: 'Posgrado en Analítica, Estadística o Ciencias de Datos', checked: true },
      { label: 'Experiencia ≥5 años en proyectos de datos', checked: true },
      { label: 'Python y herramientas cloud en producción', checked: false },
      { label: 'Presentación de resultados a gerencia / junta', checked: false },
    ];
  }
  if (c.includes('talento') || c.includes('rrhh')) {
    return [
      { label: 'Mínimo 2 años en ciclo completo de RRHH', checked: true },
      { label: 'Manejo de nómina con software (Siigo o equivalente)', checked: true },
      { label: 'Disponibilidad presencial en Buga', checked: false },
      { label: 'Conocimiento de reforma laboral 2024', checked: false },
    ];
  }
  if (c.includes('odonto')) {
    return [
      { label: 'Especialización en Odontopediatría', checked: true },
      { label: 'RETHUS vigente y habilitación SDS', checked: true },
      { label: 'Certificación en adaptación conductual pediátrica', checked: false },
      { label: 'Disponibilidad exclusiva para medio tiempo', checked: false },
    ];
  }
  if (c.includes('bdm') || c.includes('business') || c.includes('comercial')) {
    return [
      { label: 'Historial documentado de cierre B2B', checked: true },
      { label: 'Manejo de CRM (HubSpot / Salesforce)', checked: true },
      { label: 'Red de contactos empresariales en el Valle del Cauca', checked: false },
      { label: 'Conocimiento del portafolio de cajas de compensación', checked: false },
    ];
  }
  return [
    { label: 'Experiencia mínima requerida en el cargo', checked: true },
    { label: 'Skills técnicos obligatorios del rol', checked: true },
    { label: 'Certificación o título requerido', checked: false },
    { label: 'Disponibilidad para modalidad indicada', checked: false },
  ];
}

// ─── Progress calculation ─────────────────────────────────────────────────────
const TOTAL_QUESTIONS = 35;
const BASE_ANSWERED   = 20; // answered by AI from JD + no-negociables step

function calcProgress(answers: {
  q1: string; q2: string; q3: string; q4: string; q5answered: boolean;
}): { answered: number; pct: number } {
  const bonus =
    (answers.q1.trim() ? 4 : 0) +
    (answers.q2.trim() ? 4 : 0) +
    (answers.q3.trim() ? 2 : 0) +
    (answers.q4       ? 3 : 0) +
    (answers.q5answered ? 2 : 0);
  const answered = Math.min(TOTAL_QUESTIONS, BASE_ANSWERED + bonus);
  return { answered, pct: Math.round((answered / TOTAL_QUESTIONS) * 100) };
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const TEXTAREA_STYLE: React.CSSProperties = {
  width: '100%',
  minHeight: '80px',
  padding: '12px 14px',
  border: '1.5px solid var(--color-border-default)',
  borderRadius: 'var(--radius-sm)',
  background: '#ffffff',
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  outline: 'none',
  resize: 'vertical',
  lineHeight: 1.5,
};

const QLABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  marginBottom: '12px',
  fontFamily: 'var(--font-display)',
  lineHeight: 1.4,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CompletarRCP() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as {
    cargo?: string; area?: string; tipoVacante?: string; fechaIngreso?: string;
    noNegLabels?: string[];
  };
  const cargo        = state.cargo       ?? 'Nueva vacante';
  const area         = state.area        ?? '';
  const noNegLabels: string[] = state.noNegLabels ?? [];

  const jdInfo      = getJDExtracted(cargo);
  const [filtros, setFiltros] = useState(() => getFiltrosDuros(cargo));

  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [q4, setQ4] = useState<'activa' | 'borrador' | ''>('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const q5answered = filtros.some((f) => f.checked);
  const progress   = calcProgress({ q1, q2, q3, q4: !!q4, q5answered });

  const errors = submitted
    ? { q1: !q1.trim(), q2: !q2.trim(), q4: !q4, q5: !q5answered }
    : { q1: false, q2: false, q4: false, q5: false };
  const isValid = !!q1.trim() && !!q2.trim() && !!q4 && q5answered;

  const focusBorder = (field: string, hasError: boolean): React.CSSProperties => ({
    borderColor: hasError
      ? 'var(--color-negative-500)'
      : focusedField === field
      ? 'var(--color-border-focus)'
      : 'var(--color-border-default)',
    boxShadow: hasError
      ? '0 0 0 3px rgba(211,47,47,0.1)'
      : focusedField === field
      ? '0 0 0 3px rgba(135,80,246,0.12)'
      : 'none',
  });

  const handleGenerar = () => {
    setSubmitted(true);
    if (!isValid) return;
    navigate('/vacante/nueva/canales', { state: { ...state, q1, q2, q3, q4 } });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-subtle)', fontFamily: 'var(--font-display)' }}>

      {/* Navbar */}
      <header style={{
        background: '#ffffff', borderBottom: '1px solid var(--color-border-default)',
        padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/logo-comfandi.webp" alt="Comfandi"
            style={{ maxHeight: '52px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          <div style={{ width: '1px', height: '32px', background: 'var(--color-border-default)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <span>Powered by</span>
            <img src="/logo-unio.png" alt="Unio" style={{ height: '14px', width: 'auto' }} />
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>Cancelar</Button>
      </header>

      {/* Page content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* Step breadcrumb */}
        <StepBreadcrumb current={3} />

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-text-primary)', letterSpacing: '-0.3px', marginBottom: '8px' }}>
            Completa el RCP
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {cargo}{area ? ` · ${area}` : ''}
          </p>
        </div>

        {/* Main card */}
        <div style={{
          background: '#ffffff', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-default)', padding: '32px',
          boxShadow: '0 2px 16px rgba(24,20,46,0.06)',
        }}>

          {/* ── Progress bar ─────────────────────────────────── */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Progreso del RCP
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-brand-accent)' }}>
                {progress.pct}% completado
              </span>
            </div>
            <div style={{ position: 'relative', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--color-secondary-50)', overflow: 'hidden', border: '1px solid var(--color-secondary-100)' }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, height: '100%',
                width: `${progress.pct}%`, borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(90deg, var(--color-brand-accent), var(--color-brand-accent-dark))',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px', textAlign: 'center' }}>
              {progress.answered} de {TOTAL_QUESTIONS} preguntas respondidas
            </p>
          </div>

          {/* ── Info boxes ────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>

            {/* JD extraído */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--color-secondary-50)', border: '1px solid var(--color-secondary-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="#fff" strokeWidth={3} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Información extraída del JD
                </span>
              </div>
              <ul style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  `Seniority: ${jdInfo.seniority}`,
                  `Skills: ${jdInfo.skills}`,
                  `Modalidad: ${jdInfo.modalidad}`,
                ].map((item) => (
                  <li key={item} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </div>

            {/* No negociables confirmados */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="#fff" strokeWidth={3} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}>
                  No negociables confirmados
                </span>
              </div>
              <ul style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(noNegLabels.length > 0 ? noNegLabels : ['Skills técnicos obligatorios', 'Experiencia mínima requerida']).map((item) => (
                  <li key={item} style={{ fontSize: '13px', color: '#166534', lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--color-border-default)', marginBottom: '28px' }} />

          {/* Section title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <HelpCircle size={18} style={{ color: 'var(--color-brand-accent)', flexShrink: 0 }} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Completa la siguiente información:
            </span>
          </div>

          {/* ── Questions ─────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Q1 */}
            <div>
              <label style={QLABEL_STYLE}>
                1. ¿Qué señales identificarían a alguien que no está funcionando bien en este rol?{' '}
                <span style={{ color: 'var(--color-brand-accent)' }}>*</span>
              </label>
              <textarea
                value={q1}
                onChange={(e) => setQ1(e.target.value)}
                onFocus={() => setFocusedField('q1')}
                onBlur={() => setFocusedField(null)}
                placeholder="Ej: No cumple plazos, falta de comunicación con el equipo, errores frecuentes en reportes"
                style={{ ...TEXTAREA_STYLE, ...focusBorder('q1', errors.q1) }}
              />
              {errors.q1 && <FieldError text="Este campo es obligatorio." />}
            </div>

            {/* Q2 */}
            <div>
              <label style={QLABEL_STYLE}>
                2. ¿Qué red flags ven en candidatos para este cargo?{' '}
                <span style={{ color: 'var(--color-brand-accent)' }}>*</span>
              </label>
              <textarea
                value={q2}
                onChange={(e) => setQ2(e.target.value)}
                onFocus={() => setFocusedField('q2')}
                onBlur={() => setFocusedField(null)}
                placeholder="Ej: Rotación excesiva (3+ trabajos en 2 años), falta de proactividad, no da ejemplos concretos"
                style={{ ...TEXTAREA_STYLE, ...focusBorder('q2', errors.q2) }}
              />
              {errors.q2 && <FieldError text="Este campo es obligatorio." />}
            </div>

            {/* Q3 */}
            <div>
              <label style={QLABEL_STYLE}>
                3. ¿Hay beneficios adicionales al salario base?{' '}
                <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--color-text-muted)' }}>(Opcional)</span>
              </label>
              <textarea
                value={q3}
                onChange={(e) => setQ3(e.target.value)}
                onFocus={() => setFocusedField('q3')}
                onBlur={() => setFocusedField(null)}
                placeholder="Ej: Prima extralegal, bono de desempeño, seguro médico complementario, días de vacaciones adicionales"
                style={{ ...TEXTAREA_STYLE, ...focusBorder('q3', false) }}
              />
            </div>

            {/* Q4 — radio */}
            <div>
              <label style={QLABEL_STYLE}>
                4. ¿La vacante está activa o pendiente de publicación?{' '}
                <span style={{ color: 'var(--color-brand-accent)' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {([
                  { val: 'activa', label: 'Activa', sub: 'publicar inmediatamente' },
                  { val: 'borrador', label: 'Pendiente', sub: 'guardar como borrador' },
                ] as const).map(({ val, label, sub }) => {
                  const active = q4 === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQ4(val)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        border: `1.5px solid ${active ? 'var(--color-brand-accent)' : errors.q4 ? 'var(--color-negative-400)' : 'var(--color-border-default)'}`,
                        background: active ? 'var(--color-secondary-50)' : '#ffffff',
                        textAlign: 'left', width: '100%', transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{
                        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                        border: active ? '5px solid var(--color-brand-accent)' : '1.5px solid var(--color-border-default)',
                        background: '#ffffff', transition: 'border 0.15s ease',
                      }} />
                      <span style={{ fontSize: '14px', fontFamily: 'var(--font-display)' }}>
                        <strong style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>{label}</strong>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}> — {sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.q4 && <FieldError text="Indica el estado de publicación de la vacante." />}
            </div>

            {/* Q5 — checkboxes */}
            <div>
              <label style={QLABEL_STYLE}>
                5. De los siguientes requisitos extraídos del JD, confirma cuáles son <strong>filtros duros</strong>{' '}
                <span style={{ fontWeight: 400 }}>(si el candidato no los tiene, no pasa):</span>{' '}
                <span style={{ color: 'var(--color-brand-accent)' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filtros.map((f, i) => (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => setFiltros((prev) => prev.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      border: `1.5px solid ${f.checked ? 'var(--color-brand-accent)' : errors.q5 ? 'var(--color-negative-400)' : 'var(--color-border-default)'}`,
                      background: f.checked ? 'var(--color-secondary-50)' : '#ffffff',
                      textAlign: 'left', width: '100%', transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{
                      width: '17px', height: '17px', borderRadius: '4px', flexShrink: 0,
                      border: `2px solid ${f.checked ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                      background: f.checked ? 'var(--color-brand-accent)' : '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}>
                      {f.checked && <Check size={10} color="#fff" strokeWidth={3} />}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
              {errors.q5 && <FieldError text="Confirma al menos un filtro duro." />}
            </div>
          </div>

          {/* Actions moved to WizardBar */}
        </div>
      </div>

      <WizardBar>
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <Button variant="ghost" size="lg" onClick={() => navigate('/vacante/nueva/no-negociables', { state })}>
            <ChevronLeft size={16} />
            Atrás
          </Button>
          <Button variant="primary" size="lg" onClick={handleGenerar}>
            Continuar
            <ArrowRight size={16} />
          </Button>
        </div>
      </WizardBar>
    </div>
  );
}

function FieldError({ text }: { text: string }) {
  return (
    <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-negative-500)', fontFamily: 'var(--font-display)' }}>
      {text}
    </p>
  );
}
