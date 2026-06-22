# Changelog — Unio B2B

> Historial de cambios del proyecto. Se actualiza automáticamente con cada commit.  
> Consulta este archivo en: `CHANGELOG.md` en la raíz del repositorio.

---

## [Sin commitear]

---

## [feat: mover Aprobados al final del pipeline + vista vertical] — 22 Jun 2026

### Pipeline y Sidebar — "Aprobados" al final

- Reordenar `STAGE_ORDER` en `Pipeline.tsx`: `estudios` (Validaciones) queda antes de `finalistas` (Aprobados)
- Refactorizar construcción de `stages` en `useMemo`: `finalistasCard` se extrae del array base y se reinserta al final, después de `estudiosCard`, para los tres paths (mock, API y fallback)
- Ampliar `gridTemplateColumns` a `repeat(6, 1fr)` y `maxWidth` a `1400px` para acomodar 6 tarjetas en una fila
- Reordenar `stageItems` en `Sidebar.tsx`: `estudios` antes de `finalistas`
- Agregar `estudios` al `STAGE_ORDER` en `useMockStageState.ts` para que `advanceCandidates` pueda avanzar desde `finalistas` → `estudios`

### CandidateList — Ruta finalistas → vista vertical

- Cambiar rutas `/pipeline/:jobId/finalistas`, `/pipeline/:jobId/process/:processId/finalistas` y `/finalistas` de `Shortlist` a `CandidateList` en `App.tsx`
- Añadir `'finalistas'` al `STAGE_ORDER` local de `CandidateList`
- Detectar etapa `finalistas` en `currentStage` desde `location.pathname`
- Agregar botón "Pasar a Validaciones" en WizardBar cuando `currentStage === 'finalistas'`
- Extender el botón "Solicitar docs. de ingreso" para que aparezca tanto en `finalistas` como en `estudios`

### Mock data

- Pre-seed 2 candidatos en `finalistas` para las vacantes `mock-transp-pub`, `mock-vigia` y `mock-distrib`

---

## [pendiente] — 21 Jun 2026

### Refactor: Fusionar tarjeta Scoring con Prescreening en Pipeline

- Actualizar `STAGE_META.prescreening` con label "Prescreening IA" y stageBadge "Prescreening"
- Añadir función helper `mergeScoring` que suma el candidateCount de scoring en prescreening y elimina scoring como tarjeta visible
- Aplicar `mergeScoring` en los tres paths de construcción de stages: API (`mapPhasesToStages`), mock (`getMockPipelineStages`) y fallback (`getPipelineStages`)
- `STAGE_ORDER` mantiene 'scoring' internamente para lógica de progreso; solo se filtra del render

---

## [2a02a2a] — 21 Jun 2026

### Fix: Duplicados y estado "Pendiente" en módulo Pruebas

- Eliminar candidatos de evaluaciones (d-e*, tp-e*, v-e*) de los arrays de scoring/prescreening/entrevistas — evita que aparezcan dos veces la misma persona en cada etapa
- Corregir `getMockPipelineStages` para mock-distrib y mock-vigia: usar `transpPipeline(20,10,5,3)` para que el pipeline muestre todas las etapas completadas correctamente
- Agregar método `seedStatuses` al `CandidateStatusContext` para aplicar statuses iniciales en un solo setState
- Importar y aplicar `MOCK_INITIAL_STATUSES` en `CandidateList.tsx` via `useEffect` — candidatos en Pruebas ahora muestran "Continúa" o "Por validar" en lugar de "Pendiente"
- Bump `STORAGE_VERSION` a v6 para limpiar localStorage desactualizado

---

## [b2ad114] — 28 May 2026

### Analytics & Reportes

- Crear `MainSidebar.tsx`: sidebar de navegación de primer nivel (Vacantes / Analytics) reutilizable en toda la app principal, con logout y "Reiniciar demo" en el footer
- Refactorizar `HomeVacantes`: reemplazar navbar horizontal por `MainSidebar` fijo a la izquierda + page header con botón "Crear Vacante"
- Crear `AnalyticsPage` (`/analytics`): vista interna completa con Filtros, Estado de Vacantes, Métricas Clave, Funnel de Candidatos (con tabs por canal + drop-off por no negociables), Eficiencia de Tiempo, KPI Hiring Manager y Detalle por Vacante
- Agregar ruta protegida `/analytics` en `App.tsx`



---

## [62a7820] — 12 May 2026

- Mapear no negociables del RCP en tarjetas de Finalistas: cada vacante Comfandi muestra los 4 requisitos reales del cargo
- Corregir navegación "Ver perfil" en Finalistas para vacantes Comfandi (gca-f1→gca-1, gcv-f1→gcv-1, etc.)

