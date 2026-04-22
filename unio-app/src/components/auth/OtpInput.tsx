import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
}

const OTP_LENGTH = 6;

export default function OtpInput({ value, onChange, error, success, disabled }: OtpInputProps) {
  const digits = value.padEnd(OTP_LENGTH, '').split('').slice(0, OTP_LENGTH);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusAt = (index: number) => {
    const el = inputRefs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))];
    el?.focus();
  };

  const handleChange = (index: number, char: string) => {
    if (!/^\d$/.test(char)) return;
    const next = digits.map((d, i) => (i === index ? char : d)).join('').replace(/ /g, '');
    onChange(next);
    if (index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index] && digits[index] !== ' ') {
        const next = digits.map((d, i) => (i === index ? ' ' : d)).join('').trimEnd();
        onChange(next);
      } else {
        focusAt(index - 1);
        const next = digits.map((d, i) => (i === index - 1 ? ' ' : d)).join('').trimEnd();
        onChange(next);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(pasted);
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const getBorderColor = (i: number) => {
    if (success) return 'var(--color-positive-500)';
    if (error) return 'var(--color-negative-500)';
    if (digits[i] && digits[i] !== ' ') return 'var(--color-brand-accent)';
    return 'var(--color-border-default)';
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' || !digits[i] ? '' : digits[i]}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '10px',
            border: `1.5px solid ${getBorderColor(i)}`,
            background: '#ffffff',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: success ? 'var(--color-positive-600)' : error ? 'var(--color-negative-600)' : 'var(--color-brand-primary)',
            outline: 'none',
            transition: 'border-color 0.15s ease',
            cursor: disabled ? 'default' : 'text',
          }}
        />
      ))}
    </div>
  );
}
