import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { getPipelineStages, getMockPipelineStages, mockFinalistCards, MOCK_DESCRIPTIONS, type PipelineStage } from '../data/mock';
import { useMockStageState } from '../hooks/useMockStageState';
import { usePipeline } from '../context/PipelineContext';
import { useVacantes } from '../hooks/useVacantes';
import type { Phase } from '../types/dashboard';

const stageColors: Record<string, { bg: string; fg: string }> = {
  scoring: { bg: 'var(--color-stage-1-bg)', fg: 'var(--color-stage-1-fg)' },
  prescreening: { bg: 'var(--color-stage-2-bg)', fg: 'var(--color-stage-2-fg)' },
  prueba_manejo: { bg: '#E8F5E9', fg: '#2E7D32' },
  evaluaciones: { bg: 'var(--color-stage-3-bg)', fg: 'var(--color-stage-3-fg)' },
  entrevistas: { bg: 'var(--color-stage-4-bg)', fg: 'var(--color-stage-4-fg)' },
  finalistas: { bg: '#FFE5F2', fg: '#990032' },
  estudios: { bg: 'var(--color-surface-muted)', fg: 'var(--color-text-muted)' },
};

const stageBadgeVariants: Record<string, 'scoring' | 'prescreening' | 'entrevistas' | 'evaluaciones' | 'finalistas'> = {
  scoring: 'scoring',
  prescreening: 'prescreening',
  entrevistas: 'entrevistas',
  evaluaciones: 'evaluaciones',
  finalistas: 'finalistas',
};

const AI_STAGES = new Set(['scoring', 'prescreening']);

const STAGE_META: Record<string, { label: string; stageBadge: string }> = {
  scoring:       { label: 'Scoring IA',          stageBadge: 'Scoring' },
  prescreening:  { label: 'Prescreening IA',     stageBadge: 'Prescreening' },
  prueba_manejo: { label: 'Prueba de manejo',    stageBadge: 'Prueba manejo' },
  evaluaciones:  { label: 'Prueba Psicotécnica', stageBadge: 'Psicotécnica' },
  entrevistas:   { label: 'Entrevista',          stageBadge: 'Entrevista' },
  finalistas:    { label: 'Aprobados',           stageBadge: 'Aprobados' },
  estudios:      { label: 'Validaciones',        stageBadge: 'Validaciones' },
};

function mapPhaseStatus(label?: string): 'completed' | 'in_progress' | 'not_started' {
  if (!label) return 'not_started';
  const l = label.toLowerCase();
  if (l.includes('completado') || l.includes('finaliz')) return 'completed';
  if (l.includes('proceso') || l.includes('progreso')) return 'in_progress';
  return 'not_started';
}

const STAGE_ORDER = ['scoring', 'prescreening', 'prueba_manejo', 'evaluaciones', 'entrevistas', 'estudios', 'finalistas'];

// Normalize API phase type keys to internal stage IDs
function normalizePhaseType(raw: string): string {
  const s = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s_-]/g, '');
  if (s.includes('prescreening') || s.includes('preseleccion') || s.includes('preentrevista')) return 'prescreening';
  if (s.includes('scoring') || s.includes('puntuacion') || s.includes('analisis')) return 'scoring';
  if (s.includes('pruebamanejo') || s.includes('manejo')) return 'prueba_manejo';
  if (s.includes('evaluacion') || s.includes('psicotecnica') || s.includes('psicologica')) return 'evaluaciones';
  if (s.includes('entrevista')) return 'entrevistas';
  if (s.includes('finalista')) return 'finalistas';
  return s;
}

// Merges the scoring card into prescreening (summing candidateCounts) and removes
// scoring as a visible card. STAGE_ORDER keeps 'scoring' for internal logic only.
function mergeScoring(stages: PipelineStage[]): PipelineStage[] {
  const scoringCount = stages.find((s) => s.id === 'scoring')?.candidateCount ?? 0;
  return stages
    .map((s) => {
      if (s.id === 'prescreening') {
        return {
          ...s,
          label: STAGE_META.prescreening.label,
          stageBadge: STAGE_META.prescreening.stageBadge,
          candidateCount: s.candidateCount + scoringCount,
        };
      }
      return s;
    })
    .filter((s) => s.id !== 'scoring');
}

