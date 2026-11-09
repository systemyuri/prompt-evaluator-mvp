---
title: MVP-02 — Validador Libre
version: 1.1.0
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

El **Validador Libre** permite al usuario pegar un prompt ya redactado y obtener un diagnóstico completo. No impone una estructura de entrada; acepta el texto tal cual y lo analiza.

> **Documento maestro de referencia:** [`README.md`](../README.md).

## 2. Público Objetivo y Casos de Uso

- **Perfil primario:** Desarrolladores o equipos que mantienen un catálogo de prompts y necesitan auditorías.
- **Integración CI/CD:** El endpoint está diseñado para ser consumido por pipelines (ej. GitHub Actions) para bloquear merges si hay errores.

## 3. Stack Tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript + **Tailwind CSS** | Interfaz limpia, responsiva y accesible. |
| Backend (Gateway) | Spring Boot 3 + Spring Web + Bean Validation + **CorsConfig** | Contrato de entrada simple (`promptText`). |
| Motor de validación | Python 3.11+ + FastAPI + SDKs | Detección de formato y validación. |
| Infraestructura | Docker + Docker Compose | Compartición del servicio Python con MVP-01. |

## 4. Estructura de Carpetas Detallada

```text
MVP-02/
├── frontend/
│   └── src/pages/FreeValidatorPage.tsx # UI con textarea y panel de resultados
├── backend-java/
│   └── src/main/java/com/example/promptevaluator/
│       ├── config/CorsConfig.java
│       └── controller/FreeValidationController.java
└── validator-python/
    └── app/
        ├── format_detector.py          # Detección heurística (MD, JSON, XML, etc.)
        └── aggregator.py               # Reutilizado
```

## 5. Flujo de Usuario (UI)

1. **Pegar:** El usuario usa un `textarea` grande.
2. **Metadatos (Opcional):** Puede indicar el modelo y la tarea para mejorar la recomendación.
3. **Analizar:** El botón envía el texto a Java.
4. **Informe:** Se renderiza el Score, el formato detectado, la recomendación y la lista de hallazgos.

## 6. Contrato de API (Backend Java)

**Endpoint:** `POST /api/v1/validator/validate`

**Request (JSON):**
```json
{
  "promptText": "Eres un asistente útil. Responde conciso pero detallado...",
  "targetModel": "gpt-4o-mini",
  "taskNature": "reasoning"
}
```

## 7. Lógica del Motor de Validación (Python)

1. **Detección de Formato:** `format_detector.py` analiza si el texto es Markdown, JSON, XML, YAML o Texto Plano.
2. **Ejecución de linters:** Se ejecutan los mismos wrappers que en MVP-01.
3. **Recomendación:** `format_advisor.py` cruza el formato detectado con los metadatos opcionales.

> ⚠️ **Nota de Implementación (MVP Fallback):** Al igual que en MVP-01, los wrappers de los SDKs están envueltos en `try/except`. Si fallan, el sistema devuelve una validación base (score 70) en lugar de romper el servicio.

## 8. Componentes Compartidos

- `TokenEstimator.tsx` y el diseño de tarjetas de resultados.

## 9. Consideraciones de Diseño

- **Privacidad:** El servicio Python no persiste el texto. Los logs solo guardan metadatos (longitud, tiempo).
- **Rendimiento:** El análisis se resuelve en < 100ms para prompts de 2,000 tokens.
- **Accesibilidad:** El `textarea` incluye `aria-describedby` para el contador de tokens y la estimación.

## 10. Registro de Cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.1.0 | 2026-11-08 | Arquitectura de Solución | Actualización de Stack (Tailwind, CORS) y documentación del mecanismo Fallback. |
| 1.0.0 | 2026-11-08 | Arquitectura de Solución | Versión inicial. |