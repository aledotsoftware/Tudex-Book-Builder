import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

function slugify(text: string, maxLength = 30) {
  return text
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '_')
    .trim()
    .slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, chapterIndex, chapterTitle, chapterSummary, previousContext, 
      characters, artifacts, sceneContext, description, isLastChapter, apiKey, saveToDisk,
      pacing = 'exposition'
    } = body;

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;

    if (!keyToUse) {
      return NextResponse.json(
        { error: 'API Key no configurada. Por favor proporciona GEMINI_API_KEY en el servidor o en las opciones.' },
        { status: 401 }
      );
    }

    const genAI = new GoogleGenerativeAI(keyToUse);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    // 1. Vector de Estado Acotado (Bounded State Vector)
    const charVector = (characters || [])
      .map((c: any) => `- ${c.name} (${c.archetype || 'Personaje'}): ${c.description || ''} [Estado Emocional: ${c.emotionalState || 'Neutro'}]${c.knownSecrets ? ` [Secretos: ${c.knownSecrets.join(', ')}]` : ''}`)
      .join('\n');

    const artifactVector = (artifacts || [])
      .map((a: any) => `- ${a.name}: ${a.physicalDescription} (${a.status || 'intacto'}) ${a.symbolism ? `[Simbolismo: ${a.symbolism}]` : ''}`)
      .join('\n');

    const ctx = sceneContext || {};
    const contextVector = `Ubicación: ${ctx.location || 'Escenario principal'}\nClima/Atmósfera: ${ctx.weather || 'Estándar'}\nTensión Dramática: ${ctx.dramaticTension || 5}/10\nReglas del Mundo: ${(ctx.activeWorldRules || []).join(', ') || 'Estándar'}`;

    // 2. Parámetro de Ritmo (Pacing)
    const pacingInstructions: Record<string, string> = {
      exposition: 'Ritmo pausado y contemplativo. Énfasis en detalles sensoriales, texturas, iluminación, aromas y construcción atmosférica.',
      conflict: 'Ritmo dinámico y ágil. Diálogos picados y cortantes, respuestas físicas inmediatas y tensión en aumento.',
      climax: 'Máxima aceleración narrativa, frases breves e intensas, decisiones límite y urgencia emocional.',
      resolution: 'Ritmo reflexivo, desaceleración progresiva y consolidación de arcos emocionales.'
    };

    const pacingGuide = pacingInstructions[pacing] || pacingInstructions.exposition;

    const expandPrompt = `
Eres un novelista laureado. Desarrolla el capítulo "${chapterTitle}" utilizando la siguiente arquitectura narrativa:

--- VECTOR DE ESTADO ACOTADO DE LA ESCENA ---
[PERSONAJES PRESENTES & ESTADO EMOCIONAL]
${charVector || 'No especificado'}

[ARTEFACTOS / ÍTEMS CLAVE PRESENTES]
${artifactVector || 'Sin objetos clave en escena'}

[ENTORNO & REGLAS DEL MUNDO]
${contextVector}

${previousContext ? `\n[CONTEXTO NARRATIVO ANTERIOR]\n"""\n${previousContext.slice(-1500)}\n"""\n` : ''}

[RESUMEN DEL CAPÍTULO A PROSATICAR]
"${chapterSummary}"

--- DIRECTRICES DE PROSA & LITERATURA ---
1. TÉCNICA "SHOW, DON'T TELL" (MUESTRA, NO CUENTES): Prohibido etiquetar emociones abstractamente (ej. "estaba asustado"). Transmite los estados emocionales mediante microexpresiones físicas, tensión corporal, ritmo respiratorio, miradas e interacción tangible con los objetos del entorno.
2. CADENCIA DE RITMO (PACING): ${pacingGuide}
3. FILTRO ANTICLICHÉS: Prohibido usar metáforas trilladas, frases hechas o patrones de inicio de párrafo repetitivos. Mantén una prosa viva, elegante y original.
4. COHERENCIA DE OBJETOS: Los personajes e ítems deben reaccionar respetando sus estados emocionales y descripciones físicas.

Devuelve ÚNICAMENTE el texto narrativo completo del capítulo, sin introducciones ni anotaciones.
`;

    const result = await model.generateContent(expandPrompt);
    const chapterContent = result.response.text().trim();

    // Agente de Persistencia de Estado: analiza el capítulo y extrae mutaciones
    let stateMutations: any = null;
    try {
      const statePrompt = `
Analiza el siguiente texto del capítulo "${chapterTitle}" y extrae las mutaciones de estado de la historia:
1. Estado emocional actualizado de los personajes presentes.
2. Estado actualizado de los artefactos o ítems.
3. Subtramas o promesas narrativas abiertas, intensificadas o resueltas.

TEXTO DEL CAPÍTULO:
"""
${chapterContent.slice(-3500)}
"""

Responde ÚNICAMENTE con un objeto JSON estricto sin markdown \`\`\`json con el esquema exacto:
{
  "characterUpdates": [
    { "name": "Nombre de personaje", "newEmotionalState": "Nuevo estado emocional" }
  ],
  "artifactUpdates": [
    { "name": "Nombre de artefacto", "newStatus": "intacto" }
  ],
  "globalSubplots": [
    { "description": "Promesa o subtrama abierta", "status": "abierto" }
  ]
}
`;
      const stateRes = await model.generateContent(statePrompt);
      let stateText = stateRes.response.text().trim();
      stateText = stateText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      stateMutations = JSON.parse(stateText);
    } catch (stErr) {
      console.warn('Advertencia en Agente de Persistencia de Estado:', stErr);
    }

    let folderName = '';
    // If requested to persist to disk
    if (saveToDisk && title) {
      const dateStr = new Date().toISOString().split('T')[0];
      const shortTitle = slugify(title, 50);
      folderName = `${dateStr} - ${shortTitle}`;
      const dataDir = path.join(process.cwd(), 'data');
      const novelFolder = path.join(dataDir, folderName);
      
      if (!fs.existsSync(novelFolder)) {
        fs.mkdirSync(novelFolder, { recursive: true });
      }

      const chapterFolderName = `${String(chapterIndex).padStart(2, '0')} - ${slugify(chapterTitle, 30)}`;
      const chapterFolderPath = path.join(novelFolder, chapterFolderName);
      
      if (!fs.existsSync(chapterFolderPath)) {
        fs.mkdirSync(chapterFolderPath, { recursive: true });
      }

      // Save main text part
      const part1Path = path.join(chapterFolderPath, 'parte_1.txt');
      fs.writeFileSync(part1Path, chapterContent, 'utf-8');

      // Update or create base/complete json
      const jsonFileName = isLastChapter ? 'novela_completa.json' : 'novela_base.json';
      const jsonFilePath = path.join(novelFolder, jsonFileName);

      let novelData: any = {
        title,
        description: description || '',
        characters: characters || [],
        artifacts: artifacts || [],
        globalSubplots: [],
        chapters: []
      };

      if (fs.existsSync(jsonFilePath)) {
        try {
          const raw = fs.readFileSync(jsonFilePath, 'utf-8');
          novelData = JSON.parse(raw);
        } catch (e) {
          console.error('Error reading existing novel JSON:', e);
        }
      }

      // Apply state mutations from Agente de Persistencia
      if (stateMutations) {
        if (stateMutations.characterUpdates && Array.isArray(stateMutations.characterUpdates)) {
          stateMutations.characterUpdates.forEach((upd: any) => {
            const char = (novelData.characters || []).find((c: any) => c.name.toLowerCase() === (upd.name || '').toLowerCase());
            if (char && upd.newEmotionalState) {
              char.emotionalState = upd.newEmotionalState;
            }
          });
        }

        if (stateMutations.artifactUpdates && Array.isArray(stateMutations.artifactUpdates)) {
          stateMutations.artifactUpdates.forEach((upd: any) => {
            const art = (novelData.artifacts || []).find((a: any) => a.name.toLowerCase() === (upd.name || '').toLowerCase());
            if (art && upd.newStatus) {
              art.status = upd.newStatus;
            }
          });
        }

        if (stateMutations.globalSubplots && Array.isArray(stateMutations.globalSubplots)) {
          if (!novelData.globalSubplots) novelData.globalSubplots = [];
          stateMutations.globalSubplots.forEach((sub: any) => {
            if (sub.description) {
              novelData.globalSubplots.push({
                id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                description: sub.description,
                status: sub.status || 'abierto',
                introducedInChapter: Number(chapterIndex) || 1
              });
            }
          });
        }
      }

      // Update chapter entry
      if (!novelData.chapters) novelData.chapters = [];
      const chIdx = Number(chapterIndex) - 1;
      novelData.chapters[chIdx] = {
        title: chapterTitle,
        summary: chapterSummary,
        content: chapterContent,
        parts: [chapterContent],
        stateMutations,
      };

      fs.writeFileSync(jsonFilePath, JSON.stringify(novelData, null, 2), 'utf-8');

      // Save full text file if last chapter
      if (isLastChapter) {
        const fullTxtPath = path.join(novelFolder, 'novela_completa.txt');
        let fullTxt = `TÍTULO: ${title}\n\nDESCRIPCIÓN:\n${description || ''}\n\n`;
        novelData.chapters.forEach((ch: any, idx: number) => {
          fullTxt += `CAPÍTULO ${idx + 1}: ${ch.title}\n\n${ch.content || ''}\n\n-----------------------------------------\n\n`;
        });
        fs.writeFileSync(fullTxtPath, fullTxt, 'utf-8');
      }
    }

    return NextResponse.json({
      title: chapterTitle,
      content: chapterContent,
      folderName,
    });
  } catch (error: any) {
    console.error('Error expanding chapter:', error);
    return NextResponse.json({ error: error.message || 'Error al expandir el capítulo.' }, { status: 500 });
  }
}
