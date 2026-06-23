import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Search, ArrowUpDown, CheckCircle2, X, Users, Trophy, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import WizardBar from '../components/layout/WizardBar';
import { Skeleton, SkeletonCircle } from '../components/ui/Skeleton';
import Toast from '../components/layout/Toast';
import CandidateCard from '../components/ui/CandidateCard';
import Button from '../components/ui/Button';
import { useCandidateStatus } from '../context/CandidateStatusContext';
import { usePipeline } from '../context/PipelineContext';
import { useCandidates } from '../hooks/useCandidates';
import { useVacantes } from '../hooks/useVacantes';
import { mockCandidatesByStage, mockCandidatesById, MOCK_INITIAL_STATUSES } from '../data/mock';
import { useMockStageState } from '../hooks/useMockStageState';
import WhatsAppPreEntrevistaModal, { WaIcon } from '../components/ui/WhatsAppPreEntrevistaModal';
import WhatsAppAgendarEntrevistaModal from '../components/ui/WhatsAppAgendarEntrevistaModal';
import WhatsAppDocumentosModal from '../components/ui/WhatsAppDocumentosModal';
import ConfirmAprobadosModal from '../components/ui/ConfirmAprobadosModal';
import { useWaPrescreening } from '../context/WaPrescreeningContext';

type FilterTab = 'todos' | 'high' | 'mid' | 'low';

const filterConfig = [
  { id: 'todos' as FilterTab, label: 'Todos' },
  { id: 'high' as FilterTab, label: 'Por encima de 80%' },
  { id: 'mid' as FilterTab, label: 'Medio 40-79%' },
  { id: 'low' as FilterTab, label: 'Bajo 50%' },
];


