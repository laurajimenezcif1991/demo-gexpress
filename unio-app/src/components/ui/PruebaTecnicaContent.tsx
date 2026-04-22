import { useState, useEffect, useRef } from 'react';
import { Check, Pencil, Upload, X as XIcon, Calendar, Clock, User } from 'lucide-react';
import StarRating from './StarRating';
import Button from './Button';
import { type TechTestFeedback, type TechTestRecomendacion } from '../../data/mock';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = (id: string) => `unio_tech_feedback_${id}`;

const RATING_CATEGORIES: { key: keyof TechTestFeedback['ratings']; label: string }[] = [
  { key: 'dominio',       label: 'Dominio técnico' },
  { key: 'resolucion',    label: 'Resolución de problemas' },
  { key: 'calidad',       label: 'Calidad del trabajo' },
  { key: 'comunicacion',  label: 'Comunicación' },
  { key: 'iniciativa',    label: 'Iniciativa' },
];

const RECOMENDACION_OPTIONS: { value: TechTestRecomendacion; label: string }[] = [
  { value: 'avanzar',          label: 'Recomendar avanzar' },
  { value: 'avanzar_reservas', label: 'Avanzar con reservas' },
  { value: 'no_recomendar',    label: 'No recomendar' },
];

const ACCEPTED_TYPES = '.pdf,.pptx,.jpg,.jpeg,.png,.mp4,.mov';

function emptyForm(): TechTestFeedback {
  return {
    ratings: { dominio: 0, resolucion: 0, calidad: 0, comunicacion: 0, iniciativa: 0 },
    destacados: '',
    senalAlerta: '',
    recomendacion: null,
    files: [],
  };
}

// ─── Styles (mirrored from EntrevistasContent) ────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  marginBottom: '10px',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  resize: 'vertical',
  outline: 'none',
  background: '#ffffff',
  boxSizing: 'border-box',
};

const roLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  margin: '0 0 6px',
};

const roValueStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  margin: 0,
  lineHeight: '1.6',
};

const dividerStyle: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid var(--color-border-default)',
  margin: '0',
};

// ─── Meta row (date / duration / interviewer) ─────────────────────────────────

function MetaRow({ meta }: { meta: { date: string; duration: string; interviewer: string } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
      {[
        { icon: <Calendar size={14} />, text: meta.date },
        { icon: <Clock size={14} />, text: meta.duration },
        { icon: <User size={14} />, text: meta.interviewer },
      ].map(({ icon, text }) => (
        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
          {icon}
          {text}
        </div>
      ))}
    </div>
  );
}

// ─── Read-only view ───────────────────────────────────────────────────────────

