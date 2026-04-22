import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, XCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from './AuthLayout';
import OtpInput from '../../components/auth/OtpInput';
import { PrimaryButton } from './AuthPage';
import { useAuth } from '../../context/AuthContext';

const MAX_ATTEMPTS = 3;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { pendingEmail, verifyOtp, completeVerification } = useAuth();

  const [otp, setOtp] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const isComplete = otp.replace(/ /g, '').length === 6;

  const handleVerify = () => {
    if (!isComplete) return;
    const valid = verifyOtp(otp);
    if (valid) {
      setError('');
      setVerified(true);
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      setOtp('');
      setError(
        remaining === 1
          ? 'Código incorrecto. Verifica e intenta nuevamente.'
          : 'Código incorrecto. Verifica e intenta nuevamente.'
      );
    }
  };

  const handleContinue = () => {
    completeVerification();
    navigate('/');
  };

  const handleResend = () => {
    setOtp('');
    setError('');
    setAttemptsLeft(MAX_ATTEMPTS);
  };

  return (
    <AuthLayout
      title="Verifica tu email"
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
        {/* Check inbox hint (shown when empty) */}
        {!otp && !error && !verified && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              border: '1px solid var(--color-border-default)',
              borderRadius: '10px',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              width: '100%',
            }}
          >
            <Mail size={16} />
            Revisa tu bandeja de entrada y spam
          </div>
        )}

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

        {/* Success banner */}
        {verified && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--color-positive-50)',
              border: '1px solid var(--color-positive-200)',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-positive-600)',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={16} color="var(--color-positive-500)" />
            Código válido
          </div>
        )}

        {/* OTP label */}
        <div style={{ width: '100%' }}>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            Código de verificación
          </p>
          <OtpInput
            value={otp}
            onChange={(v) => { setOtp(v); setError(''); }}
            error={!!error}
            success={verified}
            disabled={verified}
          />
        </div>

        {/* Attempts counter */}
        {!verified && (
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
        )}

        {/* Resend */}
        {!verified && (
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
        )}

        {/* CTA */}
        {verified ? (
          <div style={{ width: '100%' }}>
            <PrimaryButton onClick={handleContinue}>Continuar</PrimaryButton>
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            <PrimaryButton disabled={!isComplete || attemptsLeft === 0} onClick={handleVerify}>
              {attemptsLeft === 0 ? 'Sin intentos restantes' : 'Verificar'}
            </PrimaryButton>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
