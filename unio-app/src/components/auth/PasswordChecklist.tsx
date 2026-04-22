import { CheckCircle2, Circle } from 'lucide-react';

interface PasswordChecklistProps {
  password: string;
}

const rules = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos una minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Al menos un número', test: (p: string) => /\d/.test(p) },
  { label: 'Al menos un símbolo (!@#$%)', test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

export default function PasswordChecklist({ password }: PasswordChecklistProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {rules.map((rule) => {
        const passes = password.length > 0 && rule.test(password);
        return (
          <div
            key={rule.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: passes ? 'var(--color-positive-600)' : 'var(--color-text-muted)',
              transition: 'color 0.15s ease',
            }}
          >
            {passes ? (
              <CheckCircle2 size={16} color="var(--color-positive-500)" />
            ) : (
              <Circle size={16} color="var(--color-neutral-400)" />
            )}
            <span>{rule.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function isPasswordValid(password: string): boolean {
  return rules.every((r) => r.test(password));
}
