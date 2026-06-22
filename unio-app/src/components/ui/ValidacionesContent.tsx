import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Clock, ExternalLink } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  name: string;
  size: number;
  uploadedAt: Date;
  /** URL para abrir el documento en una pestaña nueva (mock o blob) */
  url?: string;
}

interface DocSlot {
  id: string;
  label: string;
  description: string;
  required: boolean;
  acceptedTypes: string;
  icon: string;
}

export interface ValidacionesState {
  examenMedico: UploadedFile | null;
  estudioSeguridad: UploadedFile | null;
  visitaDomiciliaria: UploadedFile | null;
}

interface Props {
  defaultState?: Partial<ValidacionesState>;
  onChange?: (state: ValidacionesState) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOC_SLOTS: DocSlot[] = [
  {
    id: 'examenMedico',
    label: 'Examen médico ocupacional',
    description: 'Resultado del examen de aptitud para conducción de vehículos pesados.',
    required: true,
    acceptedTypes: '.pdf,.jpg,.jpeg,.png',
    icon: '🩺',
  },
  {
    id: 'estudioSeguridad',
    label: 'Estudio de seguridad',
    description: 'Informe de verificación de antecedentes penales, judiciales y referencias.',
    required: true,
    acceptedTypes: '.pdf',
    icon: '🔒',
  },
  {
    id: 'visitaDomiciliaria',
    label: 'Visita domiciliaria',
    description: 'Informe de visita al domicilio del candidato. Aplica según política interna.',
    required: false,
    acceptedTypes: '.pdf',
    icon: '🏠',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({
  slot, file, onUpload, onRemove,
}: { slot: DocSlot; file: UploadedFile | null; onUpload: (f: UploadedFile) => void; onRemove: () => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (raw: File) => {
    const url = URL.createObjectURL(raw);
    onUpload({ name: raw.name, size: raw.size, uploadedAt: new Date(), url });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  if (file) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px',
        background: 'var(--color-positive-50, #E6FAEE)',
        border: '1.5px solid #BBF7D0',
        borderRadius: 'var(--radius-md)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-sm)',
          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid #BBF7D0', flexShrink: 0,
        }}>
          <FileText size={16} color="var(--color-positive-600, #1F9854)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.name}
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '11px', color: 'var(--color-positive-600, #1F9854)' }}>
            {file.size > 0 ? `${formatBytes(file.size)} · ` : ''}Cargado {formatDate(file.uploadedAt)}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <CheckCircle size={16} color="var(--color-positive-600, #1F9854)" />
          {file.url && (
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver documento en nueva pestaña"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: 999,
                background: '#fff', border: '1px solid #BBF7D0',
                color: 'var(--color-positive-600, #1F9854)',
                fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 600,
                textDecoration: 'none', cursor: 'pointer',
              }}
            >
              <ExternalLink size={11} /> Ver
            </a>
          )}
          <button
            onClick={onRemove}
            title="Eliminar documento"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px', display: 'flex', alignItems: 'center' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={slot.acceptedTypes}
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `1.5px dashed ${dragging ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          cursor: 'pointer',
          background: dragging ? 'var(--color-secondary-50)' : '#fafafa',
          transition: 'all 0.15s',
        }}
      >
        <Upload size={16} color={dragging ? 'var(--color-brand-accent)' : 'var(--color-text-muted)'} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>
          Cargar documento
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          {slot.acceptedTypes.replaceAll('.', '').toUpperCase().replaceAll(',', ' · ')} · Arrastra o haz clic
        </span>
      </div>
    </>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ state }: { state: ValidacionesState }) {
  const required = [state.examenMedico, state.estudioSeguridad];
  const uploadedRequired = required.filter(Boolean).length;
  const total = Object.values(state).filter(Boolean).length;

  if (uploadedRequired === 2) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--color-positive-50, #E6FAEE)', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)' }}>
        <CheckCircle size={14} color="var(--color-positive-600, #1F9854)" />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: 'var(--color-positive-600, #1F9854)' }}>
          Documentos obligatorios completos · {total} archivo{total !== 1 ? 's' : ''} cargado{total !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }
  if (total > 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--color-warning-50, #FFF8E5)', border: '1px solid #FFE59E', borderRadius: 'var(--radius-md)' }}>
        <Clock size={14} color="var(--color-warning-700, #A37800)" />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: 'var(--color-warning-700, #A37800)' }}>
          {total} documento{total !== 1 ? 's' : ''} cargado{total !== 1 ? 's' : ''} · Faltan documentos obligatorios
        </span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#F5F5F5', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)' }}>
      <AlertCircle size={14} color="var(--color-text-muted)" />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-muted)' }}>
        Pendiente de carga · Solicita los documentos al candidato por WhatsApp
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ValidacionesContent({ defaultState, onChange }: Props) {
  const [docs, setDocs] = useState<ValidacionesState>({
    examenMedico: defaultState?.examenMedico ?? null,
    estudioSeguridad: defaultState?.estudioSeguridad ?? null,
    visitaDomiciliaria: defaultState?.visitaDomiciliaria ?? null,
  });

  const update = (id: string, file: UploadedFile | null) => {
    const next = { ...docs, [id]: file };
    setDocs(next);
    onChange?.(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Info banner */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--color-secondary-50)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.55,
      }}>
        En esta primera versión el reclutador carga manualmente los resultados. Los documentos quedan almacenados en la plataforma. <strong>No se realiza análisis automático</strong> de los documentos en este momento.
      </div>

      {/* Status */}
      <StatusBadge state={docs} />

      {/* Document slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {DOC_SLOTS.map(slot => (
          <div key={slot.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>{slot.icon}</span>
              <div>
                <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {slot.label}
                  {slot.required ? (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-brand-accent)', background: 'var(--color-secondary-50)', border: '1px solid var(--color-secondary-200)', padding: '1px 6px', borderRadius: 999 }}>
                      Obligatorio
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-muted)', background: '#F5F5F5', border: '1px solid var(--color-border-default)', padding: '1px 6px', borderRadius: 999 }}>
                      Opcional
                    </span>
                  )}
                </p>
                <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  {slot.description}
                </p>
              </div>
            </div>
            <UploadZone
              slot={slot}
              file={docs[slot.id as keyof ValidacionesState]}
              onUpload={f => update(slot.id, f)}
              onRemove={() => update(slot.id, null)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Export helper to compute status from state
export function getValidacionesStatus(state: ValidacionesState): 'sin_iniciar' | 'en_proceso' | 'completado' {
  const total = Object.values(state).filter(Boolean).length;
  const requiredDone = state.examenMedico && state.estudioSeguridad;
  if (requiredDone) return 'completado';
  if (total > 0) return 'en_proceso';
  return 'sin_iniciar';
}
