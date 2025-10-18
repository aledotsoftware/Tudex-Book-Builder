#AIzaSyAYjVMMfmrl21wInHKaKCb9AvZIsbolKiA
# pip install google-generativeai

import os
import google.generativeai as genai

def generate_long_novel():
    # Configurar la API Key (puedes modificar esto según prefieras cargarla desde la variable de entorno)
    genai.configure(api_key="AIzaSyAYjVMMfmrl21wInHKaKCb9AvZIsbolKiA")
    
    # Crear la instancia del modelo usando Gemini 2.5 Pro Preview
    model = genai.GenerativeModel("gemini-2.0-flash-exp-image-generation")
    
    # Definir el prompt con la información de la novela a generar
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
    
    # Mostrar el texto generado
    print(response.text)

if __name__ == "__main__":
    generate_long_novel()
