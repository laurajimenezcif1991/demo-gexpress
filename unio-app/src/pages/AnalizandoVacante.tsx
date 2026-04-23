import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const STEPS = [
  'Extrayendo información clave...',
  'Identificando requisitos...',
  'Sugiriendo no negociables...',
];

const STEP_DELAYS = [0, 1300, 2500];   // ms when each step becomes visible
const NAVIGATE_DELAY = 4000;           // ms until auto-navigate

export default function AnalizandoVacante() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as { cargo?: string; area?: string; tipoVacante?: string; fechaIngreso?: string };
  const cargo: string = state.cargo ?? 'Nueva vacante';

  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEP_DELAYS.forEach((delay, i) => {
      timers.push(setTimeout(() => setVisibleSteps(i + 1), delay));
    });

    timers.push(
      setTimeout(() => navigate('/vacante/nueva/no-negociables', { state, replace: true }), NAVIGATE_DELAY),
    );

    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes unio-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes unio-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes unio-pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-surface-subtle)',
          fontFamily: 'var(--font-display)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Navbar */}
        <header
          style={{
            background: '#ffffff',
            borderBottom: '1px solid var(--color-border-default)',
            padding: '0 40px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src="/logo-comfandi.webp"
              alt="Comfandi"
              style={{ maxHeight: '52px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }}
            />
            <div style={{ width: '1px', height: '32px', background: 'var(--color-border-default)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              <span>Powered by</span>
              <img src="/logo-unio.png" alt="Unio" style={{ height: '14px', width: 'auto' }} />
            </div>
          </div>
        </header>

        {/* Centered content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
          }}
        >
          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '22px',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.3px',
                marginBottom: '8px',
              }}
            >
              Analizando Job Description
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                fontWeight: 500,
              }}
            >
              {cargo}
            </p>
          </div>

          {/* Card */}
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-default)',
              padding: '56px 40px 52px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 16px rgba(24,20,46,0.06)',
            }}
          >
            {/* Spinner */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '5px solid var(--color-secondary-100)',
                borderTopColor: 'var(--color-brand-accent)',
                animation: 'unio-spin 0.9s linear infinite',
                marginBottom: '40px',
                flexShrink: 0,
              }}
            />

            {/* Steps */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {STEPS.map((step, i) => {
                const done = i < visibleSteps - 1;
                const active = i === visibleSteps - 1;
                const hidden = i >= visibleSteps;

                if (hidden) return null;

                return (
                  <div
                    key={step}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      animation: 'unio-fadein 0.35s ease both',
                    }}
                  >
                    {/* Icon */}
                    {done ? (
                      <CheckCircle2
                        size={20}
                        style={{ color: 'var(--color-brand-accent)', flexShrink: 0 }}
                      />
                    ) : (
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: active ? 'var(--color-brand-accent)' : 'var(--color-neutral-200)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          animation: active ? 'unio-pulse-dot 1.2s ease-in-out infinite' : 'none',
                        }}
                      >
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            display: 'block',
                          }}
                        />
                      </span>
                    )}

                    {/* Text */}
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: done ? 500 : active ? 600 : 400,
                        color: done
                          ? 'var(--color-text-secondary)'
                          : active
                          ? 'var(--color-text-primary)'
                          : 'var(--color-text-muted)',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
