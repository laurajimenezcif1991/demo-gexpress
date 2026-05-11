import { type Candidate, type PipelineStageKey } from '../../data/mock';
import { type CandidateStatus } from '../../context/CandidateStatusContext';
import Avatar from './Avatar';
import { getScoreColors } from './ScorePill';
import Badge from './Badge';
import { useState } from 'react';
import { MapPin, Clock, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

type StatusConfig = {
  icon: React.ReactNode;
  text: string;
  color: string;
};

const statusConfig: Record<string, StatusConfig> = {
  continua: {
    icon: <CheckCircle2 size={13} />,
    text: 'Continúa',
    color: 'var(--color-positive-600)',
  },
  por_validar: {
    icon: <HelpCircle size={13} />,
    text: 'Por validar',
    color: 'var(--color-warning-600)',
  },
  descartado: {
    icon: <XCircle size={13} />,
    text: 'Descartado',
    color: 'var(--color-negative-600)',
  },
};

const stageLabelMap: Record<PipelineStageKey, string> = {
  scoring:      'Scoring',
  prescreening: 'Pre-screening',
  entrevistas:  'Entrevistas',
  evaluaciones: 'Pruebas',
};

interface CandidateCardProps {
  candidate: Candidate;
  statusLabel?: CandidateStatus;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onClick?: () => void;
  showStageChip?: boolean;
  isPending?: boolean;
}

const GRADIENT = 'linear-gradient(115deg, #9A7CF7, #FDD83F, #F05899, #3DAC56, #00ADFE)';
const gradientBorderBg = (innerColor: string) =>
  `linear-gradient(${innerColor}, ${innerColor}) padding-box, ${GRADIENT} border-box`;

export default function CandidateCard({ candidate, statusLabel, selected, onSelect, onClick, showStageChip = true, isPending = false }: CandidateCardProps) {
  const { bg: scoreBg, fg: scoreFg } = getScoreColors(candidate.score);
  const [hovered, setHovered] = useState(false);
  const showGradient = hovered || !!selected;
  const innerBg = selected ? 'var(--color-secondary-50)' : '#ffffff';

  const currentStatus = statusLabel ? statusConfig[statusLabel] : null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '16px 20px',
        background: showGradient ? gradientBorderBg(innerBg) : innerBg,
        border: showGradient ? '2px solid transparent' : '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border 0.15s ease',
        marginBottom: '8px',
      }}
    >
      {/* Checkbox */}
      <div
        onClick={(e) => { e.stopPropagation(); onSelect?.(candidate.id); }}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '5px',
          border: selected ? '2px solid var(--color-brand-accent)' : '1.5px solid var(--color-neutral-300)',
          background: selected ? 'var(--color-brand-accent)' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          marginTop: '2px',
          transition: 'all 0.15s ease',
        }}
      >
        {selected && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Avatar */}
      {candidate.photo ? (
        <img
          src={candidate.photo}
          alt={candidate.name}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid var(--color-border-default)',
          }}
        />
      ) : (
        <Avatar initials={candidate.avatarInitials} color={candidate.avatarColor} size={48} />
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Pending chip — shown for newly advanced candidates */}
        {isPending && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '5px',
              color: '#888',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              background: '#F2F2F2',
              borderRadius: '20px',
              padding: '2px 10px',
            }}
          >
            <Clock size={12} />
            <span>Pendiente</span>
          </div>
        )}

        {/* Status label — shown for all 3 states */}
        {!isPending && currentStatus && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '5px',
              color: currentStatus.color,
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
            }}
          >
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
          </div>
        )}

        {/* Name + role + location + stage badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '15px',
              color: 'var(--color-text-primary)',
            }}
          >
            {candidate.name}
          </span>
          {candidate.role && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-brand-accent)',
                background: 'var(--color-secondary-50)',
                borderRadius: '20px',
                padding: '2px 10px',
              }}
            >
              {candidate.role}
            </span>
          )}
          {candidate.location && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                background: '#ffffff',
                border: '1px solid var(--color-border-default)',
                borderRadius: '20px',
                padding: '2px 10px',
              }}
            >
              <MapPin size={10} />
              {candidate.location}
            </span>
          )}
          {showStageChip && (
            <Badge variant={candidate.currentStage} small>
              {stageLabelMap[candidate.currentStage]}
            </Badge>
          )}
        </div>

        {/* Compact info line */}
        {(candidate.sector || candidate.years) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '4px',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {candidate.sector && <span>{candidate.sector}</span>}
            {candidate.sector && candidate.years && <span style={{ opacity: 0.4 }}>·</span>}
            {candidate.years && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Clock size={11} />
                {candidate.years}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            lineHeight: '1.5',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {candidate.bio}
        </p>
      </div>

      {/* Score */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total</span>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: scoreBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '18px',
            color: scoreFg,
          }}
        >
          {candidate.score}
        </div>
      </div>
    </div>
  );
}
