import { assetUrl } from '../utils/assets';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, Sparkles, Check, Lightbulb,
  Briefcase, Globe, QrCode, ChevronDown, ChevronUp,
  Users, Plus,
} from 'lucide-react';
import Button from '../components/ui/Button';
import StepBreadcrumb from '../components/ui/StepBreadcrumb';
import WizardBar from '../components/layout/WizardBar';

// ─── Platform SVG logos ───────────────────────────────────────────────────────
const FbIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#1877F2" />
    <path
      d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.34 22.34 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"
      fill="white"
    />
  </svg>
);

const WaIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#25D366" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7.58 4 4 7.58 4 12c0 1.37.36 2.65.98 3.77L4 20l4.35-1.14A7.96 7.96 0 0 0 12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8zm0 14.5c-1.2 0-2.32-.31-3.28-.86l-.24-.14-2.46.64.66-2.38-.15-.24A6.47 6.47 0 0 1 5.5 12C5.5 8.41 8.41 5.5 12 5.5S18.5 8.41 18.5 12 15.59 18.5 12 18.5zm3.96-4.83c-.21-.11-1.26-.62-1.46-.69-.19-.07-.33-.11-.47.11-.14.22-.53.69-.65.83-.12.14-.24.16-.45.05-.21-.11-.89-.33-1.7-1.05-.63-.56-1.05-1.25-1.17-1.46-.12-.21-.01-.32.09-.43.1-.09.21-.24.32-.36.11-.12.14-.21.22-.35.07-.14.04-.26-.02-.37-.05-.11-.47-1.13-.64-1.55-.17-.4-.34-.35-.47-.36-.12-.01-.26-.01-.4-.01-.14 0-.36.05-.55.26-.19.21-.72.7-.72 1.71 0 1.01.74 1.99.84 2.13.1.14 1.45 2.22 3.52 3.11.49.21.87.34 1.17.43.49.16.93.13 1.28.08.39-.06 1.21-.5 1.38-.97.17-.48.17-.89.12-.97-.05-.09-.19-.14-.4-.25z"
      fill="white"
    />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
interface SocialGroup {
  id: string;
  name: string;
  description: string;
  sector: string;
  followers: string;
  selected: boolean;
}

const FB_GROUPS_INIT: SocialGroup[] = [
  {
    id: 'fb-1',
    name: 'Empleos en Medellín',
    description: 'Grupo de alta actividad diaria con publicaciones de vacantes en todos los sectores del Área Metropolitana.',
    sector: 'RRHH / Empleo',
    followers: '45.2K miembros',
    selected: true,
  },
  {
    id: 'fb-2',
    name: 'Vacantes Cali y Valle del Cauca',
    description: 'Comunidad activa de reclutamiento para el Valle del Cauca con publicaciones de empresas del sector servicios y comercio.',
    sector: 'RRHH / Empleo',
    followers: '38.7K miembros',
    selected: false,
  },
  {
    id: 'fb-3',
    name: 'Ofertas de Trabajo Colombia',
    description: 'Mayor grupo nacional de difusión de vacantes con alto volumen de candidatos activos en búsqueda laboral.',
    sector: 'Empleo masivo',
    followers: '121K miembros',
    selected: false,
  },
  {
    id: 'fb-4',
    name: 'Bolsa de Empleo Antioquia',
    description: 'Grupo especializado en empleo formal para Antioquia con perfil de candidatos del sector servicios, salud y educación.',
    sector: 'Empleo regional',
    followers: '27.4K miembros',
    selected: false,
  },
];

