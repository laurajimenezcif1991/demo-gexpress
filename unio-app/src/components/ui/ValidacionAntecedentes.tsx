import { AlertTriangle, ShieldCheck } from 'lucide-react';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
export type VariantKey = 'alto_riesgo' | 'sin_novedad';

interface AntRow {
  categoria: 'Alto' | 'Medio' | 'Sin novedad';
  fuente: string;
  novedad: string;
}

// ─── Dataset negativo (8 Alto + 2 Medio) ─────────────────────────────────────
const DATA_NEGATIVO: AntRow[] = [
  { categoria: 'Alto',       fuente: 'Antecedentes Penales',   novedad: 'Registra en 1 proceso penal activo' },
  { categoria: 'Alto',       fuente: 'Antecedentes Judiciales', novedad: 'Actualmente no es requerido' },
  { categoria: 'Alto',       fuente: 'Rama Unificada',          novedad: 'Figura como demandado en 1 proceso' },
  { categoria: 'Alto',       fuente: 'Registraduría',           novedad: 'Vigente con pérdida o suspensión de los derechos políticos' },
  { categoria: 'Alto',       fuente: 'Procuraduría',            novedad: 'Está sujeto a sanciones y/o inhabilitaciones' },
  { categoria: 'Alto',       fuente: 'INPEC',                   novedad: 'Figura en el sistema penitenciario con estado de prisión domiciliaria — situación jurídica: condenado' },
  { categoria: 'Alto',       fuente: 'RUNT',                    novedad: 'Licencia suspendida para categoría B1 (autos pequeños particulares)' },
  { categoria: 'Alto',       fuente: 'SIMIT',                   novedad: 'Posee $20.837.279 COP en multas o comparendos pendientes' },
  { categoria: 'Medio',      fuente: 'Medidas Correctivas',     novedad: 'Figura como infractor del código de policía y convivencia' },
  { categoria: 'Medio',      fuente: 'Rama Unificada',          novedad: 'Figura como demandante en 2 procesos' },
];

// ─── Dataset positivo (todas las fuentes limpias) ─────────────────────────────
const DATA_POSITIVO: AntRow[] = [
  { categoria: 'Sin novedad', fuente: 'Antecedentes Penales',   novedad: 'No registra novedades' },
  { categoria: 'Sin novedad', fuente: 'Antecedentes Judiciales', novedad: 'No registra novedades' },
  { categoria: 'Sin novedad', fuente: 'Rama Unificada',          novedad: 'No registra procesos como demandado ni demandante' },
  { categoria: 'Sin novedad', fuente: 'Registraduría',           novedad: 'Documento vigente, sin restricciones de derechos políticos' },
  { categoria: 'Sin novedad', fuente: 'Procuraduría',            novedad: 'No registra sanciones ni inhabilitaciones' },
  { categoria: 'Sin novedad', fuente: 'INPEC',                   novedad: 'No figura en el sistema penitenciario' },
  { categoria: 'Sin novedad', fuente: 'RUNT',                    novedad: 'Licencia de conducción vigente, sin restricciones' },
  { categoria: 'Sin novedad', fuente: 'SIMIT',                   novedad: 'No registra multas ni comparendos pendientes' },
  { categoria: 'Sin novedad', fuente: 'Medidas Correctivas',     novedad: 'No registra infracciones al código de policía' },
  { categoria: 'Sin novedad', fuente: 'Rama Unificada',          novedad: 'No registra novedades adicionales' },
];

// ─── Score y riesgo ───────────────────────────────────────────────────────────
function calcScore(data: AntRow[]): number {
  const alto  = data.filter(d => d.categoria === 'Alto').length;
  const medio = data.filter(d => d.categoria === 'Medio').length;
  return Math.max(0, 100 - alto * 10 - medio * 5);
}

export function getAntecedentesScore(variant: VariantKey): number {
  return calcScore(variant === 'sin_novedad' ? DATA_POSITIVO : DATA_NEGATIVO);
}

