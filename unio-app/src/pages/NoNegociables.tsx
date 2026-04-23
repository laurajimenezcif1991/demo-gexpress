import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ArrowRight, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import StepBreadcrumb from '../components/ui/StepBreadcrumb';
import WizardBar from '../components/layout/WizardBar';

// ─── Types ────────────────────────────────────────────────────────────────────
type ItemId = 'skills' | 'experiencia' | 'sector' | 'ubicacion' | 'educacion' | 'salario';

interface SalaryFields { presupuesto: string; min: string; max: string }

interface Item {
  id: ItemId;
  label: string;
  sublabel: string;
  fieldLabel: string;
  helper: string;
  placeholder: string;
}

const ITEMS: Item[] = [
  {
    id: 'skills',
    label: 'Skills técnicos obligatorios',
    sublabel: 'exclusion_skills',
    fieldLabel: '¿Qué skills son obligatorios?',
    helper: 'Sin estos skills → excluir automáticamente',
    placeholder: 'Ej: SAP, Power BI, SQL',
  },
  {
    id: 'experiencia',
    label: 'Experiencia mínima requerida',
    sublabel: 'exclusion_experience',
    fieldLabel: '¿Qué experiencia es obligatoria?',
    helper: 'Sin esta experiencia → excluir automáticamente',
    placeholder: 'Ej: Mínimo 3 años liderando equipos',
  },
  {
    id: 'sector',
    label: 'Sector o industria específica',
    sublabel: 'exclusion_sector',
    fieldLabel: '¿Qué sector/industria es obligatoria?',
    helper: 'Sin experiencia en este sector → excluir',
    placeholder: 'Ej: Retail, Manufactura, Servicios corporativos',
  },
  {
    id: 'ubicacion',
    label: 'Ubicación obligatoria',
    sublabel: 'exclusion_location_legal',
    fieldLabel: 'País, ciudad y modalidad:',
    helper: 'Fuera de ubicación/modalidad → excluir',
    placeholder: 'Ej: Colombia, Cali, Presencial',
  },
  {
    id: 'educacion',
    label: 'Nivel educativo obligatorio',
    sublabel: 'exclusion_education',
    fieldLabel: '¿Qué título/certificación es obligatoria?',
    helper: 'Sin este título/certificación → excluir',
    placeholder: 'Ej: Profesional en Ingeniería Industrial',
  },
  {
    id: 'salario',
    label: 'Expectativa salarial',
    sublabel: 'exclusion_salary_expectations',
    fieldLabel: '',
    helper: 'Expectativa salarial fuera de este rango → excluir',
    placeholder: '',
  },
];