const WA_CHANNELS_INIT: SocialGroup[] = [
  {
    id: 'wa-1',
    name: 'Empleo en Bogotá',
    description: 'Canal verificado con la mayor audiencia de buscadores de empleo activos en Bogotá y municipios aledaños.',
    sector: 'RRHH / Empleo',
    followers: '794K seguidores',
    selected: true,
  },
  {
    id: 'wa-2',
    name: 'Bolsa de Trabajo Colombia',
    description: 'Canal con convocatorias laborales diarias en sectores formales a nivel nacional con alta tasa de apertura.',
    sector: 'Empleo masivo',
    followers: '82K seguidores',
    selected: false,
  },
  {
    id: 'wa-3',
    name: 'Convocatorias Administrativas',
    description: 'Canal dedicado a roles administrativos, comerciales y de gestión humana en empresas del sector privado.',
    sector: 'Adm. y Negocios',
    followers: '39K seguidores',
    selected: false,
  },
  {
    id: 'wa-4',
    name: 'Programas para el Bienestar',
    description: 'Canal de alta audiencia enfocado en bienestar, subsidios y empleo social. Afín a la base de afiliados de cajas de compensación.',
    sector: 'Social / Bienestar',
    followers: '493K seguidores',
    selected: false,
  },
];

const TOTAL_QUESTIONS = 35;
const BASE_ANSWERED = 32;

interface Channel {
  id: string;
  icon: React.ReactNode;
  name: string;
  description: string;
  checked: boolean;
}

const TIPS = [
  { label: 'Grupos o canales', text: 'Grupos de Facebook y canales de WhatsApp activos con comunidades de búsqueda de empleo en Colombia.' },
  { label: 'Sitios de empleo', text: 'Mayor alcance. Ideal para todo tipo de roles y volumen de candidatos.' },
  { label: 'Página web', text: 'Refuerza el employer branding con candidatos que ya conocen Grupo Express.' },
  { label: 'Físico (QR)', text: 'Roles operativos, logística, manufactura y puntos de atención presencial.' },
];

// ─── Sub-panel: platform accordion section ───────────────────────────────────
interface PlatformSectionProps {
  icon: React.ReactNode;
  label: string;
  accentColor: string;
  channels: SocialGroup[];
  selectedCount: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleChannel: (id: string) => void;
}

