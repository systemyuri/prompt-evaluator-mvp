---
title: MVP-02 — Validador Libre
version: 1.0.0
status: draft
last_updated: 2026-11-08
parent_document: README.md
related_documents:
  - README.md
  - docs/MVP-01-constructor-guiado.md
scope: Especificación técnica del MVP-02 (validador de prompts existentes pegados por el usuario).
---

# 📄 MVP-02 — Validador Libre (Pegar y Analizar)

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

El **Validador Libre** es una interfaz minimalista que permite al usuario pegar un prompt ya redactado y obtener en segundos un diagnóstico completo de su calidad estructural y de formato. A diferencia del Constructor Guiado (MVP-01), no impone una estructura de entrada: acepta el prompt tal cual fue escrito y lo analiza con las mismas reglas y los mismos SDKs.

**Objetivo principal:** Servir como herramienta de auditoría y *quality gate* para prompts existentes, especialmente útil en equipos que ya tienen prompts en producción y necesitan verificar su calidad antes de modificarlos o desplegarlos.

> **Documento maestro de referencia:** [`README.md`](../README.md). Consultar la sección 2 (Arquitectura Compartida) y la sección 4 (Selección Inteligente de Formato) para el contexto transversal a ambos MVP.

---

## 2. Público Objetivo y Casos de Uso

- **Perfil primario:** Desarrolladores, ingenieros de prompts o equipos de plataforma que mantienen un catálogo de prompts y necesitan una validación objetiva y repetible.
- **Caso de uso típico:** *"Hemos heredado 40 prompts de un sistema anterior y queremos saber cuáles tienen problemas estructurales antes de migrarlos."*
- **Resultado esperado:** Un informe de auditoría con puntuación, hallazgos priorizados y una recomendación de formato que el usuario puede aplicar manualmente.

### 2.1 Casos de Uso Secundarios

- **Integración en CI/CD:** El endpoint `POST /api/v1/validator/validate` puede invocarse desde un pipeline (GitHub Actions, pre-commit hook) para bloquear merges que introduzcan prompts con hallazgos de severidad `error`.
- **Auditoría masiva:** Procesamiento por lotes de un catálogo de prompts para generar un informe consolidado (fuera del alcance del MVP, pero la API lo permite).

---

## 3. Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Interfaz simple con área de texto, panel de resultados y selector de formato opcional. |
| Backend (Gateway) | Spring Boot 3 + Spring Web + Bean Validation | Contrato de entrada simple (`{ promptText, targetModel?, taskNature? }`). |
| Motor de validación | Python 3.11+ + FastAPI + `promptdoctor` + `promptqc` (`--fast`) + `promptclarity-sdk` | Idéntico al MVP-01; se reutiliza el mismo microservicio. |
| Infraestructura | Docker + Docker Compose | Compartición del servicio Python entre ambos MVP. |

> **Referencia:** La justificación de la elección de cada SDK se detalla en la sección 3 del [`README.md`](../README.md).

---

## 4. Estructura de Carpetas Detallada

```text
MVP-02/
├── frontend/
│   └── src/
│       ├── components/
│       │   └── free-validator/
│       │       ├── FreePromptInput.tsx        # Área de texto principal
│       │       ├── PromptMetadataBar.tsx      # Selector opcional de modelo y tarea
│       │       ├── DetectedFormatBadge.tsx    # Indicador del formato detectado
│       │       └── AuditReport.tsx            # Informe con score, barras y hallazgos
│       └── pages/
│           └── FreeValidatorPage.tsx          # Ruta /validator
├── backend-java/
│   └── src/main/java/com/example/promptevaluator/
│       ├── controller/
│       │   └── FreeValidationController.java
│       └── dto/
│           └── FreeValidationRequest.java     # promptText + targetModel/taskNature opcionales
└── validator-python/
    └── app/
        ├── main.py                            # POST /validate/free
        ├── format_detector.py                 # Detección heurística del formato dominante
        └── aggregator.py                      # Reutilizado del MVP-01
```

### 4.1 Responsabilidad de Cada Componente Frontend

