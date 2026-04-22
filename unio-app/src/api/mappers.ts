import type { Vacante, Candidate, PipelineStageKey } from '../data/mock';
import type { Job, SelectionProcess } from '../types/dashboard';
import type { ScoringApplication } from '../types/scoring';
import type { PrescrreningApplication } from '../api/prescreening';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = [
  '#8750F6', '#F6A350', '#50B4F6', '#F65078', '#50F6A3',
  '#F6E050', '#A350F6', '#50F6D4', '#F65050', '#50F6B4',
];

function avatarColor(id: string): string {
  const n = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

// job_status values confirmed by Christian: 'Activa', 'Pausada', 'Cerrada'
function mapJobStatus(status: string): Vacante['status'] {
  const map: Record<string, Vacante['status']> = {
    Activa: 'activa',
    Pausada: 'en_pausa',
    Cerrada: 'cerrada',
  };
  return map[status] ?? 'activa';
}

// recommended_action values confirmed by Christian: 'continua', 'rechazado', 'descartado'
function mapRecommendedAction(action: string | null): 'continua' | 'pendiente' | 'rechazado' {
  if (action === 'continua') return 'continua';
  if (action === 'rechazado' || action === 'descartado') return 'rechazado';
  return 'pendiente';
}

function candidateIdToString(id: string | number): string {
  return typeof id === 'number' ? id.toString() : id;
}

// ─── mapJobToVacantes (1 fila por SelectionProcess) ──────────────────────────

function mapProcessToVacante(job: Job, process: SelectionProcess): Vacante {
  const completedPhases = process.phases?.filter((p) => {
    const l = (p.phase_status_label ?? '').toLowerCase();
    return l.includes('completado') || l.includes('finaliz');
  }).length ?? 0;
  const totalPhases = process.phases?.length ?? 1;
  const progressPct = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;

  return {
    id: process.process_id,
    jobId: job.job_id,
    processId: process.process_id,
    status: mapJobStatus(process.process_status),
    title: job.title,
    area: job.area ? [job.area] : [],
    priority: 'media',
    progressLabel: process.process_status_label ?? '',
    progressPct,
    total: job.total_job_applications ?? 0,
    activos: process.process_applications_count ?? 0,
    fecha: process.created_at ? formatDate(process.created_at) : '',
  };
}

export function mapJobToVacantes(job: Job): Vacante[] {
  const processes = job.selection_processes ?? [];
  if (processes.length === 0) {
    return [{
      id: job.job_id,
      jobId: job.job_id,
      status: mapJobStatus(job.job_status),
      title: job.title,
      area: job.area ? [job.area] : [],
      priority: 'media',
      progressLabel: '',
      progressPct: 0,
      total: job.total_job_applications ?? 0,
      activos: 0,
      fecha: '',
    }];
  }
  return processes.map((p) => mapProcessToVacante(job, p));
}

export function mapJobToVacante(job: Job): Vacante {
  return mapJobToVacantes(job)[0];
}

// ─── mapScoringAppToCandidate ─────────────────────────────────────────────────

export function mapScoringAppToCandidate(app: ScoringApplication): Candidate {
  const id = candidateIdToString(app.candidate_id);
  const name = app.candidate_context?.name ?? 'Candidato';
  const location = [app.city_residence, app.country_residence].filter(Boolean).join(', ');

  return {
    id,
    name,
    role: app.actual_role ?? '',
    sector: '',
    years: app.experience_years != null ? `${app.experience_years} Años` : '',
    location,
    bio: app.recruiter_summary ?? '',
    score: app.final_ai_score != null ? parseFloat(app.final_ai_score) : 0,
    avatarInitials: initials(name),
    avatarColor: avatarColor(id),
    photo: app.photo ?? undefined,
    hasCurrentJob: false,
    superpoder: '',
    aspiration: '',
    budget: '',
    salaryRange: 'en_rango',
    currentStage: 'scoring' as PipelineStageKey,
    scoringAI: {
      score: app.final_ai_score != null ? parseFloat(app.final_ai_score) : 0,
      status: mapRecommendedAction(app.recommended_action),
      resumen: app.recruiter_summary ?? '',
      noNegociables: [],
      logros: [],
      senales: [],
    },
  };
}

// ─── mapPrescrreningAppToCandidate ────────────────────────────────────────────

export function mapPrescrreningAppToCandidate(app: PrescrreningApplication): Candidate {
  const id = candidateIdToString(app.candidate_id);
  const name = [app.first_name, app.last_name].filter(Boolean).join(' ') || 'Candidato';
  const score = app.final_ai_score != null && app.final_ai_score !== '' ? parseFloat(app.final_ai_score) : 0;
  const isInProgress = app.prescreening_status === 'IN_PROGRESS' || score === 0;

  return {
    id,
    name,
    role: app.prescreening_status ?? '',
    sector: '',
    years: app.duration != null ? `${app.duration} min` : '',
    location: app.email ?? '',
    bio: isInProgress && !app.summary ? 'Análisis de IA en proceso...' : (app.summary ?? ''),
    score,
    avatarInitials: initials(name),
    avatarColor: avatarColor(id),
    photo: app.photo ?? undefined,
    hasCurrentJob: false,
    superpoder: '',
    aspiration: '',
    budget: '',
    salaryRange: 'en_rango',
    currentStage: 'prescreening' as PipelineStageKey,
    scoringAI: {
      score: 0,
      status: 'pendiente',
      resumen: '',
      noNegociables: [],
      logros: [],
      senales: [],
    },
    prescreeningAI: {
      score,
      status: mapRecommendedAction(app.recommended_action),
      resumen: app.summary ?? '',
      noNegociables: (app.evaluation_context?.items ?? []).map((item) => ({
        label: item.criterio,
        score: item.puntuacion,
        evidencia: item.evidencia,
      })),
      plusDetectados: app.top_strengths ?? [],
      senales: app.signals_to_validate ?? [],
    },
  };
}
