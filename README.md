#  Novel Weaver AI 📖✨

<p align="center">
  <img src="https://i.imgur.com/b3_10.png" alt="Novel Weaver AI Banner" width="600"/>
</p>

<p align="center">
  <strong>Una herramienta impulsada por IA para generar novelas completas e ilustradas a partir de un simple título.</strong>
  <br>
  Para escritores, artistas y cualquiera con una historia que contar.
</p>

---

## **🌟 Descripción General**

Novel Weaver AI utiliza el poder del modelo **Google Gemini** para dar vida a tus ideas. Simplemente proporciona un título, y el script generará una novela rica y estructurada con:

-   **🤖 Una trama y descripción convincentes.**
-   **👨‍👩‍👧‍👦 Un elenco de personajes únicos.**
-   **📚 Una narrativa completa, dividida en capítulos y partes.**
-   **🎨 Hermosas imágenes de storyboard con un estilo artístico consistente.**

Todo se organiza automáticamente en una estructura de carpetas limpia, lista para que puedas leer, editar o expandir.

---

## **🚀 Cómo Empezar**

Sigue estos pasos para generar tu primera novela.

### **1. Prerrequisitos**

Antes de comenzar, asegúrate de tener Python instalado en tu sistema. Este proyecto requiere **Python 3.7+**.

-   **Verifica tu versión de Python:**
    Abre una terminal o símbolo del sistema y ejecuta:
    ```bash
    python --version
    # Si eso no funciona, intenta con:
    python3 --version
    ```
-   **¿No tienes Python?**
    Si no tienes Python instalado, descárgalo desde el [sitio web oficial de Python](https.www.python.org/downloads/).

### **2. Configura tu Clave de API**

Este script requiere una clave de API de Google Generative AI.

-   **Obtén tu clave:**
    Puedes obtener una desde el sitio web de [Google AI for Developers](https://ai.google.dev/).
-   **Establécela como una variable de entorno:**
    Para mantener tu clave segura, **no** la escribas directamente en el script. En su lugar, establécela como una variable de entorno llamada `GOOGLE_API_KEY`.

    -   **macOS/Linux:**
        ```bash
        export GOOGLE_API_KEY="TU_CLAVE_DE_API_AQUÍ"
        ```
        *(Para que esto sea permanente, agrega la línea a tu archivo `.bashrc`, `.zshrc` o de configuración de tu shell.)*

    -   **Windows (Símbolo del sistema):**
        ```bash
        set GOOGLE_API_KEY="TU_CLAVE_DE_API_AQUÍ"
        ```

    -   **Windows (PowerShell):**
        ```powershell
        $Env:GOOGLE_API_KEY="TU_CLAVE_DE_API_AQUÍ"
        ```

### **3. Instala las Dependencias**

Este proyecto depende de las bibliotecas `google-generativeai` y `toga`. Instálalas usando pip:
```bash
pip install google-generativeai toga
# O, si usas python3:
python3 -m pip install google-generativeai toga
```

### **4. Ejecuta el Script**

¡Ya está todo listo! Puedes generar tu novela de dos maneras:

**Opción A: Interfaz Gráfica (Recomendado)**

Ejecuta el siguiente comando para abrir la aplicación de escritorio:
```bash
python gui.py
```
Introduce el título de tu novela en el campo de texto y haz clic en "Generar Novela".

**Opción B: Línea de Comandos**

Si prefieres usar la terminal, ejecuta el script `main.py` con el título de tu novela:
```bash
python main.py "La Isla Encantada de Brench"
```
> **Consejo:** Recuerda encerrar los títulos con espacios entre comillas.

Ambas opciones crearán una nueva carpeta con la fecha actual y el título de tu novela, que contendrá todos los archivos generados.

---

## **📁 Estructura de Carpetas**

Así es como se ve la salida:
```
YYYY-MM-DD - tu_titulo_de_novela/
├── novela_base.json
├── novela_completa.json
├── novela_completa.txt
├── 01-capitulo_uno/
│   ├── parte_1.txt
│   └── imagenes/
│       ├── imagen_1.png
│       └── ...
└── ...
```

---

## **🤔 Solución de Problemas**

Aquí hay soluciones a problemas comunes:

-   **`Error: python: command not found`**
    Esto significa que el comando `python` no se reconoce. Intenta usar `python3` en su lugar. Si ninguno de los dos funciona, es posible que necesites [instalar Python](https.www.python.org/downloads/) o agregarlo al PATH de tu sistema.

-   **`Error: No GOOGLE_API_KEY found in environment variables.`**
    El script no pudo encontrar tu clave de API. Asegúrate de haber configurado correctamente la variable de entorno `GOOGLE_API_KEY` para tu sistema operativo (consulta el Paso 2).

-   **`pip: command not found`**
    Esto puede ocurrir en algunos sistemas. Intenta ejecutar `python -m pip` o `python3 -m pip` en su lugar.

---

## **✍️ Autor**

Este script fue diseñado para automatizar la creación de novelas e inspirar la creatividad. Si tienes ideas para mejorarlo, ¡no dudes en contribuir!
