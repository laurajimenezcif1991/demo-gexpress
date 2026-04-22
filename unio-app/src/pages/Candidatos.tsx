import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePipeline } from '../context/PipelineContext';
import { Search, ArrowUpDown, CheckCircle2, X, MapPin, Calendar } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import WizardBar from '../components/layout/WizardBar';
import Toast from '../components/layout/Toast';
import CandidateCard from '../components/ui/CandidateCard';
import Button from '../components/ui/Button';
import ValidationPipelineFilter from '../components/ui/ValidationPipelineFilter';
import { candidates, vacantes, type PipelineStageKey } from '../data/mock';
import { useCandidateStatus } from '../context/CandidateStatusContext';

type FilterTab = 'todos' | 'high' | 'mid' | 'low';

const filterConfig = [
  { id: 'todos' as FilterTab, label: 'Todos' },
  { id: 'high' as FilterTab, label: 'Score >80%' },
  { id: 'mid' as FilterTab, label: 'Media 60%' },
  { id: 'low' as FilterTab, label: 'Bajo 50%' },
];

const stageLabelUpper: Record<PipelineStageKey, string> = {
  scoring:      'SCORING',
  prescreening: 'PRE-SCREENING',
  entrevistas:  'ENTREVISTAS',
  evaluaciones: 'EVALUACIONES',
};

type MockStage = PipelineStageKey | 'finalistas';

