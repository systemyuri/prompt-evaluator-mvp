# Backend Java — Prompt Evaluator API Gateway

Este microservicio actúa como **API Gateway** y capa de orquestación. Recibe las peticiones del frontend, valida el contrato de datos (Bean Validation) y se comunica con el motor de validación en Python.

## 🛠️ Tecnologías Principales
- **Java 21**
- **Spring Boot 3.3** (Spring Web, Spring WebFlux)
- **WebClient** (para comunicación reactiva y no bloqueante con Python)
- **Bean Validation** (Hibernate Validator)
- **Actuator** (para Health Checks)

## 📂 Estructura del Proyecto

```text
src/main/java/com/example/promptevaluator/
├── config/
│   ├── CorsConfig.java           # Habilitación de CORS para el frontend
│   └── WebClientConfig.java      # Configuración del cliente HTTP hacia Python
├── controller/
│   ├── BuilderValidationController.java # Endpoint MVP-01
│   └── FreeValidationController.java    # Endpoint MVP-02
├── dto/                          # Data Transfer Objects (Records de Java 21)
├── service/
│   └── PythonValidatorService.java # Lógica de comunicación con el motor Python
└── PromptEvaluatorApplication.java # Clase Main
```

## 🚀 Ejecución Local (sin Docker)

Requiere tener Java 21 y Maven instalados.

1. Compilar y ejecutar:
   ```bash
   ./mvnw spring-boot:run
   ```
2. El servidor estará disponible en `http://localhost:8080`.
3. Verificar estado (Health Check): `http://localhost:8080/actuator/health`

## 🐳 Ejecución con Docker

Para reconstruir el contenedor después de hacer cambios en el código Java:

```bash
docker compose up -d --build backend-java
```

## 🔗 Endpoints Principales
- `POST /api/v1/builder/validate`: Recibe la estructura de datos ensamblada desde el Constructor (MVP-01).
- `POST /api/v1/validator/validate`: Recibe el texto libre pegado desde el Validador (MVP-02).

## 🔗 Variables de Entorno
- `VALIDATOR_PYTHON_URL`: URL base del microservicio Python (Por defecto en Docker: `http://validator-python:8000`).