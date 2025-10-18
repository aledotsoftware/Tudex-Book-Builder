import os
import datetime
import re
import google.generativeai as genai

def generate_long_novel():
    # Configurar la API Key (si prefieres, usa variable de entorno)
    genai.configure(api_key="AIzaSyAYjVMMfmrl21wInHKaKCb9AvZIsbolKiA")
    
    # Crear la instancia del modelo (usa el modelo indicado)
    model = genai.GenerativeModel("gemini-2.0-flash-exp-image-generation")
    
    # Definir el prompt para generar la novela en formato MD
    prompt = """
    Título: El Reino de las Sombras

    Descripción: En un mundo donde la magia fue prohibida, una joven descubre que es la heredera de un antiguo linaje capaz de controlar poderes oscuros. Su destino, lleno de intrigas, traiciones y misterios, cambiará el futuro del reino.

    Instrucciones:
    - Genera una novela completa en formato texto MD.
    - La novela debe estar estructurada en al menos 5 capítulos.
    - Incluye una introducción narrativa, una lista de personajes principales (con nombres, características y roles),
      diálogos naturales y descripciones detalladas.
    - Cada capítulo debe tener un título y desarrollar progresivamente la historia, con clímax y una resolución final.
    - Mantén coherencia en la trama y en la evolución de los personajes.
    """

    # Solicitar generación de contenido al modelo
    response = model.generate_content(prompt)
    novel_text = response.text

    # Definir el título del libro (debe coincidir con el prompt o puede definirse dinámicamente)
    book_title = "El Reino de las Sombras"
    # Usar la fecha actual para nombrar la carpeta del libro
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    book_folder_name = f"{current_date} - {book_title}"
    
    # Crear la carpeta base BOOK/<fecha> - <título del libro>
    base_folder = os.path.join("BOOK", book_folder_name)
    os.makedirs(base_folder, exist_ok=True)
    
    # Guardar el contenido completo en formato MD
    md_filename = os.path.join(base_folder, "book.md")
    with open(md_filename, "w", encoding="utf-8") as f:
        f.write(novel_text)
    
    # Parsear los capítulos del contenido MD.
    # Se asume que cada capítulo inicia con una línea que comience con "Capítulo" (ignorando mayúsculas y tildes).
    chapters = re.split(r'(?=^Cap[ií]tulo\b)', novel_text, flags=re.MULTILINE)
    
    # Si no se encuentran separadores de capítulos (menos de 2 fragmentos), tratar todo el texto como un único capítulo.
    if len(chapters) < 2:
        chapters = [novel_text]
    
    # Para cada capítulo encontrado, crear una carpeta y guardar su contenido en un archivo TXT.
    for idx, chapter in enumerate(chapters, start=1):
        # Tomar la primera línea del capítulo como título
        lines = chapter.splitlines()
        first_line = lines[0].strip() if lines else f"Capítulo {idx}"
        
        # Intentar extraer el nombre del capítulo usando regex (se asume que la línea tiene formato "Capítulo N: nombre" o similar)
        match = re.match(r"(?i)Cap[ií]tulo\s*[\d]*\s*[:\-]\s*(.+)", first_line)
        if match:
            chapter_title = match.group(1).strip()
        else:
            chapter_title = first_line
        
        # Nombre de la carpeta para el capítulo: "N - nombre del capítulo"
        chapter_folder_name = f"{idx} - {chapter_title}"
        chapter_folder_path = os.path.join(base_folder, chapter_folder_name)
        os.makedirs(chapter_folder_path, exist_ok=True)
        
        # Guardar el contenido del capítulo en un archivo TXT
        chapter_filename = os.path.join(chapter_folder_path, "chapter.txt")
        with open(chapter_filename, "w", encoding="utf-8") as f:
            f.write(chapter)
    
    print(f"Libro guardado en: {base_folder}")

if __name__ == "__main__":
    generate_long_novel()
