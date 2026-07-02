import { assetUrl } from '../utils/assets';
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, X, FileText, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';
import StepBreadcrumb from '../components/ui/StepBreadcrumb';
import WizardBar from '../components/layout/WizardBar';

const AREAS_COMFANDI = [
  'Salud y Calidad',
  'Educación',
  'Tecnología e Innovación',
  'Recreación y Deporte',
  'Talento Humano',
  'Finanzas',
  'Compras y Abastecimiento',
  'Servicios Sociales',
  'Comercial',
  'Administración',
  'Operaciones',
  'Legal y Cumplimiento',
];

interface FormState {
  area: string;
  cargo: string;
  fechaIngreso: string;
  tipoVacante: 'nueva' | 'reemplazo' | '';
  archivo: File | null;
}

const FIELD_STYLE = {
  width: '100%',
  height: '44px',
  padding: '0 14px',
  border: '1.5px solid var(--color-border-default)',
  borderRadius: 'var(--radius-sm)',
  background: '#ffffff',
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  outline: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
} as const;

const LABEL_STYLE = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  marginBottom: '10px',
  fontFamily: 'var(--font-display)',
} as const;

export default function CrearVacante() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormState>({
    area: '',
    cargo: '',
    fechaIngreso: '',
    tipoVacante: '',
    archivo: null,
  });

  const set = (key: keyof FormState, value: FormState[keyof FormState]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const errors = submitted
    ? {
        area: !form.area,
        cargo: !form.cargo.trim(),
        fechaIngreso: !form.fechaIngreso,
        tipoVacante: !form.tipoVacante,
        archivo: !form.archivo,
      }
    : { area: false, cargo: false, fechaIngreso: false, tipoVacante: false, archivo: false };

  const isValid =
    !!form.area &&
    !!form.cargo.trim() &&
    !!form.fechaIngreso &&
    !!form.tipoVacante &&
    !!form.archivo;

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isValid) return;
    navigate('/vacante/nueva/analizando', { state: { cargo: form.cargo, area: form.area, tipoVacante: form.tipoVacante, fechaIngreso: form.fechaIngreso } });
  };

  const handleFile = (file: File) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;
    set('archivo', file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const focusStyle = (field: string, hasError: boolean): React.CSSProperties => ({
    borderColor: hasError
      ? 'var(--color-negative-500)'
      : focusedField === field
      ? 'var(--color-border-focus)'
      : 'var(--color-border-default)',
    boxShadow: hasError
      ? '0 0 0 3px rgba(211,47,47,0.12)'
      : focusedField === field
      ? '0 0 0 3px rgba(135,80,246,0.14)'
      : 'none',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-surface-subtle)',
        fontFamily: 'var(--font-display)',
      }}
    >
      {/* Navbar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--color-border-default)',
          padding: '0 40px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={assetUrl('/logo-gcexpress.png')}
            alt="Grupo Express"
            style={{ maxHeight: '100px', maxWidth: '300px', width: 'auto', height: 'auto', objectFit: 'contain' }}
          />
          <div style={{ width: '1px', height: '32px', background: 'var(--color-border-default)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <span>Powered by</span>
            <img src={assetUrl('/logo-unio.png')} alt="Unio" style={{ height: '14px', width: 'auto' }} />
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          Cancelar
        </Button>
      </header>

      {/* Page content */}
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '48px 24px 100px',
        }}
      >
        {/* Step breadcrumb */}
        <StepBreadcrumb current={1} />

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '22px',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.3px',
            }}
          >
            Crear nueva vacante
          </h1>
          <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Completa los datos del cargo y sube el Job Description para que la IA analice el perfil.
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-default)',
            padding: '32px',
          }}
        >
          {/* Área interna */}
          <div style={{ marginBottom: '24px' }}>
            <label style={LABEL_STYLE}>
              Área interna que solicita{' '}
              <span style={{ color: 'var(--color-brand-accent)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={form.area}
                onChange={(e) => set('area', e.target.value)}
                onFocus={() => setFocusedField('area')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...FIELD_STYLE,
                  appearance: 'none',
                  paddingRight: '40px',
                  color: form.area ? 'var(--color-text-primary)' : 'var(--color-text-placeholder)',
                  cursor: 'pointer',
                  ...focusStyle('area', errors.area),
                }}
              >
                <option value="" disabled hidden>
                  Selecciona un área
                </option>
                {AREAS_COMFANDI.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  pointerEvents: 'none',
                }}
              />
            </div>
            {errors.area && <FieldError text="Selecciona el área que solicita la vacante." />}
          </div>

          {/* Nombre del cargo */}
          <div style={{ marginBottom: '24px' }}>
            <label style={LABEL_STYLE}>
              Nombre del cargo{' '}
              <span style={{ color: 'var(--color-brand-accent)' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Coordinador de Logística"
              value={form.cargo}
              onChange={(e) => set('cargo', e.target.value)}
              onFocus={() => setFocusedField('cargo')}
              onBlur={() => setFocusedField(null)}
              style={{
                ...FIELD_STYLE,
                ...focusStyle('cargo', errors.cargo),
              }}
            />
            {errors.cargo && <FieldError text="Ingresa el nombre del cargo." />}
          </div>

          {/* Fecha esperada de ingreso */}
          <div style={{ marginBottom: '24px' }}>
            <label style={LABEL_STYLE}>
              Fecha esperada de ingreso{' '}
              <span style={{ color: 'var(--color-brand-accent)' }}>*</span>
            </label>
            <input
              type="date"
              value={form.fechaIngreso}
              onChange={(e) => set('fechaIngreso', e.target.value)}
              onFocus={() => setFocusedField('fecha')}
              onBlur={() => setFocusedField(null)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                ...FIELD_STYLE,
                color: form.fechaIngreso ? 'var(--color-text-primary)' : 'var(--color-text-placeholder)',
                ...focusStyle('fecha', errors.fechaIngreso),
              }}
            />
            {errors.fechaIngreso && <FieldError text="Indica la fecha esperada de ingreso." />}
          </div>

          {/* Tipo de vacante */}
          <div style={{ marginBottom: '0' }}>
            <label style={LABEL_STYLE}>
              ¿Es vacante nueva o reemplazo?{' '}
              <span style={{ color: 'var(--color-brand-accent)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              {(['nueva', 'reemplazo'] as const).map((opt) => {
                const active = form.tipoVacante === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set('tipoVacante', opt)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      height: '44px',
                      padding: '0 18px',
                      borderRadius: 'var(--radius-sm)',
                      border: active
                        ? '1.5px solid var(--color-brand-accent)'
                        : '1.5px solid var(--color-border-default)',
                      background: active ? 'var(--color-secondary-50)' : '#ffffff',
                      color: active ? 'var(--color-brand-accent)' : 'var(--color-text-muted)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Radio indicator */}
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: active
                          ? '5px solid var(--color-brand-accent)'
                          : '1.5px solid var(--color-border-default)',
                        background: '#ffffff',
                        flexShrink: 0,
                        transition: 'border 0.15s ease',
                      }}
                    />
                    {opt === 'nueva' ? 'Vacante nueva' : 'Reemplazo'}
                  </button>
                );
              })}
            </div>
            {errors.tipoVacante && <FieldError text="Indica si es vacante nueva o reemplazo." />}
          </div>

          {/* Divider */}
          <div
            style={{
              borderTop: '1px solid var(--color-border-default)',
              margin: '28px 0',
            }}
          />

          {/* File upload */}
          <div>
            <label style={LABEL_STYLE}>
              Sube el Job Description{' '}
              <span style={{ color: 'var(--color-brand-accent)' }}>*</span>
            </label>

            {form.archivo ? (
              /* File attached state */
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--color-positive-500)',
                  background: 'var(--color-success-bg)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--color-positive-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={18} color="var(--color-positive-600)" />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {form.archivo.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {(form.archivo.size / 1024).toFixed(0)} KB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => set('archivo', null)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'var(--color-positive-100)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} color="var(--color-positive-700)" />
                </button>
              </div>
            ) : (
              /* Drop zone */
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${
                    errors.archivo
                      ? 'var(--color-negative-400)'
                      : isDragging
                      ? 'var(--color-brand-accent)'
                      : 'var(--color-border-default)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: isDragging
                    ? 'var(--color-secondary-50)'
                    : errors.archivo
                    ? 'var(--color-negative-50)'
                    : 'var(--color-surface-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)',
                    background: isDragging ? 'var(--color-secondary-100)' : '#ffffff',
                    border: '1px solid var(--color-border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <Upload
                    size={22}
                    color={isDragging ? 'var(--color-brand-accent)' : 'var(--color-text-muted)'}
                  />
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isDragging ? 'var(--color-brand-accent)' : 'var(--color-text-primary)',
                    marginBottom: '4px',
                  }}
                >
                  {isDragging ? 'Suelta el archivo aquí' : 'Arrastra el archivo aquí'}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  o haz clic para buscar
                </p>
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Busca entre tus archivos
                  </Button>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-placeholder)', marginTop: '12px' }}>
                  PDF, DOCX · Máx. 10 MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />

            {errors.archivo && <FieldError text="Sube el Job Description en formato PDF o DOCX." />}
          </div>

          {/* Actions moved to WizardBar */}
        </div>
      </div>

      <WizardBar>
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <Button variant="ghost" size="lg" onClick={() => navigate('/')}>
            Cancelar
          </Button>
          <Button variant="primary" size="lg" onClick={handleSubmit}>
            Analizar documento
            <ArrowRight size={16} />
          </Button>
        </div>
      </WizardBar>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FieldError({ text }: { text: string }) {
  return (
    <p
      style={{
        marginTop: '6px',
        fontSize: '12px',
        color: 'var(--color-negative-500)',
        fontFamily: 'var(--font-display)',
      }}
    >
      {text}
    </p>
  );
}
