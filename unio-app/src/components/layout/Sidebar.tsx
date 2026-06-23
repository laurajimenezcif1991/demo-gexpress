import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Filter,
  AlignLeft,
  MessageSquare,
  CheckSquare,
  CheckCheck,
  ClipboardCheck,
  RotateCcw,
  Car,
  BrainCircuit,
} from 'lucide-react';
import { usePipeline } from '../../context/PipelineContext';
import { useMockStageState } from '../../hooks/useMockStageState';
import { mockFinalistCards } from '../../data/mock';
import { assetUrl } from '../../utils/assets';

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

  const PIPELINE_STAGES = ['scoring', 'prescreening', 'prueba_manejo', 'evaluaciones', 'entrevistas'] as const;
  const progressIdx = PIPELINE_STAGES.indexOf(progressStage as typeof PIPELINE_STAGES[number]);

  const getActiveId = (): string => {
    if (activeItem) return activeItem;
    const path = location.pathname;

    // Onepager de candidato o finalista: leer la fase desde query string ?stage=
    if (path.includes('/candidate/') || path.includes('/finalist/')) {
      const params = new URLSearchParams(location.search);
      const stage = params.get('stage');
      if (stage && ['scoring', 'prescreening', 'prueba_manejo', 'evaluaciones', 'entrevistas', 'estudios', 'finalistas'].includes(stage)) return stage;
      if (path.includes('/finalist/')) return 'finalistas';
      return 'pipeline';
    }

    if (path.includes('/estudios')) return 'estudios';
    if (path === '/finalistas') return 'finalistas';
    if (path.includes('/finalistas')) return 'finalistas';
    if (path.includes('/prueba_manejo')) return 'prueba_manejo';
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
      id: 'prescreening',
      label: 'Prescreening IA',
      Icon: AlignLeft,
      path: `${stageBase}/prescreening`,
      locked: false,
    },
    {
      id: 'prueba_manejo',
      label: 'Prueba de manejo',
      Icon: Car,
      path: `${stageBase}/prueba_manejo`,
      locked: false,
    },
    {
      id: 'evaluaciones',
      label: 'Prueba Psicotécnica',
      Icon: BrainCircuit,
      path: `${stageBase}/evaluaciones`,
      locked: false,
    },
    {
      id: 'entrevistas',
      label: 'Entrevista',
      Icon: MessageSquare,
      path: `${stageBase}/entrevistas`,
      locked: false,
    },
    {
      id: 'estudios',
      label: 'Validaciones',
      Icon: ClipboardCheck,
      path: `${stageBase}/estudios`,
      locked: false,
    },
    {
      id: 'finalistas',
      label: 'Aprobados',
      Icon: CheckCheck,
      path: `${stageBase}/finalistas`,
      locked: false,
    },
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
          src={companyLogoUrl || assetUrl('/logo-demo-transportes.png')}
          alt={companyName || 'Demo Transportes'}
          style={{ maxHeight: '110px', maxWidth: '300px', width: 'auto', height: 'auto', display: 'block', objectFit: 'contain' }}
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
          padding: '12px 20px 16px',
          borderTop: '1px solid var(--color-border-default)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Reset demo button */}
        <button
          title="Reiniciar demo (limpia el progreso guardado)"
          onClick={() => {
            const toRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && (k.startsWith('unio') || k.startsWith('hm_eval_') || k.startsWith('prueba_'))) {
                toRemove.push(k);
              }
            }
            toRemove.forEach((k) => localStorage.removeItem(k));
            window.location.href = import.meta.env.BASE_URL;
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: '100%',
            padding: '6px 8px',
            background: 'transparent',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-subtle)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-default)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
          }}
        >
          <RotateCcw size={12} />
          <span>Reiniciar demo</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          <span>Powered by</span>
          <img src={assetUrl('/logo-unio.png')} alt="Unio" style={{ height: '16px', width: 'auto' }} />
        </div>
      </div>
    </aside>
  );
}
