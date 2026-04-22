import { useEffect, useState } from 'react';
import { getScoreColors } from './ScorePill';

interface GaugeProps {
  score: number;
  size?: number;
  label?: string;
  /** Animate ring + count-up (e.g. finalist view). */
  animated?: boolean;
  /** Skip motion when user prefers reduced motion. */
  reducedMotion?: boolean;
  /** Total ms for ring + number (ease-out). Default 1050. */
  animationDurationMs?: number;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export default function Gauge({
  score,
  size = 160,
  label = 'Consolidado',
  animated = false,
  reducedMotion = false,
  animationDurationMs = 1050,
}: GaugeProps) {
  const { fg } = getScoreColors(score);
  const radius = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const sweep = 270;
  const startAngle = 135;

  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const describeArc = (startDeg: number, endDeg: number) => {
    const start = polarToCartesian(startDeg);
    const end = polarToCartesian(endDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const endAngle = startAngle + sweep;
  const fullArcD = describeArc(startAngle, endAngle);

  const pathMetric = 1000;
  const scoreFraction = Math.min(100, Math.max(0, score)) / 100;

  const [ringProgress, setRingProgress] = useState(animated && !reducedMotion ? 0 : 1);
  const [displayScore, setDisplayScore] = useState(animated && !reducedMotion ? 0 : score);

  useEffect(() => {
    if (!animated || reducedMotion) {
      setRingProgress(1);
      setDisplayScore(score);
      return;
    }

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const linear = Math.min(1, (now - start) / animationDurationMs);
      const t = easeOutCubic(linear);
      setRingProgress(t);
      setDisplayScore(Math.round(score * t));
      if (linear < 1) raf = requestAnimationFrame(tick);
      else {
        setRingProgress(1);
        setDisplayScore(score);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated, reducedMotion, score, animationDurationMs]);

  const visibleFraction = scoreFraction * ringProgress;
  const dashOffset = pathMetric * (1 - visibleFraction);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        <path
          d={fullArcD}
          fill="none"
          stroke="#e6e6e6"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d={fullArcD}
          fill="none"
          stroke={fg}
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={pathMetric}
          strokeDasharray={pathMetric}
          strokeDashoffset={dashOffset}
          style={{ transition: reducedMotion ? 'none' : undefined }}
        />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: `${size * 0.22}px`,
            color: 'var(--color-brand-primary)',
            lineHeight: 1,
          }}
        >
          {displayScore}
          <span style={{ fontSize: `${size * 0.1}px`, fontWeight: 600, color: 'var(--color-text-muted)' }}>
            /100
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: `${size * 0.09}px`,
            fontWeight: 500,
            color: 'var(--color-text-muted)',
            marginTop: '4px',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
