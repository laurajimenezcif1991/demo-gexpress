import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import PasswordChecklist, { isPasswordValid } from '../../components/auth/PasswordChecklist';
import { PrimaryButton, PasswordField } from './AuthPage';

export default function NewPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const pwdValid = isPasswordValid(password);
  const canSubmit = pwdValid && confirm;

  const handleSubmit = () => {
    if (password !== confirm) {
      setConfirmError('Las contraseñas no coinciden');
      return;
    }
    navigate('/auth/password-updated');
  };

  return (
    <AuthLayout
      title="Crea una nueva contraseña"
      subtitle="Asegúrate de que sea segura y fácil de recordar"
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
          gap: '16px',
        }}
      >
        <PasswordField
          label="Nueva contraseña"
          value={password}
          onChange={(v) => { setPassword(v); setConfirmError(''); }}
          placeholder="Mínimo 8 caracteres"
        />

        <PasswordChecklist password={password} />

        <PasswordField
          label="Confirmar contraseña*"
          value={confirm}
          onChange={(v) => { setConfirm(v); setConfirmError(''); }}
          placeholder="Repite tu contraseña"
          error={confirmError}
        />

        <PrimaryButton disabled={!canSubmit} onClick={handleSubmit}>
          Guardar contraseña
        </PrimaryButton>
      </div>
    </AuthLayout>
  );
}
