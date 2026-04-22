import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RadioCard from '../components/ui/RadioCard';

const COMPANY_LOGO = 'https://www.figma.com/api/mcp/asset/6f3ad322-1b47-491d-9c5e-ef9954b27a33';
const UNIO_LOGO    = '/logo-unio.png';
const BG_BANNER    = 'https://www.figma.com/api/mcp/asset/1ca3ece4-fa35-4a9e-956d-716e2ddf18a8';

interface Question {
  id: number;
  label: string;
  text: string;
  options: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    label: 'Pregunta 1 de 10',
    text: 'Llegas a un hospital en Barranquilla para una demostración con un cardiólogo que tiene poco tiempo y muestra escepticismo. ¿Qué haces primero?',
    options: [
      'Adapto la demo al tiempo disponible, priorizo lo clínicamente más relevante para generar confianza rápido',
      'Le pido reagendar para tener tiempo adecuado y hacer una presentación completa',
      'Involucro al representante comercial para que gestione la relación y expectativa',
      'Inicio con los puntos más técnicos para demostrar expertise y credibilidad',
    ],
  },
  {
    id: 2,
    label: 'Pregunta 2 de 10',
    text: 'Durante una capacitación, un médico te hace una pregunta técnica compleja que no sabes responder en el momento. ¿Cómo reaccionas?',
    options: [
      'Reconozco que no tengo la respuesta en este momento, me comprometo a investigar y respondo en 24 horas',
      'Intento dar una respuesta aproximada basándome en mi conocimiento general',
      'Escalo la pregunta al equipo técnico inmediatamente para dar una respuesta precisa',
      'Redirijo la conversación hacia temas donde tengo más certeza',
    ],
  },
  {
    id: 3,
    label: 'Pregunta 3 de 10',
    text: 'Tienes 3 implementaciones programadas en la misma semana en ciudades diferentes. Una de ellas se complica y requiere más tiempo del planeado. ¿Qué haces?',
    options: [
      'Resuelvo la implementación complicada aunque signifique reprogramar las otras dos',
      'Optimizo tiempos para cumplir con las tres, aunque cada una reciba menos atención de la ideal',
      'Delego la implementación complicada a un colega para cumplir con mi agenda',
      'Coordino con los clientes para ajustar expectativas y priorizar según impacto clínico',
    ],
  },
  {
    id: 4,
    label: 'Pregunta 4 de 10',
    text: 'Un cliente solicita una modificación en el protocolo de uso del equipo que técnicamente es posible pero no está en las guías oficiales. ¿Qué haces?',
    options: [
      'Consulto con el fabricante antes de dar cualquier orientación sobre modificaciones',
      'Explico por qué seguir las guías oficiales es la mejor práctica y ofrezco alternativas dentro del protocolo',
      'Si técnicamente es viable y el cliente asume la responsabilidad, le doy orientación práctica',
      'Documento la solicitud y la escalo al área técnica para decisión formal',
    ],
  },
  {
    id: 5,
    label: 'Pregunta 5 de 10',
    text: 'Estás en medio de una capacitación y recibes una llamada urgente de otro cliente con un problema técnico crítico. ¿Cómo respondes?',
    options: [
      'Pido una pausa breve en la capacitación, atiendo la llamada y resuelvo rápidamente',
      'Termino la capacitación y devuelvo la llamada inmediatamente después',
      'Respondo brevemente y redirijo al cliente con un colega disponible',
      'Ignoro la llamada durante la capacitación para mantener profesionalismo con el cliente presente',
    ],
  },
  {
    id: 6,
    label: 'Pregunta 6 de 10',
    text: 'Un cliente te pide que elabores una ficha técnica comparativa entre tu equipo y el de la competencia para una licitación. ¿Cómo lo abordas?',
    options: [
      'Hago la comparativa destacando nuestras ventajas de forma objetiva y con datos verificables',
      'Me enfoco solo en las especificaciones de nuestro equipo y evito mencionar a la competencia',
      'Coordino con el equipo comercial para que ellos manejen la comparativa',
      'Solicito al fabricante los documentos oficiales de comparativa técnica',
    ],
  },
  {
    id: 7,
    label: 'Pregunta 7 de 10',
    text: 'Después de una implementación, el cliente te reporta que el equipo no está dando los resultados esperados. Al revisar, descubres que no están siguiendo el protocolo que enseñaste. ¿Qué haces?',
    options: [
      'Programo una sesión de refuerzo inmediata para corregir el uso y asegurar que entiendan el protocolo',
      'Les explico las consecuencias de no seguir el protocolo y les envío material de referencia',
      'Documento la situación y escalo al representante comercial para gestión de cuenta',
      'Adapto el protocolo a cómo lo están usando si técnicamente es viable',
    ],
  },
  {
    id: 8,
    label: 'Pregunta 8 de 10',
    text: 'Tu jefe te asigna liderar una capacitación en un congreso médico con audiencia de más de 100 especialistas. ¿Cómo te preparas?',
    options: [
      'Armo una presentación enfocada en casos clínicos reales y resultados medibles',
      'Solicito apoyo de un colega con más experiencia en eventos grandes para co-presentar',
      'Preparo una demo técnica detallada con todas las funcionalidades del equipo',
      'Investigo al público objetivo y adapto contenido a sus necesidades específicas',
    ],
  },
  {
    id: 9,
    label: 'Pregunta 9 de 10',
    text: 'Recibes feedback negativo de un cliente sobre tu última capacitación. Dice que fue "muy técnica y poco práctica". ¿Cómo respondes?',
    options: [
      'Agradezco el feedback, programo una sesión de seguimiento más práctica y ajusto mi enfoque',
      'Explico que el contenido técnico es necesario para el uso correcto del equipo',
      'Escalo el feedback a mi jefe para definir estrategia de seguimiento',
      'Reviso mi metodología de capacitación y pido feedback a otros clientes para identificar patrones',
    ],
  },
  {
    id: 10,
    label: 'Pregunta 10 de 10',
    text: 'Estás en campo hace 2 semanas seguidas con agenda completa. Tu familia te pide que reserves el fin de semana. El lunes recibes una solicitud urgente de demostración para un cliente clave el sábado. ¿Qué haces?',
    options: [
      'Acepto la demostración porque es cliente clave y reprogramo con mi familia',
      'Ofrezco una alternativa para primera hora del lunes o delego a un colega',
      'Negocio con el cliente para el viernes tarde y mantengo el fin de semana libre',
      'Consulto con mi jefe sobre la prioridad antes de comprometerme',
    ],
  },
];

