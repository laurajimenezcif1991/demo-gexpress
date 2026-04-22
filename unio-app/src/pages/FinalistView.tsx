import { useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Building2,
  Eye,
  MapPin,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import WizardBar from '../components/layout/WizardBar';
import Toast from '../components/layout/Toast';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Gauge from '../components/ui/Gauge';
import ProgressBar from '../components/ui/ProgressBar';
import { finalistProfiles, candidates } from '../data/mock';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import '../styles/finalist-motion.css';

const STAGGER_MS = 80;
const REVEAL_DURATION_S = 0.45;
const REVEAL_DURATION_REDUCED_S = 0.2;

function FinalistReveal({
  children,
  delayIndex,
  reducedMotion,
  style,
  className = '',
}: {
  children: ReactNode;
  delayIndex: number;
  reducedMotion: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const delayMs = reducedMotion ? 0 : delayIndex * STAGGER_MS;
  const dur = reducedMotion ? REVEAL_DURATION_REDUCED_S : REVEAL_DURATION_S;
  return (
    <div
      className={`finalist-reveal ${className}`.trim()}
      style={
        {
          '--finalist-reveal-delay': `${delayMs}ms`,
          '--finalist-reveal-dur': `${dur}s`,
          '--finalist-reveal-dur-reduced': `${REVEAL_DURATION_REDUCED_S}s`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

export default function FinalistView() {
  const { jobId = 'v1', candidateId = 'c1' } = useParams();
  const navigate = useNavigate();

  const finalist = finalistProfiles.find((f) => f.id === candidateId);
  const candidate = finalist || candidates.find((c) => c.id === candidateId) || candidates[0];

  const [dofaOpen, setDofaOpen] = useState(false);
  const [matrizOpen, setMatrizOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const reducedMotion = usePrefersReducedMotion();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const logros = finalist?.logrosDestacados || [
    { value: '40%', label: 'Menos tiempo de diseño', descripcion: 'Biblioteca de componentes reutilizables adoptada por 15 developers' },
    { value: '75%', label: 'Reducción inconsistencias', descripcion: 'Design System escalable en 3 productos B2B durante 2022-2024' },
    { value: '8', label: 'Casos de estudio', descripcion: 'Portfolio documenta proyectos fintech B2B con métricas de impacto' },
    { value: '8+', label: 'Proyectos simultáneos', descripcion: 'Colaboración cross-funcional con Product, Engineering y Data' },
  ];

  const fitCultural = finalist?.fitCultural || {
    narrative: 'Perfil sistémico que piensa como diseñador. Viene de entornos exigentes donde ha consolidado procesos y formalizado sistemas fragmentados.',
    afinidad: [
      'Se mueve en equipos horizontales y colaborativos con cultura de datos y alta autonomía',
      'Encaja en organizaciones con madurez digital que requieren rigor técnico',
    ],
    noNegociables: [
      'Mentalidad design-to-code: Entiende las implicaciones técnicas de sus decisiones',
      'Ownership y conexión directa con desarrollo para handoffs limpios',
      'Rigor en estructuración de procesos más que en micromanagement operativo',
    ],
    proyeccion: 'Head of Design → Referente de Design Systems en fintech LATAM',
  };

  const estiloTrabajo = finalist?.estiloTrabajo || [
    { label: 'Autonomía', score: 85, descripcion: 'Toma decisiones sin necesitar validación constante.' },
    { label: 'Estructura', score: 65, descripcion: 'Prefiere frameworks y procesos claros.' },
    { label: 'Colaboración', score: 92, descripcion: 'Trabaja mejor en equipo que solo.' },
    { label: 'Hard Skills', score: 78, descripcion: 'Dominio técnico sólido con herramientas core.' },
    { label: 'Adaptabilidad', score: 88, descripcion: 'Se ajusta rápido a cambios de prioridades.' },
  ];

  const resumen = finalist?.resumenCandidato || [
    'Product Designer con +7 años liderando productos digitales en banca, Fintech y SaaS.',
    'Ha creado Design System con 90% de adopción organizacional.',
    'Perfil sistémico que se mueve cómodo en contextos consultivos.',
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
      <Sidebar />

      <main
        style={{
          marginLeft: '205px',
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '960px', padding: '32px 40px 120px' }}>
        {/* Back */}
        <button
          onClick={() => navigate(`/pipeline/${jobId}/candidate/${candidateId}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            padding: '0',
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={16} />
          Atrás
        </button>

        {/* Title row */}
        <FinalistReveal delayIndex={0} reducedMotion={reducedMotion}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '32px',
                color: 'var(--color-brand-primary)',
                margin: 0,
              }}
            >
              Proceso de validación
            </h1>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(`/pipeline/${jobId}/candidate/${candidateId}`)}
            >
              <Eye size={16} />
              Ver proceso de validación
            </Button>
          </div>
        </FinalistReveal>

        {/* Profile card */}
        <FinalistReveal delayIndex={1} reducedMotion={reducedMotion}>
        <div
          style={{
            border: '2px solid transparent',
            background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(115deg, #9A7CF7, #FDD83F, #F05899, #3DAC56, #00ADFE) border-box',
            borderRadius: 'var(--container-radius)',
            padding: '32px',
            marginBottom: '20px',
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
          }}
        >
          <Avatar initials={candidate.avatarInitials} color={candidate.avatarColor} size={140} />

          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '28px',
                color: 'var(--color-brand-primary)',
                margin: '0 0 10px',
              }}
            >
              {candidate.name}
            </h2>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <Badge variant="prescreening" small>{candidate.role}</Badge>
              <span style={{ color: 'var(--color-neutral-300)', fontSize: '14px' }}>•</span>
              <Badge variant="default" small>{candidate.sector.split(',')[0].trim()}</Badge>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <Badge variant="default" small><MapPin size={11} /> {candidate.location}</Badge>
              <Badge variant="default" small>🕐 {candidate.years}</Badge>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Zap size={14} color="var(--color-brand-accent)" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-brand-accent)' }}>Superpoder</span>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontStyle: 'italic', paddingLeft: '20px' }}>
                {candidate.superpoder}
              </span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Building2 size={14} color="var(--color-text-muted)" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Estado actual</span>
              </div>
              {candidate.hasCurrentJob ? (
                <span style={{ fontSize: '13px', color: 'var(--color-text-primary)', paddingLeft: '20px' }}>
                  {candidate.currentCompany} • {candidate.currentRole}
                </span>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', paddingLeft: '20px' }}>
                  Sin empleo actualmente · Última: {candidate.lastRole} @ {candidate.lastCompany} ({candidate.lastDate})
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <Button variant="outline" size="sm">Hoja de vida</Button>
              <Button variant="ghost" size="sm">Portafolio</Button>
            </div>
          </div>

          <Gauge
            score={candidate.score}
            size={160}
            label="Consolidado"
            animated
            reducedMotion={reducedMotion}
            animationDurationMs={1100}
          />
        </div>
        </FinalistReveal>

        {/* Salary bar */}
        <FinalistReveal delayIndex={2} reducedMotion={reducedMotion}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Aspiración: <strong style={{ color: 'var(--color-text-primary)' }}>{candidate.aspiration}</strong>
          </span>
          <Badge variant={candidate.salaryRange}>{candidate.salaryRange === 'en_rango' ? 'En rango' : 'Fuera de rango'}</Badge>
          <span style={{ color: 'var(--color-neutral-300)' }}>——</span>
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Presupuesto: <strong style={{ color: 'var(--color-text-primary)' }}>{candidate.budget}</strong>
          </span>
        </div>
        </FinalistReveal>

        {/* Resumen candidato */}
        <FinalistReveal delayIndex={3} reducedMotion={reducedMotion}>
        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', margin: '0 0 14px', color: 'var(--color-brand-primary)' }}>
            Resumen candidato
          </h2>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
            }}
          >
            {resumen.map((line, i) => (
              <p key={i} style={{ margin: i < resumen.length - 1 ? '0 0 8px' : '0', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {line}
              </p>
            ))}
          </div>
        </section>
        </FinalistReveal>

        {/* Logros destacados */}
        <section style={{ marginBottom: '28px' }}>
          <FinalistReveal delayIndex={4} reducedMotion={reducedMotion}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', margin: '0 0 14px', color: 'var(--color-brand-primary)' }}>
              Logros destacados
            </h2>
          </FinalistReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {logros.map((logro, i) => (
              <FinalistReveal key={i} delayIndex={5 + i} reducedMotion={reducedMotion} className="finalist-logro-card">
              <div
                style={{
                  border: '2px solid transparent',
                  background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(115deg, #9A7CF7, #FDD83F, #F05899, #3DAC56, #00ADFE) border-box',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '32px',
                    color: 'var(--color-brand-accent)',
                    lineHeight: 1,
                    marginBottom: '6px',
                  }}
                >
                  {logro.value}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                  {logro.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  {logro.descripcion}
                </div>
              </div>
              </FinalistReveal>
            ))}
          </div>
        </section>

        {/* Fit Cultural + Estilo de Trabajo */}
        <FinalistReveal delayIndex={9} reducedMotion={reducedMotion}>
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Fit Cultural */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', margin: '0 0 14px', color: 'var(--color-brand-primary)' }}>
                Fit Cultural
              </h2>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  height: 'fit-content',
                }}
              >
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6, background: 'var(--color-secondary-50)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  {fitCultural.narrative}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '13px', color: 'var(--color-text-primary)' }}>Afinidad con liderazgo:</p>
                  {fitCultural.afinidad.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--color-brand-accent)', flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{a}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '13px', color: 'var(--color-text-primary)' }}>No negociables culturales:</p>
                  {fitCultural.noNegociables.map((n, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{n}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '13px', color: 'var(--color-text-primary)' }}>Proyección profesional</p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>{fitCultural.proyeccion}</p>
                </div>
              </div>
            </div>

            {/* Estilo de Trabajo */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', margin: '0 0 14px', color: 'var(--color-brand-primary)' }}>
                Estilo de Trabajo
              </h2>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {estiloTrabajo.map((item, i) => (
                  <div
                    key={i}
                    className="finalist-work-row"
                    style={
                      { '--bar-delay': `${i * 100}ms` } as CSSProperties
                    }
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)' }}>{item.label}</span>
                      <span
                        className={reducedMotion ? undefined : 'finalist-work-score'}
                        style={
                          reducedMotion
                            ? { fontWeight: 700, fontSize: '14px', color: 'var(--color-brand-primary)' }
                            : ({
                                fontWeight: 700,
                                fontSize: '14px',
                                color: 'var(--color-brand-primary)',
                                '--finalist-score-fade-delay': `calc(var(--bar-delay, 0ms) + 520ms)`,
                              } as CSSProperties)
                        }
                      >
                        {item.score}
                      </span>
                    </div>
                    <ProgressBar
                      value={item.score}
                      colored
                      height={8}
                      animateFill
                      fillDelayMs={i * 100}
                      fillDurationMs={800}
                      reducedMotion={reducedMotion}
                    />
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {item.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        </FinalistReveal>

        {/* Accordion: DOFA */}
        <FinalistReveal delayIndex={10} reducedMotion={reducedMotion}>
        <AccordionBlock
          icon="🎯"
          title="DOFA"
          isOpen={dofaOpen}
          onToggle={() => setDofaOpen(!dofaOpen)}
        >
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Análisis DOFA del candidato — (pendiente de desbloquear tras evaluaciones completas)
          </p>
        </AccordionBlock>
        </FinalistReveal>

        <div style={{ marginTop: '12px' }}>
          <FinalistReveal delayIndex={11} reducedMotion={reducedMotion}>
          <AccordionBlock
            icon="⬠"
            title="Matriz de Skills"
            isOpen={matrizOpen}
            onToggle={() => setMatrizOpen(!matrizOpen)}
          >
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)' }}>
              Matriz de skills del candidato — (pendiente de desbloquear tras evaluaciones completas)
            </p>
          </AccordionBlock>
          </FinalistReveal>
        </div>
        </div>{/* /inner wrapper */}
      </main>

      {/* Wizard bar */}
      <WizardBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
            {candidate.name}
          </span>
          <span style={{ color: 'var(--color-neutral-300)' }}>•</span>
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Score: {candidate.score}/100
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="primary"
            size="md"
            className="finalist-wizard-btn finalist-wizard-btn--primary"
            onClick={() => showToast('¡Candidato preseleccionado!')}
          >
            <CheckCircle2 size={16} />
            Preseleccionar
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="finalist-wizard-btn finalist-wizard-btn--ghost"
            onClick={() => showToast('¡Marcado como pendiente!')}
          >
            <HelpCircle size={16} />
            Marcar pendiente
          </Button>
          <Button
            variant="danger-outline"
            size="md"
            className="finalist-wizard-btn finalist-wizard-btn--danger"
            onClick={() => showToast('Candidato rechazado')}
          >
            <X size={16} />
            Rechazar
          </Button>
        </div>
      </WizardBar>

      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}

interface AccordionBlockProps {
  icon: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionBlock({ icon, title, isOpen, onToggle, children }: AccordionBlockProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', color: 'var(--color-brand-primary)' }}>
            {title}
          </span>
        </div>
        {isOpen ? <ChevronUp size={20} color="var(--color-text-muted)" /> : <ChevronDown size={20} color="var(--color-text-muted)" />}
      </div>
      {isOpen && (
        <div style={{ padding: '0 24px 20px', borderTop: '1px solid var(--color-border-default)' }}>
          <div style={{ paddingTop: '16px' }}>{children}</div>
        </div>
      )}
    </div>
  );
}
