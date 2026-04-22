import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getScoringResults } from '../api/scoring';
import { getPrescrreningResults } from '../api/prescreening';
import { mapScoringAppToCandidate, mapPrescrreningAppToCandidate } from '../api/mappers';
import type { Candidate } from '../data/mock';

type CandidateStage = 'scoring' | 'prescreening';

interface UseCandidatesResult {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
}

export function useCandidates(stage: CandidateStage, processId: string): UseCandidatesResult {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !processId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetch =
      stage === 'scoring'
        ? getScoringResults(token, processId).then((data) =>
            (data.applications ?? []).map(mapScoringAppToCandidate)
          )
        : getPrescrreningResults(token, processId).then((data) =>
            (data.results ?? []).map(mapPrescrreningAppToCandidate)
          );

    fetch
      .then((mapped) => {
        if (!cancelled) setCandidates(mapped);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar candidatos');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token, stage, processId]);

  return { candidates, loading, error };
}