function PlatformSection({
  icon, label, accentColor, channels, selectedCount,
  expanded, onToggleExpand, onToggleChannel,
}: PlatformSectionProps) {
  return (
    <div style={{ borderRadius: '10px', border: '1px solid var(--color-border-default)', overflow: 'hidden' }}>

      {/* Section header */}
      <button
        type="button"
        onClick={onToggleExpand}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 14px', background: '#FAFAFA', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          borderBottom: expanded ? '1px solid var(--color-border-default)' : 'none',
          transition: 'background 0.15s ease',
        }}
      >
        {icon}
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', flex: 1 }}>
          {label}
        </span>
        {selectedCount > 0 && (
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
            background: accentColor + '18', color: accentColor, border: `1px solid ${accentColor}40`,
          }}>
            {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>
        )}
        {expanded
          ? <ChevronUp size={14} color="var(--color-text-muted)" />
          : <ChevronDown size={14} color="var(--color-text-muted)" />}
      </button>

      {/* Channel cards */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', background: '#ffffff' }}>
          {channels.map((ch, idx) => (
            <div
              key={ch.id}
              style={{
                padding: '12px 14px',
                borderTop: idx === 0 ? 'none' : '1px solid var(--color-border-default)',
                background: ch.selected ? '#F9F5FF' : '#ffffff',
                transition: 'background 0.15s ease',
              }}
            >
              {/* Name + CTA */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '5px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                  {ch.name}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleChannel(ch.id)}
                  style={{
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '4px 11px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: 600,
                    border: `1.5px solid ${ch.selected ? '#16A34A' : 'var(--color-brand-accent)'}`,
                    background: ch.selected ? '#16A34A' : 'transparent',
                    color: ch.selected ? '#ffffff' : 'var(--color-brand-accent)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ch.selected
                    ? <><Check size={10} strokeWidth={3} /> Agregado</>
                    : <><Plus size={10} strokeWidth={2.5} /> Agregar</>}
                </button>
              </div>

              {/* Description */}
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: '0 0 7px' }}>
                {ch.description}
              </p>

              {/* Meta: sector + followers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                  background: 'var(--color-secondary-50)', color: 'var(--color-brand-accent)',
                  border: '1px solid var(--color-secondary-100)',
                }}>
                  {ch.sector}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Users size={10} style={{ flexShrink: 0 }} />
                  {ch.followers}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CanalesPublicacion() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as Record<string, unknown>;
  const cargo = (state.cargo as string) ?? 'Nueva vacante';
  const area  = (state.area  as string) ?? '';

  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'social',
      icon: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FbIcon size={16} />
          <WaIcon size={16} />
        </span>
      ),
      name: 'Grupos o Canales',
      description: 'Facebook y WhatsApp. Publicación en grupos y canales activos de empleo en Colombia.',
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
      description: 'Sección "Trabaja con nosotros" en el sitio corporativo demotransportes.com.co. Requiere integración previa.',
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

  // Platform sub-state
  const [fbExpanded, setFbExpanded] = useState(true);
  const [waExpanded, setWaExpanded] = useState(true);
  const [fbGroups, setFbGroups]     = useState<SocialGroup[]>(FB_GROUPS_INIT);
  const [waChannels, setWaChannels] = useState<SocialGroup[]>(WA_CHANNELS_INIT);

  const toggleFb = (id: string) => setFbGroups(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  const toggleWa = (id: string) => setWaChannels(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));

  const fbSelected = fbGroups.filter(c => c.selected).length;
  const waSelected = waChannels.filter(c => c.selected).length;

  const socialChecked = channels.find(c => c.id === 'social')?.checked ?? false;

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
          <img src={assetUrl('/logo-gcexpress.png')} alt="Grupo Express"
            style={{ maxHeight: '100px', maxWidth: '300px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          <div style={{ width: '1px', height: '32px', background: 'var(--color-border-default)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <span>Powered by</span>
            <img src={assetUrl('/logo-unio.png')} alt="Unio" style={{ height: '14px', width: 'auto' }} />
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
              <div key={ch.id}>

                {/* Main toggle card */}
                <button
                  type="button"
                  onClick={() => toggle(ch.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '18px 18px', width: '100%',
                    borderRadius: ch.id === 'social' && ch.checked
                      ? 'var(--radius-md) var(--radius-md) 0 0'
                      : 'var(--radius-md)',
                    border: `1.5px solid ${ch.checked ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                    borderBottom: ch.id === 'social' && ch.checked
                      ? `1px solid var(--color-secondary-100)`
                      : `1.5px solid ${ch.checked ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                    background: ch.checked ? 'var(--color-secondary-50)' : '#ffffff',
                    cursor: 'pointer', textAlign: 'left',
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
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                      {ch.name}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                      {ch.description}
                    </p>
                  </div>
                </button>

                {/* Expandable sub-panel: Grupos o Canales */}
                {ch.id === 'social' && socialChecked && (
                  <div style={{
                    border: `1.5px solid var(--color-brand-accent)`,
                    borderTop: 'none',
                    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                    background: '#FAFBFF',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>

                    {/* Facebook */}
                    <PlatformSection
                      icon={<FbIcon size={18} />}
                      label="Facebook"
                      accentColor="#1877F2"
                      channels={fbGroups}
                      selectedCount={fbSelected}
                      expanded={fbExpanded}
                      onToggleExpand={() => setFbExpanded(v => !v)}
                      onToggleChannel={toggleFb}
                    />

                    {/* WhatsApp */}
                    <PlatformSection
                      icon={<WaIcon size={18} />}
                      label="WhatsApp"
                      accentColor="#25D366"
                      channels={waChannels}
                      selectedCount={waSelected}
                      expanded={waExpanded}
                      onToggleExpand={() => setWaExpanded(v => !v)}
                      onToggleChannel={toggleWa}
                    />

                  </div>
                )}

              </div>
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