function mapPhasesToStages(phases: Phase[], jobId: string, processId: string): PipelineStage[] {
  // Build a map of phases from the API using normalized keys
  const phaseMap = new Map(
    phases.map((p) => [normalizePhaseType(p.process_phase_type), p])
  );

  const scoringCount = phaseMap.get('scoring')?.phase_candidates_count ?? 0;

  // Render all stages except scoring (merged into prescreening), estudios and finalistas (appended separately)
  return STAGE_ORDER
    .filter((id) => id !== 'scoring' && id !== 'estudios' && id !== 'finalistas')
    .map((id) => {
      const phase = phaseMap.get(id);
      const meta = STAGE_META[id];
      const candidateCount =
        (phase?.phase_candidates_count ?? 0) + (id === 'prescreening' ? scoringCount : 0);
      return {
        id,
        label: meta.label,
        stageBadge: meta.stageBadge,
        status: mapPhaseStatus(phase?.phase_status_label),
        candidateCount,
        isAI: AI_STAGES.has(id),
        route: `/pipeline/${jobId}/process/${processId}/${id}`,
      };
    });
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function FunnelRow({
  stage,
  maxCount,
  convPct,
  idx,
}: {
  stage: PipelineStage;
  maxCount: number;
  convPct: number | null;
  idx: number;
}) {
  const navigate = useNavigate();
  const isNotStarted = stage.status === 'not_started' && !stage.forceEnabled;
  const barPct = maxCount > 0 ? Math.max((stage.candidateCount / maxCount) * 100, 0.5) : 0.5;
  const colors = stageColors[stage.id] || stageColors.scoring;

  const statusDotColor =
    stage.status === 'completed'
      ? 'var(--color-positive-500)'
      : stage.status === 'in_progress'
      ? 'var(--color-warning-500)'
      : 'var(--color-neutral-300)';

  return (
    <div
      onClick={() => !isNotStarted && navigate(stage.route)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        cursor: isNotStarted ? 'default' : 'pointer',
        opacity: isNotStarted ? 0.45 : 1,
        transition: 'background 0.15s ease',
        animation: `fadeSlideRight 0.35s ease ${idx * 60}ms both`,
      }}
      onMouseEnter={(e) => {
        if (!isNotStarted) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-subtle)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      {/* Status dot */}
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: statusDotColor,
          flexShrink: 0,
        }}
      />

      {/* Stage label */}
      <div
        style={{
          width: '148px',
          flexShrink: 0,
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: 'var(--color-text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {stage.label}
        {stage.isAI && (
          <Badge variant="ai" small>✦ IA</Badge>
        )}
        {isNotStarted && <Lock size={11} color="var(--color-text-muted)" />}
      </div>

      {/* Bar track */}
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
            width: `${barPct}%`,
            background: isNotStarted ? 'var(--color-neutral-200)' : colors.fg,
            borderRadius: '9999px',
            transition: 'width 0.45s ease',
          }}
        />
      </div>

      {/* Count + conversion */}
      <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '180px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {stage.candidateCount.toLocaleString('es-CO')}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {convPct !== null
            ? idx === 0
              ? '100% · inicio del funnel'
              : `${convPct}% conversión`
            : '—'}
        </div>
      </div>

      {/* Arrow */}
      {!isNotStarted && (
        <ChevronRight size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
      )}
    </div>
  );
}

