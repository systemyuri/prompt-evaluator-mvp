# Validator Python — Motor de Validación Estática

Este microservicio es el núcleo analítico del proyecto. Recibe el texto del prompt y utiliza SDKs especializados para analizar su estructura, detectar anti-patrones y recomendar el mejor formato, **sin ejecutar el prompt en ningún LLM**.

## 🛠️ Tecnologías Principales
- **Python 3.11**
- **FastAPI** (Framework web de alto rendimiento)
- **Pydantic** (Validación de datos y modelado)
- **SDKs de Validación:** `promptdoctor`, `promptqc`, `promptclarity-sdk`

## 📂 Estructura del Proyecto

```text
app/
├── linters/                 # Wrappers (adaptadores) para cada SDK
│   ├── promptdoctor_runner.py
│   ├── promptqc_runner.py
│   └── promptclarity_runner.py
├── aggregator.py            # Unifica hallazgos y calcula el Score global
├── format_advisor.py        # Lógica de recomendación según modelo/tarea
├── format_detector.py       # Detecta si el prompt pegado es MD, JSON, XML, etc.
├── models.py                # Esquemas Pydantic de Request/Response
└── main.py                  # Endpoints de FastAPI
```

## ⚠️ Nota Importante sobre el MVP (Modo Fallback)
Dado que los SDKs de validación (`promptdoctor`, etc.) son librerías en evolución, los archivos dentro de `linters/` están envueltos en bloques `try/except`. 
Si una librería no está disponible o falla, el sistema **no se cae**; devuelve un score base (70) y 0 hallazgos (modo demo). Los logs de Docker advertirán si algún SDK falló al iniciar.

## 🚀 Ejecución Local (sin Docker)

1. Crear y activar un entorno virtual:
   ```bash
   python -m venv venv
   # En Windows:
   venv\Scripts\activate
   # En Mac/Linux:
   source venv/bin/activate
   ```
2. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Iniciar el servidor con recarga automática (Hot Reload):
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
4. Documentación interactiva generada automáticamente (Swagger UI): `http://localhost:8000/docs`

## 🐳 Ejecución con Docker

Para reconstruir el contenedor (necesario si agregas nuevas librerías al `requirements.txt`):

```bash
docker compose up -d --build validator-python
```

## 🔗 Endpoints Principales
- `GET /health`: Health check para que Docker sepa que el servicio está listo.
- `POST /validate/builder`: Recibe JSON estructurado, ensambla el prompt según el formato elegido y lo valida.
- `POST /validate/free`: Recibe texto libre, detecta el formato (heurística) y lo valida.