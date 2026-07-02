import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Users, Calendar, ChevronRight } from 'lucide-react';
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
  | 'opening'          // auto-playing apertura messages
  | 'awaiting_franja'  // showing AM/PM buttons
  | 'slots_playing'    // auto-playing "aquí los horarios" message
  | 'awaiting_slot'    // showing time-slot buttons
  | 'confirming'       // auto-playing confirmation messages
  | 'done';

const AM_SLOTS = [
  'Sáb 21 Jun · 8:00 AM — Patio de maniobras Grupo Express, Kennedy',
  'Sáb 21 Jun · 9:30 AM — Patio de maniobras Grupo Express, Kennedy',
  'Dom 22 Jun · 8:00 AM — Patio de maniobras Grupo Express, Kennedy',
  'Sáb 28 Jun · 8:00 AM — Patio de maniobras Grupo Express, Kennedy',
];
const PM_SLOTS = [
  'Sáb 21 Jun · 2:00 PM — Sede Siberia, Bodega 8',
  'Dom 22 Jun · 2:00 PM — Sede Siberia, Bodega 8',
  'Sáb 28 Jun · 2:30 PM — Sede Siberia, Bodega 8',
  'Dom 29 Jun · 2:00 PM — Sede Siberia, Bodega 8',
];

const PHASES_PANEL = [
  { label: 'Bienvenida' },
  { label: 'Selección de franja' },
  { label: 'Confirmación de horario' },
  { label: 'Cierre' },
];

function phaseIndex(phase: ChatPhase): number {
  if (phase === 'opening') return 0;
  if (phase === 'awaiting_franja' || phase === 'slots_playing') return 1;
  if (phase === 'awaiting_slot' || phase === 'confirming') return 2;
  return 3;
}

function buildOpening(firstName: string, jobTitle: string): WaMsg[] {
  const base = new Date();
  const fmt = (offset: number) => {
    const d = new Date(base.getTime() + offset * 30_000);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };
  return [
    { from: 'alex', time: fmt(0), text: `¡Hola ${firstName}! 👋 Soy *Alex*, asistente de selección de *Grupo Express*.` },
    { from: 'alex', time: fmt(1), text: `🎉 ¡Felicitaciones! Has superado la pre-entrevista para el cargo de *${jobTitle}*. El equipo quedó muy conforme con tu perfil y tus antecedentes verificados en RUNT.` },
    { from: 'alex', time: fmt(2), text: 'El siguiente paso es tu *Prueba de Manejo presencial* en nuestro patio de maniobras. La prueba tiene una duración de 45 minutos aproximadamente. ¿Tienes disponibilidad para esta semana? 🚛' },
    { from: 'alex', time: fmt(3), text: '¿Prefieres una franja en la *mañana (AM)* o en la *tarde (PM)*? 🗓️' },
  ];
}
function buildSlotsIntro(franja: 'am' | 'pm'): WaMsg {
  const base = new Date();
  const t = new Date(base.getTime() + 4 * 30_000);
  const time = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
  return {
    from: 'alex', time,
    text: franja === 'am'
      ? '¡Perfecto! Estos son los horarios disponibles en la mañana esta semana 🌅'
      : '¡Perfecto! Estos son los horarios disponibles en la tarde esta semana 🌇',
  };
}
function buildConfirmation(firstName: string, slot: string): WaMsg[] {
  const base = new Date();
  const fmt = (offset: number) => {
    const d = new Date(base.getTime() + (5 + offset) * 30_000);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };
  return [
    { from: 'alex', time: fmt(0), text: `✅ ¡Confirmado! Tu prueba de manejo queda agendada para el *${slot}*.` },
    { from: 'alex', time: fmt(1), text: `📋 Por favor trae tu *cédula de ciudadanía* y tu *licencia de conducción* el día de la prueba. Llega 10 minutos antes del horario acordado.` },
    { from: 'alex', time: fmt(2), text: `¡Mucho éxito, ${firstName}! 😊 Si necesitas reagendar o tienes alguna duda, escríbenos aquí.` },
  ];
}

