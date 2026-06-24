import { useState, useEffect, useRef } from 'react';
import { WaIcon } from '../components/ui/WhatsAppPreEntrevistaModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type Sender = 'bot' | 'user';

interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  time: string;
  type?: 'text' | 'card' | 'image';
  card?: CardData;
}

interface CardData {
  title: string;
  subtitle?: string;
  body: string[];
  icon?: string;
}

interface QuickReply {
  id: string;
  label: string;
  value: string;
}

type StepId =
  | 'welcome'
  | 'qm_licencia' | 'qm_experiencia' | 'qm_ubicacion'
  | 'qm_fail'
  | 'cv_check'
  | 'cv_has_processing' | 'cv_has_done'
  | 'cvb_intro' | 'cvb_nombre' | 'cvb_ciudad'
  | 'cvb_exp_anos' | 'cvb_exp1_empresa' | 'cvb_exp1_rol' | 'cvb_exp1_tiempo'
  | 'cvb_mas_exp' | 'cvb_exp2_empresa' | 'cvb_exp2_rol' | 'cvb_exp2_tiempo'
  | 'cvb_summary'
  | 'ps_nombre_confirm' | 'ps_interes' | 'ps_empresa'
  | 'ps_vacante' | 'ps_no_neg_1' | 'ps_no_neg_2' | 'ps_no_neg_3'
  | 'ps_prueba_manejo' | 'ps_complete';

interface StepDef {
  botMessages: string[];
  card?: CardData;
  replies?: QuickReply[];
  inputPlaceholder?: string;    // if present → free text input
  next: (answer: string, answers: Answers) => StepId;
  skipIf?: (answers: Answers) => boolean;
}

