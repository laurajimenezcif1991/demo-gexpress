interface ScorePillProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function getScoreColors(score: number) {
  if (score >= 80) {
    return { bg: 'var(--color-positive-50)', fg: 'var(--color-positive-500)', border: 'var(--color-positive-200)' };
  } else if (score >= 70) {
    return { bg: 'var(--color-warning-50)', fg: 'var(--color-warning-500)', border: 'var(--color-warning-200)' };
  } else {
    return { bg: 'var(--color-negative-50)', fg: 'var(--color-negative-500)', border: 'var(--color-negative-200)' };
  }
}

export default function ScorePill({ score, size = 'md', label }: ScorePillProps) {
  const { bg, fg } = getScoreColors(score);

  const sizes = {
    sm: { padding: '2px 8px', fontSize: '11px', fontWeight: 700 },
    md: { padding: '4px 12px', fontSize: '13px', fontWeight: 700 },
    lg: { padding: '6px 16px', fontSize: '15px', fontWeight: 800 },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        background: bg,
        color: fg,
        borderRadius: '6px',
        fontFamily: 'var(--font-display)',
        ...sizes[size],
      }}
    >
      {label && <span style={{ fontSize: '10px', fontWeight: 600, opacity: 0.8 }}>{label}</span>}
      <span>{score}</span>
    </span>
  );
}
