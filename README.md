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

La interfaz está diseñada con una **disposición de tres columnas** para ofrecer una visión completa de tu proyecto:
1.  **Navegación y Estructura**: El esqueleto de tu novela.
2.  **Edición y Visualización Principal**: El corazón de tu escritura.
3.  **Herramientas y Catálogos Contextuales**: El cerebro y la memoria de tu mundo.

---

## **🚀 Cómo Empezar**

### **1. Prerrequisitos**

Asegúrate de tener **Python 3.7+** instalado. Para verificar, abre una terminal y ejecuta:
```bash
python3 --version
```
Si no tienes Python, descárgalo desde el [sitio web oficial](https://www.python.org/downloads/).

### **2. Configura tu Clave de API de Google**

-   **Obtén tu clave**: Visita [Google AI for Developers](https://ai.google.dev/).
-   **Establécela como una variable de entorno** para mantenerla segura. En macOS/Linux:
    ```bash
    export GOOGLE_API_KEY="TU_CLAVE_DE_API_AQUÍ"
    ```
    En Windows (PowerShell):
    ```powershell
    $Env:GOOGLE_API_KEY="TU_CLAVE_DE_API_AQUÍ"
    ```

### **3. Instala las Dependencias**
```bash
python3 -m pip install google-generativeai toga ruamel.yaml
```

### **4. Ejecuta la Aplicación**
```bash
python3 gui.py
```

---

## **💾 Guardado y Carga de Proyectos**

Novel Weaver Studio guarda tus proyectos en un formato de archivo personalizado, **`.tls`** (Tudex Litria Studio). Puedes gestionar tus archivos usando el menú de la aplicación (`Nuevo Proyecto`, `Abrir`, `Guardar`, `Guardar Como...`).

---

## **🤔 Solución de Problemas Comunes**

-   **`Error: python3: command not found`**: Asegúrate de que [Python esté instalado](https://www.python.org/downloads/) y en el PATH de tu sistema.
-   **`Error: No GOOGLE_API_KEY found...`**: Verifica que la variable de entorno `GOOGLE_API_KEY` esté configurada.
-   **`pip: command not found`**: Intenta usar `python3 -m pip` en su lugar.

---

## **✍️ Autor**

Este proyecto está en desarrollo activo. ¡Las contribuciones e ideas son bienvenidas!
