import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PipelineStageKey } from '../data/mock';
import { assetUrl } from '../utils/assets';

interface PipelineContextValue {
  activeStage: PipelineStageKey;
  setActiveStage: (stage: PipelineStageKey) => void;
  progressStage: PipelineStageKey;
  setProgressStage: (stage: PipelineStageKey) => void;
  finalistaLocked: boolean;
  jobId: string;
  setJobId: (id: string) => void;
  selectionProcessId: string;
  setSelectionProcessId: (id: string) => void;
  companyLogoUrl: string;
  setCompanyLogoUrl: (url: string) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
}

const PipelineContext = createContext<PipelineContextValue>({
  activeStage: 'scoring',
  setActiveStage: () => {},
  progressStage: 'scoring',
  setProgressStage: () => {},
  finalistaLocked: true,
  jobId: 'v1',
  setJobId: () => {},
  selectionProcessId: '',
  setSelectionProcessId: () => {},
  companyLogoUrl: assetUrl('/logo-gcexpress.png'),
  setCompanyLogoUrl: () => {},
  companyName: '',
  setCompanyName: () => {},
});

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [activeStage, setActiveStage] = useState<PipelineStageKey>('scoring');
  const [progressStage, setProgressStage] = useState<PipelineStageKey>('scoring');
  const [jobId, setJobId] = useState<string>('v1');
  const [selectionProcessId, setSelectionProcessId] = useState<string>('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>(assetUrl('/logo-gcexpress.png'));
  const [companyName, setCompanyName] = useState<string>('');

  // Finalistas unlocks when Entrevistas or any later stage is the progress stage
  const finalistaLocked = !(['entrevistas', 'evaluaciones', 'prueba_conocimiento', 'estudios', 'finalistas'] as PipelineStageKey[]).includes(progressStage);

  return (
    <PipelineContext.Provider value={{ activeStage, setActiveStage, progressStage, setProgressStage, finalistaLocked, jobId, setJobId, selectionProcessId, setSelectionProcessId, companyLogoUrl, setCompanyLogoUrl, companyName, setCompanyName }}>
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline() {
  return useContext(PipelineContext);
}