| Componente | Responsabilidad |
|---|---|
| `FreePromptInput.tsx` | `textarea` grande con contador de caracteres y estimación de tokens en vivo. |
| `PromptMetadataBar.tsx` | Barra superior con selects opcionales de modelo objetivo y naturaleza de la tarea. |
| `DetectedFormatBadge.tsx` | Muestra el formato detectado por el backend (`plaintext`, `markdown`, `json`, `xml`, `yaml`) con un tooltip explicativo. |
| `AuditReport.tsx` | Renderiza la puntuación global, las barras por categoría, la lista de hallazgos y la recomendación de formato. |
| `FreeValidatorPage.tsx` | Página contenedora; compone los componentes anteriores y gestiona el estado de la petición. |

---

## 5. Flujo de Usuario (UI)

1. **Paso 1 — Pegar el prompt:** El usuario pega el texto completo en un `textarea` grande. La interfaz no impone ninguna estructura.
2. **Paso 2 — Metadatos opcionales (recomendado):** Una barra superior permite seleccionar el **modelo objetivo** y la **naturaleza de la tarea**, con el mismo propósito que en el MVP-01: afinar la recomendación de formato. Si no se seleccionan, la recomendación se basa solo en el análisis del texto (detección heurística del formato dominante).
3. **Paso 3 — Analizar:** El botón "Analizar prompt" envía el texto al backend.
4. **Paso 4 — Informe de auditoría:** Se muestran:
   - Puntuación global destacada (0–100, grado A–F).
   - Barras de progreso por categoría (Claridad, Consistencia, Eficiencia, Seguridad, Estructura).
   - Lista de hallazgos con número de línea (cuando aplique), regla infringida, severidad y sugerencia de corrección.
   - **Recomendación de formato** con rationale, basada en el formato detectado y los metadatos opcionales.
5. **Paso 5 — Exportar (valor añadido):** El informe puede descargarse en JSON o Markdown para integrarlo en un pipeline de CI/CD o en una revisión de código.

### 5.1 Diagrama de Flujo

```text
[Inicio] → [Paso 1: Pegar prompt]
              ↓
       [Paso 2: Metadatos opcionales]
              ↓
       [Paso 3: Analizar] ──→ [Detección de formato + linters]
              ↓                        ↓
       [Paso 4: Informe] ←─────────────┘
              ↓
       [Paso 5: Exportar JSON/MD]
```

### 5.2 Reglas de Validación Inline (Frontend)

Antes de enviar al backend, el frontend aplica validaciones mínimas con `react-hook-form` + `zod`:

- `promptText`: obligatorio, longitud entre 10 y 20,000 caracteres.
- `targetModel` y `taskNature`: opcionales; si se proporcionan, deben pertenecer a los enums soportados.

---

## 6. Contrato de API (Backend Java)

**Endpoint:** `POST /api/v1/validator/validate`

### 6.1 Request (JSON)

```json
{
  "promptText": "Eres un asistente útil. Responde de forma concisa pero proporciona explicaciones detalladas...",
  "targetModel": "gpt-4o-mini",
  "taskNature": "reasoning"
}
```

### 6.2 Validaciones en Java (Bean Validation)

| Campo | Anotación | Notas |
|---|---|---|
| `promptText` | `@NotBlank`, `@Size(min = 10, max = 20000)` | Obligatorio. |
| `targetModel` | `@Pattern(...)` | Opcional; debe pertenecer a la lista de modelos soportados. |
| `taskNature` | `@Pattern(regexp = "reasoning\|extraction\|classification\|creative")` | Opcional. |

### 6.3 Response (JSON unificado)

Idéntico al del MVP-01, con las siguientes diferencias:

- `estimatedTokens` compara el prompt tal cual fue pegado (en el formato detectado) frente al texto plano equivalente.
- `formatRecommendation` incluye también el `detectedFormat` (el formato que el analizador heurístico identificó en el texto pegado).
- `findings[].line` se refiere a la línea del texto original pegado.
- No incluye `assembledPrompt` (el texto es la fuente de verdad y no se modifica).

