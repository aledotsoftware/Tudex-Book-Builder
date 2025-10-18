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

def obtener_brief_creativo_por_ia(titulo):
    genai.configure(api_key="AIzaSyAYjVMMfmrl21wInHKaKCb9AvZIsbolKiA")
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    prompt = f"""
    Actuá como un escritor experto que ayuda a otros autores a construir historias infantiles.
    Vas a hacer una entrevista breve para entender mejor qué tipo de novela desea el autor.
    Hacé 5 a 7 preguntas relevantes y creativas que te ayuden a construir una descripción de la novela
    titulada "{titulo}". No respondas todavía, solo mostrá las preguntas para que el autor las complete una por una.
    """

    preguntas_response = model.generate_content(prompt)
    preguntas = preguntas_response.text.strip().split("\n")

    respuestas = {}
    for pregunta in preguntas:
        if pregunta.strip():
            print(pregunta.strip())
            respuesta = input("> ")
            respuestas[pregunta.strip()] = respuesta

    # Convertir las respuestas a una narrativa compacta para usar en el prompt
    resumen_prompt = "Estas son las respuestas del autor para la historia:\n"
    for pregunta, respuesta in respuestas.items():
        resumen_prompt += f"{pregunta}\n{respuesta}\n\n"
    resumen_prompt += "A partir de esto, creá una descripción general de la novela."

    descripcion_response = model.generate_content(resumen_prompt)
    descripcion = descripcion_response.text.strip()
    return descripcion

def generate_novel(title):
    # Configurar la API de Generative AI
    genai.configure(api_key="AIzaSyAYjVMMfmrl21wInHKaKCb9AvZIsbolKiA")
    model = genai.GenerativeModel("gemini-2.0-flash")

    # Generar descripción general guiada por IA y usuario
    log("Obteniendo brief creativo del autor para generar la descripción...")
    description = obtener_brief_creativo_por_ia(title)
    log("Descripción obtenida.")

    # Generar la estructura base de la novela en formato JSON
    log("Generando estructura base de la novela...")
    novel_prompt = f"""
    Basado en la siguiente descripción:

    {description}

    Instrucciones:
    - Incluye una introducción narrativa, una lista de personajes principales (con nombres, características y roles),
      diálogos naturales y descripciones detalladas.
    - Mantén coherencia en la trama y en la evolución de los personajes.
    - Genera un cuento para niños completo estructurada en formato JSON con el siguiente esquema:
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

    Incluye al menos 2 capítulos con una progresión narrativa clara.
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

    # Variable para almacenar el contenido completo del capítulo anterior y usarlo como contexto
    previous_chapter_text = ""

    # Expandir y extender cada capítulo
    extended_chapters = []
    for idx, chapter in enumerate(novel_data["chapters"], start=1):
        # Interacción previa a la expansión del capítulo
        log(f"Consultando al autor sobre el Capítulo {idx}: {chapter['title']}")
        cap_prompt = f"""
        Vas a hacerle algunas preguntas al autor para entender cómo quiere que se desarrolle el capítulo titulado '{chapter['title']}'.
        Tenés que hacer entre 3 y 5 preguntas breves sobre dirección narrativa, emociones, conflictos o desarrollo de personajes.
        Las preguntas deben ayudar a definir mejor cómo se escribirá este capítulo específico.
        No respondas por el autor, solo mostrale las preguntas.
        """
        cap_questions_response = model.generate_content(cap_prompt)
        cap_questions = cap_questions_response.text.strip().split("\n")

        cap_answers = {}
        for q in cap_questions:
            if q.strip():
                print(q.strip())
                a = input("> ")
                cap_answers[q.strip()] = a

        # Armar contexto adicional para incluirlo en el expand_prompt
        custom_guidance = "El autor desea lo siguiente para este capítulo:\n"
        for q, a in cap_answers.items():
            custom_guidance += f"- {q} → {a}\n"

        log(f"Expandiendo capítulo {idx}: {chapter['title']}")
        
        # Se toma un fragmento del final del capítulo anterior para mantener continuidad
        context_snippet = previous_chapter_text[-1500:] if previous_chapter_text else ""
        
        # Generar la expansión inicial del capítulo con el contexto anterior (si existe)
        expand_prompt = f"""
        CONTEXTO DEL CAPÍTULO ANTERIOR:
        \"\"\"
        {context_snippet}
        \"\"\"

        Tené en cuenta las siguientes indicaciones proporcionadas por el autor para este capítulo:

        {custom_guidance}

        Basado en el siguiente resumen de capítulo:

        "{chapter['summary']}"

        Expande este capítulo en una narración completa y profesional con:
        - Texto largo y atrapante.
        - Diálogos creíbles y naturales.
        - Descripciones detalladas.
        - Desarrollo emocional.
        - Narrativa rica y envolvente.
        - Variedad léxica.
        - Evita repetir estructuras gramaticales similares.
        - Además, concluye el capítulo con un gancho que conecte de forma natural con el siguiente.
        Entrega solo el texto completo del capítulo, sin introducciones ni anotaciones.
        """
        initial_expansion_response = model.generate_content(expand_prompt)
        initial_expansion = initial_expansion_response.text.strip()

        # Determinar aleatoriamente la cantidad de partes adicionales (2 a 4), para un total entre 3 y 5 partes.
        num_additional_parts = random.randint(8, 9)
        parts = [initial_expansion]
        last_text = initial_expansion  # Se usará para enviar contexto a la siguiente petición

        # Generar cada parte adicional basada en el contenido anterior
        for part_number in range(1, num_additional_parts + 1):
            part_prompt = f"""
            Continúa el siguiente capítulo de un cuento, manteniendo coherencia narrativa, el tono literario y desarrollando más a fondo la historia:

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
        
        # Actualizar previous_chapter_text para usar en el siguiente ciclo
        previous_chapter_text = full_chapter_content

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
        print("Uso: python bb8.py \"Título de la novela\"")
        sys.exit(1)

    novel_title = sys.argv[1]
    log(f"Comenzando generación de novela: {novel_title}")
    generate_novel(novel_title)




