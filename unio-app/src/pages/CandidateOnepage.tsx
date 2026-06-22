import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Lock,
  CheckCircle2,
  HelpCircle,
  Building2,
  Trophy,
  MessageSquare,
  Check,
  X,
  Star,
  Calendar,
  Clock,
  User,
  Copy,
  Pencil,
  MapPin,
  AlertTriangle,
  Lightbulb,
  Target,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  FileText,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import WizardBar from '../components/layout/WizardBar';
import Toast from '../components/layout/Toast';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Gauge from '../components/ui/Gauge';
import StarRating from '../components/ui/StarRating';
import PruebaPsicologicaContent from '../components/ui/PruebaPsicologicaContent';
import VoiceInterviewSection from '../components/ui/VoiceInterviewSection';
import PruebaManejoContent from '../components/ui/PruebaManejoContent';
import ValidacionAntecedentes from '../components/ui/ValidacionAntecedentes';
import type { VariantKey } from '../components/ui/ValidacionAntecedentes';
import WhatsAppPreEntrevistaModal, { WaIcon } from '../components/ui/WhatsAppPreEntrevistaModal';
import WhatsAppAgendarEntrevistaModal from '../components/ui/WhatsAppAgendarEntrevistaModal';
import { useWaPrescreening } from '../context/WaPrescreeningContext';
import {
  interviewData,
  type Candidate,
  type InterviewFeedback,
  type PipelineStageKey,
  type RecomendacionValue,
} from '../data/mock';
import { useCandidateStatus } from '../context/CandidateStatusContext';
import { useInterview, calcScore } from '../context/InterviewContext';
import clockHistoryUrl from '../assets-icons/clock-history.svg';
import { useCandidateDetail } from '../hooks/useCandidateDetail';
import { useMockStageState } from '../hooks/useMockStageState';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { Skeleton, SkeletonCircle } from '../components/ui/Skeleton';

const ONEPAGE_PIPELINE_STAGES: PipelineStageKey[] = [
  'scoring',
  'prescreening',
  'prueba_manejo',
  'evaluaciones',
  'entrevistas',
];

function normalizeOnepageStage(raw: string | null): PipelineStageKey {
  const s = raw || 'scoring';
  return ONEPAGE_PIPELINE_STAGES.includes(s as PipelineStageKey) ? (s as PipelineStageKey) : 'scoring';
}

