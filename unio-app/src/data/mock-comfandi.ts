import type {
  Candidate, Vacante, PipelineStage, PsychTestResult,
  SalaryRange, StageStatus, EvalRow,
} from './mock';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const _p = (n: number, g: 'men' | 'women') => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
const COLS = ['#8750F6', '#27BE69', '#295BFF', '#F6A350', '#F65078'];
const _c = (i: number) => COLS[i % COLS.length];
const PRE_HI = [2, 5, 4, 7];
const PRE_LO = [10, 12, 11, 14];

// ─── Config type ─────────────────────────────────────────────────────────────
interface VConfig {
  role: string;
  sector: string;
  budget: string;
  bio: string;
  superpoder: string;
  noNegS: { label: string; threshold: number }[];
  logrosHi: string[];
  logrosMd: string[];
  logrosLo: string;
  senalesHi: string[];
  senalesMd: string[];
  senalesLo: string[];
  jobs: { c: string; r: string; d: string }[];
  resumenPreHi: string;
  resumenPreLo: string;
  noNegP: { label: string; evHi: string; evLo: string }[];
  plusHi: string[];
  plusLo: string[];
  insightHi: string;
  insightLo: string;
  axes: { axis: string; ideal: number; off: number; sum: string; det: string }[];
  radar: { lbl: string; off: number }[];
  v: { title: string; body: string }[];
  q: { tag: string; question: string; validates: string }[];
}

// ─── Parametric generator ────────────────────────────────────────────────────
type Stage = 'scoring' | 'prescreening' | 'entrevistas' | 'evaluaciones';