export default function CandidateList() {
  const { jobId = 'v1', processId, stage = 'scoring' } = useParams<{ jobId: string; processId?: string; stage?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { setStatuses, getStatus, seedStatuses } = useCandidateStatus();

  const STAGE_ORDER = ['scoring', 'prescreening', 'prueba_manejo', 'evaluaciones', 'entrevistas', 'estudios', 'finalistas'] as const;

  const priorStages = (stage: string) => {
    const idx = STAGE_ORDER.indexOf(stage as typeof STAGE_ORDER[number]);
    return idx > 0 ? STAGE_ORDER.slice(0, idx) : [];
  };

  const isEliminatedBefore = (candidateId: string, stage: string) =>
    priorStages(stage).some((s) => getStatus(candidateId, s) === 'descartado');
  const { setJobId, setSelectionProcessId, progressStage, setProgressStage } = usePipeline();
  const { advanceCandidates, getPendingCandidates, getPassedCandidates, getMockProgressStage } = useMockStageState();
  const { markCompleted: markWaCompleted } = useWaPrescreening();
  const { vacantes } = useVacantes();
  const vacante = vacantes.find((v) => v.id === jobId);

  // Derive stage from pathname — must be declared before any effect that uses it
  const currentStage = (() => {
    const path = location.pathname;
    if (path.includes('/prescreening')) return 'prescreening';
    if (path.includes('/prueba_manejo')) return 'prueba_manejo';
    if (path.includes('/evaluaciones')) return 'evaluaciones';
    if (path.includes('/entrevistas')) return 'entrevistas';
    if (path.includes('/estudios')) return 'estudios';
    if (path.includes('/finalistas')) return 'finalistas';
    return stage;
  })() as 'scoring' | 'prescreening' | 'prueba_manejo' | 'evaluaciones' | 'entrevistas' | 'estudios' | 'finalistas';

  useEffect(() => {
    setJobId(jobId);
  }, [jobId, setJobId]);

  useEffect(() => {
    if (processId) setSelectionProcessId(processId);
  }, [processId, setSelectionProcessId]);

  // For mock flows, use local mock data instead of API results
  const isMock = jobId.startsWith('mock-');

  // Seed pre-defined statuses for mock vacancies (runs once per stage/vacancy change)
  useEffect(() => {
    if (!isMock) return;
    const stageRecord = MOCK_INITIAL_STATUSES[jobId]?.[currentStage];
    if (stageRecord) seedStatuses(stageRecord, currentStage);
  }, [jobId, currentStage, isMock]); // eslint-disable-line react-hooks/exhaustive-deps

  // Advance progressStage when navigating to a later stage — never go backwards.
  // Also seed from DEFAULT_MOCK_PROGRESS on first load so pre-seeded demo vacancies
  // unlock the correct sidebar stages without requiring any navigation.
  useEffect(() => {
    const order = ['scoring', 'prescreening', 'entrevistas', 'evaluaciones'] as const;
    const progIdx = order.indexOf(progressStage as typeof order[number]);

    // Seed from persisted mock progress (handles DEFAULT_MOCK_PROGRESS + localStorage state)
    const mockProgress = isMock ? getMockProgressStage(jobId) : null;
    const mockIdx = mockProgress ? order.indexOf(mockProgress as typeof order[number]) : -1;

    const curIdx  = order.indexOf(currentStage as typeof order[number]);
    const maxIdx  = Math.max(curIdx, mockIdx);

    if (maxIdx > progIdx) {
      setProgressStage(order[maxIdx] as 'scoring' | 'prescreening' | 'entrevistas' | 'evaluaciones');
    }
  }, [currentStage, progressStage, setProgressStage, jobId, isMock, getMockProgressStage]);

  // Fetch candidates from API when processId exists and stage is scoring/prescreening
  const apiStage = (currentStage === 'scoring' || currentStage === 'prescreening') ? currentStage : 'scoring';
  const { candidates: apiCandidates, loading, error } = useCandidates(
    apiStage,
    processId ?? ''
  );

  // Candidates advanced INTO the current stage (show as "Pendiente" at top)
  const pendingIds = isMock ? getPendingCandidates(jobId, currentStage) : [];
  // Candidates already passed OUT of the current stage (hide them from this view)
  const passedOutIds = isMock ? getPassedCandidates(jobId, currentStage) : [];
  const passedOutSet = new Set(passedOutIds);

  // Only show pending candidates that haven't been further advanced
  const visiblePendingIds = pendingIds.filter((id) => !passedOutSet.has(id));
  const pendingSet = new Set(visiblePendingIds);
  const pendingCandidates = visiblePendingIds.map((id) => mockCandidatesById[id]).filter(Boolean);

  const baseCandidates = isMock
    ? (mockCandidatesByStage[jobId]?.[currentStage] ?? []).filter((c) => !passedOutSet.has(c.id))
    : apiCandidates;
  // Pending candidates appear at the top of the list
  const candidates = isMock
    ? [...pendingCandidates, ...baseCandidates.filter((c) => !pendingSet.has(c.id))]
    : baseCandidates;

  const candidatesLoading = isMock ? false : loading;
  const candidatesError = isMock ? null : error;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterTab>('todos');
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modals for finalist selection (evaluaciones stage)
  const [fewFinalistsModal, setFewFinalistsModal] = useState(false);
  const [manyFinalistsModal, setManyFinalistsModal] = useState(false);

  // WhatsApp pre-entrevista modal
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waCandidates, setWaCandidates] = useState<typeof candidates>([]);

  // WhatsApp agendar entrevista modal
  const [waAgendarOpen, setWaAgendarOpen] = useState(false);
  const [waAgendarCandidates, setWaAgendarCandidates] = useState<typeof candidates>([]);
  const [waDoctosOpen, setWaDoctosOpen] = useState(false);
  const [waDoctosCandidates, setWaDoctosCandidates] = useState<typeof candidates>([]);

  // Confirm approval modal (estudios → finalistas)
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);

  const statusPriority = (id: string) => {
    const s = getStatus(id, currentStage);
    return s === undefined || s === 'por_validar' ? 0 : 1;
  };

  const filteredCandidates = useMemo(() => {
    let list = candidates
      .filter((c) => !isEliminatedBefore(c.id, currentStage));

    if (search) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.sector.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (filter) {
      case 'high':
        list = list.filter((c) => c.score >= 80);
        break;
      case 'mid':
        list = list.filter((c) => c.score >= 40 && c.score < 80);
        break;
      case 'low':
        list = list.filter((c) => c.score < 50);
        break;
    }

    return [...list].sort((a, b) => {
      const pDiff = statusPriority(a.id) - statusPriority(b.id);
      if (pDiff !== 0) return pDiff;
      return sortDir === 'desc' ? b.score - a.score : a.score - b.score;
    });
  }, [candidates, currentStage, filter, search, sortDir, getStatus]);

  const filterCounts = useMemo(() => ({
    todos: candidates.length,
    high: candidates.filter((c) => c.score >= 80).length,
    mid: candidates.filter((c) => c.score >= 40 && c.score < 80).length,
    low: candidates.filter((c) => c.score < 50).length,
  }), [candidates]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      // Hard limit: max 3 when advancing from evaluaciones to finalistas
      if (isMock && currentStage === 'evaluaciones' && next.size >= 3) {
        setManyFinalistsModal(true);
        return;
      }
      next.add(id);
    }
    setSelected(next);
  };

  const handleBulkAction = (action: 'pasar' | 'descartar') => {
    const ids = Array.from(selected);
    if (action === 'pasar') {
      if (isMock) {
        // Validate 3-5 range when advancing from evaluaciones to finalistas
        if (currentStage === 'evaluaciones') {
          if (ids.length < 3) {
            setFewFinalistsModal(true);
            return;
          }
          if (ids.length > 3) {
            setManyFinalistsModal(true);
            return;
          }
        }
        const nextStage = advanceCandidates(jobId, currentStage, ids);
        if (nextStage) {
          setProgressStage(nextStage as Parameters<typeof setProgressStage>[0]);
          // Navigate to the next stage list automatically
          const base = processId ? `/pipeline/${jobId}/process/${processId}` : `/pipeline/${jobId}`;
          setToastMessage(`${ids.length} candidato${ids.length !== 1 ? 's' : ''} avanzado${ids.length !== 1 ? 's' : ''} a ${nextStage === 'finalistas' ? 'Aprobados' : 'la siguiente fase'}`);
          setToastVisible(true);
          setSelected(new Set());
          if (nextStage === 'finalistas') {
            setTimeout(() => navigate(`${base}/finalistas`), 1200);
          } else {
            setTimeout(() => navigate(`${base}/${nextStage}`), 1200);
          }
          return;
        }
      } else {
        setStatuses(ids, currentStage, 'continua');
        setToastMessage(`${ids.length} candidato${ids.length !== 1 ? 's' : ''} marcado${ids.length !== 1 ? 's' : ''} como Continúa`);
      }
    } else {
      setStatuses(ids, currentStage, 'descartado');
      setToastMessage(`${ids.length} candidato${ids.length !== 1 ? 's' : ''} descartado${ids.length !== 1 ? 's' : ''}`);
    }
    setToastVisible(true);
    setSelected(new Set());
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "transparent" }}>
      <Sidebar />

      <main
        style={{
          marginLeft: '205px',
          flex: 1,
          padding: '40px',
          paddingBottom: selected.size > 0 ? '110px' : '40px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '32px',
              color: 'var(--color-brand-primary)',
              margin: '0 0 6px',
            }}
          >
            {vacante ? `Perfiles de ${vacante.title}` : 'Perfiles'}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {filteredCandidates.length} candidatos analizados y ranqueados por IA &middot; Ordenados por puntuaci&oacute;n general
          </p>
        </div>

        {/* Filters + Search row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filterConfig.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  height: '28px',
                  borderRadius: '20px',
                  border: filter === f.id
                    ? 'none'
                    : '1px solid var(--color-brand-accent)',
                  background: filter === f.id ? 'var(--color-brand-accent)' : '#f7f7f8',
                  color: filter === f.id ? '#ffffff' : 'var(--color-brand-accent)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {f.label}
                {f.id !== 'todos' && (
                  <span
                    style={{
                      background: filter === f.id ? 'rgba(255,255,255,0.25)' : 'rgba(135,80,246,0.12)',
                      color: filter === f.id ? '#ffffff' : 'var(--color-brand-accent)',
                      borderRadius: '10px',
                      padding: '0 5px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {filterCounts[f.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort + Search */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setSortDir((d) => d === 'desc' ? 'asc' : 'desc')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-surface-subtle)';
                e.currentTarget.style.borderColor = 'var(--color-neutral-400)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 14px',
                height: '40px',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <ArrowUpDown size={14} />
              {sortDir === 'desc'
                ? 'Puntuaci\u00f3n: mayor a menor'
                : 'Puntuaci\u00f3n: menor a mayor'}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-placeholder)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar candidato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              height: '44px',
              padding: '0 16px 0 40px',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              width: '320px',
              outline: 'none',
            }}
          />
        </div>

        {/* Candidate cards */}
        <div>
          {candidatesLoading && (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#ffffff',
                  }}
                >
                  <SkeletonCircle size={44} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    <Skeleton height={14} width="58%" />
                    <Skeleton height={11} width="38%" />
                  </div>
                  <Skeleton width={56} height={22} borderRadius={20} />
                </div>
              ))}
            </>
          )}
          {candidatesError && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-negative-600)', fontSize: '14px' }}>
              {candidatesError}
            </div>
          )}
          {!candidatesLoading && !candidatesError && filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              statusLabel={pendingSet.has(candidate.id) ? undefined : getStatus(candidate.id, currentStage)}
              isPending={pendingSet.has(candidate.id)}
              selected={selected.has(candidate.id)}
              onSelect={toggleSelect}
              showStageChip={false}
              onClick={() => {
                const base = processId
                  ? `/pipeline/${jobId}/process/${processId}/candidate/${candidate.id}`
                  : `/pipeline/${jobId}/candidate/${candidate.id}`;
                navigate(`${base}?stage=${currentStage}`);
              }}
            />
          ))}

          {/* Empty state for estudios/Validaciones */}
          {!candidatesLoading && !candidatesError && filteredCandidates.length === 0 && currentStage === 'estudios' && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '80px 32px', gap: '16px', textAlign: 'center',
              background: 'linear-gradient(135deg, #f8f5ff 0%, #fdf0ff 50%, #f0f8ff 100%)',
              borderRadius: 'var(--radius-lg)', margin: '16px',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--color-secondary-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px',
                color: 'var(--color-brand-primary)', margin: 0,
              }}>
                Aún no hay candidatos en Validaciones
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0, maxWidth: '400px', lineHeight: 1.6 }}>
                Aprueba candidatos desde la etapa de <strong>Entrevista</strong> para iniciar el proceso de validaciones (examen médico y estudio de seguridad).
              </p>
              <button
                onClick={() => {
                  const base = processId ? `/pipeline/${jobId}/process/${processId}` : `/pipeline/${jobId}`;
                  navigate(`${base}/entrevistas`);
                }}
                style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-brand-accent)',
                  background: 'transparent', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 600,
                  fontSize: '14px', color: 'var(--color-brand-accent)',
                }}
              >
                Ir a Entrevista
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Wizard bar */}
      <WizardBar visible={selected.size > 0}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {currentStage === 'estudios'
              ? 'Inicia el proceso de contratación con estos candidatos'
              : 'Mueve estos perfiles a la siguiente fase de evaluación'}
          </span>
          <span
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--color-brand-primary)',
            }}
          >
            {selected.size} candidato{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Pre-entrevista WhatsApp: solo en etapa scoring */}
          {currentStage === 'scoring' && (
            <button
              onClick={() => {
                const ids = Array.from(selected);
                const sel = filteredCandidates.filter(c => selected.has(c.id));
                // Avanzar candidatos a Pre-screening IA y desbloquear etapa en sidebar
                if (isMock) {
                  const nextStage = advanceCandidates(jobId, 'scoring', ids);
                  if (nextStage) setProgressStage(nextStage as Parameters<typeof setProgressStage>[0]);
                }
                setToastMessage(`${ids.length} candidato${ids.length !== 1 ? 's' : ''} enviado${ids.length !== 1 ? 's' : ''} a Pre-screening IA`);
                setToastVisible(true);
                setSelected(new Set());
                setWaCandidates(sel);
                setWaModalOpen(true);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '10px',
                background: '#25D366', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '14px', color: '#fff',
                boxShadow: '0 2px 8px rgba(37,211,102,0.35)',
              }}
            >
              <WaIcon size={22} color="white" />
              Iniciar pre-entrevista IA
            </button>
          )}
          {/* Solicitar docs. de ingreso: solo en etapa finalistas (Aprobados) */}
          {currentStage === 'finalistas' && (
            <button
              onClick={() => {
                const sel = filteredCandidates.filter(c => selected.has(c.id));
                setWaDoctosCandidates(sel);
                setWaDoctosOpen(true);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '10px',
                background: '#25D366', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '14px', color: '#fff',
                boxShadow: '0 2px 8px rgba(37,211,102,0.35)',
              }}
            >
              <WaIcon size={22} color="white" />
              Solicitar docs. de ingreso
            </button>
          )}
          {currentStage === 'prescreening' && (
            <button
              onClick={() => {
                const sel = filteredCandidates.filter(c => selected.has(c.id));
                setWaAgendarCandidates(sel);
                setWaAgendarOpen(true);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '10px',
                background: '#25D366', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '14px', color: '#fff',
                boxShadow: '0 2px 8px rgba(37,211,102,0.35)',
              }}
            >
              <WaIcon size={22} color="white" />
              Agendar prueba de manejo
            </button>
          )}
          {currentStage !== 'scoring' && currentStage !== 'prescreening' && currentStage !== 'finalistas' && currentStage !== 'estudios' && currentStage !== 'entrevistas' && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleBulkAction('pasar')}
            >
              <CheckCircle2 size={18} />
              {currentStage === 'prueba_manejo' ? 'Pasar a Prueba Psicotécnica'
                : currentStage === 'evaluaciones' ? 'Pasar a Entrevista'
                : 'Pasar etapa'}
            </Button>
          )}
          {currentStage === 'entrevistas' && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleBulkAction('pasar')}
            >
              <CheckCircle2 size={18} />
              Pasar a Validaciones
            </Button>
          )}
          {currentStage === 'estudios' && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setApproveConfirmOpen(true)}
            >
              <CheckCircle2 size={18} />
              {selected.size === 1 ? 'Aprobar candidato' : `Aprobar ${selected.size} candidatos`}
            </Button>
          )}
          <Button
            variant="danger-outline"
            size="lg"
            onClick={() => handleBulkAction('descartar')}
          >
            <X size={18} />
            Descartar
          </Button>
        </div>
      </WizardBar>

      {/* WhatsApp pre-entrevista modal */}
      <WhatsAppPreEntrevistaModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        candidates={waCandidates}
        jobTitle={vacante?.title ?? 'la vacante'}
        onConfirmSend={(cands) => {
          markWaCompleted(cands);
          setToastMessage(`Pre-entrevista enviada · Resultados disponibles en Pre-screening IA`);
          setToastVisible(true);
        }}
      />

      {/* WhatsApp agendar entrevista modal */}
      <WhatsAppAgendarEntrevistaModal
        isOpen={waAgendarOpen}
        onClose={() => setWaAgendarOpen(false)}
        candidates={waAgendarCandidates}
        jobTitle={vacante?.title ?? 'la vacante'}
        onConfirmSend={(cands) => {
          const ids = cands.map(c => c.id);
          const nextStage = advanceCandidates(jobId, 'prescreening', ids);
          if (nextStage) setProgressStage(nextStage as Parameters<typeof setProgressStage>[0]);
          setSelected(new Set());
          setToastMessage(`${ids.length} candidato${ids.length !== 1 ? 's' : ''} agendado${ids.length !== 1 ? 's' : ''} para Prueba de manejo`);
          setToastVisible(true);
        }}
      />

      <WhatsAppDocumentosModal
        isOpen={waDoctosOpen}
        onClose={() => setWaDoctosOpen(false)}
        candidates={waDoctosCandidates}
        jobTitle={vacante?.title ?? 'la vacante'}
        onConfirmSend={(cands) => {
          setSelected(new Set());
          setToastMessage(`Solicitud de documentos enviada a ${cands.length} candidato${cands.length !== 1 ? 's' : ''}`);
          setToastVisible(true);
        }}
      />

      {/* Confirm approval modal: estudios → finalistas */}
      <ConfirmAprobadosModal
        isOpen={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        count={selected.size}
        onConfirm={() => {
          handleBulkAction('pasar');
        }}
      />

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      {/* Modal: fewer than 3 finalists selected */}
      {fewFinalistsModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,8,36,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setFewFinalistsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff', borderRadius: '20px',
              padding: '40px 36px', maxWidth: '440px', width: '90%',
              boxShadow: '0 20px 60px rgba(15,8,36,0.18)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setFewFinalistsModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: '4px',
                borderRadius: '8px', display: 'flex', alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'var(--color-secondary-50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Users size={26} color="var(--color-brand-accent)" />
              </div>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px',
              color: 'var(--color-brand-primary)', margin: '0 0 10px', textAlign: 'center',
            }}>
              Selección incompleta para Aprobados
            </h2>
            <p style={{
              fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center',
              lineHeight: '1.6', margin: '0 0 28px',
            }}>
              Para aprobar necesitas elegir <strong>exactamente 3 candidatos</strong>.{' '}
              Actualmente tienes <strong>{selected.size}</strong> seleccionado{selected.size !== 1 ? 's' : ''}.{' '}
              {3 - selected.size > 0 && (
                <>Elige <strong>{3 - selected.size} perfil{3 - selected.size !== 1 ? 'es' : ''} más</strong> para continuar.</>
              )}
            </p>
            <Button
              variant="primary" size="lg" fullWidth
              onClick={() => setFewFinalistsModal(false)}
            >
              Entendido, sigo eligiendo
            </Button>
          </div>
        </div>
      )}

      {/* Modal: more than 5 finalists attempted */}
      {manyFinalistsModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,8,36,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setManyFinalistsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff', borderRadius: '20px',
              padding: '40px 36px', maxWidth: '440px', width: '90%',
              boxShadow: '0 20px 60px rgba(15,8,36,0.18)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setManyFinalistsModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: '4px',
                borderRadius: '8px', display: 'flex', alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#FFF4E5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trophy size={26} color="#E8820C" />
              </div>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px',
              color: 'var(--color-brand-primary)', margin: '0 0 10px', textAlign: 'center',
            }}>
              El máximo es 3 aprobados
            </h2>
            <p style={{
              fontSize: '14px', color: 'var(--color-text-secondary)', textAlign: 'center',
              lineHeight: '1.6', margin: '0 0 28px',
            }}>
              Ya tienes <strong>3 perfiles</strong> seleccionados, que es el máximo permitido.{' '}
              Limitar el grupo de aprobados garantiza un proceso de decisión más enfocado y objetivo.{' '}
              Revisa tus selecciones y quédate con los <strong>3 mejores perfiles</strong> del proceso.
            </p>
            <Button
              variant="primary" size="lg" fullWidth
              onClick={() => setManyFinalistsModal(false)}
            >
              Entendido
            </Button>
          </div>
        </div>
      )}

      {/* Modal: confirmar aprobación (estudios → finalistas) */}
      {approveConfirmOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,8,36,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setApproveConfirmOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff', borderRadius: '20px',
              padding: '40px 36px', maxWidth: '440px', width: '90%',
              boxShadow: '0 20px 60px rgba(15,8,36,0.18)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setApproveConfirmOpen(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: '4px',
                borderRadius: '8px', display: 'flex', alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'var(--color-surface-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle size={26} color="var(--color-text-primary)" />
              </div>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px',
              color: 'var(--color-text-primary)', textAlign: 'center', margin: '0 0 10px',
            }}>
              {selected.size === 1 ? '¿Aprobar este candidato?' : `¿Aprobar ${selected.size} candidatos?`}
            </h2>
            <p style={{
              fontSize: '14px', color: 'var(--color-text-muted)',
              textAlign: 'center', margin: '0 0 8px', lineHeight: '1.55',
            }}>
              {selected.size === 1
                ? 'El candidato pasará a la etapa de Aprobados.'
                : `Los ${selected.size} candidatos pasarán a la etapa de Aprobados.`}
            </p>
            <p style={{
              fontSize: '13px', color: 'var(--color-text-muted)',
              textAlign: 'center', margin: '0 0 28px', lineHeight: '1.5',
              fontWeight: 500,
            }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setApproveConfirmOpen(false)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px',
                  border: '1px solid var(--color-border-default)',
                  background: '#ffffff', cursor: 'pointer',
                  fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setApproveConfirmOpen(false);
                  handleBulkAction('pasar');
                }}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px',
                  border: 'none', background: 'var(--color-brand-primary)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '14px', color: '#fff',
                }}
              >
                {selected.size === 1 ? 'Aprobar candidato' : 'Aprobar candidatos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
