import os
import sys
import datetime
import re
import google.generativeai as genai

def generate_book(title):
    # Configurar la API Key
    genai.configure(api_key="AIzaSyAYjVMMfmrl21wInHKaKCb9AvZIsbolKiA")
    
    # Instanciar el modelo (se utiliza el mismo modelo para ambas tareas)
    model = genai.GenerativeModel("gemini-2.0-flash-exp-image-generation")
    
    # 1. Generar la descripción detallada del libro basado en el título
    description_prompt = (
        f"Genera una descripción detallada y cautivadora para un libro titulado '{title}'. "
        "La descripción debe incluir elementos de intriga, un contexto mágico y la promesa de una aventura única."
    )
    desc_response = model.generate_content(description_prompt)
    detailed_description = desc_response.text.strip()
    
    # 2. Construir el prompt final para generar la novela
    novel_prompt = f"""
    Título: {title}

    Descripción: {detailed_description}

    Instrucciones:
    - Genera una novela completa en formato texto MD.
    - La novela debe estar estructurada en al menos 5 capítulos.
    - Incluye una introducción narrativa, una lista de personajes principales (con nombres, características y roles),
      diálogos naturales y descripciones detalladas.
    - Cada capítulo debe tener un título y desarrollar progresivamente la historia, con clímax y una resolución final.
    - Mantén coherencia en la trama y en la evolución de los personajes.
    """
    
    novel_response = model.generate_content(novel_prompt)
    novel_text = novel_response.text

    # 3. Crear la carpeta del libro dentro de "BOOK"
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    book_folder_name = f"{current_date} - {title}"
    base_folder = os.path.join("BOOK", book_folder_name)
    os.makedirs(base_folder, exist_ok=True)
    
    # Guardar el contenido completo en formato MD
    md_filename = os.path.join(base_folder, "book.md")
    with open(md_filename, "w", encoding="utf-8") as f:
        f.write(novel_text)
    
    # 4. Parsear el contenido MD para extraer los capítulos.
    # Se asume que cada capítulo comienza en una línea que inicia con "Capítulo" (con o sin acento)
    chapters = re.split(r'(?=^Cap[ií]tulo\b)', novel_text, flags=re.MULTILINE)
    
    # Si no se encontraron separadores de capítulos, se usará todo el contenido como un único capítulo.
    if len(chapters) < 2:
        chapters = [novel_text]
    
    # 5. Crear una carpeta por cada capítulo y guardar en cada una un archivo chapter.txt
    for idx, chapter in enumerate(chapters, start=1):
        lines = chapter.splitlines()
        first_line = lines[0].strip() if lines else f"Capítulo {idx}"
        
        # Extraer el nombre del capítulo (se asume formato "Capítulo N: Nombre")
        match = re.match(r"(?i)Cap[ií]tulo\s*\d*\s*[:\-]\s*(.+)", first_line)
        if match:
            chapter_title = match.group(1).strip()
        else:
            chapter_title = first_line
        
        chapter_folder_name = f"{idx} - {chapter_title}"
        chapter_folder_path = os.path.join(base_folder, chapter_folder_name)
        os.makedirs(chapter_folder_path, exist_ok=True)
        
        chapter_filename = os.path.join(chapter_folder_path, "chapter.txt")
        with open(chapter_filename, "w", encoding="utf-8") as f:
            f.write(chapter)
    
    print(f"Libro guardado en: {base_folder}")

def main():
    if len(sys.argv) < 2:
        print("Uso: python bb.py 'Título del libro'")
        sys.exit(1)
    title = sys.argv[1]
    generate_book(title)

if __name__ == "__main__":
    main()
