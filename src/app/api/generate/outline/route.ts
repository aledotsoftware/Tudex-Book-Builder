import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

function slugify(text: string, maxLength = 50) {
  return text
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '_')
    .trim()
    .slice(0, maxLength);
}

export async function POST(request: Request) {
  let title = '';
  let folderName = '';
  let numChapters = 3;

  try {
    const body = await request.json();
    const { genre, targetAudience, visualStyle, userPrompt, apiKey } = body;
    title = body.title || 'Nueva Obra Sin Título';
    numChapters = Math.max(1, Math.min(10, Number(body.chapterCount) || 3));

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'El título de la obra es requerido.' }, { status: 400 });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const shortTitle = slugify(title, 50);
    folderName = `${dateStr} - ${shortTitle}`;

    const dataDir = path.join(process.cwd(), 'data');
    const novelFolder = path.join(dataDir, folderName);

    if (!fs.existsSync(novelFolder)) {
      fs.mkdirSync(novelFolder, { recursive: true });
    }

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    let outlineData: any = null;
    let apiError: string | null = null;

    if (!keyToUse || keyToUse.trim() === '' || keyToUse.startsWith('AQ.')) {
      apiError = 'Clave API de Gemini no válida o no configurada. Se ha creado el proyecto en modo borrador.';
    } else {
      try {
        const genAI = new GoogleGenerativeAI(keyToUse.trim());
        const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
Actúa como un autor y guionista profesional de libros ilustrados y novelas de alta literatura.
Crea una estructura narrativa completa y detallada basada en Objetos Narrativos Enriquecidos para una historia titulada "${title}".

Detalles de la obra:
- Género: ${genre || 'Fantasía / Cuento'}
- Público Objetivo: ${targetAudience || 'General / Infantil'}
- Estilo Visual de Ilustración: ${visualStyle || 'Acuarela y tonos pasteles'}
- Cantidad de Capítulos a generar: ${numChapters}
${userPrompt ? `- Contexto / Idea del usuario: ${userPrompt}` : ''}

Responde ÚNICAMENTE con un objeto JSON estricto sin markdown \`\`\`json y con el esquema exacto:
{
  "title": "${title}",
  "description": "Una descripción inmersiva de 2 a 3 párrafos de la sinopsis general de la historia.",
  "characters": [
    {
      "id": "char_1",
      "name": "Nombre del personaje",
      "description": "Descripción de personalidad, aspecto físico y rol.",
      "archetype": "Arquetipo (ej: Héroe renuente, Mentor sabio)",
      "emotionalState": "Estado emocional inicial (ej: Ansioso, Decidido)",
      "knownSecrets": ["Secretos o motivaciones ocultas"]
    }
  ],
  "artifacts": [
    {
      "id": "art_1",
      "name": "Nombre del objeto/artefacto clave",
      "physicalDescription": "Descripción física detallada del objeto",
      "symbolism": "Simbolismo o peso narrativo",
      "status": "intacto"
    }
  ],
  "chapters": [
    {
      "title": "Título sugerente del capítulo",
      "summary": "Resumen narrativo detallado de los acontecimientos.",
      "sceneContext": {
        "location": "Lugar específico de la escena",
        "weather": "Atmósfera o clima",
        "dramaticTension": 5,
        "pacing": "exposition"
      }
    }
  ]
}
Debes generar exactamente ${numChapters} capítulos dentro del arreglo "chapters".
`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        outlineData = JSON.parse(text);
      } catch (err: any) {
        console.warn('Error al consultar Gemini en outline:', err);
        apiError = err.message || 'Error de la API de Gemini.';
      }
    }

    // Fallback outline if Gemini failed or key was invalid
    if (!outlineData) {
      const generatedChapters = Array.from({ length: numChapters }, (_, i) => ({
        title: `Capítulo ${i + 1}: ${i === 0 ? 'El Comienzo' : i === numChapters - 1 ? 'El Desenlace' : 'El Desafío'}`,
        summary: `Resumen preliminar para el capítulo ${i + 1} de "${title}". ${userPrompt ? `Contexto: ${userPrompt}` : ''}`,
        sceneContext: {
          location: 'Escenario Principal',
          weather: 'Atmósfera mística',
          dramaticTension: 5,
          pacing: i === 0 ? 'exposition' : i === numChapters - 1 ? 'resolution' : 'conflict'
        }
      }));

      outlineData = {
        title,
        description: `Proyecto "${title}" (Género: ${genre || 'Fantasía'}). ${userPrompt ? `Premisa: ${userPrompt}` : 'Borrador inicial creado.'}`,
        characters: [
          {
            id: 'char_1',
            name: 'Protagonista Principal',
            description: 'Personaje central de la novela.',
            archetype: 'Héroe renuente',
            emotionalState: 'Expectante'
          }
        ],
        artifacts: [
          {
            id: 'art_1',
            name: 'Artefacto Misterioso',
            physicalDescription: 'Un antiguo objeto hallado al inicio del viaje.',
            symbolism: 'La promesa del destino',
            status: 'intacto'
          }
        ],
        chapters: generatedChapters,
      };
    }

    // Save initial novel_base.json ALWAYS
    const jsonFilePath = path.join(novelFolder, 'novela_base.json');
    const novelBaseContent = {
      folderName,
      title: outlineData.title || title,
      description: outlineData.description || '',
      characters: outlineData.characters || [],
      artifacts: outlineData.artifacts || [],
      globalSubplots: outlineData.globalSubplots || [],
      chapters: outlineData.chapters || [],
      isComplete: false,
      isDraft: true,
      apiError: apiError || undefined,
      dateCreated: dateStr,
    };

    fs.writeFileSync(jsonFilePath, JSON.stringify(novelBaseContent, null, 2), 'utf-8');

    return NextResponse.json({
      ...outlineData,
      folderName,
      apiError,
    });
  } catch (error: any) {
    console.error('Fatal error initializing novel project:', error);
    return NextResponse.json({ error: error.message || 'Error fatal al inicializar el proyecto.' }, { status: 500 });
  }
}
