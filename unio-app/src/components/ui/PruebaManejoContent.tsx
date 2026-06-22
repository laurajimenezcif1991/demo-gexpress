import { useState, useRef } from 'react';
import { Check, Pencil, Upload, X as XIcon, Calendar, Clock, User, MapPin, Truck } from 'lucide-react';
import StarRating from './StarRating';
import Button from './Button';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResultadoManejo = 'apto' | 'apto_reservas' | 'no_apto';

export interface ManejoRatings {
  control_vehiculo: number;
  manejo_defensivo: number;
  velocidad: number;
  espejos: number;
  cambio_marcha: number;
  reversa: number;
  conocimiento_ruta: number;
  senales_transito: number;
  actitud: number;
  manejo_presion: number;
}

export interface PruebaManejoFeedback {
  ratings: ManejoRatings;
  observaciones: string;
  senalAlerta: string;
  resultado: ResultadoManejo | null;
  files: { name: string; size: number }[];
}

interface PruebaManejoContentProps {
  candidateId?: string;
  meta?: { date: string; duration: string; evaluator: string; route: string };
  initialData?: PruebaManejoFeedback;
  onScoreChange?: (score: number) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RATING_CATEGORIES_TECNICO: { key: keyof ManejoRatings; label: string }[] = [
  { key: 'control_vehiculo',   label: 'Control del vehículo' },
  { key: 'manejo_defensivo',   label: 'Manejo defensivo' },
  { key: 'velocidad',          label: 'Velocidad adecuada' },
  { key: 'espejos',            label: 'Uso de espejos y retrovisores' },
  { key: 'cambio_marcha',      label: 'Cambio de marcha / transmisión' },
  { key: 'reversa',            label: 'Maniobras en reversa' },
  { key: 'conocimiento_ruta',  label: 'Conocimiento de la ruta' },
  { key: 'senales_transito',   label: 'Respeto a señales de tránsito' },
];

const RATING_CATEGORIES_ACTITUDINAL: { key: keyof ManejoRatings; label: string }[] = [
  { key: 'actitud',        label: 'Actitud ante el evaluador' },
  { key: 'manejo_presion', label: 'Manejo bajo presión' },
];

const RESULTADO_OPTIONS: { value: ResultadoManejo; label: string; color: string; bg: string }[] = [
  { value: 'apto',          label: 'Apto',               color: 'var(--color-positive-600)', bg: 'var(--color-positive-50, #E6FAEE)' },
  { value: 'apto_reservas', label: 'Apto con reservas',  color: 'var(--color-warning-700, #A37800)', bg: 'var(--color-warning-50, #FFF8E5)' },
  { value: 'no_apto',       label: 'No apto',            color: 'var(--color-negative-600, #A82424)', bg: 'var(--color-negative-50, #FBEAEA)' },
];

const DEFAULT_META = {
  date: '18 jun 2026',
  duration: '45 min',
  evaluator: 'Carlos Mendoza',
  route: 'Calle 80 – Zona Industrial Norte',
};

const PREFILLED: PruebaManejoFeedback = {
  ratings: {
    control_vehiculo:  4,
    manejo_defensivo:  5,
    velocidad:         4,
    espejos:           5,
    cambio_marcha:     3,
    reversa:           4,
    conocimiento_ruta: 3,
    senales_transito:  5,
    actitud:           5,
    manejo_presion:    4,
  },
  observaciones:
    'El candidato demuestra buen dominio del vehículo en condiciones normales de tráfico urbano. ' +
    'Manejo defensivo sobresaliente: mantiene distancias de seguridad y anticipa maniobras de otros vehículos. ' +
    'Respeta todas las señales de tránsito. Se observa algo de dificultad al maniobrar la caja de cambios en pendientes pronunciadas.',
  senalAlerta:
    'Requiere práctica adicional en cambios de marcha en pendiente. ' +
    'Conocimiento de rutas alternativas limitado — no identificó desvío por obra en Calle 72.',
  resultado: 'apto_reservas',
  files: [
    { name: 'ruta_evaluacion_jun18.pdf', size: 214000 },
    { name: 'foto_inicio_prueba.jpg',    size: 87000 },
  ],
};

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.mp4,.mov';

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  marginBottom: '10px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: 'var(--color-text-muted)',
  marginBottom: '14px',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  resize: 'vertical' as const,
  outline: 'none',
  background: '#ffffff',
  boxSizing: 'border-box' as const,
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

// ─── Score calculator ─────────────────────────────────────────────────────────

function calcScore(ratings: ManejoRatings): number {
  const vals = Object.values(ratings);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round((avg / 5) * 100);
}

// ─── Meta row ─────────────────────────────────────────────────────────────────

function MetaRow({ meta, resultado }: { meta: typeof DEFAULT_META; resultado?: ResultadoManejo | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
      {[
        { icon: <Calendar size={14} />, text: meta.date },
        { icon: <Clock size={14} />,    text: meta.duration },
        { icon: <User size={14} />,     text: meta.evaluator },
        { icon: <MapPin size={14} />,   text: meta.route },
      ].map(({ icon, text }) => (
        <div
          key={text}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '13px', color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {icon}
          {text}
        </div>
      ))}
      {resultado && <ResultadoBadge value={resultado} />}
    </div>
  );
}

// ─── Resultado badge ──────────────────────────────────────────────────────────

function ResultadoBadge({ value }: { value: ResultadoManejo }) {
  const opt = RESULTADO_OPTIONS.find((o) => o.value === value);
  if (!opt) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '999px',
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: '13px', color: opt.color, background: opt.bg,
    }}>
      <Truck size={12} />
      {opt.label}
    </span>
  );
}