function getRisk(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 85) return { label: 'Sin novedad',    color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0' };
  if (score >= 70) return { label: 'Riesgo Bajo',    color: '#65A30D', bg: '#F7FEE7', border: '#D9F99D' };
  if (score >= 50) return { label: 'Riesgo Medio',   color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' };
  if (score >= 30) return { label: 'Riesgo Alto',    color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' };
  return             { label: 'Riesgo Muy Alto', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
}

// ─── Pill de categoría ────────────────────────────────────────────────────────
function PillCat({ cat }: { cat: AntRow['categoria'] }) {
  const styles: Record<AntRow['categoria'], { bg: string; color: string; border: string }> = {
    'Alto':        { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
    'Medio':       { bg: '#FEF9C3', color: '#B45309', border: '#FDE68A' },
    'Sin novedad': { bg: '#DCFCE7', color: '#16A34A', border: '#BBF7D0' },
  };
  const s = styles[cat];
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '11px', fontWeight: 700,
      padding: '2px 9px', borderRadius: '20px',
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {cat === 'Sin novedad' ? '✓ Limpio' : cat}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
interface Props {
  variant?: VariantKey;
}

export default function ValidacionAntecedentes({ variant = 'alto_riesgo' }: Props) {
  const data     = variant === 'sin_novedad' ? DATA_POSITIVO : DATA_NEGATIVO;
  const score    = calcScore(data);
  const { label: riskLabel, color, bg, border } = getRisk(score);
  const altoCnt  = data.filter(d => d.categoria === 'Alto').length;
  const medioCnt = data.filter(d => d.categoria === 'Medio').length;
  const isClean  = score >= 85;

  return (
    <div style={{ padding: '4px 0 8px' }}>

      {/* ── Resumen ejecutivo ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        padding: '14px 16px', borderRadius: '10px',
        background: bg, border: `1.5px solid ${border}`,
        marginBottom: '18px',
      }}>
        <div style={{ marginTop: 2 }}>
          {isClean
            ? <ShieldCheck size={22} color={color} />
            : <AlertTriangle size={22} color={color} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color }}>{riskLabel}</span>
            <span style={{
              fontSize: '15px', fontWeight: 800,
              background: color, color: '#fff',
              padding: '2px 12px', borderRadius: '20px', letterSpacing: '0.2px',
            }}>
              {score} / 100
            </span>
          </div>
          <p style={{ fontSize: '13px', color, margin: 0, lineHeight: 1.55 }}>
            {isClean
              ? 'No se encontraron novedades en ninguna de las 10 fuentes consultadas. Apto para vinculación.'
              : `${altoCnt} novedad${altoCnt !== 1 ? 'es' : ''} de riesgo alto · ${medioCnt} de riesgo medio. No recomendado para vinculación.`}
          </p>
        </div>
      </div>

      {/* ── Tabla de resultados ────────────────────────────────────────── */}
      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-border-default)' }}>
        {/* Cabecera */}
        <div style={{
          display: 'grid', gridTemplateColumns: '110px 170px 1fr',
          padding: '9px 14px',
          background: '#F3F4F6', borderBottom: '1px solid var(--color-border-default)',
        }}>
          {['Categoría', 'Fuente', 'Novedad'].map(h => (
            <span key={h} style={{
              fontSize: '11px', fontWeight: 700,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.6px',
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Filas */}
        {data.map((row, idx) => (
          <div key={idx} style={{
            display: 'grid', gridTemplateColumns: '110px 170px 1fr',
            padding: '10px 14px', alignItems: 'start',
            background: idx % 2 === 0 ? '#ffffff' : '#FAFAFA',
            borderBottom: idx < data.length - 1
              ? '1px solid var(--color-border-default)'
              : 'none',
          }}>
            <div style={{ paddingTop: '1px' }}>
              <PillCat cat={row.categoria} />
            </div>
            <span style={{
              fontSize: '13px', fontWeight: 600,
              color: 'var(--color-text-secondary)',
              paddingRight: '12px', lineHeight: 1.5,
            }}>
              {row.fuente}
            </span>
            <span style={{
              fontSize: '13px',
              color: isClean ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
              lineHeight: 1.55,
            }}>
              {row.novedad}
            </span>
          </div>
        ))}
      </div>

      {/* ── Nota metodológica ──────────────────────────────────────────── */}
      <p style={{ marginTop: '12px', fontSize: '11.5px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
        Score calculado automáticamente: –10 pts por novedad de categoría Alta · –5 pts por Media.
        Fuentes consultadas: Antecedentes Penales, Judiciales, Rama Unificada, Registraduría,
        Procuraduría, INPEC, RUNT y SIMIT.
      </p>
    </div>
  );
}
