import { useEffect, useState } from 'react';
import { getScoreColors } from './ScorePill';

interface ProgressBarProps {
  value: number;
  max?: number;
  height?: number;
  colored?: boolean;
  style?: React.CSSProperties;
  /** Animate fill from 0 on mount (Finalist estilo de trabajo). */
  animateFill?: boolean;
  fillDelayMs?: number;
  fillDurationMs?: number;
  reducedMotion?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  height = 8,
  colored = false,
  style,
  animateFill = false,
  fillDelayMs = 0,
  fillDurationMs = 800,
  reducedMotion = false,
}: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const { fg } = getScoreColors(value);

  const [widthPct, setWidthPct] = useState(() =>
    animateFill && !reducedMotion ? 0 : pct,
  );

  useEffect(() => {
    if (!animateFill || reducedMotion) {
      setWidthPct(pct);
      return;
    }
    setWidthPct(0);
    const t = window.setTimeout(() => setWidthPct(pct), fillDelayMs);
    return () => window.clearTimeout(t);
  }, [animateFill, reducedMotion, pct, fillDelayMs, value, max]);

  const easing = 'cubic-bezier(0.33, 1, 0.68, 1)';

  return (
    <div
      style={{
        width: '100%',
        height: `${height}px`,
        background: '#e6e6e6',
        borderRadius: `${height / 2}px`,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${widthPct}%`,
          background: colored ? fg : 'var(--color-brand-accent)',
          borderRadius: `${height / 2}px`,
          transition:
            animateFill && !reducedMotion
              ? `width ${fillDurationMs}ms ${easing}`
              : 'width 0.4s ease',
        }}
      />
    </div>
  );
}
