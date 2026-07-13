import { CheckCircle2, XCircle, Clock, FileX, MessageCircle, Loader2, CheckCheck } from 'lucide-react';
import type { PrescreeningProgress, ResumeValidationStatus, WaPrescreeningStatus } from '../../data/mock';

export type PrescreeningProgressVariant = 'table' | 'card' | 'onePager';

interface Props {
  resumeValidation: PrescreeningProgress['resumeValidation'];
  whatsappPrescreening: PrescreeningProgress['whatsappPrescreening'];
  variant: PrescreeningProgressVariant;
}

// ── Resume validation config ─────────────────────────────────────────────────
const RV_CONFIG: Record<ResumeValidationStatus, {
  label: string;
  shortLabel: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  explanation: string;
}> = {
  passed: {
    label: 'HV Cumple',
    shortLabel: 'HV Cumple',
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#86efac',
    icon: <CheckCircle2 size={13} color="#15803d" />,
    explanation: 'La hoja de vida cumple los requisitos básicos del cargo.',
  },
  failed: {
    label: 'HV No cumple',
    shortLabel: 'HV No cumple',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#fca5a5',
    icon: <XCircle size={13} color="#b91c1c" />,
    explanation: 'La hoja de vida no cumple los requisitos básicos del cargo.',
  },
  pending: {
    label: 'HV en validación',
    shortLabel: 'HV en validación',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fcd34d',
    icon: <Loader2 size={13} color="#d97706" />,
    explanation: 'La hoja de vida está siendo revisada contra los requisitos del cargo.',
  },
  not_available: {
    label: 'HV en validación',
    shortLabel: 'HV en validación',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fcd34d',
    icon: <Loader2 size={13} color="#d97706" />,
    explanation: 'La hoja de vida está siendo procesada para iniciar la validación.',
  },
};

// ── WA prescreening config ───────────────────────────────────────────────────
const WA_CONFIG: Record<WaPrescreeningStatus, {
  label: string;
  shortLabel: string;
  color: string;
  icon: React.ReactNode;
  explanation: (rvStatus: ResumeValidationStatus) => string;
}> = {
  completed: {
    label: 'Pre-entrevista completada',
    shortLabel: 'Completada',
    color: '#15803d',
    icon: <CheckCheck size={13} color="#15803d" />,
    explanation: () => 'El candidato completó la pre-entrevista por WhatsApp.',
  },
  in_progress: {
    label: 'Pre-entrevista en progreso',
    shortLabel: 'En progreso',
    color: '#d97706',
    icon: <CheckCheck size={13} color="#9ca3af" />,
    explanation: () => 'El candidato está completando la pre-entrevista por WhatsApp.',
  },
  not_started: {
    label: 'Pre-entrevista pendiente',
    shortLabel: 'Pendiente',
    color: '#9ca3af',
    icon: <CheckCheck size={13} color="#d1d5db" />,
    explanation: (rv) =>
      rv !== 'passed'
        ? 'La pre-entrevista inicia automáticamente una vez que la HV pase la validación.'
        : 'La pre-entrevista por WhatsApp aún no ha comenzado.',
  },
};

// ── Table variant — very compact, right-aligned ──────────────────────────────
function TableVariant({ resumeValidation: rv, whatsappPrescreening: wa }: Omit<Props, 'variant'>) {
  const rvCfg = RV_CONFIG[rv.status];
  const waCfg = WA_CONFIG[wa.status];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0, minWidth: '115px' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '11px', fontWeight: 700,
        color: rvCfg.color, fontFamily: 'var(--font-display)',
      }}>
        {rvCfg.icon}
        {rvCfg.shortLabel}
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '10px', fontWeight: 500,
        color: waCfg.color, fontFamily: 'var(--font-display)',
      }}>
        {waCfg.icon}
        {waCfg.shortLabel}
      </div>
    </div>
  );
}

