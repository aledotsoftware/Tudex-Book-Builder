import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder');
  const chapter = searchParams.get('chapter');
  const file = searchParams.get('file');

  if (!folder || !chapter || !file) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  // Prevent directory traversal
  const safeFolder = path.basename(folder);
  const safeChapter = path.basename(chapter);
  const safeFile = path.basename(file);

  let filePath = path.join(process.cwd(), 'data', safeFolder, safeChapter, 'imagenes', safeFile);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), safeFolder, safeChapter, 'imagenes', safeFile);
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Image not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(safeFile).toLowerCase();
  
  let contentType = 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  if (ext === '.webp') contentType = 'image/webp';
  if (ext === '.svg') contentType = 'image/svg+xml';

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
