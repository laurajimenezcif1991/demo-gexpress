import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, visible, onClose, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '32px',
        zIndex: 100,
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        opacity: show ? 1 : 0,
        transition: 'all 0.3s ease',
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-success)',
          borderRadius: '10px',
          padding: '12px 16px',
          minWidth: '240px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <CheckCircle2 size={18} color="var(--color-success)" />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-positive-700)',
            flex: 1,
          }}
        >
          {message}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            color: 'var(--color-positive-700)',
            display: 'flex',
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
