import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Users, FileText, ChevronRight } from 'lucide-react';
import type { Candidate } from '../../data/mock';
import Avatar from './Avatar';
import { WaIcon } from './WhatsAppPreEntrevistaModal';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface WaMsg {
  from: 'alex' | 'candidate';
  text: string;
  time: string;
}

type ChatPhase =
  | 'opening'         // intro + congratulations
  | 'docs_list'       // listing required documents
  | 'awaiting_ack'    // waiting for candidate acknowledgement
  | 'confirming'      // confirmation messages
  | 'done';

const PHASES_PANEL = [
  { label: 'Felicitaciones' },
  { label: 'Lista de documentos' },
  { label: 'Confirmación del candidato' },
  { label: 'Cierre' },
];

function phaseIndex(phase: ChatPhase): number {
  if (phase === 'opening') return 0;
  if (phase === 'docs_list') return 1;
  if (phase === 'awaiting_ack' || phase === 'confirming') return 2;
  return 3;
}

// ─── Message builders ──────────────────────────────────────────────────────────

function fmt(base: Date, offsetSlots: number) {
  const d = new Date(base.getTime() + offsetSlots * 28_000);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function buildOpening(firstName: string, jobTitle: string): WaMsg[] {
  const base = new Date();
  return [
    { from: 'alex', time: fmt(base, 0), text: `¡Hola ${firstName}! 👋 Soy *Alex*, asistente de selección de *Demo Transportes*.` },
    { from: 'alex', time: fmt(base, 1), text: `🎉 ¡Felicitaciones! Has completado exitosamente todas las etapas del proceso de selección para el cargo de *${jobTitle}*. Queremos darte la bienvenida al equipo.` },
    { from: 'alex', time: fmt(base, 2), text: `📋 Para continuar con tu proceso de *vinculación*, necesitamos que nos envíes algunos documentos de ingreso. ¿Puedes ayudarnos con eso? 🙏` },
  ];
}

function buildDocsList(firstName: string): WaMsg[] {
  const base = new Date();
  return [
    {
      from: 'alex', time: fmt(base, 3),
      text: `Estos son los documentos que necesitamos, ${firstName}:\n\n` +
        `1️⃣ *Examen médico ocupacional* – Resultado de aptitud para conducción de vehículos pesados (vigente, expedido por IPS autorizada)\n\n` +
        `2️⃣ *Cédula de ciudadanía* – Copia de ambas caras\n\n` +
        `3️⃣ *Licencia de conducción* – Copia legible y vigente\n\n` +
        `4️⃣ *Cuenta bancaria* – Certificación bancaria no mayor a 30 días\n\n` +
        `5️⃣ *RUT* – Registro Único Tributario actualizado\n\n` +
        `Puedes enviarnos los documentos directamente aquí por WhatsApp 📲`,
    },
    {
      from: 'alex', time: fmt(base, 4),
      text: `⏰ Tienes *5 días hábiles* para enviarlos. ¿Tienes alguna pregunta sobre alguno de estos documentos?`,
    },
  ];
}

function buildConfirmation(firstName: string): WaMsg[] {
  const base = new Date();
  return [
    { from: 'alex', time: fmt(base, 6), text: `¡Perfecto, ${firstName}! ✅ Hemos recibido tu confirmación.` },
    { from: 'alex', time: fmt(base, 7), text: `📬 Cuando tengas los documentos listos, envíalos aquí uno por uno. El equipo de RR.HH. los revisará y te confirmará en un máximo de 2 días hábiles.` },
    { from: 'alex', time: fmt(base, 8), text: `¡Bienvenido/a al equipo de Demo Transportes! 🚛 Si necesitas cualquier ayuda, estamos aquí. ¡Mucho éxito! 😊` },
  ];
}

const ACK_OPTIONS = [
  '¡Claro! Tengo casi todos listos 📎',
  'Entendido, los reúno esta semana ✅',
  '¿Puedo preguntar sobre el examen médico?',
];

const TYPING_DELAYS_OPENING = [1500, 2000, 1800];
const TYPING_DELAYS_DOCS = [2200, 1600];
const TYPING_DELAYS_CONFIRM = [1600, 2000, 1800];
const PAUSE = 220;

// ─── TypingDots ────────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: 'white', borderRadius: '16px 16px 16px 4px',
      padding: '10px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
    }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#B0B0B0',
          display: 'inline-block',
          animation: 'waDot3 1.2s ease-in-out infinite',
          animationDelay: `${delay}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Props & component ─────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  jobTitle?: string;
  onConfirmSend?: (candidates: Candidate[]) => void;
}

type View = 'confirm' | 'chat';

export default function WhatsAppDocumentosModal({ isOpen, onClose, candidates, jobTitle = 'la vacante', onConfirmSend }: Props) {
  const [view, setView] = useState<View>('confirm');
  const [activeIdx, setActiveIdx] = useState(0);
  const [visibleMsgs, setVisibleMsgs] = useState<WaMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatPhase, setChatPhase] = useState<ChatPhase>('opening');
  const [selectedAck, setSelectedAck] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const candidate = candidates[activeIdx];
  const firstName = candidate?.name?.split(' ')[0] ?? 'Candidato';

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [visibleMsgs, isTyping, chatPhase]);

  // Auto-play opening when entering chat
  useEffect(() => {
    if (view !== 'chat' || !candidate) return;
    setVisibleMsgs([]);
    setIsTyping(false);
    setChatPhase('opening');
    setSelectedAck(null);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const openingMsgs = buildOpening(firstName, jobTitle);
    let delay = 400;
    openingMsgs.forEach((msg, i) => {
      const dur = TYPING_DELAYS_OPENING[i] ?? 1800;
      const t1 = setTimeout(() => setIsTyping(true), delay);
      delay += dur;
      const t2 = setTimeout(() => {
        setIsTyping(false);
        setVisibleMsgs(prev => [...prev, msg]);
        if (i === openingMsgs.length - 1) {
          // Auto-play docs list
          const docsMsgs = buildDocsList(firstName);
          let d2 = 500;
          docsMsgs.forEach((dm, di) => {
            const dur2 = TYPING_DELAYS_DOCS[di] ?? 1800;
            const ta = setTimeout(() => setIsTyping(true), delay + d2);
            d2 += dur2;
            const tb = setTimeout(() => {
              setIsTyping(false);
              setVisibleMsgs(prev => [...prev, dm]);
              if (di === docsMsgs.length - 1) setChatPhase('awaiting_ack');
            }, delay + d2);
            d2 += PAUSE;
            timeoutsRef.current.push(ta, tb);
          });
        }
      }, delay);
      delay += PAUSE;
      timeoutsRef.current.push(t1, t2);
    });

    return () => timeoutsRef.current.forEach(clearTimeout);
  }, [view, activeIdx]);

  const handleAck = (ack: string) => {
    if (chatPhase !== 'awaiting_ack') return;
    setSelectedAck(ack);
    const candMsg: WaMsg = { from: 'candidate', time: new Date().toTimeString().slice(0, 5), text: ack };
    setVisibleMsgs(prev => [...prev, candMsg]);
    setChatPhase('confirming');

    const confirmMsgs = buildConfirmation(firstName);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    let delay = 400;
    confirmMsgs.forEach((msg, i) => {
      const dur = TYPING_DELAYS_CONFIRM[i] ?? 1800;
      const t1 = setTimeout(() => setIsTyping(true), delay);
      delay += dur;
      const t2 = setTimeout(() => {
        setIsTyping(false);
        setVisibleMsgs(prev => [...prev, msg]);
        if (i === confirmMsgs.length - 1) setChatPhase('done');
      }, delay);
      delay += PAUSE;
      timeoutsRef.current.push(t1, t2);
    });
  };

  const skipToEnd = () => {
    timeoutsRef.current.forEach(clearTimeout);
    setIsTyping(false);
    const ack = selectedAck ?? ACK_OPTIONS[1];
    const candAck: WaMsg = { from: 'candidate', time: new Date().toTimeString().slice(0, 5), text: ack };
    setSelectedAck(ack);
    setVisibleMsgs([
      ...buildOpening(firstName, jobTitle),
      ...buildDocsList(firstName),
      candAck,
      ...buildConfirmation(firstName),
    ]);
    setChatPhase('done');
  };

  const handleCandidateTab = (idx: number) => {
    timeoutsRef.current.forEach(clearTimeout);
    setVisibleMsgs([]);
    setIsTyping(false);
    setChatPhase('opening');
    setSelectedAck(null);
    setActiveIdx(idx);
  };

  useEffect(() => {
    if (!isOpen) {
      setView('confirm');
      setActiveIdx(0);
      setVisibleMsgs([]);
      setIsTyping(false);
      setChatPhase('opening');
      setSelectedAck(null);
      timeoutsRef.current.forEach(clearTimeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const panelPhaseIdx = phaseIndex(chatPhase);
  const isDone = chatPhase === 'done';

  return (
    <>
      <style>{`
        @keyframes waDot3 { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
        @keyframes waSlideIn3 { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes waBtnPulse3 { 0%{transform:scale(1)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
      `}</style>

      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(15,8,36,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: '100%', maxWidth: view === 'confirm' ? '480px' : '860px',
          background: '#fff', borderRadius: '20px',
          boxShadow: '0 24px 80px rgba(15,8,36,0.22)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          maxHeight: '90vh', transition: 'max-width 0.3s ease',
        }}>

          {/* ── Confirm view ──────────────────────────────────────────── */}
          {view === 'confirm' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px 18px', borderBottom: '1px solid #F0F0F0' }}>
                <WaIcon size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '17px', color: '#111' }}>Solicitar documentos de ingreso</div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '1px' }}>Alex IA · Demo Transportes</div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '24px', overflowY: 'auto' }}>
                <div style={{
                  background: '#F0FFF4', border: '1.5px solid #BBF7D0',
                  borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#15803D' }}>Alex IA · Solicitud de documentos de vinculación</div>
                    <p style={{ fontSize: '13px', color: '#166534', margin: '4px 0 0', lineHeight: 1.55 }}>
                      Alex felicita al candidato y le solicita automáticamente por WhatsApp los documentos obligatorios para el proceso de contratación: examen médico, documentos de identidad, licencia, cuenta bancaria y RUT.
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#444' }}>
                  <Users size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  {candidates.length} candidato{candidates.length !== 1 ? 's' : ''} seleccionado{candidates.length !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {candidates.map((c) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: '#FAFAFA', border: '1px solid #EFEFEF' }}>
                      <Avatar src={c.photo} initials={c.avatarInitials} color={c.avatarColor} size={36} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{c.role}</div>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: c.score >= 80 ? '#16A34A' : c.score >= 60 ? '#D97706' : '#DC2626' }}>
                        {c.score}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={() => setView('chat')} style={{
                  width: '100%', padding: '14px', borderRadius: '12px',
                  background: '#25D366', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  fontWeight: 700, fontSize: '15px', color: '#fff',
                }}>
                  <WaIcon size={22} color="white" />
                  Ver simulación de conversación
                  <ChevronRight size={18} />
                </button>

                {onConfirmSend && (
                  <button onClick={() => { onConfirmSend(candidates); onClose(); }} style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: '#fff', border: '2px solid #128C7E', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    fontWeight: 700, fontSize: '15px', color: '#128C7E', marginTop: '10px',
                  }}>
                    <CheckCircle2 size={20} color="#128C7E" />
                    Enviar solicitud de documentos
                  </button>
                )}

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '10px' }}>
                  Simulación demo · No se envían mensajes reales
                </p>
              </div>
            </>
          )}

          {/* ── Chat view ─────────────────────────────────────────────── */}
          {view === 'chat' && (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', maxHeight: '90vh' }}>

              {/* Left: Chat */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* WA Header */}
                <div style={{ background: '#128C7E', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.3)' }}>
                    <FileText size={16} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>Alex IA · Demo Transportes</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                      {isDone ? '✓ Solicitud enviada'
                        : isTyping ? 'escribiendo...'
                        : chatPhase === 'awaiting_ack' ? `esperando respuesta de ${firstName}...`
                        : 'en línea'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!isDone && (
                      <button onClick={skipToEnd} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>
                        Completar →
                      </button>
                    )}
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: '4px' }}>
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Candidate tabs */}
                {candidates.length > 1 && (
                  <div style={{ display: 'flex', overflowX: 'auto', background: '#F0F0F0', borderBottom: '1px solid #E0E0E0' }}>
                    {candidates.map((c, i) => (
                      <button key={c.id} onClick={() => handleCandidateTab(i)} style={{
                        padding: '8px 14px', border: 'none', cursor: 'pointer',
                        background: i === activeIdx ? '#fff' : 'transparent',
                        borderBottom: i === activeIdx ? '2px solid #25D366' : '2px solid transparent',
                        fontSize: '12px', fontWeight: i === activeIdx ? 700 : 400,
                        color: i === activeIdx ? '#128C7E' : '#666', whiteSpace: 'nowrap',
                      }}>
                        {c.name.split(' ')[0]} {c.name.split(' ')[1]?.[0]}.
                      </button>
                    ))}
                  </div>
                )}

                {/* Messages */}
                <div style={{
                  flex: 1, overflowY: 'auto', padding: '16px 12px',
                  background: '#ECE5DD',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d9d0c8' fill-opacity='0.35'%3E%3Ccircle cx='5' cy='5' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
                  display: 'flex', flexDirection: 'column', gap: '4px',
                  minHeight: '360px', maxHeight: '460px',
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.75)', padding: '3px 10px', borderRadius: '12px', color: '#666' }}>Hoy</span>
                  </div>

                  {visibleMsgs.map((msg, i) => {
                    const isAlex = msg.from === 'alex';
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: isAlex ? 'flex-start' : 'flex-end', animation: 'waSlideIn3 0.2s ease', marginBottom: '2px' }}>
                        <div style={{
                          maxWidth: '78%',
                          background: isAlex ? '#fff' : '#DCF8C6',
                          borderRadius: isAlex ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                          padding: '8px 12px 6px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        }}>
                          {isAlex && i === 0 && <div style={{ fontSize: '11px', fontWeight: 700, color: '#128C7E', marginBottom: '3px' }}>Alex IA</div>}
                          <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.55, color: '#111', whiteSpace: 'pre-wrap' }}>
                            {msg.text.replace(/\*/g, '')}
                          </p>
                          <div style={{ fontSize: '11px', color: '#999', textAlign: 'right', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            {msg.time}
                            {!isAlex && (
                              <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                                <path d="M11 1L5 7L2 4" stroke="#53BDEB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M15 1L9 7" stroke="#53BDEB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isTyping && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'waSlideIn3 0.15s ease' }}>
                      <TypingDots />
                    </div>
                  )}

                  {/* ACK options */}
                  {chatPhase === 'awaiting_ack' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', animation: 'waSlideIn3 0.3s ease' }}>
                      {ACK_OPTIONS.map((opt) => (
                        <div key={opt} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleAck(opt)} style={{
                            padding: '9px 16px', borderRadius: '20px',
                            background: '#DCF8C6', border: '1.5px solid #25D366',
                            cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: '#128C7E',
                            animation: 'waBtnPulse3 2s ease-in-out infinite',
                          }}>
                            {opt}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {isDone && (
                    <div style={{ textAlign: 'center', margin: '12px 0 4px', animation: 'waSlideIn3 0.3s ease' }}>
                      <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.85)', padding: '3px 10px', borderRadius: '12px', color: '#666' }}>
                        Solicitud de documentos enviada ✅
                      </span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Right: Progress panel */}
              <div style={{ width: '220px', flexShrink: 0, borderLeft: '1px solid #E8E8E8', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #EFEFEF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Avatar src={candidate?.photo} initials={candidate?.avatarInitials} color={candidate?.avatarColor} size={48} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#111', lineHeight: 1.3 }}>{candidate?.name}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{candidate?.location?.replace(', Colombia', '')}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '22px', color: (candidate?.score ?? 0) >= 80 ? '#16A34A' : '#D97706' }}>
                    {candidate?.score}<span style={{ fontSize: '12px', fontWeight: 400, color: '#999' }}>/100</span>
                  </div>
                </div>

                <div style={{ padding: '14px 16px', flex: 1, overflowY: 'auto' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '10px' }}>Progreso</div>
                  {PHASES_PANEL.map((phase, i) => {
                    const isPast = i < panelPhaseIdx;
                    const isCurrent = i === panelPhaseIdx && !isDone;
                    return (
                      <div key={phase.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isDone || isPast ? '#25D366' : isCurrent ? '#128C7E' : '#E0E0E0',
                          transition: 'background 0.3s',
                        }}>
                          {(isDone || isPast)
                            ? <CheckCircle2 size={12} color="white" />
                            : <span style={{ width: 7, height: 7, borderRadius: '50%', background: isCurrent ? 'white' : '#bbb' }} />
                          }
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: isCurrent ? 700 : 400, color: isDone || isPast ? '#128C7E' : isCurrent ? '#111' : '#aaa' }}>
                          {phase.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {isDone && (
                  <div style={{ margin: '0 12px 12px', padding: '12px', borderRadius: '10px', background: '#F0FFF4', border: '1.5px solid #BBF7D0', animation: 'waSlideIn3 0.3s ease' }}>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#16A34A', marginBottom: '4px' }}>✓ Solicitud enviada</div>
                    <div style={{ fontSize: '11px', color: '#166534', lineHeight: 1.5 }}>
                      El candidato confirmó recepción · Documentos pendientes de recibir
                    </div>
                  </div>
                )}

                <div style={{ padding: '12px 16px', borderTop: '1px solid #EFEFEF' }}>
                  <button onClick={onClose} style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    background: isDone ? '#25D366' : '#F0F0F0', border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '13px', color: isDone ? '#fff' : '#444',
                  }}>
                    {isDone ? 'Cerrar ✓' : 'Cancelar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
