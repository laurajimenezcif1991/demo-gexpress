import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Copy, Check, MessageSquare, Info } from 'lucide-react';
import type { PsychTestResult, PsychFitCard, RadarPoint } from '../../data/mock';

// ─── Match badge logic ────────────────────────────────────────────────────────

type MatchLevel = 'match_perfecto' | 'match_fuerte' | 'gap_menor' | 'gap_detectado';

function getMatchLevel(idealScore: number, candidateScore: number): MatchLevel {
  const diff = idealScore - candidateScore;
  if (diff <= 1 && diff >= -1) return 'match_perfecto';
  if (diff <= 0) return 'match_fuerte';
  if (diff <= 5) return 'gap_menor';
  return 'gap_detectado';
}

const matchConfig: Record<MatchLevel, { label: string; bg: string; color: string }> = {
  match_perfecto: { label: 'Match perfecto', bg: 'var(--color-positive-50, #f0fdf4)', color: 'var(--color-positive-600, #16a34a)' },
  match_fuerte:   { label: 'Match fuerte',   bg: 'var(--color-positive-50, #f0fdf4)', color: 'var(--color-positive-600, #16a34a)' },
  gap_menor:      { label: 'Gap menor',       bg: 'var(--color-warning-100, #fef9c3)', color: 'var(--color-warning-700, #a16207)' },
  gap_detectado:  { label: 'Gap detectado',   bg: 'var(--color-warning-100, #fef9c3)', color: 'var(--color-warning-700, #a16207)' },
};

// ─── ScoreFitCard ─────────────────────────────────────────────────────────────

interface ScoreFitCardProps {
  card: PsychFitCard;
  index: number;
  animated: boolean;
}

