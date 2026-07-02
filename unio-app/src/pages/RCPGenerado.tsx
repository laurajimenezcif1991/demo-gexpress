import { assetUrl } from '../utils/assets';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pencil, CheckCircle2, Megaphone, ClipboardList, Target, Lightbulb, AlertTriangle, Banknote } from 'lucide-react';
import Button from '../components/ui/Button';
import WizardBar from '../components/layout/WizardBar';

// ─── Mock helpers ─────────────────────────────────────────────────────────────
function getContexto(cargo: string): { priorities: string[]; autonomy: string } {
  const c = cargo.toLowerCase();
  if (c.includes('big data') || c.includes('analítica') || c.includes('datos')) return {
    priorities: ['Definir la estrategia analítica de datos de la caja', 'Implementar modelo predictivo de afiliados con 90%+ precisión', 'Presentar inteligencia sectorial a la Junta Directiva'],
    autonomy: 'Alta',
  };
  if (c.includes('talento') || c.includes('rrhh')) return {
    priorities: ['Gestión de nómina con 0 novedades sin tramitar', 'Fortalecer clima organizacional en sede Buga', 'Ejecutar plan de bienestar semestral para colaboradores'],
    autonomy: 'Media',
  };
  if (c.includes('odonto')) return {
    priorities: ['Atención pediátrica preventiva con excelencia clínica', 'Educación en salud oral a familias de la red Grupo Express', 'Reducir incidencia de caries en grupo 0-6 años en 20%'],
    autonomy: 'Media',
  };
  if (c.includes('bdm') || c.includes('business') || c.includes('comercial')) return {
    priorities: ['Captar 12+ empresas afiliadas nuevas en el semestre', 'Crecer cartera de cuentas activas en 30%', 'Posicionar servicios Grupo Express en sector empresarial del Valle'],
    autonomy: 'Alta',
  };
  return {
    priorities: ['Cumplir los indicadores del área asignada', 'Fortalecer la calidad del servicio al afiliado', 'Apoyar la estrategia de bienestar de Grupo Express'],
    autonomy: 'Media',
  };
}

function getSkills(cargo: string): { years: string; must: string; nice: string; modalidad: string } {
  const c = cargo.toLowerCase();
  if (c.includes('big data') || c.includes('analítica') || c.includes('datos')) return { years: '5+ años', must: 'Python, SQL, Power BI, Databricks', nice: 'Cloud (AWS/GCP), MLFlow, dbt', modalidad: 'Presencial — Cali' };
  if (c.includes('talento') || c.includes('rrhh')) return { years: '2+ años', must: 'Nómina (Siigo), gestión de clima, selección', nice: 'ATS, HRIS, reforma laboral 2024', modalidad: 'Presencial — Buga' };
  if (c.includes('odonto')) return { years: '2+ años', must: 'Odontopediatría, RETHUS vigente, adaptación conductual', nice: 'Sedación consciente, fluorización avanzada', modalidad: 'Presencial MT — Cali' };
  if (c.includes('bdm') || c.includes('business') || c.includes('comercial')) return { years: '3+ años', must: 'Venta consultiva B2B, CRM (HubSpot)', nice: 'SPIN Selling, Challenger Sale, marketing B2B', modalidad: 'Presencial — Cali' };
  return { years: '2+ años', must: 'Herramientas del cargo, Office 365', nice: 'Gestión de proyectos, metodologías ágiles', modalidad: 'Presencial — Cali' };
}

