import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { CharacterEntity, ArtifactItem, SceneContext, Chapter, Novel } from '@/lib/types';

export type Character = CharacterEntity;
export type { CharacterEntity, ArtifactItem, SceneContext, Chapter, Novel };

export async function GET() {
  try {
    const rootDir = process.cwd();
    const dataDir = path.join(rootDir, 'data');
    const folderPathsToScan: { folderName: string; folderPath: string }[] = [];

    const ignoredDirs = new Set(['node_modules', '.next', 'src', 'public', '.git', 'venv', '.agents', '.gemini', 'scratch', 'data']);

    // 1. Scan data/ directory if exists
    if (fs.existsSync(dataDir)) {
      const dataItems = fs.readdirSync(dataDir, { withFileTypes: true });
      for (const item of dataItems) {
        if (item.isDirectory() && !ignoredDirs.has(item.name)) {
          folderPathsToScan.push({ folderName: item.name, folderPath: path.join(dataDir, item.name) });
        }
      }
    }

    // 2. Scan root directory for legacy novel folders
    const rootItems = fs.readdirSync(rootDir, { withFileTypes: true });
    for (const item of rootItems) {
      if (item.isDirectory() && !ignoredDirs.has(item.name)) {
        // avoid duplicating if also present in data/
        if (!folderPathsToScan.some(f => f.folderName === item.name)) {
          folderPathsToScan.push({ folderName: item.name, folderPath: path.join(rootDir, item.name) });
        }
      }
    }

    const novels: Novel[] = [];

    for (const { folderName, folderPath } of folderPathsToScan) {
      const jsonCompletaPath = path.join(folderPath, 'novela_completa.json');
      const jsonBasePath = path.join(folderPath, 'novela_base.json');

      let targetJsonPath = null;
      let isComplete = false;

      if (fs.existsSync(jsonCompletaPath)) {
        targetJsonPath = jsonCompletaPath;
        isComplete = true;
      } else if (fs.existsSync(jsonBasePath)) {
        targetJsonPath = jsonBasePath;
      }

      if (!targetJsonPath) continue;

      try {
        const rawData = fs.readFileSync(targetJsonPath, 'utf-8');
        const parsed = JSON.parse(rawData);

        const chapterSubdirs = fs
          .readdirSync(folderPath, { withFileTypes: true })
          .filter((sub) => sub.isDirectory() && sub.name !== 'venv');

        let totalWords = 0;
        let totalImages = 0;

        const chapters: Chapter[] = (parsed.chapters || []).map((ch: any, idx: number) => {
          let parts: string[] = ch.parts || [];
          let content = ch.content || '';
          let images: string[] = [];

          const matchingDir = chapterSubdirs.find((d) => d.name.startsWith(String(idx + 1).padStart(2, '0')));

          if (matchingDir) {
            const chFolderPath = path.join(folderPath, matchingDir.name);
            
            if (!content || parts.length === 0) {
              const files = fs.readdirSync(chFolderPath);
              const partFiles = files.filter((f) => f.startsWith('parte_') && f.endsWith('.txt')).sort();
              
              const readParts = partFiles.map((f) => fs.readFileSync(path.join(chFolderPath, f), 'utf-8'));
              if (readParts.length > 0) {
                parts = readParts;
                content = readParts.join('\n\n');
              }
            }

            const imgFolder = path.join(chFolderPath, 'imagenes');
            if (fs.existsSync(imgFolder)) {
              const imgFiles = fs.readdirSync(imgFolder).filter((f) => 
                f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp') || f.endsWith('.svg')
              );
              images = imgFiles.map((f) => `/api/novels/image?folder=${encodeURIComponent(folderName)}&chapter=${encodeURIComponent(matchingDir.name)}&file=${encodeURIComponent(f)}`);
              totalImages += images.length;
            }
          }

          if (content) {
            const wordCount = content.split(/\s+/).filter(Boolean).length;
            totalWords += wordCount;
          }

          return {
            title: ch.title || `Capítulo ${idx + 1}`,
            summary: ch.summary || '',
            content,
            parts,
            images,
          };
        });

        let dateCreated = '';
        const dateMatch = folderName.match(/^(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          dateCreated = dateMatch[1];
        }

        novels.push({
          folderName,
          title: parsed.title || folderName,
          description: parsed.description || 'Sin descripción.',
          characters: parsed.characters || [],
          chapters,
          dateCreated,
          isComplete,
          totalWords,
          totalImages,
        });
      } catch (e) {
        console.error(`Failed to parse novel JSON in ${folderName}:`, e);
      }
    }

    return NextResponse.json({ novels });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderName = searchParams.get('folder');

    if (!folderName) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const safeFolderName = path.basename(folderName);
    const dataFolderPath = path.join(process.cwd(), 'data', safeFolderName);
    const rootFolderPath = path.join(process.cwd(), safeFolderName);

    let targetPath = null;
    if (fs.existsSync(dataFolderPath)) {
      targetPath = dataFolderPath;
    } else if (fs.existsSync(rootFolderPath)) {
      targetPath = rootFolderPath;
    }

    if (!targetPath) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    fs.rmSync(targetPath, { recursive: true, force: true });

    return NextResponse.json({ success: true, message: 'Novela eliminada con éxito.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al eliminar la novela.' }, { status: 500 });
  }
}
