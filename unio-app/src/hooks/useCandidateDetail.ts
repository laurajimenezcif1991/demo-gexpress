import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCandidateOnePage } from '../api/onePage';
import type { Candidate, PipelineStageKey } from '../data/mock';
import { mockCandidatesById, mockTechFeedback } from '../data/mock';
import type { OnePageResponse } from '../types/onePage';

interface UseCandidateDetailResult {
  candidate: Candidate | null;
  loading: boolean;
  error: string | null;
}

function mapOnePageToCandidate(data: OnePageResponse, candidateId: string): Candidate {
  const { candidate_section: cs, application_section: as_, prescreening_section: ps } = data;
  const name = [cs.identity.first_name, cs.identity.last_name].filter(Boolean).join(' ');

  // Score may come as decimal (0.72) or whole number (72) — normalize to 0–100
  function parseScore(raw: string | null | undefined): number {
    if (raw == null || raw === '') return 0;
    const n = parseFloat(raw);
    if (isNaN(n)) return 0;
    return n <= 1 ? Math.round(n * 100) : Math.round(n);
  }

  const score = parseScore(as_.ai_analysis.final_score);

  const mapAction = (action: string | null): 'continua' | 'pendiente' | 'rechazado' => {
    if (action === 'continua') return 'continua';
    if (action === 'rechazado' || action === 'descartado') return 'rechazado';
    return 'pendiente';
  };

  const currentStage: PipelineStageKey = ps ? 'prescreening' : 'scoring';

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  // Defensive prescreening parsing: handle both nested (ai_analysis/content)
  // and flat structures in case the API shape differs from the type definition
  function parsePrescreening(ps: NonNullable<OnePageResponse['prescreening_section']>) {
    const flat = ps as unknown as Record<string, unknown>;
    const ai = (ps.ai_analysis ?? flat) as Record<string, unknown>;
    const contentBlock = (ps.content ?? flat) as Record<string, unknown>;
    const evalCtx = (
      (contentBlock['evaluation_context'] as Record<string, unknown> | undefined) ??
      (flat['evaluation_context'] as Record<string, unknown> | undefined) ??
      {}
    ) as { items?: Array<{ criterio: string; evidencia: string; puntuacion: number }> };

    const rawScore = (ai['score'] ?? ai['final_ai_score'] ?? flat['final_ai_score'] ?? flat['score']) as string | null | undefined;
    const summary  = (ai['summary'] ?? ai['recruiter_summary'] ?? flat['summary'] ?? '') as string;
    const action   = (ai['recommended_action'] ?? flat['recommended_action']) as string | null;
    const strengths  = ((ai['top_strengths']       ?? flat['top_strengths'])       as string[] | null) ?? [];
    const signals    = ((ai['signals_to_validate'] ?? flat['signals_to_validate']) as string[] | null) ?? [];
    const items      = evalCtx.items ?? [];

    return {
      score: parseScore(rawScore ?? null),
      status: mapAction(action),
      resumen: summary,
      noNegociables: items.map((item) => ({
        label: item.criterio,
        score: item.puntuacion,
        evidencia: item.evidencia,
      })),
      plusDetectados: strengths,
      senales: signals,
    };
  }

  return {
    id: candidateId,
    name,
    role: cs.professional_details.actual_role ?? '',
    sector: cs.professional_details.experience_sector ?? '',
    years: '',
    location: [cs.contact.city, cs.contact.country].filter(Boolean).join(', '),
    bio: as_.ai_analysis.recruiter_summary ?? '',
    score,
    avatarInitials: initials,
    avatarColor: '#8750F6',
    photo: cs.identity.photo || undefined,
    hasCurrentJob: cs.professional_details.employment_status === 'employed',
    superpoder: cs.external_links?.super_power ?? '',
    aspiration: cs.professional_details.salary_expectation ?? '',
    budget: '',
    salaryRange: 'en_rango',
    currentStage,
    scoringAI: {
      score,
      status: mapAction(as_.ai_analysis.recommended_action),
      resumen: as_.ai_analysis.recruiter_summary ?? '',
      noNegociables: (as_.evaluation_details?.evaluation?.rcp_must_haves ?? []).map((label) => ({
        label,
        cumple: true,
      })),
      logros: as_.ai_analysis.top_strengths ?? [],
      senales: as_.ai_analysis.signals_to_validate ?? [],
    },
    ...(ps && { prescreeningAI: parsePrescreening(ps) }),
  };
}

export function useCandidateDetail(candidateId: string): UseCandidateDetailResult {
  const { token } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock candidates are served locally — no API call needed
    const mockCandidate = mockCandidatesById[candidateId];
    if (mockCandidate) {
      setCandidate(mockCandidate);
      setLoading(false);
      setError(null);
      // Pre-seed tech test localStorage for mock candidates that completed Prueba Técnica
      const techFeedback = mockTechFeedback[candidateId];
      if (techFeedback) {
        const key = `unio_tech_feedback_${candidateId}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(techFeedback));
        }
      }
      return;
    }

    if (!token || !candidateId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getCandidateOnePage(token, candidateId)
      .then((data) => {
        if (!cancelled) setCandidate(mapOnePageToCandidate(data, candidateId));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar candidato');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, candidateId]);

  return { candidate, loading, error };
}
