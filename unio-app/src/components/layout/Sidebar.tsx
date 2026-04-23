import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Filter,
  Search,
  AlignLeft,
  MessageSquare,
  CheckSquare,
  CheckCheck,
} from 'lucide-react';
import { usePipeline } from '../../context/PipelineContext';
import { useMockStageState } from '../../hooks/useMockStageState';
import { mockFinalistCards } from '../../data/mock';

/** Finalistas está habilitado — la ruta /pipeline/:jobId/finalistas apunta a Shortlist. */

interface SidebarProps {
  activeItem?: string;
}

export default function Sidebar({ activeItem }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { finalistaLocked, jobId, selectionProcessId, companyLogoUrl, companyName, progressStage } = usePipeline();
  const { getPendingCandidates } = useMockStageState();

  // For mock vacancies: Finalistas is only unlocked when there are actual finalists
  const isMockJob = jobId.startsWith('mock-');
  const mockHasFinalists = isMockJob
    ? (getPendingCandidates(jobId, 'finalistas').length > 0 || (mockFinalistCards[jobId]?.length ?? 0) > 0)
    : true;
  const finalistasLocked = finalistaLocked || (isMockJob && !mockHasFinalists);

  const PIPELINE_STAGES = ['scoring', 'prescreening', 'entrevistas', 'evaluaciones'] as const;
  const progressIdx = PIPELINE_STAGES.indexOf(progressStage as typeof PIPELINE_STAGES[number]);

  const getActiveId = (): string => {
    if (activeItem) return activeItem;
    const path = location.pathname;

    // Onepager de candidato o finalista: leer la fase desde query string ?stage=
    if (path.includes('/candidate/') || path.includes('/finalist/')) {
      const params = new URLSearchParams(location.search);
      const stage = params.get('stage');
      if (stage && ['scoring', 'prescreening', 'entrevistas', 'evaluaciones'].includes(stage)) return stage;
      if (path.includes('/finalist/')) return 'finalistas';
      return 'pipeline';
    }

    if (path === '/finalistas') return 'finalistas';
    if (path.includes('/finalistas')) return 'finalistas';
    if (path.includes('/evaluaciones')) return 'evaluaciones';
    if (path.includes('/entrevistas')) return 'entrevistas';
    if (path.includes('/prescreening')) return 'prescreening';
    if (path.includes('/scoring')) return 'scoring';
    if (path.startsWith('/pipeline/')) return 'pipeline';
    return 'vacantes';
  };

  const currentActive = getActiveId();

  const stageBase = selectionProcessId
    ? `/pipeline/${jobId}/process/${selectionProcessId}`
    : `/pipeline/${jobId}`;

  const topItems = [
    {
      id: 'vacantes',
      label: 'Tus vacantes',
      Icon: Users,
      path: '/',
      locked: false,
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      Icon: Filter,
      path: selectionProcessId ? `/pipeline/${jobId}/process/${selectionProcessId}` : `/pipeline/${jobId}`,
      locked: false,
    },
  ];

  const stageItems = [
    {
      id: 'scoring',
      label: 'Scoring IA',
      Icon: Search,
      path: `${stageBase}/scoring`,
      locked: false,                      // siempre activo: es la primera fase
    },
    {
      id: 'prescreening',
      label: 'Pre screening IA',
      Icon: AlignLeft,
      path: `${stageBase}/prescreening`,
      locked: progressIdx < 1,            // requiere haber llegado a prescreening
    },
    {
      id: 'entrevistas',
      label: 'Entrevistas',
      Icon: MessageSquare,
      path: `${stageBase}/entrevistas`,
      locked: progressIdx < 2,            // requiere haber llegado a entrevistas
    },
    {
      id: 'evaluaciones',
      label: 'Evaluaciones',
      Icon: CheckSquare,
      path: `${stageBase}/evaluaciones`,
      locked: progressIdx < 3,            // requiere haber llegado a evaluaciones
    },
    ...[{
        id: 'finalistas',
        label: 'Finalistas',
        Icon: CheckCheck,
        path: `${stageBase}/finalistas`,
        locked: finalistasLocked,          // desbloquea en entrevistas Y cuando hay finalistas
      }],
  ];

  const allItems = [...topItems, ...stageItems];

  return (
    <aside
      style={{
        width: '205px',
        minWidth: '205px',
        background: '#ffffff',
        borderRight: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px' }}>
        <img
          src={companyLogoUrl || '/logo-comfandi.webp'}
          alt={companyName || 'Comfandi'}
          style={{ maxHeight: '56px', maxWidth: '168px', width: 'auto', height: 'auto', display: 'block', objectFit: 'contain' }}
        />
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {allItems.map((item) => {
          const isActive = currentActive === item.id;
          const isLocked = item.locked;

          return (
            <button
              key={item.id}
              onClick={() => !isLocked && navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 20px',
                background: isActive ? 'var(--color-secondary-50)' : 'transparent',
                border: 'none',
                cursor: isLocked ? 'default' : 'pointer',
                textAlign: 'left',
                opacity: isLocked ? 0.4 : 1,
                color: isActive
                  ? 'var(--color-secondary-600)'
                  : 'var(--color-text-muted)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              <item.Icon
                size={16}
                style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          <span>Powered by</span>
          <img src="/logo-unio.png" alt="Unio" style={{ height: '16px', width: 'auto' }} />
        </div>
      </div>
    </aside>
  );
}
