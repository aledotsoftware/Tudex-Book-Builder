# Generador de Novelas Ilustradas con Gemini 2

Este proyecto permite generar una novela completa —incluyendo personajes, estructura narrativa, capítulos extensos, y storyboard visual— utilizando el modelo **Gemini 2** de Google. Ideal para escritores, creativos y desarrolladores que quieran experimentar con IA para la creación de historias visuales.

---

## 📦 Requisitos

- Python 3.7+
- API Key de Google Generative AI (`google.generativeai`)
- Paquetes Python:
  ```bash
  pip install google-generativeai
```
---

## **🚀 Uso**

```
python main.py "Título de tu novela"
```
> Asegurate de incluir el título entre comillas si contiene espacios.

---

## **🧠 ¿Qué hace este script?**

1. **Genera una descripción general** de la novela basada en el título.
2. **Estructura narrativa en JSON****, con:**
   * Descripción
   * Personajes
   * Lista de capítulos con resumen
3. **Expande automáticamente cada capítulo****, generando:**
   * Texto completo dividido en partes
   * Desarrollo emocional, narrativo y diálogos realistas
4. **Crea imágenes tipo storyboard** cada ciertos párrafos, con estilo:
   * Acuarela, lápiz de colores, tonos pastel, texturas suaves
5. **Guarda todo organizado por carpetas****, incluyendo:**
   * JSON de base
   * Archivos **.txt** por parte y novela completa
   * Carpeta de imágenes por capítulo

---

## **📁 Estructura de Carpetas Generada**

```
YYYY-MM-DD - titulo_slug/
├── novela_base.json
├── novela_completa.json
├── novela_completa.txt
├── 01 - capitulo_1/
│   ├── parte_1.txt
│   ├── parte_2.txt
│   └── imagenes/
│       ├── imagen_1.png
│       └── ...
└── ...
```
---

## **⚠️ Notas**

* El modelo puede generar texto repetitivo. Ajustá los *prompts* o el **slugify()** si querés mejorar estilo o longitud.
* Asegurate de tener configurado correctamente el acceso a la API de Google.
* Las imágenes se generan usando el método **model.generate_image(prompt)**. Podés adaptar esto según tu implementación específica del modelo de imagen.

---

## **✍️ Autor**

Este script fue diseñado para automatizar la creación de novelas y fomentar la creatividad combinando texto e imagen. Si tenés ideas para mejorarlo, ¡hacelas llegar!

---

## **🔐 API Key**

Recordá **no exponer tu API Key** en repositorios públicos. Usá variables de entorno o archivos **.env** para mantener la seguridad en producción.

---
