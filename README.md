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

Novel Weaver Studio está evolucionando de ser un simple generador de novelas a un **Entorno de Desarrollo Integrado (IDE) para escritores**. La aplicación actúa como un tablero de corcho interactivo, permitiéndote gestionar cada aspecto de tu universo narrativo, desde la estructura de alto nivel hasta los detalles más pequeños de tus personajes y lugares, todo mientras colaboras con la IA de Google Gemini.

### **Metáfora de Diseño: Un Estudio de Escritura Digital**

-   **Disposición de Tres Columnas**: La interfaz está diseñada para ofrecer una visión completa de tu proyecto:
    1.  **Navegación y Estructura**: El esqueleto de tu novela.
    2.  **Edición y Visualización Principal**: El corazón de tu escritura.
    3.  **Herramientas y Catálogos Contextuales**: El cerebro y la memoria de tu mundo.
-   **Tecnología**: Construido con **Toga** para una experiencia de escritorio nativa y multiplataforma.

---

## **🚀 Cómo Empezar**

Sigue estos pasos para configurar tu estudio y comenzar a escribir.

### **1. Prerrequisitos**

Asegúrate de tener **Python 3.7+** instalado.

-   **Verifica tu versión de Python**:
    ```bash
    python3 --version
    ```
-   **¿No tienes Python?** Descárgalo desde el [sitio web oficial de Python](https://www.python.org/downloads/).

### **2. Configura tu Clave de API**

Necesitarás una clave de API de Google Generative AI.

-   **Obtén tu clave**: Visita [Google AI for Developers](https://ai.google.dev/).
-   **Establécela como una variable de entorno** para mantenerla segura:

    -   **macOS/Linux**:
        ```bash
        export GOOGLE_API_KEY="TU_CLAVE_DE_API_AQUÍ"
        ```
    -   **Windows (PowerShell)**:
        ```powershell
        $Env:GOOGLE_API_KEY="TU_CLAVE_DE_API_AQUÍ"
        ```

### **3. Instala las Dependencias**

Instala las bibliotecas necesarias usando pip:
```bash
pip install google-generativeai toga ruamel.yaml
# O, si usas python3:
python3 -m pip install google-generativeai toga ruamel.yaml
```

### **4. Ejecuta la Aplicación**

Lanza Novel Weaver Studio con el siguiente comando:
```bash
python3 gui.py
```

---

## **💾 Guardado y Carga de Proyectos**

Novel Weaver Studio guarda tus proyectos en un formato de archivo personalizado, **`.tls`** (Tudex Litria Studio). Este archivo es una representación de tu novela en formato YAML, lo que lo hace legible y fácil de editar si es necesario.

-   **Nuevo Proyecto**: Crea un nuevo proyecto desde el menú de la aplicación.
-   **Guardar**: Guarda tu progreso actual en el archivo `.tls` asociado.
-   **Guardar Como...**: Guarda tu trabajo en un nuevo archivo `.tls`.
-   **Abrir**: Carga un proyecto de novela desde un archivo `.tls` existente.

---

## **🖼️ Diseño de la Interfaz (Wireframe Conceptual)**

### **1. Columna Izquierda: Navegación y Estructura (El 'Esqueleto')**

Aquí gestionas el flujo narrativo de tu proyecto.

-   **Estructura de la Novela**: Una vista de árbol expandible (Libro > Partes > Capítulos > Escenas) que puedes reordenar arrastrando y soltando.
-   **Catálogo Global**: Acceso rápido a todos los elementos de tu mundo (Personajes, Lugares, Especies, etc.).
-   **Configuración del Proyecto**: Define las reglas globales para la IA, como el género, el tono y el estilo de ilustración.

### **2. Columna Central: Edición y Generación Principal (El 'Cuerpo')**

Tu principal área de trabajo para la escritura y la colaboración con la IA.

-   **Editor de Texto Enriquecido**: Escribe y formatea el texto de la escena o capítulo seleccionado.
-   **Ventana de Comando/Prompt para IA**: Interactúa con Gemini de forma contextual. Resalta un párrafo y pide a la IA que lo "reescriba en un tono más sombrío" o "expanda esta descripción".
-   **Visor de Storyboard**: Visualiza las ilustraciones generadas para la escena actual, con opciones para regenerar o ajustar el estilo.

### **3. Columna Derecha: Catálogos de Referencia y Herramientas Contextuales (El 'Cerebro')**

Esta columna es dinámica y muestra información relevante a lo que estás haciendo.

-   **Ficha de Elemento**: Muestra la ficha detallada del personaje, lugar o elemento seleccionado.
-   **Editor de Fichas (YAML/JSON)**: Edita los atributos de los elementos de tu mundo. Aquí es donde alimentas a la IA con los datos canónicos de tu universo.
-   **Herramientas de Coherencia**: Recibe alertas de la IA sobre posibles inconsistencias narrativas.

---

## **🤔 Solución de Problemas**

-   **`Error: python3: command not found`**: Asegúrate de que [Python esté instalado](https://www.python.org/downloads/) y en el PATH de tu sistema.
-   **`Error: No GOOGLE_API_KEY found...`**: Verifica que la variable de entorno `GOOGLE_API_KEY` esté configurada correctamente.
-   **`pip: command not found`**: Intenta usar `python3 -m pip` en su lugar.

---

## **✍️ Autor**

Este proyecto está en desarrollo activo. ¡Las contribuciones e ideas son bienvenidas!
