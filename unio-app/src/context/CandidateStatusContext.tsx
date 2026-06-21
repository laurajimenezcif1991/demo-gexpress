import { createContext, useContext, useState, type ReactNode } from 'react';

export type CandidateStatus = 'continua' | 'por_validar' | 'descartado';

interface CandidateStatusContextValue {
  statuses: Map<string, CandidateStatus>;
  setStatus: (id: string, stage: string, status: CandidateStatus) => void;
  setStatuses: (ids: string[], stage: string, status: CandidateStatus) => void;
  getStatus: (id: string, stage: string) => CandidateStatus | undefined;
  /** Bulk-seed initial statuses from a record keyed by candidateId → status. Single state update. */
  seedStatuses: (record: Record<string, string>, stage: string) => void;
}

const CandidateStatusContext = createContext<CandidateStatusContextValue | null>(null);

function key(id: string, stage: string) {
  return `${id}:${stage}`;
}

export function CandidateStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatusesState] = useState<Map<string, CandidateStatus>>(new Map());

  const setStatus = (id: string, stage: string, status: CandidateStatus) => {
    setStatusesState((prev) => new Map(prev).set(key(id, stage), status));
  };

  const setStatuses = (ids: string[], stage: string, status: CandidateStatus) => {
    setStatusesState((prev) => {
      const next = new Map(prev);
      ids.forEach((id) => next.set(key(id, stage), status));
      return next;
    });
  };

  const seedStatuses = (record: Record<string, string>, stage: string) => {
    setStatusesState((prev) => {
      const next = new Map(prev);
      Object.entries(record).forEach(([id, status]) => {
        const k = key(id, stage);
        if (!prev.has(k)) {
          next.set(k, status as CandidateStatus);
        }
      });
      return next;
    });
  };

  const getStatus = (id: string, stage: string): CandidateStatus | undefined => {
    return statuses.get(key(id, stage));
  };

  return (
    <CandidateStatusContext.Provider value={{ statuses, setStatus, setStatuses, getStatus, seedStatuses }}>
      {children}
    </CandidateStatusContext.Provider>
  );
}

export function useCandidateStatus() {
  const ctx = useContext(CandidateStatusContext);
  if (!ctx) throw new Error('useCandidateStatus must be used within CandidateStatusProvider');
  return ctx;
}
