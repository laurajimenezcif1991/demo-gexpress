import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Pause, CheckCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

// ─── Types ────────────────────────────────────────────────────────────────────

type VoiceState = 'pending' | 'processing' | 'done';
type ResultadoVoz = 'apto' | 'apto_reservas' | 'no_apto';

interface VoiceInterviewSectionProps {
  onDoneChange?: (isDone: boolean) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GUIDE_QUESTIONS = [
  '¿Cómo describió su situación familiar actual? ¿El/la candidato/a tiene personas a cargo?',
  '¿Ha tenido conflictos laborales en trabajos anteriores? ¿Cómo los resolvió?',
  '¿Cómo maneja la presión y situaciones de estrés en la operación?',
  '¿Se ha visto involucrado/a alguna vez en una situación de robo o pérdida de mercancía?',
  '¿Qué tan estable describió su entorno económico actualmente?',
  '¿Consume o ha consumido sustancias psicoactivas? ¿Con qué frecuencia?',
  '¿Cómo describió su relación con figuras de autoridad o supervisores?',
];

const WAVEFORM_HEIGHTS = [8,14,22,18,28,12,24,10,20,26,8,16,22,28,14,6,18,24,10,20,28,16,8,22,14,26,10,18,24,12,20,8];

const VEREDICTO_DEFAULT =
  'El candidato muestra estabilidad emocional general y disposición positiva. Sin embargo, reporta episodios de conflicto con figuras de autoridad en dos empleos anteriores. Entorno familiar estable. No reporta consumo activo de sustancias. Se recomienda avanzar con seguimiento en las primeras semanas de operación.';

const POSITIVO = ['Estabilidad familiar reportada', 'Sin consumo activo de sustancias', 'Actitud colaborativa durante la entrevista'];
const A_MONITOREAR = ['Conflictos previos con autoridad (2 empleos)', 'Estrés económico moderado', 'Reacción defensiva ante pregunta de mercancía'];

const RESULTADO_OPTIONS: { value: ResultadoVoz; label: string; color: string; bg: string; border: string }[] = [
  { value: 'apto',          label: 'Apto',               color: 'var(--color-positive-600, #1F9854)', bg: 'var(--color-positive-50, #E6FAEE)',  border: '#BBF7D0' },
  { value: 'apto_reservas', label: 'Avanzar con reservas', color: 'var(--color-warning-700, #A37800)', bg: 'var(--color-warning-50, #FFF8E5)',   border: '#FFE59E' },
  { value: 'no_apto',       label: 'No apto',            color: 'var(--color-negative-600, #A82424)', bg: 'var(--color-negative-50, #FBEAEA)', border: '#FECACA' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--color-secondary-50)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Mic size={15} color="var(--color-brand-accent)" />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
          Entrevista psicológica – Nota de voz
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
          Máximo 5 minutos · Foco en perfil psicosocial
        </p>
      </div>
    </div>
  );
}

function GuideCard() {
  return (
    <div style={{
      background: 'var(--color-neutral-50)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 20px',
    }}>
      <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
        Guía de entrevista
      </p>
      <p style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
        Referencia para el psicólogo al grabar el resumen post-entrevista
      </p>
      <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {GUIDE_QUESTIONS.map((q, i) => (
          <li key={i} style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.55 }}>
            {q}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '32px 0' }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--color-border-default)',
        borderTop: '3px solid var(--color-brand-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
        Procesando nota de voz con IA...
      </p>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
        Esto puede tomar unos segundos
      </p>
    </div>
  );
}

// ─── Audio player (WhatsApp-style) ────────────────────────────────────────────