```json
{
  "overallScore": 58,
  "grade": "D",
  "detectedFormat": "markdown",
  "categoryScores": {
    "clarity": 60,
    "consistency": 40,
    "efficiency": 70,
    "security": 50,
    "structure": 65
  },
  "estimatedTokens": {
    "detectedFormat": 380,
    "plainTextBaseline": 320,
    "overheadPercentage": 18.8
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
      "line": 1,
      "message": "Potential contradiction: 'Be concise' conflicts with 'Provide detailed explanations'.",
      "suggestion": "Resolve the conflict by choosing one directive."
    }
  ],
  "formatRecommendation": {
    "detectedFormat": "markdown",
    "recommendedFormat": "plaintext",
    "rationale": "El prompt está en Markdown y se dirige a un modelo pequeño (GPT-4o-mini) para una tarea de razonamiento. Considera texto plano para evitar el 'structure tax' y reducir tokens en ~19%."
  }
}
```

### 6.4 Códigos de Error

| Código | Significado |
|---|---|
| `400 Bad Request` | Validación de Bean Validation fallida. Devuelve lista de campos con error. |
| `413 Payload Too Large` | `promptText` excede el límite configurado (20,000 caracteres por defecto). |
| `422 Unprocessable Entity` | El motor de Python no pudo procesar el prompt (ej. texto vacío tras normalización). |
| `503 Service Unavailable` | El microservicio Python no está disponible. |

### 6.5 Uso desde CI/CD

El endpoint está diseñado para ser consumido también desde un pipeline. Ejemplo de invocación con `curl`:

```bash
curl -s -X POST http://localhost:8080/api/v1/validator/validate \
  -H "Content-Type: application/json" \
  -d '{"promptText": "...", "targetModel": "gpt-4o-mini", "taskNature": "reasoning"}' \
  | jq '.findings | map(select(.severity == "error")) | length'
```

El resultado puede usarse para fallar el pipeline si el número de hallazgos de severidad `error` es mayor que cero.

---

## 7. Lógica del Motor de Validación (Python)

El endpoint `POST /validate/free` reutiliza el mismo `aggregator.py` del MVP-01, con dos particularidades:

1. **Detección heurística de formato:** Antes de ejecutar los linters, un analizador ligero (`format_detector.py`) detecta si el prompt pegado contiene sintaxis Markdown (`##`, `**`, listas), JSON embebido (`{...}`), XML (`<tag>`), YAML (`clave: valor`) o si es texto plano. Esta detección se usa para poblar `detectedFormat` y para ajustar la recomendación.
2. **Ejecución de linters:** Se ejecutan las mismas tres librerías (`promptdoctor`, `promptqc --fast`, `promptclarity-sdk` en modo rule-only) sobre el texto sin modificaciones. Los hallazgos se mapean a las líneas originales del texto pegado.

### 7.1 Algoritmo de Detección de Formato (`format_detector.py`)

```python
def detect_format(text: str) -> str:
    """
    Devuelve uno de: 'json', 'xml', 'yaml', 'markdown', 'plaintext'.
    Orden de prioridad: json > xml > yaml > markdown > plaintext.
    """
    stripped = text.strip()

    # 1. JSON: empieza por { o [ y parsea correctamente
    if stripped.startswith(("{", "[")):
        try:
            json.loads(stripped)
            return "json"
        except json.JSONDecodeError:
            pass

    # 2. XML: contiene etiquetas de apertura/cierre
    if re.search(r"<[a-zA-Z][^>]*>.*</[a-zA-Z][^>]*>", stripped, re.DOTALL):
        return "xml"

    # 3. YAML: múltiples líneas con patrón "clave: valor"
    yaml_lines = sum(1 for line in stripped.splitlines() if re.match(r"^\s*\w[\w\-]*:\s", line))
    if yaml_lines >= 2:
        return "yaml"

    # 4. Markdown: encabezados, negritas, listas
    if re.search(r"^#{1,6}\s", stripped, re.MULTILINE) or "**" in stripped:
        return "markdown"

    return "plaintext"
```

### 7.2 Modo de Ejecución (Garantía de No Ejecución de LLM)

| SDK | Modo | Garantía |
|---|---|---|
| `promptdoctor` | CLI/API estática | 100% offline, sin red, sin API key. |
| `promptqc` | `--fast` (patrones) | ~10 ms, sin descarga de modelo. |
| `promptclarity-sdk` | `use_llm=False` | Rule-only; sin llamadas a modelos. |

