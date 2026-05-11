import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PipelineStageKey } from '../../data/mock';

export type FilterStage = PipelineStageKey | 'finalistas';

interface ValidationPipelineFilterProps {
  activeStage: PipelineStageKey;
  progressStage: PipelineStageKey;
  onStageChange: (stage: PipelineStageKey) => void;
  counts: Record<PipelineStageKey, number>;
  finalistCount?: number;
  finalistaActive?: boolean;
  finalistaLocked?: boolean;
}

interface StageConfig {
  key: PipelineStageKey;
  label: string;
  bgToken: string;
  fgToken: string;
  isAI: boolean;
}

const stages: StageConfig[] = [
  { key: 'scoring',      label: 'Scoring',       bgToken: 'var(--color-stage-1-bg)', fgToken: 'var(--color-stage-1-fg)', isAI: true  },
  { key: 'prescreening', label: 'Pre-screening',  bgToken: 'var(--color-stage-2-bg)', fgToken: 'var(--color-stage-2-fg)', isAI: true  },
  { key: 'entrevistas',  label: 'Entrevistas',    bgToken: 'var(--color-stage-3-bg)', fgToken: 'var(--color-stage-3-fg)', isAI: false },
  { key: 'evaluaciones', label: 'Pruebas',         bgToken: 'var(--color-stage-4-bg)', fgToken: 'var(--color-stage-4-fg)', isAI: false },
];

type StageStatus = 'sin_iniciar' | 'en_proceso' | 'completado';

function getStageStatus(
  stage: PipelineStageKey,
  progressStage: PipelineStageKey,
): StageStatus {
  const order: PipelineStageKey[] = ['scoring', 'prescreening', 'entrevistas', 'evaluaciones'];
  const progressIdx = order.indexOf(progressStage);
  const stageIdx    = order.indexOf(stage);
  if (stageIdx < progressIdx)  return 'completado';
  if (stageIdx === progressIdx) return 'en_proceso';
  return 'sin_iniciar';
}

const statusLabel: Record<StageStatus, string> = {
  sin_iniciar: 'Sin iniciar',
  en_proceso:  'En proceso',
  completado:  'Completado',
};

const statusIcon: Record<StageStatus, string> = {
  sin_iniciar: '/icons/lock.svg',
  en_proceso:  '/icons/pencil.svg',
  completado:  '/icons/check-circle.svg',
};

/* ─── IA chip ─────────────────────────────────────────────────────────────── */
function IAChip() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '20px',
        background: '#8750F6',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        lineHeight: 1,
      }}
    >
      <img src="/icons/sparkles.svg" alt="" width={10} height={10} style={{ filter: 'invert(1)' }} />
      IA
    </span>
  );
}

export default function ValidationPipelineFilter({
  activeStage,
  progressStage,
  onStageChange,
  counts,
  finalistCount = 5,
  finalistaActive = false,
  finalistaLocked = true,
}: ValidationPipelineFilterProps) {
  const navigate = useNavigate();
  const [finalistaHovered, setFinalistaHovered] = useState(false);

  const finalistaHighlighted = !finalistaLocked && (finalistaActive || finalistaHovered);
  const finalistaBg     = finalistaHighlighted ? '#FFE5F3' : 'var(--color-neutral-50)';
  const finalistaBorder = finalistaHighlighted ? '#990032' : 'var(--color-neutral-200)';
  const finalistaColor  = finalistaHighlighted ? '#990032' : 'var(--color-text-muted)';

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
      {/* ── Pipeline stage cards ── */}
      {stages.map((stage) => {
        const status    = getStageStatus(stage.key, progressStage);
        const isActive  = stage.key === activeStage;
        const isLocked  = status === 'sin_iniciar';

        return (
          <button
            key={stage.key}
            onClick={() => !isLocked && onStageChange(stage.key)}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '12px',
              border: isActive
                ? `2px solid ${stage.fgToken}`
                : '2px solid var(--color-neutral-200)',
              background: isActive ? stage.bgToken : 'var(--color-neutral-50)',
              cursor: isLocked ? 'default' : 'pointer',
              opacity: isLocked ? 0.45 : 1,
              pointerEvents: isLocked ? 'none' : 'auto',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              transition: 'all 0.15s ease',
              outline: 'none',
              position: 'relative',
            }}
          >
            {/* IA chip — top-right */}
            {stage.isAI && (
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <IAChip />
              </div>
            )}

            {/* Stage name */}
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '11px',
                fontWeight: 700,
                color: isActive ? stage.fgToken : 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}
            >
              {stage.label}
            </span>

            {/* Status row: icon LEFT of label */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'var(--font-display)',
                fontSize: '10px',
                fontWeight: 600,
                color: isActive ? stage.fgToken : 'var(--color-text-muted)',
                opacity: 0.85,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <img
                src={statusIcon[status]}
                alt={statusLabel[status]}
                width={12}
                height={12}
                style={{
                  opacity: isActive ? 1 : 0.5,
                  filter: isActive ? 'none' : 'grayscale(1)',
                }}
              />
              {statusLabel[status]}
            </span>

            {/* Count */}
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '32px',
                fontWeight: 800,
                lineHeight: 1,
                color: isActive ? stage.fgToken : 'var(--color-text-body)',
                marginTop: '6px',
              }}
            >
              {counts[stage.key]}
            </span>

            {/* Candidates label */}
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '11px',
                color: isActive ? stage.fgToken : 'var(--color-text-muted)',
              }}
            >
              candidatos
            </span>
          </button>
        );
      })}

      {/* ── Finalistas card ── */}
      <button
        onClick={() => !finalistaLocked && navigate('/finalistas')}
        onMouseEnter={() => !finalistaLocked && setFinalistaHovered(true)}
        onMouseLeave={() => setFinalistaHovered(false)}
        style={{
          flex: 1,
          padding: '12px 14px',
          borderRadius: '12px',
          border: `2px solid ${finalistaBorder}`,
          background: finalistaBg,
          cursor: finalistaLocked ? 'default' : 'pointer',
          opacity: finalistaLocked ? 0.45 : 1,
          pointerEvents: finalistaLocked ? 'none' : 'auto',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
      >
        {/* Stage name */}
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '11px',
            fontWeight: 700,
            color: finalistaColor,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
          }}
        >
          Finalistas
        </span>

        {/* Status row */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--font-display)',
            fontSize: '10px',
            fontWeight: 600,
            color: finalistaColor,
            opacity: 0.85,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <img
            src={finalistaLocked ? '/icons/lock.svg' : '/icons/check-circle.svg'}
            alt={finalistaLocked ? 'Sin iniciar' : 'Completado'}
            width={12}
            height={12}
            style={{ filter: 'grayscale(1)', opacity: 0.5 }}
          />
          {finalistaLocked ? 'Sin iniciar' : 'Completado'}
        </span>

        {/* Count */}
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: 800,
            lineHeight: 1,
            color: finalistaHighlighted ? '#990032' : 'var(--color-text-body)',
            marginTop: '6px',
          }}
        >
          {finalistaLocked ? '–' : finalistCount}
        </span>

        {/* Candidates label — hidden when locked */}
        {!finalistaLocked && (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '11px',
              color: finalistaColor,
            }}
          >
            candidatos
          </span>
        )}
      </button>
    </div>
  );
}
