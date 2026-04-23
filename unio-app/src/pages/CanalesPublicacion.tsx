import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Sparkles, Check, Lightbulb, Smartphone, Briefcase, Globe, QrCode } from 'lucide-react';
import Button from '../components/ui/Button';
import StepBreadcrumb from '../components/ui/StepBreadcrumb';
import WizardBar from '../components/layout/WizardBar';

const TOTAL_QUESTIONS = 35;
const BASE_ANSWERED   = 32; // completed after all previous steps

interface Channel {
  id: string;
  icon: React.ReactNode;
  name: string;
  description: string;
  checked: boolean;
}

const TIPS = [
  { label: 'Redes sociales', text: 'Roles profesionales, tech, creativos y perfiles activos en redes.' },
  { label: 'Sitios de empleo', text: 'Mayor alcance. Ideal para todo tipo de roles y volumen de candidatos.' },
  { label: 'Página web', text: 'Refuerza el employer branding con candidatos que ya conocen Comfandi.' },
  { label: 'Físico (QR)', text: 'Roles operativos, logística, manufactura y puntos de atención presencial.' },
];

export default function CanalesPublicacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as Record<string, unknown>;
  const cargo = (state.cargo as string) ?? 'Nueva vacante';
  const area  = (state.area  as string) ?? '';

  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'social',
      icon: <Smartphone size={20} style={{ color: '#8B5CF6' }} />,
      name: 'Redes sociales',
      description: 'LinkedIn, Facebook, Instagram. Publicación orgánica con opción de promoción paga.',
      checked: true,
    },
    {
      id: 'jobsites',
      icon: <Briefcase size={20} style={{ color: '#3B82F6' }} />,
      name: 'Sitios de empleo',
      description: 'Computrabajo, Indeed, LinkedIn Jobs, El Empleo. Distribución automática a múltiples portales.',
      checked: true,
    },
    {
      id: 'website',
      icon: <Globe size={20} style={{ color: '#10B981' }} />,
      name: 'Página web de la empresa',
      description: 'Sección "Trabaja con nosotros" en el sitio corporativo comfandi.com.co. Requiere integración previa.',
      checked: false,
    },
    {
      id: 'qr',
      icon: <QrCode size={20} style={{ color: '#F59E0B' }} />,
      name: 'Físico (QR)',
      description: 'Código QR descargable para imprimir en carteleras, sucursales y eventos de reclutamiento.',
      checked: false,
    },
  ]);

  const selectedCount = channels.filter((c) => c.checked).length;
  const canContinue   = selectedCount > 0;

  const pct      = Math.round(((BASE_ANSWERED + (canContinue ? 3 : 0)) / TOTAL_QUESTIONS) * 100);
  const answered = BASE_ANSWERED + (canContinue ? 3 : 0);

  const toggle = (id: string) =>
    setChannels((prev) => prev.map((c) => c.id === id ? { ...c, checked: !c.checked } : c));

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

        <StepBreadcrumb current={4} />

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-text-primary)', letterSpacing: '-0.3px', marginBottom: '8px' }}>
            Selecciona canales de publicación
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {cargo}{area ? ` · ${area}` : ''}
          </p>
        </div>

        {/* Main card */}
        <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', padding: '32px', boxShadow: '0 2px 16px rgba(24,20,46,0.06)' }}>

          {/* Progress bar */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                Progreso del RCP
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-brand-accent)' }}>
                {pct}% completado
              </span>
            </div>
            <div style={{ height: '10px', borderRadius: '99px', background: 'var(--color-secondary-50)', overflow: 'hidden', border: '1px solid var(--color-secondary-100)' }}>
              <div style={{
                height: '100%', borderRadius: '99px',
                width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--color-brand-accent), var(--color-brand-accent-dark))',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px', textAlign: 'center' }}>
              {answered} de {TOTAL_QUESTIONS} preguntas respondidas
            </p>
          </div>

          {/* Section title */}
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            ¿Dónde quieres publicar esta vacante?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
            Selecciona al menos un canal. Puedes elegir todos los que apliquen para maximizar el alcance.
          </p>

          {/* Channel cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {channels.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => toggle(ch.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '18px 18px', borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${ch.checked ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                  background: ch.checked ? 'var(--color-secondary-50)' : '#ffffff',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                {/* Checkbox */}
                <span style={{
                  width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, marginTop: '1px',
                  border: `2px solid ${ch.checked ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                  background: ch.checked ? 'var(--color-brand-accent)' : '#ffffff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}>
                  {ch.checked && <Check size={10} color="#fff" strokeWidth={3} />}
                </span>

                {/* Icon */}
                <span style={{ flexShrink: 0, marginTop: '1px' }}>{ch.icon}</span>

                {/* Text */}
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    {ch.name}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {ch.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--color-border-default)', marginBottom: '24px' }} />

          {/* Tips info box */}
          <div style={{ padding: '16px 18px', borderRadius: 'var(--radius-md)', background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Lightbulb size={16} style={{ color: '#D97706', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>¿Cuándo usar cada canal?</span>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '24px' }}>
              {TIPS.map((t) => (
                <li key={t.label} style={{ fontSize: '13px', color: '#78350F', lineHeight: 1.5 }}>
                  <strong>{t.label}:</strong> {t.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions moved to WizardBar */}
        </div>
      </div>

      <WizardBar>
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <Button variant="ghost" size="lg" onClick={() => navigate('/vacante/nueva/completar', { state })}>
            <ChevronLeft size={16} />
            Atrás
          </Button>
          <Button
            variant="primary"
            size="lg"
            disabled={!canContinue}
            onClick={() => {
              const selectedChannels = channels.filter((c) => c.checked).map((c) => c.name);
              navigate('/vacante/nueva/rcp', { state: { ...state, selectedChannels } });
            }}
          >
            <Sparkles size={16} />
            Generar RCP
          </Button>
        </div>
      </WizardBar>
    </div>
  );
}
