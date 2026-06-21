import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserCheck,
  Pencil,
  Lock,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Skeleton, SkeletonCircle } from '../components/ui/Skeleton';
import { getPipelineStages, getMockPipelineStages, mockFinalistCards, MOCK_DESCRIPTIONS, type PipelineStage } from '../data/mock';
import { useMockStageState } from '../hooks/useMockStageState';
import { usePipeline } from '../context/PipelineContext';
import { useVacantes } from '../hooks/useVacantes';
import type { Phase } from '../types/dashboard';

const stageColors: Record<string, { bg: string; fg: string }> = {
  scoring: { bg: 'var(--color-stage-1-bg)', fg: 'var(--color-stage-1-fg)' },
  prescreening: { bg: 'var(--color-stage-2-bg)', fg: 'var(--color-stage-2-fg)' },
  entrevistas: { bg: 'var(--color-stage-3-bg)', fg: 'var(--color-stage-3-fg)' },
  evaluaciones: { bg: 'var(--color-stage-4-bg)', fg: 'var(--color-stage-4-fg)' },
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
  scoring:      { label: 'Scoring IA',        stageBadge: 'Scoring' },
  prescreening: { label: 'Prescreening IA',   stageBadge: 'Prescreening' },
  entrevistas:  { label: 'Entrevistas',       stageBadge: 'Entrevistas' },
  evaluaciones: { label: 'Pruebas',           stageBadge: 'Pruebas' },
  finalistas:   { label: 'Aprobados',         stageBadge: 'Aprobados' },
  estudios:     { label: 'Validaciones',      stageBadge: 'Validaciones' },
};

function mapPhaseStatus(label?: string): 'completed' | 'in_progress' | 'not_started' {
  if (!label) return 'not_started';
  const l = label.toLowerCase();
  if (l.includes('completado') || l.includes('finaliz')) return 'completed';
  if (l.includes('proceso') || l.includes('progreso')) return 'in_progress';
  return 'not_started';
}

const STAGE_ORDER = ['scoring', 'prescreening', 'entrevistas', 'evaluaciones', 'finalistas', 'estudios'];

// Normalize API phase type keys to internal stage IDs
function normalizePhaseType(raw: string): string {
  const s = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s_-]/g, '');
  if (s.includes('prescreening') || s.includes('preseleccion') || s.includes('preentrevista')) return 'prescreening';
  if (s.includes('scoring') || s.includes('puntuacion') || s.includes('analisis')) return 'scoring';
  if (s.includes('entrevista')) return 'entrevistas';
  if (s.includes('evaluacion')) return 'evaluaciones';
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

  // Render all stages except scoring (merged into prescreening) and estudios (appended separately)
  return STAGE_ORDER
    .filter((id) => id !== 'scoring' && id !== 'estudios')
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

function StageCard({ stage }: { stage: PipelineStage }) {
  const navigate = useNavigate();
  const colors = stageColors[stage.id] || stageColors.scoring;
  const isCompleted = stage.status === 'completed';
  const isInProgress = stage.status === 'in_progress';
  const isNotStarted = stage.status === 'not_started' && !stage.forceEnabled;

  const statusDotColor = isCompleted
    ? 'var(--color-positive-500)'
    : isInProgress
    ? 'var(--color-warning-500)'
    : 'var(--color-neutral-400)';

  const statusText = isCompleted ? 'Completado' : isInProgress ? 'En proceso' : 'Sin iniciar';

  const Icon = isNotStarted ? Lock : isCompleted ? UserCheck : Pencil;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        opacity: isNotStarted ? 0.55 : 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: '220px',
      }}
    >
      {/* Top row: icon + AI badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: isNotStarted ? 'var(--color-surface-muted)' : colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isNotStarted ? 'var(--color-text-muted)' : colors.fg,
          }}
        >
          <Icon size={20} />
        </div>
        {stage.isAI && !isNotStarted && (
          <Badge variant="ai" small>
            ✦ IA
          </Badge>
        )}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: statusDotColor,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {statusText}
        </span>
      </div>

      {/* Stage badge — always visible */}
      <div style={{ display: 'flex' }}>
        <Badge variant={stageBadgeVariants[stage.id] ?? 'default'}>
          {stage.stageBadge}
        </Badge>
      </div>

      {/* Candidate count — always visible */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
        }}
      >
        <Users size={14} />
        {stage.candidateCount} candidatos
      </div>

      {/* Action button */}
      <div style={{ marginTop: 'auto' }}>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          disabled={isNotStarted}
          onClick={() => !isNotStarted && navigate(stage.route)}
        >
          {isNotStarted ? (
            <>
              <Lock size={14} />
              Bloqueado
            </>
          ) : (
            <>
              Ver resultados
              <ChevronRight size={14} />
            </>
          )}
        </Button>
      </div>
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
      forceEnabled: !finalistaLocked,
    };

    if (jobId.startsWith('mock-')) {
      const base = mergeScoring(getMockPipelineStages(jobId));
      // Lock Finalistas card if no finalists exist yet
      const hasFinalists =
        getPendingCandidates(jobId, 'finalistas').length > 0 ||
        (mockFinalistCards[jobId]?.length ?? 0) > 0;
      const withFinalistas = base.map((s) =>
        s.id === 'finalistas' && !hasFinalists
          ? { ...s, status: 'not_started' as const }
          : s,
      );
      return [...withFinalistas, estudiosCard];
    }
    if (selectionProcess?.phases) {
      return [...mapPhasesToStages(selectionProcess.phases, jobId, processId ?? ''), estudiosCard];
    }
    return [
      ...mergeScoring(
        getPipelineStages(jobId).map((s) => ({
          ...s,
          route: processId ? `/pipeline/${jobId}/process/${processId}/${s.id}` : s.route,
        })),
      ),
      estudiosCard,
    ];
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
          maxWidth: '1200px',
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
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                lineHeight: '1.7',
                maxWidth: '600px',
              }}
            >
              {jobDescription ?? 'Sin descripción disponible.'}
            </p>
            <Button variant="ghost" size="sm" style={{ flexShrink: 0 }}>
              Ver RCP Completo
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>

        {/* Pipeline grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
          }}
        >
          {loading && (
            <>
              {Array.from({ length: 3 }).map((_, col) => (
                <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Column header skeleton */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Skeleton width={32} height={32} borderRadius={8} />
                      <Skeleton width={120} height={16} />
                    </div>
                    <Skeleton width={28} height={22} borderRadius={20} />
                  </div>
                  {/* Card skeletons */}
                  {Array.from({ length: col === 0 ? 4 : col === 1 ? 3 : 2 }).map((_, j) => (
                    <div key={j} style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <SkeletonCircle size={36} />
                        <div style={{ flex: 1 }}>
                          <Skeleton height={13} width="70%" style={{ marginBottom: '6px' }} />
                          <Skeleton height={11} width="45%" />
                        </div>
                        <Skeleton width={36} height={28} borderRadius={20} />
                      </div>
                      <Skeleton height={6} width="100%" borderRadius={3} />
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
          {!loading && stages.map((stage) => (
            <StageCard key={stage.id} stage={stage} />
          ))}
        </div>
      </main>
    </div>
  );
}
