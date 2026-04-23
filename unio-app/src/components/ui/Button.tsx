import { type ReactNode, type CSSProperties } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'danger-outline' | 'white';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: { height: '36px', padding: '0 14px', fontSize: '13px' },
  md: { height: '40px', padding: '0 18px', fontSize: '14px' },
  lg: { height: '48px', padding: '0 24px', fontSize: '15px' },
};

const variantStyles: Record<ButtonVariant, { base: CSSProperties; hover?: CSSProperties }> = {
  primary: {
    base: {
      background: 'var(--color-brand-accent)',
      color: '#ffffff',
      border: 'none',
    },
  },
  secondary: {
    base: {
      background: 'var(--color-secondary-50)',
      color: 'var(--color-brand-accent)',
      border: '1px solid var(--color-brand-accent)',
    },
  },
  outline: {
    base: {
      background: 'transparent',
      color: 'var(--color-brand-accent)',
      border: '1.5px solid var(--color-brand-accent)',
    },
  },
  ghost: {
    base: {
      background: 'transparent',
      color: 'var(--color-text-muted)',
      border: '1px solid var(--color-border-default)',
    },
  },
  danger: {
    base: {
      background: 'var(--color-danger)',
      color: '#ffffff',
      border: 'none',
    },
  },
  'danger-outline': {
    base: {
      background: 'transparent',
      color: 'var(--color-danger)',
      border: '1.5px solid var(--color-danger)',
    },
  },
  white: {
    base: {
      background: '#ffffff',
      color: 'var(--color-brand-primary)',
      border: 'none',
    },
  },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  style,
  className,
  fullWidth,
  type = 'button',
}: ButtonProps) {
  const vs = variantStyles[variant].base;
  const ss = sizeStyles[size];

  return (
    <button
      type={type}
      className={['unio-btn', `unio-btn-${variant}`, className].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : undefined,
        ...vs,
        ...ss,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
