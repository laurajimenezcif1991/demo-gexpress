import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);

  const active = hovered > 0 ? hovered : value;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: readonly ? 'default' : 'pointer',
              lineHeight: 1,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={star <= active ? 'var(--color-brand-accent)' : '#E0E0E0'}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      <span
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-display)',
        }}
      >
        ({value}/5)
      </span>
    </div>
  );
}