// ── Card variant — compact two-step list ─────────────────────────────────────
function CardVariant({ resumeValidation: rv, whatsappPrescreening: wa }: Omit<Props, 'variant'>) {
  const rvCfg = RV_CONFIG[rv.status];
  const waCfg = WA_CONFIG[wa.status];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0, minWidth: '130px' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 8px', borderRadius: '6px',
        background: rvCfg.bg, border: `1px solid ${rvCfg.border}`,
        fontSize: '11px', fontWeight: 700, color: rvCfg.color, fontFamily: 'var(--font-display)',
        whiteSpace: 'nowrap',
      }}>
        {rvCfg.icon}
        {rvCfg.shortLabel}
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        fontSize: '10px', fontWeight: 500, color: waCfg.color, fontFamily: 'var(--font-display)',
      }}>
        {waCfg.icon}
        {waCfg.shortLabel}
      </div>
    </div>
  );
}

// ── OnePager variant — full detail ───────────────────────────────────────────
function OnePagerVariant({ resumeValidation: rv, whatsappPrescreening: wa }: Omit<Props, 'variant'>) {
  const rvCfg  = RV_CONFIG[rv.status];
  const waCfg  = WA_CONFIG[wa.status];

  return (
    <div style={{
      border: '1px solid var(--color-border-default)',
      borderRadius: '10px',
      padding: '16px 20px',
      marginBottom: '20px',
      background: 'var(--color-surface-subtle, #fafafa)',
    }}>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '12px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted)',
        margin: '0 0 14px',
      }}>
        Progreso del prescreening
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {/* Step 1 — Resume validation */}
        <div style={{ display: 'flex', gap: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--color-border-default)' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: rvCfg.bg, border: `1.5px solid ${rvCfg.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {rvCfg.icon}
            </div>
            <div style={{ width: '1.5px', flex: 1, background: 'var(--color-border-default)', minHeight: '10px' }} />
          </div>
          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--color-text-primary)' }}>
                Revisión de hoja de vida
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '2px 8px', borderRadius: '999px',
                background: rvCfg.bg, border: `1px solid ${rvCfg.border}`,
                fontSize: '11px', fontWeight: 700, color: rvCfg.color, fontFamily: 'var(--font-display)',
              }}>
                {rvCfg.label}
              </span>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              {rv.status === 'failed' && rv.failReason ? rv.failReason : rvCfg.explanation}
            </p>
            {rv.matchedCriteria !== undefined && rv.totalCriteria !== undefined && (
              <p style={{ margin: '0 0 2px', fontSize: '11px', color: rv.status === 'failed' ? '#b91c1c' : 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {rv.status === 'failed'
                  ? `No cumple ${rv.totalCriteria - rv.matchedCriteria} de ${rv.totalCriteria} criterios no negociables`
                  : `${rv.matchedCriteria} de ${rv.totalCriteria} criterios básicos validados`}
                {rv.validatedAt ? ` · ${new Date(rv.validatedAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Step 2 — WA Prescreening */}
        <div style={{ display: 'flex', gap: '14px', paddingTop: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: wa.status === 'completed' ? '#f0fdf4' : wa.status === 'in_progress' ? '#fffbeb' : '#f9fafb',
              border: `1.5px solid ${wa.status === 'completed' ? '#86efac' : wa.status === 'in_progress' ? '#fcd34d' : '#d1d5db'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {waCfg.icon}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--color-text-primary)' }}>
                Pre-entrevista por WhatsApp
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '2px 8px', borderRadius: '999px',
                background: wa.status === 'completed' ? '#f0fdf4' : wa.status === 'in_progress' ? '#fffbeb' : '#f9fafb',
                border: `1px solid ${wa.status === 'completed' ? '#86efac' : wa.status === 'in_progress' ? '#fcd34d' : '#d1d5db'}`,
                fontSize: '11px', fontWeight: 700, color: waCfg.color, fontFamily: 'var(--font-display)',
              }}>
                {waCfg.label}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              {waCfg.explanation(rv.status)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Public component ─────────────────────────────────────────────────────────
export default function PrescreeningProgressComponent({
  resumeValidation,
  whatsappPrescreening,
  variant,
}: Props) {
  if (variant === 'table') {
    return <TableVariant resumeValidation={resumeValidation} whatsappPrescreening={whatsappPrescreening} />;
  }
  if (variant === 'card') {
    return <CardVariant resumeValidation={resumeValidation} whatsappPrescreening={whatsappPrescreening} />;
  }
  return <OnePagerVariant resumeValidation={resumeValidation} whatsappPrescreening={whatsappPrescreening} />;
}
