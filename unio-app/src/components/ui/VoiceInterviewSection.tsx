import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Play, Pause, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react';
import Button from './Button';

// ─── Types ────────────────────────────────────────────────────────────────────

type VoiceState = 'pending' | 'recording' | 'processing' | 'done';
type ResultadoVoz = 'apto' | 'apto_reservas' | 'no_apto';

interface RecorderState {
  recording: boolean;
  elapsed: number;
  audioUrl: string | null;
  audioDuration: number;
  error: string | null;
  waveformData: number[];
}

interface VoiceInterviewSectionProps {
  onDoneChange?: (isDone: boolean) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

type InterviewerRole = 'psicologo' | 'jefe';

const GUIDE_QUESTIONS: Record<InterviewerRole, { label: string; q: string }[]> = {
  psicologo: [
    { label: 'Situación familiar', q: '¿Cómo describió su situación familiar actual? ¿Tiene personas a cargo?' },
    { label: 'Conflictos laborales', q: '¿Ha tenido conflictos en trabajos anteriores? ¿Cómo los resolvió?' },
    { label: 'Manejo del estrés', q: '¿Cómo maneja la presión y situaciones de estrés en la operación?' },
    { label: 'Integridad', q: '¿Se ha visto involucrado/a en situaciones de robo o pérdida de mercancía?' },
    { label: 'Estabilidad económica', q: '¿Qué tan estable describió su entorno económico actualmente?' },
    { label: 'Consumo de sustancias', q: '¿Consume o ha consumido sustancias psicoactivas? ¿Con qué frecuencia?' },
    { label: 'Relación con autoridad', q: '¿Cómo describió su relación con figuras de autoridad o supervisores?' },
  ],
  jefe: [
    { label: 'Experiencia técnica', q: '¿Qué tan detallado fue al describir su experiencia con el tipo de vehículo o ruta requerida para el cargo?' },
    { label: 'Gestión operativa', q: '¿Cómo explicó su manejo de carga, tiempos de entrega y documentación de viaje?' },
    { label: 'Contingencias en ruta', q: '¿Cómo respondió ante situaciones de emergencia en ruta: desvíos, accidentes o demoras?' },
    { label: 'Herramientas digitales', q: '¿Demostró habilidad para trabajar con GPS, apps de gestión y comunicación con despacho?' },
    { label: 'Disponibilidad', q: '¿Mostró disposición para trabajar en turnos extendidos, fines de semana o rutas nocturnas?' },
    { label: 'Seguridad vial', q: '¿Describió una actitud positiva hacia las normas de seguridad y protocolos de la empresa?' },
    { label: 'Trabajo en equipo', q: '¿Demostró capacidad para relacionarse con clientes, proveedores y compañeros de trabajo?' },
  ],
};

const IDLE_WAVEFORM = [8,14,22,18,28,12,24,10,20,26,8,16,22,28,14,6,18,24,10,20,28,16,8,22,14,26,10,18,24,12,20,8];

const VEREDICTO_DEFAULT =
  'El candidato muestra estabilidad emocional general y disposición positiva. Sin embargo, reporta episodios de conflicto con figuras de autoridad en dos empleos anteriores. Entorno familiar estable. No reporta consumo activo de sustancias. Se recomienda avanzar con seguimiento en las primeras semanas de operación.';

const POSITIVO = ['Estabilidad familiar reportada', 'Sin consumo activo de sustancias', 'Actitud colaborativa durante la entrevista'];
const A_MONITOREAR = ['Conflictos previos con autoridad (2 empleos)', 'Estrés económico moderado', 'Reacción defensiva ante pregunta de mercancía'];

const RESULTADO_OPTIONS: { value: ResultadoVoz; label: string; color: string; bg: string; border: string }[] = [
  { value: 'apto',          label: 'Apto',                color: 'var(--color-positive-600, #1F9854)', bg: 'var(--color-positive-50, #E6FAEE)',  border: '#BBF7D0' },
  { value: 'apto_reservas', label: 'Avanzar con reservas', color: 'var(--color-warning-700, #A37800)',  bg: 'var(--color-warning-50, #FFF8E5)',   border: '#FFE59E' },
  { value: 'no_apto',       label: 'No apto',             color: 'var(--color-negative-600, #A82424)', bg: 'var(--color-negative-50, #FBEAEA)',  border: '#FECACA' },
];

const MAX_RECORD_SECS = 300;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Custom hook: real audio recorder ────────────────────────────────────────

function useVoiceRecorder(onReady: (url: string, duration: number, bars: number[]) => void) {
  const [state, setState] = useState<RecorderState>({
    recording: false, elapsed: 0, audioUrl: null, audioDuration: 0, error: null,
    waveformData: IDLE_WAVEFORM,
  });

  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const chunksRef         = useRef<Blob[]>([]);
  const streamRef         = useRef<MediaStream | null>(null);
  const audioCtxRef       = useRef<AudioContext | null>(null);
  const analyserRef       = useRef<AnalyserNode | null>(null);
  const animFrameRef      = useRef<number>(0);
  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const capturedBarsRef   = useRef<number[]>(IDLE_WAVEFORM);
  const elapsedRef        = useRef(0);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopTracks();
    setState(s => ({ ...s, recording: false }));
  }, [stopTracks]);

  const startRecording = useCallback(async () => {
    setState(s => ({ ...s, error: null }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Web Audio for live waveform
      const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      // Determine supported MIME
      const mime = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/ogg','audio/mp4']
        .find(t => MediaRecorder.isTypeSupported(t)) ?? '';

      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' });
        const url  = URL.createObjectURL(blob);
        onReady(url, elapsedRef.current, capturedBarsRef.current);
      };

      recorder.start(100);
      elapsedRef.current = 0;

      // Timer
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setState(s => ({ ...s, elapsed: elapsedRef.current }));
        if (elapsedRef.current >= MAX_RECORD_SECS) stopRecording();
      }, 1000);

      // Animate waveform bars from analyser
      const animateBars = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const bars = Array.from(data).map(v => Math.max(4, Math.round((v / 255) * 40)));
        capturedBarsRef.current = bars;
        setState(s => ({ ...s, recording: true, elapsed: elapsedRef.current, waveformData: bars }));
        animFrameRef.current = requestAnimationFrame(animateBars);
      };
      animFrameRef.current = requestAnimationFrame(animateBars);

    } catch (err) {
      const msg = (err instanceof DOMException && err.name === 'NotAllowedError')
        ? 'Permiso de micrófono denegado. Habilítalo en la configuración del navegador.'
        : 'No se pudo acceder al micrófono. Verifica los permisos.';
      setState(s => ({ ...s, error: msg }));
    }
  }, [onReady, stopRecording]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    stopTracks();
  }, [stopTracks]);

  return { state, startRecording, stopRecording };
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

