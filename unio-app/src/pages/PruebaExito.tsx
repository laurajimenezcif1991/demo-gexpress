import { useEffect, useRef } from 'react';

const COMPANY_LOGO = 'https://www.figma.com/api/mcp/asset/91d6a33e-b6e0-4f64-af85-b529e4649970';
const UNIO_LOGO    = '/logo-unio.png';
const SUCCESS_ICON = 'https://www.figma.com/api/mcp/asset/115aa037-eac9-4693-a41d-12ad2d552762';
const BG_BANNER    = 'https://www.figma.com/api/mcp/asset/372877cf-f504-428f-b640-b3db2f4c9dd6';

export default function PruebaExito() {
  const iconRef = useRef<HTMLImageElement>(null);

  /* Scale-in animation on mount */
  useEffect(() => {
    const el = iconRef.current;
    if (!el) return;
    el.style.transform = 'scale(0)';
    el.style.opacity   = '0';
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
      el.style.transform  = 'scale(1)';
      el.style.opacity    = '1';
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-display)',
      }}
    >
      {/* Decorative background */}
      <div
        style={{
          position: 'absolute',
          left: '15%',
          top: '40px',
          width: '70%',
          height: '320px',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.6,
        }}
      >
        <img src={BG_BANNER} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Page content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '53px',
          paddingBottom: '60px',
        }}
      >
        {/* Main card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '32px',
            boxShadow: '0px 0px 22.4px 0px rgba(0,0,0,0.06)',
            padding: '32px 42px',
            width: '100%',
            maxWidth: '946px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '558px' }}>
            <img src={COMPANY_LOGO} alt="Logo empresa" style={{ height: '84px', width: 'auto', objectFit: 'contain' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#151515', lineHeight: '19px' }}>Powered by</span>
              <img src={UNIO_LOGO} alt="Unio" style={{ height: '23px', width: 'auto' }} />
            </div>
          </div>

          {/* Success icon + title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '558px' }}>
            <img
              ref={iconRef}
              src={SUCCESS_ICON}
              alt="Éxito"
              style={{
                width: '101px',
                height: '101px',
                objectFit: 'contain',
              }}
            />
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 800,
                lineHeight: '54px',
                color: '#252432',
                textAlign: 'center',
                margin: 0,
                width: '100%',
              }}
            >
              ¡Evaluación enviada con éxito!
            </h1>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px',
              color: '#252432',
              textAlign: 'center',
              margin: 0,
              maxWidth: '566px',
            }}
          >
            Gracias por completar la evaluación conductual PRIMA. Tus respuestas nos ayudan a entender mejor cómo encajas con el rol.
          </p>

          {/* Confidential badge */}
          <div
            style={{
              background: 'var(--color-secondary-50, #f2ecfe)',
              borderRadius: '25px',
              padding: '0 24px',
              height: '72px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '412px',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="#8750f6" strokeWidth="1.8" />
              <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="#8750f6" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1.5" fill="#8750f6" />
            </svg>
            <span
              style={{
                fontWeight: 700,
                fontSize: '18px',
                lineHeight: '27px',
                color: 'var(--color-secondary-base, #8750f6)',
              }}
            >
              Tus respuestas son confidenciales
            </span>
          </div>

          {/* "¿Qué sigue?" box */}
          <div
            style={{
              border: '1px solid #c0c0c1',
              borderRadius: '16px',
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxWidth: '566px',
              width: '100%',
            }}
          >
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 800,
                lineHeight: '32px',
                color: 'var(--color-primary-600, #1f1a3d)',
                margin: 0,
              }}
            >
              ¿Qué sigue?
            </h2>
            <p
              style={{
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '28px',
                color: '#030712',
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              Nuestro equipo revisará tu perfil completo junto con esta evaluación. Te contactaremos pronto con los siguientes pasos del proceso.{' '}
              Recuerda revisar tu correo electrónico (incluyendo spam) en las próximas 48–72 horas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
