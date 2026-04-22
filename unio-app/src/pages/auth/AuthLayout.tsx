import { type ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: `
          radial-gradient(ellipse at 0% 0%, rgba(180,170,255,0.35) 0%, transparent 55%),
          radial-gradient(ellipse at 100% 0%, rgba(255,190,190,0.35) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 100%, rgba(200,230,255,0.2) 0%, transparent 60%),
          #ffffff
        `,
        fontFamily: 'var(--font-display)',
      }}
    >
      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 24px 32px',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <img
            src="/unio-SM.png"
            alt="Unio"
            style={{ height: '64px', width: 'auto', display: 'block' }}
          />
        </div>

        {/* Title + subtitle */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '32px',
            color: 'var(--color-brand-primary)',
            margin: '0 0 8px',
            textAlign: 'center',
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: '0 0 32px',
              fontSize: '15px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Card content */}
        {children}
      </div>

      {/* Footer */}
      <footer
        style={{
          background: 'rgba(255,255,255,0.8)',
          borderTop: '1px solid var(--color-border-default)',
          padding: '20px 40px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Powered by</span>
          <span
            style={{
              fontWeight: 800,
              fontSize: '16px',
              color: 'var(--color-brand-primary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Unio
          </span>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid var(--color-border-default)',
            borderRadius: '10px',
            background: '#ffffff',
            padding: '8px 14px',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <img src="/icons/linkedin.svg" alt="LinkedIn" width="16" height="16" />
          Síguenos en Linkedin
        </button>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            flex: 1,
          }}
        >
          Reimaginamos los procesos de reclutamiento, selección y contratación para roles UXUI, Growth y Product,
          potenciando y optimizando procesos con IA.
        </p>
      </footer>
    </div>
  );
}
