# 📚 Tudex Book Builder - Comercial Node.js & Docker Edition

**Tudex Book Builder** es una plataforma web comercial lista para producción diseñada para la creación, lectura y exportación de novelas y cuentos ilustrados mediante inteligencia artificial.

Construida sobre la pila **Next.js 14 + React 18 + TypeScript + Tailwind CSS + shadcn/ui**, empaquetada en contenedores **Docker** multietapa.

---

## 🚀 Características Comerciales

- 🧠 **Estructura Narrativa con IA**: Genera tramas inmersivas, desarrollo de personajes y síntesis de capítulos con **Google Gemini 2.0**.
- 🎨 **Storyboarding Ilustrado & Gráficos**: Generación de ilustraciones vectoriales y de escena por capítulo.
- 🐳 **Contenerización Docker**: Imagen de producción multietapa `node:20-alpine` optimizada (`< 200 MB`) con modo `standalone`.
- 💎 **Interfaz shadcn/ui & Glassmorphism**: Componentes UI accesibles, responsivos y estilizados (`Button`, `Card`, `Badge`, `Dialog`, `Progress`).
- 📖 **Lector Interactivo Enriquecido (BookReader)**:
  - Lectura en voz alta (Text-To-Speech) con ajuste de velocidad (`0.75x` a `1.5x`).
  - Selector de temas de lectura (*Oscuro Místico*, *Sepia Cálido*, *Noche Profunda*).
  - Selector de tamaño de fuente dinámico (`A-`, `A`, `A+`).
- 📊 **Panel de Métricas & Administración**: Conteo total de libros, palabras narradas, capítulos y escenas ilustradas. Filtrado y ordenamiento interactivo.
- 📦 **Exportaciones Multiformato**: Exportación instantánea en **Digital Book HTML**, **Texto Plano (.TXT)**, **JSON estructurado** e **Impresión / PDF**.

---

## 🛠️ Requisitos del Sistema

- **Node.js**: `v20.x` o superior (si se ejecuta localmente sin Docker).
- **Docker & Docker Compose** (para despliegue contenerizado).
- **Clave API de Gemini**: `GEMINI_API_KEY` (Google Generative AI).

---

## 🐳 Despliegue con Docker (Recomendado)

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en la plantilla:

```bash
cp .env.example .env
```

Edita `.env` e introduce tu clave API:
```env
GEMINI_API_KEY=tu_clave_api_gemini_aqui
PORT=3000
NODE_ENV=production
```

### 2. Iniciar con Docker Compose

```bash
npm run docker:up
# o directamente:
docker-compose up -d --build
```

La aplicación estará lista y accesible en `http://localhost:3000`. Los datos de las novelas se almacenan de forma persistente en la carpeta `./data`.

---

## 💻 Desarrollo Local (npm)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Proyecto

```
tudex-book-builder/
├── Dockerfile               # Compilación multietapa de producción Docker
├── docker-compose.yml       # Orquestación de servicios y volúmenes persistentes
├── components.json          # Configuración de shadcn/ui
├── next.config.js           # Salida standalone optimizada para contenedores
├── package.json             # Scripts de compilación y comandos Docker
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/    # Endpoints IA (outline, chapter, image)
│   │   │   └── novels/      # Endpoints CRUD de novelas (GET, DELETE, image)
│   │   ├── globals.css      # Variables de color CSS & shadcn
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Dashboard comercial con métricas y biblioteca
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui (Button, Card, Badge, Dialog, Progress)
│   │   ├── BookReader.tsx   # Lector de novelas con TTS y temas visuales
│   │   ├── CreateStoryWizard.tsx # Wizard multicapa para creación con IA
│   │   └── ExportModal.tsx  # Modal de exportación multiformato (HTML, TXT, JSON, PDF)
│   └── lib/
│       └── utils.ts         # Utilidad `cn` para combinación de clases Tailwind
```

---

## 📄 Licencia

Licencia comercial privada. © 2026 Tudex Networks. Todos los derechos reservados.
