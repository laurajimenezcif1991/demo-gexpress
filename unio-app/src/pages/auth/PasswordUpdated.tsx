import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { PrimaryButton } from './AuthPage';

export default function PasswordUpdated() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Contraseña actualizada"
      subtitle="Tu contraseña ha sido actualizada exitosamente"
    >
      <style>{`
        @keyframes fadeInSuccess {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .success-image {
          animation: fadeInSuccess 0.6s ease-in-out both;
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        {/* Success image */}
        <img
          src="/success.png"
          alt="Contraseña actualizada"
          className="success-image"
          style={{ width: '120px', height: 'auto', display: 'block' }}
        />

        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          Por seguridad, todas tus sesiones activas han sido cerradas.
        </p>

        <div style={{ width: '100%' }}>
          <PrimaryButton onClick={() => navigate('/auth?tab=login')}>
            Iniciar Sesión
          </PrimaryButton>
        </div>
      </div>
    </AuthLayout>
  );
}
