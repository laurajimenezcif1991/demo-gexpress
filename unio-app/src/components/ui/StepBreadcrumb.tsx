import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Datos del cargo' },
  { id: 2, label: 'No negociables' },
  { id: 3, label: 'Completa el RCP' },
  { id: 4, label: 'Publicación' },
];

interface StepBreadcrumbProps {
  current: 1 | 2 | 3 | 4;
}

export default function StepBreadcrumb({ current }: StepBreadcrumbProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        marginBottom: '32px',
        fontFamily: 'var(--font-display)',
      }}
    >
      {STEPS.map((step, idx) => {
        const done    = step.id < current;
        const active  = step.id === current;
        const pending = step.id > current;

        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Connector line (before first step is skipped) */}
            {idx > 0 && (
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  background: done || active ? 'var(--color-brand-accent)' : 'var(--color-border-default)',
                  transition: 'background 0.2s ease',
                }}
              />
            )}

            {/* Step bubble + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${
                    active  ? 'var(--color-brand-accent)' :
                    done    ? 'var(--color-brand-accent)' :
                              'var(--color-border-default)'
                  }`,
                  background: done ? 'var(--color-brand-accent)' : active ? 'var(--color-secondary-50)' : '#ffffff',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                {done ? (
                  <Check size={13} color="#ffffff" strokeWidth={3} />
                ) : (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: active ? 'var(--color-brand-accent)' : 'var(--color-text-placeholder)',
                    }}
                  >
                    {step.id}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: active ? 700 : done ? 500 : 400,
                  color: active
                    ? 'var(--color-brand-accent)'
                    : done
                    ? 'var(--color-text-secondary)'
                    : 'var(--color-text-placeholder)',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease',
                }}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