function ScoreFitCard({ card, index, animated }: ScoreFitCardProps) {
  const [expanded, setExpanded] = useState(false);
  const matchLevel = getMatchLevel(card.idealScore, card.candidateScore);
  const match = matchConfig[matchLevel];
  const candidatePct = Math.min(100, Math.max(0, card.candidateScore));
  const idealPct = Math.min(100, Math.max(0, card.idealScore));
  const animDelay = index * 80;

  return (
    <div
      style={{
        borderRadius: '16px',
        border: '1px solid #d4d4d5',
        background: '#ffffff',
        overflow: 'hidden',
        opacity: animated ? 1 : 0,
        transform: animated ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 0.4s ease ${animDelay}ms, transform 0.4s ease ${animDelay}ms`,
      }}
    >
      {/* Header row */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: '#252432', flex: 1 }}>
            {card.axis}
          </span>
          {/* Match badge */}
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '999px',
              background: match.bg,
              color: match.color,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '11px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {match.label}
          </span>
        </div>

        {/* Score bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Labels row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              opacity: animated ? 1 : 0,
              transition: `opacity 0.3s ease ${animDelay + 700}ms`,
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: '#8750f6', fontWeight: 600 }}>
              Candidato: {card.candidateScore}
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: '#afaeb0', fontWeight: 500 }}>
              Ideal: {card.idealScore}
            </span>
          </div>

          {/* Bar track */}
          <div style={{ position: 'relative', height: '8px', borderRadius: '999px', background: '#e8ddfd', overflow: 'hidden' }}>
            {/* Candidate fill */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                width: `${candidatePct}%`,
                background: 'var(--color-secondary-base, #8750f6)',
                borderRadius: '999px',
                transformOrigin: 'left',
                transform: animated ? 'scaleX(1)' : 'scaleX(0)',
                transition: `transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${animDelay + 200}ms`,
              }}
            />
          </div>

          {/* Ideal reference line */}
          <div style={{ position: 'relative', height: '4px' }}>
            <div
              style={{
                position: 'absolute',
                left: `${idealPct}%`,
                top: 0,
                width: '2px',
                height: '10px',
                background: '#afaeb0',
                transform: 'translateX(-50%) translateY(-3px)',
                borderRadius: '1px',
                opacity: animated ? 1 : 0,
                transition: `opacity 0.3s ease ${animDelay + 700}ms`,
              }}
            />
          </div>
        </div>

        {/* Summary */}
        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '13px', color: '#6b6a6e', lineHeight: '1.5' }}>
          {card.summary}
        </p>

        {/* Toggle CTA */}
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
          {expanded ? 'Ocultar detalle' : 'Conocer detalle'}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid #f0eefe',
            padding: '14px 20px 16px',
            background: 'var(--color-secondary-50, #f2ecfe)',
          }}
        >
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '13px', color: '#3d2b7a', lineHeight: '1.65' }}>
            {card.detail}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Radar Chart ──────────────────────────────────────────────────────────────

interface RadarChartProps {
  points: RadarPoint[];
  animated: boolean;
}

function RadarChart({ points, animated }: RadarChartProps) {
  const size = 460;
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.36;
  const arcR = R * 1.18;   // outer colored ring radius
  const arcWidth = R * 0.1; // ring thickness
  const n = points.length;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // PRIMA axis color segments — P=pink, R=yellow, I=green, M=teal, A=blue
  const segmentColors = [
    '#fad4cc', // 0  Iniciativa         — P (Propulsión)
    '#fad4cc', // 1  Agente cambio       — P
    '#fad4cc', // 2  Proactividad        — P
    '#fcefc5', // 3  Inteligencia Social — R (Resonancia)
    '#fcefc5', // 4  Influencia          — R
    '#fcefc5', // 5  Actitud de servicio — R
    '#c8ecd9', // 6  Autonomía           — I (Impronta)
    '#c8ecd9', // 7  Agilidad            — I
    '#c8ecd9', // 8  Mentoreo            — I
    '#b8e8e4', // 9  Empatía             — M (Método)
    '#b8e8e4', // 10 Disponibilidad      — M
    '#b8e8e4', // 11 Atención Activa     — M
    '#b8e8e4', // 12 Precisión           — M
    '#c6e8f3', // 13 Excelencia técnica  — A (Autonomía)
    '#c6e8f3', // 14 P. Analítico        — A
    '#c6e8f3', // 15 Implementación      — A
  ];

  const angleOf = (i: number) => (2 * Math.PI * i) / n - Math.PI / 2;
  const sliceAngle = (2 * Math.PI) / n;

  const vertex = (i: number, r: number) => ({
    x: cx + r * Math.cos(angleOf(i)),
    y: cy + r * Math.sin(angleOf(i)),
  });

  // Build arc path for each segment (outer ring)
  const arcPath = (i: number) => {
    const a1 = angleOf(i) - sliceAngle / 2;
    const a2 = angleOf(i) + sliceAngle / 2;
    const innerR = arcR - arcWidth;
    const x1o = cx + arcR * Math.cos(a1);
    const y1o = cy + arcR * Math.sin(a1);
    const x2o = cx + arcR * Math.cos(a2);
    const y2o = cy + arcR * Math.sin(a2);
    const x1i = cx + innerR * Math.cos(a1);
    const y1i = cy + innerR * Math.sin(a1);
    const x2i = cx + innerR * Math.cos(a2);
    const y2i = cy + innerR * Math.sin(a2);
    return `M ${x1o.toFixed(1)} ${y1o.toFixed(1)} A ${arcR} ${arcR} 0 0 1 ${x2o.toFixed(1)} ${y2o.toFixed(1)} L ${x2i.toFixed(1)} ${y2i.toFixed(1)} A ${innerR} ${innerR} 0 0 0 ${x1i.toFixed(1)} ${y1i.toFixed(1)} Z`;
  };

  // Grid polygon paths
  const gridPaths = levels.map((lvl) => {
    const pts = Array.from({ length: n }, (_, i) => vertex(i, R * lvl));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
  });

  // Candidate polygon
  const candidatePts = points.map((p, i) => vertex(i, (p.value / 100) * R));
  const candidatePath = candidatePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';

  const pathLen = candidatePts.reduce((acc, p, i) => {
    const next = candidatePts[(i + 1) % n];
    return acc + Math.hypot(next.x - p.x, next.y - p.y);
  }, 0);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        {/* Outer colored arc segments */}
        {points.map((_, i) => (
          <path
            key={`arc-${i}`}
            d={arcPath(i)}
            fill={segmentColors[i]}
            opacity={animated ? 0.9 : 0}
            style={{ transition: `opacity 0.4s ease ${i * 30}ms` }}
          />
        ))}

        {/* Grid polygons */}
        {gridPaths.map((d, i) => (
          <path
            key={`grid-${i}`}
            d={d}
            fill={i === 4 ? 'rgba(0,0,0,0.03)' : 'none'}
            stroke="#d8d8d8"
            strokeWidth="0.8"
            opacity={animated ? 1 : 0}
            style={{ transition: `opacity 0.4s ease ${i * 60}ms` }}
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: n }, (_, i) => {
          const v = vertex(i, R);
          return (
            <line
              key={`axis-${i}`}
              x1={cx} y1={cy}
              x2={v.x} y2={v.y}
              stroke="#d8d8d8"
              strokeWidth="0.8"
              opacity={animated ? 1 : 0}
              style={{ transition: `opacity 0.4s ease ${i * 30}ms` }}
            />
          );
        })}

        {/* Candidate fill */}
        <path
          d={candidatePath}
          fill="rgba(60,60,60,0.08)"
          opacity={animated ? 1 : 0}
          style={{ transition: 'opacity 0.5s ease 900ms' }}
        />

        {/* Candidate stroke */}
        <path
          d={candidatePath}
          fill="none"
          stroke="#555555"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeDasharray={pathLen}
          strokeDashoffset={animated ? 0 : pathLen}
          style={{ transition: `stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1) 200ms` }}
        />

        {/* Vertex dots */}
        {candidatePts.map((pt, i) => (
          <circle
            key={`dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            fill="#555555"
            opacity={animated ? 1 : 0}
            style={{ transition: `opacity 0.3s ease ${1000 + i * 20}ms` }}
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => {
          const angle = angleOf(i);
          const labelR = arcR + 14;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          const anchor = Math.abs(Math.cos(angle)) < 0.15 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
          return (
            <g
              key={`label-${i}`}
              opacity={animated ? 1 : 0}
              style={{ transition: `opacity 0.3s ease ${1100 + i * 30}ms` }}
            >
              <text
                x={lx}
                y={ly - 7}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize="11"
                fontFamily="var(--font-display)"
                fill="#252432"
                fontWeight="600"
              >
                {p.label}
              </text>
              <text
                x={lx}
                y={ly + 8}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize="12"
                fontFamily="var(--font-display)"
                fill="#afaeb0"
                fontWeight="500"
              >
                {p.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Veredicto Conductual ─────────────────────────────────────────────────────

interface VeredictoProps {
  items: { title: string; body: string }[];
}

function VeredictoConuctual({ items }: VeredictoProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: '#252432' }}>
        Veredicto conductual
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--color-positive-500, #22c55e)', flexShrink: 0, marginTop: '3px' }} />
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '14px', color: '#434245', lineHeight: '1.6' }}>
              <strong style={{ fontWeight: 700, color: '#252432' }}>{item.title}</strong>
              <br />
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Preguntas para explorar ──────────────────────────────────────────────────

interface PreguntasProps {
  preguntas: { tag: string; question: string; validates: string }[];
}

function PreguntasParaExplorar({ preguntas }: PreguntasProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = preguntas
      .map((p, i) => `${i + 1}. ${p.question}\n   Valida eje: ${p.validates}`)
      .join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: '#252432' }}>
            Preguntas para explorar
          </h3>
          <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', fontSize: '13px', color: '#6b6a6e' }}>
            Para validar en próximas etapas
          </p>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid #d4d4d5',
            background: copied ? 'var(--color-positive-50, #f0fdf4)' : '#ffffff',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            color: copied ? 'var(--color-positive-600, #16a34a)' : '#434245',
            transition: 'all 0.2s ease',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar preguntas'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {preguntas.map((p, i) => (
          <div
            key={i}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid #e8ddfd',
              background: '#ffffff',
              display: 'flex',
              gap: '12px',
            }}
          >
            <MessageSquare size={16} style={{ color: '#8750f6', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color: '#8750f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Pregunta {i + 1}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: '#e8ddfd',
                    color: '#6a3fbb',
                    fontFamily: 'var(--font-display)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {p.tag}
                </span>
              </div>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '14px', color: '#3d2b7a', fontWeight: 500, lineHeight: '1.55' }}>
                {p.question}
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '12px', color: '#8a7bbf' }}>
                Valida eje: <strong>{p.validates}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface PruebaPsicologicaContentProps {
  data: PsychTestResult;
}

