import { useState } from 'react';

interface RadioCardProps {
  text: string;
  selected: boolean;
  onSelect: () => void;
}

export default function RadioCard({ text, selected, onSelect }: RadioCardProps) {
  const [hovered, setHovered] = useState(false);
  const highlighted = selected || hovered;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        width: '100%',
        padding: '16px',
        borderRadius: '16px',
        border: `1px solid ${highlighted ? 'var(--color-secondary-500, #8750f6)' : '#d4d4d5'}`,
        background: highlighted ? 'var(--color-secondary-50, #f2ecfe)' : '#ffffff',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.15s ease, background 0.15s ease',
        outline: 'none',
        minHeight: '56px',
      }}
    >
      {/* Radio circle */}
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: selected
            ? '5px solid var(--color-secondary-500, #8750f6)'
            : `1.5px solid ${hovered ? 'var(--color-secondary-500, #8750f6)' : '#afaeb0'}`,
          background: '#ffffff',
          flexShrink: 0,
          marginTop: '4px',
          transition: 'border 0.15s ease',
          boxSizing: 'border-box',
        }}
      />

      {/* Text */}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: selected ? 600 : 400,
          color: selected ? 'var(--color-secondary-base, #8750f6)' : '#252432',
          lineHeight: selected ? '21px' : '28px',
          letterSpacing: selected ? 0 : '0.02em',
          flex: 1,
        }}
      >
        {text}
      </span>
    </button>
  );
}
