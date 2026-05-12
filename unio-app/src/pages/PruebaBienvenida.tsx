import { useNavigate, useParams } from 'react-router-dom';
import { assetUrl } from '../utils/assets';

const COMPANY_LOGO   = 'https://www.figma.com/api/mcp/asset/18f62815-f865-4f0d-bf73-b6bd1cac9a7e';
const UNIO_LOGO      = assetUrl('/logo-unio.png');
const CANDIDATE_AVATAR = 'https://www.figma.com/api/mcp/asset/5f48a710-bbc7-4c93-8f85-5f56681bb4d0';
const BG_BANNER      = 'https://www.figma.com/api/mcp/asset/9315624d-5d7a-496f-bafa-357309ba3619';

export default function PruebaBienvenida() {
  const navigate = useNavigate();
  const { evalId } = useParams<{ evalId: string }>();

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
      {/* Decorative background banner */}
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
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '32px',
          paddingBottom: '40px',
          gap: '16px',
        }}
      >
        {/* Main card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '32px',
            boxShadow: '0px 0px 22.4px 0px rgba(0,0,0,0.06)',
            padding: '24px 42px',
            width: '100%',
            maxWidth: '702px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Header: company logo + powered by */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <img src={COMPANY_LOGO} alt="Logo empresa" style={{ height: '84px', width: 'auto', objectFit: 'contain' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#151515', lineHeight: '19px' }}>Powered by</span>
              <img src={UNIO_LOGO} alt="Unio" style={{ height: '23px', width: 'auto' }} />
            </div>
          </div>

          {/* Title + candidate card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
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
              Evaluación Conductual PRIMA
            </h1>

            <p
              style={{
                fontSize: '16px',
                fontWeight: 400,
                lineHeight: '28px',
                color: '#252432',
                textAlign: 'center',
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              Te ayudaremos a conocerte mejor para encontrar el mejor match con este rol.
            </p>

            {/* Candidate info card */}
            <div
              style={{
                border: '1px solid #afaeb0',
                borderRadius: '16px',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                width: '436px',
              }}
            >
              <img
                src={CANDIDATE_AVATAR}
                alt=""
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #d4dbe0',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: '20px',
                    lineHeight: '27px',
                    color: '#363539',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Maria Alicia Espinosa
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5C5.79 1.5 4 3.29 4 5.5C4 8.5 8 14 8 14C8 14 12 8.5 12 5.5C12 3.29 10.21 1.5 8 1.5ZM8 7C7.17 7 6.5 6.33 6.5 5.5C6.5 4.67 7.17 4 8 4C8.83 4 9.5 4.67 9.5 5.5C9.5 6.33 8.83 7 8 7Z" fill="#363539"/>
                  </svg>
                  <span style={{ fontWeight: 700, fontSize: '14px', lineHeight: '21px', color: '#363539' }}>
                    Bogotá, Colombia
                  </span>
                </div>
                <div
                  style={{
                    background: 'var(--color-secondary-50, #f2ecfe)',
                    borderRadius: '36px',
                    padding: '2px 10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: 'var(--color-secondary-base, #8750f6)' }}>
                    Vacante: Interaction Designer
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* "Antes de empezar" callout */}
        <div
          style={{
            borderLeft: '4px solid var(--color-secondary-500, #8750f6)',
            width: '100%',
            maxWidth: '570px',
          }}
        >
          <div
            style={{
              background: 'var(--color-secondary-50, #f2ecfe)',
              borderRadius: '0 25px 25px 0',
              padding: '14px 20px',
            }}
          >
            <p style={{ fontWeight: 700, fontSize: '14px', lineHeight: '24px', color: 'var(--color-secondary-base, #8750f6)', margin: '0 0 2px' }}>
              Antes de empezar:
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#5c11f3', listStyleType: 'disc' }}>
              {[
                'No hay respuestas buenas o malas',
                'Sé lo más honesto posible contigo mismo',
                'Responde según cómo realmente eres, no cómo crees que deberías ser',
                'Tus respuestas son confidenciales',
              ].map((item) => (
                <li key={item} style={{ fontSize: '14px', lineHeight: '24px' }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Time estimate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#363539" strokeWidth="1.5" />
            <path d="M8 4.5V8L10.5 9.5" stroke="#363539" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: '13px', lineHeight: '21px', color: '#363539' }}>
            Tiempo estimado: 3–5 minutos
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '14px',
            lineHeight: '24px',
            color: '#030712',
            textAlign: 'center',
            letterSpacing: '0.02em',
            maxWidth: '560px',
            margin: 0,
          }}
        >
          Esta evaluación nos ayuda a entender tu estilo de trabajo y cómo encajas con el rol. No afecta negativamente tu candidatura — es una herramienta para encontrar el mejor match.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate(`/prueba/${evalId}/test`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 28px',
            borderRadius: '12px',
            background: 'var(--color-brand-primary, #27214d)',
            border: 'none',
            color: '#ffffff',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: '24px',
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Iniciar evaluación
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Footer */}
        <div
          style={{
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '16px',
            padding: '32px 64px',
            width: '100%',
            maxWidth: '1050px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#151515' }}>Powered by</span>
              <img src={UNIO_LOGO} alt="Unio" style={{ height: '23px', width: 'auto' }} />
            </div>
            <a
              href="https://www.linkedin.com/company/unio-latam"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: '1px solid var(--color-brand-primary, #27214d)',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'var(--color-brand-primary, #27214d)',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.78 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
              </svg>
              Síguenos en Linkedin
            </a>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '19px', color: '#151515', margin: 0, maxWidth: '1004px' }}>
            Reimaginamos los procesos de reclutamiento, selección y contratación para roles UXUI, Growth y Product, potenciando y optimizando procesos con IA.
          </p>
        </div>
      </div>
    </div>
  );
}
