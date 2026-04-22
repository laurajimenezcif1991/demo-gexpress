import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, XCircle } from 'lucide-react';
import AuthLayout from './AuthLayout';
import PasswordChecklist, { isPasswordValid } from '../../components/auth/PasswordChecklist';
import { useAuth } from '../../context/AuthContext';

// ─── Shared input style helpers ───────────────────────────────────────────────

function inputStyle(error?: boolean): React.CSSProperties {
  return {
    width: '100%',
    height: '48px',
    border: `1.5px solid ${error ? 'var(--color-negative-500)' : 'var(--color-border-default)'}`,
    borderRadius: '10px',
    padding: '0 44px 0 14px',
    fontSize: '14px',
    fontFamily: 'var(--font-display)',
    color: 'var(--color-text-primary)',
    background: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  };
}

function labelStyle(): React.CSSProperties {
  return {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: '6px',
  };
}

function fieldErrorStyle(): React.CSSProperties {
  return {
    fontSize: '12px',
    color: 'var(--color-negative-600)',
    marginTop: '4px',
  };
}

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: 'var(--color-negative-50)',
        border: '1px solid var(--color-negative-200)',
        borderRadius: '10px',
        marginBottom: '16px',
        fontSize: '13px',
        color: 'var(--color-negative-600)',
        fontWeight: 500,
      }}
    >
      <XCircle size={16} color="var(--color-negative-500)" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      {action}
    </div>
  );
}

// ─── Password input with toggle ───────────────────────────────────────────────

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={labelStyle()}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle(!!error)}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            padding: 0,
            display: 'flex',
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p style={fieldErrorStyle()}>{error}</p>}
    </div>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────

function PrimaryButton({
  children,
  disabled,
  onClick,
  type = 'button',
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: '100%',
        height: '48px',
        borderRadius: '10px',
        border: 'none',
        background: disabled ? 'var(--color-neutral-300)' : 'var(--color-brand-primary)',
        color: '#ffffff',
        fontSize: '15px',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const navigate = useNavigate();
  const { register, completeVerification } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [emailError, setEmailError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [bannerError, setBannerError] = useState('');

  const pwdValid = isPasswordValid(password);
  const canSubmit = email && name && company && pwdValid && confirm;

  const handleSubmit = () => {
    setEmailError('');
    setConfirmError('');
    setBannerError('');

    if (password !== confirm) {
      setConfirmError('Las contraseñas no coinciden');
      setBannerError('Las contraseñas no coinciden');
      return;
    }

    const result = register(email, name, company, password);
    if (result === 'email_exists') {
      setEmailError('Este email ya está registrado');
      setBannerError('Este email ya está registrado');
      return;
    }

    // TODO: reemplazar por navigate('/auth/verify-email') cuando el backend de OTP esté listo
    completeVerification();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {bannerError && (
        <ErrorBanner
          message={bannerError}
          action={
            bannerError.includes('registrado') ? (
              <button
                onClick={onSwitchTab}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-negative-600)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                Inicia sesión
              </button>
            ) : undefined
          }
        />
      )}

      {/* Email */}
      <div>
        <label style={labelStyle()}>Email corporativo</label>
        <div style={{ position: 'relative' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(''); setBannerError(''); }}
            placeholder="Ej: tunombre@empresa.com"
            style={inputStyle(!!emailError)}
          />
        </div>
        {emailError
          ? <p style={fieldErrorStyle()}>{emailError}</p>
          : <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Usaremos este email para la verificación</p>
        }
      </div>

      {/* Name */}
      <div>
        <label style={labelStyle()}>Nombre Completo*</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Maria Lopez"
          style={{ ...inputStyle(), paddingRight: '14px' }}
        />
      </div>

      {/* Company */}
      <div>
        <label style={labelStyle()}>Empresa *</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Ej: Tech Startup SAS"
          style={{ ...inputStyle(), paddingRight: '14px' }}
        />
      </div>

      {/* Password */}
      <PasswordField
        label="Contraseña*"
        value={password}
        onChange={(v) => { setPassword(v); setConfirmError(''); setBannerError(''); }}
        error={confirmError && password ? 'Las contraseñas no coinciden' : undefined}
      />
      <PasswordChecklist password={password} />

      {/* Confirm */}
      <PasswordField
        label="Confirmar contraseña*"
        value={confirm}
        onChange={(v) => { setConfirm(v); setConfirmError(''); setBannerError(''); }}
        placeholder="Repite tu contraseña"
        error={confirmError}
      />

      <PrimaryButton disabled={!canSubmit} onClick={handleSubmit}>
        Crear cuenta
      </PrimaryButton>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
        ¿Ya tienes cuenta?{' '}
        <button
          onClick={onSwitchTab}
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
          Inicia sesión
        </button>
      </p>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = email && password && !loading;

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result === 'success') {
        navigate('/');
      } else if (result === 'network_error') {
        setError('Error de conexión. Verifica tu red e intenta de nuevo.');
      } else {
        setError('Email o contraseña incorrectos');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && <ErrorBanner message={error} />}

      {/* Email */}
      <div>
        <label style={labelStyle()}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder="Ej: tunombre@empresa.com"
          style={{ ...inputStyle(!!error), paddingRight: '14px' }}
        />
      </div>

      {/* Password */}
      <PasswordField
        label="Contraseña"
        value={password}
        onChange={(v) => { setPassword(v); setError(''); }}
        placeholder="Ingresa tu contraseña"
        error={undefined}
      />

      {/* Forgot + Remember */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => navigate('/auth/forgot-password')}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-brand-primary)',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'center',
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            justifyContent: 'center',
          }}
        >
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--color-brand-accent)', cursor: 'pointer' }}
          />
          Recordarme
        </label>
      </div>

      <PrimaryButton disabled={!canSubmit} onClick={handleSubmit}>
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </PrimaryButton>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
        ¿No tienes cuenta?{' '}
        <button
          onClick={onSwitchTab}
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
          Regístrate
        </button>
      </p>
    </div>
  );
}

// ─── AuthPage ─────────────────────────────────────────────────────────────────

type Tab = 'register' | 'login';

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<Tab>(tabParam === 'register' ? 'register' : 'login');

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'register' ? { tab: 'register' } : {});
  };

  const isLogin = activeTab === 'login';

  return (
    <AuthLayout
      title={isLogin ? 'Te damos la bienvenida' : 'Crea tu cuenta'}
      subtitle={isLogin ? 'Inicia sesión para acceder a tu cuenta' : 'Únete a empresas que encuentran talento validado'}
    >
      {/* Tab switcher */}
      <div
        style={{
          display: 'flex',
          background: '#f7f7f8',
          borderRadius: '30px',
          padding: '4px',
          marginBottom: '24px',
          gap: '2px',
        }}
      >
        {(['login', 'register'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            style={{
              flex: 1,
              padding: '8px 20px',
              borderRadius: '26px',
              border: 'none',
              background: activeTab === tab ? '#ffffff' : 'transparent',
              boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {tab === 'login' ? 'Iniciar sesión' : 'Registrarme'}
          </button>
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.75)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '16px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        {isLogin
          ? <LoginForm onSwitchTab={() => switchTab('register')} />
          : <RegisterForm onSwitchTab={() => switchTab('login')} />
        }
      </div>
    </AuthLayout>
  );
}

// Export shared primitives for reuse in other auth pages
export { ErrorBanner, PrimaryButton, PasswordField, labelStyle, inputStyle, fieldErrorStyle };