export default function CandidateOnepage() {
  const { jobId = 'v1', candidateId = 'c1' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const stage = normalizeOnepageStage(searchParams.get('stage'));

  const { candidate: apiCandidate, loading: candidateLoading, error: candidateError } = useCandidateDetail(candidateId);
  const reducedMotion = usePrefersReducedMotion();
  const { isCandidatePending } = useMockStageState();
  const { isCompleted: isWaCompleted, getResult: getWaResult, markCompleted: markWaCompleted } = useWaPrescreening();
  const isMockJob = jobId.startsWith('mock-');
  const openMockCv = () => {
    if (!isMockJob) return;
    const education = MOCK_EDUCATION[candidate.role] ?? [];
    const skills    = MOCK_SKILLS[candidate.role]    ?? [];
    const phone     = _mockPhone(candidate.name);
    const email     = _mockEmail(candidate.name);

    const expBlock = candidate.hasCurrentJob && (candidate as any).currentRole
      ? `<div class="exp-item">
           <div class="exp-header">
             <span class="exp-role">${(candidate as any).currentRole}</span>
             <span class="exp-date">2022 – Presente</span>
           </div>
           <span class="exp-company">${(candidate as any).currentCompany}</span>
           <ul>${candidate.scoringAI.logros.map((l: string) => `<li>${l}</li>`).join('')}</ul>
         </div>`
      : `<div class="exp-item">
           <div class="exp-header">
             <span class="exp-role">${(candidate as any).lastRole ?? candidate.role}</span>
             <span class="exp-date">${(candidate as any).lastDate ?? '2020 – 2023'}</span>
           </div>
           <span class="exp-company">${(candidate as any).lastCompany ?? ''}</span>
           <ul>${candidate.scoringAI.logros.map((l: string) => `<li>${l}</li>`).join('')}</ul>
         </div>`;

    const eduBlock = education.map((e: { degree: string; institution: string; year: string }) => `
      <div class="edu-item">
        <div class="edu-header">
          <span class="edu-degree">${e.degree}</span>
          <span class="edu-year">${e.year}</span>
        </div>
        <span class="edu-inst">${e.institution}</span>
      </div>`).join('');

    const skillsBlock = skills.map((s: string) => `<span class="skill">${s}</span>`).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Hoja de vida — ${candidate.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f2f4f7; color: #1a1a2e; }
    .page { max-width: 760px; margin: 40px auto 60px; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.10); overflow: hidden; }
    .header { background: #1a1a2e; padding: 36px 40px 28px; color: #fff; }
    .header h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
    .header .role { font-size: 14px; color: #a78bfa; font-weight: 600; margin-bottom: 16px; }
    .contact { display: flex; flex-wrap: wrap; gap: 18px; }
    .contact span { font-size: 12px; color: #cbd5e1; display: flex; align-items: center; gap: 6px; }
    .body { padding: 36px 40px; display: flex; flex-direction: column; gap: 28px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8750F6; border-bottom: 2px solid #ede9fe; padding-bottom: 7px; margin-bottom: 14px; }
    p.bio { font-size: 13px; color: #475569; line-height: 1.75; }
    .superpoder { font-size: 12px; color: #64748b; margin-top: 10px; font-style: italic; }
    .superpoder strong { color: #1a1a2e; font-style: normal; }
    .exp-item, .edu-item { margin-bottom: 16px; }
    .exp-item:last-child, .edu-item:last-child { margin-bottom: 0; }
    .exp-header, .edu-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3px; }
    .exp-role, .edu-degree { font-size: 13px; font-weight: 700; color: #1a1a2e; }
    .exp-date, .edu-year { font-size: 11px; color: #94a3b8; white-space: nowrap; margin-left: 12px; }
    .exp-company, .edu-inst { font-size: 12px; font-weight: 600; color: #8750F6; }
    ul { margin: 8px 0 0 16px; display: flex; flex-direction: column; gap: 4px; }
    ul li { font-size: 12px; color: #64748b; line-height: 1.6; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill { font-size: 12px; background: #ede9fe; color: #1a1a2e; padding: 4px 14px; border-radius: 100px; font-weight: 600; }
    .footer-bar { background: #f8f7ff; border-top: 1px solid #ede9fe; padding: 14px 40px; display: flex; align-items: center; gap: 8px; }
    .footer-bar span { font-size: 12px; color: #94a3b8; }
    .footer-bar strong { color: #1a1a2e; }
    @media print { body { background: #fff; } .page { box-shadow: none; margin: 0; border-radius: 0; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>${candidate.name}</h1>
      <p class="role">${candidate.role} · ${candidate.location}</p>
      <div class="contact">
        <span>📞 ${phone}</span>
        <span>✉️ ${email}</span>
        <span>📍 ${candidate.location}</span>
      </div>
    </div>
    <div class="body">
      <div>
        <div class="section-title">Perfil profesional</div>
        <p class="bio">${candidate.bio}</p>
        ${(candidate as any).superpoder ? `<p class="superpoder"><strong>Superpoder:</strong> ${(candidate as any).superpoder}</p>` : ''}
      </div>
      <div>
        <div class="section-title">Experiencia laboral</div>
        ${expBlock}
      </div>
      <div>
        <div class="section-title">Educación</div>
        ${eduBlock}
      </div>
      <div>
        <div class="section-title">Habilidades</div>
        <div class="skills">${skillsBlock}</div>
      </div>
    </div>
    <div class="footer-bar">
      <span><strong>Experiencia total:</strong> ${candidate.years} en el sector</span>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };
  const isPendingPrescreening = isMockJob && isCandidatePending(jobId, 'prescreening', candidateId);
  const isPendingEntrevistas  = isMockJob && isCandidatePending(jobId, 'entrevistas',  candidateId);
  const isPendingEvaluaciones = isMockJob && isCandidatePending(jobId, 'evaluaciones', candidateId);
  const candidate = apiCandidate ?? { id: candidateId, name: '', role: '', sector: '', years: '', location: '', bio: '', score: 0, avatarInitials: candidateId.slice(0, 2).toUpperCase(), avatarColor: '#8750F6', hasCurrentJob: false, superpoder: '', aspiration: '', budget: '', salaryRange: 'en_rango' as const, currentStage: stage, scoringAI: { score: 0, status: 'pendiente' as const, resumen: '', noNegociables: [], logros: [], senales: [] } };
  // Show prescreening if URL stage implies it OR if the API returned prescreening data OR if candidate was advanced there
  const hasPrescreening = !!(apiCandidate?.prescreeningAI) || stage === 'prescreening' || stage === 'entrevistas' || stage === 'evaluaciones' || isPendingPrescreening;

  const { setStatus } = useCandidateStatus();
  const { getFeedback } = useInterview();

  const interview = interviewData.find((d) => d.candidateId === candidateId);
  const savedFeedback = getFeedback(candidateId);
  const hrScore = calcScore(savedFeedback.hr ?? interview?.hrFeedback);
  const hmScore = calcScore(savedFeedback.hm ?? interview?.hmFeedback);
  const entrevistaScore: number | null =
    hrScore !== null && hmScore !== null
      ? Math.round((hrScore + hmScore) / 2)
      : hrScore ?? hmScore ?? null;

  const hrRecomendacion = (savedFeedback.hr ?? interview?.hrFeedback)?.recomendacion ?? null;
  const hmRecomendacion = (savedFeedback.hm ?? interview?.hmFeedback)?.recomendacion ?? null;
  const hrDone = hrRecomendacion !== null;
  const hmDone = hmRecomendacion !== null;
  const entrevistasDone = hrDone && hmDone;
  const entrevistasDescarta =
    entrevistasDone && (hrRecomendacion === 'no_recomiendo' || hmRecomendacion === 'no_recomiendo');

  const [prescreeningOpen, setPrescreeningOpen] = useState(() => stage === 'prescreening');
  const [pruebaManejoOpen, setPruebaManejoOpen] = useState(() => stage === 'prueba_manejo');
  const [pruebaManejoScore, setPruebaManejoScore] = useState<number | undefined>(undefined);
  const [entrevistasOpen, setEntrevistasOpen] = useState(() => stage === 'entrevistas');
  const [evaluacionesOpen, setEvaluacionesOpen] = useState(() => stage === 'evaluaciones');
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waAgendarOpen, setWaAgendarOpen] = useState(false);


  const prescreeningSectionRef = useRef<HTMLDivElement>(null);
  const entrevistasSectionRef = useRef<HTMLDivElement>(null);
  const evaluacionesSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPrescreeningOpen(stage === 'prescreening');
    setPruebaManejoOpen(stage === 'prueba_manejo');
    setEntrevistasOpen(stage === 'entrevistas');
    setEvaluacionesOpen(stage === 'evaluaciones');


    const sectionEl: HTMLElement | null =
      stage === 'prescreening'
        ? prescreeningSectionRef.current
        : stage === 'entrevistas'
          ? entrevistasSectionRef.current
          : evaluacionesSectionRef.current;

    const t = window.setTimeout(() => {
      sectionEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => window.clearTimeout(t);
  }, [stage, candidateId, jobId]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  };

  const backPath = `/pipeline/${jobId}/${stage}`;

  if (candidateLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
        <Sidebar />
        <main style={{ marginLeft: '205px', flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '960px', padding: '32px 40px 120px' }}>
            {/* Back + title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <Skeleton width={80} height={14} />
              <Skeleton width={120} height={34} borderRadius={8} />
            </div>

            {/* Profile card skeleton */}
            <div style={{
              border: '2px solid transparent',
              background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(115deg, #9A7CF7, #FDD83F, #F05899, #3DAC56, #00ADFE) border-box',
              borderRadius: 'var(--container-radius)',
              padding: '32px',
              marginBottom: '20px',
              display: 'flex',
              gap: '24px',
              alignItems: 'flex-start',
            }}>
              <SkeletonCircle size={80} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Skeleton height={28} width="50%" />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Skeleton height={22} width={120} borderRadius={20} />
                  <Skeleton height={22} width={80} borderRadius={20} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Skeleton height={12} width={100} />
                  <Skeleton height={12} width={70} />
                </div>
                <Skeleton height={50} width="85%" borderRadius={8} style={{ marginTop: '4px' }} />
                <Skeleton height={12} width="70%" />
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <Skeleton height={34} width={110} borderRadius={8} />
                  <Skeleton height={34} width={110} borderRadius={8} />
                </div>
              </div>
              <Skeleton width={90} height={90} borderRadius={50} />
            </div>

            {/* Accordion section skeletons */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: 'var(--container-radius)', border: '1px solid var(--color-border-default)', padding: '20px 24px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Skeleton width={22} height={22} borderRadius={4} />
                  <Skeleton width={140} height={16} />
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Skeleton width={52} height={24} borderRadius={20} />
                  <Skeleton width={20} height={20} borderRadius={4} />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (candidateError && !apiCandidate) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
        <Sidebar />
        <main style={{ marginLeft: '205px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>No se pudo cargar el perfil</span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{candidateError}</span>
          <button
            onClick={() => navigate(-1)}
            style={{ marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-brand-accent)', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600 }}
          >
            ← Volver
          </button>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
      <Sidebar />

      <main
        style={{
          marginLeft: '205px',
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '960px',
            padding: '32px 40px 120px',
          }}
        >
        {/* Back + title */}
        <button
          onClick={() => navigate(backPath)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-display)',
            padding: '0',
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={16} />
          Atrás
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '32px',
              color: 'var(--color-brand-primary)',
              margin: 0,
            }}
          >
            Proceso de validación
          </h1>
        </div>

        {/* Profile card */}
        <div
          style={{
            border: '2px solid transparent',
            background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(115deg, #9A7CF7, #FDD83F, #F05899, #3DAC56, #00ADFE) border-box',
            borderRadius: 'var(--container-radius)',
            padding: '32px',
            marginBottom: '20px',
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
          }}
        >
          {/* Left: photo + info */}
          <div style={{ display: 'flex', gap: '24px', flex: 1 }}>
            {candidate.photo ? (
              <img
                src={candidate.photo}
                alt={candidate.name}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '3px solid var(--color-border-default)',
                }}
              />
            ) : (
              <Avatar
                initials={candidate.avatarInitials}
                color={candidate.avatarColor}
                size={140}
              />
            )}

            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '28px',
                  color: 'var(--color-brand-primary)',
                  margin: '0 0 10px',
                }}
              >
                {candidate.name}
              </h2>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <Badge variant="prescreening" small>{candidate.role}</Badge>
                <span style={{ color: 'var(--color-neutral-300)', fontSize: '14px' }}>•</span>
                <Badge variant="default" small>{candidate.sector.split(',')[0].trim()}</Badge>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <Badge variant="default" small>
                  <MapPin size={11} /> {candidate.location}
                </Badge>
                <Badge variant="default" small>
                  <img src={clockHistoryUrl} width={11} height={11} alt="" /> {candidate.years}
                </Badge>
              </div>

              {/* Estado actual */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} color="var(--color-text-muted)" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    Estado actual
                  </span>
                </div>
                {candidate.hasCurrentJob ? (
                  <span style={{ fontSize: '13px', color: 'var(--color-text-primary)', paddingLeft: '20px' }}>
                    {candidate.currentCompany} • {candidate.currentRole}
                  </span>
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', paddingLeft: '20px' }}>
                    Sin empleo actualmente<br />
                    Última experiencia: {candidate.lastRole} @ {candidate.lastCompany} ({candidate.lastDate})
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', alignItems: 'center' }}>
                {candidate.hasCV === false ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', fontWeight: 600,
                    color: '#16A34A',
                    background: '#DCFCE7',
                    border: '1px solid #BBF7D0',
                    padding: '5px 12px', borderRadius: '20px',
                  }}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.124 1.524 5.855L.057 23.572a.5.5 0 0 0 .614.612l5.76-1.51A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.945 9.945 0 0 1-5.09-1.392l-.364-.217-3.777.99 1.006-3.683-.236-.379A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    HV por WhatsApp
                  </span>
                ) : (
                  <Button variant="outline" size="sm" onClick={openMockCv}>
                    <FileText size={14} />
                    Hoja de vida
                  </Button>
                )}
                {/* Portafolio oculto — no eliminar */}
                {false && <Button variant="ghost" size="sm">Portafolio</Button>}
              </div>
            </div>
          </div>

          {/* Right: Gauge */}
          <div style={{ flexShrink: 0 }}>
            <Gauge score={candidate.score} size={160} label="Consolidado" animated reducedMotion={reducedMotion} animationDurationMs={1100} />
          </div>
        </div>

        {/* Salary bar */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Aspiración:{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>{candidate.aspiration}</strong>
          </span>
          <Badge variant={candidate.salaryRange}>{candidate.salaryRange === 'en_rango' ? 'En rango' : 'Fuera de rango'}</Badge>
          <span style={{ color: 'var(--color-neutral-300)' }}>——</span>
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Presupuesto:{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>{candidate.budget}</strong>
          </span>
        </div>

        {/* Accordion sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1. Pre-entrevista IA */}
          {(() => {
            const waResult = getWaResult(candidateId);
            const waCompleted = isWaCompleted(candidateId);
            const prescreeningData = candidate.prescreeningAI ?? (waCompleted ? waResult : undefined);
            const hasPrescreeningData = !!prescreeningData;
            const prescreeningStatus = prescreeningData?.status;
            const prescreeningScore = hasPrescreening && !isPendingPrescreening ? (prescreeningData?.score ?? candidate.prescreeningAI?.score) : undefined;

            return (
              <div ref={prescreeningSectionRef} style={{ scrollMarginTop: 24 }}>
                <AccordionSection
                  number={1}
                  title="Pre-entrevista IA"
                  score={prescreeningScore}
                  statusText={
                    isPendingPrescreening && !waCompleted
                      ? 'En proceso'
                      : hasPrescreeningData
                      ? prescreeningStatus === 'rechazado' ? 'Descartado'
                        : prescreeningStatus === 'continua' ? 'Continúa'
                        : 'Pendiente'
                      : hasPrescreening ? 'En proceso' : 'Por iniciar'
                  }
                  statusOk={hasPrescreeningData && prescreeningStatus === 'continua'}
                  isOpen={prescreeningOpen}
                  onToggle={() => (hasPrescreening || waCompleted) && setPrescreeningOpen(!prescreeningOpen)}
                  isLocked={!hasPrescreening && !waCompleted}
                >
                  {(hasPrescreening || waCompleted) && (
                    prescreeningData ? (
                      <PrescreeningContent
                        prescreening={prescreeningData}
                        hasCV={candidate.hasCV}
                        runt={candidate.runtVerification}
                        candidateScore={candidate.score}
                        isPendingEvaluaciones={isPendingEvaluaciones}
                      />
                    ) : (
                      <div style={{ padding: '8px 0', color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                        Pendiente: la pre-entrevista IA aún no ha sido procesada para este candidato.
                      </div>
                    )
                  )}
                </AccordionSection>
              </div>
            );
          })()}

          {/* 2. Prueba de manejo */}
          <div style={{ scrollMarginTop: 24 }}>
            <AccordionSection
              number={2}
              title="Prueba de manejo"
              score={pruebaManejoScore}
              statusText={
                stage === 'evaluaciones' || stage === 'entrevistas' ? 'Continúa'
                : stage === 'prueba_manejo' ? 'En proceso'
                : 'Por iniciar'
              }
              statusOk={stage === 'evaluaciones' || stage === 'entrevistas'}
              isOpen={pruebaManejoOpen}
              onToggle={() => setPruebaManejoOpen(o => !o)}
              isLocked={stage !== 'prueba_manejo' && stage !== 'evaluaciones' && stage !== 'entrevistas'}
            >
              <PruebaManejoContent
                candidateId={candidateId}
                onScoreChange={setPruebaManejoScore}
              />
            </AccordionSection>
          </div>

          {/* 3. Prueba Psicotécnica (PRIMA) */}
          <div ref={evaluacionesSectionRef} style={{ scrollMarginTop: 24 }}>
            <AccordionSection
              number={3}
              title="Prueba Psicotécnica"
              score={candidate.psychTest?.score}
              statusText={
                isPendingEvaluaciones ? 'En proceso'
                  : candidate.psychTest ? 'Continúa' : 'Por iniciar'
              }
              statusOk={!!candidate.psychTest && !isPendingEvaluaciones}
              isOpen={evaluacionesOpen}
              onToggle={() => setEvaluacionesOpen(!evaluacionesOpen)}
              isLocked={false}
            >
              {candidate.psychTest ? (
                <PruebaPsicologicaContent data={candidate.psychTest} />
              ) : (
                <div style={{ padding: '8px 0', color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                  Pendiente: la prueba psicotécnica (PRIMA) aún no ha sido completada por el candidato.
                </div>
              )}
            </AccordionSection>
          </div>

          {/* 4. Entrevista */}
          <div ref={entrevistasSectionRef} style={{ scrollMarginTop: 24 }}>
            <AccordionSection
              number={4}
              title="Entrevista"
              score={isPendingEntrevistas ? undefined : entrevistaScore}
              statusText={
                isPendingEntrevistas
                  ? 'En proceso'
                  : entrevistasDescarta ? 'Descartado' :
                  entrevistasDone     ? 'Continúa'   :
                  entrevistaScore !== null ? 'En proceso' : 'Por iniciar'
              }
              statusOk={!isPendingEntrevistas && entrevistasDone && !entrevistasDescarta}
              isOpen={entrevistasOpen}
              onToggle={() => setEntrevistasOpen(!entrevistasOpen)}
              isLocked={false}
            >
              <EntrevistasContent
                candidateId={candidateId}
                jobId={jobId}
                interview={isPendingEntrevistas ? undefined : interview}
                savedFeedback={savedFeedback}
              />
              <VoiceInterviewSection />
            </AccordionSection>
          </div>
        </div>
        </div>
      </main>

      {/* Wizard bar */}
      <WizardBar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
            {candidate.name}
          </span>
          <span style={{ color: 'var(--color-neutral-300)' }}>•</span>
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Score: {candidate.score}/100
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Pre-entrevista WhatsApp: visible en etapa scoring */}
          {stage === 'scoring' && (
            <button
              onClick={() => setWaModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '10px',
                background: '#25D366', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '13px', color: '#fff',
                boxShadow: '0 2px 8px rgba(37,211,102,0.35)',
              }}
            >
              <WaIcon size={20} color="white" />
              Lanzar pre-entrevista
            </button>
          )}
          {stage === 'prescreening' && (
            <button
              onClick={() => setWaAgendarOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 16px', borderRadius: '10px',
                background: '#25D366', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '13px', color: '#fff',
                boxShadow: '0 2px 8px rgba(37,211,102,0.35)',
              }}
            >
              <WaIcon size={20} color="white" />
              Agendar prueba de manejo
            </button>
          )}
          {stage !== 'scoring' && stage !== 'prescreening' && (
            <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setStatus(candidateId, stage, 'continua');
                  const idx = ONEPAGE_PIPELINE_STAGES.indexOf(stage);
                  if (idx >= 0 && idx < ONEPAGE_PIPELINE_STAGES.length - 1) {
                    const next = ONEPAGE_PIPELINE_STAGES[idx + 1];
                    navigate(`/pipeline/${jobId}/candidate/${candidateId}?stage=${next}`, { replace: true });
                  }
                  showToast('¡Candidato marcado como Continúa!');
                }}
              >
                <CheckCircle2 size={16} />
                {stage === 'prueba_manejo' ? 'Pasar a Prueba Psicotécnica'
                  : stage === 'evaluaciones' ? 'Pasar a Entrevista'
                  : stage === 'entrevistas' ? 'Pasar a Finalistas'
                  : 'Pasar etapa'}
              </Button>
          )}
          <Button
            variant="danger-outline"
            size="md"
            onClick={() => {
              setStatus(candidateId, stage, 'descartado');
              showToast('Candidato descartado');
            }}
          >
            <X size={16} />
            Descartar
          </Button>
        </div>
      </WizardBar>

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      {/* WhatsApp pre-entrevista modal */}
      <WhatsAppPreEntrevistaModal
        isOpen={waModalOpen}
        onClose={() => setWaModalOpen(false)}
        candidates={candidate ? [candidate] : []}
        jobTitle={candidate?.role}
        onConfirmSend={(cands) => {
          markWaCompleted(cands);
          showToast('Pre-entrevista enviada · Resultados disponibles en Pre-screening IA');
        }}
      />

      {/* WhatsApp agendar entrevista modal */}
      <WhatsAppAgendarEntrevistaModal
        isOpen={waAgendarOpen}
        onClose={() => setWaAgendarOpen(false)}
        candidates={candidate ? [candidate] : []}
        jobTitle={candidate?.role}
        onConfirmSend={() => {
          setStatus(candidateId, stage, 'continua');
          const idx = ONEPAGE_PIPELINE_STAGES.indexOf(stage);
          if (idx >= 0 && idx < ONEPAGE_PIPELINE_STAGES.length - 1) {
            const next = ONEPAGE_PIPELINE_STAGES[idx + 1];
            navigate(`/pipeline/${jobId}/candidate/${candidateId}?stage=${next}`, { replace: true });
          }
          showToast('Entrevista agendada · Candidato pasado a Entrevistas');
        }}
      />

    </div>
  );
}

// ─── Mock CV helpers (used inside openMockCv) ─────────────────────────────────

const MOCK_EDUCATION: Record<string, { degree: string; institution: string; year: string }[]> = {
  'Recepcionista': [
    { degree: 'Técnico en Atención al Usuario y Gestión Documental', institution: 'SENA', year: '2019' },
    { degree: 'Bachiller Académico', institution: 'Colegio Nuestra Señora de la Paz', year: '2017' },
  ],
  'Auxiliar de Bodega': [
    { degree: 'Técnico en Logística y Almacenamiento', institution: 'SENA', year: '2018' },
    { degree: 'Bachiller Técnico en Gestión Empresarial', institution: 'Instituto Técnico Central', year: '2016' },
  ],
  'Analista de Talento Humano': [
    { degree: 'Psicología', institution: 'Universidad de Manizales', year: '2020' },
    { degree: 'Diplomado en Selección por Competencias', institution: 'Pontificia Universidad Javeriana', year: '2021' },
  ],
  'Jefe de Finanzas': [
    { degree: 'Contador Público', institution: 'Universidad Nacional de Colombia', year: '2015' },
    { degree: 'Especialización en Finanzas Corporativas', institution: 'Universidad de los Andes', year: '2018' },
  ],
  'Gerente de Ventas': [
    { degree: 'Administración de Empresas', institution: 'Universidad EAFIT', year: '2014' },
    { degree: 'MBA con énfasis en Mercadeo y Ventas', institution: 'Universidad del Norte', year: '2017' },
  ],
};

const MOCK_SKILLS: Record<string, string[]> = {
  'Recepcionista':            ['Gestión de agenda y turnos', 'Atención al paciente', 'Microsoft Office', 'Servicio al cliente', 'Comunicación verbal'],
  'Auxiliar de Bodega':       ['Manejo de inventarios', 'Operación de montacargas', 'WMS básico', 'Control de stock', 'Trabajo en equipo'],
  'Analista de Talento Humano': ['Reclutamiento y selección', 'Entrevistas por competencias', 'ATS', 'Nómina básica', 'Indicadores de RRHH'],
  'Jefe de Finanzas':         ['Contabilidad y costos', 'Presupuestación', 'Excel avanzado', 'NIIF', 'Power BI', 'SAP'],
  'Gerente de Ventas':        ['Liderazgo comercial', 'Negociación B2B', 'CRM (Salesforce)', 'KPIs de ventas', 'Gestión de equipo'],
};

function _mockPhone(name: string): string {
  const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const n = 3000000000 + (seed % 6999999999);
  const s = String(Math.abs(n)).slice(0, 10);
  return `+57 ${s.slice(0,3)} ${s.slice(3,6)} ${s.slice(6)}`;
}

function _mockEmail(name: string): string {
  const clean = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.');
  const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
  const seed = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
  return `${clean}@${domains[seed % domains.length]}`;
}


// ─── Accordion section ────────────────────────────────────────────────────────

interface AccordionSectionProps {
  number: number;
  title: string;
  score?: number | null;
  statusText: string;
  statusOk?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  isLocked: boolean;
  children?: React.ReactNode;
}

function AccordionSection({
  number,
  title,
  score,
  statusText,
  statusOk,
  isOpen,
  onToggle,
  isLocked,
  children,
}: AccordionSectionProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        opacity: isLocked ? 0.55 : 1,
      }}
    >
      {/* Header */}
      <div
        onClick={isLocked ? undefined : onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          cursor: isLocked ? 'default' : 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '18px',
                color: 'var(--color-brand-primary)',
              }}
            >
              {number}.
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '18px',
                color: 'var(--color-brand-primary)',
              }}
            >
              {title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {statusOk ? (
              <CheckCircle2 size={16} color="var(--color-positive-500)" />
            ) : statusText === 'Descartado' ? (
              <X size={16} color="var(--color-danger, #c0392b)" />
            ) : isLocked ? (
              <HelpCircle size={16} color="var(--color-neutral-400)" />
            ) : (
              <HelpCircle size={16} color="var(--color-neutral-400)" />
            )}
            <span
              style={{
                fontSize: '13px',
                color: statusOk
                  ? 'var(--color-positive-600)'
                  : statusText === 'Descartado'
                  ? 'var(--color-danger, #c0392b)'
                  : 'var(--color-text-muted)',
                fontWeight: 600,
              }}
            >
              {statusText}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {score !== undefined && (
            <div
              style={{
                background: score === null ? 'var(--color-surface-muted)' : 'var(--color-secondary-50)',
                border: score === null
                  ? '1px solid var(--color-border-default)'
                  : '1px solid var(--color-brand-accent-light)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 16px',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '20px',
                color: score === null ? 'var(--color-neutral-400)' : 'var(--color-brand-accent)',
              }}
            >
              {score === null ? '—' : score}
            </div>
          )}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: isLocked ? 'var(--color-surface-subtle)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isLocked
              ? <Lock size={20} color="var(--color-neutral-400)" />
              : isOpen
                ? <ChevronUp size={20} color="var(--color-text-muted)" />
                : <ChevronDown size={20} color="var(--color-text-muted)" />
            }
          </div>
        </div>
      </div>

      {/* Content */}
      {isOpen && children && (
        <div
          style={{
            padding: '16px 24px 24px',
            borderTop: '1px solid var(--color-border-default)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── RUNT Verification Modal ──────────────────────────────────────────────────

type RuntData = {
  cc: string;
  totalManifiestos: number;
  licenseCategories: { categoria: string; fechaExpedicion: string; fechaVencimiento: string }[];
};

function RuntModal({ runt, onClose }: { runt: RuntData; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          overflow: 'hidden',
          minWidth: '460px',
          maxWidth: '540px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark header */}
        <div
          style={{
            background: '#1a1a2e',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px' }}>
            Verificación RUNT — Licencia Nro: {runt.cc}
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', padding: '2px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Table */}
        <div style={{ padding: '0' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#f5f5f7', borderBottom: '1px solid #e2e2e4' }}>
            {['Categoría', 'Fecha expedición', 'Fecha vencimiento'].map((h) => (
              <div key={h} style={{ padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: '#363539' }}>
                {h}
              </div>
            ))}
          </div>
          {/* Table rows */}
          {runt.licenseCategories.map((row, i) => (
            <div
              key={i}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                borderBottom: i < runt.licenseCategories.length - 1 ? '1px solid #e2e2e4' : 'none',
              }}
            >
              <div style={{ padding: '10px 16px', fontFamily: 'var(--font-display)', fontSize: '13px', color: '#363539', fontWeight: 600 }}>{row.categoria}</div>
              <div style={{ padding: '10px 16px', fontFamily: 'var(--font-display)', fontSize: '13px', color: '#363539' }}>{row.fechaExpedicion}</div>
              <div style={{ padding: '10px 16px', fontFamily: 'var(--font-display)', fontSize: '13px', color: '#363539' }}>{row.fechaVencimiento}</div>
            </div>
          ))}
        </div>

        {/* Total manifiestos */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e2e4', background: '#fafafa' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: '#363539' }}>
            Total de manifiestos expedidos en el rango de fechas solicitado:{' '}
            <strong style={{ color: 'var(--color-brand-primary)' }}>{runt.totalManifiestos}</strong>
          </span>
        </div>

        {/* Disclaimer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #e2e2e4', background: '#f5f5f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Validado por medio de Runt Pro
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Prescreening content ─────────────────────────────────────────────────────

function PrescreeningContent({ prescreening, hasCV, runt, candidateScore = 0, isPendingEvaluaciones = false }: {
  prescreening: NonNullable<Candidate['prescreeningAI']>;
  hasCV?: boolean;
  runt?: RuntData;
  candidateScore?: number;
  isPendingEvaluaciones?: boolean;
}) {
  const [runtModalOpen, setRuntModalOpen] = useState(false);
  const antVar: VariantKey = candidateScore >= 80 ? 'sin_novedad' : 'alto_riesgo';

  return (
    <div style={{ paddingTop: '20px' }}>
      {/* WhatsApp profile pill — shown only when candidate has no CV */}
      {hasCV === false && (
        <div style={{ marginBottom: '16px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '999px',
              background: '#E8F8EF',
              border: '1px solid #25D366',
              fontSize: '12px',
              fontWeight: 600,
              color: '#1a7a42',
              fontFamily: 'var(--font-display)',
            }}
          >
            <WaIcon size={14} color="#25D366" />
            Perfil construido vía WhatsApp
          </span>
        </div>
      )}

      {/* Resumen candidato */}
      <div style={{ marginBottom: runt ? '16px' : '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', margin: '0 0 8px', color: 'var(--color-text-primary)' }}>
          Resumen del candidato
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          {prescreening.resumen}
        </p>
      </div>

      {/* RUNT action buttons — only shown when runt data is available */}
      {runt && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <Button variant="secondary" size="sm" onClick={() => setRuntModalOpen(true)}>
            Consulta Runt
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open('/manifiestos-vigia.pdf', '_blank')}
          >
            Ver Manifiestos
          </Button>
        </div>
      )}

      {/* RUNT Modal */}
      {runtModalOpen && runt && (
        <RuntModal runt={runt} onClose={() => setRuntModalOpen(false)} />
      )}

      {/* No negociables with scores */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            border: '1.5px solid #d4d4d5',
            borderRadius: '26px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.43)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 190px 1fr',
              background: '#f7f7f8',
              borderBottom: '1px solid #d4d4d5',
            }}
          >
            <div style={{ padding: '11px 24px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', lineHeight: '20px', color: '#363539' }}>
              No negociables
            </div>
            <div style={{ padding: '11px 8px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', lineHeight: '20px', color: '#363539', textAlign: 'center', borderLeft: '1px solid #d4d4d5' }}>
              Evaluación
            </div>
            <div style={{ padding: '11px 16px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', lineHeight: '20px', color: '#363539', borderLeft: '1px solid #d4d4d5' }}>
              Detalle / Evidencia
            </div>
          </div>

          {/* Data rows */}
          {(prescreening.noNegociables as any[]).map((item: any, i: number) => {
            const score: number = item.score ?? 0;
            const isHighScore = score >= 90;
            const trackBg = isHighScore ? '#f0f0f0' : '#f2ecfe';
            const fillBg  = isHighScore ? '#27be69' : '#8750f6';
            const barFill = Math.round((score / 100) * 128);
            const isLast  = i === prescreening.noNegociables.length - 1;

            return (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '220px 190px 1fr',
                  borderBottom: isLast ? 'none' : '1px solid #d4d4d5',
                  alignItems: 'stretch',
                }}
              >
                {/* Col 1 — label */}
                <div style={{ padding: '14px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', lineHeight: '21px', color: '#363539', display: 'flex', alignItems: 'center' }}>
                  {item.label}
                </div>

                {/* Col 2 — score bar + number */}
                <div style={{ padding: '14px 8px', borderLeft: '1px solid #d4d4d5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  {/* Track */}
                  <div style={{ width: '100px', height: '8px', borderRadius: '4px', background: trackBg, flexShrink: 0, overflow: 'hidden' }}>
                    <div style={{ width: `${barFill * 100 / 128}%`, height: '100%', borderRadius: '4px', background: fillBg }} />
                  </div>
                  {/* Number */}
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px', color: '#434245', minWidth: '28px', textAlign: 'right' }}>
                    {score}
                  </span>
                </div>

                {/* Col 3 — evidence */}
                <div style={{ padding: '14px 16px', borderLeft: '1px solid #d4d4d5', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '13px', lineHeight: '21px', color: '#363539' }}>
                  {item.evidencia}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plus detectados + Señales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', margin: '0 0 12px', color: 'var(--color-text-primary)' }}>
            Plus detectados
          </h3>
          {prescreening.plusDetectados.map((raw, i) => {
            let label = '';
            let description = typeof raw === 'string' ? raw : '';
            try {
              const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
              if (parsed && typeof parsed === 'object') {
                label = parsed.label ?? '';
                description = parsed.description ?? '';
              }
            } catch { /* keep raw */ }
            return (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <Trophy size={18} color="var(--color-warning-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {label && <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: '2px' }}>{label}</strong>}
                  {description}
                </p>
              </div>
            );
          })}
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', margin: '0 0 12px', color: 'var(--color-text-primary)' }}>
            Señales para validar
          </h3>
          {prescreening.senales.map((raw, i) => {
            let type = 'warning';
            let description = typeof raw === 'string' ? raw : '';
            try {
              const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
              if (parsed && typeof parsed === 'object') {
                type = parsed.type ?? 'warning';
                description = parsed.description ?? '';
              }
            } catch { /* keep raw */ }
            const iconMap: Record<string, React.ReactNode> = {
              warning:   <AlertTriangle size={16} color="var(--color-warning-600)" style={{ flexShrink: 0, marginTop: '2px' }} />,
              lightbulb: <Lightbulb size={16} color="var(--color-brand-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />,
              target:    <Target size={16} color="var(--color-info-600, #0ea5e9)" style={{ flexShrink: 0, marginTop: '2px' }} />,
            };
            const icon = iconMap[type] ?? <MessageSquare size={16} color="var(--color-info-600)" style={{ flexShrink: 0, marginTop: '2px' }} />;
            return (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                {icon}
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validación de Antecedentes — colapsable al final del acordeón */}
      <div style={{ marginTop: '24px' }}>
        {isPendingEvaluaciones ? (
          <div style={{ padding: '8px 0', color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
            Pendiente: la validación de antecedentes aún no ha sido completada.
          </div>
        ) : (
          <ValidacionAntecedentes variant={antVar} collapsible defaultOpen={false} />
        )}
      </div>
    </div>
  );
}

// ─── Entrevistas content (inline tabs + form) ────────────────────────────────

const recomendacionOptions: { value: RecomendacionValue; label: string }[] = [
  { value: 'definitivamente', label: 'Sí, definitivamente' },
  { value: 'con_reservas', label: 'Sí, con reservas' },
  { value: 'no_seguro', label: 'No estoy seguro' },
  { value: 'no_recomiendo', label: 'No recomiendo' },
];

function emptyFeedback(): InterviewFeedback {
  return {
    destacados: '',
    ratingA: 0,
    ratingB: 0,
    ratingC: 0,
    senalAlerta: '',
    recomendacion: null,
    date: '—',
    duration: '—',
    interviewer: '—',
  };
}

// ─── Read-only feedback display ───────────────────────────────────────────────

function FeedbackReadOnly({
  isHM,
  feedback,
  onEdit,
}: {
  isHM: boolean;
  feedback: InterviewFeedback;
  onEdit: () => void;
}) {
  const labelA = isHM ? 'Dominio técnico del rol' : 'Alineación cultura de la empresa';
  const labelB = isHM ? 'Experiencia relevante' : 'Actitud e iniciativa';
  const labelC = isHM ? 'Afinidad con el equipo' : 'Habilidades interpersonales';
  const selectedOpt = recomendacionOptions.find((o) => o.value === feedback.recomendacion);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <p style={roLabelStyle}>1. ¿Qué es lo más destacado del candidato?</p>
        <p style={roValueStyle}>{feedback.destacados || '—'}</p>
      </div>
      <div>
        <p style={roLabelStyle}>2. {labelA}</p>
        <StarRating value={feedback.ratingA} readonly />
      </div>
      <div>
        <p style={roLabelStyle}>3. {labelB}</p>
        <StarRating value={feedback.ratingB} readonly />
      </div>
      <div>
        <p style={roLabelStyle}>4. {labelC}</p>
        <StarRating value={feedback.ratingC} readonly />
      </div>
      <div>
        <p style={roLabelStyle}>5. Señales de alerta</p>
        <p style={roValueStyle}>{feedback.senalAlerta || 'Sin señales reportadas.'}</p>
      </div>
      <div>
        <p style={roLabelStyle}>6. Recomendación</p>
        {selectedOpt ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-brand-accent)',
            background: 'var(--color-secondary-50)',
            fontFamily: 'var(--font-display)', fontSize: '13px',
            fontWeight: 600, color: 'var(--color-brand-accent)',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-brand-accent)' }} />
            {selectedOpt.label}
          </div>
        ) : (
          <p style={roValueStyle}>—</p>
        )}
      </div>
      <div style={{ borderTop: '1px solid var(--color-border-default)', paddingTop: '14px' }}>
        <Button variant="outline" size="md" onClick={onEdit}>
          <Pencil size={14} />
          Editar
        </Button>
      </div>
    </div>
  );
}

// ─── EntrevistasContent ───────────────────────────────────────────────────────

function EntrevistasContent({
  candidateId,
  interview,
  savedFeedback,
}: {
  candidateId: string;
  jobId: string;
  interview: ReturnType<typeof interviewData.find>;
  savedFeedback: ReturnType<ReturnType<typeof useInterview>['getFeedback']>;
}) {
  const { setFeedback } = useInterview();
  const [activeTab, setActiveTab] = useState<'hr' | 'hm'>('hr');

  const [hrForm, setHrForm] = useState<InterviewFeedback>(
    savedFeedback.hr ?? interview?.hrFeedback ?? emptyFeedback()
  );
  const [hmForm, setHmForm] = useState<InterviewFeedback>(() => {
    const base = savedFeedback.hm ?? interview?.hmFeedback;
    if (base) return base;
    // Pending: prefill metadata from hmMeta so the header row is visible
    const meta = interview?.hmMeta;
    return {
      ...emptyFeedback(),
      date:        meta?.date        ?? '—',
      duration:    meta?.duration    ?? '—',
      interviewer: meta?.interviewer ?? '—',
    };
  });

  // Track whether HM has data (from context, mock, or localStorage landing page)
  const [hmHasData, setHmHasData] = useState<boolean>(() => {
    if (savedFeedback.hm || interview?.hmFeedback) return true;
    try { return !!localStorage.getItem(`unio_hm_feedback_${candidateId}`); } catch { return false; }
  });

  const [hrReadOnly, setHrReadOnly] = useState<boolean>(
    !!(savedFeedback.hr ?? interview?.hrFeedback)
  );
  const [hmReadOnly, setHmReadOnly] = useState<boolean>(() => {
    if (savedFeedback.hm ?? interview?.hmFeedback) return true;
    try { return !!localStorage.getItem(`unio_hm_feedback_${candidateId}`); } catch { return false; }
  });

  const [hrSaved, setHrSaved] = useState(false);
  const [hmSaved, setHmSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hrSubmitted, setHrSubmitted] = useState(false);
  const [hmSubmitted, setHmSubmitted] = useState(false);

  // Bridge: load HM feedback submitted from the external landing page
  useEffect(() => {
    if (!savedFeedback.hm && !interview?.hmFeedback) {
      try {
        const raw = localStorage.getItem(`unio_hm_feedback_${candidateId}`);
        if (raw) {
          const data = JSON.parse(raw) as InterviewFeedback;
          setHmForm(data);
          setFeedback(candidateId, 'hm', data);
          setHmHasData(true);
          setHmReadOnly(true);
        }
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const isHM = activeTab === 'hm';
  const feedback = isHM ? hmForm : hrForm;
  const setForm = isHM ? setHmForm : setHrForm;

  const handleChange = (field: string, value: string | number | RecomendacionValue | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveHR = () => {
    setHrSubmitted(true);
    const valid = hrForm.destacados.trim() !== '' && hrForm.ratingA > 0 && hrForm.ratingB > 0 && hrForm.ratingC > 0 && hrForm.recomendacion !== null;
    if (!valid) return;
    setFeedback(candidateId, 'hr', hrForm);
    setHrReadOnly(true);
    setHrSaved(true);
    setTimeout(() => setHrSaved(false), 2500);
  };

  const handleSaveHM = () => {
    setHmSubmitted(true);
    const valid = hmForm.destacados.trim() !== '' && hmForm.ratingA > 0 && hmForm.ratingB > 0 && hmForm.ratingC > 0 && hmForm.recomendacion !== null;
    if (!valid) return;
    setFeedback(candidateId, 'hm', hmForm);
    try { localStorage.setItem(`unio_hm_feedback_${candidateId}`, JSON.stringify(hmForm)); } catch { /* ignore */ }
    setHmReadOnly(true);
    setHmHasData(true);
    setHmSaved(true);
    setTimeout(() => setHmSaved(false), 2500);
  };

  const handleCopyLink = () => {
    if (interview?.hmLink) {
      navigator.clipboard.writeText(interview.hmLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHMPending = !hmHasData && interview?.hmStatus !== 'completed';
  const showHMPending = isHM && isHMPending;

  const labelA = isHM ? 'Dominio técnico del rol' : 'Alineación cultura de la empresa';
  const labelB = isHM ? 'Experiencia relevante' : 'Actitud e iniciativa';
  const labelC = isHM ? 'Afinidad con el equipo' : 'Habilidades interpersonales';

  return (
    <div style={{ paddingTop: '20px' }}>
      {/* Tabs — Figma style: underline active in purple */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '28px',
        }}
      >
        {(['hr', 'hm'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 16px 10px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'flex-start',
                position: 'relative',
                marginRight: '16px',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '18px',
                    color: isActive ? 'var(--color-brand-accent)' : 'var(--color-neutral-400)',
                    lineHeight: '27px',
                  }}
                >
                  {tab === 'hr' ? 'Entrevista HR' : 'Hiring Manager'}
                </span>
                {tab === 'hm' && isHMPending && (
                  <Badge variant="en_pausa" small>Pendiente</Badge>
                )}
              </span>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: '16px',
                  height: '2.5px',
                  borderRadius: '22px',
                  background: isActive ? 'var(--color-brand-accent)' : 'var(--color-neutral-100)',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* ── Panel de envío de link — oculto, reservado para futuras implementaciones ── */}
      {false && showHMPending && (
        <div>
          <div
            style={{
              border: '1.5px dashed var(--color-border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              background: 'var(--color-surface-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '36px' }}>📧</span>
            <div>
              <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-text-primary)' }}>
                Envía el formulario al Hiring Manager
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-muted)', maxWidth: '400px', lineHeight: '1.6' }}>
                Comparte este link con el Hiring Manager para que califique su entrevista.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', background: '#ffffff', overflow: 'hidden', width: '100%', maxWidth: '520px' }}>
              <span style={{ flex: 1, padding: '0 16px', fontSize: '13px', color: 'var(--color-brand-accent)', fontFamily: 'var(--font-display)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {interview?.hmLink}
              </span>
              <Button variant="primary" size="md" onClick={handleCopyLink} style={{ borderRadius: '0', flexShrink: 0 }}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado' : 'Copiar link'}
              </Button>
            </div>
          </div>
          <div style={{ borderLeft: '3px solid var(--color-brand-accent)', background: 'var(--color-secondary-50)', padding: '12px 16px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            <strong>💡 Tip:</strong> El Hiring Manager recibirá un formulario simple de 6 preguntas que tomará entre 60–90 segundos completar.
          </div>
        </div>
      )}

      {/* ── Formulario de feedback (HR y HM siempre inline) ── */}
      {(() => {
        const isReadOnly = isHM ? hmReadOnly : hrReadOnly;
        const handleSave = isHM ? handleSaveHM : handleSaveHR;
        const setReadOnly = isHM ? setHmReadOnly : setHrReadOnly;
        const savedBanner = isHM ? hmSaved : hrSaved;
        const submitted = isHM ? hmSubmitted : hrSubmitted;

          if (isReadOnly) {
            return (
              <div>
                {feedback.date !== '—' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <InterviewMetaItem icon={<Calendar size={14} />} text={feedback.date} />
                    <InterviewMetaItem icon={<Clock size={14} />} text={feedback.duration} />
                    <InterviewMetaItem icon={<User size={14} />} text={feedback.interviewer} />
                  </div>
                )}
                <FeedbackReadOnly
                  isHM={isHM}
                  feedback={feedback}
                  onEdit={() => setReadOnly(false)}
                />
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Metadata */}
              {feedback.date !== '—' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <InterviewMetaItem icon={<Calendar size={14} />} text={feedback.date} />
                  <InterviewMetaItem icon={<Clock size={14} />} text={feedback.duration} />
                  <InterviewMetaItem icon={<User size={14} />} text={feedback.interviewer} />
                </div>
              )}

              {/* Q1 */}
              <div>
                <label style={interviewLabelStyle}>
                  1. ¿Qué es lo que más destacas del candidato?{' '}
                  <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <textarea
                  placeholder="Escribe lo más destacado del candidato..."
                  value={feedback.destacados}
                  onChange={(e) => handleChange('destacados', e.target.value)}
                  style={{
                    ...interviewTextareaStyle,
                    borderColor: submitted && !feedback.destacados.trim() ? 'var(--color-danger, #ef4444)' : undefined,
                  }}
                  rows={4}
                />
                {submitted && !feedback.destacados.trim() && (
                  <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)', marginTop: '4px', display: 'block' }}>
                    Este campo es obligatorio
                  </span>
                )}
              </div>

              {/* Q2 */}
              <div>
                <label style={interviewLabelStyle}>
                  2. {labelA} <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <StarRating value={feedback.ratingA} onChange={(v) => handleChange('ratingA', v)} />
                {submitted && feedback.ratingA === 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)', marginTop: '4px', display: 'block' }}>
                    Selecciona una calificación
                  </span>
                )}
              </div>

              {/* Q3 */}
              <div>
                <label style={interviewLabelStyle}>
                  3. {labelB} <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <StarRating value={feedback.ratingB} onChange={(v) => handleChange('ratingB', v)} />
                {submitted && feedback.ratingB === 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)', marginTop: '4px', display: 'block' }}>
                    Selecciona una calificación
                  </span>
                )}
              </div>

              {/* Q4 */}
              <div>
                <label style={interviewLabelStyle}>
                  4. {labelC} <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <StarRating value={feedback.ratingC} onChange={(v) => handleChange('ratingC', v)} />
                {submitted && feedback.ratingC === 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)', marginTop: '4px', display: 'block' }}>
                    Selecciona una calificación
                  </span>
                )}
              </div>

              {/* Q5 opcional */}
              <div>
                <label style={interviewLabelStyle}>
                  5. ¿Alguna señal de alerta?{' '}
                  <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }}>
                    (Opcional)
                  </span>
                </label>
                <textarea
                  placeholder="Escribe si detectaste alguna señal de alerta..."
                  value={feedback.senalAlerta}
                  onChange={(e) => handleChange('senalAlerta', e.target.value)}
                  style={interviewTextareaStyle}
                  rows={3}
                />
              </div>

              {/* Q6 */}
              <div>
                <label style={interviewLabelStyle}>
                  6. ¿Recomendarías avanzar al candidato?{' '}
                  <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {recomendacionOptions.map((opt) => {
                    const isSelected = feedback.recomendacion === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange('recomendacion', opt.value)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '12px 16px', borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${isSelected ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                          background: isSelected ? 'var(--color-secondary-50)' : '#ffffff',
                          cursor: 'pointer', fontFamily: 'var(--font-display)',
                          fontSize: '14px', fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? 'var(--color-brand-accent)' : 'var(--color-text-primary)',
                          transition: 'all 0.15s ease', textAlign: 'left',
                        }}
                      >
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%',
                          border: `2px solid ${isSelected ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                          background: isSelected ? 'var(--color-brand-accent)' : 'transparent',
                          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isSelected && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                          )}
                        </div>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {submitted && feedback.recomendacion === null && (
                  <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)', marginTop: '6px', display: 'block' }}>
                    Selecciona una opción
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--color-border-default)' }}>
                <Button variant="primary" size="md" onClick={handleSave}>
                  Guardar feedback
                </Button>
              </div>

              {savedBanner && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 14px', background: 'var(--color-success-bg, #ecfdf5)',
                  color: 'var(--color-success, #059669)', borderRadius: 'var(--radius-sm)',
                  fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: 600,
                }}>
                  <Check size={14} /> Feedback guardado correctamente
                </div>
              )}
            </div>
          );
        })()}
    </div>
  );
}

function InterviewMetaItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
      {icon}
      {text}
    </div>
  );
}

const interviewLabelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  marginBottom: '10px',
};

const interviewTextareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  resize: 'vertical',
  outline: 'none',
  background: '#ffffff',
  boxSizing: 'border-box',
};

const roLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  margin: '0 0 6px',
};

const roValueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  margin: 0,
  lineHeight: '1.6',
};
