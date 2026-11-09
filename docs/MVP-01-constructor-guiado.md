---
title: MVP-01 — Constructor Guiado
version: 1.0.0
status: draft
last_updated: 2026-11-08
parent_document: README.md
related_documents:
  - README.md
  - docs/MVP-02-validador-libre.md
scope: Especificación técnica del MVP-01 (formulario estructurado de construcción de prompts).
---

# 📄 MVP-01 — Constructor Guiado

## Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Público Objetivo y Casos de Uso](#2-público-objetivo-y-casos-de-uso)
3. [Stack Tecnológico](#3-stack-tecnológico)
4. [Estructura de Carpetas Detallada](#4-estructura-de-carpetas-detallada)
5. [Flujo de Usuario (UI)](#5-flujo-de-usuario-ui)
6. [Contrato de API (Backend Java)](#6-contrato-de-api-backend-java)
7. [Lógica del Motor de Validación (Python)](#7-lógica-del-motor-de-validación-python)
8. [Componentes Compartidos](#8-componentes-compartidos)
9. [Consideraciones de Diseño](#9-consideraciones-de-diseño)
10. [Registro de Cambios](#10-registro-de-cambios)

---

## 1. Descripción General

El **Constructor Guiado** es una interfaz que descompone el prompt en bloques fundamentales y guía al usuario para que los complete uno a uno. El sistema ensambla el prompt final, lo envía al motor de validación y presenta un informe de hallazgos con sugerencias de mejora. Además, obliga al usuario a tomar una decisión consciente sobre el formato del prompt, con leyendas contextuales sobre el coste y los escenarios de uso de cada opción.

**Objetivo principal:** Reducir la barrera de entrada para usuarios que no son expertos en ingeniería de prompts, asegurando que ningún componente crítico (rol, tarea, contexto, restricciones, formato de salida) quede fuera del prompt.

> **Documento maestro de referencia:** [`README.md`](../README.md). Consultar la sección 2 (Arquitectura Compartida) y la sección 4 (Selección Inteligente de Formato) para el contexto transversal a ambos MVP.

---

## 2. Público Objetivo y Casos de Uso

- **Perfil primario:** Analistas, product managers, investigadores o desarrolladores que necesitan crear un prompt desde cero para una tarea concreta pero no tienen familiaridad con las buenas prácticas.
- **Caso de uso típico:** *"Necesito un prompt para clasificar tickets de soporte en categorías, pero no sé qué información debo incluir ni cómo estructurarla."*
- **Resultado esperado:** Un prompt validado, con un informe que indica si la estructura es sólida y una recomendación de formato alineada con el modelo objetivo.

### 2.1 Casos de Uso Secundarios

- **Onboarding de nuevos miembros del equipo:** El formulario actúa como una guía pedagógica que enseña, por estructura, qué componentes debe tener un prompt efectivo.
- **Estandarización de prompts en una organización:** Permite que distintos equipos generen prompts con la misma estructura base, facilitando su posterior revisión y mantenimiento.

---

## 3. Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Componibilidad de los bloques del formulario; tipado estricto para el contrato de datos con el backend. |
| Backend (Gateway) | Spring Boot 3 + Spring Web + Bean Validation | Validación del contrato de entrada; orquestación de la llamada a Python. |
| Motor de validación | Python 3.11+ + FastAPI + `promptdoctor` + `promptqc` (`--fast`) + `promptclarity-sdk` | Linting estático, scoring rápido y detección de 250+ reglas sin ejecución de LLM. |
| Infraestructura | Docker + Docker Compose | Reproducibilidad de los tres servicios. |

> **Referencia:** La justificación de la elección de cada SDK se detalla en la sección 3 del [`README.md`](../README.md).

---

## 4. Estructura de Carpetas Detallada

```text
MVP-01/
├── frontend/
│   └── src/
│       ├── components/
│       │   └── builder/
│       │       ├── PromptBuilderForm.tsx      # Formulario contenedor
│       │       ├── FieldGroup.tsx             # Agrupador visual de campos
│       │       ├── fields/
│       │       │   ├── RoleField.tsx
│       │       │   ├── TaskField.tsx
│       │       │   ├── ContextField.tsx
│       │       │   ├── ConstraintsField.tsx
│       │       │   ├── OutputFormatField.tsx
│       │       │   └── ExamplesField.tsx      # Few-shot (opcional)
│       │       └── PromptPreview.tsx          # Vista previa ensamblada en tiempo real
│       ├── hooks/
│       │   └── usePromptAssembly.ts           # Lógica de ensamblado y tokenización
│       └── types/
│           └── builder.ts                     # Tipos de los bloques del formulario
├── backend-java/
│   └── src/main/java/com/example/promptevaluator/
│       ├── controller/
│       │   └── BuilderValidationController.java
│       └── dto/
│           └── BuilderValidationRequest.java  # Incluye campos estructurados + formato elegido
└── validator-python/
    └── app/
        ├── main.py                            # POST /validate/builder
        └── format_advisor.py                  # Recomendación según modelo + formato
```

### 4.1 Responsabilidad de Cada Componente Frontend

| Componente | Responsabilidad |
|---|---|
| `PromptBuilderForm.tsx` | Contenedor principal. Gestiona el estado del formulario y dispara la validación. |
| `FieldGroup.tsx` | Agrupador visual reutilizable con título, descripción de ayuda y validación inline. |
| `RoleField.tsx` | Campo de texto para el rol/persona. Incluye placeholder con ejemplo. |
| `TaskField.tsx` | Campo de texto para la tarea o instrucción principal. |
| `ContextField.tsx` | Área de texto para el contexto adicional. |
| `ConstraintsField.tsx` | Lista dinámica de restricciones (añadir/eliminar). |
| `OutputFormatField.tsx` | Campo de texto + selector de esquema de salida (JSON, texto libre, etc.). |
| `ExamplesField.tsx` | Lista dinámica de pares entrada/salida para few-shot (opcional). |
| `PromptPreview.tsx` | Vista previa en tiempo real del prompt ensamblado en el formato elegido. |
| `usePromptAssembly.ts` | Hook que ensambla los bloques según el formato seleccionado y estima tokens. |

---

## 5. Flujo de Usuario (UI)

1. **Paso 1 — Contexto de destino:** El usuario indica (opcionalmente) el **modelo objetivo** (GPT-4, Claude Sonnet, GPT-4o-mini, Haiku, modelo local) y la **naturaleza de la tarea** (razonamiento, extracción, clasificación, generación creativa). Estos metadatos alimentan la recomendación de formato.
2. **Paso 2 — Rellenar bloques:** El formulario presenta los campos separados: Rol, Tarea, Contexto, Restricciones, Formato de salida y Ejemplos (opcional). Cada campo incluye un texto de ayuda con un ejemplo.
3. **Paso 3 — Selección de formato:** El componente `FormatSelector` (ver sección 4 del [`README.md`](../README.md)) presenta las cinco opciones (Texto Plano, Markdown, JSON, XML, YAML) con las leyendas de ventajas, escenarios y precauciones. Si el usuario indicó un modelo pequeño y una tarea de razonamiento, el selector **desaconseja activamente JSON/XML** y sugiere Texto Plano o Markdown.
4. **Paso 4 — Vista previa y estimación de tokens:** El panel lateral muestra el prompt ensamblado en el formato elegido y un **comparador visual de tokens** frente al texto plano.
5. **Paso 5 — Validar:** El botón "Validar estructura" envía el prompt al backend. Se muestra un informe con hallazgos clasificados por severidad, la puntuación por categorías y las sugerencias de corrección.
6. **Paso 6 — Iterar:** El usuario puede modificar cualquier campo del formulario y revalidar sin perder el estado.

### 5.1 Diagrama de Flujo

```text
[Inicio] → [Paso 1: Modelo + Tarea]
              ↓
       [Paso 2: Rellenar bloques]
              ↓
       [Paso 3: Elegir formato] ←── (recomendación contextual)
              ↓
       [Paso 4: Vista previa + tokens]
              ↓
       [Paso 5: Validar] ──→ [Informe de hallazgos]
              ↓                        ↓
       [Paso 6: Iterar] ←─────────────┘
```

### 5.2 Reglas de Validación Inline (Frontend)

Antes de enviar al backend, el frontend aplica validaciones mínimas con `react-hook-form` + `zod`:

- `role` y `task`: obligatorios, longitud entre 10 y 2,000 caracteres.
- `constraints`: al menos una restricción si el usuario marcó "incluir restricciones".
- `outputFormat`: obligatorio si el usuario indicó una tarea de extracción o clasificación.
- `chosenFormat`: obligatorio, uno de `plaintext|markdown|json|xml|yaml`.

---

## 6. Contrato de API (Backend Java)

**Endpoint:** `POST /api/v1/builder/validate`

### 6.1 Request (JSON)

```json
{
  "role": "Eres un analista financiero senior...",
  "task": "Clasifica el siguiente ticket de soporte...",
  "context": "El ticket proviene de un cliente empresarial...",
  "constraints": [
    "No inventes categorías.",
    "Si es ambiguo, usa 'unknown'."
  ],
  "outputFormat": "Devuelve un JSON con las claves category, urgency y summary.",
  "examples": [
    { "input": "No puedo acceder a mi cuenta", "output": "{\"category\":\"access\",\"urgency\":\"high\",\"summary\":\"...\"}" }
  ],
  "targetModel": "gpt-4o-mini",
  "taskNature": "reasoning",
  "chosenFormat": "markdown"
}
```

### 6.2 Validaciones en Java (Bean Validation)

| Campo | Anotación | Notas |
|---|---|---|
| `role` | `@NotBlank`, `@Size(max = 2000)` | Obligatorio. |
| `task` | `@NotBlank`, `@Size(max = 2000)` | Obligatorio. |
| `context` | `@Size(max = 5000)` | Opcional. |
| `constraints` | `@Size(max = 20)` | Lista opcional; cada elemento máx. 500 caracteres. |
| `outputFormat` | `@Size(max = 1000)` | Opcional, pero recomendado para tareas de extracción. |
| `examples` | `@Size(max = 10)` | Lista opcional de pares entrada/salida. |
| `targetModel` | `@Pattern(...)` | Opcional; debe pertenecer a la lista de modelos soportados. |
| `taskNature` | `@Pattern(regexp = "reasoning\|extraction\|classification\|creative")` | Opcional. |
| `chosenFormat` | `@NotBlank`, `@Pattern(regexp = "plaintext\|markdown\|json\|xml\|yaml")` | Obligatorio. |

### 6.3 Response (JSON unificado)

```json
{
  "overallScore": 72,
  "grade": "B",
  "categoryScores": {
    "clarity": 80,
    "consistency": 65,
    "efficiency": 70,
    "security": 60,
    "structure": 85
  },
  "estimatedTokens": {
    "chosenFormat": 420,
    "plainTextBaseline": 365,
    "overheadPercentage": 15.1
  },
  "findings": [
    {
      "ruleId": "PD101",
      "severity": "warning",
      "line": null,
      "message": "No output format is specified.",
      "suggestion": "State the shape of the answer, e.g., 'Return a JSON object with keys...'"
    },
    {
      "ruleId": "PQ001",
      "severity": "error",
      "line": 3,
      "message": "Potential contradiction: 'Be concise' conflicts with 'Provide detailed explanations'.",
      "suggestion": "Resolve the conflict by choosing one directive."
    }
  ],
  "formatRecommendation": {
    "recommendedFormat": "markdown",
    "rationale": "Para un modelo de la familia GPT-4o-mini en una tarea de razonamiento, Markdown ofrece un equilibrio entre estructura y coste. Evita JSON para el prompt de entrada si la tarea es de razonamiento complejo."
  },
  "assembledPrompt": "## Rol\nEres un analista financiero senior...\n\n## Tarea\n..."
}
```

### 6.4 Códigos de Error

| Código | Significado |
|---|---|
| `400 Bad Request` | Validación de Bean Validation fallida. Devuelve lista de campos con error. |
| `422 Unprocessable Entity` | El motor de Python no pudo procesar el prompt (ej. texto vacío tras ensamblado). |
| `503 Service Unavailable` | El microservicio Python no está disponible. |

---

## 7. Lógica del Motor de Validación (Python)

El endpoint `POST /validate/builder` del microservicio Python realiza los siguientes pasos:

1. **Ensamblado del prompt:** Concatena los bloques recibidos con separadores adecuados al formato elegido:
   - **Markdown:** `## Rol`, `## Tarea`, `## Contexto`, `## Restricciones`, `## Formato de salida`, `## Ejemplos`.
   - **Texto plano:** `ROL:`, `TAREA:`, `CONTEXTO:`, `RESTRICCIONES:`, etc., separados por doble salto de línea.
   - **JSON:** Un objeto JSON con las claves `role`, `task`, `context`, `constraints`, `output_format`, `examples`.
   - **XML:** Etiquetas `<role>`, `<task>`, `<context>`, `<constraints>`, `<output_format>`, `<examples>`.
   - **YAML:** Claves `role:`, `task:`, `context:`, `constraints:`, etc.
2. **Ejecución de linters:**
   - `promptdoctor` sobre el texto ensamblado → hallazgos estructurales.
   - `promptqc.analyze(texto, fast=True)` → puntuación y hallazgos de calidad.
   - `PromptClarity().validate(texto)` → 250+ reglas de ambigüedad, constraints y datos sensibles.
3. **Agregación:** Unifica los hallazgos de las tres fuentes, deduplica por regla/línea y asigna un `overallScore` ponderado.
4. **Recomendación de formato:** `format_advisor.py` recibe `targetModel`, `taskNature` y `chosenFormat`; devuelve una recomendación con rationale basada en la tabla de la sección 4.4 del [`README.md`](../README.md).

### 7.1 Modo de Ejecución (Garantía de No Ejecución de LLM)

| SDK | Modo | Garantía |
|---|---|---|
| `promptdoctor` | CLI/API estática | 100% offline, sin red, sin API key. |
| `promptqc` | `--fast` (patrones) | ~10 ms, sin descarga de modelo. |
| `promptclarity-sdk` | `use_llm=False` | Rule-only; sin llamadas a modelos. |

> **Nota:** En la Fase 2 se podrá activar opcionalmente el `llm_advisor` de `promptclarity-sdk` y los Guardrails de LangChain4j, pero esa activación está fuera del alcance del MVP.

### 7.2 Estructura Interna del `aggregator.py`

```python
def aggregate(builder_request: BuilderRequest) -> ValidationResponse:
    assembled = assemble(builder_request)              # paso 1
    findings_pd = run_promptdoctor(assembled)          # paso 2a
    findings_pq = run_promptqc(assembled)              # paso 2b
    findings_pc = run_promptclarity(assembled)         # paso 2c
    findings = deduplicate(findings_pd + findings_pq + findings_pc)  # paso 3
    score = weighted_score(findings)                   # paso 3
    recommendation = format_advisor(
        target_model=builder_request.targetModel,
        task_nature=builder_request.taskNature,
        chosen_format=builder_request.chosenFormat,
    )                                                  # paso 4
    return ValidationResponse(
        overall_score=score.total,
        grade=score.grade,
        category_scores=score.categories,
        estimated_tokens=estimate_tokens(assembled, builder_request.chosenFormat),
        findings=findings,
        format_recommendation=recommendation,
        assembled_prompt=assembled,
    )
```

---

## 8. Componentes Compartidos

Este MVP reutiliza los siguientes componentes definidos en el documento maestro:

| Componente | Ubicación en el repo | Referencia |
|---|---|---|
| `FormatSelector.tsx` | `frontend/src/components/shared/FormatSelector.tsx` | Sección 4 del [`README.md`](../README.md) |
| `TokenEstimator.tsx` | `frontend/src/components/shared/TokenEstimator.tsx` | Sección 4.3 del [`README.md`](../README.md) |
| `ValidationReport.tsx` | `frontend/src/components/shared/ValidationReport.tsx` | Sección 4.1 del [`README.md`](../README.md) |
| `format_advisor.py` | `validator-python/app/format_advisor.py` | Sección 4.4 del [`README.md`](../README.md) |
| `aggregator.py` | `validator-python/app/aggregator.py` | Sección 7 de este documento |

---

## 9. Consideraciones de Diseño

- **Persistencia de estado:** El formulario mantiene el estado en el cliente (React state o Zustand). No se requiere base de datos en el MVP.
- **Accesibilidad:** Cada campo del formulario incluye `aria-describedby` para los textos de ayuda; el selector de formato usa roles de `radiogroup` con descripciones largas asociadas.
- **Internacionalización:** Los textos de ayuda y las leyendas de formato se externalizan en un archivo `i18n/es.json` para facilitar traducciones futuras.
- **Extensibilidad a Fase 2:** El contrato de `BuilderValidationRequest` ya incluye `targetModel` y `taskNature`, que en la Fase 2 se reutilizarán para seleccionar el modelo de ejecución y el harness de contract testing.
- **Rendimiento:** El ensamblado y la estimación de tokens se ejecutan en el cliente; la validación en el servidor se resuelve en menos de 100 ms para prompts de hasta 2,000 tokens.

---

## 10. Registro de Cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0.0 | 2026-11-08 | Arquitectura de Solución | Versión inicial del documento de detalle del MVP-01. |

---

*Fin del documento. Volver al [documento maestro](../README.md).*