export default function PruebaTest() {
  const navigate = useNavigate();
  const { evalId } = useParams<{ evalId: string }>();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showStickyBar, setShowStickyBar] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const answeredCount = Object.keys(answers).length;
  const progressPct   = (answeredCount / QUESTIONS.length) * 100;
  const allAnswered   = answeredCount === QUESTIONS.length;

  useEffect(() => {
    const handleScroll = () => {
      if (!progressRef.current) return;
      const { bottom } = progressRef.current.getBoundingClientRect();
      setShowStickyBar(bottom < 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelect = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    localStorage.setItem(`prueba_${evalId}`, JSON.stringify({ answers, submittedAt: new Date().toISOString() }));
    navigate(`/prueba/${evalId}/exito`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        position: 'relative',
        fontFamily: 'var(--font-display)',
        paddingBottom: '120px',
      }}
    >
      {/* Floating progress bar — appears when original bar scrolls out of view */}
      {showStickyBar && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: '#ffffff',
            borderBottom: '1px solid var(--color-border-default, #e5e5e6)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            padding: '14px 40px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              width: '100%',
              maxWidth: '680px',
            }}
          >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '13px',
              color: '#252432',
              whiteSpace: 'nowrap',
            }}
          >
            Evaluación Conductual PRIMA
          </span>

          {/* Track */}
          <div
            style={{
              flex: 1,
              height: '6px',
              borderRadius: '8px',
              background: 'var(--color-secondary-100, #e8ddfd)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '8px',
                background: 'var(--color-secondary-base, #8750f6)',
                width: `${progressPct}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '13px',
              color: 'var(--color-secondary-base, #8750f6)',
              whiteSpace: 'nowrap',
            }}
          >
            {Math.round(progressPct)}% completado
          </span>
          </div>
        </div>
      )}
      {/* Decorative background */}
      <div
        style={{
          position: 'absolute',
          left: '15%',
          top: '40px',
          width: '70%',
          height: '320px',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.6,
        }}
      >
        <img src={BG_BANNER} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {/* Page content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '53px',
        }}
      >
        {/* Main card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '32px',
            boxShadow: '0px 0px 22.4px 0px rgba(0,0,0,0.06)',
            padding: '32px 42px',
            width: '100%',
            maxWidth: '946px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            {/* Company + Unio logos */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '558px' }}>
              <img src={COMPANY_LOGO} alt="Logo empresa" style={{ height: '84px', width: 'auto', objectFit: 'contain' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#151515', lineHeight: '19px' }}>Powered by</span>
                <img src={UNIO_LOGO} alt="Unio" style={{ height: '23px', width: 'auto' }} />
              </div>
            </div>

            {/* Title + progress */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '558px' }}>
              <h1
                style={{
                  fontSize: '36px',
                  fontWeight: 800,
                  lineHeight: '54px',
                  color: '#252432',
                  textAlign: 'center',
                  margin: 0,
                  width: '100%',
                }}
              >
                Evaluación Conductual PRIMA
              </h1>

              {/* Progress bar */}
              <div
                ref={progressRef}
                style={{
                  width: '364px',
                  height: '8px',
                  borderRadius: '12px',
                  background: 'var(--color-secondary-100, #e8ddfd)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: '12px',
                    background: 'var(--color-secondary-base, #8750f6)',
                    width: `${progressPct}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: '24px',
                  color: 'var(--color-secondary-base, #8750f6)',
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                {Math.round(progressPct)}% completado
              </p>
            </div>
          </div>

          {/* Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
            {QUESTIONS.map((q) => (
              <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '702px' }}>
                {/* Question label */}
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#afaeb0',
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  {q.label}
                </p>

                {/* Question text */}
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#252432',
                    margin: 0,
                  }}
                >
                  {q.text}
                </p>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {q.options.map((option) => (
                    <RadioCard
                      key={option}
                      text={option}
                      selected={answers[q.id] === option}
                      onSelect={() => handleSelect(q.id, option)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed WizardBar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '80px',
          background: '#ffffff',
          borderTop: '1px solid var(--color-border-default, #e5e5e6)',
          boxShadow: '-2px -4px 20.3px 0px rgba(0,0,0,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '120px',
          zIndex: 50,
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 28px',
            borderRadius: '12px',
            background: allAnswered
              ? 'var(--color-brand-primary, #27214d)'
              : 'var(--color-primary-50, #e5e2f3)',
            border: 'none',
            color: '#ffffff',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: '24px',
            cursor: allAnswered ? 'pointer' : 'default',
            opacity: allAnswered ? 1 : 0.65,
            pointerEvents: allAnswered ? 'auto' : 'none',
            transition: 'opacity 0.15s ease',
          }}
        >
          Enviar respuestas
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
