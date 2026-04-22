import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import StarRating from '../components/ui/StarRating';
import { type RecomendacionValue } from '../data/mock';

const COMPANY_LOGO     = 'https://www.figma.com/api/mcp/asset/603ddb5b-414c-4637-a749-efb353d70907';
const CANDIDATE_AVATAR = 'https://www.figma.com/api/mcp/asset/650dcdc5-89e4-4f51-8c2e-13ed5f74474d';
const BG_BANNER        = 'https://www.figma.com/api/mcp/asset/5d6ee0cd-a958-4f36-960f-2436d4ee10fb';
const SUCCESS_ICON     = 'https://www.figma.com/api/mcp/asset/115aa037-eac9-4693-a41d-12ad2d552762';

const recomendacionOptions: { value: RecomendacionValue; label: string }[] = [
  { value: 'definitivamente', label: 'Sí, definitivamente' },
  { value: 'con_reservas',    label: 'Sí, con reservas' },
  { value: 'no_seguro',       label: 'No estoy seguro' },
  { value: 'no_recomiendo',   label: 'No recomiendo' },
];

interface HMFormState {
  destacados: string;
  ratingA: number;
  ratingB: number;
  ratingC: number;
  senalAlerta: string;
  recomendacion: RecomendacionValue | null;
}

/* ─── Success screen ─────────────────────────────────────────────────────── */
function SuccessScreen() {
  const iconRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = iconRef.current;
    if (!el) return;
    el.style.transform = 'scale(0)';
    el.style.opacity   = '0';
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
      el.style.transform  = 'scale(1)';
      el.style.opacity    = '1';
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <PageShell>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '48px 24px', textAlign: 'center' }}>
        <img ref={iconRef} src={SUCCESS_ICON} alt="Éxito" style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '32px', lineHeight: '46px', color: '#252432', margin: 0 }}>
          ¡Calificación enviada con éxito!
        </h2>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', lineHeight: '28px', color: '#252432', margin: 0, maxWidth: '480px' }}>
          Gracias por tomarte el tiempo. El equipo de HR revisará tu evaluación y tomará la decisión de avance.
        </p>
      </div>
    </PageShell>
  );
}