// ─── AI-extracted suggestions keyed by cargo keyword ─────────────────────────
function getMockSugerencias(cargo: string): { skills: string; experiencia: string } {
  const c = cargo.toLowerCase();
  if (c.includes('big data') || c.includes('datos') || c.includes('analítica') || c.includes('analitica')) {
    return {
      skills: 'Python, SQL, Power BI, Databricks, Machine Learning',
      experiencia: 'Mínimo 5 años en analítica de datos, con 2+ años liderando equipos',
    };
  }
  if (c.includes('talento') || c.includes('rrhh') || c.includes('recursos humanos')) {
    return {
      skills: 'Nómina (Siigo o Helisa), gestión de clima organizacional',
      experiencia: 'Mínimo 2 años en ciclo completo de Talento Humano',
    };
  }
  if (c.includes('odonto')) {
    return {
      skills: 'Odontopediatría, RETHUS vigente, técnicas de adaptación conductual',
      experiencia: 'Especialización en Odontopediatría + mínimo 2 años de consulta pediátrica',
    };
  }
  if (c.includes('bdm') || c.includes('business') || c.includes('desarrollo de negocio') || c.includes('comercial')) {
    return {
      skills: 'CRM (HubSpot/Salesforce), venta consultiva B2B, metodología SPIN',
      experiencia: 'Mínimo 3 años en desarrollo comercial con historial documentado de cierre',
    };
  }
  if (c.includes('logística') || c.includes('logistica') || c.includes('cadena')) {
    return {
      skills: 'SAP, Excel Avanzado, gestión de inventarios, WMS',
      experiencia: 'Mínimo 5 años en logística y gestión de equipos de operación',
    };
  }
  return {
    skills: 'Herramientas especializadas del cargo, Office 365',
    experiencia: 'Mínimo 2 años de experiencia en cargos similares',
  };
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const FIELD_STYLE: React.CSSProperties = {
  width: '100%',
  height: '42px',
  padding: '0 14px',
  border: '1.5px solid var(--color-border-default)',
  borderRadius: 'var(--radius-sm)',
  background: '#ffffff',
  fontFamily: 'var(--font-display)',
  fontSize: '14px',
  color: 'var(--color-text-primary)',
  outline: 'none',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  marginBottom: '10px',
  fontFamily: 'var(--font-display)',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function NoNegociables() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as {
    cargo?: string; area?: string; tipoVacante?: string; fechaIngreso?: string;
  };
  const cargo = state.cargo ?? 'Nueva vacante';
  const area  = state.area  ?? '';

  const sugerencias = getMockSugerencias(cargo);

  // checked state per item
  const [checked, setChecked] = useState<Record<ItemId, boolean>>({
    skills:      true,
    experiencia: true,
    sector:      false,
    ubicacion:   false,
    educacion:   false,
    salario:     false,
  });

  // text values per item
  const [values, setValues] = useState<Record<ItemId, string>>({
    skills:      sugerencias.skills,
    experiencia: sugerencias.experiencia,
    sector:      '',
    ubicacion:   `Colombia, ${area.includes('Buga') ? 'Buga' : 'Cali'}, Presencial`,
    educacion:   '',
    salario:     '',
  });

  // salary-specific sub-fields
  const [salary, setSalary] = useState<SalaryFields>({
    presupuesto: '',
    min: '',
    max: '',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedCount = Object.values(checked).filter(Boolean).length;
  const isValid = selectedCount >= 2 && selectedCount <= 6;

  const toggle = (id: ItemId) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const setVal = (id: ItemId, v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const setSal = (key: keyof SalaryFields, v: string) =>
    setSalary((prev) => ({ ...prev, [key]: v }));

  const inputFocus = (field: string): React.CSSProperties => ({
    ...FIELD_STYLE,
    borderColor: focusedField === field ? 'var(--color-border-focus)' : 'var(--color-border-default)',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(135,80,246,0.12)' : 'none',
  });

  const handleContinuar = () => {
    setSubmitted(true);
    if (!isValid) return;
    const noNegLabels = ITEMS
      .filter((item) => checked[item.id])
      .map((item) => item.id === 'salario' ? 'Expectativa salarial' : `${item.label}: ${values[item.id]}`);
    navigate('/vacante/nueva/completar', { state: { ...state, noNegLabels } });
  };

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
            src="/logo-comfandi.webp"
            alt="Comfandi"
            style={{ maxHeight: '52px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }}
          />
          <div style={{ width: '1px', height: '32px', background: 'var(--color-border-default)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <span>Powered by</span>
            <img src="/logo-unio.png" alt="Unio" style={{ height: '14px', width: 'auto' }} />
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/vacante/nueva', { state })}>
          Cancelar
        </Button>
      </header>

      {/* Page content */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* Step breadcrumb */}
        <StepBreadcrumb current={2} />

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '22px',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.3px',
              marginBottom: '8px',
            }}
          >
            Define los no negociables
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {cargo}{area ? ` · ${area}` : ''}
          </p>
        </div>

        {/* Main card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-default)',
            padding: '32px',
            boxShadow: '0 2px 16px rgba(24,20,46,0.06)',
          }}
        >
          {/* Alert */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: '#FFFBEB',
              border: '1px solid #F59E0B',
              marginBottom: '28px',
            }}
          >
            <AlertTriangle size={18} style={{ color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#92400E', fontWeight: 500 }}>
              <strong>Importante:</strong> Los no negociables son filtros automáticos que descartarán candidatos.
              Elige <strong>mínimo 2, máximo 6</strong>.
            </p>
          </div>

          {/* Section title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'var(--color-brand-accent)', flexShrink: 0,
              }}
            >
              <Check size={12} color="#fff" strokeWidth={3} />
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              No negociables sugeridos por la IA
            </span>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ITEMS.map((item) => {
              const isChecked = checked[item.id];
              const isSalary = item.id === 'salario';

              return (
                <div
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isChecked ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                    background: isChecked ? 'var(--color-secondary-50)' : '#ffffff',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}
                >
                  {/* Checkbox row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isChecked ? '16px' : '0' }}>
                    {/* Custom checkbox */}
                    <span
                      style={{
                        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                        border: `2px solid ${isChecked ? 'var(--color-brand-accent)' : 'var(--color-border-default)'}`,
                        background: isChecked ? 'var(--color-brand-accent)' : '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isChecked && <Check size={11} color="#fff" strokeWidth={3} />}
                    </span>

                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                        {item.sublabel}
                      </span>
                    </div>
                  </div>

                  {/* Fields (only when checked) */}
                  {isChecked && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ paddingLeft: '30px' }}
                    >
                      {!isSalary ? (
                        <>
                          <label style={LABEL_STYLE}>→ {item.fieldLabel}</label>
                          <input
                            type="text"
                            value={values[item.id]}
                            placeholder={item.placeholder}
                            onChange={(e) => setVal(item.id, e.target.value)}
                            onFocus={() => setFocusedField(item.id)}
                            onBlur={() => setFocusedField(null)}
                            style={inputFocus(item.id)}
                          />
                          <p style={{ fontSize: '11px', color: 'var(--color-text-placeholder)', marginTop: '5px' }}>
                            {item.helper}
                          </p>
                        </>
                      ) : (
                        <>
                          <label style={LABEL_STYLE}>→ Presupuesto interno (COP):</label>
                          <input
                            type="text"
                            value={salary.presupuesto}
                            placeholder="Ej: $4.500.000"
                            onChange={(e) => setSal('presupuesto', e.target.value)}
                            onFocus={() => setFocusedField('sal-pres')}
                            onBlur={() => setFocusedField(null)}
                            style={{ ...inputFocus('sal-pres'), maxWidth: '260px', marginBottom: '12px' }}
                          />
                          <p style={{ fontSize: '11px', color: 'var(--color-text-placeholder)', marginTop: '4px', marginBottom: '14px' }}>
                            Presupuesto que la empresa tiene para este rol
                          </p>

                          <label style={LABEL_STYLE}>→ Rango de validación/exclusión (COP):</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Mín:</span>
                            <input
                              type="text"
                              value={salary.min}
                              placeholder="Ej: $3.500.000"
                              onChange={(e) => setSal('min', e.target.value)}
                              onFocus={() => setFocusedField('sal-min')}
                              onBlur={() => setFocusedField(null)}
                              style={{ ...inputFocus('sal-min'), maxWidth: '180px' }}
                            />
                            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>Máx:</span>
                            <input
                              type="text"
                              value={salary.max}
                              placeholder="Ej: $5.500.000"
                              onChange={(e) => setSal('max', e.target.value)}
                              onFocus={() => setFocusedField('sal-max')}
                              onBlur={() => setFocusedField(null)}
                              style={{ ...inputFocus('sal-max'), maxWidth: '180px' }}
                            />
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--color-text-placeholder)', marginTop: '5px' }}>
                            {item.helper}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--color-border-default)', margin: '28px 0' }} />

          {/* Counter */}
          <div
            style={{
              padding: '14px 20px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${
                submitted && !isValid
                  ? 'var(--color-negative-400)'
                  : isValid
                  ? 'var(--color-brand-accent)'
                  : 'var(--color-border-default)'
              }`,
              background:
                submitted && !isValid
                  ? 'var(--color-negative-50)'
                  : isValid
                  ? 'var(--color-secondary-50)'
                  : 'var(--color-surface-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '22px', height: '22px', borderRadius: '50%',
                background: isValid ? 'var(--color-brand-accent)' : 'var(--color-neutral-300)',
                flexShrink: 0,
              }}
            >
              {isValid
                ? <Check size={12} color="#fff" strokeWidth={3} />
                : <span style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>{selectedCount}</span>
              }
            </span>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: submitted && !isValid
                  ? 'var(--color-negative-600)'
                  : isValid
                  ? 'var(--color-brand-accent)'
                  : 'var(--color-text-muted)',
              }}
            >
              {selectedCount} de 6 no negociables seleccionados
              <span style={{ fontWeight: 400, marginLeft: '4px' }}>(mín 2, máx 6)</span>
            </span>
          </div>

          {submitted && !isValid && (
            <p style={{ fontSize: '12px', color: 'var(--color-negative-500)', marginTop: '6px', textAlign: 'center' }}>
              Selecciona al menos 2 no negociables para continuar.
            </p>
          )}

          {/* Actions moved to WizardBar */}
        </div>
      </div>

      <WizardBar>
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <Button variant="ghost" size="lg" onClick={() => navigate('/vacante/nueva', { state })}>
            <ChevronLeft size={16} />
            Atrás
          </Button>
          <Button variant="primary" size="lg" onClick={handleContinuar}>
            Continuar
            <ArrowRight size={16} />
          </Button>
        </div>
      </WizardBar>
    </div>
  );
}
