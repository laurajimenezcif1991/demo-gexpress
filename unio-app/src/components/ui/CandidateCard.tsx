import { type Candidate, type PipelineStageKey } from '../../data/mock';
import { type CandidateStatus } from '../../context/CandidateStatusContext';
import Avatar from './Avatar';
import { getScoreColors } from './ScorePill';
import Badge from './Badge';
import { useState } from 'react';
import { MapPin, Clock, HelpCircle, CheckCircle2, XCircle, CheckCheck, AlertTriangle, Circle, FileText, Send, FolderCheck, Eye, EyeOff, CalendarDays, Check } from 'lucide-react';

const VEREDICTO_CONFIG = {
  apto:          { label: 'Apto',                icon: <CheckCheck size={12} />,     color: '#15803d', bg: '#dcfce7', border: '#86efac' },
  apto_reservas: { label: 'Apto con reservas',   icon: <AlertTriangle size={12} />,  color: '#92400e', bg: '#fef3c7', border: '#fcd34d' },
  no_apto:       { label: 'No apto',             icon: <XCircle size={12} />,        color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
} as const;

type StatusConfig = {
  icon: React.ReactNode;
  text: string;
  color: string;
};

const statusConfig: Record<string, StatusConfig> = {
  continua: {
    icon: <CheckCircle2 size={13} />,
    text: 'Continúa',
    color: 'var(--color-positive-600)',
  },
  por_validar: {
    icon: <HelpCircle size={13} />,
    text: 'Por validar',
    color: 'var(--color-warning-600)',
  },
  descartado: {
    icon: <XCircle size={13} />,
    text: 'Descartado',
    color: 'var(--color-negative-600)',
  },
};

const stageLabelMap: Record<PipelineStageKey, string> = {
  scoring:      'Scoring',
  prescreening: 'Pre-screening',
  prueba_manejo:'Prueba manejo',
  evaluaciones: 'Pruebas',
  entrevistas:  'Entrevistas',
  estudios:     'Validaciones',
  finalistas:   'Aprobados',
};

const MANEJO_RESULT_CONFIG = {
  apto:          { label: 'Apto',               color: '#15803d', bg: '#dcfce7', border: '#86efac' },
  apto_reservas: { label: 'Apto con reservas',  color: '#92400e', bg: '#fef3c7', border: '#fcd34d' },
  no_apto:       { label: 'No apto',            color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
} as const;

type DocsStatus = 'sin_solicitar' | 'solicitado' | 'recibido';

const DOCS_CONFIG: Record<DocsStatus, { label: string; sublabel: string; color: string; icon: React.ReactNode; steps: number }> = {
  sin_solicitar: { label: 'Sin solicitar',       sublabel: 'Documentos no solicitados',    color: '#9ca3af', icon: <FileText size={12} />,   steps: 0 },
  solicitado:    { label: 'En progreso',          sublabel: 'Docs solicitados · Pendiente', color: '#d97706', icon: <Send size={12} />,        steps: 1 },
  recibido:      { label: 'Docs recibidos',       sublabel: 'Documentación completa',       color: '#15803d', icon: <FolderCheck size={12} />, steps: 2 },
};

function getDocsStatus(id: string): DocsStatus {
  const n = parseInt(id.replace(/\D/g, '') || '0', 10);
  const states: DocsStatus[] = ['sin_solicitar', 'solicitado', 'recibido'];
  return states[n % 3];
}

function getManejoResult(score: number): keyof typeof MANEJO_RESULT_CONFIG {
  if (score >= 78) return 'apto';
  if (score >= 45) return 'apto_reservas';
  return 'no_apto';
}

function getValidacionesProgress(id: string): { medico: boolean; seguridad: boolean } {
  const n = parseInt(id.replace(/\D/g, '') || '0', 10);
  return {
    medico:    n % 5 !== 0,
    seguridad: n % 3 === 0,
  };
}

function formatAppliedDate(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day   = String(date.getDate()).padStart(2, '0');
  const year  = String(date.getFullYear()).slice(2);
  return `${month} ${day} /${year}`;
}

interface CandidateCardProps {
  candidate: Candidate;
  statusLabel?: CandidateStatus;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: () => void;
  showStageChip?: boolean;
  isPending?: boolean;
  viewStage?: PipelineStageKey;
  appliedDate?: Date;
  isVisited?: boolean;
}

const GRADIENT = 'linear-gradient(115deg, #9A7CF7, #FDD83F, #F05899, #3DAC56, #00ADFE)';
const gradientBorderBg = (innerColor: string) =>
  `linear-gradient(${innerColor}, ${innerColor}) padding-box, ${GRADIENT} border-box`;

export default function CandidateCard({ candidate, statusLabel, selected, onSelect, onClick, showStageChip = true, isPending = false, viewStage, appliedDate, isVisited, isContratado = false }: CandidateCardProps & { isContratado?: boolean }) {
  const { bg: scoreBg, fg: scoreFg } = getScoreColors(candidate.score);
  // Show "--" when WA prescreening is not yet completed (prescreening stage) or AI interview not done
  const _prescStage = viewStage ?? candidate.currentStage;
  const _waIncomplete = _prescStage === 'prescreening'
    && candidate.prescreeningProgress?.whatsappPrescreening.status !== 'completed';
  const isNoRealizada = candidate.prescreeningAI?.status === 'no_realizada' || _waIncomplete;
  const [hovered, setHovered] = useState(false);
  const showGradient = hovered || !!selected;
  const innerBg = selected ? 'var(--color-secondary-50)' : '#ffffff';

  const currentStatus = statusLabel ? statusConfig[statusLabel] : null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '16px 20px',
        background: showGradient ? gradientBorderBg(innerBg) : innerBg,
        border: showGradient ? '2px solid transparent' : '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border 0.15s ease',
        marginBottom: '8px',
      }}
    >
      {/* Checkbox */}
      <div
        onClick={(e) => { e.stopPropagation(); onSelect?.(candidate.id); }}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '5px',
          border: selected ? '2px solid var(--color-brand-accent)' : '1.5px solid var(--color-neutral-300)',
          background: selected ? 'var(--color-brand-accent)' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          marginTop: '2px',
          transition: 'all 0.15s ease',
        }}
      >
        {selected && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Avatar */}
      {candidate.photo ? (
        <img
          src={candidate.photo}
          alt={candidate.name}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid var(--color-border-default)',
          }}
        />
      ) : (
        <Avatar initials={candidate.avatarInitials} color={candidate.avatarColor} size={48} />
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Pending chip — shown for newly advanced candidates, not in finalistas */}
        {isPending && (viewStage ?? candidate.currentStage) !== 'finalistas' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '5px',
              color: '#888',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              background: '#F2F2F2',
              borderRadius: '20px',
              padding: '2px 10px',
            }}
          >
            <Clock size={12} />
            <span>Pendiente</span>
          </div>
        )}

        {/* Status label — only shown when explicitly discarded */}
        {!isPending && currentStatus && statusLabel === 'descartado' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '5px',
              color: currentStatus.color,
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
            }}
          >
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
          </div>
        )}

        {/* Name + location inline + stage badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '15px',
              color: 'var(--color-text-primary)',
            }}
          >
            {candidate.name}
          </span>
          {candidate.location && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--color-text-muted)',
              }}
            >
              <MapPin size={11} />
              {candidate.location}
            </span>
          )}
          {/* Prescreening: HV validation badge + WA status icon inline with location */}
          {(viewStage ?? candidate.currentStage) === 'prescreening' && candidate.prescreeningProgress && (() => {
            const rv = candidate.prescreeningProgress.resumeValidation;
            const wa = candidate.prescreeningProgress.whatsappPrescreening;
            const rvLabel = rv.status === 'passed' ? 'HV Cumple' : rv.status === 'failed' ? 'HV No cumple' : 'HV en validación';
            const rvColor = rv.status === 'passed' ? '#15803d' : rv.status === 'failed' ? '#b91c1c' : '#d97706';
            const rvBg    = rv.status === 'passed' ? '#f0fdf4'  : rv.status === 'failed' ? '#fef2f2'  : '#fffbeb';
            const rvBorder= rv.status === 'passed' ? '#86efac'  : rv.status === 'failed' ? '#fca5a5'  : '#fcd34d';
            const rvIcon  = rv.status === 'passed' ? <CheckCircle2 size={10} /> : rv.status === 'failed' ? <XCircle size={10} /> : <Clock size={10} />;
            const waColor = wa.status === 'completed' ? '#15803d' : '#9ca3af';
            const waIcon  = wa.status === 'completed' ? <CheckCheck size={12} color={waColor} /> : <Check size={12} color={waColor} />;
            return (
              <>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  fontSize: '11px', fontWeight: 700, color: rvColor,
                  background: rvBg, border: `1px solid ${rvBorder}`,
                  borderRadius: '20px', padding: '2px 8px',
                  fontFamily: 'var(--font-display)',
                }}>
                  {rvIcon}
                  {rvLabel}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {waIcon}
                </span>
              </>
            );
          })()}
          {(viewStage ?? candidate.currentStage) === 'prueba_manejo' && (() => {
            const key = getManejoResult(candidate.score);
            const m = MANEJO_RESULT_CONFIG[key];
            return (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 700,
                color: m.color, background: m.bg,
                border: `1px solid ${m.border}`,
                borderRadius: '20px', padding: '2px 9px',
                fontFamily: 'var(--font-display)',
              }}>
                {m.label}
              </span>
            );
          })()}
          {candidate.veredictoEntrevista && (viewStage ?? candidate.currentStage) === 'entrevistas' && (() => {
            const v = VEREDICTO_CONFIG[candidate.veredictoEntrevista];
            return (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 700,
                color: v.color, background: v.bg,
                border: `1px solid ${v.border}`,
                borderRadius: '20px', padding: '2px 9px',
                fontFamily: 'var(--font-display)',
              }}>
                {v.icon}
                {v.label}
              </span>
            );
          })()}
          {showStageChip && (
            <Badge variant={candidate.currentStage} small>
              {stageLabelMap[candidate.currentStage]}
            </Badge>
          )}
        </div>

        {/* Compact info line */}
        {(candidate.sector || candidate.years) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '4px',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {candidate.sector && <span>{candidate.sector}</span>}
            {candidate.sector && candidate.years && <span style={{ opacity: 0.4 }}>·</span>}
            {candidate.years && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Clock size={11} />
                {candidate.years}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            lineHeight: '1.5',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {candidate.bio}
        </p>

        {/* Meta row: fecha de aplicación + estado revisión */}
        {(appliedDate !== undefined || isVisited !== undefined) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {appliedDate !== undefined && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-display)', fontWeight: 500,
              }}>
                <CalendarDays size={11} />
                Aplicación: {formatAppliedDate(appliedDate)}
              </span>
            )}
            {isVisited !== undefined && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color:      isVisited ? '#15803d' : '#6b7280',
                background: isVisited ? '#dcfce7'  : '#f3f4f6',
                border:     `1px solid ${isVisited ? '#86efac' : '#e5e7eb'}`,
                borderRadius: '20px', padding: '1px 8px',
              }}>
                {isVisited ? <Eye size={10} /> : <EyeOff size={10} />}
                {isVisited ? 'Revisado' : 'Sin revisar'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right-side widget: docs tracker for finalistas, validaciones for estudios, score otherwise */}
      {(viewStage ?? candidate.currentStage) === 'finalistas' ? (() => {
        if (isContratado) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0, minWidth: '110px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: '999px',
                background: '#dcfce7', border: '1.5px solid #86efac',
              }}>
                <CheckCircle2 size={13} color="#15803d" />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: '#15803d' }}>
                  Contratado
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                Proceso completado
              </span>
            </div>
          );
        }
        const status = getDocsStatus(candidate.id);
        const cfg = DOCS_CONFIG[status];
        const STEP_LABELS = ['Solicitar', 'En progreso', 'Recibido'];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0, minWidth: '110px' }}>
            {/* Mini stepper */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {STEP_LABELS.map((_, i) => {
                const filled = i <= cfg.steps;
                const isLast = i === STEP_LABELS.length - 1;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: filled ? cfg.color : '#e5e7eb',
                      border: `1.5px solid ${filled ? cfg.color : '#d1d5db'}`,
                    }} />
                    {!isLast && (
                      <div style={{
                        width: '18px', height: '1.5px',
                        background: i < cfg.steps ? cfg.color : '#e5e7eb',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Status label */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', fontWeight: 700,
              color: cfg.color, fontFamily: 'var(--font-display)',
            }}>
              {cfg.icon}
              {cfg.label}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'right', lineHeight: 1.3 }}>
              {cfg.sublabel}
            </span>
          </div>
        );
      })() : (viewStage ?? candidate.currentStage) === 'estudios' ? (() => {
        const { medico, seguridad } = getValidacionesProgress(candidate.id);
        const done = [medico, seguridad].filter(Boolean).length;
        const VALIDACION_STEPS = ['Médico', 'Seguridad'];
        const stepsColor = done === 2 ? '#15803d' : done === 1 ? '#d97706' : '#9ca3af';
        const statusLabel = done === 2 ? 'Validaciones completas' : done === 1 ? 'En progreso' : 'Sin iniciar';
        const statusSublabel = done === 2 ? 'Médico y seguridad OK' : done === 1 ? 'Resultados médicos OK' : 'Validaciones no iniciadas';
        const statusIcon = done === 2 ? <FolderCheck size={12} /> : done === 1 ? <Send size={12} /> : <FileText size={12} />;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0, minWidth: '110px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {VALIDACION_STEPS.map((_, i) => {
                const filled = i < done;
                const isLast = i === VALIDACION_STEPS.length - 1;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: filled ? stepsColor : '#e5e7eb',
                      border: `1.5px solid ${filled ? stepsColor : '#d1d5db'}`,
                    }} />
                    {!isLast && (
                      <div style={{
                        width: '18px', height: '1.5px',
                        background: done === 2 ? stepsColor : '#e5e7eb',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', fontWeight: 700,
              color: stepsColor, fontFamily: 'var(--font-display)',
            }}>
              {statusIcon}
              {statusLabel}
            </div>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textAlign: 'right', lineHeight: 1.3 }}>
              {statusSublabel}
            </span>
          </div>
        );
      })() : (viewStage ?? candidate.currentStage) !== 'entrevistas' || !candidate.veredictoEntrevista ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total</span>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: isNoRealizada ? 'var(--color-surface-muted)' : scoreBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: isNoRealizada ? '22px' : '18px',
              color: isNoRealizada ? 'var(--color-text-muted)' : scoreFg,
            }}
          >
            {isNoRealizada ? '—' : candidate.score}
          </div>
        </div>
      ) : null}
    </div>
  );
}
