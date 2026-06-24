import { useState } from 'react';
import { X, AlertTriangle, RotateCcw } from 'lucide-react';

const REASONS = {
  definitivo: {
    label: 'Descarte definitivo',
    description: 'Esta persona no debe ser considerada en futuros procesos.',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fca5a5',
    icon: <AlertTriangle size={15} />,
    options: [
      { id: 'def_seguridad', label: 'Hallazgos en estudios de seguridad' },
      { id: 'def_robo',      label: 'Antecedentes de robo o hurto' },
      { id: 'def_riesgo',    label: 'Información de riesgo para la compañía' },
      { id: 'def_otro',      label: 'Otra causal crítica' },
    ],
  },
  circunstancial: {
    label: 'Descarte circunstancial',
    description: 'Esta persona podría participar en futuros procesos.',
    color: '#92400e',
    bg: '#fffbeb',
    border: '#fcd34d',
    icon: <RotateCcw size={15} />,
    options: [
      { id: 'circ_llamadas',   label: 'No contestó las llamadas' },
      { id: 'circ_entrevista', label: 'No asistió a la entrevista' },
      { id: 'circ_empleo',     label: 'Consiguió empleo en otra empresa' },
      { id: 'circ_retiro',     label: 'Decidió retirarse del proceso' },
      { id: 'circ_vacante',    label: 'No cumplía condición específica de esta vacante' },
    ],
  },
} as const;

type ReasonType = keyof typeof REASONS;

interface DescartarModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reasonId: string, type: ReasonType, comments: string) => void;
  candidateName?: string;
  candidateCount?: number;
}

export default function DescartarModal({ open, onClose, onConfirm, candidateName, candidateCount }: DescartarModalProps) {
  const [selectedType, setSelectedType] = useState<ReasonType | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [comments, setComments] = useState('');

  if (!open) return null;

  const handleTypeSelect = (type: ReasonType) => {
    setSelectedType(type);
    setSelectedReason(null);
  };

  const handleConfirm = () => {
    if (!selectedReason || !selectedType) return;
    onConfirm(selectedReason, selectedType, comments.trim());
    setSelectedType(null);
    setSelectedReason(null);
    setComments('');
  };

  const handleClose = () => {
    setSelectedType(null);
    setSelectedReason(null);
    setComments('');
    onClose();
  };

  const subtitle = candidateCount && candidateCount > 1
    ? `${candidateCount} candidatos seleccionados`
    : candidateName
    ? candidateName
    : undefined;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
              Registrar motivo de descarte
            </h2>
            {subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px', borderRadius: '6px', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(Object.entries(REASONS) as [ReasonType, typeof REASONS[ReasonType]][]).map(([type, config]) => {
            const isActive = selectedType === type;
            return (
              <div
                key={type}
                style={{
                  border: `1.5px solid ${isActive ? config.border : 'var(--color-border-default)'}`,
                  borderRadius: '12px',
                  background: isActive ? config.bg : '#fafafa',
                  transition: 'all 0.15s ease',
                  overflow: 'hidden',
                }}
              >
                {/* Type header row */}
                <div
                  onClick={() => handleTypeSelect(type)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '14px 16px', cursor: 'pointer',
                  }}
                >
                  {/* Custom radio */}
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                    border: `2px solid ${isActive ? config.color : '#d1d5db'}`,
                    background: isActive ? config.color : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}>
                    {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div style={{ color: isActive ? config.color : 'var(--color-text-primary)', display: 'flex', alignItems: 'flex-start', paddingTop: '1px' }}>
                    {config.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-display)', color: isActive ? config.color : 'var(--color-text-primary)' }}>
                      {config.label}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                      {config.description}
                    </div>
                  </div>
                </div>

                {/* Sub-reasons */}
                {isActive && (
                  <div style={{ borderTop: `1px solid ${config.border}`, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
                    {config.options.map((opt) => {
                      const isSelected = selectedReason === opt.id;
                      return (
                        <label
                          key={opt.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '9px 10px', borderRadius: '8px', cursor: 'pointer',
                            background: isSelected ? `${config.bg}` : 'transparent',
                            transition: 'background 0.1s ease',
                          }}
                        >
                          <input
                            type="radio"
                            name="discard-reason"
                            value={opt.id}
                            checked={isSelected}
                            onChange={() => setSelectedReason(opt.id)}
                            style={{ display: 'none' }}
                          />
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                            border: `2px solid ${isSelected ? config.color : '#d1d5db'}`,
                            background: isSelected ? config.color : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.12s ease',
                          }}>
                            {isSelected && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff' }} />}
                          </div>
                          <span style={{
                            fontSize: '13px', fontWeight: isSelected ? 600 : 400,
                            color: isSelected ? config.color : 'var(--color-text-primary)',
                            transition: 'all 0.12s ease',
                          }}>
                            {opt.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Comments */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
              Comentarios adicionales <span style={{ fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Agrega contexto o notas relevantes para el equipo..."
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                border: '1.5px solid var(--color-border-default)',
                borderRadius: '10px', padding: '10px 12px',
                fontSize: '13px', color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)', resize: 'none',
                outline: 'none', background: '#fafafa',
                transition: 'border 0.15s ease',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-brand-accent)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border-default)'}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px 20px',
          display: 'flex', gap: '10px', justifyContent: 'flex-end',
          borderTop: '1px solid var(--color-border-default)',
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '9px 20px', borderRadius: '10px',
              border: '1.5px solid var(--color-border-default)',
              background: '#fff', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-display)',
              color: 'var(--color-text-muted)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason}
            style={{
              padding: '9px 22px', borderRadius: '10px',
              border: 'none', cursor: selectedReason ? 'pointer' : 'not-allowed',
              background: selectedReason ? '#dc2626' : '#f3f4f6',
              fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-display)',
              color: selectedReason ? '#fff' : '#9ca3af',
              transition: 'all 0.15s ease',
            }}
          >
            Confirmar descarte
          </button>
        </div>
      </div>
    </div>
  );
}