const ROLE_TABS: { id: InterviewerRole; label: string; sub: string }[] = [
  { id: 'psicologo', label: 'Psicólogo/a',    sub: 'Perfil psicosocial' },
  { id: 'jefe',      label: 'Jefe directo/a', sub: 'Perfil del cargo'   },
];

function GuideCard({
  role, onRoleChange, compact = false,
}: { role: InterviewerRole; onRoleChange: (r: InterviewerRole) => void; compact?: boolean }) {
  const questions = GUIDE_QUESTIONS[role];
  return (
    <div style={{
      background: 'var(--color-neutral-50)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      {/* Tab nav */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border-default)',
        background: '#fff',
      }}>
        {ROLE_TABS.map(tab => {
          const active = role === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onRoleChange(tab.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '1px', padding: '10px 12px',
                border: 'none', borderBottom: `2px solid ${active ? 'var(--color-brand-accent)' : 'transparent'}`,
                background: 'transparent', cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: active ? 700 : 500,
                fontSize: '13px',
                color: active ? 'var(--color-brand-accent)' : 'var(--color-text-muted)',
                transition: 'color 0.15s',
              }}>
                {tab.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: '11px',
                color: active ? 'var(--color-brand-accent)' : 'var(--color-text-muted)',
                opacity: active ? 0.75 : 0.6,
              }}>
                {tab.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div style={{ padding: compact ? '12px 16px' : '16px 20px' }}>
        <p style={{ margin: '0 0 10px', fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Preguntas guía para grabar la nota de voz
        </p>
        <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: compact ? '6px' : '8px' }}>
          {questions.map((item, i) => (
            <li key={i} style={{ fontFamily: 'var(--font-display)', fontSize: compact ? '12px' : '13px', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>{item.label}:</span>{' '}{item.q}
            </li>
          ))}
        </ol>
      </div>
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

// ─── WaveformBars ─────────────────────────────────────────────────────────────

function WaveformBars({ bars, animated = false }: { bars: number[]; animated?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5px', flex: 1, height: 40 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 3,
          height: `${Math.min(40, Math.max(4, h))}px`,
          background: 'var(--color-brand-accent)',
          borderRadius: 999,
          flexShrink: 0,
          opacity: animated ? 0.9 : 0.55,
          transition: animated ? 'height 0.08s ease' : undefined,
        }} />
      ))}
    </div>
  );
}

// ─── Audio player (WhatsApp-style, real playback) ─────────────────────────────

function AudioPlayer({
  audioUrl, duration, bars, onReset,
}: { audioUrl: string; duration: number; bars: number[]; onReset: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasRealAudio = !!audioUrl;

  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => { setPlaying(false); setCurrentTime(0); };
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    return () => { audio.pause(); audio.src = ''; };
  }, [audioUrl]);

  const handlePlay = () => {
    if (!hasRealAudio) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const pct = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <div style={{
      background: 'var(--color-secondary-50)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
    }}>
      {/* File info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>
          entrevista_psicologica.webm
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {playing ? formatTime(Math.floor(currentTime)) : formatTime(duration)}
          </span>
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

      {/* Waveform with progress overlay */}
      <div style={{ position: 'relative', marginBottom: '12px', height: 40 }}>
        <WaveformBars bars={bars} />
        {/* progress clip */}
        {pct > 0 && (
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: `${pct * 100}%`, height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5px', height: 40 }}>
              {bars.map((h, i) => (
                <div key={i} style={{
                  width: 3,
                  height: `${Math.min(40, Math.max(4, h))}px`,
                  background: 'var(--color-brand-accent)',
                  borderRadius: 999, flexShrink: 0, opacity: 1,
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={handlePlay}
          disabled={!hasRealAudio}
          title={!hasRealAudio ? 'Graba una nota de voz primero' : undefined}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: 999,
            background: playing ? 'var(--color-brand-accent)' : '#fff',
            border: `1.5px solid ${playing ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
            cursor: hasRealAudio ? 'pointer' : 'default',
            opacity: hasRealAudio ? 1 : 0.45,
            fontFamily: 'var(--font-display)',
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

function ResultadoSelector({ value, onChange }: { value: ResultadoVoz; onChange: (v: ResultadoVoz) => void }) {
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

function DoneView({
  audioUrl, duration, bars, onReset,
}: { audioUrl: string; duration: number; bars: number[]; onReset: () => void }) {
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
      <AudioPlayer audioUrl={audioUrl} duration={duration} bars={bars} onReset={onReset} />

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
                  outline: 'none', background: '#fff', boxSizing: 'border-box',
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

// ─── Recording view ───────────────────────────────────────────────────────────

function RecordingView({
  elapsed, waveformData, onStop,
}: { elapsed: number; waveformData: number[]; onStop: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Live waveform */}
      <div style={{
        background: 'var(--color-secondary-50)',
        border: '1.5px solid var(--color-brand-accent)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%', background: '#DC2626', flexShrink: 0,
          animation: 'pulse-dot 1.2s ease-in-out infinite',
        }} />
        <style>{`@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }`}</style>
        <WaveformBars bars={waveformData} animated />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: '#DC2626', flexShrink: 0 }}>
          {formatTime(elapsed)}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onStop}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 28px', borderRadius: '12px',
            background: '#DC2626', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: '#fff',
            boxShadow: '0 0 0 4px rgba(220,38,38,0.2)',
            animation: 'pulse-rec 1.4s ease-in-out infinite',
          }}
        >
          <style>{`@keyframes pulse-rec { 0%,100%{box-shadow:0 0 0 4px rgba(220,38,38,0.2)} 50%{box-shadow:0 0 0 8px rgba(220,38,38,0.08)} }`}</style>
          <MicOff size={16} /> Detener grabación
        </button>
      </div>
      <p style={{ textAlign: 'center', margin: 0, fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
        Máximo {formatTime(MAX_RECORD_SECS)} · grabando...
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function VoiceInterviewSection({ onDoneChange }: VoiceInterviewSectionProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('done');
  const [audioData, setAudioData] = useState<{ url: string; duration: number; bars: number[] } | null>(null);
  const [interviewerRole, setInterviewerRole] = useState<InterviewerRole>('psicologo');

  const handleReady = useCallback((url: string, duration: number, bars: number[]) => {
    // Revoke previous URL if any
    if (audioData?.url) URL.revokeObjectURL(audioData.url);
    setAudioData({ url, duration, bars });
    setVoiceState('processing');
  }, [audioData]);

  const { state: recState, startRecording, stopRecording } = useVoiceRecorder(handleReady);

  useEffect(() => {
    if (voiceState !== 'processing') return;
    const t = setTimeout(() => setVoiceState('done'), 3000);
    return () => clearTimeout(t);
  }, [voiceState]);

  useEffect(() => {
    onDoneChange?.(voiceState === 'done');
  }, [voiceState, onDoneChange]);

  const handleReset = useCallback(() => {
    setVoiceState('pending');
  }, []);

  const handleStartRecording = async () => {
    setVoiceState('recording');
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    // onstop fires asynchronously → voiceState will be set to 'processing' in handleReady
  };

  return (
    <div style={{ marginTop: '24px', paddingTop: '4px' }}>
      <SectionHeader />

      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Pending: guide + start button */}
        {voiceState === 'pending' && (
          <>
            <GuideCard role={interviewerRole} onRoleChange={setInterviewerRole} />
            {recState.error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                padding: '12px 14px',
                background: 'var(--color-negative-50, #FBEAEA)',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)', fontSize: '13px',
                color: 'var(--color-negative-600, #A82424)',
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                {recState.error}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleStartRecording}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 28px', borderRadius: '12px',
                  background: 'var(--color-brand-accent)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '14px', color: '#fff',
                  boxShadow: '0 2px 8px rgba(135,80,246,0.3)',
                  transition: 'transform 0.1s',
                }}
              >
                <Mic size={16} /> ● Grabar nota de voz
              </button>
            </div>
          </>
        )}

        {/* Recording: compact guide for reference + live waveform + stop */}
        {voiceState === 'recording' && (
          <>
            <GuideCard role={interviewerRole} onRoleChange={setInterviewerRole} compact />
            <RecordingView
              elapsed={recState.elapsed}
              waveformData={recState.waveformData}
              onStop={handleStopRecording}
            />
          </>
        )}

        {/* Processing */}
        {voiceState === 'processing' && <Spinner />}

        {/* Done: guide (for reference) + real audio player + AI summary */}
        {voiceState === 'done' && (
          <>
            <GuideCard role={interviewerRole} onRoleChange={setInterviewerRole} compact />
            <DoneView
              audioUrl={audioData?.url ?? ''}
              duration={audioData?.duration ?? 0}
              bars={audioData?.bars ?? IDLE_WAVEFORM}
              onReset={handleReset}
            />
          </>
        )}
      </div>
    </div>
  );
}
