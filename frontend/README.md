# Frontend — Prompt Evaluator (React + Vite)

Este módulo es la interfaz de usuario del Prompt Evaluator. Está construido con React, TypeScript y empaquetado con Vite. Utiliza **Tailwind CSS** para un diseño moderno, responsivo y accesible.

## 🛠️ Tecnologías Principales
- **React 18** (con React Router para la navegación)
- **Vite** (Build tool y servidor de desarrollo)
- **TypeScript** (Tipado estricto)
- **Tailwind CSS** (Estilos y diseño de componentes)

## 📂 Estructura del Proyecto

```text
frontend/
├── src/
│   ├── components/
│   │   └── shared/       # Componentes reutilizables (FormatSelector, TokenEstimator)
│   ├── pages/
│   │   ├── BuilderPage.tsx       # Vista del MVP-01 (Constructor)
│   │   └── FreeValidatorPage.tsx # Vista del MVP-02 (Validador)
│   ├── services/         # Cliente HTTP (fetch) hacia el backend Java
│   ├── types/            # Interfaces y tipos de TypeScript compartidos
│   ├── App.tsx           # Layout principal y ruteo
│   ├── index.css         # Directivas de Tailwind y estilos globales
│   └── main.tsx          # Punto de entrada
├── tailwind.config.js    # Configuración de Tailwind
└── vite.config.ts        # Configuración de Vite
```

## 🚀 Ejecución Local (sin Docker)

Si deseas modificar la interfaz y ver los cambios en tiempo real (Hot Reload):

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre `http://localhost:5173` en tu navegador.

## 🐳 Ejecución con Docker

El frontend está configurado para ser servido a través de Nginx en el puerto `80` (mapeado al `5173` en el host).
Para reconstruir el contenedor después de hacer cambios:

```bash
docker compose up -d --build frontend
```

## 🔗 Variables de Entorno

La URL del backend Java se inyecta en tiempo de compilación:
- `VITE_API_BASE_URL`: Por defecto es `http://localhost:8080`.