export default function Candidatos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setStatuses, getStatus } = useCandidateStatus();

  const STAGE_ORDER = ['scoring', 'prescreening', 'entrevistas', 'evaluaciones'] as const;

  const priorStages = (stage: string) => {
    const idx = STAGE_ORDER.indexOf(stage as typeof STAGE_ORDER[number]);
    return idx > 0 ? STAGE_ORDER.slice(0, idx) : [];
  };

  const isEliminatedBefore = (candidateId: string, stage: string) =>
    priorStages(stage).some((s) => getStatus(candidateId, s) === 'descartado');

  const state = location.state as { mockStage?: MockStage; vacanteId?: string } | null;
  const mockStage = state?.mockStage;
  const vacante = vacantes.find((v) => v.id === (state?.vacanteId ?? 'v1')) ?? vacantes[0];

  const initialStage: PipelineStageKey =
    mockStage && mockStage !== 'finalistas' ? mockStage : 'scoring';

  // activeStage: changes when user clicks a card (controls which candidates are shown)
  const [activeStage, setActiveStageLocal] = useState<PipelineStageKey>(initialStage);
  // progressStage: the vacancy's real progress level — never changes on click
  const [progressStage] = useState<PipelineStageKey>(initialStage);

  const { setActiveStage: setContextStage, setProgressStage, finalistaLocked } = usePipeline();

  // Sync both into context so Sidebar can consume them
  useEffect(() => {
    setContextStage(activeStage);
  }, [activeStage, setContextStage]);

  useEffect(() => {
    setProgressStage(progressStage);
  }, [progressStage, setProgressStage]);

  const setActiveStage = (stage: PipelineStageKey) => {
    setActiveStageLocal(stage);
    setContextStage(stage);
  };

  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  /* Redirect to /finalistas when mockStage is 'finalistas' */
  useEffect(() => {
    if (mockStage === 'finalistas') {
      navigate('/finalistas', { replace: true });
    }
  }, [mockStage, navigate]);
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [filter, setFilter]           = useState<FilterTab>('todos');
  const [search, setSearch]           = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  /* ── Counts per stage ── */
  const stageCounts = useMemo((): Record<PipelineStageKey, number> => ({
    scoring:      candidates.filter((c) => c.currentStage === 'scoring').length,
    prescreening: candidates.filter((c) => c.currentStage === 'prescreening').length,
    entrevistas:  candidates.filter((c) => c.currentStage === 'entrevistas').length,
    evaluaciones: candidates.filter((c) => c.currentStage === 'evaluaciones').length,
  }), []);

  /* ── Filtered + sorted list ── */
  const filteredCandidates = useMemo(() => {
    let list = candidates
      .filter((c) => c.currentStage === activeStage)
      .filter((c) => !isEliminatedBefore(c.id, activeStage));

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q)
      );
    }

    switch (filter) {
      case 'high': list = list.filter((c) => c.score >= 80);          break;
      case 'mid':  list = list.filter((c) => c.score >= 40 && c.score < 80); break;
      case 'low':  list = list.filter((c) => c.score < 50);           break;
    }

    /* por_validar candidates first, then by score per sortDir */
    list = [...list].sort((a, b) => {
      const aStatus = getStatus(a.id, activeStage);
      const bStatus = getStatus(b.id, activeStage);
      const aPriority = aStatus === undefined || aStatus === 'por_validar' ? 0 : 1;
      const bPriority = bStatus === undefined || bStatus === 'por_validar' ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return sortDir === 'desc' ? b.score - a.score : a.score - b.score;
    });

    return list;
  }, [activeStage, filter, search, sortDir, getStatus, isEliminatedBefore]);

  const filterCounts = useMemo(() => {
    const stageList = candidates.filter((c) => c.currentStage === activeStage);
    return {
      todos: stageList.length,
      high:  stageList.filter((c) => c.score >= 80).length,
      mid:   stageList.filter((c) => c.score >= 40 && c.score < 80).length,
      low:   stageList.filter((c) => c.score < 50).length,
    };
  }, [activeStage]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleBulkAction = (action: 'pasar' | 'descartar') => {
    const ids = Array.from(selected);
    if (action === 'pasar') {
      setStatuses(ids, activeStage, 'continua');
      setToastMessage(`${ids.length} candidato${ids.length !== 1 ? 's' : ''} marcado${ids.length !== 1 ? 's' : ''} como Continúa`);
    } else {
      setStatuses(ids, activeStage, 'descartado');
      setToastMessage(`${ids.length} candidato${ids.length !== 1 ? 's' : ''} descartado${ids.length !== 1 ? 's' : ''}`);
    }
    setToastVisible(true);
    setSelected(new Set());
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '32px',
              color: 'var(--color-brand-primary)',
              margin: 0,
              letterSpacing: '0.02em',
            }}
          >
            {vacante.title}
          </h1>
          <Button variant="outline" size="sm">
            VER RCP COMPLETO
          </Button>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
            <MapPin size={12} />
            Bogotá, Colombia
          </span>
          <span style={{ color: 'var(--color-border-default)' }}>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
            <Calendar size={12} />
            Iniciado {vacante.fecha}
          </span>
          <span style={{ color: 'var(--color-border-default)' }}>·</span>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
            {vacante.activos} candidatos activos
          </span>
        </div>

        {/* Pipeline filter */}
        <ValidationPipelineFilter
          activeStage={activeStage}
          progressStage={progressStage}
          onStageChange={(stage) => {
            setActiveStage(stage);
            setFilter('todos');
            setSearch('');
            setSelected(new Set());
          }}
          counts={stageCounts}
          finalistCount={5}
          finalistaActive={mockStage === 'finalistas'}
          finalistaLocked={finalistaLocked}
        />

        {/* Dynamic subtitle */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--color-text-muted)',
          margin: '0 0 14px',
          textTransform: 'uppercase',
        }}>
          Candidatos en {stageLabelUpper[activeStage]} ({filteredCandidates.length})
        </p>

        {/* Score filters + controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {filterConfig.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  height: '28px',
                  borderRadius: '20px',
                  border: filter === f.id ? 'none' : '1px solid var(--color-brand-accent)',
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
                  <span style={{
                    background: filter === f.id ? 'rgba(255,255,255,0.25)' : 'rgba(135,80,246,0.12)',
                    color: filter === f.id ? '#ffffff' : 'var(--color-brand-accent)',
                    borderRadius: '10px',
                    padding: '0 5px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}>
                    {filterCounts[f.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-placeholder)' }} />
              <input
                type="text"
                placeholder="Buscar candidato..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: '36px',
                  padding: '0 12px 0 32px',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  width: '240px',
                  outline: 'none',
                }}
              />
            </div>
            <button
              onClick={() => setSortDir((d) => d === 'desc' ? 'asc' : 'desc')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 14px',
                height: '36px',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <ArrowUpDown size={13} />
              {sortDir === 'desc' ? 'Puntuaci\u00f3n: mayor a menor' : 'Puntuaci\u00f3n: menor a mayor'}
            </button>
          </div>
        </div>

        {/* Candidate cards */}
        <div>
          {filteredCandidates.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontSize: '14px' }}>
              No hay candidatos en esta etapa.
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                statusLabel={getStatus(candidate.id, activeStage)}
                selected={selected.has(candidate.id)}
                onSelect={toggleSelect}
                onClick={() => navigate(`/pipeline/${vacante.id}/candidate/${candidate.id}?stage=${activeStage}`)}
              />
            ))
          )}
        </div>
      </main>

      <WizardBar visible={selected.size > 0}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Mueve estos perfiles a la siguiente fase
          </span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
            {selected.size} candidato{selected.size !== 1 ? 's' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" size="lg" onClick={() => handleBulkAction('pasar')}>
            <CheckCircle2 size={18} />
            Pasar etapa
          </Button>
          <Button variant="danger-outline" size="lg" onClick={() => handleBulkAction('descartar')}>
            <X size={18} />
            Descartar
          </Button>
        </div>
      </WizardBar>

      <Toast message={toastMessage} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
