# Novel Weaver Studio 📖✨

<p align="center">
  <img src="https://i.imgur.com/b3_10.png" alt="Novel Weaver Studio Banner" width="600"/>
</p>

<p align="center">
  <strong>Un IDE de escritura de novelas impulsado por IA para crear mundos completos, desde el concepto hasta el manuscrito ilustrado.</strong>
  <br>
  Para escritores, artistas y cualquiera con una historia que contar.
</p>

---

## **🌟 La Visión: Un Estudio de Escritura Digital**

Novel Weaver Studio es un **Entorno de Desarrollo Integrado (IDE) para escritores**. La aplicación actúa como un tablero de corcho interactivo, permitiéndote gestionar cada aspecto de tu universo narrativo—desde la estructura de alto nivel hasta los detalles de tus personajes y lugares—mientras colaboras con la IA de Google Gemini.

### **Metáfora de Diseño**

-   **Disposición de Tres Columnas**:
    1.  **Navegación y Estructura**: El esqueleto de tu novela.
    2.  **Edición y Visualización Principal**: El corazón de tu escritura.
    3.  **Herramientas y Catálogos Contextuales**: El cerebro y la memoria de tu mundo.
-   **Tecnología**: Construido con **Toga** para una experiencia de escritorio nativa y multiplataforma.

---

## **🚀 Cómo Empezar: Guía para Principiantes**

### **1. Prerrequisitos: Python**

Asegúrate de tener **Python 3.7+** instalado. Para verificar, abre una terminal y ejecuta:
```bash
python3 --version
```
Si no tienes Python, descárgalo desde el [sitio web oficial](https://www.python.org/downloads/).

### **2. Configuración del Proyecto**

**a. Crea un Entorno Virtual**

Un entorno virtual es una carpeta que contiene todas las dependencias de tu proyecto, aislándolas del resto de tu sistema. Es una práctica recomendada para todos los proyectos de Python.

```bash
# Navega a la carpeta de tu proyecto
cd ruta/a/Novel-Weaver-Studio

# Crea el entorno virtual (puedes llamarlo 'venv' o como prefieras)
python3 -m venv venv

# Activa el entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows (PowerShell):
.\\venv\\Scripts\\Activate.ps1
```
Verás `(venv)` al principio de la línea de tu terminal, indicando que el entorno está activo.

**b. Instala las Dependencias**

Usa el archivo `requirements.txt` para instalar todas las dependencias necesarias con un solo comando:
```bash
pip install -r requirements.txt
```
Esto soluciona errores como `ModuleNotFoundError: No module named 'toga'`.

### **3. Configura tu Clave de API de Google**

-   **Obtén tu clave**: Visita [Google AI for Developers](https://ai.google.dev/).
-   **Establécela como una variable de entorno**:
    ```bash
    # En macOS/Linux:
    export GOOGLE_API_KEY="TU_CLAVE_DE_API_AQUÍ"
    # En Windows (PowerShell):
    $Env:GOOGLE_API_KEY="TU_CLAVE_DE_API_AQUÍ"
    ```

### **4. Ejecuta la Aplicación**

Con el entorno virtual activado, lanza Novel Weaver Studio:
```bash
python3 gui.py
```

---
## **🖼️ Hoja de Ruta y Diseño de la Interfaz**

Esta sección detalla la visión completa de la interfaz de Novel Weaver Studio.

### **Columna Izquierda: Navegación y Estructura (El 'Esqueleto')**
-   **Estructura de la Novela**: Una vista de árbol (`toga.Tree`) expandible para navegar y reordenar el contenido (Libro > Partes > Capítulos > Escenas).
-   **Catálogo Global**: Acceso rápido a los catálogos de Personajes, Lugares, Especies, etc.
-   **Configuración del Proyecto**: Define las reglas globales para la IA (género, tono, estilo de ilustración).

### **Columna Central: Edición y Generación Principal (El 'Cuerpo')**
-   **Editor de Texto Enriquecido**: Un editor WYSIWYG para escribir y formatear el contenido.
-   **Ventana de Comando para IA**: Un área de texto para interactuar con Gemini de forma contextual (reescribir, expandir, etc.).
-   **Visor de Storyboard**: Una galería para visualizar y regenerar las ilustraciones de la escena.

### **Columna Derecha: Catálogos y Herramientas (El 'Cerebro')**
-   **Ficha de Elemento**: Muestra la ficha detallada del elemento seleccionado (personaje, lugar, etc.).
-   **Editor de Fichas (YAML/JSON)**: Un formulario para editar los atributos de los elementos de tu mundo, alimentando a la IA con datos canónicos.
-   **Herramientas de Coherencia**: Recibe alertas de la IA sobre posibles inconsistencias narrativas.
---

## **💾 Guardado y Carga de Proyectos**

El proyecto utiliza un formato de archivo **`.tls`** (Tudex Litria Studio) basado en YAML. Gestiona tus archivos usando el menú de la aplicación (`Nuevo Proyecto`, `Abrir`, `Guardar`).