const TYPING_DELAYS_OPENING = [1600, 2200, 2400, 2000];
const TYPING_DELAY_SLOTS_INTRO = 1800;
const TYPING_DELAYS_CONFIRM = [1800, 2000, 1600];
const PAUSE = 250;

function TypingDots() {
  return (
    <>
      <style>{`@keyframes waDot2{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}`}</style>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        background: 'white', borderRadius: '16px 16px 16px 4px',
        padding: '10px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: '#B0B0B0',
            display: 'inline-block',
            animation: 'waDot2 1.2s ease-in-out infinite',
            animationDelay: `${delay}s`,
          }} />
        ))}
      </div>
    </>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  jobTitle?: string;
  onConfirmSend?: (candidates: Candidate[]) => void;
}

type View = 'confirm' | 'chat';

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function WhatsAppAgendarEntrevistaModal({
  isOpen, onClose, candidates, jobTitle = 'la vacante', onConfirmSend,
}: Props) {
  const [view, setView] = useState<View>('confirm');
  const [activeIdx, setActiveIdx] = useState(0);
  const [visibleMsgs, setVisibleMsgs] = useState<WaMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatPhase, setChatPhase] = useState<ChatPhase>('opening');
  const [selectedFranja, setSelectedFranja] = useState<'am' | 'pm' | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const candidate = candidates[activeIdx];
  const firstName = candidate?.name?.split(' ')[0] ?? 'Candidato';
  const slots = selectedFranja === 'am' ? AM_SLOTS : PM_SLOTS;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMsgs, isTyping, chatPhase]);

  // Auto-play opening messages when entering chat view
  useEffect(() => {
    if (view !== 'chat' || !candidate) return;
    setVisibleMsgs([]);
    setIsTyping(false);
    setChatPhase('opening');
    setSelectedFranja(null);
    setSelectedSlot(null);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const openingMsgs = buildOpening(firstName, jobTitle);
    let delay = 400;
    openingMsgs.forEach((msg, i) => {
      const typingDuration = TYPING_DELAYS_OPENING[i] ?? 1800;
      const t1 = setTimeout(() => setIsTyping(true), delay);
      delay += typingDuration;
      const t2 = setTimeout(() => {
        setIsTyping(false);
        setVisibleMsgs(prev => [...prev, msg]);
        if (i === openingMsgs.length - 1) setChatPhase('awaiting_franja');
      }, delay);
      delay += PAUSE;
      timeoutsRef.current.push(t1, t2);
    });

    return () => timeoutsRef.current.forEach(clearTimeout);
  }, [view, activeIdx]);

  // When franja is selected
  const handleFranjaSelect = (franja: 'am' | 'pm') => {
    if (chatPhase !== 'awaiting_franja') return;
    setSelectedFranja(franja);
    const candMsg: WaMsg = {
      from: 'candidate',
      time: new Date().toTimeString().slice(0, 5),
      text: franja === 'am' ? '¡Prefiero la mañana! ☀️' : '¡Prefiero la tarde! 🌇',
    };
    setVisibleMsgs(prev => [...prev, candMsg]);
    setChatPhase('slots_playing');

    const slotsMsg = buildSlotsIntro(franja);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    const t1 = setTimeout(() => setIsTyping(true), 300);
    const t2 = setTimeout(() => {
      setIsTyping(false);
      setVisibleMsgs(prev => [...prev, slotsMsg]);
      setChatPhase('awaiting_slot');
    }, 300 + TYPING_DELAY_SLOTS_INTRO);
    timeoutsRef.current.push(t1, t2);
  };

  // When slot is selected
  const handleSlotSelect = (slot: string) => {
    if (chatPhase !== 'awaiting_slot') return;
    setSelectedSlot(slot);
    const candMsg: WaMsg = {
      from: 'candidate',
      time: new Date().toTimeString().slice(0, 5),
      text: `${slot} ✅`,
    };
    setVisibleMsgs(prev => [...prev, candMsg]);
    setChatPhase('confirming');

    const confirmMsgs = buildConfirmation(firstName, slot);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    let delay = 400;
    confirmMsgs.forEach((msg, i) => {
      const typingDuration = TYPING_DELAYS_CONFIRM[i] ?? 1800;
      const t1 = setTimeout(() => setIsTyping(true), delay);
      delay += typingDuration;
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
    const franja = selectedFranja ?? 'pm';
    const slot = selectedSlot ?? PM_SLOTS[1];
    const opening = buildOpening(firstName, jobTitle);
    const slotsIntro = buildSlotsIntro(franja);
    const candFranja: WaMsg = { from: 'candidate', time: new Date().toTimeString().slice(0, 5), text: franja === 'am' ? '¡Prefiero la mañana! ☀️' : '¡Prefiero la tarde! 🌇' };
    const candSlot: WaMsg = { from: 'candidate', time: new Date().toTimeString().slice(0, 5), text: `${slot} ✅` };
    const confirms = buildConfirmation(firstName, slot);
    setSelectedFranja(franja);
    setSelectedSlot(slot);
    setVisibleMsgs([...opening, candFranja, slotsIntro, candSlot, ...confirms]);
    setChatPhase('done');
  };

  const handleCandidateTab = (idx: number) => {
    timeoutsRef.current.forEach(clearTimeout);
    setVisibleMsgs([]);
    setIsTyping(false);
    setChatPhase('opening');
    setSelectedFranja(null);
    setSelectedSlot(null);
    setActiveIdx(idx);
  };

  useEffect(() => {
    if (!isOpen) {
      setView('confirm');
      setActiveIdx(0);
      setVisibleMsgs([]);
      setIsTyping(false);
      setChatPhase('opening');
      setSelectedFranja(null);
      setSelectedSlot(null);
      timeoutsRef.current.forEach(clearTimeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const panelPhaseIdx = phaseIndex(chatPhase);
  const isDone = chatPhase === 'done';

  return (
    <>
      <style>{`
        @keyframes waDot2{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
        @keyframes waSlideIn2{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes waBtnPulse{0%{transform:scale(1)}50%{transform:scale(1.03)}100%{transform:scale(1)}}
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15,8,36,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: view === 'confirm' ? '480px' : '820px',
            background: '#fff', borderRadius: '20px',
            boxShadow: '0 24px 80px rgba(15,8,36,0.22)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            maxHeight: '90vh',
            transition: 'max-width 0.3s ease',
          }}
        >

          {/* ── View: Confirmation ─────────────────────────────────────── */}
          {view === 'confirm' && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '20px 24px 18px',
                borderBottom: '1px solid #F0F0F0',
              }}>
                <WaIcon size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '17px', color: '#111' }}>
                    Agendar prueba de manejo por WhatsApp
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '1px' }}>
                    Grupo Express Talent
                  </div>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '24px', overflowY: 'auto' }}>
                {/* Info card */}
                <div style={{
                  background: '#F0FFF4', border: '1.5px solid #BBF7D0',
                  borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Calendar size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#15803D' }}>
                      Grupo Express Talent
                    </div>
                    <p style={{ fontSize: '13px', color: '#166534', margin: '4px 0 0', lineHeight: 1.55 }}>
                      Alex envía automáticamente un mensaje de felicitaciones e invita al conductor a elegir
                      una franja horaria (AM/PM) y un horario concreto para la prueba presencial.
                    </p>
                  </div>
                </div>

                {/* Selected candidates */}
                <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#444' }}>
                  <Users size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  {candidates.length} candidato{candidates.length !== 1 ? 's' : ''} seleccionado{candidates.length !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {candidates.map((c) => (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', borderRadius: '10px',
                      background: '#FAFAFA', border: '1px solid #EFEFEF',
                    }}>
                      <Avatar src={c.photo} initials={c.avatarInitials} color={c.avatarColor} size={36} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{c.role}</div>
                      </div>
                      <span style={{
                        fontWeight: 800, fontSize: '14px',
                        color: c.score >= 80 ? '#16A34A' : c.score >= 60 ? '#D97706' : '#DC2626',
                      }}>
                        {c.score}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA: ver simulación */}
                  <button
                  onClick={() => setView('chat')}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: '#25D366', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    fontWeight: 700, fontSize: '15px', color: '#fff',
                  }}
                >
                  <WaIcon size={22} color="white" />
                  Ver simulación de agendamiento
                  <ChevronRight size={18} />
                </button>

                {/* CTA: confirmar y avanzar */}
                {onConfirmSend && (
                  <button
                    onClick={() => { onConfirmSend(candidates); onClose(); }}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '12px',
                      background: '#fff', border: '2px solid #128C7E', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      fontWeight: 700, fontSize: '15px', color: '#128C7E',
                      marginTop: '10px',
                    }}
                  >
                    <CheckCircle2 size={20} color="#128C7E" />
                    Confirmar y agendar prueba de manejo
                  </button>
                )}

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '10px' }}>
                  Simulación demo · No se envían mensajes reales
                </p>
              </div>
            </>
          )}

          {/* ── View: Chat ─────────────────────────────────────────────── */}
          {view === 'chat' && (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', maxHeight: '90vh' }}>

              {/* Left: Chat */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* WA Header */}
                <div style={{
                  background: '#128C7E', padding: '10px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.3)',
                  }}>
                    <Calendar size={16} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                      Grupo Express Talent
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                      {isDone
                        ? '✓ Prueba agendada'
                        : isTyping
                        ? 'escribiendo...'
                        : chatPhase === 'awaiting_franja' || chatPhase === 'awaiting_slot'
                        ? `esperando respuesta de ${firstName}...`
                        : 'en línea'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!isDone && (
                      <button
                        onClick={skipToEnd}
                        style={{
                          background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
                          color: '#fff', borderRadius: '8px', padding: '4px 10px', fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
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
                      <button
                        key={c.id}
                        onClick={() => handleCandidateTab(i)}
                        style={{
                          padding: '8px 14px', border: 'none', cursor: 'pointer',
                          background: i === activeIdx ? '#fff' : 'transparent',
                          borderBottom: i === activeIdx ? '2px solid #25D366' : '2px solid transparent',
                          fontSize: '12px', fontWeight: i === activeIdx ? 700 : 400,
                          color: i === activeIdx ? '#128C7E' : '#666',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.name.split(' ')[0]} {c.name.split(' ')[1]?.[0]}.
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat messages */}
                <div style={{
                  flex: 1, overflowY: 'auto', padding: '16px 12px',
                  background: '#ECE5DD',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d9d0c8' fill-opacity='0.35'%3E%3Ccircle cx='5' cy='5' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
                  display: 'flex', flexDirection: 'column', gap: '4px',
                  minHeight: '360px', maxHeight: '460px',
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.75)', padding: '3px 10px', borderRadius: '12px', color: '#666' }}>
                      Hoy
                    </span>
                  </div>

                  {visibleMsgs.map((msg, i) => {
                    const isAlex = msg.from === 'alex';
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: isAlex ? 'flex-start' : 'flex-end',
                          animation: 'waSlideIn2 0.2s ease',
                          marginBottom: '2px',
                        }}
                      >
                        <div style={{
                          maxWidth: '75%',
                          background: isAlex ? '#fff' : '#DCF8C6',
                          borderRadius: isAlex ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                          padding: '8px 12px 6px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        }}>
                          {isAlex && i === 0 && (
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#128C7E', marginBottom: '3px' }}>
                              Alex IA
                            </div>
                          )}
                          <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.5, color: '#111', whiteSpace: 'pre-wrap' }}>
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

                  {/* Typing indicator */}
                  {isTyping && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'waSlideIn2 0.15s ease' }}>
                      <TypingDots />
                    </div>
                  )}

                  {/* AM/PM interactive buttons */}
                  {chatPhase === 'awaiting_franja' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px', animation: 'waSlideIn2 0.3s ease' }}>
                      {(['am', 'pm'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => handleFranjaSelect(f)}
                          style={{
                            padding: '10px 18px', borderRadius: '20px',
                            background: '#DCF8C6', border: '1.5px solid #25D366',
                            cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: '#128C7E',
                            animation: 'waBtnPulse 2s ease-in-out infinite',
                          }}
                        >
                          {f === 'am' ? '☀️ Mañana (AM)' : '🌇 Tarde (PM)'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Time slot interactive buttons */}
                  {chatPhase === 'awaiting_slot' && selectedFranja && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', animation: 'waSlideIn2 0.3s ease' }}>
                      {slots.map((slot) => (
                        <div key={slot} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleSlotSelect(slot)}
                            style={{
                              padding: '9px 16px', borderRadius: '20px',
                              background: '#DCF8C6', border: '1.5px solid #25D366',
                              cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: '#128C7E',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            📅 {slot}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Done banner */}
                  {isDone && (
                    <div style={{ textAlign: 'center', margin: '12px 0 4px', animation: 'waSlideIn2 0.3s ease' }}>
                      <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.85)', padding: '3px 10px', borderRadius: '12px', color: '#666' }}>
                        Prueba de manejo agendada ✅
                      </span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </div>

              {/* Right: Progress panel */}
              <div style={{
                width: '220px', flexShrink: 0, borderLeft: '1px solid #E8E8E8',
                background: '#FAFAFA', display: 'flex', flexDirection: 'column',
              }}>
                {/* Candidate info */}
                <div style={{
                  padding: '16px', borderBottom: '1px solid #EFEFEF',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                }}>
                  <Avatar src={candidate?.photo} initials={candidate?.avatarInitials} color={candidate?.avatarColor} size={48} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#111', lineHeight: 1.3 }}>{candidate?.name}</div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{candidate?.location?.replace(', Colombia', '')}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '22px', color: (candidate?.score ?? 0) >= 80 ? '#16A34A' : '#D97706' }}>
                    {candidate?.score}<span style={{ fontSize: '12px', fontWeight: 400, color: '#999' }}>/100</span>
                  </div>
                </div>

                {/* Phases */}
                <div style={{ padding: '14px 16px', flex: 1, overflowY: 'auto' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    Progreso
                  </div>
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
                        <span style={{
                          fontSize: '12px',
                          fontWeight: isCurrent ? 700 : 400,
                          color: isDone || isPast ? '#128C7E' : isCurrent ? '#111' : '#aaa',
                        }}>
                          {phase.label}
                        </span>
                      </div>
                    );
                  })}

                  {/* Selected slot display */}
                  {selectedSlot && (
                    <div style={{
                      marginTop: '8px', padding: '10px 12px', borderRadius: '10px',
                      background: '#F0FFF4', border: '1.5px solid #BBF7D0',
                      animation: 'waSlideIn2 0.3s ease',
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803D', marginBottom: '4px' }}>
                        📅 Cita agendada
                      </div>
                      <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.4 }}>{selectedSlot}</div>
                    </div>
                  )}
                </div>

                {/* Result when done */}
                {isDone && (
                  <div style={{ margin: '0 12px 12px', padding: '12px', borderRadius: '10px', background: '#F0FFF4', border: '1.5px solid #BBF7D0', animation: 'waSlideIn2 0.3s ease' }}>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#16A34A', marginBottom: '4px' }}>
                      ✓ Prueba de manejo agendada
                    </div>
                    <div style={{ fontSize: '11px', color: '#166534', lineHeight: 1.5 }}>
                      El conductor confirmó horario · Debe traer cédula y licencia
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid #EFEFEF' }}>
                  <button
                    onClick={onClose}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      background: isDone ? '#25D366' : '#F0F0F0', border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: '13px', color: isDone ? '#fff' : '#444',
                    }}
                  >
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