// ─── Read-only view ───────────────────────────────────────────────────────────

function ReadOnlyView({
  form,
  meta,
  onEdit,
}: {
  form: PruebaManejoFeedback;
  meta: typeof DEFAULT_META;
  onEdit: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <MetaRow meta={meta} resultado={form.resultado} />

      <hr style={dividerStyle} />

      {/* Criterios técnicos */}
      <div>
        <p style={sectionTitleStyle}>Criterios técnicos de conducción</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {RATING_CATEGORIES_TECNICO.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ ...roLabelStyle, margin: 0, minWidth: '220px', flex: '0 0 220px' }}>{label}</span>
              <StarRating value={form.ratings[key]} readonly />
            </div>
          ))}
        </div>
      </div>

      <hr style={dividerStyle} />

      {/* Criterios actitudinales */}
      <div>
        <p style={sectionTitleStyle}>Comportamiento y actitud</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {RATING_CATEGORIES_ACTITUDINAL.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ ...roLabelStyle, margin: 0, minWidth: '220px', flex: '0 0 220px' }}>{label}</span>
              <StarRating value={form.ratings[key]} readonly />
            </div>
          ))}
        </div>
      </div>

      <hr style={dividerStyle} />

      {/* Observaciones */}
      <div>
        <p style={roLabelStyle}>Observaciones generales</p>
        <p style={roValueStyle}>{form.observaciones || '—'}</p>
      </div>

      <hr style={dividerStyle} />

      {/* Señales de alerta */}
      <div>
        <p style={roLabelStyle}>Señales de alerta</p>
        <p style={roValueStyle}>{form.senalAlerta || 'Sin señales reportadas.'}</p>
      </div>

      {/* Evidencia */}
      {form.files.length > 0 && (
        <>
          <hr style={dividerStyle} />
          <div>
            <p style={roLabelStyle}>Evidencia adjunta</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              {form.files.map((f, i) => (
                <div key={`${f.name}-${i}`} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-default)', background: '#ffffff',
                }}>
                  <Upload size={13} color="var(--color-text-muted)" />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-primary)', flex: 1 }}>
                    {f.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Edit button */}
      <div style={{ paddingTop: '4px' }}>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          <Pencil size={13} style={{ marginRight: '6px' }} />
          Editar evaluación
        </Button>
      </div>
    </div>
  );
}

// ─── Edit view ────────────────────────────────────────────────────────────────