---

## [a1ae79e] — 12 May 2026

- Reestructurar candidatos Comfandi: 3 en Pruebas + 5 en Entrevistas + 22 shells por vacante (30 total c/u)
- Agregar datos de entrevistas (HR + HM feedback) para los 24 candidatos activos de las 3 vacantes
- Agregar prueba técnica pre-diligenciada para los 9 candidatos en etapa Pruebas
- Agregar 2 finalistas por vacante en mockFinalistCards (6 tarjetas nuevas)
- Actualizar DEFAULT_MOCK_PROGRESS a 'evaluaciones' para las 3 vacantes Comfandi (todos los stages desbloqueados)

---

## [e427ce7] — 11 May 2026

### Simulación pre-entrevista IA por WhatsApp
- **`WhatsAppPreEntrevistaModal.tsx`** (nuevo) — Modal de simulación de pre-entrevista estilo WhatsApp con Alex IA: vista de confirmación con lista de candidatos seleccionados, chat auto-play con indicador de escritura, 7 fases del guión adaptado (Apertura → Cierre), panel de progreso lateral y resultado final
- **`CandidateList.tsx`** — Nuevo botón verde "Iniciar pre-entrevista IA" (icono WhatsApp) en el WizardBar de selección masiva, solo visible en etapa Scoring IA
- **`CandidateOnepage.tsx`** — Nuevo botón "Lanzar pre-entrevista" en el WizardBar del perfil individual, visible en etapa Scoring

---

## [d92d607] — 11 May 2026

### Módulo "Pruebas" + Validación de Antecedentes en pipeline
- **`Pipeline.tsx`, `mock.ts`, `mock-comfandi.ts`, `Sidebar.tsx`** — Renombrado el módulo/etapa "Evaluaciones" → "Pruebas" en todos los labels de display (el ID interno `evaluaciones` no cambia)
- **`ValidacionAntecedentes.tsx`** (nuevo) — Componente con tabla de 10 fuentes de antecedentes (categorías Alto/Medio), score mock calculado automáticamente (–10 pts por Alto, –5 pts por Medio) y banner de riesgo color-coded
- **`CandidateOnepage.tsx`** — Nueva sección 6 "Validación de Antecedentes" dentro del módulo Pruebas; se activa cuando el candidato está en etapa evaluaciones/pruebas; muestra tabla completa y score 10/100 "Riesgo Muy Alto"

---

## [pendiente] — 11 May 2026

### Vacantes reales Comfandi
- **`mock-comfandi.ts`** — Reemplazadas las 4 vacantes ficticias por 3 vacantes reales basadas en RCPs de Comfandi:
  - **Gestor(a) Comercial Convenios y Alianzas Crédito** (Medellín, COP 6M, pipeline en Entrevistas)
  - **Gestor(a) Calidad de Vida Crédito** (Cali, COP 4M, pipeline en Pre-screening IA)
  - **Científico(a) Comportamental** (Bogotá, COP 6M, pipeline en Evaluaciones)
- Cada vacante tiene 30 candidatos: 5 con perfil real completo (scoringAI, prescreeningAI, psychTest según etapa) y 25 shells en scoring para volumen de demo
- VConfig diseñados con datos reales de cada RCP: no-negociables, logros, señales, empresas, preguntas de entrevista y ejes conductuales

---

## [a58c5da] — 04 Abr 2026

### Datos mock para demos
- **`mock.ts`** — Añadidas 3 vacantes mock (`MOCK_VACANTES`: `mock-entrevistas`, `mock-pruebas`, `mock-finalistas`) para demos independientes de la API
- **`mock.ts`** — `getMockPipelineStages()`: stages distintos por vacante mock con estados realistas
- **`mock.ts`** — `mockCandidatesByStage` y `mockCandidatesById`: candidatos locales por jobId y stage para evitar llamadas de red en demos

### Hooks
- **`useVacantes.ts`** — Inyecta `MOCK_VACANTES` al final de la lista real; si la API falla, muestra los mocks igualmente
- **`useCandidateDetail.ts`** — Sirve candidatos mock localmente sin llamar a la API cuando el ID pertenece al catálogo mock

