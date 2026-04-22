import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { PrimaryButton, inputStyle, labelStyle } from './AuthPage';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { setPendingEmail } = useAuth();
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!email) return;
    setPendingEmail(email);
    navigate('/auth/forgot-password/verify');
  };

  return (
    <AuthLayout
      title="Recupera tu contraseña"
      subtitle="Ingresa tu email y te enviaremos un código de verificación"
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
        }}
      >
        {/* Email */}
        <div>
          <label style={labelStyle()}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ej: tunombre@empresa.com"
            style={{ ...inputStyle(), paddingRight: '14px' }}
          />
        </div>

        <PrimaryButton disabled={!email} onClick={handleSubmit}>
          Enviar código
        </PrimaryButton>

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
            justifyContent: 'center',
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