function getSalario(cargo: string): { rango: string; location: string } {
  const c = cargo.toLowerCase();
  if (c.includes('big data') || c.includes('analítica')) return { rango: "$6'000.000 – $8'000.000 COP", location: 'Cali, Colombia' };
  if (c.includes('talento') || c.includes('rrhh')) return { rango: "$2'500.000 – $3'000.000 COP", location: 'Buga, Colombia' };
  if (c.includes('odonto')) return { rango: "$2'000.000 – $2'500.000 COP", location: 'Cali, Colombia' };
  if (c.includes('bdm') || c.includes('business') || c.includes('comercial')) return { rango: "$3'000.000 – $3'500.000 COP", location: 'Cali, Colombia' };
  return { rango: "$3'500.000 – $5'000.000 COP", location: 'Cali, Colombia' };
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Section component ────────────────────────────────────────────────────────
function Section({
  icon, title, onEdit, children, noBorder,
}: { icon: React.ReactNode; title: string; onEdit: () => void; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div style={{ paddingBottom: '28px', marginBottom: '28px', borderBottom: noBorder ? 'none' : '1px solid var(--color-border-default)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon}
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '0.4px', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
            {title}
          </span>
        </div>
        <button
          onClick={onEdit}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '5px 12px', borderRadius: 'var(--radius-xs)',
            border: '1.5px solid var(--color-border-default)',
            background: '#ffffff', cursor: 'pointer',
            fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-display)', transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-brand-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-brand-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-default)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; }}
        >
          <Pencil size={11} />
          Editar
        </button>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
      <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{label}: </strong>
      {value}
    </p>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
type ModalState = 'none' | 'borrador' | 'activar' | 'success';

function Modal({ state, onClose, onConfirmBorrador, onConfirmActivar, cargo }: {
  state: ModalState;
  onClose: () => void;
  onConfirmBorrador: () => void;
  onConfirmActivar: () => void;
  cargo: string;
}) {
  if (state === 'none') return null;

  return (
    <>
      <style>{`@keyframes unio-modal-in { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }`}</style>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(24,20,46,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '32px',
            maxWidth: '440px', width: '100%', fontFamily: 'var(--font-display)',
            boxShadow: '0 24px 48px rgba(24,20,46,0.18)',
            animation: 'unio-modal-in 0.22s ease both',
          }}
        >
          {state === 'success' ? (
            /* ── Success ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={32} style={{ color: '#16A34A' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                ¡Vacante activada!
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>{cargo}</strong> ya está publicada en los canales seleccionados y comenzará a recibir candidatos.
              </p>
              <Button variant="primary" size="lg" fullWidth onClick={onClose}>
                Ver mis vacantes
              </Button>
            </div>

          ) : state === 'borrador' ? (
            /* ── Guardar borrador ── */
            <>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                ¿Guardar como borrador?
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
                La vacante quedará guardada y podrás activarla más adelante desde tu panel de vacantes.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="ghost" size="md" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
                <Button variant="secondary" size="md" onClick={onConfirmBorrador} style={{ flex: 1 }}>Guardar borrador</Button>
              </div>
            </>

          ) : (
            /* ── Activar vacante ── */
            <>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                ¿Activar vacante?
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
                La vacante se publicará en los canales seleccionados y empezará a recibir candidatos <strong style={{ color: 'var(--color-text-primary)' }}>inmediatamente</strong>.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="ghost" size="md" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
                <Button variant="primary" size="md" onClick={onConfirmActivar} style={{ flex: 1 }}>Activar vacante</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RCPGenerado() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const state     = (location.state ?? {}) as Record<string, unknown>;

  const cargo           = (state.cargo           as string)   ?? 'Nueva vacante';
  const area            = (state.area            as string)   ?? '';
  const fechaIngreso    = (state.fechaIngreso     as string)   ?? '';
  const tipoVacante     = (state.tipoVacante      as string)   ?? 'nueva';
  const noNegLabels     = (state.noNegLabels      as string[]) ?? ['Skills técnicos obligatorios', 'Experiencia mínima requerida'];
  const selectedChannels= (state.selectedChannels as string[]) ?? ['Redes sociales', 'Sitios de empleo'];

  const contexto  = getContexto(cargo);
  const skills    = getSkills(cargo);
  const salario   = getSalario(cargo);

  const [modal, setModal] = useState<ModalState>('none');

  const handleBorradorConfirm = () => navigate('/', { replace: true });
  const handleActivarConfirm  = () => setModal('success');
  const handleSuccessClose    = () => navigate('/', { replace: true });

  const goTo = (path: string) => navigate(path, { state });

  const iconStyle = (color: string): React.CSSProperties => ({
    width: '24px', height: '24px', borderRadius: '6px',
    background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  });

  return (
    <>
      <Modal
        state={modal}
        onClose={() => { if (modal === 'success') handleSuccessClose(); else setModal('none'); }}
        onConfirmBorrador={handleBorradorConfirm}
        onConfirmActivar={handleActivarConfirm}
        cargo={cargo}
      />

      <div style={{ minHeight: '100vh', background: 'var(--color-surface-subtle)', fontFamily: 'var(--font-display)' }}>

        {/* Navbar */}
        <header style={{
          background: '#ffffff', borderBottom: '1px solid var(--color-border-default)',
          padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={assetUrl('/logo-gcexpress.png')} alt="Grupo Express" style={{ maxHeight: '100px', maxWidth: '300px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            <div style={{ width: '1px', height: '32px', background: 'var(--color-border-default)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              <span>Powered by</span>
              <img src={assetUrl('/logo-unio.png')} alt="Unio" style={{ height: '14px', width: 'auto' }} />
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 100px' }}>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '99px', padding: '4px 14px', marginBottom: '14px' }}>
              <CheckCircle2 size={14} style={{ color: '#16A34A' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803D' }}>RCP generado</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--color-text-primary)', letterSpacing: '-0.3px', marginBottom: '8px' }}>
              Revisa y confirma el RCP
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {cargo}{area ? ` · ${area}` : ''}
            </p>
          </div>

          {/* Main card */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', padding: '32px', boxShadow: '0 2px 16px rgba(24,20,46,0.06)' }}>

            {/* ── Canales de publicación ── */}
            <Section
              icon={<div style={iconStyle('#8750F6')}><Megaphone size={13} color="#8750F6" /></div>}
              title="Canales de publicación"
              onEdit={() => goTo('/vacante/nueva/canales')}
            >
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {selectedChannels.map((ch) => (
                  <li key={ch} style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{ch}</li>
                ))}
              </ul>
            </Section>

            {/* ── Identificación ── */}
            <Section
              icon={<div style={iconStyle('#3B82F6')}><ClipboardList size={13} color="#3B82F6" /></div>}
              title="Identificación"
              onEdit={() => goTo('/vacante/nueva')}
            >
              <Field label="Área" value={area || '—'} />
              <Field label="Cargo" value={cargo} />
              <Field label="Fecha de ingreso" value={formatDate(fechaIngreso)} />
              <Field label="Tipo de vacante" value={tipoVacante === 'nueva' ? 'Vacante nueva' : 'Reemplazo'} />
              <Field label="Seniority" value={skills.years.replace('+', '+ años requeridos → ').split(' → ')[0] === skills.years ? skills.years.split(' ')[0] + ' (extracto JD)' : skills.years} />
            </Section>

            {/* ── Contexto del rol ── */}
            <Section
              icon={<div style={iconStyle('#F59E0B')}><Target size={13} color="#F59E0B" /></div>}
              title="Contexto del rol"
              onEdit={() => goTo('/vacante/nueva/completar')}
            >
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Top 3 Prioridades:</p>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                {contexto.priorities.map((p, i) => (
                  <li key={i} style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{p}</li>
                ))}
              </ol>
              <Field label="Autonomía" value={contexto.autonomy} />
            </Section>

            {/* ── Skills & Experiencia ── */}
            <Section
              icon={<div style={iconStyle('#10B981')}><Lightbulb size={13} color="#10B981" /></div>}
              title="Skills & Experiencia"
              onEdit={() => goTo('/vacante/nueva/no-negociables')}
            >
              <Field label="Años requeridos" value={skills.years} />
              <Field label="Obligatorios (Must)" value={skills.must} />
              <Field label="Valorados (Nice)" value={skills.nice} />
              <Field label="Modalidad" value={skills.modalidad} />
            </Section>

            {/* ── No negociables ── */}
            <Section
              icon={<div style={iconStyle('#EF4444')}><AlertTriangle size={13} color="#EF4444" /></div>}
              title="No negociables (filtros)"
              onEdit={() => goTo('/vacante/nueva/no-negociables')}
            >
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {noNegLabels.map((nn) => (
                  <li key={nn} style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{nn}</li>
                ))}
              </ul>
            </Section>

            {/* ── Compensación ── */}
            <Section
              icon={<div style={iconStyle('#8750F6')}><Banknote size={13} color="#8750F6" /></div>}
              title="Compensación"
              onEdit={() => goTo('/vacante/nueva')}
              noBorder
            >
              <Field label="Salario" value={salario.rango} />
              <Field label="Modalidad" value={skills.modalidad} />
              <Field label="Ubicación" value={salario.location} />
            </Section>
          </div>
        </div>
      </div>

      <WizardBar>
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <Button variant="ghost" size="lg" onClick={() => setModal('borrador')}>
            Guardar borrador
          </Button>
          <Button variant="primary" size="lg" onClick={() => setModal('activar')}>
            Activar vacante →
          </Button>
        </div>
      </WizardBar>
    </>
  );
}