### Pipeline y navegación
- **`Pipeline.tsx`** — Usa `getMockPipelineStages` cuando `jobId` empieza con `mock-`; desbloquea Finalistas en el sidebar vía `setProgressStage`; búsqueda de vacante mejorada para cubrir `mock-` IDs
- **`CandidateList.tsx`** — Para flujos mock, usa `mockCandidatesByStage` en lugar de la API; loading y errores también se cortan
- **`Sidebar.tsx`** — Eliminada la bandera `FINALISTA_VIEW_ENABLED`; Finalistas siempre visible con ruta `${stageBase}/finalistas`
- **`App.tsx`** — Rutas de Finalistas (`/pipeline/:jobId/finalistas` y con `processId`) ya no redirigen sino que renderizan `<Shortlist />` directamente
- **`Shortlist.tsx`** — Título de la vacante ahora dinámico vía `useVacantes` en lugar de hardcodeado

### Reglas y documentación
- **`.cursor/rules/auto-commit.mdc`** — Actualizada para incluir paso de actualizar `CHANGELOG.md` en cada commit
- **`CHANGELOG.md`** — Creado historial completo del proyecto desde el primer commit

---

## [e6a630b] — 04 Abr 2026

- **Caché en memoria** para respuestas de API — elimina llamadas de red redundantes

## [d9611cd] — 04 Abr 2026

- **Fix sidebar** — estado activo correcto para rutas de pipeline con segmentos de proceso

## [8a4c661] — 04 Abr 2026

- **Renombrar títulos** — "Proceso de validación" en `CandidateOnepage` y `FinalistView`

## [9129b6c] — 04 Abr 2026

- **Ocultar botón** "Vista finalista" del header de `CandidateOnepage`

## [c8aa179] — 04 Abr 2026

- **Foto del candidato** — mapeada desde la respuesta de la API `onePage` en `useCandidateDetail`

## [e157d72] — 04 Abr 2026

- **Gauge animado** y renderizado de foto en la tarjeta de perfil de `CandidateOnepage`

## [551c227] — 04 Abr 2026

- **Parser de JSON** en strings de logros/señales antes de renderizar en secciones de scoring y prescreening

## [29b528c] — 04 Abr 2026

- **Chips con forma pill** — estilos actualizados; ocultar campo de experiencia vacío en `CandidateCard`

## [c40c654] — 04 Abr 2026

- **Chip de ubicación** — movido junto al chip de rol en `CandidateCard`, estilo unificado

## [8691ac7] — 04 Abr 2026

- **Skeleton loading** — estados de carga añadidos a todas las pantallas principales de la app

## [cf54010] — 03 Abr 2026

- **Logout** — reemplazado el dropdown de avatar en el header por botón directo "Salir"

## [d6d0159] — 31 Mar 2026

- **Datos prescreening** — añadidos datos `prescreeningAI` a candidatos c2–c6 en mock

## [4956eed] — 31 Mar 2026

- **Fix click en candidate card** — reemplazado `JOB_ID` indefinido por `vacante.id`

## [c937f1a] — 31 Mar 2026

- **Fix etiquetas de estado** — "Por validar" amarillo por defecto, "Continúa" al pasar etapa

## [ff88cbf] — 31 Mar 2026

- **Fix lógica de estado y ordenamiento** en la lista de candidatos

## [a023e56] — 30 Mar 2026

- **Fix ícono de ubicación** — reemplazado SVG roto por `MapPin` de lucide-react en `CandidateOnepage` y `FinalistView`

## [9837719] — 30 Mar 2026

- **Gradient outline consistente** en la tarjeta de perfil del Pipeline candidato

## [0fd42fc] — 30 Mar 2026

- **Módulo Entrevistas** — movido al accordion de `CandidateOnepage`; eliminada la ruta standalone

## [e0d874b] — 30 Mar 2026

- **Toggle lectura/edición** — lógica para secciones HR y HM en el módulo de entrevistas

## [a46b219] — 30 Mar 2026

- **Gradient stroke** en tarjeta Finalista; restaurado borde blanco en Pipeline candidato

## [60d8d66] — 30 Mar 2026

- **Fix gradient stroke** — efecto solo en borde con interior blanco

## [2ccede7] — 30 Mar 2026

- **Fondo fijo y gradient stroke** en el flujo del pipeline

## [c042af4] — 30 Mar 2026

- **Fondo global y bordes degradado** en el flujo del pipeline

## [52ece2b] — 29 Mar 2026

- **Fix anchos de badges** en tabla de Vacantes; paleta de Finalistas actualizada

## [98b67ab] — 29 Mar 2026

- **Branding global** — logos, íconos del sidebar e imagen de éxito actualizados

## [8e7388e] — 29 Mar 2026

- **`InterviewContext`** — creado con `useInterview`, `calcScore` e `InterviewProvider` para compartir el estado de feedback entre páginas

## [9672749] — 28 Mar 2026

- **Flujo inicial** — generación del proyecto base