export default function PruebaPsicologicaContent({ data }: PruebaPsicologicaContentProps) {
  const [cardsAnimated, setCardsAnimated] = useState(false);
  const [radarAnimated, setRadarAnimated] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === cardsRef.current) {
              setCardsAnimated(true);
              obs.unobserve(entry.target);
            }
            if (entry.target === radarRef.current) {
              setRadarAnimated(true);
              obs.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    if (cardsRef.current) obs.observe(cardsRef.current);
    if (radarRef.current) obs.observe(radarRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Info banner */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '14px 16px',
          background: 'var(--color-secondary-50, #f2ecfe)',
          borderRadius: 'var(--radius-md, 12px)',
          border: '1px solid #e8ddfd',
        }}
      >
        <Info size={16} style={{ color: '#8750f6', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '14px', color: '#3d2b7a', lineHeight: '1.6' }}>
          {data.insight}
        </p>
      </div>

      {/* 1. Fit con el Rol */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: '#252432' }}>
            Fit con el Rol
          </h3>
          <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', fontSize: '13px', color: '#6b6a6e' }}>
            Derivado del RCP — no es un perfil genérico
          </p>
        </div>
        <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {data.fitCards.map((card, i) => (
            <ScoreFitCard key={card.axis} card={card} index={i} animated={cardsAnimated} />
          ))}
        </div>
      </div>

      {/* 2. Radar de competencias */}
      <div
        ref={radarRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '32px 20px',
          borderRadius: '16px',
          border: '1px solid #e8ddfd',
          background: '#ffffff',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: '#252432' }}>
            Radar de competencias
          </h3>
          <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-display)', fontSize: '13px', color: '#6b6a6e' }}>
            16 competencias derivadas de los 5 ejes PRIMA
          </p>
        </div>
        <RadarChart points={data.radarPoints} animated={radarAnimated} />
        {/* PRIMA Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: '#434245' }}>
            Leyenda de ejes:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
            {[
              { color: '#fad4cc', label: 'P (Propulsión)' },
              { color: '#fcefc5', label: 'R (Resonancia)' },
              { color: '#c8ecd9', label: 'I (Impronta)' },
              { color: '#b8e8e4', label: 'M (Método)' },
              { color: '#c6e8f3', label: 'A (Autonomía)' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 400, color: '#434245', letterSpacing: '0.02em' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Veredicto conductual */}
      <VeredictoConuctual items={data.veredicto} />

      {/* 4. Preguntas para explorar */}
      <PreguntasParaExplorar preguntas={data.preguntas} />
    </div>
  );
}
