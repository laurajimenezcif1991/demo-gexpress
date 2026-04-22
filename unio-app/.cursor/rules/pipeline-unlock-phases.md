# Reglas de Desbloqueo de Fases del Pipeline

## Orden de fases

```
scoring  →  prescreening  →  entrevistas  →  evaluaciones
```

`finalistas` es una vista especial que se desbloquea desde `entrevistas`.

---

## Fuente de verdad: `progressStage` (PipelineContext)

`progressStage` representa **la fase más avanzada que ha alcanzado la vacante activa**.  
Se actualiza en `CandidateList.tsx` al montar la vista de cualquier fase — **solo avanza hacia adelante, nunca retrocede**.

```typescript
// CandidateList.tsx — sincronización forward-only
const order = ['scoring', 'prescreening', 'entrevistas', 'evaluaciones'];
if (order.indexOf(currentStage) > order.indexOf(progressStage)) {
  setProgressStage(currentStage);
}
```

---

## Reglas de bloqueo del Sidebar

| Fase sidebar     | Se desbloquea cuando…                        | `locked` condition          |
|------------------|----------------------------------------------|-----------------------------|
| Análisis de IA   | Siempre activo                               | `false`                     |
| Pre screening AI | `progressStage >= 'prescreening'`            | `progressIdx < 1`           |
| Entrevistas      | `progressStage >= 'entrevistas'`             | `progressIdx < 2`           |
| Evaluaciones     | `progressStage >= 'evaluaciones'`            | `progressIdx < 3`           |
| Finalistas       | `progressStage >= 'entrevistas'` (especial)  | `!['entrevistas','evaluaciones'].includes(progressStage)` |

Los ítems bloqueados muestran `opacity: 0.4`, `cursor: default` y no navegan al hacer click.

---

## Reglas de bloqueo de Acordeones (CandidateOnepage)

Los acordeones dentro del onepager de candidato se bloquean por la fase del **parámetro `?stage=` de la URL**, no por `progressStage`.

| Acordeón                  | Variable de control  | Se activa cuando…                     |
|---------------------------|----------------------|---------------------------------------|
| 1. Scoring AI             | siempre              | Siempre visible                       |
| 2. Pre-entrevista IA      | `hasPrescreening`    | `stage` ∈ {prescreening, entrevistas, evaluaciones} |
| 3. Entrevistas            | `hasEntrevistas`     | `stage` ∈ {entrevistas, evaluaciones} |
| 4. Prueba Psicológica     | `hasEntrevistas`     | `stage` ∈ {entrevistas, evaluaciones} |
| 5. Prueba Técnica         | `hasEntrevistas`     | `stage` ∈ {entrevistas, evaluaciones} (opcional) |

> **Nota:** Prueba Psicológica y Prueba Técnica se desbloquean **desde la fase Entrevistas**, no desde Evaluaciones. Evaluaciones es cuando ya existen resultados completos de la prueba psicológica externa.

---

## Regla de Finalistas

```typescript
// PipelineContext.tsx
const finalistaLocked = !['entrevistas', 'evaluaciones'].includes(progressStage);
```

Finalistas se desbloquea cuando la vacante llega a **Entrevistas** o más avanzado.  
Esto aplica tanto al sidebar como al `ValidationPipelineFilter` en `/candidatos`.

---

## Archivos clave

| Archivo | Rol |
|---|---|
| `src/context/PipelineContext.tsx` | Define `progressStage`, `finalistaLocked` |
| `src/pages/CandidateList.tsx` | Sincroniza `currentStage` → `progressStage` |
| `src/components/layout/Sidebar.tsx` | Consume `progressStage` para locking |
| `src/pages/CandidateOnepage.tsx` | Consume `stage` (URL param) para locking de acordeones |
