import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, BarChart2, RotateCcw, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePipeline } from '../../context/PipelineContext';
import { assetUrl } from '../../utils/assets';

// ─── Analytics sub-sections ───────────────────────────────────────────────────

const ANALYTICS_SECTIONS = [
  { id: 'seccion-estado',     label: 'Estado por Vacantes' },
  { id: 'seccion-funnel',     label: 'Funnel de Candidatos' },
  { id: 'seccion-eficiencia', label: 'Eficiencia de Tiempo' },
  { id: 'seccion-kpi',        label: 'KPI Hiring Manager' },
  { id: 'seccion-detalle',    label: 'Detalle por Vacante' },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  // Offset for the sticky header (≈ 120px title + filter row)
  const top = el.getBoundingClientRect().top + window.scrollY - 130;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MainSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { companyLogoUrl, companyName } = usePipeline();

  const isAnalytics = location.pathname.startsWith('/analytics');
  const active = isAnalytics ? 'analytics' : 'vacantes';

  const [activeSection, setActiveSection] = useState<string>('seccion-estado');

  // Track which section is in viewport
  useEffect(() => {
    if (!isAnalytics) return;

    const observers: IntersectionObserver[] = [];

    ANALYTICS_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [isAnalytics, location.pathname]);

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
      <div style={{ padding: '20px 20px 16px', overflow: 'hidden' }}>
        <img
          src={companyLogoUrl || assetUrl('/logo-gcexpress.png')}
          alt={companyName || 'Grupo Express'}
          style={{
            maxHeight: '80px',
            maxWidth: '100%',
            width: 'auto',
            height: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {navItems.map(({ id, label, Icon, path }) => {
          const isActive = active === id;
          return (
            <div key={id}>
              <button
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
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'var(--color-surface-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <Icon size={16} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
                <span>{label}</span>
              </button>

              {/* Indented sub-menu — only when on /analytics */}
              {id === 'analytics' && isAnalytics && (
                <div
                  style={{
                    marginLeft: '20px',
                    marginBottom: '4px',
                    borderLeft: '1px solid var(--color-border-default)',
                    paddingLeft: '0',
                  }}
                >
                  {ANALYTICS_SECTIONS.map(({ id: sId, label: sLabel }, idx) => {
                    const isSectionActive = activeSection === sId;
                    return (
                      <button
                        key={sId}
                        onClick={() => scrollToSection(sId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '7px 12px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'var(--font-display)',
                          fontSize: '12px',
                          fontWeight: isSectionActive ? 600 : 400,
                          color: isSectionActive
                            ? 'var(--color-secondary-600)'
                            : 'var(--color-text-muted)',
                          transition: 'color 0.15s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSectionActive)
                            (e.currentTarget as HTMLButtonElement).style.color =
                              'var(--color-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSectionActive)
                            (e.currentTarget as HTMLButtonElement).style.color =
                              'var(--color-text-muted)';
                        }}
                      >
                        {/* Active indicator dot on the border line */}
                        {isSectionActive && (
                          <span
                            style={{
                              position: 'absolute',
                              left: '-5px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'var(--color-secondary-600)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span style={{ lineHeight: '1.3' }}>{sLabel}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
        <button
          title="Reiniciar demo"
          onClick={() => {
            const toRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && (k.startsWith('unio') || k.startsWith('hm_eval_') || k.startsWith('prueba_')))
                toRemove.push(k);
            }
            toRemove.forEach((k) => localStorage.removeItem(k));
            window.location.href = import.meta.env.BASE_URL;
          }}
          style={btnBase}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-subtle)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <RotateCcw size={12} />
          <span>Reiniciar demo</span>
        </button>

        <button
          title="Cerrar sesión"
          onClick={() => { logout(); navigate('/auth'); }}
          style={btnBase}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-subtle)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <LogOut size={12} />
          <span>Salir</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          <span>Powered by</span>
          <img src={assetUrl('/logo-unio.png')} alt="Unio" style={{ height: '16px', width: 'auto' }} />
        </div>
      </div>
    </aside>
  );
}
