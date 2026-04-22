import { type ReactNode, type CSSProperties } from 'react';

type BadgeVariant =
  | 'default'
  | 'activa'
  | 'en_pausa'
  | 'cerrada'
  | 'alta'
  | 'media'
  | 'baja'
  | 'scoring'
  | 'prescreening'
  | 'entrevistas'
  | 'evaluaciones'
  | 'finalistas'
  | 'en_rango'
  | 'fuera_de_rango'
  | 'ai'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  default: { background: '#f7f7f8', color: '#68686a' },
  activa: { background: '#E6FAEE', color: '#17723F' },
  en_pausa: { background: '#FFF8E5', color: '#A37800' },
  cerrada: { background: '#f7f7f8', color: '#68686a' },
  alta: { background: '#FBEAEA', color: '#D32F2F' },
  media: { background: '#FFF8E5', color: '#A37800' },
  baja: { background: '#EBEFFF', color: '#0037EB' },
  scoring: { background: '#F2ECFE', color: '#5C11F3' },
  prescreening: { background: '#EBEFFF', color: '#0037EB' },
  entrevistas: { background: '#FFF8E5', color: '#A37800' },
  evaluaciones: { background: '#E6FAEE', color: '#17723F' },
  finalistas: { background: '#FFE5F2', color: '#990032' },
  en_rango: { background: '#E6FAEE', color: '#17723F' },
  fuera_de_rango: { background: '#FBEAEA', color: '#D32F2F' },
  ai: { background: '#8750F6', color: '#ffffff' },
  info: { background: '#EBEFFF', color: '#0037EB' },
  success: { background: '#E6FAEE', color: '#17723F' },
  warning: { background: '#FFF8E5', color: '#A37800' },
  danger: { background: '#FBEAEA', color: '#D32F2F' },
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  style?: CSSProperties;
  small?: boolean;
}

export default function Badge({ variant = 'default', children, style, small }: BadgeProps) {
  const base = variantStyles[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: small ? '2px 8px' : '4px 8px',
        borderRadius: '20px',
        fontSize: small ? '11px' : '12px',
        fontWeight: 600,
        fontFamily: 'var(--font-display)',
        whiteSpace: 'nowrap',
        ...base,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