export default function Pipeline() {
  const navigate = useNavigate();
  const { jobId = '', processId } = useParams<{ jobId: string; processId?: string }>();
  const { setJobId, setSelectionProcessId, setProgressStage, finalistaLocked } = usePipeline();
  const { getMockProgressStage, getPendingCandidates } = useMockStageState();
  const { vacantes, rawJobs, loading } = useVacantes();

  useEffect(() => {
    if (jobId) setJobId(jobId);
  }, [jobId, setJobId]);

  useEffect(() => {
    if (processId) setSelectionProcessId(processId);
  }, [processId, setSelectionProcessId]);

  // Find real job and process from API data
  const rawJob = rawJobs.find((j) => j.job_id === jobId);
  const selectionProcess = rawJob?.selection_processes?.find((p) => p.process_id === processId);

  // Find vacante (id = processId now) for fallback title; also match mock- jobIds directly
  const vacante = vacantes.find((v) => v.id === processId)
    ?? vacantes.find((v) => v.jobId === jobId)
    ?? vacantes.find((v) => v.id === jobId);

  // Build stages — memoized so reference is stable and doesn't cause effect loops
  const stages = useMemo((): PipelineStage[] => {
    const stageBase = processId
      ? `/pipeline/${jobId}/process/${processId}`
      : `/pipeline/${jobId}`;

    const estudiosCard: PipelineStage = {
      id: 'estudios',
      label: STAGE_META.estudios.label,
      stageBadge: STAGE_META.estudios.stageBadge,
      status: 'not_started',
      candidateCount: 0,
      isAI: false,
      route: `${stageBase}/estudios`,
      forceEnabled: true,
    };

    if (jobId.startsWith('mock-')) {
      const base = mergeScoring(getMockPipelineStages(jobId));
      // estudios and finalistas are extracted from base (so their counts come from getMockPipelineStages)
      const withoutEstudiosAndFinalistas = base.filter((s) => s.id !== 'estudios' && s.id !== 'finalistas');
      const estudiosBase = base.find((s) => s.id === 'estudios');
      const finalistasBase = base.find((s) => s.id === 'finalistas');

      const estudiosCardFinal: PipelineStage = {
        id: 'estudios',
        label: STAGE_META.estudios.label,
        stageBadge: STAGE_META.estudios.stageBadge,
        status: estudiosBase?.status ?? 'not_started',
        candidateCount: estudiosBase?.candidateCount ?? 0,
        isAI: false,
        route: `${stageBase}/estudios`,
        forceEnabled: true,
      };

      const hasFinalists =
        getPendingCandidates(jobId, 'finalistas').length > 0 ||
        (mockFinalistCards[jobId]?.length ?? 0) > 0 ||
        (finalistasBase?.candidateCount ?? 0) > 0;
      const finalistasCard: PipelineStage = {
        ...(finalistasBase ?? {
          id: 'finalistas',
          label: STAGE_META.finalistas.label,
          stageBadge: STAGE_META.finalistas.stageBadge,
          status: 'not_started' as const,
          candidateCount: 0,
          isAI: false,
          route: `${stageBase}/finalistas`,
        }),
        status: hasFinalists ? (finalistasBase?.status ?? 'in_progress') : 'not_started',
        forceEnabled: true,
      };
      return [...withoutEstudiosAndFinalistas, estudiosCardFinal, finalistasCard];
    }
    if (selectionProcess?.phases) {
      const mapped = mapPhasesToStages(selectionProcess.phases, jobId, processId ?? '');
      const withoutFinalistas = mapped.filter((s) => s.id !== 'finalistas');
      const finalistasPhase = mapped.find((s) => s.id === 'finalistas');
      const finalistasCard: PipelineStage = finalistasPhase ?? {
        id: 'finalistas',
        label: STAGE_META.finalistas.label,
        stageBadge: STAGE_META.finalistas.stageBadge,
        status: 'not_started',
        candidateCount: 0,
        isAI: false,
        route: `${stageBase}/finalistas`,
        forceEnabled: true,
      };
      return [...withoutFinalistas, estudiosCard, finalistasCard];
    }
    const base = mergeScoring(
      getPipelineStages(jobId).map((s) => ({
        ...s,
        route: processId ? `/pipeline/${jobId}/process/${processId}/${s.id}` : s.route,
      })),
    );
    const withoutFinalistas = base.filter((s) => s.id !== 'finalistas');
    const finalistasBase = base.find((s) => s.id === 'finalistas');
    const finalistasCard: PipelineStage = finalistasBase ?? {
      id: 'finalistas',
      label: STAGE_META.finalistas.label,
      stageBadge: STAGE_META.finalistas.stageBadge,
      status: 'not_started',
      candidateCount: 0,
      isAI: false,
      route: `${stageBase}/finalistas`,
      forceEnabled: true,
    };
    return [...withoutFinalistas, estudiosCard, finalistasCard];
  }, [jobId, processId, selectionProcess, finalistaLocked]);

  // Derive progressStage from the highest active/completed phase and sync to context
  useEffect(() => {
    const ORDER = ['scoring', 'prescreening', 'entrevistas', 'evaluaciones'] as const;
    if (jobId.startsWith('mock-')) {
      // Use localStorage state (user may have advanced stages) or fall back to defaults
      const stored = getMockProgressStage(jobId);
      setProgressStage(stored as any);
      return;
    }
    let highestIdx = -1;
    stages.forEach((s) => {
      const idx = ORDER.indexOf(s.id as typeof ORDER[number]);
      if (idx > highestIdx && (s.status === 'completed' || s.status === 'in_progress')) {
        highestIdx = idx;
      }
    });
    if (highestIdx >= 0) setProgressStage(ORDER[highestIdx]);
  }, [stages, jobId, setProgressStage, getMockProgressStage]);

  // Header data
  const jobTitle = rawJob?.title ?? vacante?.title ?? 'Vacante';
  const location = [rawJob?.location_city, rawJob?.location_country].filter(Boolean).join(', ') || null;
  const startDate = selectionProcess?.created_at ? formatDate(selectionProcess.created_at) : null;
  const totalCandidates = selectionProcess?.process_applications_count ?? rawJob?.total_job_applications ?? null;
  const jobDescription = rawJob?.mission ?? (jobId.startsWith('mock-') ? MOCK_DESCRIPTIONS[jobId] : null) ?? null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
      <Sidebar />

      <main
        style={{
          marginLeft: '205px',
          flex: 1,
          padding: '40px',
                maxWidth: '1400px',
        }}
      >
        {/* Back */}
        <button
          onClick={() => navigate('/')}
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
            marginBottom: '24px',
          }}
        >
          <ArrowLeft size={16} />
          Tus vacantes
        </button>

        {/* Job header */}
        <div style={{ marginBottom: '32px' }}>
            {loading ? (
              <Skeleton height={36} width={280} borderRadius={8} />
            ) : (
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '36px',
                  color: 'var(--color-brand-primary)',
                  margin: '0 0 16px',
                }}
              >
                {jobTitle}
              </h1>
            )}

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '15px',
                color: 'var(--color-text-primary)',
              }}
            >
              Descripción del rol
            </span>
            {location && (
              <Badge variant="default" small>
                <MapPin size={12} />
                {location}
              </Badge>
            )}
            {startDate && (
              <Badge variant="default" small>
                <Calendar size={12} />
                Iniciado el {startDate}
              </Badge>
            )}
            {totalCandidates != null && (
              <Badge variant="default" small>
                <Users size={12} />
                {totalCandidates} candidatos
              </Badge>
            )}
          </div>

          {/* Description */}
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              lineHeight: '1.7',
            }}
          >
            {jobDescription ?? 'Sin descripción disponible.'}
          </p>
        </div>

        {/* Funnel de candidatos */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
          }}
        >
          {/* Section title */}
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--color-text-primary)',
              marginBottom: '4px',
            }}
          >
            Funnel de candidatos
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
            Haz click en una etapa para ver los candidatos
          </div>

          {/* Skeleton */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 16px' }}>
                  <Skeleton width={8} height={8} borderRadius={4} />
                  <Skeleton width={148} height={14} />
                  <div style={{ flex: 1 }}>
                    <Skeleton height={28} borderRadius={9999} />
                  </div>
                  <Skeleton width={100} height={32} />
                </div>
              ))}
            </div>
          )}

          {/* Funnel rows */}
          {!loading && (() => {
            const maxCount = Math.max(...stages.map((s) => s.candidateCount), 1);
            return stages.map((stage, idx) => {
              const prev = stages[idx - 1];
              const convPct =
                idx === 0
                  ? 100
                  : prev && prev.candidateCount > 0
                  ? Math.round((stage.candidateCount / prev.candidateCount) * 100)
                  : null;
              return (
                <FunnelRow
                  key={stage.id}
                  stage={stage}
                  maxCount={maxCount}
                  convPct={convPct}
                  idx={idx}
                />
              );
            });
          })()}
        </div>
      </main>
    </div>
  );
}
