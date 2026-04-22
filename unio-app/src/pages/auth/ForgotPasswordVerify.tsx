import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle } from 'lucide-react';
import AuthLayout from './AuthLayout';
import OtpInput from '../../components/auth/OtpInput';
import { PrimaryButton } from './AuthPage';
import { useAuth } from '../../context/AuthContext';

const MAX_ATTEMPTS = 3;

export default function ForgotPasswordVerify() {
  const navigate = useNavigate();
  const { pendingEmail, verifyOtp } = useAuth();

  const [otp, setOtp] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [error, setError] = useState('');

  const isComplete = otp.replace(/ /g, '').length === 6;

  const handleVerify = () => {
    if (!isComplete) return;
    const valid = verifyOtp(otp);
    if (valid) {
      navigate('/auth/forgot-password/new-password');
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      setOtp('');
      setError('Código incorrecto. Verifica e intenta nuevamente.');
    }
  };

  const handleResend = () => {
    setOtp('');
    setError('');
    setAttemptsLeft(MAX_ATTEMPTS);
  };

  return (
    <AuthLayout
      title="Verifica tu identidad"
      subtitle={`Hemos enviado un código de verificación a\n${pendingEmail || 'maria@empresa.com'}`}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.75)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        {/* Error banner */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'var(--color-negative-50)',
              border: '1px solid var(--color-negative-200)',
              borderRadius: '10px',
              fontSize: '13px',
              color: 'var(--color-negative-600)',
              width: '100%',
            }}
          >
            <XCircle size={16} color="var(--color-negative-500)" style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* OTP */}
        <div style={{ width: '100%' }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Código de verificación
          </p>
          <OtpInput
            value={otp}
            onChange={(v) => { setOtp(v); setError(''); }}
            error={!!error}
          />
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: attemptsLeft === 1 ? 'var(--color-negative-600)' : 'var(--color-text-muted)',
            fontWeight: attemptsLeft === 1 ? 600 : 400,
          }}
        >
          {attemptsLeft === 1
            ? `Último intento restante (1 de ${MAX_ATTEMPTS})`
            : `Intentos restantes ${attemptsLeft} de ${MAX_ATTEMPTS}`}
        </p>

        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>
          ¿No recibiste el código?{' '}
          <button
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-brand-primary)',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Reenviar
          </button>
        </p>

        <div style={{ width: '100%' }}>
          <PrimaryButton disabled={!isComplete || attemptsLeft === 0} onClick={handleVerify}>
            Verificar código
          </PrimaryButton>
        </div>

        <button
          onClick={() => navigate('/auth?tab=login')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0,
          }}
        >
          <ArrowLeft size={14} />
          Volver a inicio de sesión
        </button>
      </div>
    </AuthLayout>
  );
}
