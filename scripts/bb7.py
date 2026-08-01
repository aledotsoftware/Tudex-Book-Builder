import os
import sys
import json
import random
import re
import google.generativeai as genai
from datetime import datetime

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def slugify(text, max_length=50):
    """
    Convierte un texto en una versión 'slug' adecuada para nombres de archivos o carpetas.
    Se eliminan caracteres no alfanuméricos y se limita la longitud.
    """
    # Eliminar caracteres que no sean alfanuméricos, espacios, guiones o guiones bajos
    text = re.sub(r"[^\w\s-]", "", text)
    # Reemplazar espacios y guiones múltiples por un solo guion bajo
    text = re.sub(r"[-\s]+", "_", text.strip())
    # Truncar si es necesario
    return text[:max_length]

def generate_novel(title):
    # Configurar la API de Generative AI
    genai.configure(api_key="AIzaSyAYjVMMfmrl21wInHKaKCb9AvZIsbolKiA")
    model = genai.GenerativeModel("gemini-2.0-flash")

    # Generar descripción general
    log("Generando descripción general de la novela...")
    description_prompt = f"Proporciona una descripción detallada para una novela titulada '{title}'."
    description_response = model.generate_content(description_prompt)
    description = description_response.text.strip()

    # Generar la estructura base de la novela en formato JSON
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

    Incluye al menos 5 capítulos con una progresión narrativa clara.
    """
    response = model.generate_content(
        novel_prompt,
        generation_config=genai.types.GenerationConfig(response_mime_type="application/json")
    )

    novel_data = json.loads(response.text)

    # Crear carpeta para la novela usando un título 'slug'
    date_str = datetime.now().strftime("%Y-%m-%d")
    short_title = slugify(title)
    novel_folder = f"{date_str} - {short_title}"
    os.makedirs(novel_folder, exist_ok=True)

    # Guardar estructura base en un archivo JSON
    base_json_path = os.path.join(novel_folder, "novela_base.json")
    with open(base_json_path, 'w', encoding='utf-8') as json_file:
        json.dump(novel_data, json_file, ensure_ascii=False, indent=4)
    log("Estructura base guardada.")

    # Expandir y extender cada capítulo
    extended_chapters = []
    for idx, chapter in enumerate(novel_data["chapters"], start=1):
        log(f"Expandiendo capítulo {idx}: {chapter['title']}")
        
        # Generar la expansión inicial del capítulo
        expand_prompt = f"""
        Basado en el siguiente resumen de capítulo:

        "{chapter['summary']}"

        Expande este capítulo en una narración completa y profesional con:
        - Texto largo y atrapante.
        - Diálogos creíbles y naturales.
        - Descripciones detalladas.
        - Desarrollo emocional.
        - Narrativa rica y envolvente.
        - Utiliza variedad léxica.
        - Evita repetir estructuras gramaticales similares.
        - Cambia el tono entre capítulos.
        Entrega solo el texto completo del capítulo, sin introducciones ni anotaciones.
        """
        initial_expansion_response = model.generate_content(expand_prompt)
        initial_expansion = initial_expansion_response.text.strip()

        # Determinar aleatoriamente la cantidad de partes adicionales (2 a 4), para un total entre 3 y 5 partes.
        num_additional_parts = random.randint(2, 4)
        parts = [initial_expansion]
        last_text = initial_expansion  # Se usará para enviar contexto a la siguiente petición

        # Generar cada parte adicional basada en el contenido anterior
        for part_number in range(1, num_additional_parts + 1):
            part_prompt = f"""
            Continúa el siguiente capítulo de una novela, manteniendo coherencia narrativa, el tono literario y desarrollando más a fondo la historia:

            CONTENIDO ANTERIOR (muestra del final para contexto):
            \"\"\"
            {last_text[-1500:]}
            \"\"\"

            GENERA LA PARTE {part_number + 1} del capítulo, con:
            - Texto extenso.
            - Desarrollo emocional.
            - Diálogos creíbles y naturales.
            - Mantener los personajes y la continuidad narrativa.
            
            ⚠️ No repitas texto anterior. Continúa la historia naturalmente.
            """
            part_response = model.generate_content(part_prompt)
            part_text = part_response.text.strip()
            parts.append(part_text)
            last_text += "\n\n" + part_text

        # Concatenar todas las partes para formar el capítulo completo
        full_chapter_content = "\n\n".join(parts)

        # Crear carpeta para el capítulo y guardar cada parte en un archivo separado
        chapter_folder = os.path.join(novel_folder, f"{idx:02d} - {slugify(chapter['title'], max_length=30)}")
        os.makedirs(chapter_folder, exist_ok=True)
        for i, part in enumerate(parts, start=1):
            part_filename = os.path.join(chapter_folder, f"parte_{i}.txt")
            with open(part_filename, 'w', encoding='utf-8') as part_file:
                part_file.write(part)

        # Agregar el capítulo extendido a la lista final
        extended_chapters.append({
            "title": chapter["title"],
            "content": full_chapter_content,
            "parts": parts
        })

    # Actualizar la novela con los capítulos expandidos
    final_novel_data = {
        "title": novel_data["title"],
        "description": novel_data["description"],
        "characters": novel_data["characters"],
        "chapters": extended_chapters
    }

    # Guardar la novela completa en un archivo JSON
    final_path = os.path.join(novel_folder, "novela_completa.json")
    with open(final_path, 'w', encoding='utf-8') as json_file:
        json.dump(final_novel_data, json_file, ensure_ascii=False, indent=4)

    # Guardar una versión legible en un archivo de texto
    novela_txt_path = os.path.join(novel_folder, "novela_completa.txt")
    with open(novela_txt_path, 'w', encoding='utf-8') as txt_file:
        txt_file.write(f"TÍTULO: {final_novel_data['title']}\n\n")
        txt_file.write(f"DESCRIPCIÓN:\n{final_novel_data['description']}\n\n")
        txt_file.write("PERSONAJES PRINCIPALES:\n")
        for char in final_novel_data["characters"]:
            txt_file.write(f"- {char['name']}: {char['description']}\n")
        txt_file.write("\n\n---\n\n")

        for idx, chapter in enumerate(final_novel_data["chapters"], start=1):
            txt_file.write(f"Capítulo {idx}: {chapter['title']}\n\n")
            txt_file.write(chapter["content"])
            txt_file.write("\n\n---\n\n")

        txt_file.write("NOTA FINAL:\n")
        txt_file.write(
            "⚠️ Importante: Se ha detectado que los capítulos generados pueden contener patrones repetitivos en estructura, vocabulario o estilo.\n"
            "Para mejorar la calidad narrativa, se recomienda ajustar los prompts con instrucciones más específicas y variadas.\n"
        )

    log(f"✅ Novela '{title}' generada y expandida en: '{novel_folder}'")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python bb7.py \"Título de la novela\"")
        sys.exit(1)

    novel_title = sys.argv[1]
    log(f"Comenzando generación de novela: {novel_title}")
    generate_novel(novel_title)