function _gen(
  cfg: VConfig,
  id: string, name: string, score: number, photo: string,
  init: string, color: string, city: string, years: string,
  asp: string, sr: SalaryRange,
  stage: Stage = 'scoring',
): Candidate {
  const hi = score >= 78, md = score >= 60;
  const n = parseInt(id.split('-').pop()!);
  const j = cfg.jobs[(n - 1) % cfg.jobs.length];

  const prescreeningAI: Candidate['prescreeningAI'] = stage !== 'scoring' ? {
    score: score + 1,
    status: 'continua',
    resumen: hi ? cfg.resumenPreHi.replace('{name}', name) : cfg.resumenPreLo.replace('{name}', name),
    noNegociables: cfg.noNegP.map((nn, i) => ({
      label: nn.label,
      score: hi ? score - PRE_HI[i] : score - PRE_LO[i],
      evidencia: hi ? nn.evHi : nn.evLo,
    }) as unknown as EvalRow),
    plusDetectados: hi ? cfg.plusHi : cfg.plusLo,
    senales: hi ? cfg.senalesHi : cfg.senalesMd,
  } : undefined;

  const psychTest: PsychTestResult | undefined = stage === 'evaluaciones' ? {
    score: score - 4,
    insight: `${name} ${hi ? cfg.insightHi : cfg.insightLo}`,
    fitCards: cfg.axes.map(a => ({
      axis: a.axis,
      idealScore: a.ideal,
      candidateScore: Math.min(99, Math.max(20, score + a.off)),
      summary: a.sum,
      detail: a.det,
    })),
    radarPoints: cfg.radar.map(r => ({ label: r.lbl, value: Math.min(99, Math.max(20, score + r.off)) })),
    veredicto: cfg.v,
    preguntas: cfg.q,
  } : undefined;

  return {
    id, name,
    role: cfg.role,
    sector: cfg.sector,
    years,
    location: `${city}, Colombia`,
    bio: cfg.bio,
    score, photo,
    avatarInitials: init,
    avatarColor: color,
    hasCurrentJob: score > 60,
    ...(score > 60
      ? { currentCompany: j.c, currentRole: j.r }
      : { lastCompany: j.c, lastRole: j.r, lastDate: j.d }),
    superpoder: cfg.superpoder,
    aspiration: asp,
    budget: cfg.budget,
    salaryRange: sr,
    currentStage: stage,
    scoringAI: {
      score: Math.round(score * 0.94),
      status: score >= 58 ? 'continua' : 'pendiente',
      resumen: hi
        ? `${name} presenta perfil sólido para ${cfg.role} en Comfandi. Cumple los requisitos clave y tiene experiencia verificable en el sector.`
        : md
        ? `${name} tiene formación y experiencia básica. Requiere mayor desarrollo en los requisitos críticos del cargo.`
        : `${name} presenta perfil insuficiente: experiencia y formación por debajo del umbral mínimo requerido.`,
      noNegociables: cfg.noNegS.map(nn => ({ label: nn.label, cumple: score >= nn.threshold })),
      logros: hi ? cfg.logrosHi : md ? cfg.logrosMd : [cfg.logrosLo],
      senales: hi ? cfg.senalesHi : md ? cfg.senalesMd : cfg.senalesLo,
    },
    ...(prescreeningAI ? { prescreeningAI } : {}),
    ...(psychTest ? { psychTest } : {}),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// VACANTE 1 — JEFE DE BIG DATA E INTELIGENCIA SECTORIAL
// Comfandi | Cali | Pipeline: Evaluaciones (showcase)
// ══════════════════════════════════════════════════════════════════════════════
const cfgBD: VConfig = {
  role: 'Jefe de Big Data e Inteligencia Sectorial',
  sector: 'Analítica / Big Data',
  budget: "$8'000.000",
  bio: 'Jefe de Big Data con experiencia liderando equipos de ciencia de datos e inteligencia sectorial. Posgrado en analítica, dominio de ML/BI y capacidad de presentar hallazgos estratégicos a gerencia.',
  superpoder: '"Convierte datos sectoriales en decisiones estratégicas de negocio"',
  noNegS: [
    { label: 'Posgrado en Analítica, Estadística o Ciencias de Datos', threshold: 78 },
    { label: 'Experiencia ≥5 años liderando equipos de datos', threshold: 72 },
    { label: 'Dominio ML/BI en producción (Python, Power BI, Databricks)', threshold: 66 },
    { label: 'Presentación de inteligencia de negocio a nivel gerencial', threshold: 60 },
  ],
  logrosHi: [
    'Lideró equipo de 8 data scientists con modelo predictivo de churn de afiliados (92% precisión)',
    'Redujo costos operativos en 20% mediante analítica de procesos y automatización de reportes',
    'Presentó estrategia de inteligencia sectorial adoptada por Junta Directiva para 2024-2026',
  ],
  logrosMd: [
    'Coordinó análisis de datos para informes de inteligencia sectorial con metodología estructurada',
    'Lideró proyecto de visualización de KPIs con impacto documentado en decisiones operativas',
  ],
  logrosLo: 'Participación en proyectos de analítica sin responsabilidad de liderazgo ni impacto estratégico documentado.',
  senalesHi: ['Confirmar conocimiento del modelo de negocio de cajas de compensación vs. sector financiero'],
  senalesMd: ['Validar experiencia real de liderazgo de equipos de 5+ personas', 'Confirmar manejo de herramientas cloud en producción'],
  senalesLo: ['Perfil técnico operativo sin evidencia de liderazgo estratégico ni presentación a gerencia', 'Sin posgrado en analítica ni ciencias de datos'],
  jobs: [
    { c: 'Bancolombia Analítica', r: 'Jefe de Ciencia de Datos', d: '01/2025' },
    { c: 'Carvajal Tecnología y Servicios', r: 'Data Analytics Manager', d: '07/2024' },
    { c: 'Superintendencia de Subsidio Familiar', r: 'Coordinador de Inteligencia Sectorial', d: '03/2024' },
    { c: 'Universidad del Valle - DATIC', r: 'Líder de Analítica Institucional', d: '09/2023' },
    { c: 'Grupo Éxito Analytics', r: 'Senior Data Scientist', d: '05/2023' },
  ],
  resumenPreHi: '{name} demuestra dominio estratégico de la analítica de datos con casos verificables de liderazgo técnico e impacto gerencial. Comunicación ejecutiva sólida y visión de negocio alineada con el rol de Comfandi.',
  resumenPreLo: '{name} presenta conocimiento técnico en datos pero menor profundidad en liderazgo de equipos y traducción de analítica a decisiones estratégicas.',
  noNegP: [
    { label: 'Posgrado + liderazgo de equipos analíticos', evHi: '5+ años como Jefe de Analytics. Posgrado U. Andes. Lideró equipo de 8 en Bancolombia con entregables a VP.', evLo: 'Sin posgrado completo ni cargo formal de liderazgo de equipos.' },
    { label: 'ML/BI en producción (Python, Power BI, Databricks)', evHi: 'Python (Pandas, Scikit-learn), Power BI, Databricks. Modelo en producción con 200k+ predicciones/mes.', evLo: 'Manejo básico de herramientas; sin modelos en producción ni pipeline de datos real.' },
    { label: 'Inteligencia sectorial para entidades de bienestar', evHi: 'Desarrolló reportes de benchmarking para Supersalud. Conoce indicadores clave de afiliación y bienestar.', evLo: 'Experiencia en sector retail/fintech sin transferencia evidente a cajas de compensación.' },
    { label: 'Presentación ejecutiva a gerencia o junta directiva', evHi: 'Presentó estrategia de datos a VP y Junta Directiva con modelos de escenarios validados por la organización.', evLo: 'Presentaciones solo a nivel operativo; sin experiencia de comunicación con alta dirección.' },
  ],
  plusHi: [
    'Experiencia en benchmarking sectorial para entidades del sistema de subsidio familiar',
    'Capacidad probada de aterrizar insights complejos a lenguaje gerencial accionable',
    'Red activa en el ecosistema de datos de Colombia (DataLatam, PyData)',
  ],
  plusLo: ['Formación técnica sólida con potencial de crecimiento hacia roles estratégicos en analítica'],
  insightHi: 'presenta perfil estratégico alineado para liderar la transformación analítica de Comfandi. Equilibra el rigor técnico con la visión de negocio de manera natural.',
  insightLo: 'tiene base técnica sólida pero evidencia brechas en liderazgo estratégico y comunicación ejecutiva requeridas para el cargo.',
  axes: [
    { axis: 'Liderazgo estratégico', ideal: 85, off: 0, sum: 'Conduce equipos técnicos con visión de negocio.', det: 'Equilibra el rigor técnico con la capacidad de traducir datos en estrategia organizacional. Conecta el trabajo del equipo con los objetivos de la caja.' },
    { axis: 'Orientación al negocio', ideal: 80, off: -5, sum: 'Vincula la analítica con decisiones de alto impacto.', det: 'Va más allá de los modelos técnicos para identificar oportunidades de valor en los datos. Su mirada de negocio diferencia al Jefe de Big Data del data scientist operativo.' },
    { axis: 'Comunicación ejecutiva', ideal: 75, off: -8, sum: 'Presenta insights complejos con claridad a la gerencia.', det: 'Adapta el mensaje técnico al interlocutor gerencial. La confianza de la alta dirección en los datos depende directamente de la calidad de esta traducción.' },
  ],
  radar: [
    { lbl: 'Iniciativa', off: 2 }, { lbl: 'Agente cambio', off: -3 }, { lbl: 'Proactividad', off: 4 },
    { lbl: 'Inteligencia Social', off: -4 }, { lbl: 'Autonomía', off: 1 }, { lbl: 'Agilidad', off: -2 },
    { lbl: 'Persuasión', off: 3 }, { lbl: 'Liderazgo', off: 5 }, { lbl: 'P. Analítico', off: 6 }, { lbl: 'Visión estratégica', off: 4 },
  ],
  v: [
    { title: 'Quién es conductualmente', body: 'Perfil con alta orientación al resultado estratégico y capacidad de mover organizaciones con base en datos. Opera con visión sistémica y comunica con naturalidad a nivel ejecutivo.' },
    { title: 'Fit con este rol', body: 'El Jefe de Big Data en Comfandi requiere liderazgo técnico + visión sectorial + credibilidad ante gerencia. La curva de aprendizaje en el mundo de cajas de compensación es el principal punto a validar.' },
  ],
  q: [
    { tag: 'Para: Gerente de Innovación Comfandi', question: '"Cuéntame cómo convertiste un insight de datos en una decisión estratégica concreta. ¿Qué modelo usaste, a quién presentaste y qué cambió en la organización?"', validates: 'Visión estratégica y comunicación ejecutiva con datos' },
    { tag: 'Para: RRHH', question: '"¿Cómo manejas la tensión entre un equipo técnico que quiere explorar y la necesidad de entregar resultados en plazos concretos a la gerencia?"', validates: 'Liderazgo de equipos técnicos bajo presión y alineación de prioridades' },
  ],
};

const bdFinal: Candidate[] = [
  _gen(cfgBD, 'mcbd-1',  'Marco Restrepo',      93, _p(1,'men'),    'MR', _c(0), 'Cali',          '10 Años', "$7'500.000", 'en_rango',       'evaluaciones'),
  _gen(cfgBD, 'mcbd-2',  'Andrea Mejía',         91, _p(1,'women'),  'AM', _c(1), 'Cali',          '9 Años',  "$8'000.000", 'en_rango',       'evaluaciones'),
  _gen(cfgBD, 'mcbd-3',  'Juan Carlos Vargas',   89, _p(2,'men'),    'JV', _c(2), 'Medellín',      '11 Años', "$8'500.000", 'fuera_de_rango', 'evaluaciones'),
];
const bdEval: Candidate[] = [
  _gen(cfgBD, 'mcbd-4',  'Tatiana López',        86, _p(2,'women'),  'TL', _c(3), 'Cali',          '8 Años',  "$7'800.000", 'en_rango',       'evaluaciones'),
  _gen(cfgBD, 'mcbd-5',  'Roberto Salazar',      83, _p(3,'men'),    'RS', _c(4), 'Bogotá',        '7 Años',  "$8'000.000", 'en_rango',       'evaluaciones'),
];
const bdEnt: Candidate[] = [
  _gen(cfgBD, 'mcbd-6',  'Catalina Herrera',     81, _p(3,'women'),  'CH', _c(0), 'Cali',          '7 Años',  "$7'500.000", 'en_rango',       'entrevistas'),
  _gen(cfgBD, 'mcbd-7',  'Eduardo Ospina',       79, _p(4,'men'),    'EO', _c(1), 'Cali',          '8 Años',  "$8'000.000", 'en_rango',       'entrevistas'),
  _gen(cfgBD, 'mcbd-8',  'Diana Ramírez',        77, _p(4,'women'),  'DR', _c(2), 'Pereira',       '6 Años',  "$9'000.000", 'fuera_de_rango', 'entrevistas'),
];
const bdPre: Candidate[] = [
  _gen(cfgBD, 'mcbd-9',  'Francisco Torres',     74, _p(5,'men'),    'FT', _c(3), 'Cali',          '6 Años',  "$7'500.000", 'en_rango',       'prescreening'),
  _gen(cfgBD, 'mcbd-10', 'Paula García',         72, _p(5,'women'),  'PG', _c(4), 'Bogotá',        '5 Años',  "$7'800.000", 'en_rango',       'prescreening'),
  _gen(cfgBD, 'mcbd-11', 'Mauricio Jiménez',     70, _p(6,'men'),    'MJ', _c(0), 'Cali',          '6 Años',  "$8'000.000", 'en_rango',       'prescreening'),
  _gen(cfgBD, 'mcbd-12', 'Ana María Morales',    68, _p(6,'women'),  'AM', _c(1), 'Cali',          '5 Años',  "$8'500.000", 'fuera_de_rango', 'prescreening'),
  _gen(cfgBD, 'mcbd-13', 'Arturo Castro',        66, _p(7,'men'),    'AC', _c(2), 'Medellín',      '5 Años',  "$7'500.000", 'en_rango',       'prescreening'),
  _gen(cfgBD, 'mcbd-14', 'Beatriz Arango',       64, _p(7,'women'),  'BA', _c(3), 'Cali',          '4 Años',  "$7'800.000", 'en_rango',       'prescreening'),
  _gen(cfgBD, 'mcbd-15', 'Pedro Sánchez',        62, _p(8,'men'),    'PS', _c(4), 'Cali',          '5 Años',  "$9'500.000", 'fuera_de_rango', 'prescreening'),
];
const bdScore: Candidate[] = [
  _gen(cfgBD, 'mcbd-16', 'Valentina Pinto',      58, _p(8,'women'),  'VP', _c(0), 'Cali',          '4 Años',  "$7'500.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-17', 'Rodrigo Suárez',       56, _p(9,'men'),    'RS', _c(1), 'Bogotá',        '3 Años',  "$8'000.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-18', 'Marcela Medina',       54, _p(9,'women'),  'MM', _c(2), 'Cali',          '4 Años',  "$7'800.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-19', 'Fernando Cardona',     52, _p(10,'men'),   'FC', _c(3), 'Medellín',      '3 Años',  "$8'500.000", 'fuera_de_rango'),
  _gen(cfgBD, 'mcbd-20', 'Natalia Giraldo',      50, _p(10,'women'), 'NG', _c(4), 'Cali',          '3 Años',  "$7'500.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-21', 'Hernán Vásquez',       49, _p(11,'men'),   'HV', _c(0), 'Bogotá',        '4 Años',  "$7'800.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-22', 'Silvia Guerrero',      48, _p(11,'women'), 'SG', _c(1), 'Cali',          '3 Años',  "$8'000.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-23', 'Ricardo Muñoz',        47, _p(12,'men'),   'RM', _c(2), 'Pereira',       '3 Años',  "$7'500.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-24', 'Pilar Arenas',         46, _p(12,'women'), 'PA', _c(3), 'Cali',          '2 Años',  "$8'000.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-25', 'Gonzalo Lozano',       45, _p(13,'men'),   'GL', _c(4), 'Medellín',      '3 Años',  "$9'000.000", 'fuera_de_rango'),
  _gen(cfgBD, 'mcbd-26', 'Gloria Espinosa',      44, _p(13,'women'), 'GE', _c(0), 'Cali',          '2 Años',  "$7'800.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-27', 'Javier Botero',        43, _p(14,'men'),   'JB', _c(1), 'Bogotá',        '2 Años',  "$8'000.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-28', 'Adriana Cano',         42, _p(14,'women'), 'AC', _c(2), 'Cali',          '3 Años',  "$7'500.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-29', 'Alberto Zapata',       41, _p(15,'men'),   'AZ', _c(3), 'Cali',          '2 Años',  "$8'500.000", 'fuera_de_rango'),
  _gen(cfgBD, 'mcbd-30', 'Yolanda Castaño',      40, _p(15,'women'), 'YC', _c(4), 'Manizales',     '2 Años',  "$7'800.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-31', 'César Hurtado',        39, _p(16,'men'),   'CH', _c(0), 'Cali',          '1 Año',   "$7'500.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-32', 'Mónica Rincón',        38, _p(16,'women'), 'MR', _c(1), 'Bogotá',        '2 Años',  "$8'000.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-33', 'Jaime García',         37, _p(17,'men'),   'JG', _c(2), 'Cali',          '1 Año',   "$7'800.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-34', 'Luisa Estrada',        36, _p(17,'women'), 'LE', _c(3), 'Medellín',      '1 Año',   "$9'000.000", 'fuera_de_rango'),
  _gen(cfgBD, 'mcbd-35', 'Hugo Pérez',           35, _p(18,'men'),   'HP', _c(4), 'Cali',          '1 Año',   "$7'500.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-36', 'Patricia Acosta',      34, _p(18,'women'), 'PA', _c(0), 'Bogotá',        'Sin experiencia', "$8'000.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-37', 'Ramiro Flórez',        33, _p(19,'men'),   'RF', _c(1), 'Cali',          'Sin experiencia', "$7'800.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-38', 'Andrea Cortés',        32, _p(19,'women'), 'AC', _c(2), 'Pereira',       'Sin experiencia', "$8'500.000", 'fuera_de_rango'),
  _gen(cfgBD, 'mcbd-39', 'Oscar Medina',         31, _p(20,'men'),   'OM', _c(3), 'Cali',          'Sin experiencia', "$7'500.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-40', 'Blanca Torres',        30, _p(20,'women'), 'BT', _c(4), 'Bogotá',        'Sin experiencia', "$8'000.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-41', 'Ernesto Bueno',        29, _p(21,'men'),   'EB', _c(0), 'Cali',          'Sin experiencia', "$7'800.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-42', 'Consuelo Ruiz',        28, _p(21,'women'), 'CR', _c(1), 'Manizales',     'Sin experiencia', "$8'000.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-43', 'Manuel Patiño',        27, _p(22,'men'),   'MP', _c(2), 'Cali',          'Sin experiencia', "$9'000.000", 'fuera_de_rango'),
  _gen(cfgBD, 'mcbd-44', 'Rosa Vásquez',         26, _p(22,'women'), 'RV', _c(3), 'Bogotá',        'Sin experiencia', "$7'500.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-45', 'Nelson Cárdenas',      25, _p(23,'men'),   'NC', _c(4), 'Cali',          'Sin experiencia', "$8'000.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-46', 'Amparo Herrera',       24, _p(23,'women'), 'AH', _c(0), 'Pereira',       'Sin experiencia', "$7'800.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-47', 'Víctor Moreno',        23, _p(24,'men'),   'VM', _c(1), 'Cali',          'Sin experiencia', "$8'500.000", 'fuera_de_rango'),
  _gen(cfgBD, 'mcbd-48', 'Margarita Salinas',    22, _p(24,'women'), 'MS', _c(2), 'Bogotá',        'Sin experiencia', "$7'500.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-49', 'Arturo Duarte',        21, _p(25,'men'),   'AD', _c(3), 'Cali',          'Sin experiencia', "$8'000.000", 'en_rango'),
  _gen(cfgBD, 'mcbd-50', 'Elena Aguilar',        20, _p(25,'women'), 'EA', _c(4), 'Medellín',      'Sin experiencia', "$10'000.000", 'fuera_de_rango'),
];

// ══════════════════════════════════════════════════════════════════════════════
// VACANTE 2 — ANALISTA DE TALENTO HUMANO
// Comfandi | Buga | Pipeline: Entrevistas (showcase)
// ══════════════════════════════════════════════════════════════════════════════
const cfgTH: VConfig = {
  role: 'Analista de Talento Humano',
  sector: 'RRHH / Gestión Humana',
  budget: "$3'000.000",
  bio: 'Analista de Talento Humano con experiencia en ciclo completo de RRHH, nómina, clima organizacional y planes de bienestar en empresas del sector servicios.',
  superpoder: '"Acompaña el ciclo de vida del colaborador con calidez y rigor administrativo"',
  noNegS: [
    { label: 'Profesional en Psicología, Administración o afines', threshold: 78 },
    { label: 'Experiencia ≥2 años en procesos de Talento Humano', threshold: 72 },
    { label: 'Manejo de nómina y liquidaciones laborales (Siigo o equivalente)', threshold: 66 },
    { label: 'Gestión de clima organizacional y bienestar', threshold: 60 },
  ],
  logrosHi: [
    'Redujo rotación voluntaria en 15% mediante plan de bienestar con 85% de satisfacción en encuesta de clima',
    'Gestionó nómina de 200+ colaboradores con 0 novedades sin tramitar en 18 meses consecutivos',
    'Diseñó programa de inducción que redujo la curva de aprendizaje de nuevos colaboradores en 30%',
  ],
  logrosMd: [
    'Apoyó proceso de selección y contratación para perfiles operativos y administrativos',
    'Participó en gestión de nómina y tramitación de novedades laborales del mes',
  ],
  logrosLo: 'Apoyo administrativo básico en área de RRHH sin responsabilidad autónoma en nómina ni bienestar.',
  senalesHi: ['Confirmar disponibilidad presencial en Buga (no Cali) y fecha de disponibilidad'],
  senalesMd: ['Validar conocimiento real de liquidaciones de prestaciones sociales', 'Confirmar dominio de software de nómina con ejercicio práctico'],
  senalesLo: ['Sin experiencia real en nómina ni ciclo completo de RRHH', 'Perfil en formación; no alcanza el nivel de autonomía requerido'],
  jobs: [
    { c: 'Comfenalco Valle del Cauca', r: 'Analista de Talento Humano', d: '02/2025' },
    { c: 'Hospital Mario Correa Rengifo — Buga', r: 'Coordinadora de RRHH', d: '08/2024' },
    { c: 'EPS Coosalud Regional Buga', r: 'Analista de Nómina y Bienestar', d: '04/2024' },
    { c: 'Ingenio Riopaila Castilla', r: 'Auxiliar de Gestión Humana', d: '10/2023' },
    { c: 'Cootracol S.A.S.', r: 'Analista de RRHH Operativo', d: '06/2023' },
  ],
  resumenPreHi: '{name} demuestra dominio del ciclo de RRHH con manejo autónomo de nómina y casos verificables de gestión de bienestar. Respuestas estructuradas y disposición confirmada para sede Buga.',
  resumenPreLo: '{name} presenta conocimiento básico de RRHH con menor profundidad en nómina autónoma y gestión de clima en entornos complejos.',
  noNegP: [
    { label: 'Profesional en área de RRHH + manejo de nómina', evHi: 'Psicóloga con 3 años en TH. Maneja Siigo y ha liquidado prestaciones con autonomía completa en empresa de 200+ empleados.', evLo: 'En proceso de formación; sin manejo real de nómina ni liquidaciones.' },
    { label: 'Experiencia ≥2 años en ciclo completo de RRHH', evHi: '3 años en selección, contratación, nómina y bienestar. Ciclo completo desde oferta hasta desvinculación.', evLo: 'Menos de 1 año de experiencia, principalmente en apoyo administrativo.' },
    { label: 'Gestión de clima organizacional y bienestar', evHi: 'Diseñó plan de bienestar con medición de clima (metodología Great Place to Work) obteniendo 85% de satisfacción.', evLo: 'Apoyo logístico en actividades de bienestar sin diseño ni medición formal.' },
    { label: 'Disponibilidad presencial en Buga', evHi: 'Vive en Buga. Disponibilidad inmediata para presencialidad completa en la sede.', evLo: 'Ubicada en Cali; evaluando viabilidad del traslado diario a Buga.' },
  ],
  plusHi: [
    'Experiencia previa en entidad del sistema de cajas de compensación o salud en Valle del Cauca',
    'Conocimiento de la reforma laboral 2024 y sus implicaciones en liquidaciones',
    'Capacidad de atención personalizada a colaboradores en contextos de sede regional con menos soporte',
  ],
  plusLo: ['Actitud de servicio genuina y vocación por el trabajo con personas'],
  insightHi: 'combina calidez en el trato con rigor administrativo en nómina. Perfil ideal para operar con autonomía en sede regional de Comfandi.',
  insightLo: 'presenta vocación por el trabajo con personas pero evidencia brechas en autonomía operativa y manejo técnico de nómina requeridos para Buga.',
  axes: [
    { axis: 'Orientación a las personas', ideal: 82, off: 0, sum: 'Vocación de servicio al colaborador en todas sus interacciones.', det: 'El cargo requiere contacto diario con colaboradores en situaciones de diversa complejidad. La capacidad de escuchar, contener y orientar define la calidad del servicio de TH en la sede Buga.' },
    { axis: 'Rigor administrativo', ideal: 78, off: -5, sum: 'Precisión en el manejo de nómina y procesos de contratación.', det: 'La gestión de nómina y novedades no admite errores. Combina calidez humana con meticulosidad en los procesos administrativos que impactan el bolsillo de los colaboradores.' },
    { axis: 'Autonomía en sede regional', ideal: 70, off: -8, sum: 'Disposición para operar con independencia lejos del soporte central.', det: 'Buga opera con menor soporte inmediato desde Cali. El Analista resuelve situaciones sin escalamiento frecuente, lo que requiere criterio propio y confianza en sus decisiones.' },
  ],
  radar: [
    { lbl: 'Iniciativa', off: -3 }, { lbl: 'Agente cambio', off: -5 }, { lbl: 'Proactividad', off: -2 },
    { lbl: 'Inteligencia Social', off: 6 }, { lbl: 'Autonomía', off: -4 }, { lbl: 'Agilidad', off: -3 },
    { lbl: 'Empatía', off: 8 }, { lbl: 'Orden y método', off: 5 }, { lbl: 'Servicio al usuario', off: 7 }, { lbl: 'Comunicación', off: 4 },
  ],
  v: [
    { title: 'Quién es conductualmente', body: 'Perfil con alta orientación a las personas y calidez en el trato. Trabaja con orden y meticulosidad en los procesos administrativos. Su vocación de servicio es su principal activo en una sede regional de Comfandi.' },
    { title: 'Fit con este rol', body: 'El cargo en Buga requiere autonomía, calidez y rigor en nómina — combinación que este perfil demuestra. La disposición para operar lejos del soporte central de Cali es el eje clave a confirmar.' },
  ],
  q: [
    { tag: 'Para: Gerente de Sede Buga', question: '"Cuéntame cómo manejaste una situación en que un colaborador tenía una novedad urgente de nómina que no podías resolver de inmediato. ¿Qué hiciste y cómo quedó?"', validates: 'Orientación a las personas y gestión de situaciones bajo presión operativa' },
    { tag: 'Para: RRHH', question: '"¿Tienes experiencia gestionando nómina de forma autónoma? ¿Qué software usas y cómo manejas el cierre de mes cuando hay novedades de último momento?"', validates: 'Competencia técnica en nómina y autonomía operativa' },
  ],
};

const thEnt: Candidate[] = [
  _gen(cfgTH, 'mcth-1',  'Carolina Agudelo',     81, _p(26,'women'), 'CA', _c(0), 'Buga',          '4 Años',  "$2'800.000", 'en_rango',       'entrevistas'),
  _gen(cfgTH, 'mcth-2',  'Sebastián Parra',      79, _p(26,'men'),   'SP', _c(1), 'Buga',          '3 Años',  "$3'000.000", 'en_rango',       'entrevistas'),
  _gen(cfgTH, 'mcth-3',  'Valentina Arango',     77, _p(27,'women'), 'VA', _c(2), 'Buga',          '3 Años',  "$2'900.000", 'en_rango',       'entrevistas'),
  _gen(cfgTH, 'mcth-4',  'Javier Lozano',        75, _p(27,'men'),   'JL', _c(3), 'Cali',          '4 Años',  "$3'000.000", 'en_rango',       'entrevistas'),
  _gen(cfgTH, 'mcth-5',  'Monica Correa',        73, _p(28,'women'), 'MC', _c(4), 'Buga',          '3 Años',  "$2'800.000", 'en_rango',       'entrevistas'),
  _gen(cfgTH, 'mcth-6',  'Pablo Vélez',          71, _p(28,'men'),   'PV', _c(0), 'Tuluá',         '3 Años',  "$3'200.000", 'fuera_de_rango', 'entrevistas'),
  _gen(cfgTH, 'mcth-7',  'Alejandra Gutiérrez',  69, _p(29,'women'), 'AG', _c(1), 'Buga',          '2 Años',  "$2'700.000", 'en_rango',       'entrevistas'),
  _gen(cfgTH, 'mcth-8',  'Simón Castaño',        67, _p(29,'men'),   'SC', _c(2), 'Cali',          '2 Años',  "$2'900.000", 'en_rango',       'entrevistas'),
];
const thPre: Candidate[] = [
  _gen(cfgTH, 'mcth-9',  'Pilar Hoyos',          64, _p(30,'women'), 'PH', _c(3), 'Buga',          '2 Años',  "$2'800.000", 'en_rango',       'prescreening'),
  _gen(cfgTH, 'mcth-10', 'David Escobar',        62, _p(30,'men'),   'DE', _c(4), 'Palmira',       '2 Años',  "$3'000.000", 'en_rango',       'prescreening'),
  _gen(cfgTH, 'mcth-11', 'Daniela Vargas',       60, _p(31,'women'), 'DV', _c(0), 'Buga',          '1 Año',   "$2'700.000", 'en_rango',       'prescreening'),
  _gen(cfgTH, 'mcth-12', 'Tomás Ríos',           58, _p(31,'men'),   'TR', _c(1), 'Cali',          '1 Año',   "$3'100.000", 'fuera_de_rango', 'prescreening'),
  _gen(cfgTH, 'mcth-13', 'Marcela Bermúdez',     56, _p(32,'women'), 'MB', _c(2), 'Buga',          '1 Año',   "$2'800.000", 'en_rango',       'prescreening'),
  _gen(cfgTH, 'mcth-14', 'Andrés Cano',          54, _p(32,'men'),   'AC', _c(3), 'Cartago',       '2 Años',  "$2'900.000", 'en_rango',       'prescreening'),
  _gen(cfgTH, 'mcth-15', 'Juliana Zapata',       52, _p(33,'women'), 'JZ', _c(4), 'Buga',          '1 Año',   "$2'700.000", 'en_rango',       'prescreening'),
];
const thScore: Candidate[] = [
  _gen(cfgTH, 'mcth-16', 'Óscar Morales',        50, _p(33,'men'),   'OM', _c(0), 'Cali',          '1 Año',           "$3'000.000", 'en_rango'),
  _gen(cfgTH, 'mcth-17', 'Stefanía Ochoa',       49, _p(34,'women'), 'SO', _c(1), 'Buga',          '1 Año',           "$2'800.000", 'en_rango'),
  _gen(cfgTH, 'mcth-18', 'Germán Pérez',         48, _p(34,'men'),   'GP', _c(2), 'Tuluá',         '1 Año',           "$2'900.000", 'en_rango'),
  _gen(cfgTH, 'mcth-19', 'Lina Giraldo',         47, _p(35,'women'), 'LG', _c(3), 'Buga',          '1 Año',           "$2'700.000", 'en_rango'),
  _gen(cfgTH, 'mcth-20', 'Carlos Rodríguez',     46, _p(35,'men'),   'CR', _c(4), 'Palmira',       '1 Año',           "$3'200.000", 'fuera_de_rango'),
  _gen(cfgTH, 'mcth-21', 'Margarita Rincón',     45, _p(36,'women'), 'MR', _c(0), 'Cali',          'Sin experiencia', "$2'800.000", 'en_rango'),
  _gen(cfgTH, 'mcth-22', 'Alberto Torres',       44, _p(36,'men'),   'AT', _c(1), 'Buga',          'Sin experiencia', "$2'600.000", 'en_rango'),
  _gen(cfgTH, 'mcth-23', 'Fernanda Salazar',     43, _p(37,'women'), 'FS', _c(2), 'Cali',          'Sin experiencia', "$3'000.000", 'en_rango'),
  _gen(cfgTH, 'mcth-24', 'Edgar Medina',         42, _p(37,'men'),   'EM', _c(3), 'Tuluá',         'Sin experiencia', "$2'800.000", 'en_rango'),
  _gen(cfgTH, 'mcth-25', 'Silvia González',      41, _p(38,'women'), 'SG', _c(4), 'Buga',          'Sin experiencia', "$2'700.000", 'en_rango'),
  _gen(cfgTH, 'mcth-26', 'Manuel Castro',        40, _p(38,'men'),   'MC', _c(0), 'Cali',          'Sin experiencia', "$3'100.000", 'fuera_de_rango'),
  _gen(cfgTH, 'mcth-27', 'Yolanda Herrera',      39, _p(39,'women'), 'YH', _c(1), 'Buga',          'Sin experiencia', "$2'600.000", 'en_rango'),
  _gen(cfgTH, 'mcth-28', 'Iván Durán',           38, _p(39,'men'),   'ID', _c(2), 'Palmira',       'Sin experiencia', "$2'800.000", 'en_rango'),
  _gen(cfgTH, 'mcth-29', 'Natalia López',        37, _p(40,'women'), 'NL', _c(3), 'Cali',          'Sin experiencia', "$2'900.000", 'en_rango'),
  _gen(cfgTH, 'mcth-30', 'Ernesto Sánchez',      36, _p(40,'men'),   'ES', _c(4), 'Buga',          'Sin experiencia', "$2'700.000", 'en_rango'),
  _gen(cfgTH, 'mcth-31', 'Patricia Jiménez',     35, _p(41,'women'), 'PJ', _c(0), 'Tuluá',         'Sin experiencia', "$3'200.000", 'fuera_de_rango'),
  _gen(cfgTH, 'mcth-32', 'Rafael Ramírez',       34, _p(41,'men'),   'RR', _c(1), 'Buga',          'Sin experiencia', "$2'600.000", 'en_rango'),
  _gen(cfgTH, 'mcth-33', 'Ana Milena Suárez',    33, _p(42,'women'), 'AS', _c(2), 'Cali',          'Sin experiencia', "$2'800.000", 'en_rango'),
  _gen(cfgTH, 'mcth-34', 'Guillermo Vargas',     32, _p(42,'men'),   'GV', _c(3), 'Palmira',       'Sin experiencia', "$2'900.000", 'en_rango'),
  _gen(cfgTH, 'mcth-35', 'Esperanza Cárdenas',   31, _p(43,'women'), 'EC', _c(4), 'Buga',          'Sin experiencia', "$2'700.000", 'en_rango'),
  _gen(cfgTH, 'mcth-36', 'Hugo Aguilar',         30, _p(43,'men'),   'HA', _c(0), 'Cali',          'Sin experiencia', "$3'000.000", 'en_rango'),
  _gen(cfgTH, 'mcth-37', 'Blanca Nieto',         29, _p(44,'women'), 'BN', _c(1), 'Buga',          'Sin experiencia', "$2'600.000", 'en_rango'),
  _gen(cfgTH, 'mcth-38', 'Rodrigo Flores',       28, _p(44,'men'),   'RF', _c(2), 'Tuluá',         'Sin experiencia', "$2'800.000", 'en_rango'),
  _gen(cfgTH, 'mcth-39', 'Consuelo Patiño',      27, _p(45,'women'), 'CP', _c(3), 'Cali',          'Sin experiencia', "$3'300.000", 'fuera_de_rango'),
  _gen(cfgTH, 'mcth-40', 'Nicolás Cardona',      26, _p(45,'men'),   'NC', _c(4), 'Buga',          'Sin experiencia', "$2'700.000", 'en_rango'),
  _gen(cfgTH, 'mcth-41', 'Ligia Vásquez',        25, _p(46,'women'), 'LV', _c(0), 'Palmira',       'Sin experiencia', "$2'600.000", 'en_rango'),
  _gen(cfgTH, 'mcth-42', 'Arturo Montoya',       24, _p(46,'men'),   'AM', _c(1), 'Cali',          'Sin experiencia', "$2'800.000", 'en_rango'),
  _gen(cfgTH, 'mcth-43', 'Rosario Guerrero',     23, _p(47,'women'), 'RG', _c(2), 'Buga',          'Sin experiencia', "$2'900.000", 'en_rango'),
  _gen(cfgTH, 'mcth-44', 'César Estrada',        22, _p(47,'men'),   'CE', _c(3), 'Tuluá',         'Sin experiencia', "$2'700.000", 'en_rango'),
  _gen(cfgTH, 'mcth-45', 'Amparo Botero',        21, _p(48,'women'), 'AB', _c(4), 'Cali',          'Sin experiencia', "$3'000.000", 'en_rango'),
  _gen(cfgTH, 'mcth-46', 'Orlando Puerta',       20, _p(48,'men'),   'OP', _c(0), 'Buga',          'Sin experiencia', "$2'600.000", 'en_rango'),
  _gen(cfgTH, 'mcth-47', 'Piedad Arenas',        19, _p(49,'women'), 'PA', _c(1), 'Palmira',       'Sin experiencia', "$2'800.000", 'en_rango'),
  _gen(cfgTH, 'mcth-48', 'Bernardo Moreno',      18, _p(49,'men'),   'BM', _c(2), 'Cali',          'Sin experiencia', "$3'200.000", 'fuera_de_rango'),
  _gen(cfgTH, 'mcth-49', 'Elisa Cuevas',         17, _p(50,'women'), 'EC', _c(3), 'Buga',          'Sin experiencia', "$2'600.000", 'en_rango'),
  _gen(cfgTH, 'mcth-50', 'Arturo Espinosa',      16, _p(50,'men'),   'AE', _c(4), 'Tuluá',         'Sin experiencia', "$2'800.000", 'en_rango'),
];

// ══════════════════════════════════════════════════════════════════════════════
// VACANTE 3 — ODONTOPEDIATRA
// Comfandi | Cali | Pipeline: Pre-screening (showcase)
// ══════════════════════════════════════════════════════════════════════════════
const cfgOD: VConfig = {
  role: 'Odontopediatra',
  sector: 'Salud Oral / Pediatría',
  budget: "$2'500.000",
  bio: 'Odontólogo con especialización en Odontopediatría y tarjeta profesional vigente. Experiencia en diagnóstico, tratamiento preventivo y correctivo en población infantil dentro de la red de salud oral.',
  superpoder: '"Brinda atención oral preventiva a la primera infancia con enfoque familiar"',
  noNegS: [
    { label: 'Título en Odontología + especialización en Odontopediatría', threshold: 78 },
    { label: 'Tarjeta profesional vigente y registro RETHUS activo', threshold: 72 },
    { label: 'Experiencia en atención pediátrica (0–15 años)', threshold: 66 },
    { label: 'Disponibilidad para contrato Obra o Labor, medio tiempo en Cali', threshold: 60 },
  ],
  logrosHi: [
    'Atendió 25+ pacientes pediátricos semanales con 97% de satisfacción de padres en encuesta de IPS',
    'Implementó programa de sellantes preventivos que redujo incidencia de caries en 30% en grupo 3–5 años',
    'Condujo talleres de salud oral para 80+ padres de familia vinculados a programa de primera infancia',
  ],
  logrosMd: [
    'Consulta externa pediátrica con manejo de técnicas de adaptación conductual (Tell-Show-Do)',
    'Participación en brigadas de salud oral en comunidades escolares del Valle del Cauca',
  ],
  logrosLo: 'Atención odontológica general sin especialización en población pediátrica ni trabajo preventivo comunitario.',
  senalesHi: ['Confirmar disponibilidad exclusiva para medio tiempo en Comfandi', 'Validar expectativa salarial coherente con cargo de medio tiempo'],
  senalesMd: ['Confirmar manejo de técnicas de adaptación conductual certificadas', 'Validar actualización en protocolo de fluorización y sellantes vigente 2024'],
  senalesLo: ['Sin especialización en odontopediatría: no cumple requisito mínimo del cargo', 'Experiencia exclusiva en adultos sin transferibilidad a población pediátrica'],
  jobs: [
    { c: 'IPS Colsanitas Cali', r: 'Odontopediatra de Consulta Externa', d: '02/2025' },
    { c: 'Clínica Dental San Fernando', r: 'Especialista en Odontopediatría', d: '08/2024' },
    { c: 'Comfenalco Valle — Red de Salud Oral', r: 'Odontopediatra MT', d: '04/2024' },
    { c: 'Liga Colombiana contra el Cáncer', r: 'Odontóloga de Brigadas Pediátricas', d: '10/2023' },
    { c: 'Clínica Odontológica UNAB Cali', r: 'Docente–Asistente Odontopediatría', d: '05/2023' },
  ],
  resumenPreHi: '{name} demuestra dominio clínico en odontopediatría con técnicas de adaptación conductual certificadas y casos verificables de atención preventiva. Comunicación efectiva con padres y disponibilidad para medio tiempo.',
  resumenPreLo: '{name} presenta formación odontológica básica con menor profundidad en manejo pediátrico y disponibilidad para las condiciones del cargo.',
  noNegP: [
    { label: 'Especialización Odontopediatría + RETHUS vigente', evHi: 'Odontopediatra graduada U. del Valle. RETHUS vigente. Habilitada ante SDS Cali para consulta pediátrica.', evLo: 'Odontólogo general sin especialización. No habilitado para atención pediátrica especializada.' },
    { label: 'Experiencia en atención pediátrica 0–15 años', evHi: '4 años de consulta exclusiva pediátrica en IPS. Manejo de pacientes desde 6 meses de edad.', evLo: 'Atención pediátrica ocasional dentro de consulta odontológica general sin protocolo específico.' },
    { label: 'Técnicas de adaptación conductual certificadas', evHi: 'Certificada en Tell-Show-Do, control de voz y sedación consciente con óxido nitroso.', evLo: 'Manejo básico de pacientes pediátricos sin certificación específica en adaptación conductual.' },
    { label: 'Disponibilidad contrato Obra o Labor, medio tiempo Cali', evHi: 'Disponible para medio tiempo. Sin compromisos exclusivos con otra IPS en el horario ofrecido.', evLo: 'Busca dedicación completa; el medio tiempo no se alinea con sus expectativas de vinculación.' },
  ],
  plusHi: [
    'Experiencia en programas preventivos escolares y comunitarios en red pública de salud',
    'Dominio de protocolos de atención pediátrica bajo lineamientos OPS/OMS vigentes',
    'Habilidad comunicativa con padres y cuidadores para adherencia al tratamiento',
  ],
  plusLo: ['Vocación genuina por la atención infantil y empatía natural con niños y familias'],
  insightHi: 'combina vocación clínica pediátrica con meticulosidad técnica y calidad en la comunicación con familias. Perfil natural para la red de salud oral de Comfandi.',
  insightLo: 'muestra actitud positiva hacia la atención infantil pero evidencia brechas técnicas y de certificación para el nivel especializado requerido.',
  axes: [
    { axis: 'Vocación clínica pediátrica', ideal: 85, off: 0, sum: 'Orientación genuina al cuidado de la primera infancia.', det: 'El trato con niños en contexto clínico requiere paciencia, creatividad y técnica combinadas. La vocación es el predictor más confiable del desempeño sostenido en este rol.' },
    { axis: 'Gestión emocional del paciente', ideal: 80, off: -5, sum: 'Capacidad de manejar ansiedad y rechazo en niños y padres.', det: 'La consulta pediátrica es de alta carga emocional. El profesional regula la situación del niño, del padre y la propia, manteniendo la calidad técnica del procedimiento.' },
    { axis: 'Enfoque preventivo', ideal: 75, off: -8, sum: 'Proyecta valor a largo plazo más allá de la intervención correctiva.', det: 'La misión de Comfandi en salud oral es preventiva. El Odontopediatra genera impacto comunitario, no solo resuelve el evento agudo del paciente.' },
  ],
  radar: [
    { lbl: 'Iniciativa', off: -4 }, { lbl: 'P. Crítico', off: 2 }, { lbl: 'Proactividad', off: -2 },
    { lbl: 'Precisión', off: 6 }, { lbl: 'Orden y método', off: 4 }, { lbl: 'Empatía', off: 9 },
    { lbl: 'Paciencia', off: 8 }, { lbl: 'Autonomía', off: -3 }, { lbl: 'Agilidad', off: -5 }, { lbl: 'Inteligencia Social', off: 3 },
  ],
  v: [
    { title: 'Quién es conductualmente', body: 'Perfil con alta vocación de servicio a la infancia y excelente regulación emocional. Combina meticulosidad clínica con calidez en el trato. Es el tipo de profesional que niños y padres recuerdan con gratitud.' },
    { title: 'Fit con este rol', body: 'El rol en la red Comfandi requiere precisión técnica + vocación pediátrica + comunicación efectiva con familias. La disponibilidad para contrato MT es el único punto práctico a confirmar antes de avanzar.' },
  ],
  q: [
    { tag: 'Para: Directora de Salud Comfandi', question: '"Describe un caso en que un niño llegó muy ansioso y rechazaba el tratamiento. ¿Qué técnica aplicaste y cómo terminó la consulta?"', validates: 'Vocación clínica y gestión emocional en pacientes pediátricos' },
    { tag: 'Para: RRHH', question: '"¿Cuáles son tus condiciones de disponibilidad para el cargo? ¿Tienes exclusividad posible para medio tiempo en Comfandi?"', validates: 'Compatibilidad práctica con las condiciones del cargo' },
  ],
};

const odPre: Candidate[] = [
  _gen(cfgOD, 'mcod-1',  'Laura Ortiz',           74, _p(1,'women'),  'LO', _c(0), 'Cali',          '5 Años',  "$2'300.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-2',  'Camilo Restrepo',       72, _p(1,'men'),    'CR', _c(1), 'Cali',          '4 Años',  "$2'500.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-3',  'Daniela Patiño',        70, _p(2,'women'),  'DP', _c(2), 'Cali',          '4 Años',  "$2'400.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-4',  'Felipe Guerrero',       68, _p(2,'men'),    'FG', _c(3), 'Cali',          '3 Años',  "$2'300.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-5',  'Natalia Espinosa',      66, _p(3,'women'),  'NE', _c(4), 'Cali',          '3 Años',  "$2'600.000", 'fuera_de_rango', 'prescreening'),
  _gen(cfgOD, 'mcod-6',  'Andrés Muñoz',          64, _p(3,'men'),    'AM', _c(0), 'Cali',          '3 Años',  "$2'400.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-7',  'Carolina Cortés',       62, _p(4,'women'),  'CC', _c(1), 'Cali',          '2 Años',  "$2'300.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-8',  'David Arenas',          60, _p(4,'men'),    'DA', _c(2), 'Cali',          '2 Años',  "$2'500.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-9',  'Juliana Cardona',       59, _p(5,'women'),  'JC', _c(3), 'Medellín',      '3 Años',  "$2'800.000", 'fuera_de_rango', 'prescreening'),
  _gen(cfgOD, 'mcod-10', 'Juan Medina',           58, _p(5,'men'),    'JM', _c(4), 'Cali',          '2 Años',  "$2'400.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-11', 'Sofía Herrera',         57, _p(6,'women'),  'SH', _c(0), 'Cali',          '1 Año',   "$2'300.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-12', 'Miguel Zapata',         56, _p(6,'men'),    'MZ', _c(1), 'Bogotá',        '2 Años',  "$2'600.000", 'fuera_de_rango', 'prescreening'),
  _gen(cfgOD, 'mcod-13', 'Valentina Torres',      55, _p(7,'women'),  'VT', _c(2), 'Cali',          '1 Año',   "$2'400.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-14', 'Pablo Castro',          54, _p(7,'men'),    'PC', _c(3), 'Cali',          '1 Año',   "$2'300.000", 'en_rango',       'prescreening'),
  _gen(cfgOD, 'mcod-15', 'Ana Lucía Morales',     53, _p(8,'women'),  'AL', _c(4), 'Pereira',       '2 Años',  "$2'700.000", 'fuera_de_rango', 'prescreening'),
];
const odScore: Candidate[] = [
  _gen(cfgOD, 'mcod-16', 'Santiago Gutiérrez',   52, _p(8,'men'),    'SG', _c(0), 'Cali',          '2 Años',          "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-17', 'Jimena López',         51, _p(9,'women'),  'JL', _c(1), 'Cali',          '1 Año',           "$2'400.000", 'en_rango'),
  _gen(cfgOD, 'mcod-18', 'César Agudelo',        50, _p(9,'men'),    'CA', _c(2), 'Bogotá',        '1 Año',           "$2'600.000", 'fuera_de_rango'),
  _gen(cfgOD, 'mcod-19', 'Paola Jiménez',        49, _p(10,'women'), 'PJ', _c(3), 'Cali',          '1 Año',           "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-20', 'Carlos Vásquez',       48, _p(10,'men'),   'CV', _c(4), 'Medellín',      '1 Año',           "$2'500.000", 'en_rango'),
  _gen(cfgOD, 'mcod-21', 'Marcela Ramírez',      47, _p(11,'women'), 'MR', _c(0), 'Cali',          '1 Año',           "$2'400.000", 'en_rango'),
  _gen(cfgOD, 'mcod-22', 'Rodrigo Soto',         46, _p(11,'men'),   'RS', _c(1), 'Cali',          'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-23', 'Gloria Suárez',        45, _p(12,'women'), 'GS', _c(2), 'Pereira',       'Sin experiencia', "$2'600.000", 'fuera_de_rango'),
  _gen(cfgOD, 'mcod-24', 'Eduardo Cárdenas',     44, _p(12,'men'),   'EC', _c(3), 'Cali',          'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-25', 'Diana Flórez',         43, _p(13,'women'), 'DF', _c(4), 'Cali',          'Sin experiencia', "$2'400.000", 'en_rango'),
  _gen(cfgOD, 'mcod-26', 'Alejandro Montoya',    42, _p(13,'men'),   'AM', _c(0), 'Bogotá',        'Sin experiencia', "$2'500.000", 'en_rango'),
  _gen(cfgOD, 'mcod-27', 'Pilar Reyes',          41, _p(14,'women'), 'PR', _c(1), 'Cali',          'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-28', 'Manuel Correa',        40, _p(14,'men'),   'MC', _c(2), 'Cali',          'Sin experiencia', "$2'700.000", 'fuera_de_rango'),
  _gen(cfgOD, 'mcod-29', 'Beatriz Ríos',         39, _p(15,'women'), 'BR', _c(3), 'Pereira',       'Sin experiencia', "$2'400.000", 'en_rango'),
  _gen(cfgOD, 'mcod-30', 'Tomás García',         38, _p(15,'men'),   'TG', _c(4), 'Cali',          'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-31', 'Esperanza Vargas',     37, _p(16,'women'), 'EV', _c(0), 'Cali',          'Sin experiencia', "$2'500.000", 'en_rango'),
  _gen(cfgOD, 'mcod-32', 'Iván Ospina',          36, _p(16,'men'),   'IO', _c(1), 'Bogotá',        'Sin experiencia', "$2'600.000", 'fuera_de_rango'),
  _gen(cfgOD, 'mcod-33', 'Claudia Botero',       35, _p(17,'women'), 'CB', _c(2), 'Cali',          'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-34', 'Nelson Herrera',       34, _p(17,'men'),   'NH', _c(3), 'Cali',          'Sin experiencia', "$2'400.000", 'en_rango'),
  _gen(cfgOD, 'mcod-35', 'Rosa Pinzón',          33, _p(18,'women'), 'RP', _c(4), 'Pereira',       'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-36', 'Hernán Mora',          32, _p(18,'men'),   'HM', _c(0), 'Cali',          'Sin experiencia', "$2'700.000", 'fuera_de_rango'),
  _gen(cfgOD, 'mcod-37', 'Adriana Salazar',      31, _p(19,'women'), 'AS', _c(1), 'Cali',          'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-38', 'Pedro González',       30, _p(19,'men'),   'PG', _c(2), 'Bogotá',        'Sin experiencia', "$2'400.000", 'en_rango'),
  _gen(cfgOD, 'mcod-39', 'Yolanda Rueda',        29, _p(20,'women'), 'YR', _c(3), 'Cali',          'Sin experiencia', "$2'500.000", 'en_rango'),
  _gen(cfgOD, 'mcod-40', 'Arturo Muñoz',         28, _p(20,'men'),   'AM', _c(4), 'Cali',          'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-41', 'Silvia Estrada',       27, _p(21,'women'), 'SE', _c(0), 'Pereira',       'Sin experiencia', "$2'600.000", 'fuera_de_rango'),
  _gen(cfgOD, 'mcod-42', 'Bernardo Nieto',       26, _p(21,'men'),   'BN', _c(1), 'Cali',          'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-43', 'Elisa Castaño',        25, _p(22,'women'), 'EC', _c(2), 'Cali',          'Sin experiencia', "$2'400.000", 'en_rango'),
  _gen(cfgOD, 'mcod-44', 'Guillermo Arango',     24, _p(22,'men'),   'GA', _c(3), 'Bogotá',        'Sin experiencia', "$2'500.000", 'en_rango'),
  _gen(cfgOD, 'mcod-45', 'Ligia Oquendo',        23, _p(23,'women'), 'LO', _c(4), 'Cali',          'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-46', 'Rafael Cano',          22, _p(23,'men'),   'RC', _c(0), 'Cali',          'Sin experiencia', "$2'700.000", 'fuera_de_rango'),
  _gen(cfgOD, 'mcod-47', 'Piedad Vélez',         21, _p(24,'women'), 'PV', _c(1), 'Pereira',       'Sin experiencia', "$2'300.000", 'en_rango'),
  _gen(cfgOD, 'mcod-48', 'Ernesto Leal',         20, _p(24,'men'),   'EL', _c(2), 'Cali',          'Sin experiencia', "$2'400.000", 'en_rango'),
  _gen(cfgOD, 'mcod-49', 'Consuelo Bueno',       19, _p(25,'women'), 'CB', _c(3), 'Cali',          'Sin experiencia', "$2'500.000", 'en_rango'),
  _gen(cfgOD, 'mcod-50', 'Oscar Duarte',         18, _p(25,'men'),   'OD', _c(4), 'Bogotá',        'Sin experiencia', "$2'800.000", 'fuera_de_rango'),
];

// ══════════════════════════════════════════════════════════════════════════════
// VACANTE 4 — BUSINESS DEVELOPMENT MANAGER
// Comfandi | Cali | Pipeline: Finalistas (showcase)
// ══════════════════════════════════════════════════════════════════════════════
const cfgBDM: VConfig = {
  role: 'Business Development Manager',
  sector: 'Comercial / Desarrollo de Negocios',
  budget: "$3'500.000",
  bio: 'Business Development Manager con experiencia en venta consultiva de servicios B2B, prospección de clientes corporativos y gestión de cuentas estratégicas en el sector empresarial.',
  superpoder: '"Convierte conversaciones en alianzas comerciales de largo plazo con empresas afiliadas"',
  noNegS: [
    { label: 'Perfil comercial con experiencia en venta consultiva B2B', threshold: 78 },
    { label: 'Historial documentado de captación de clientes y cierre de acuerdos', threshold: 72 },
    { label: 'Manejo de CRM (HubSpot, Salesforce o equivalente)', threshold: 66 },
    { label: 'Disponibilidad presencial en Cali con visitas frecuentes a clientes', threshold: 60 },
  ],
  logrosHi: [
    'Captó 15 empresas afiliadas nuevas en 6 meses, superando meta en 125% y generando $180M en ingresos adicionales',
    'Creció cartera de cuentas activas en 35% mediante estrategia de up-selling en servicios de bienestar y salud',
    'Cerró acuerdo corporativo con empresa de 300+ trabajadores: el mayor contrato de la regional en 2 años',
  ],
  logrosMd: [
    'Prospectó y cerró 8 cuentas corporativas en el año superando meta individual de captación',
    'Gestionó portafolio de 40+ empresas con seguimiento de renovación y satisfacción trimestral',
  ],
  logrosLo: 'Gestión comercial básica sin métricas documentadas de cierre ni evidencia de captación de cuentas nuevas.',
  senalesHi: ['Confirmar conocimiento del modelo de servicios de las cajas de compensación vs. venta de producto', 'Validar red de contactos activa en el sector empresarial del Valle del Cauca'],
  senalesMd: ['Validar experiencia en cierre real vs. solo gestión de pipeline', 'Confirmar manejo de CRM con métricas verificables de conversión'],
  senalesLo: ['Sin experiencia documentada en venta consultiva B2B', 'Perfil con riesgo de tiempo de rampa muy elevado para el cargo'],
  jobs: [
    { c: 'Cámara de Comercio de Cali', r: 'Ejecutivo de Desarrollo Empresarial', d: '01/2025' },
    { c: 'Seguros Bolívar — Empresas', r: 'Gerente de Cuenta Corporativa', d: '07/2024' },
    { c: 'Claro Empresas Colombia', r: 'Business Development Executive', d: '03/2024' },
    { c: 'ManpowerGroup Colombia', r: 'Consultor Comercial B2B', d: '09/2023' },
    { c: 'Grupo Empresarial Colombina', r: 'Ejecutivo de Alianzas Estratégicas', d: '05/2023' },
  ],
  resumenPreHi: '{name} demuestra trayectoria comercial sólida en B2B con cierre documentado de cuentas corporativas y conocimiento del modelo de servicios para empresas. Comunicación consultiva y red activa en el Valle del Cauca.',
  resumenPreLo: '{name} presenta orientación comercial básica con menor profundidad en venta consultiva y gestión de cuentas corporativas de alto valor.',
  noNegP: [
    { label: 'Venta consultiva B2B + historial de cierre documentado', evHi: '5 años en ventas B2B. Cierre de 12+ contratos corporativos en el último año con métricas verificables en CRM.', evLo: 'Experiencia en gestión de clientes pero sin métricas claras ni pipeline documentado.' },
    { label: 'Red de contactos empresariales en el Valle del Cauca', evHi: 'Red activa de 200+ contactos en RRHH y gerencia general de empresas del Valle. Referidos verificables.', evLo: 'Red limitada a contactos personales; sin foco en decisores empresariales de la región.' },
    { label: 'Manejo de CRM (HubSpot, Salesforce o equivalente)', evHi: 'Usuario avanzado HubSpot. Configuró pipeline con etapas de seguimiento y reporting semanal para equipo.', evLo: 'Gestiona contactos en Excel; no ha usado CRM estructurado en procesos de venta.' },
    { label: 'Conocimiento del portafolio de servicios de Comfandi', evHi: 'Conoce el modelo de cajas de compensación: salud, educación, recreación, crédito social y subsidio.', evLo: 'Desconoce el modelo específico de las cajas; confunde con EPS o entidades de seguros.' },
  ],
  plusHi: [
    'Experiencia vendiendo servicios de bienestar, salud o educación a gerentes de RRHH de empresas',
    'Dominio de metodologías de venta consultiva (SPIN Selling, Challenger Sale)',
    'Capacidad de gestionar ciclos de venta largos (2–4 meses) con múltiples tomadores de decisión',
  ],
  plusLo: ['Orientación natural al resultado y alta tolerancia al rechazo en proceso comercial'],
  insightHi: 'tiene el perfil comercial y el relacionamiento estratégico para crecer la base de empresas afiliadas de Comfandi. Su Drive y su red en el Valle son activos diferenciales.',
  insightLo: 'muestra motivación comercial pero evidencia brechas en manejo de ciclos de venta consultiva y conocimiento del modelo de cajas de compensación.',
  axes: [
    { axis: 'Drive comercial', ideal: 88, off: 0, sum: 'Orientación intensa al resultado y la captación de nuevos negocios.', det: 'El BDM opera con alta autonomía en Comfandi. Su motor interno de prospección y cierre define el resultado más que cualquier estructura de soporte comercial.' },
    { axis: 'Relacionamiento estratégico', ideal: 82, off: -4, sum: 'Construcción de vínculos de confianza con decisores corporativos.', det: 'La venta de servicios de bienestar requiere relaciones de largo plazo. Entrar al nivel de Gerente de RRHH y sostener la relación más allá del cierre es crítico para el modelo de Comfandi.' },
    { axis: 'Resiliencia al rechazo', ideal: 78, off: -6, sum: 'Capacidad de mantener el ritmo comercial ante ciclos largos.', det: 'La captación de empresas afiliadas tiene ciclos de 2–4 meses con múltiples decisores. El candidato sostiene la energía sin desengancharse ante la fricción del proceso.' },
  ],
  radar: [
    { lbl: 'Iniciativa', off: 4 }, { lbl: 'Agente cambio', off: -2 }, { lbl: 'Proactividad', off: 5 },
    { lbl: 'Inteligencia Social', off: -3 }, { lbl: 'Autonomía', off: 2 }, { lbl: 'Agilidad', off: -1 },
    { lbl: 'Persuasión', off: 7 }, { lbl: 'Liderazgo', off: 1 }, { lbl: 'P. Analítico', off: -4 }, { lbl: 'Resiliencia', off: 6 },
  ],
  v: [
    { title: 'Quién es conductualmente', body: 'Perfil con alta energía comercial y orientación natural al resultado. Construye relaciones con facilidad y cierra con convicción. Su motor intrínseco de prospección es su mayor activo diferencial.' },
    { title: 'Fit con este rol', body: 'El BDM de Comfandi necesita relacionamiento de largo plazo combinado con resultados de corto plazo. El conocimiento del modelo de cajas de compensación es la única curva de aprendizaje relevante.' },
  ],
  q: [
    { tag: 'Para: Gerente Comercial Comfandi', question: '"Cuéntame el proceso de venta más complejo que hayas cerrado. ¿Cuántos interlocutores tenía el cliente, cuánto duró el ciclo y cómo cerraste?"', validates: 'Drive comercial y estrategia de cierre en venta consultiva B2B' },
    { tag: 'Para: RRHH', question: '"¿Cómo te motivas en meses donde el pipeline está lento y los cierres no llegan? ¿Qué haces diferente para reactivar?"', validates: 'Resiliencia al rechazo y autonomía comercial bajo presión' },
  ],
};

const bdmFinal: Candidate[] = [
  _gen(cfgBDM, 'mcbdm-1',  'Valentina García',       93, _p(51,'women'), 'VG', _c(0), 'Cali',          '8 Años',  "$3'200.000", 'en_rango',       'evaluaciones'),
  _gen(cfgBDM, 'mcbdm-2',  'Juan Sebastián Morales', 91, _p(51,'men'),   'JM', _c(1), 'Cali',          '7 Años',  "$3'500.000", 'en_rango',       'evaluaciones'),
  _gen(cfgBDM, 'mcbdm-3',  'Ana Paola Herrera',      89, _p(52,'women'), 'AH', _c(2), 'Medellín',      '9 Años',  "$4'000.000", 'fuera_de_rango', 'evaluaciones'),
];
const bdmEval: Candidate[] = [
  _gen(cfgBDM, 'mcbdm-4',  'Carlos Alberto Jiménez', 86, _p(52,'men'),   'CJ', _c(3), 'Cali',          '7 Años',  "$3'300.000", 'en_rango',       'evaluaciones'),
  _gen(cfgBDM, 'mcbdm-5',  'Daniela Restrepo',       83, _p(53,'women'), 'DR', _c(4), 'Cali',          '6 Años',  "$3'500.000", 'en_rango',       'evaluaciones'),
];
const bdmEnt: Candidate[] = [
  _gen(cfgBDM, 'mcbdm-6',  'Felipe Alberto Torres',  81, _p(53,'men'),   'FT', _c(0), 'Cali',          '6 Años',  "$3'200.000", 'en_rango',       'entrevistas'),
  _gen(cfgBDM, 'mcbdm-7',  'Paula Andrea López',     79, _p(54,'women'), 'PL', _c(1), 'Cali',          '5 Años',  "$3'500.000", 'en_rango',       'entrevistas'),
  _gen(cfgBDM, 'mcbdm-8',  'Alejandro Vargas',       77, _p(54,'men'),   'AV', _c(2), 'Cali',          '6 Años',  "$4'000.000", 'fuera_de_rango', 'entrevistas'),
];
const bdmPre: Candidate[] = [
  _gen(cfgBDM, 'mcbdm-9',  'Natalia Cardona',        74, _p(55,'women'), 'NC', _c(3), 'Cali',          '5 Años',  "$3'200.000", 'en_rango',       'prescreening'),
  _gen(cfgBDM, 'mcbdm-10', 'Mauricio Salazar',       72, _p(55,'men'),   'MS', _c(4), 'Cali',          '5 Años',  "$3'500.000", 'en_rango',       'prescreening'),
  _gen(cfgBDM, 'mcbdm-11', 'María Isabel Guerrero',  70, _p(56,'women'), 'MG', _c(0), 'Cali',          '4 Años',  "$3'300.000", 'en_rango',       'prescreening'),
  _gen(cfgBDM, 'mcbdm-12', 'Diego Armando Ramírez',  68, _p(56,'men'),   'DR', _c(1), 'Bogotá',        '5 Años',  "$4'500.000", 'fuera_de_rango', 'prescreening'),
  _gen(cfgBDM, 'mcbdm-13', 'Claudia Patricia Castro',66, _p(57,'women'), 'CC', _c(2), 'Cali',          '4 Años',  "$3'200.000", 'en_rango',       'prescreening'),
  _gen(cfgBDM, 'mcbdm-14', 'Rodrigo Andrés Medina',  64, _p(57,'men'),   'RM', _c(3), 'Cali',          '4 Años',  "$3'500.000", 'en_rango',       'prescreening'),
  _gen(cfgBDM, 'mcbdm-15', 'Laura Cristina Suárez',  62, _p(58,'women'), 'LS', _c(4), 'Medellín',      '3 Años',  "$4'000.000", 'fuera_de_rango', 'prescreening'),
];
const bdmScore: Candidate[] = [
  _gen(cfgBDM, 'mcbdm-16', 'Andrés Felipe Arango',   58, _p(58,'men'),   'AA', _c(0), 'Cali',          '3 Años',          "$3'200.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-17', 'Sofía Elena Moreno',     56, _p(59,'women'), 'SM', _c(1), 'Cali',          '3 Años',          "$3'500.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-18', 'Juan Pablo Vásquez',     54, _p(59,'men'),   'JV', _c(2), 'Bogotá',        '3 Años',          "$4'000.000", 'fuera_de_rango'),
  _gen(cfgBDM, 'mcbdm-19', 'Marcela Elena Ospina',   52, _p(60,'women'), 'MO', _c(3), 'Cali',          '2 Años',          "$3'200.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-20', 'Pedro Andrés Flórez',    50, _p(60,'men'),   'PF', _c(4), 'Cali',          '3 Años',          "$3'500.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-21', 'Beatriz Cardona',        49, _p(61,'women'), 'BC', _c(0), 'Cali',          '2 Años',          "$3'300.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-22', 'Eduardo Felipe Cárdenas',48, _p(61,'men'),   'EC', _c(1), 'Medellín',      '3 Años',          "$4'500.000", 'fuera_de_rango'),
  _gen(cfgBDM, 'mcbdm-23', 'Diana Lucía García',     47, _p(62,'women'), 'DG', _c(2), 'Cali',          '2 Años',          "$3'200.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-24', 'Hernán Arturo Botero',   46, _p(62,'men'),   'HB', _c(3), 'Cali',          '2 Años',          "$3'500.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-25', 'Viviana Muñoz',          45, _p(63,'women'), 'VM', _c(4), 'Cali',          '2 Años',          "$3'300.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-26', 'Carlos Arturo Ríos',     44, _p(63,'men'),   'CR', _c(0), 'Bogotá',        '3 Años',          "$4'000.000", 'fuera_de_rango'),
  _gen(cfgBDM, 'mcbdm-27', 'Patricia Elena Pinto',   43, _p(64,'women'), 'PP', _c(1), 'Cali',          '1 Año',           "$3'200.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-28', 'Rodrigo Alberto Zapata', 42, _p(64,'men'),   'RZ', _c(2), 'Cali',          '2 Años',          "$3'500.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-29', 'Adriana Lorena Salinas', 41, _p(65,'women'), 'AS', _c(3), 'Cali',          '1 Año',           "$3'300.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-30', 'Manuel Antonio Torres',  40, _p(65,'men'),   'MT', _c(4), 'Medellín',      '2 Años',          "$4'500.000", 'fuera_de_rango'),
  _gen(cfgBDM, 'mcbdm-31', 'Gloria Patricia Morales',39, _p(66,'women'), 'GM', _c(0), 'Cali',          '1 Año',           "$3'200.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-32', 'Ramiro Arturo Ruiz',     38, _p(66,'men'),   'RR', _c(1), 'Cali',          '1 Año',           "$3'500.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-33', 'Amparo Cecilia Vargas',  37, _p(67,'women'), 'AV', _c(2), 'Cali',          '1 Año',           "$3'300.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-34', 'Nelson Alberto Herrera', 36, _p(67,'men'),   'NH', _c(3), 'Bogotá',        'Sin experiencia', "$4'000.000", 'fuera_de_rango'),
  _gen(cfgBDM, 'mcbdm-35', 'Silvia Marcela Ríos',    35, _p(68,'women'), 'SR', _c(4), 'Cali',          'Sin experiencia', "$3'200.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-36', 'Hugo Arturo López',      34, _p(68,'men'),   'HL', _c(0), 'Cali',          'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-37', 'Rosa Elena Jiménez',     33, _p(69,'women'), 'RJ', _c(1), 'Cali',          'Sin experiencia', "$3'300.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-38', 'Ernesto Andrés Medina',  32, _p(69,'men'),   'EM', _c(2), 'Medellín',      'Sin experiencia', "$4'500.000", 'fuera_de_rango'),
  _gen(cfgBDM, 'mcbdm-39', 'Consuelo Patricia García',31, _p(70,'women'),'CG', _c(3), 'Cali',          'Sin experiencia', "$3'200.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-40', 'Guillermo Arturo Montoya',30, _p(70,'men'),  'GM', _c(4), 'Cali',          'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-41', 'Pilar Elena Guerrero',   29, _p(71,'women'), 'PG', _c(0), 'Cali',          'Sin experiencia', "$3'300.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-42', 'Rafael Alberto Cano',    28, _p(71,'men'),   'RC', _c(1), 'Bogotá',        'Sin experiencia', "$4'000.000", 'fuera_de_rango'),
  _gen(cfgBDM, 'mcbdm-43', 'Blanca Inés Torres',     27, _p(72,'women'), 'BT', _c(2), 'Cali',          'Sin experiencia', "$3'200.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-44', 'Bernardo Andrés Herrera',26, _p(72,'men'),   'BH', _c(3), 'Cali',          'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-45', 'Elisa Marcela Vargas',   25, _p(73,'women'), 'EV', _c(4), 'Cali',          'Sin experiencia', "$3'300.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-46', 'Oscar Alberto Salazar',  24, _p(73,'men'),   'OS', _c(0), 'Medellín',      'Sin experiencia', "$4'500.000", 'fuera_de_rango'),
  _gen(cfgBDM, 'mcbdm-47', 'Ligia Elena Moreno',     23, _p(74,'women'), 'LM', _c(1), 'Cali',          'Sin experiencia', "$3'200.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-48', 'Mario Arturo Ramírez',   22, _p(74,'men'),   'MR', _c(2), 'Cali',          'Sin experiencia', "$3'500.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-49', 'Yolanda Patricia López', 21, _p(75,'women'), 'YL', _c(3), 'Cali',          'Sin experiencia', "$3'300.000", 'en_rango'),
  _gen(cfgBDM, 'mcbdm-50', 'César Arturo García',    20, _p(75,'men'),   'CG', _c(4), 'Bogotá',        'Sin experiencia', "$5'000.000", 'fuera_de_rango'),
];

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

export const COMFANDI_VACANTES: import('./mock').Vacante[] = [
  { id:'mock-comf-qf',         jobId:'mock-comf-qf',         status:'activa',   title:'Jefe de Control de Calidad',               area:['Salud','Calidad'],              priority:'alta',  progressLabel:'Evaluaciones',     progressPct:60, total:50,  activos:5,  fecha:'05 Ene 2025' },
  { id:'mock-comf-th',         jobId:'mock-comf-th',         status:'activa',   title:'Analista de Talento Humano — Buga',         area:['Talento Humano','RRHH'],        priority:'alta',  progressLabel:'Entrevistas',      progressPct:40, total:50,  activos:8,  fecha:'10 Ene 2025' },
  { id:'mock-comf-datos',      jobId:'mock-comf-datos',      status:'activa',   title:'Ingeniero de Datos',                        area:['Tecnología','Analytics'],       priority:'alta',  progressLabel:'Pre-screening IA', progressPct:20, total:42,  activos:15, fecha:'15 Ene 2025' },
  { id:'mock-comf-bigdata',    jobId:'mock-comf-bigdata',    status:'activa',   title:'Jefe de Big Data e Inteligencia Sectorial', area:['Analítica','Big Data'],         priority:'alta',  progressLabel:'Evaluaciones',     progressPct:60, total:50,  activos:5,  fecha:'20 Ene 2025' },
  { id:'mock-comf-odonto',     jobId:'mock-comf-odonto',     status:'activa',   title:'Odontopediatra (Medio Tiempo)',             area:['Salud','Pediatría'],            priority:'media', progressLabel:'Pre-screening IA', progressPct:20, total:50,  activos:15, fecha:'25 Ene 2025' },
  { id:'mock-comf-compras',    jobId:'mock-comf-compras',    status:'activa',   title:'Analista de Compras',                      area:['Compras','Supply Chain'],       priority:'media', progressLabel:'Scoring',          progressPct:10, total:38,  activos:38, fecha:'01 Feb 2025' },
  { id:'mock-comf-ingles',     jobId:'mock-comf-ingles',     status:'activa',   title:'Profesor(a) de Inglés — Tuluá',            area:['Educación','Bilingüismo'],      priority:'media', progressLabel:'Entrevistas',      progressPct:40, total:35,  activos:8,  fecha:'05 Feb 2025' },
  { id:'mock-comf-bdm',        jobId:'mock-comf-bdm',        status:'activa',   title:'Business Development Manager',             area:['Comercial','Negocios'],         priority:'alta',  progressLabel:'Finalistas',       progressPct:80, total:50,  activos:3,  fecha:'10 Feb 2025' },
  { id:'mock-comf-primaria',   jobId:'mock-comf-primaria',   status:'activa',   title:'Profesor(a) de Básica Primaria',           area:['Educación','Básica'],           priority:'baja',  progressLabel:'Scoring',          progressPct:10, total:28,  activos:28, fecha:'15 Feb 2025' },
  { id:'mock-comf-preescolar', jobId:'mock-comf-preescolar', status:'activa',   title:'Docente de Preescolar',                    area:['Educación','Primera Infancia'], priority:'baja',  progressLabel:'Scoring',          progressPct:10, total:22,  activos:22, fecha:'20 Feb 2025' },
  { id:'mock-comf-recreador',  jobId:'mock-comf-recreador',  status:'activa',   title:'Recreador(a) — Centro Vacacional Calima', area:['Recreación','Turismo'],         priority:'baja',  progressLabel:'Pre-screening IA', progressPct:20, total:45,  activos:15, fecha:'25 Feb 2025' },
  { id:'mock-comf-atraccion',  jobId:'mock-comf-atraccion',  status:'en_pausa', title:'Gestor de Atracción de Talento (Masivo)', area:['RRHH','Reclutamiento'],         priority:'media', progressLabel:'Entrevistas',      progressPct:40, total:30,  activos:8,  fecha:'01 Mar 2025' },
  { id:'mock-comf-dermato',    jobId:'mock-comf-dermato',    status:'activa',   title:'Médico Especialista en Dermatología',      area:['Salud','Dermatología'],         priority:'alta',  progressLabel:'Evaluaciones',     progressPct:60, total:25,  activos:5,  fecha:'05 Mar 2025' },
  { id:'mock-comf-seleccion',  jobId:'mock-comf-seleccion',  status:'cerrada',  title:'Analista de Selección',                    area:['RRHH','Selección'],             priority:'media', progressLabel:'Finalistas',       progressPct:80, total:32,  activos:3,  fecha:'10 Mar 2025' },
];

export const COMFANDI_DESCRIPTIONS: Record<string, string> = {
  'mock-comf-bigdata':
    'Comfandi busca un Jefe de Big Data e Inteligencia Sectorial para liderar la transformación analítica de la caja. Responsable de definir la estrategia de datos, conducir un equipo de ciencia de datos y convertir información sectorial en inteligencia de negocio para la toma de decisiones gerenciales y la mejora continua de los servicios a afiliados del suroccidente colombiano.',
  'mock-comf-th':
    'Comfandi requiere un Analista de Talento Humano para la sede Buga, enfocado en acompañar el ciclo de vida del colaborador con calidez y rigor. Apoya los procesos de nómina, gestión de clima y planes de bienestar para garantizar una experiencia positiva a los colaboradores de la regional en el Valle del Cauca.',
  'mock-comf-odonto':
    'Comfandi busca un Odontopediatra para su red de servicios de salud oral en Cali, a medio tiempo. El profesional atenderá población infantil con diagnóstico preventivo y correctivo, y educará a padres y cuidadores en hábitos de salud oral desde la primera infancia, en línea con la misión de bienestar integral de la caja.',
  'mock-comf-bdm':
    'Comfandi requiere un Business Development Manager para liderar la captación de nuevas empresas afiliadas a sus servicios en el Valle del Cauca. El cargo combina prospección activa, relacionamiento estratégico con gerentes de RRHH y cierre de acuerdos comerciales que amplíen la cobertura y el impacto social de la caja más grande del suroccidente colombiano.',
};

export function getComfandiPipelineStages(jobId: string): import('./mock').PipelineStage[] | null {
  const s = (id: string, label: string, badge: string, status: StageStatus, count: number, isAI: boolean): PipelineStage =>
    ({ id, label, stageBadge: badge, status, candidateCount: count, isAI, route: `/pipeline/${jobId}/${id}` });

  switch (jobId) {
    case 'mock-comf-bigdata':
      return [
        s('scoring',      'Scoring IA',       'Scoring',       'completed',    50, true),
        s('prescreening', 'Pre-entrevista IA', 'Pre screening', 'completed',    15, true),
        s('entrevistas',  'Entrevistas',       'Entrevistas',   'completed',     8, false),
        s('evaluaciones', 'Evaluaciones',      'Evaluaciones',  'in_progress',   5, false),
        s('finalistas',   'Finalistas',        'Finalistas',    'not_started',   0, false),
      ];
    case 'mock-comf-th':
      return [
        s('scoring',      'Scoring IA',       'Scoring',       'completed',    50, true),
        s('prescreening', 'Pre-entrevista IA', 'Pre screening', 'completed',    15, true),
        s('entrevistas',  'Entrevistas',       'Entrevistas',   'in_progress',   8, false),
        s('evaluaciones', 'Evaluaciones',      'Evaluaciones',  'not_started',   0, false),
        s('finalistas',   'Finalistas',        'Finalistas',    'not_started',   0, false),
      ];
    case 'mock-comf-odonto':
      return [
        s('scoring',      'Scoring IA',       'Scoring',       'completed',    50, true),
        s('prescreening', 'Pre-entrevista IA', 'Pre screening', 'in_progress',  15, true),
        s('entrevistas',  'Entrevistas',       'Entrevistas',   'not_started',   0, false),
        s('evaluaciones', 'Evaluaciones',      'Evaluaciones',  'not_started',   0, false),
        s('finalistas',   'Finalistas',        'Finalistas',    'not_started',   0, false),
      ];
    case 'mock-comf-bdm':
      return [
        s('scoring',      'Scoring IA',       'Scoring',       'completed',    50, true),
        s('prescreening', 'Pre-entrevista IA', 'Pre screening', 'completed',    15, true),
        s('entrevistas',  'Entrevistas',       'Entrevistas',   'completed',     8, false),
        s('evaluaciones', 'Evaluaciones',      'Evaluaciones',  'completed',     5, false),
        s('finalistas',   'Finalistas',        'Finalistas',    'in_progress',   3, false),
      ];
    default:
      return null;
  }
}

// Stage→candidates maps for the 4 showcase vacantes
export const COMFANDI_CANDIDATES_BY_STAGE: Record<string, Partial<Record<string, Candidate[]>>> = {
  'mock-comf-bigdata': {
    scoring:      [...bdFinal, ...bdEval, ...bdEnt, ...bdPre, ...bdScore],
    prescreening: [...bdFinal, ...bdEval, ...bdEnt, ...bdPre],
    entrevistas:  [...bdFinal, ...bdEval, ...bdEnt],
    evaluaciones: [...bdFinal, ...bdEval],
  },
  'mock-comf-th': {
    scoring:      [...thEnt, ...thPre, ...thScore],
    prescreening: [...thEnt, ...thPre],
    entrevistas:  thEnt,
  },
  'mock-comf-odonto': {
    scoring:      [...odPre, ...odScore],
    prescreening: odPre,
  },
  'mock-comf-bdm': {
    scoring:      [...bdmFinal, ...bdmEval, ...bdmEnt, ...bdmPre, ...bdmScore],
    prescreening: [...bdmFinal, ...bdmEval, ...bdmEnt, ...bdmPre],
    entrevistas:  [...bdmFinal, ...bdmEval, ...bdmEnt],
    evaluaciones: [...bdmFinal, ...bdmEval],
  },
};

export const COMFANDI_ALL_CANDIDATES: Candidate[] = [
  ...bdFinal, ...bdEval, ...bdEnt, ...bdPre, ...bdScore,
  ...thEnt, ...thPre, ...thScore,
  ...odPre, ...odScore,
  ...bdmFinal, ...bdmEval, ...bdmEnt, ...bdmPre, ...bdmScore,
];
