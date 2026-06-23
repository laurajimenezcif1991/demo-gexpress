import { useState, useCallback } from 'react';
import type { PipelineStageKey } from '../data/mock';

export type MockStageKey = PipelineStageKey | 'finalistas';

const STORAGE_KEY = 'unio-mock-stage';
// Bump this whenever pre-seeded mock candidates change, to clear stale localStorage.
const STORAGE_VERSION = 'v10';

const STAGE_ORDER: MockStageKey[] = [
  'scoring',
  'prescreening',
  'prueba_manejo',
  'evaluaciones',
  'entrevistas',
  'estudios',
  'finalistas',
];

/**
 * Default unlocked stage for each mock vacancy.
 * Represents the highest stage that was pre-populated with data.
 */
export const DEFAULT_MOCK_PROGRESS: Record<string, MockStageKey> = {
  'mock-recep':    'scoring',
  'mock-bodega':   'prescreening',
  'mock-th':       'entrevistas',
  'mock-finanzas': 'evaluaciones',
  'mock-ventas':   'evaluaciones',
  // Comfandi vacancies — default unlocked stage
  'mock-comf-gca': 'evaluaciones',
  'mock-comf-gcv': 'evaluaciones',
  'mock-comf-cb':  'evaluaciones',
  // Demo Transportes — Transporte & Logística
  'mock-transp-pub': 'estudios',
  'mock-vigia':      'estudios',
  'mock-distrib':    'estudios',
};

interface MockStageData {
  [jobId: string]: {
    progressStage: MockStageKey;
    /** Candidates advanced INTO this stage from the previous one (status: "pendiente") */
    pendingCandidates: Partial<Record<MockStageKey, string[]>>;
    /** Candidates passed OUT of this stage to the next one (should no longer appear here) */
    passedCandidates: Partial<Record<MockStageKey, string[]>>;
  };
}

function loadFromStorage(): MockStageData {
  try {
    // If the stored version doesn't match, discard stale state so pre-seeded
    // candidates always appear correctly after a mock data update.
    const storedVersion = localStorage.getItem(`${STORAGE_KEY}-version`);
    if (storedVersion !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(`${STORAGE_KEY}-version`, STORAGE_VERSION);
      return {};
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockStageData) : {};
  } catch {
    return {};
  }
}

function saveToStorage(data: MockStageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(`${STORAGE_KEY}-version`, STORAGE_VERSION);
  } catch {
    // storage full or unavailable
  }
}

export function useMockStageState() {
  const [data, setData] = useState<MockStageData>(loadFromStorage);

  /**
   * Advance candidateIds FROM fromStage TO the next stage.
   * Returns the destination stage key, or null if already at the last stage.
   */
  const advanceCandidates = useCallback(
    (jobId: string, fromStage: MockStageKey, candidateIds: string[]): MockStageKey | null => {
      const fromIdx = STAGE_ORDER.indexOf(fromStage);
      if (fromIdx === -1 || fromIdx >= STAGE_ORDER.length - 1) return null;
      const toStage = STAGE_ORDER[fromIdx + 1];

      setData((prev) => {
        const defaultProgress = DEFAULT_MOCK_PROGRESS[jobId] ?? 'scoring';
        const cur = prev[jobId] ?? { progressStage: defaultProgress as MockStageKey, pendingCandidates: {}, passedCandidates: {} };

        // Add to pending list of destination stage
        const existingPending = cur.pendingCandidates[toStage] ?? [];
        const mergedPending = [...new Set([...existingPending, ...candidateIds])];

        // Record as "passed out" of the source stage so they're hidden there
        const existingPassed = cur.passedCandidates?.[fromStage] ?? [];
        const mergedPassed = [...new Set([...existingPassed, ...candidateIds])];

        // If these candidates were previously passed OUT of toStage (from a prior session),
        // remove them from that list so they become visible again in the destination stage
        const prevPassedOutOfDest = cur.passedCandidates?.[toStage] ?? [];
        const newPassedOutOfDest = prevPassedOutOfDest.filter((id) => !candidateIds.includes(id));

        const toIdx = STAGE_ORDER.indexOf(toStage);
        const currProgressIdx = STAGE_ORDER.indexOf(cur.progressStage);
        const newProgress: MockStageKey = toIdx > currProgressIdx ? toStage : cur.progressStage;

        const next: MockStageData = {
          ...prev,
          [jobId]: {
            progressStage: newProgress,
            pendingCandidates: { ...cur.pendingCandidates, [toStage]: mergedPending },
            passedCandidates: { ...(cur.passedCandidates ?? {}), [fromStage]: mergedPassed, [toStage]: newPassedOutOfDest },
          },
        };
        saveToStorage(next);
        return next;
      });

      return toStage;
    },
    [],
  );

  /** IDs of candidates advanced INTO a specific stage (they are "pending" there). */
  const getPendingCandidates = useCallback(
    (jobId: string, stage: MockStageKey): string[] =>
      data[jobId]?.pendingCandidates[stage] ?? [],
    [data],
  );

  /** IDs of candidates already passed OUT of a stage (hide them from that stage's list). */
  const getPassedCandidates = useCallback(
    (jobId: string, stage: MockStageKey): string[] =>
      data[jobId]?.passedCandidates?.[stage] ?? [],
    [data],
  );

  /** Highest unlocked stage for a mock vacancy.
   *  Always returns the FURTHEST stage between what's stored in localStorage
   *  and DEFAULT_MOCK_PROGRESS, so updating defaults automatically upgrades
   *  stale localStorage state without requiring a manual reset. */
  const getMockProgressStage = useCallback(
    (jobId: string): MockStageKey => {
      const stored = data[jobId]?.progressStage;
      const defaultStage = (DEFAULT_MOCK_PROGRESS[jobId] ?? 'scoring') as MockStageKey;
      if (!stored) return defaultStage;
      const storedIdx  = STAGE_ORDER.indexOf(stored);
      const defaultIdx = STAGE_ORDER.indexOf(defaultStage);
      return storedIdx >= defaultIdx ? stored : defaultStage;
    },
    [data],
  );

  /** Whether a specific candidate is pending (just advanced) in a given stage. */
  const isCandidatePending = useCallback(
    (jobId: string, stage: MockStageKey, candidateId: string): boolean =>
      (data[jobId]?.pendingCandidates[stage] ?? []).includes(candidateId),
    [data],
  );

  return { advanceCandidates, getPendingCandidates, getPassedCandidates, getMockProgressStage, isCandidatePending };
}