interface Answers {
  nombre?: string;
  ciudad?: string;
  expAnos?: string;
  exp1?: string;
  exp2?: string;
  hasCV?: boolean;
  qm1?: boolean;
  qm2?: boolean;
  qm3?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

function uid() { return Math.random().toString(36).slice(2); }

const VACANCY = {
  title: 'Conductor C2 Distribución Urbana',
  company: 'Demo Transportes',
  salary: '$2.500.000 – $2.700.000',
  location: 'Cota – Vía Cota-Siberia',
  schedule: 'Lunes a sábado · Turnos rotativos',
  contrato: 'Término indefinido',
};

// ─── Flow Script ──────────────────────────────────────────────────────────────

function buildScript(answers: Answers): Record<StepId, StepDef> {
  const nombre = answers.nombre ?? 'candidato/a';

  return {
    welcome: {
      botMessages: [
        `¡Hola! 👋 Soy *Alex*, asistente de selección de *${VACANCY.company}*.`,
        `Recibimos tu aplicación para *${VACANCY.title}*. Vamos a verificar si cumples los requisitos y completar tu perfil.`,
        '¿Empezamos? Solo tomará unos minutos ⏱️',
      ],
      replies: [
        { id: 'yes', label: '¡Sí, empecemos! 🚀', value: 'si' },
        { id: 'no',  label: 'Ahora no',            value: 'no' },
      ],
      next: (a) => a === 'si' ? 'qm_licencia' : 'qm_fail',
    },

    qm_licencia: {
      botMessages: [
        '¡Perfecto! 🙌 Primero necesito verificar algunos *requisitos obligatorios* del cargo.',
        '¿Cuentas con *Licencia de conducción C2 vigente* con mínimo 2 años desde su expedición? 🪪',
      ],
      replies: [
        { id: 'si',  label: '✅ Sí, la tengo vigente',    value: 'si' },
        { id: 'no',  label: '❌ No tengo licencia C2',    value: 'no' },
        { id: 'tr',  label: '⏳ Está en trámite',         value: 'tramite' },
      ],
      next: (a) => (a === 'si') ? 'qm_experiencia' : 'qm_fail',
    },

    qm_experiencia: {
      botMessages: [
        '¡Excelente! ✅ ¿Tienes mínimo *2 años de experiencia certificada* en conducción de carga?',
      ],
      replies: [
        { id: 'si', label: '✅ Sí, tengo 2+ años', value: 'si' },
        { id: 'no', label: '❌ Tengo menos de 2 años', value: 'no' },
      ],
      next: (a) => (a === 'si') ? 'qm_ubicacion' : 'qm_fail',
    },

    qm_ubicacion: {
      botMessages: [
        '¿Vives en *Cota, municipios aledaños o Bogotá* y cuentas con transporte para llegar a la sede en vía Cota-Siberia? 📍',
      ],
      replies: [
        { id: 'si', label: '✅ Sí, estoy en la zona', value: 'si' },
        { id: 'no', label: '❌ Vivo en otro lugar', value: 'no' },
      ],
      next: (a) => (a === 'si') ? 'cv_check' : 'qm_fail',
    },

    qm_fail: {
      botMessages: [
        'Gracias por tu interés 🙏',
        'Lamentablemente en este momento el perfil no cumple con los requisitos mínimos para esta vacante.',
        'Te invitamos a estar atento/a a futuras oportunidades con *Demo Transportes*. ¡Mucho éxito! 💪',
      ],
      next: () => 'qm_fail',
    },

    cv_check: {
      botMessages: [
        '¡Perfecto, cumples los requisitos básicos! 🎉',
        '¿Tienes tu *hoja de vida* disponible para compartirla? Puedes enviarla como PDF o documento 📄',
      ],
      replies: [
        { id: 'si', label: '📄 Sí, tengo mi HV', value: 'si' },
        { id: 'no', label: '📝 No tengo HV',     value: 'no' },
      ],
      next: (a) => (a === 'si') ? 'cv_has_processing' : 'cvb_intro',
    },

    cv_has_processing: {
      botMessages: [
        '¡Excelente! 📎 En un proceso real enviarías tu CV aquí.',
        '⏳ Estamos analizando tu hoja de vida con IA…',
      ],
      next: () => 'cv_has_done',
    },

    cv_has_done: {
      botMessages: [
        '✅ *Hoja de vida procesada.*',
        `Encontramos tu perfil, ${nombre}. Vamos a complementar algunos datos con unas preguntas rápidas para el prescreening.`,
      ],
      replies: [{ id: 'ok', label: '¡Listo! 👍', value: 'ok' }],
      next: () => 'ps_nombre_confirm',
    },

    cvb_intro: {
      botMessages: [
        '¡No te preocupes! Te voy a hacer unas preguntas para construir tu perfil.',
        'Solo tomará 3–4 minutos ⏱️ Empecemos.',
        '¿Cuál es tu *nombre completo*?',
      ],
      inputPlaceholder: 'Escribe tu nombre completo…',
      next: () => 'cvb_ciudad',
    },

    cvb_ciudad: {
      botMessages: [`¡Mucho gusto, ${nombre}! 😊 ¿En qué *ciudad* vives actualmente?`],
      inputPlaceholder: 'Ej: Bogotá, Cota, Funza…',
      next: () => 'cvb_exp_anos',
    },

    cvb_exp_anos: {
      botMessages: ['¿Cuántos años de experiencia tienes conduciendo *vehículos de carga*?'],
      replies: [
        { id: 'a1', label: 'Menos de 2 años', value: 'menos_2' },
        { id: 'a2', label: '2–5 años',        value: '2_5' },
        { id: 'a3', label: '6–10 años',       value: '6_10' },
        { id: 'a4', label: 'Más de 10 años',  value: 'mas_10' },
      ],
      next: () => 'cvb_exp1_empresa',
    },

    cvb_exp1_empresa: {
      botMessages: ['Cuéntame sobre tu *experiencia más reciente*. ¿En qué empresa trabajaste?'],
      inputPlaceholder: 'Nombre de la empresa…',
      next: () => 'cvb_exp1_rol',
    },

    cvb_exp1_rol: {
      botMessages: ['¿Cuál era tu cargo o rol en esa empresa?'],
      inputPlaceholder: 'Ej: Conductor C2, Conductor de reparto…',
      next: () => 'cvb_exp1_tiempo',
    },

    cvb_exp1_tiempo: {
      botMessages: ['¿Cuánto tiempo trabajaste ahí?'],
      replies: [
        { id: 't1', label: 'Menos de 1 año', value: 'menos_1' },
        { id: 't2', label: '1–2 años',       value: '1_2' },
        { id: 't3', label: '2–5 años',       value: '2_5' },
        { id: 't4', label: 'Más de 5 años',  value: 'mas_5' },
      ],
      next: () => 'cvb_mas_exp',
    },

    cvb_mas_exp: {
      botMessages: ['¿Tienes *otra experiencia relevante* que quieras agregar? (máx. 1 más)'],
      replies: [
        { id: 'si', label: 'Sí, agrego otra', value: 'si' },
        { id: 'no', label: 'No, con eso está', value: 'no' },
      ],
      next: (a) => a === 'si' ? 'cvb_exp2_empresa' : 'cvb_summary',
    },

    cvb_exp2_empresa: {
      botMessages: ['¿En qué empresa fue tu experiencia anterior?'],
      inputPlaceholder: 'Nombre de la empresa…',
      next: () => 'cvb_exp2_rol',
    },

    cvb_exp2_rol: {
      botMessages: ['¿Y cuál era tu cargo?'],
      inputPlaceholder: 'Ej: Conductor de carga, Mensajero…',
      next: () => 'cvb_exp2_tiempo',
    },

    cvb_exp2_tiempo: {
      botMessages: ['¿Cuánto tiempo?'],
      replies: [
        { id: 't1', label: 'Menos de 1 año', value: 'menos_1' },
        { id: 't2', label: '1–2 años',       value: '1_2' },
        { id: 't3', label: '2–5 años',       value: '2_5' },
        { id: 't4', label: 'Más de 5 años',  value: 'mas_5' },
      ],
      next: () => 'cvb_summary',
    },

    cvb_summary: {
      botMessages: [
        `✅ *¡Perfil construido!* Gracias ${nombre}, ya tenemos tu información.`,
        'Ahora vamos con el prescreening para esta vacante 🚀',
      ],
      replies: [{ id: 'ok', label: '¡Listo! Continuemos 👍', value: 'ok' }],
      next: () => 'ps_nombre_confirm',
    },

    ps_nombre_confirm: {
      botMessages: [
        `Perfecto. Ahora sí, el prescreening 📋`,
        `Confirma: tu nombre completo es *${nombre}*, ¿correcto?`,
      ],
      replies: [
        { id: 'si', label: `✅ Sí, así es`, value: 'si' },
        { id: 'no', label: '✏️ Quiero corregirlo', value: 'no' },
      ],
      next: () => 'ps_interes',
    },

    ps_interes: {
      botMessages: [
        `¿Estás *interesado/a y disponible* para ocupar el cargo de ${VACANCY.title}?`,
        '¿En cuánto tiempo podrías iniciar si quedas seleccionado/a?',
      ],
      replies: [
        { id: 'a1', label: '✅ Sí, disponible de inmediato',    value: 'inmediato' },
        { id: 'a2', label: '📅 En 2 semanas',                  value: '2_semanas' },
        { id: 'a3', label: '📅 En 1 mes',                      value: '1_mes' },
        { id: 'a4', label: '❌ No estoy disponible ahora',      value: 'no' },
      ],
      next: () => 'ps_empresa',
    },

    ps_empresa: {
      botMessages: [
        '¡Genial! Déjame contarte un poco sobre *Demo Transportes* 🏢',
      ],
      card: {
        title: '🏢 Demo Transportes',
        subtitle: 'Líder en logística y distribución en Colombia',
        body: [
          '📦 +15 años operando en el sector logístico',
          '🚚 Flota de +200 vehículos de carga',
          '👥 Equipo de +800 conductores en todo el país',
          '⭐ Empresa Great Place to Work 2024',
        ],
      },
      replies: [{ id: 'ok', label: '¡Interesante! Continuar 👉', value: 'ok' }],
      next: () => 'ps_vacante',
    },

    ps_vacante: {
      botMessages: ['Ahora te comparto los detalles de la vacante 📋'],
      card: {
        title: `🚛 ${VACANCY.title}`,
        body: [
          `💰 Salario: ${VACANCY.salary}`,
          `📍 Ubicación: ${VACANCY.location}`,
          `🕐 Horario: ${VACANCY.schedule}`,
          `📝 Contrato: ${VACANCY.contrato}`,
          `✅ Beneficios: Auxilio de transporte · Seguridad social completa · Prima legal`,
        ],
      },
      replies: [
        { id: 'ok',  label: '✅ Me interesa, seguir',  value: 'ok' },
        { id: 'no',  label: '❌ No me interesa',        value: 'no' },
      ],
      next: (a) => a === 'ok' ? 'ps_no_neg_1' : 'qm_fail',
    },

    ps_no_neg_1: {
      botMessages: [
        'Ahora vamos a validar los *no negociables* del cargo. Responde con sinceridad, es importante para ambos 🤝',
        '¿Tu licencia C2 fue expedida hace *mínimo 2 años*?',
      ],
      replies: [
        { id: 'si', label: '✅ Sí, más de 2 años',      value: 'si' },
        { id: 'no', label: '❌ Tiene menos de 2 años',  value: 'no' },
      ],
      next: () => 'ps_no_neg_2',
    },

    ps_no_neg_2: {
      botMessages: ['¿Tienes *mínimo 2 años de experiencia certificada* en conducción de carga o distribución?'],
      replies: [
        { id: 'si', label: '✅ Sí, tengo la experiencia',   value: 'si' },
        { id: 'no', label: '❌ No cumplo este requisito',   value: 'no' },
      ],
      next: () => 'ps_no_neg_3',
    },

    ps_no_neg_3: {
      botMessages: [
        '¿Resides en *Cota, Funza, Madrid, Mosquera o Bogotá* y puedes llegar con tu propio medio a la sede en vía Cota-Siberia?',
      ],
      replies: [
        { id: 'si', label: '✅ Sí, puedo llegar sin problema', value: 'si' },
        { id: 'no', label: '❌ Me quedaría complicado',        value: 'no' },
      ],
      next: () => 'ps_prueba_manejo',
    },

    ps_prueba_manejo: {
      botMessages: [
        '¡Muy bien! Última pregunta 🏁',
        '¿Estarías disponible para realizar una *prueba de manejo* durante los próximos 5 días hábiles?',
      ],
      replies: [
        { id: 'si',  label: '✅ Sí, disponible',        value: 'si' },
        { id: 'lim', label: '⚠️ Con restricciones de horario', value: 'limitado' },
        { id: 'no',  label: '❌ No en este momento',    value: 'no' },
      ],
      next: () => 'ps_complete',
    },

    ps_complete: {
      botMessages: [
        `🎉 *¡Listo, ${nombre}!*`,
        'Tu prescreening ha sido completado exitosamente. Nuestro equipo revisará tu perfil y se comunicará contigo en las próximas *24–48 horas hábiles*.',
        '📬 Recibirás un mensaje de confirmación por este medio.',
        'Gracias por tu tiempo y tu interés en *Demo Transportes*. ¡Mucho éxito! 💪',
      ],
      next: () => 'ps_complete',
    },
  };
}

// ─── WA Header ────────────────────────────────────────────────────────────────

function WaHeader() {
  return (
    <div style={{
      background: '#075E54',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: '12px',
      flexShrink: 0,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: '#25D366',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <WaIcon size={22} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>Alex · Demo Transportes</div>
        <div style={{ color: '#b2dfdb', fontSize: '12px' }}>en línea</div>
      </div>
    </div>
  );
}

// ─── Card Bubble ──────────────────────────────────────────────────────────────

function CardBubble({ card }: { card: CardData }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      maxWidth: '280px',
    }}>
      <div style={{ background: '#075E54', padding: '10px 14px' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{card.title}</div>
        {card.subtitle && <div style={{ color: '#b2dfdb', fontSize: '12px', marginTop: 2 }}>{card.subtitle}</div>}
      </div>
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {card.body.map((line, i) => (
          <div key={i} style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>{line}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function renderText(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith('*') && p.endsWith('*')
      ? <strong key={i}>{p.slice(1, -1)}</strong>
      : <span key={i}>{p}</span>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const isBot = msg.sender === 'bot';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      marginBottom: '4px',
      paddingLeft: isBot ? 0 : '40px',
      paddingRight: isBot ? '40px' : 0,
    }}>
      <div style={{
        maxWidth: '280px',
        background: isBot ? '#ffffff' : '#DCF8C6',
        borderRadius: isBot ? '0 12px 12px 12px' : '12px 0 12px 12px',
        padding: msg.card ? '0' : '8px 12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
        fontSize: '14px',
        color: '#111827',
        lineHeight: 1.5,
        overflow: 'hidden',
      }}>
        {msg.card ? <CardBubble card={msg.card} /> : renderText(msg.text)}
        {!msg.card && (
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>
            {msg.time}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
      <div style={{
        background: '#fff', borderRadius: '0 12px 12px 12px',
        padding: '10px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: '#9ca3af',
            animation: 'waTyping 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WaApplyFlow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<StepId>('welcome');
  const [answers, setAnswers] = useState<Answers>({});
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [done, setDone] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const script = buildScript(answers);
  const step = script[currentStep];

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Deliver bot messages for initial step on mount
  useEffect(() => {
    deliverBotMessages('welcome', answers);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function addMessage(msg: Omit<ChatMessage, 'id'>) {
    setMessages((prev) => [...prev, { ...msg, id: uid() }]);
  }

  async function deliverBotMessages(stepId: StepId, currentAnswers: Answers) {
    const s = buildScript(currentAnswers)[stepId];
    setTyping(true);
    for (const text of s.botMessages) {
      await delay(900 + text.length * 18);
      setTyping(false);
      addMessage({ sender: 'bot', text, time: now() });
      await delay(200);
      if (s.botMessages.indexOf(text) < s.botMessages.length - 1) setTyping(true);
    }
    if (s.card) {
      await delay(600);
      addMessage({ sender: 'bot', text: '', time: now(), type: 'card', card: s.card });
    }
    if (stepId === 'cv_has_processing') {
      await delay(1800);
      await deliverBotMessages('cv_has_done', currentAnswers);
      setCurrentStep('cv_has_done');
    }
    if (stepId === 'ps_complete') setDone(true);
  }

  function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

  async function handleReply(reply: QuickReply) {
    // Add user bubble
    addMessage({ sender: 'user', text: reply.label, time: now() });
    await delay(400);

    // Compute next step
    const nextStep = step.next(reply.value, answers);

    // Update answers for special keys
    const newAnswers = { ...answers };
    if (currentStep === 'cv_check') newAnswers.hasCV = reply.value === 'si';

    setAnswers(newAnswers);
    setCurrentStep(nextStep);

    if (nextStep !== currentStep) {
      await deliverBotMessages(nextStep, newAnswers);
    }
  }

  async function handleTextSubmit() {
    const val = inputValue.trim();
    if (!val) return;
    setInputValue('');

    addMessage({ sender: 'user', text: val, time: now() });
    await delay(400);

    const newAnswers = { ...answers };
    if (currentStep === 'cvb_intro')       newAnswers.nombre = val;
    if (currentStep === 'cvb_ciudad')      newAnswers.ciudad = val;
    if (currentStep === 'cvb_exp1_empresa') newAnswers.exp1 = val;
    if (currentStep === 'cvb_exp2_empresa') newAnswers.exp2 = val;

    const nextStep = step.next(val, newAnswers);
    setAnswers(newAnswers);
    setCurrentStep(nextStep);

    if (nextStep !== currentStep) {
      await deliverBotMessages(nextStep, newAnswers);
    }
  }

  const currentReplies = !done ? step.replies : undefined;
  const currentInput   = !done && !step.replies ? step.inputPlaceholder : undefined;
  const isFinalStep = currentStep === 'qm_fail' || currentStep === 'ps_complete';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ece5dd 0%, #d9fdd3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, "Segoe UI", sans-serif',
    }}>
      <style>{`
        @keyframes waTyping {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
        .wa-input:focus { outline: none; border-color: #25D366 !important; }
        .wa-reply-btn:hover { background: #f0fdf4 !important; border-color: #25D366 !important; }
      `}</style>

      {/* Phone frame */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        height: '90vh',
        maxHeight: '780px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
      }}>
        <WaHeader />

        {/* Chat area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          background: '#efeae2',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8b8a2' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          {messages.map((msg) => (
            <Bubble key={msg.id} msg={msg} />
          ))}
          {typing && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        {!isFinalStep && (
          <div style={{
            background: '#f0f0f0',
            padding: '10px 12px',
            borderTop: '1px solid #ddd',
            flexShrink: 0,
          }}>
            {/* Quick replies */}
            {currentReplies && currentReplies.length > 0 && !typing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '0' }}>
                {currentReplies.map((r) => (
                  <button
                    key={r.id}
                    className="wa-reply-btn"
                    onClick={() => handleReply(r)}
                    style={{
                      padding: '10px 16px',
                      border: '1.5px solid #25D366',
                      borderRadius: '24px',
                      background: '#fff',
                      color: '#075E54',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}

            {/* Text input */}
            {currentInput && !typing && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  className="wa-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                  placeholder={currentInput}
                  style={{
                    flex: 1,
                    height: '44px',
                    padding: '0 16px',
                    borderRadius: '24px',
                    border: '1px solid #ddd',
                    background: '#fff',
                    fontSize: '14px',
                    color: '#111827',
                  }}
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!inputValue.trim()}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: inputValue.trim() ? '#25D366' : '#ccc',
                    border: 'none', cursor: inputValue.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s ease', flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}

            {typing && (
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', padding: '8px 0' }}>
                Alex está escribiendo…
              </div>
            )}
          </div>
        )}

        {/* Final state footer */}
        {isFinalStep && !typing && (
          <div style={{
            background: '#f0f0f0',
            padding: '16px',
            borderTop: '1px solid #ddd',
            textAlign: 'center',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {currentStep === 'ps_complete'
                ? '✅ Prescreening completado'
                : '🔒 Proceso finalizado'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
