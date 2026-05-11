import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Check, Cog, PlusCircle, Puzzle } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { shortlistCandidates, mockFinalistCards, mockCandidatesById } from '../data/mock';
import { getScoreColors } from '../components/ui/ScorePill';
import { useVacantes } from '../hooks/useVacantes';
import { useMockStageState } from '../hooks/useMockStageState';

export default function Shortlist() {
  const { jobId = '' } = useParams();
  const navigate = useNavigate();
  const { vacantes } = useVacantes();
  const { getPendingCandidates } = useMockStageState();

  const vacante = vacantes.find((v) => v.id === jobId || v.jobId === jobId);
  const vacanteTitle = vacante?.title ?? 'Product Designer';
  const isMock = jobId.startsWith('mock-');

  // Prefer manually advanced finalists from localStorage; fall back to pre-defined mock cards
  const pendingFinalistIds = isMock ? getPendingCandidates(jobId, 'finalistas') : [];
  const hasCustomFinalists = pendingFinalistIds.length > 0;
  const finalists = hasCustomFinalists
    ? pendingFinalistIds.map((id) => mockCandidatesById[id]).filter(Boolean)
    : isMock
    ? (mockFinalistCards[jobId] ?? [])
    : shortlistCandidates.slice(0, 3);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "transparent" }}>
      <Sidebar />

      <main
        style={{
          marginLeft: '205px',
          flex: 1,
          padding: '40px',
          overflow: 'auto',
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '28px',
              color: 'var(--color-brand-primary)',
              margin: 0,
            }}
          >
            Finalistas
          </h1>
          <span style={{ color: 'var(--color-neutral-300)', fontSize: '20px' }}>•</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '18px',
              color: 'var(--color-text-muted)',
            }}
          >
            {vacanteTitle}
          </span>
        </div>

        {/* Empty state — no finalists selected yet */}
        {finalists.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 40px',
              gap: '16px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--color-secondary-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlusCircle size={28} color="var(--color-brand-accent)" />
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '20px',
                color: 'var(--color-brand-primary)',
                margin: 0,
              }}
            >
              Aún no hay finalistas
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0, maxWidth: '380px', lineHeight: '1.6' }}>
              Selecciona exactamente <strong>3 candidatos</strong> desde la etapa de Pruebas y usa "Pasar etapa" para definir a tus finalistas.
            </p>
            <Button variant="outline" size="md" onClick={() => navigate(`/pipeline/${jobId}/evaluaciones`)}>
              Ir a Pruebas
            </Button>
          </div>
        )}

        {/* Scorecards carousel */}
        {finalists.length > 0 && <div
          style={{
            display: 'flex',
            gap: '0',
            background: '#ffffff',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}
        >
          {finalists.map((candidate, idx) => {
            const { fg: scoreFg, bg: scoreBg } = getScoreColors(candidate.score);
            const isLast = idx === finalists.length - 1;

            return (
              <div
                key={candidate.id}
                style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '24px 16px',
                  borderRight: isLast ? 'none' : '1px solid var(--color-border-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0',
                  position: 'relative',
                }}
              >
                {/* Avatar + Score — Figma layout */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', paddingTop: '8px' }}>
                  {/* Outer group: positions score badge relative to photo */}
                  <div style={{ position: 'relative', width: '196px' }}>
                    {/* Score circle — top-right corner */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: scoreBg,
                        border: '3px solid #ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '28px',
                        color: scoreFg,
                        zIndex: 2,
                      }}
                    >
                      {candidate.score}
                    </div>

                    {/* Photo + role badge stacked */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '4px' }}>
                      {/* Photo */}
                      <div
                        style={{
                          width: '144px',
                          height: '144px',
                          borderRadius: '50%',
                          border: '2px solid #d4dbe0',
                          overflow: 'hidden',
                          marginBottom: '-13px',
                          flexShrink: 0,
                          background: '#f0f0f0',
                        }}
                      >
                        {(candidate as typeof candidate & { photo?: string }).photo ? (
                          <img
                            src={(candidate as typeof candidate & { photo?: string }).photo}
                            alt={candidate.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <Avatar initials={candidate.avatarInitials} color={scoreFg} size={72} />
                        )}
                      </div>
                      {/* Role badge */}
                      <div style={{
                        background: '#e8ddfd',
                        color: '#8750f6',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: '18px',
                        lineHeight: '27px',
                        padding: '3px 15px',
                        borderRadius: '36px',
                        whiteSpace: 'nowrap',
                      }}>
                        {candidate.role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '8px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '15px',
                      color: 'var(--color-brand-primary)',
                    }}
                  >
                    {candidate.name}
                  </div>
                </div>

                {/* Years + sector */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <Badge variant="default" small>🕐 {candidate.years}</Badge>
                  <Badge variant="default" small>🏢 {candidate.sector}</Badge>
                </div>

                {/* Salary */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {(candidate as typeof candidate & { salary?: string }).salary ?? (candidate as typeof candidate & { aspiration?: string }).aspiration}
                  </span>
                  {candidate.salaryRange && (
                    <Badge variant={candidate.salaryRange} small>
                      {candidate.salaryRange === 'en_rango' ? 'En rango' : 'Fuera de rango'}
                    </Badge>
                  )}
                </div>

                {/* Button */}
                <div style={{ marginBottom: '16px' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      if (isMock) {
                        // If custom finalist (advanced from evaluaciones), use the real mock candidate id
                        if (hasCustomFinalists) {
                          navigate(`/pipeline/${jobId}/candidate/${candidate.id}?stage=evaluaciones`);
                          return;
                        }
                        // Pre-defined mock finalists: map card id to real mock candidate id
                        const mockIdMaps: Record<string, Record<string, string>> = {
                          'mock-ventas': { f1: 'mv-1', f2: 'mv-2', f3: 'mv-3' },
                        };
                        const mockIdMap = mockIdMaps[jobId] ?? {};
                        const mockCandidateId = mockIdMap[candidate.id] ?? candidate.id;
                        navigate(`/pipeline/${jobId}/candidate/${mockCandidateId}?stage=evaluaciones`);
                      } else {
                        navigate(`/pipeline/${jobId}/finalist/${candidate.id}`);
                      }
                    }}
                    style={{ borderColor: 'var(--color-brand-primary)', color: 'var(--color-brand-primary)' }}
                  >
                    Ver perfil
                  </Button>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--color-border-default)', marginBottom: '12px' }} />

                {/* Fases completadas (mock only) */}
                {isMock && (
                  <>
                    <SectionHeader icon={<Check size={13} />} label="Fases completadas" />
                    <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {['Scoring', 'Pre-screening', 'Entrevistas'].map((fase) => (
                        <div key={fase} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          <Check size={12} color="var(--color-positive-500)" />
                          {fase}
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {(candidate as typeof candidate & { pruebaTecnicaCompletada?: boolean }).pruebaTecnicaCompletada
                          ? <Check size={12} color="var(--color-positive-500)" />
                          : <span style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #bbb', display: 'inline-block', flexShrink: 0 }} />
                        }
                        Prueba técnica
                        {!(candidate as typeof candidate & { pruebaTecnicaCompletada?: boolean }).pruebaTecnicaCompletada && (
                          <span style={{ fontSize: '10px', color: '#bbb', fontStyle: 'italic' }}>(opcional)</span>
                        )}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--color-border-default)', marginBottom: '12px' }} />
                  </>
                )}

                {/* No negociables */}
                <SectionHeader icon={<AlertTriangle size={13} />} label="No negociables" />
                <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    <Check size={12} color="var(--color-positive-500)" />
                    Ubicación: {candidate.location}
                  </div>
                  {/* FinalistCard has modalidad; Candidate does not */}
                  {(candidate as typeof candidate & { modalidad?: string }).modalidad && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      <Check size={12} color="var(--color-positive-500)" />
                      {(candidate as typeof candidate & { modalidad?: string }).modalidad}
                    </div>
                  )}
                  {/* For Candidate objects: show noNegociables from scoringAI */}
                  {!(candidate as typeof candidate & { modalidad?: string }).modalidad &&
                    (candidate as typeof candidate & { scoringAI?: { noNegociables?: { label: string }[] } }).scoringAI?.noNegociables?.slice(0, 3).map((nn, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        <Check size={12} color="var(--color-positive-500)" />
                        {nn.label}
                      </div>
                    ))
                  }
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-default)', marginBottom: '12px' }} />

                {/* Core skills — FinalistCard has coreSkills; for Candidate use scoringAI.logros */}
                <SectionHeader icon={<Cog size={13} />} label="Highlights" />
                <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(candidate as typeof candidate & { coreSkills?: { label: string; score: number }[] }).coreSkills
                    ? (candidate as typeof candidate & { coreSkills: { label: string; score: number }[] }).coreSkills.map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', flex: 1, lineHeight: '1.5' }}>{s.label}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>{s.score}/100</span>
                        </div>
                      ))
                    : (candidate as typeof candidate & { scoringAI?: { logros?: string[] } }).scoringAI?.logros?.map((logro, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          <Check size={11} color="var(--color-positive-500)" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ lineHeight: '1.5' }}>{logro}</span>
                        </div>
                      ))
                  }
                </div>

                {/* Additional skills / Señales */}
                {((candidate as typeof candidate & { additionalSkills?: { label: string; score: number }[] }).additionalSkills?.length ?? 0) > 0 && (
                  <>
                    <div style={{ borderTop: '1px solid var(--color-border-default)', marginBottom: '12px' }} />
                    <SectionHeader icon={<PlusCircle size={13} />} label="Skills adicionales" />
                    <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(candidate as typeof candidate & { additionalSkills: { label: string; score: number }[] }).additionalSkills.map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', flex: 1, lineHeight: '1.5' }}>{s.label}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>{s.score}/100</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ borderTop: '1px solid var(--color-border-default)', marginBottom: '12px' }} />

                {/* Fit Cultural / Bio */}
                <SectionHeader icon={<Puzzle size={13} />} label="Fit / Perfil" />
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  {(candidate as typeof candidate & { fitCultural?: string }).fitCultural
                    ?? (candidate as typeof candidate & { bio?: string }).bio}
                </p>
              </div>
            );
          })}
        </div>}

        {/* Footer */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Powered by</span>
          <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-brand-primary)' }}>Unio</span>
          <button
            style={{
              background: 'none',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 12px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-muted)',
            }}
          >
            Síguenos en Linkedin
          </button>
        </div>
      </main>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '8px',
        color: 'var(--color-text-muted)',
      }}
    >
      {icon}
      <span style={{ fontSize: '12px', fontWeight: 700 }}>{label}</span>
    </div>
  );
}
