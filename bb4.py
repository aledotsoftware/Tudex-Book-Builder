
#    genai.configure(api_key="AIzaSyAYjVMMfmrl21wInHKaKCb9AvZIsbolKiA")
import os
import sys
import json
import google.generativeai as genai
from datetime import datetime

def generate_novel(title):
    # Configurar la API Key
    genai.configure(api_key="AIzaSyAYjVMMfmrl21wInHKaKCb9AvZIsbolKiA")

    # Crear la instancia del modelo
    model = genai.GenerativeModel("gemini-2.0-flash")

    # Obtener una descripción detallada de la novela basada en el título
    description_prompt = f"Proporciona una descripción detallada para una novela titulada '{title}'."
    description_response = model.generate_content(description_prompt)
    description = description_response.text.strip()

    # Definir el prompt para generar la novela completa en formato JSON
    novel_prompt = f"""
    Basado en la siguiente descripción:

    {description}
    Instrucciones:
    - Incluye una introducción narrativa, una lista de personajes principales (con nombres, características y roles),
      diálogos naturales y descripciones detalladas.
    - Mantén coherencia en la trama y en la evolución de los personajes.
    - Genera una novela completa estructurada en formato JSON con el siguiente esquema:
    {{
        "title": "{title}",
        "description": "Descripción de la novela.",
        "characters": [
            {{"name": "Nombre del personaje", "description": "Descripción del personaje"}}
            // Más personajes
        ],
        "chapters": [
            {{"title": "Título del capítulo", "content": "Contenido del capítulo"}}
            // Más capítulos
        ]
    }}

    Asegúrate de incluir al menos 5 capítulos resumidos y proporcionar detalles completos(introduccion, desarrollo, climax y cierre) para cada sección narrativa.
        - Mantén coherencia en la trama y en la evolución de los personajes.

    """
    response = model.generate_content(novel_prompt, generation_config=genai.types.GenerationConfig(response_mime_type="application/json"))

    # Parsear la respuesta JSON
    novel_data = json.loads(response.text)

    # Crear la carpeta para la novela con el formato 'YYYY-MM-DD - Título de la novela'
    date_str = datetime.now().strftime("%Y-%m-%d")
    novel_folder = f"{date_str} - {title}"
    os.makedirs(novel_folder, exist_ok=True)

    # Guardar el archivo JSON completo de la novela
    novel_json_path = os.path.join(novel_folder, "novela_completa.json")
    with open(novel_json_path, 'w', encoding='utf-8') as json_file:
        json.dump(novel_data, json_file, ensure_ascii=False, indent=4)

    # Crear carpetas y archivos para cada capítulo
    for idx, chapter in enumerate(novel_data.get("chapters", []), start=1):
        chapter_folder = os.path.join(novel_folder, f"{idx} - {chapter['title']}")
        os.makedirs(chapter_folder, exist_ok=True)
        chapter_path = os.path.join(chapter_folder, "contenido.txt")
        with open(chapter_path, 'w', encoding='utf-8') as chapter_file:
            chapter_file.write(chapter['content'])

    print(f"Novela '{title}' generada exitosamente en la carpeta '{novel_folder}'.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python bb.py \"Título de la novela\"")
        sys.exit(1)
    novel_title = sys.argv[1]
    print("Generando.")
    generate_novel(novel_title)
