import { useState, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, ExternalLink, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { KnowledgeTestResult } from '../../data/mock';

// ─── Score header ──────────────────────────────────────────────────────────────

function scoreBand(score: number): { label: string; bg: string; fg: string } {
  if (score >= 80) return { label: 'Aprobado', bg: '#edf7f2', fg: '#1a8a55' };
  if (score >= 65) return { label: 'Aprobado con reservas', bg: '#fffbeb', fg: '#b45309' };
  return { label: 'No aprobado', bg: '#fef2f2', fg: '#dc2626' };
}

// ─── Category breakdown ────────────────────────────────────────────────────────

interface CategoryRow {
  name: string;
  correct: number;
  total: number;
}

function buildCategories(questions: KnowledgeTestResult['questions']): CategoryRow[] {
  const map = new Map<string, { correct: number; total: number }>();
  questions.forEach((q) => {
    const cur = map.get(q.category) ?? { correct: 0, total: 0 };
    map.set(q.category, { correct: cur.correct + (q.isCorrect ? 1 : 0), total: cur.total + 1 });
  });
  return Array.from(map.entries()).map(([name, val]) => ({ name, ...val }));
}

function CategoryBreakdown({ categories, animated }: { categories: CategoryRow[]; animated: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: '#252432' }}>
        Desempeño por categoría
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 24px' }}>
        {categories.map((cat, i) => {
          const pct = Math.round((cat.correct / cat.total) * 100);
          const color = pct >= 80 ? '#1a8a55' : pct >= 60 ? '#b45309' : '#dc2626';
          const trackColor = pct >= 80 ? '#edf7f2' : pct >= 60 ? '#fffbeb' : '#fef2f2';
          return (
            <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: '#434245', fontWeight: 500 }}>
                  {cat.name}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color, fontWeight: 700 }}>
                  {cat.correct}/{cat.total}
                </span>
              </div>
              <div style={{ height: '6px', borderRadius: '999px', background: trackColor, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: '999px',
                    transformOrigin: 'left',
                    transform: animated ? 'scaleX(1)' : 'scaleX(0)',
                    transition: `transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 80}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Question list ─────────────────────────────────────────────────────────────

function QuestionList({ questions }: { questions: KnowledgeTestResult['questions'] }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW = 5;
  const visible = expanded ? questions : questions.slice(0, PREVIEW);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: '#252432' }}>
          Resumen de respuestas
        </h4>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: '#6b6a6e' }}>
          {questions.length} preguntas
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {visible.map((q) => (
          <div
            key={q.id}
            style={{
              display: 'flex',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: `1px solid ${q.isCorrect ? '#d1fae5' : '#fee2e2'}`,
              background: q.isCorrect ? '#f0fdf4' : '#fff5f5',
              alignItems: 'flex-start',
            }}
          >
            {q.isCorrect
              ? <CheckCircle2 size={15} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
              : <XCircle size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
            }
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '1px 7px',
                    borderRadius: '999px',
                    background: '#e8ddfd',
                    color: '#6a3fbb',
                    fontFamily: 'var(--font-display)',
                    fontSize: '10px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {q.category}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: '#252432', lineHeight: '1.45', fontWeight: 500 }}>
                  {q.question}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: q.isCorrect ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  Respuesta: {q.selectedAnswer}
                </span>
                {!q.isCorrect && (
                  <>
                    <span style={{ color: '#d1d5db', fontSize: '11px' }}>·</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: '#6b6a6e' }}>
                      Correcta: <strong>{q.correctAnswer}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length > PREVIEW && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-secondary-base, #8750f6)',
          }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Ver menos' : `Ver las ${questions.length - PREVIEW} preguntas restantes`}
        </button>
      )}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────

interface PruebaConocimientoContentProps {
  data: KnowledgeTestResult;
}

export default function PruebaConocimientoContent({ data }: PruebaConocimientoContentProps) {
  const band = scoreBand(data.score);
  const categories = buildCategories(data.questions);
  const barRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAnimated(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (barRef.current) obs.observe(barRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Score summary */}
      <div
        ref={barRef}
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'stretch',
        }}
      >
        {/* Score card */}
        <div
          style={{
            flex: '1 1 180px',
            padding: '20px 24px',
            borderRadius: '16px',
            border: `1px solid ${band.bg === '#edf7f2' ? '#bbf7d0' : band.bg === '#fffbeb' ? '#fde68a' : '#fecaca'}`,
            background: band.bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <BookOpen size={22} style={{ color: band.fg, opacity: 0.7 }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 800, color: band.fg, lineHeight: 1 }}>
              {data.score}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: band.fg, opacity: 0.7 }}>
              /100
            </span>
          </div>
          <span
            style={{
              padding: '3px 12px',
              borderRadius: '999px',
              background: band.fg,
              color: '#ffffff',
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {band.label}
          </span>
        </div>

        {/* Stats */}
        <div style={{ flex: '2 1 260px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
          {/* Score bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: '#6b6a6e' }}>Resultado</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: band.fg }}>
                {data.correct} de {data.totalQuestions} correctas
              </span>
            </div>
            <div style={{ height: '8px', borderRadius: '999px', background: '#e5e7eb', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(data.correct / data.totalQuestions) * 100}%`,
                  background: band.fg,
                  borderRadius: '999px',
                  transformOrigin: 'left',
                  transform: animated ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94) 100ms',
                }}
              />
            </div>
          </div>

          {/* Correct / Incorrect chips */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                background: '#f0fdf4',
                border: '1px solid #d1fae5',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>
                  {data.correct}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: '#16a34a', fontWeight: 500 }}>
                  correctas
                </div>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <XCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>
                  {data.incorrect}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: '#dc2626', fontWeight: 500 }}>
                  incorrectas
                </div>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: '#6b6a6e', fontWeight: 500, marginBottom: '2px' }}>
                  Total preguntas
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#252432', lineHeight: 1 }}>
                  {data.totalQuestions}
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: '#9ca3af' }}>
            Completado: {data.completedAt}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <CategoryBreakdown categories={categories} animated={animated} />

      {/* Question list */}
      <QuestionList questions={data.questions} />

      {/* Observations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: '#252432' }}>
          Observaciones del evaluador
        </h4>
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            color: '#434245',
            lineHeight: '1.65',
          }}
        >
          {data.observations}
        </div>
      </div>

      {/* External link button */}
      <div>
        <a
          href={data.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1.5px solid var(--color-secondary-base, #8750f6)',
            background: '#ffffff',
            color: 'var(--color-secondary-base, #8750f6)',
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f2ecfe')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
        >
          <ExternalLink size={15} />
          Ver respuestas completas en plataforma
        </a>
      </div>
    </div>
  );
}
