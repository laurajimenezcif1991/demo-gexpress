import { type ReactNode } from 'react';

interface WizardBarProps {
  children: ReactNode;
  visible?: boolean;
}

export default function WizardBar({ children, visible = true }: WizardBarProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        background: '#ffffff',
        borderTop: '1px solid var(--color-border-default)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 50,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {children}
      </div>
    </div>
  );
}