/* ─── Page shell (bg + header card + footer) ─────────────────────────────── */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', position: 'relative', fontFamily: 'var(--font-display)', paddingBottom: '60px' }}>
      {/* Decorative background banner */}
      <div style={{ position: 'absolute', left: '15%', top: '40px', width: '70%', height: '320px', pointerEvents: 'none', zIndex: 0, opacity: 0.6 }}>
        <img src={BG_BANNER} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px', gap: '32px' }}>
        {/* ── Header card ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '32px',
          boxShadow: '0px 0px 22.4px 0px rgba(0,0,0,0.06)',
          padding: '32px 42px',
          width: '100%',
          maxWidth: '702px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          {/* Logos */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <img src={COMPANY_LOGO} alt="Logo empresa" style={{ height: '84px', width: 'auto', objectFit: 'contain' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#151515', lineHeight: '19px' }}>Powered by</span>
              <img src="/logo-unio.png" alt="Unio" style={{ height: '23px', width: 'auto' }} />
            </div>
          </div>

          {/* Title + candidate card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 800, lineHeight: '54px', color: '#252432', margin: 0 }}>
              Calificación de Entrevista
            </h1>

            {/* Candidate info */}
            <div style={{ border: '1px solid #afaeb0', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <img src={CANDIDATE_AVATAR} alt="" style={{ width: '102px', height: '102px', borderRadius: '50%', objectFit: 'cover', border: '2.2px solid #d4dbe0', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '20px', lineHeight: '27px', color: '#363539', whiteSpace: 'nowrap' }}>
                  Maria Alicia Espinosa
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5C5.79 1.5 4 3.29 4 5.5C4 8.5 8 14 8 14C8 14 12 8.5 12 5.5C12 3.29 10.21 1.5 8 1.5ZM8 7C7.17 7 6.5 6.33 6.5 5.5C6.5 4.67 7.17 4 8 4C8.83 4 9.5 4.67 9.5 5.5C9.5 6.33 8.83 7 8 7Z" fill="#363539"/>
                  </svg>
                  <span style={{ fontWeight: 700, fontSize: '14px', lineHeight: '21px', color: '#363539' }}>Bogotá, Colombia</span>
                </div>
                <div style={{ background: '#e8ddfd', borderRadius: '36px', padding: '2px 10px', display: 'inline-flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, lineHeight: '18px', color: '#8750f6' }}>Vacante: Interaction Designer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Injected content (form or success) ── */}
        {children}

        {/* ── Footer ── */}
        <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '16px', padding: '32px 64px', width: '100%', maxWidth: '1050px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#151515' }}>Powered by</span>
              <img src="/logo-unio.png" alt="Unio" style={{ height: '23px', width: 'auto' }} />
            </div>
            <a href="https://www.linkedin.com/company/unio-latam" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #27214d', borderRadius: '12px', textDecoration: 'none', color: '#27214d', fontSize: '14px', fontWeight: 700 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.78 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
              </svg>
              Síguenos en Linkedin
            </a>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '19px', color: '#151515', margin: 0, maxWidth: '1004px' }}>
            Reimaginamos los procesos de reclutamiento, selección y contratación para roles UXUI, Growth y Product, potenciando y optimizando procesos con IA.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function HMEvalForm() {
  const { evalId } = useParams<{ evalId: string }>();

  const [form, setForm] = useState<HMFormState>({
    destacados: '',
    ratingA: 0,
    ratingB: 0,
    ratingC: 0,
    senalAlerta: '',
    recomendacion: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const isValid =
    form.destacados.trim() !== '' &&
    form.ratingA > 0 &&
    form.ratingB > 0 &&
    form.ratingC > 0 &&
    form.recomendacion !== null;

  const handleChange = (field: keyof HMFormState, value: string | number | RecomendacionValue | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    localStorage.setItem(`hm_eval_${evalId}`, JSON.stringify({ ...form, submittedAt: new Date().toISOString() }));
    setSubmitted(true);
  };

  if (submitted) return <SuccessScreen />;

  return (
    <PageShell>
      {/* Form section */}
      <div style={{ width: '100%', maxWidth: '622px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Greeting callout */}
        <div style={{ borderLeft: '3px solid #8750f6', background: '#f2ecfe', borderRadius: '0 12px 12px 0', padding: '14px 18px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: '#8750f6', margin: '0 0 4px' }}>Hola Carlos,</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', lineHeight: '22px', color: '#8750f6', margin: 0 }}>
            Por favor califica tu entrevista con el candidato. Te tomará aproximadamente 60–90 segundos.
          </p>
        </div>

        <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: '#afaeb0', textAlign: 'center', margin: 0 }}>
          ⏱ Tiempo estimado: 60–90 segundos
        </p>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Q1 */}
          <div>
            <label style={labelStyle}>1. ¿Qué es lo que más destacas del candidato? <span style={{ color: '#ef4444' }}>*</span></label>
            <textarea
              placeholder="Escribe lo más destacado del candidato..."
              value={form.destacados}
              onChange={(e) => handleChange('destacados', e.target.value)}
              style={textareaStyle}
              rows={4}
            />
          </div>

          {/* Q2 */}
          <div>
            <label style={labelStyle}>2. Dominio técnico del rol <span style={{ color: '#ef4444' }}>*</span></label>
            <StarRating value={form.ratingA} onChange={(v) => handleChange('ratingA', v)} />
          </div>

          {/* Q3 */}
          <div>
            <label style={labelStyle}>3. Experiencia relevante <span style={{ color: '#ef4444' }}>*</span></label>
            <StarRating value={form.ratingB} onChange={(v) => handleChange('ratingB', v)} />
          </div>

          {/* Q4 */}
          <div>
            <label style={labelStyle}>4. Afinidad con el equipo <span style={{ color: '#ef4444' }}>*</span></label>
            <StarRating value={form.ratingC} onChange={(v) => handleChange('ratingC', v)} />
          </div>

          {/* Q5 optional */}
          <div>
            <label style={labelStyle}>
              5. ¿Alguna señal de alerta?{' '}
              <span style={{ fontSize: '13px', fontWeight: 400, color: '#afaeb0' }}>(Opcional)</span>
            </label>
            <textarea
              placeholder="Escribe si detectaste alguna señal de alerta..."
              value={form.senalAlerta}
              onChange={(e) => handleChange('senalAlerta', e.target.value)}
              style={textareaStyle}
              rows={3}
            />
          </div>

          {/* Q6 */}
          <div>
            <label style={labelStyle}>6. ¿Recomendarías avanzar al candidato? <span style={{ color: '#ef4444' }}>*</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {recomendacionOptions.map((opt) => {
                const isSelected = form.recomendacion === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('recomendacion', opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: `1.5px solid ${isSelected ? '#8750f6' : '#d4d4d5'}`,
                      background: isSelected ? '#f2ecfe' : '#ffffff',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? '#8750f6' : '#252432',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      outline: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? '#8750f6' : '#afaeb0'}`,
                        background: '#ffffff',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                      }}
                    >
                      {isSelected && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#8750f6' }} />}
                    </div>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '218px',
              alignSelf: 'center',
              padding: '16px 28px',
              borderRadius: '12px',
              background: isValid ? '#27214d' : '#e5e2f3',
              border: 'none',
              color: '#ffffff',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '24px',
              cursor: isValid ? 'pointer' : 'default',
              opacity: isValid ? 1 : 0.65,
              pointerEvents: isValid ? 'auto' : 'none',
              transition: 'opacity 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={(e) => { if (isValid) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { if (isValid) e.currentTarget.style.opacity = '1'; }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2ZM8 14L4 10L5.41 8.59L8 11.17L14.59 4.58L16 6L8 14Z" fill="white"/>
            </svg>
            Enviar calificación
          </button>
        </div>
      </div>
    </PageShell>
  );
}

/* ─── Shared styles ──────────────────────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: '14px',
  color: '#252432',
  marginBottom: '10px',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #d4d4d5',
  borderRadius: '12px',
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  color: '#252432',
  resize: 'vertical',
  outline: 'none',
  background: '#ffffff',
  boxSizing: 'border-box',
  lineHeight: '24px',
};