function TechReadOnly({ form, meta, onEdit }: { form: TechTestFeedback; meta?: { date: string; duration: string; interviewer: string }; onEdit: () => void }) {
  const selectedOpt = RECOMENDACION_OPTIONS.find((o) => o.value === form.recomendacion);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {meta && <MetaRow meta={meta} />}
      {/* Ratings */}
      <div>
        <p style={{ ...roLabelStyle, marginBottom: '12px' }}>Evaluación por categorías</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {RATING_CATEGORIES.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ ...roLabelStyle, margin: 0, minWidth: '160px' }}>{label}</span>
              <StarRating value={form.ratings[key]} readonly />
            </div>
          ))}
        </div>
      </div>

      <hr style={dividerStyle} />

      <div>
        <p style={roLabelStyle}>Lo que más destacó</p>
        <p style={roValueStyle}>{form.destacados || '—'}</p>
      </div>

      <hr style={dividerStyle} />

      <div>
        <p style={roLabelStyle}>Señales de alerta</p>
        <p style={roValueStyle}>{form.senalAlerta || 'Sin señales reportadas.'}</p>
      </div>

      <hr style={dividerStyle} />

      <div>
        <p style={roLabelStyle}>Recomendación</p>
        {selectedOpt ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-brand-accent)',
            background: 'var(--color-secondary-50)',
            fontFamily: 'var(--font-display)', fontSize: '13px',
            fontWeight: 600, color: 'var(--color-brand-accent)',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-brand-accent)' }} />
            {selectedOpt.label}
          </div>
        ) : (
          <p style={roValueStyle}>—</p>
        )}
      </div>

      {form.files.length > 0 && (
        <>
          <hr style={dividerStyle} />
          <div>
            <p style={roLabelStyle}>Evidencia adjunta</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {form.files.map((f) => (
                <div key={f.name} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-default)',
                  background: '#fafafa',
                }}>
                  <Upload size={13} color="var(--color-text-muted)" />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                    {f.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ borderTop: '1px solid var(--color-border-default)', paddingTop: '14px' }}>
        <Button variant="outline" size="md" onClick={onEdit}>
          <Pencil size={14} />
          Editar
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PruebaTecnicaContent({ candidateId, meta, onScoreChange, onRecomendacionChange }: {
  candidateId: string;
  meta?: { date: string; duration: string; interviewer: string };
  onScoreChange?: (score: number | null) => void;
  onRecomendacionChange?: (rec: TechTestRecomendacion | null) => void;
}) {
  const [form, setForm] = useState<TechTestFeedback>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(candidateId));
      if (raw) return JSON.parse(raw) as TechTestFeedback;
    } catch { /* ignore */ }
    return emptyForm();
  });

  const [readOnly, setReadOnly] = useState(() => {
    try { return !!localStorage.getItem(STORAGE_KEY(candidateId)); } catch { return false; }
  });

  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Sync if candidateId changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(candidateId));
      if (raw) {
        setForm(JSON.parse(raw) as TechTestFeedback);
        setReadOnly(true);
      } else {
        setForm(emptyForm());
        setReadOnly(false);
      }
    } catch { /* ignore */ }
  }, [candidateId]);

  const allRatingsFilled = Object.values(form.ratings).every((v) => v > 0);
  const isValid = allRatingsFilled && form.destacados.trim() !== '' && form.recomendacion !== null;

  const calcTechScore = (ratings: TechTestFeedback['ratings']): number => {
    const vals = Object.values(ratings);
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 20);
  };

  const handleRating = (key: keyof TechTestFeedback['ratings'], value: number) => {
    setForm((prev) => ({ ...prev, ratings: { ...prev.ratings, [key]: value } }));
  };

  const handleSave = () => {
    setSubmitted(true);
    if (!isValid) return;
    try { localStorage.setItem(STORAGE_KEY(candidateId), JSON.stringify(form)); } catch { /* ignore */ }
    setReadOnly(true);
    onScoreChange?.(calcTechScore(form.ratings));
    onRecomendacionChange?.(form.recomendacion);
    setReadOnly(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    setForm((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }));
  };

  const removeFile = (index: number) => {
    setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  if (readOnly) {
    return (
      <div style={{ paddingTop: '8px' }}>
        <TechReadOnly form={form} meta={meta} onEdit={() => { setReadOnly(false); onScoreChange?.(null); onRecomendacionChange?.(null); }} />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {meta && <MetaRow meta={meta} />}

      {/* Evaluación por categorías */}
      <div>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--color-text-primary)',
          margin: '0 0 16px',
        }}>
          Evaluación por categorías
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {RATING_CATEGORIES.map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>
                {label} <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <StarRating value={form.ratings[key]} onChange={(v) => handleRating(key, v)} />
              {submitted && form.ratings[key] === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)', marginTop: '4px', display: 'block' }}>
                  Selecciona una calificación
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <hr style={dividerStyle} />

      {/* Lo que más destacó */}
      <div>
        <label style={labelStyle}>
          Lo que más destacó <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <textarea
          placeholder="Describe aspectos destacados..."
          value={form.destacados}
          onChange={(e) => setForm((prev) => ({ ...prev, destacados: e.target.value }))}
          style={{
            ...textareaStyle,
            borderColor: submitted && !form.destacados.trim() ? 'var(--color-danger, #ef4444)' : undefined,
          }}
          rows={4}
        />
        {submitted && !form.destacados.trim() && (
          <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)', marginTop: '4px', display: 'block' }}>
            Este campo es obligatorio
          </span>
        )}
      </div>

      <hr style={dividerStyle} />

      {/* Señales de alerta */}
      <div>
        <label style={labelStyle}>
          Señales de alerta{' '}
          <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }}>
            (Opcional)
          </span>
        </label>
        <textarea
          placeholder="Menciona aspectos que requieren atención..."
          value={form.senalAlerta}
          onChange={(e) => setForm((prev) => ({ ...prev, senalAlerta: e.target.value }))}
          style={textareaStyle}
          rows={3}
        />
      </div>

      <hr style={dividerStyle} />

      {/* Recomendación */}
      <div>
        <label style={labelStyle}>
          Recomendación <span style={{ color: 'var(--color-danger)' }}>*</span>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          {RECOMENDACION_OPTIONS.map((opt) => {
            const isSelected = form.recomendacion === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, recomendacion: opt.value }))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${isSelected ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                  background: isSelected ? 'var(--color-secondary-50)' : '#ffffff',
                  cursor: 'pointer', fontFamily: 'var(--font-display)',
                  fontSize: '14px', fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--color-brand-accent)' : 'var(--color-text-primary)',
                  transition: 'all 0.15s ease', textAlign: 'left',
                }}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: `2px solid ${isSelected ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                  background: isSelected ? 'var(--color-brand-accent)' : 'transparent',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && (
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                  )}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
        {submitted && form.recomendacion === null && (
          <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)', marginTop: '6px', display: 'block' }}>
            Selecciona una opción
          </span>
        )}
      </div>

      <hr style={dividerStyle} />

      {/* Evidencia (opcional) */}
      <div>
        <label style={labelStyle}>
          Evidencia{' '}
          <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }}>
            (Opcional)
          </span>
        </label>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
          }}
          style={{
            border: `1.5px dashed ${dragging ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '24px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            cursor: 'pointer',
            background: dragging ? 'var(--color-secondary-50)' : '#fafafa',
            transition: 'all 0.15s ease',
          }}
        >
          <Upload size={18} color="var(--color-text-muted)" />
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: '13px', color: 'var(--color-text-primary)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Subir archivos
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            .zip .pdf .docx .md .mp4 .mov
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
        />

        {/* File list */}
        {form.files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
            {form.files.map((f, i) => (
              <div key={`${f.name}-${i}`} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-default)',
                background: '#ffffff',
              }}>
                <Upload size={13} color="var(--color-text-muted)" />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-primary)', flex: 1 }}>
                  {f.name}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {(f.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                >
                  <XIcon size={14} color="var(--color-text-muted)" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--color-border-default)' }}>
        <Button variant="primary" size="md" onClick={handleSave}>
          Enviar evaluación
        </Button>
      </div>

      {saved && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 14px', background: 'var(--color-success-bg, #ecfdf5)',
          color: 'var(--color-success, #059669)', borderRadius: 'var(--radius-sm)',
          fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: 600,
        }}>
          <Check size={14} /> Evaluación guardada correctamente
        </div>
      )}
    </div>
  );
}
