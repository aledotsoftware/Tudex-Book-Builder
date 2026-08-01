# 🐍 Scripts de Generación en Python

Esta carpeta contiene utilidades de consola escritas en Python para la generación de novelas y cuentos con la API de Google Gemini.

## 🛠️ Requisitos

1. Asegúrate de tener configurada la variable de entorno `GEMINI_API_KEY`:
   ```bash
   export GEMINI_API_KEY="tu_clave_api_gemini"
   ```

2. Instalar dependencias en el entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install google-generativeai
   ```

## 🚀 Uso del Script Principal (`bb9.py`)

```bash
python scripts/bb9.py "Título de la Novela"
```

El script creará automáticamente la estructura de la historia, expandirá sus capítulos y generará ilustraciones en el directorio de salida.