### 7.3 Estructura Interna del Endpoint

```python
@app.post("/validate/free")
def validate_free(request: FreeValidationRequest) -> ValidationResponse:
    detected = detect_format(request.promptText)          # paso 1
    findings_pd = run_promptdoctor(request.promptText)    # paso 2a
    findings_pq = run_promptqc(request.promptText)        # paso 2b
    findings_pc = run_promptclarity(request.promptText)   # paso 2c
    findings = deduplicate(findings_pd + findings_pq + findings_pc)
    score = weighted_score(findings)
    recommendation = format_advisor(
        target_model=request.targetModel,
        task_nature=request.taskNature,
        detected_format=detected,
    )
    return ValidationResponse(
        overall_score=score.total,
        grade=score.grade,
        detected_format=detected,
        category_scores=score.categories,
        estimated_tokens=estimate_tokens(request.promptText, detected),
        findings=findings,
        format_recommendation=recommendation,
    )
```

> **Reutilización clave:** El microservicio Python del MVP-02 es el **mismo** que el del MVP-01; solo cambia el endpoint (`/validate/free` vs. `/validate/builder`) y la lógica de ensamblado previo (en el MVP-02 no hay ensamblado: el texto es la fuente de verdad).

---

## 8. Componentes Compartidos

Este MVP reutiliza los siguientes componentes definidos en el documento maestro:

| Componente | Ubicación en el repo | Referencia |
|---|---|---|
| `FormatSelector.tsx` | `frontend/src/components/shared/FormatSelector.tsx` | Sección 4 del [`README.md`](../README.md) |
| `TokenEstimator.tsx` | `frontend/src/components/shared/TokenEstimator.tsx` | Sección 4.3 del [`README.md`](../README.md) |
| `ValidationReport.tsx` | `frontend/src/components/shared/ValidationReport.tsx` | Sección 4.1 del [`README.md`](../README.md) |
| `format_advisor.py` | `validator-python/app/format_advisor.py` | Sección 4.4 del [`README.md`](../README.md) |
| `aggregator.py` | `validator-python/app/aggregator.py` | Sección 7 del [`MVP-01`](./MVP-01-constructor-guiado.md) |

> **Nota:** En el MVP-02, `FormatSelector` se usa como panel informativo (no como selector activo, ya que el formato lo determina el texto pegado), y `DetectedFormatBadge` muestra el resultado de la detección heurística.

---

## 9. Consideraciones de Diseño

- **Sin estado:** El validador libre es stateless por diseño. Cada análisis es independiente y no se almacena el prompt ni el informe.
- **Privacidad:** Dado que el prompt puede contener información sensible, el servicio Python no persiste el texto ni los hallazgos. Los logs se limitan a metadatos (longitud del texto, formato detectado, tiempo de ejecución).
- **Rendimiento:** El modo `--fast` de `promptqc` (~10 ms) y la ausencia de dependencias de `promptdoctor` garantizan que el análisis completo se resuelva en **menos de 100 ms** para prompts de hasta 2,000 tokens, lo que permite una experiencia de validación casi instantánea.
- **Integración con CI/CD:** El endpoint `POST /api/v1/validator/validate` está diseñado para ser consumido también por un pipeline (GitHub Actions, pre-commit hook). El campo `promptText` puede alimentarse desde un archivo, y la respuesta JSON incluye un `exitCode` implícito (basado en la severidad máxima de los hallazgos) para integraciones automatizadas.
- **Accesibilidad:** El `textarea` incluye `aria-describedby` con el contador de caracteres y la estimación de tokens; el informe usa regiones `aria-live="polite"` para anunciar la disponibilidad de resultados.
- **Extensibilidad a Fase 2:** Al igual que en el MVP-01, los campos `targetModel` y `taskNature` se reutilizarán para seleccionar el modelo de ejecución y el contrato de salida en la fase de contract testing.

---

## 10. Registro de Cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0.0 | 2026-11-08 | Arquitectura de Solución | Versión inicial del documento de detalle del MVP-02. |

---

*Fin del documento. Volver al [documento maestro](../README.md).*