function EditView({
  form,
  setForm,
  meta,
  onSave,
  onCancel,
}: {
  form: PruebaManejoFeedback;
  setForm: React.Dispatch<React.SetStateAction<PruebaManejoFeedback>>;
  meta: typeof DEFAULT_META;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRating = (key: keyof ManejoRatings, value: number) => {
    setForm((prev) => ({ ...prev, ratings: { ...prev.ratings, [key]: value } }));
  };

  const addFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    setForm((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }));
  };

  const removeFile = (idx: number) => {
    setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }));
  };

  const allRatingsFilled = Object.values(form.ratings).every((v) => v > 0);
  const isValid = allRatingsFilled && form.observaciones.trim() && form.resultado;

  const handleSubmit = () => {
    setSubmitted(true);
    if (isValid) onSave();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <MetaRow meta={meta} />

      {/* Criterios técnicos */}
      <div>
        <p style={sectionTitleStyle}>Criterios técnicos de conducción</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {RATING_CATEGORIES_TECNICO.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ ...roLabelStyle, margin: 0, minWidth: '220px', flex: '0 0 220px' }}>{label}</span>
              <StarRating value={form.ratings[key]} onChange={(v) => handleRating(key, v)} />
              {submitted && form.ratings[key] === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)' }}>Requerido</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <hr style={dividerStyle} />

      {/* Criterios actitudinales */}
      <div>
        <p style={sectionTitleStyle}>Comportamiento y actitud</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {RATING_CATEGORIES_ACTITUDINAL.map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ ...roLabelStyle, margin: 0, minWidth: '220px', flex: '0 0 220px' }}>{label}</span>
              <StarRating value={form.ratings[key]} onChange={(v) => handleRating(key, v)} />
              {submitted && form.ratings[key] === 0 && (
                <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)' }}>Requerido</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <hr style={dividerStyle} />

      {/* Observaciones */}
      <div>
        <label style={labelStyle}>
          Observaciones generales <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
        </label>
        <textarea
          placeholder="Describe el desempeño general del candidato durante la prueba..."
          value={form.observaciones}
          onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))}
          style={{
            ...textareaStyle,
            borderColor: submitted && !form.observaciones.trim() ? 'var(--color-danger, #ef4444)' : undefined,
          }}
          rows={4}
        />
        {submitted && !form.observaciones.trim() && (
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
          <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }}>(Opcional)</span>
        </label>
        <textarea
          placeholder="Aspectos que requieren atención o seguimiento..."
          value={form.senalAlerta}
          onChange={(e) => setForm((prev) => ({ ...prev, senalAlerta: e.target.value }))}
          style={textareaStyle}
          rows={3}
        />
      </div>

      <hr style={dividerStyle} />

      {/* Resultado */}
      <div>
        <label style={labelStyle}>
          Resultado <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {RESULTADO_OPTIONS.map((opt) => {
            const isSelected = form.resultado === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, resultado: opt.value }))}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '7px 16px', borderRadius: 999,
                  border: `1.5px solid ${isSelected ? opt.color : 'var(--color-border-default)'}`,
                  background: isSelected ? opt.bg : '#ffffff',
                  cursor: 'pointer', fontFamily: 'var(--font-display)',
                  fontSize: '13px', fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? opt.color : 'var(--color-text-primary)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  border: `2px solid ${isSelected ? opt.color : 'var(--color-border-default)'}`,
                  background: isSelected ? opt.color : 'transparent',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
        {submitted && !form.resultado && (
          <span style={{ fontSize: '12px', color: 'var(--color-danger, #ef4444)', marginTop: '6px', display: 'block' }}>
            Selecciona un resultado
          </span>
        )}
      </div>

      <hr style={dividerStyle} />

      {/* Evidencia */}
      <div>
        <label style={labelStyle}>
          Evidencia{' '}
          <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }}>(Opcional)</span>
        </label>
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
            letterSpacing: '0.06em', textTransform: 'uppercase' as const,
          }}>
            Subir archivos
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            .pdf .jpg .png .mp4 .mov
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
        {form.files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
            {form.files.map((f, i) => (
              <div key={`${f.name}-${i}`} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-default)', background: '#ffffff',
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

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--color-border-default)' }}>
        <Button variant="primary" size="md" onClick={handleSubmit}>
          Guardar evaluación
        </Button>
        <Button variant="secondary" size="md" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PruebaManejoContent({
  candidateId,
  meta = DEFAULT_META,
  initialData,
  onScoreChange,
}: PruebaManejoContentProps) {
  const initial = initialData ?? PREFILLED;
  const [form, setForm] = useState<PruebaManejoFeedback>(initial);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setIsEditing(false);
    onScoreChange?.(calcScore(form.ratings));
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setForm(initial);
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {isEditing ? (
        <EditView
          form={form}
          setForm={setForm}
          meta={meta}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <ReadOnlyView
          form={form}
          meta={meta}
          onEdit={() => setIsEditing(true)}
        />
      )}

      {saved && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 14px', background: 'var(--color-positive-50, #ecfdf5)',
          color: 'var(--color-positive-600)', borderRadius: 'var(--radius-sm)',
          fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: 600,
        }}>
          <Check size={14} /> Evaluación guardada correctamente
        </div>
      )}
    </div>
  );
}
