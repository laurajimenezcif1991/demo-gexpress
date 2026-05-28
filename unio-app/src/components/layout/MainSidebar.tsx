import { useNavigate, useLocation } from 'react-router-dom';
import { Users, BarChart2, RotateCcw, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePipeline } from '../../context/PipelineContext';
import { assetUrl } from '../../utils/assets';

export default function MainSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { companyLogoUrl, companyName } = usePipeline();

  const active = location.pathname.startsWith('/analytics') ? 'analytics' : 'vacantes';

  const navItems = [
    { id: 'vacantes', label: 'Vacantes', Icon: Users, path: '/' },
    { id: 'analytics', label: 'Analytics', Icon: BarChart2, path: '/analytics' },
  ];

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '100%',
    padding: '6px 8px',
    background: 'transparent',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    transition: 'all 0.15s ease',
  };

  return (
    <aside
      style={{
        width: '205px',
        minWidth: '205px',
        background: '#ffffff',
        borderRight: '1px solid var(--color-border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px' }}>
        <img
          src={companyLogoUrl || assetUrl('/logo-comfandi.webp')}
          alt={companyName || 'Comfandi'}
          style={{
            maxHeight: '56px',
            maxWidth: '168px',
            width: 'auto',
            height: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {navItems.map(({ id, label, Icon, path }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 20px',
                background: isActive ? 'var(--color-secondary-50)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: isActive
                  ? 'var(--color-secondary-600)'
                  : 'var(--color-text-muted)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'var(--color-surface-subtle)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              <Icon size={16} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '12px 20px 16px',
          borderTop: '1px solid var(--color-border-default)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Reset demo */}
        <button
          title="Reiniciar demo (limpia el progreso guardado)"
          onClick={() => {
            const toRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (
                k &&
                (k.startsWith('unio') ||
                  k.startsWith('hm_eval_') ||
                  k.startsWith('prueba_'))
              ) {
                toRemove.push(k);
              }
            }
            toRemove.forEach((k) => localStorage.removeItem(k));
            window.location.href = import.meta.env.BASE_URL;
          }}
          style={btnBase}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--color-surface-subtle)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--color-text-default)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--color-text-muted)';
          }}
        >
          <RotateCcw size={12} />
          <span>Reiniciar demo</span>
        </button>

        {/* Logout */}
        <button
          title="Cerrar sesión"
          onClick={() => {
            logout();
            navigate('/auth');
          }}
          style={btnBase}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--color-surface-subtle)';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--color-text-default)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color =
              'var(--color-text-muted)';
          }}
        >
          <LogOut size={12} />
          <span>Salir</span>
        </button>

        {/* Powered by */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            marginTop: '2px',
          }}
        >
          <span>Powered by</span>
          <img
            src={assetUrl('/logo-unio.png')}
            alt="Unio"
            style={{ height: '16px', width: 'auto' }}
          />
        </div>
      </div>
    </aside>
  );
}
