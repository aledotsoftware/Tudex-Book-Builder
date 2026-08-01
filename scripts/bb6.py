import os
import sys
import json
import google.generativeai as genai
from datetime import datetime

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def generate_novel(title):
    genai.configure(api_key="AIzaSyAYjVMMfmrl21wInHKaKCb9AvZIsbolKiA")
    model = genai.GenerativeModel("gemini-2.0-flash")

    # Descripción general
    log("Generando descripción general de la novela...")
    description_prompt = f"Proporciona una descripción detallada para una novela titulada '{title}'."
    description_response = model.generate_content(description_prompt)
    description = description_response.text.strip()

    # Prompt de novela
    log("Generando estructura base de la novela...")
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
        ],
        "chapters": [
            {{"title": "Título del capítulo", "summary": "Resumen breve del capítulo"}}
        ]
    }}

    Incluye al menos 50 capítulos con una progresión narrativa clara.
    """
    response = model.generate_content(
        novel_prompt,
        generation_config=genai.types.GenerationConfig(response_mime_type="application/json")
    )

    novel_data = json.loads(response.text)

    # Crear carpeta
    date_str = datetime.now().strftime("%Y-%m-%d")
    novel_folder = f"{date_str} - {title}"
    os.makedirs(novel_folder, exist_ok=True)

    # Guardar novela base
    base_json_path = os.path.join(novel_folder, "novela_base.json")
    with open(base_json_path, 'w', encoding='utf-8') as json_file:
        json.dump(novel_data, json_file, ensure_ascii=False, indent=4)

    log("Estructura base guardada.")

    # Expandir capítulos uno por uno
    extended_chapters = []
    for idx, chapter in enumerate(novel_data["chapters"], start=1):
        log(f"Expandiendo capítulo {idx}: {chapter['title']}")
        expand_prompt = f"""
        Basado en el siguiente resumen de capítulo:

        "{chapter['summary']}"

        Expande este capítulo en una narración completa y profesional con:
        - Texto largo y atrapante.
        - Diálogos creíbles y naturales.
        - Descripciones detalladas.
        - Desarrollo emocional.
        - Narrativa rica y envolvente.
        - utiliza variedad léxica
        - evita repetir estructuras gramaticales similares
        - cambia el tono entre capítulos
        Entrega solo el texto completo del capítulo, sin introducciones ni anotaciones.
        """
        expansion_response = model.generate_content(expand_prompt)
        full_content = expansion_response.text.strip()

        # Guardar capítulo
        chapter_folder = os.path.join(novel_folder, f"{idx:02d} - {chapter['title']}")
        os.makedirs(chapter_folder, exist_ok=True)

        chapter_txt = os.path.join(chapter_folder, "contenido.txt")
        with open(chapter_txt, 'w', encoding='utf-8') as f:
            f.write(full_content)

        # Guardar para archivo JSON final
        extended_chapters.append({
            "title": chapter["title"],
            "content": full_content
        })

    # Actualizar novela con capítulos expandidos
    final_novel_data = {
        "title": novel_data["title"],
        "description": novel_data["description"],
        "characters": novel_data["characters"],
        "chapters": extended_chapters
    }

    final_path = os.path.join(novel_folder, "novela_completa.json")
    with open(final_path, 'w', encoding='utf-8') as json_file:
        json.dump(final_novel_data, json_file, ensure_ascii=False, indent=4)    # Crear archivo legible concatenado
    novela_txt_path = os.path.join(novel_folder, "novela_completa.txt")
    with open(novela_txt_path, 'w', encoding='utf-8') as f:
        f.write(f"TÍTULO: {final_novel_data['title']}\n\n")
        f.write(f"DESCRIPCIÓN:\n{final_novel_data['description']}\n\n")
        f.write("PERSONAJES PRINCIPALES:\n")
        for char in final_novel_data["characters"]:
            f.write(f"- {char['name']}: {char['description']}\n")
        f.write("\n\n---\n\n")

        for idx, chapter in enumerate(final_novel_data["chapters"], start=1):
            f.write(f"Capítulo {idx}: {chapter['title']}\n\n")
            f.write(chapter["content"])
            f.write("\n\n---\n\n")

        f.write("NOTA FINAL:\n")
        f.write(
            "⚠️ Importante: Se ha detectado que los capítulos generados pueden contener patrones repetitivos en estructura, vocabulario o estilo.\n"
            "Para mejorar la calidad narrativa, se recomienda ajustar los prompts incluyendo instrucciones claras como: 'utiliza variedad léxica', 'evita repetir estructuras gramaticales similares', o 'cambia el tono entre capítulos'.\n"
        )


    log(f"✅ Novela '{title}' generada y expandida en: '{novel_folder}'")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python bb.py \"Título de la novela\"")
        sys.exit(1)

    novel_title = sys.argv[1]
    log(f"Comenzando generación de novela: {novel_title}")
    generate_novel(novel_title)