function AudioPlayer({ onReset }: { onReset: () => void }) {
  const [playing, setPlaying] = useState(false);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlay = () => {
    if (playing) {
      setPlaying(false);
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    } else {
      setPlaying(true);
      playTimerRef.current = setTimeout(() => setPlaying(false), 3800);
    }
  };

  useEffect(() => () => { if (playTimerRef.current) clearTimeout(playTimerRef.current); }, []);

  return (
    <div style={{
      background: 'var(--color-secondary-50)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
    }}>
      {/* File info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>
          entrevista_psicologica.ogg
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)' }}>3:47</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px',
            color: 'var(--color-positive-600, #1F9854)',
            background: 'var(--color-positive-50, #E6FAEE)',
            border: '1px solid #BBF7D0',
            padding: '1px 8px', borderRadius: 999,
          }}>
            Procesado por IA ✓
          </span>
        </div>
      </div>

      {/* Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '12px' }}>
        {WAVEFORM_HEIGHTS.map((h, i) => (
          <div key={i} style={{
            width: 4, height: h,
            background: playing && i < Math.floor(WAVEFORM_HEIGHTS.length * 0.4)
              ? 'var(--color-brand-accent)'
              : 'var(--color-brand-accent)',
            borderRadius: 999, flexShrink: 0,
            opacity: playing && i < Math.floor(WAVEFORM_HEIGHTS.length * 0.4) ? 1 : 0.5,
            transition: 'opacity 0.1s',
          }} />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handlePlay}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: 999,
            background: playing ? 'var(--color-brand-accent)' : '#fff',
            border: `1.5px solid ${playing ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
            cursor: 'pointer', fontFamily: 'var(--font-display)',
            fontWeight: 600, fontSize: '13px',
            color: playing ? '#fff' : 'var(--color-text-primary)',
            transition: 'all 0.15s',
          }}
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
          {playing ? 'Reproduciendo...' : 'Reproducir'}
        </button>

        <button
          onClick={onReset}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: 999,
            background: '#fff',
            border: '1.5px solid var(--color-border-default)',
            cursor: 'pointer', fontFamily: 'var(--font-display)',
            fontWeight: 600, fontSize: '13px',
            color: 'var(--color-text-muted)',
            transition: 'all 0.15s',
          }}
        >
          <RotateCcw size={12} />
          Grabar de nuevo
        </button>
      </div>
    </div>
  );
}

// ─── Horizontal resultado selector ───────────────────────────────────────────

function ResultadoSelector({
  value,
  onChange,
}: {
  value: ResultadoVoz;
  onChange: (v: ResultadoVoz) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
      {RESULTADO_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              padding: '6px 14px', borderRadius: 999,
              border: `1.5px solid ${isSelected ? opt.color : 'var(--color-border-default)'}`,
              background: isSelected ? opt.bg : '#fff',
              cursor: 'pointer', fontFamily: 'var(--font-display)',
              fontSize: '13px', fontWeight: isSelected ? 700 : 400,
              color: isSelected ? opt.color : 'var(--color-text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${isSelected ? opt.color : 'var(--color-border-default)'}`,
              background: isSelected ? opt.color : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isSelected && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff' }} />}
            </div>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Done view ────────────────────────────────────────────────────────────────

function DoneView({ onReset }: { onReset: () => void }) {
  const [resultado, setResultado] = useState<ResultadoVoz>('apto_reservas');
  const [editMode, setEditMode] = useState(false);
  const [veredicto, setVeredicto] = useState(VEREDICTO_DEFAULT);
  const [draft, setDraft] = useState(veredicto);
  const [toastVisible, setToastVisible] = useState(false);

  const handleSave = () => {
    setVeredicto(draft);
    setEditMode(false);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const opt = RESULTADO_OPTIONS.find(o => o.value === resultado)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Audio player with WhatsApp-style controls */}
      <AudioPlayer onReset={onReset} />

      {/* Resultado selector */}
      <div>
        <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
          Resultado
        </p>
        <ResultadoSelector value={resultado} onChange={setResultado} />
      </div>

      {/* Result card */}
      <div style={{ border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {/* Veredicto */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
              Veredicto
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px',
              color: opt.color, background: opt.bg,
              border: `1px solid ${opt.border}`,
              padding: '2px 12px', borderRadius: 999,
            }}>
              {opt.label}
            </span>
          </div>
          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={5}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-display)', fontSize: '13px',
                  color: 'var(--color-text-primary)', resize: 'vertical' as const,
                  outline: 'none', background: '#fff',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="primary" size="sm" onClick={handleSave}>Guardar cambios</Button>
                <Button variant="secondary" size="sm" onClick={() => { setDraft(veredicto); setEditMode(false); }}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.65 }}>
              {veredicto}
            </p>
          )}
        </div>

        {/* Señales */}
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--color-positive-600, #1F9854)' }}>
              Positivo
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {POSITIVO.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <CheckCircle size={13} color="var(--color-positive-600, #1F9854)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--color-warning-700, #A37800)' }}>
              A monitorear
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {A_MONITOREAR.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-warning-700, #A37800)', flexShrink: 0, marginTop: 1 }}>⚠</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit resumen */}
      {!editMode && (
        <div>
          <Button variant="secondary" size="sm" onClick={() => { setDraft(veredicto); setEditMode(true); }}>
            Editar resumen
          </Button>
        </div>
      )}

      {toastVisible && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 14px',
          background: 'var(--color-positive-50, #E6FAEE)',
          color: 'var(--color-positive-600, #1F9854)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: 600,
        }}>
          <CheckCircle size={14} /> Resumen actualizado
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VoiceInterviewSection({ onDoneChange }: VoiceInterviewSectionProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('done');
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    onDoneChange?.(voiceState === 'done');
  }, [voiceState]);

  useEffect(() => {
    if (voiceState !== 'processing') return;
    const t = setTimeout(() => setVoiceState('done'), 3000);
    return () => clearTimeout(t);
  }, [voiceState]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleRecordToggle = () => {
    if (!recording) {
      setRecording(true);
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= 299) {
            clearInterval(intervalRef.current!);
            setRecording(false);
            setVoiceState('processing');
            return 300;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRecording(false);
      setVoiceState('processing');
    }
  };

  const handleReset = () => {
    setVoiceState('pending');
    setRecording(false);
    setElapsed(0);
  };

  return (
    <div style={{ marginTop: '24px', paddingTop: '4px' }}>
      <SectionHeader />

      <div style={{ marginTop: '16px' }}>
        {voiceState === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <GuideCard />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleRecordToggle}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 28px', borderRadius: '12px',
                  background: recording ? '#DC2626' : 'var(--color-brand-accent)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '14px', color: '#fff',
                  boxShadow: recording ? '0 0 0 4px rgba(220,38,38,0.2)' : '0 2px 8px rgba(135,80,246,0.3)',
                  animation: recording ? 'pulse-rec 1.4s ease-in-out infinite' : 'none',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              >
                <style>{`@keyframes pulse-rec { 0%,100%{box-shadow:0 0 0 4px rgba(220,38,38,0.2)} 50%{box-shadow:0 0 0 8px rgba(220,38,38,0.08)} }`}</style>
                {recording ? <MicOff size={16} /> : <Mic size={16} />}
                {recording ? `Grabando... ${formatTime(elapsed)}` : '● Grabar nota de voz'}
              </button>
            </div>
            {recording && (
              <p style={{ textAlign: 'center', margin: 0, fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Haz click en el botón para detener la grabación
              </p>
            )}
          </div>
        )}

        {voiceState === 'processing' && <Spinner />}

        {voiceState === 'done' && <DoneView onReset={handleReset} />}
      </div>
    </div>
  );
}
