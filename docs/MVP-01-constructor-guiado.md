---
title: MVP-01 — Constructor Guiado
version: 1.1.0
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

El **Constructor Guiado** es una interfaz que descompone el prompt en bloques fundamentales y guía al usuario para que los complete uno a uno. El sistema ensambla el prompt final, lo envía al motor de validación y presenta un informe de hallazgos con sugerencias de mejora. Además, obliga al usuario a tomar una decisión consciente sobre el formato del prompt.

> **Documento maestro de referencia:** [`README.md`](../README.md).

## 2. Público Objetivo y Casos de Uso

- **Perfil primario:** Analistas, product managers, desarrolladores que necesitan crear un prompt desde cero.
- **Resultado esperado:** Un prompt validado, con un informe que indica si la estructura es sólida y una recomendación de formato alineada con el modelo objetivo.

## 3. Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript + **Tailwind CSS** | Interfaz interactiva, responsiva y moderna con componentes accesibles. |
| Backend (Gateway) | Spring Boot 3 + Spring Web + Bean Validation + **CorsConfig** | Validación del contrato de entrada; orquestación de la llamada a Python. |
| Motor de validación | Python 3.11+ + FastAPI + `promptdoctor` + `promptqc` (`--fast`) + `promptclarity-sdk` | Linting estático y scoring sin ejecución de LLM. |
| Infraestructura | Docker + Docker Compose | Reproducibilidad de los tres servicios. |

## 4. Estructura de Carpetas Detallada

```text
MVP-01/
├── frontend/
│   └── src/
│       ├── components/shared/          # FormatSelector, TokenEstimator
│       ├── pages/BuilderPage.tsx       # Formulario principal
│       └── index.css                   # Directivas de Tailwind
├── backend-java/
│   └── src/main/java/com/example/promptevaluator/
│       ├── config/CorsConfig.java      # Configuración CORS para el frontend
│       ├── controller/BuilderValidationController.java
│       └── dto/BuilderValidationRequest.java
└── validator-python/
    └── app/
        ├── aggregator.py               # Ensamblado y orquestación de SDKs
        └── linters/                    # Wrappers con fallback (try/except)
```

## 5. Flujo de Usuario (UI)

1. **Contexto:** El usuario indica el modelo objetivo y la naturaleza de la tarea.
2. **Rellenar bloques:** El formulario presenta campos con etiquetas accesibles (`label`) para Rol, Tarea, Contexto, Restricciones y Formato de salida.
3. **Selección de formato:** El componente `FormatSelector` muestra tarjetas con las ventajas y precauciones de cada formato.
4. **Validar:** El botón envía el JSON a Java. Los resultados se muestran en un panel lateral con el Score, la estimación de tokens, la recomendación y los hallazgos.

## 6. Contrato de API (Backend Java)

**Endpoint:** `POST /api/v1/builder/validate`

**Request (JSON):**
```json
{
  "role": "Eres un analista financiero senior...",
  "task": "Clasifica el siguiente ticket...",
  "context": "El ticket proviene de...",
  "constraints": ["No inventes categorías", "Usa 'unknown' si es ambiguo"],
  "outputFormat": "JSON con claves category, urgency, summary",
  "targetModel": "gpt-4o-mini",
  "taskNature": "reasoning",
  "chosenFormat": "markdown"
}
```

## 7. Lógica del Motor de Validación (Python)

1. **Ensamblado:** Concatena los bloques según el `chosenFormat` (Markdown, Texto plano, JSON, etc.).
2. **Ejecución de linters:** 
   * `promptdoctor_runner.py`
   * `promptqc_runner.py`
   * `promptclarity_runner.py`
3. **Agregación:** `aggregator.py` unifica los hallazgos, calcula el score y llama a `format_advisor.py`.

> ⚠️ **Nota de Implementación (MVP Fallback):** Dado que los SDKs de validación están en desarrollo activo, los archivos en `linters/` implementan bloques `try/except`. Si un SDK falla o no está instalado, el sistema **no lanza un error 500**; captura la excepción, registra un warning y devuelve un análisis base (score 70, 0 hallazgos) para no romper la experiencia de usuario.

## 8. Componentes Compartidos

- `FormatSelector.tsx`: Tarjetas seleccionables para elegir formato.
- `TokenEstimator.tsx`: Barra de progreso visual para la sobrecarga de tokens.

## 9. Consideraciones de Diseño

- **Persistencia:** El estado vive en React. No hay base de datos.
- **Accesibilidad y Responsividad:** La UI usa Tailwind CSS con un enfoque *Mobile First*, etiquetas `<label>` vinculadas a los inputs, y contraste de colores adecuado.
- **Extensibilidad:** El contrato incluye `targetModel` y `taskNature`, preparados para la Fase 2.

## 10. Registro de Cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.1.0 | 2026-11-08 | David Yurivilca | Actualización de Stack (Tailwind, CORS) y documentación del mecanismo Fallback en Python. |
| 1.0.0 | 2026-11-08 | David Yurivilca | Versión inicial. |