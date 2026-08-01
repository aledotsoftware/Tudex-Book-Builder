import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function slugify(text: string, maxLength = 30) {
  return text
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '_')
    .trim()
    .slice(0, maxLength);
}

// Generates an artistic SVG storyboard illustration when direct image diffusion is offline or as fallback
function generateArtisticSvg(sceneText: string, visualStyle: string, chapterTitle: string): string {
  const hash = Array.from(sceneText).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = (hash * 13) % 360;
  const hue2 = (hue1 + 45) % 360;
  const hue3 = (hue1 + 180) % 360;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue1}, 60%, 15%)" />
      <stop offset="50%" stop-color="hsl(${hue2}, 50%, 25%)" />
      <stop offset="100%" stop-color="hsl(${hue3}, 70%, 10%)" />
    </linearGradient>

    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(${hue2}, 90%, 75%)" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="hsl(${hue1}, 90%, 20%)" stop-opacity="0"/>
    </radialGradient>

    <filter id="blurFilter">
      <feGaussianBlur stdDeviation="40" />
    </filter>
    
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>

  <!-- Background Layer -->
  <rect width="1200" height="800" fill="url(#bgGrad)" />

  <!-- Abstract Watercolor Atmosphere Shapes -->
  <circle cx="300" cy="300" r="350" fill="hsl(${hue2}, 80%, 55%)" opacity="0.35" filter="url(#blurFilter)" />
  <circle cx="900" cy="500" r="400" fill="hsl(${hue3}, 85%, 60%)" opacity="0.25" filter="url(#blurFilter)" />
  <path d="M -100 600 Q 300 200 600 600 T 1300 400 L 1300 900 L -100 900 Z" fill="hsl(${hue1}, 70%, 30%)" opacity="0.4" filter="url(#noise)" />

  <!-- Center Highlight Glow -->
  <ellipse cx="600" cy="400" rx="350" ry="250" fill="url(#glow)" />

  <!-- Decorative Storyboard Border Frame -->
  <rect x="40" y="40" width="1120" height="720" fill="none" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2" rx="20" />
  <rect x="55" y="55" width="1090" height="690" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" rx="15" />

  <!-- Storyboard Chapter Badge & Label -->
  <g transform="translate(80, 100)">
    <rect x="0" y="0" width="340" height="44" rx="12" fill="rgba(0, 0, 0, 0.5)" stroke="rgba(255, 255, 255, 0.2)" />
    <text x="20" y="28" fill="#e9d5ff" font-family="sans-serif" font-size="16" font-weight="bold" letter-spacing="1">
      STORYBOARD • ${chapterTitle.toUpperCase()}
    </text>
  </g>

  <!-- Visual Style Subtitle -->
  <g transform="translate(80, 700)">
    <text x="0" y="0" fill="rgba(255, 255, 255, 0.7)" font-family="sans-serif" font-size="14" italic="true">
      Estilo Visual: ${visualStyle || 'Acuarela y Tonos Pasteles'}
    </text>
  </g>
</svg>`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { folderName, chapterIndex, chapterTitle, scenePrompt, visualStyle } = body;

    if (!folderName || !chapterTitle) {
      return NextResponse.json({ error: 'Faltan parámetros de carpeta o capítulo.' }, { status: 400 });
    }

    const safeFolderName = path.basename(folderName);
    const rootDir = process.cwd();
    const dataDir = path.join(rootDir, 'data');
    let folderPath = path.join(dataDir, safeFolderName);

    if (!fs.existsSync(folderPath)) {
      folderPath = path.join(rootDir, safeFolderName);
    }

    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ error: 'No se encontró la carpeta de la novela.' }, { status: 404 });
    }

    // Find chapter subfolder
    const chPrefix = String(chapterIndex || 1).padStart(2, '0');
    const chapterSubdirs = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter((sub) => sub.isDirectory() && sub.name.startsWith(chPrefix));

    let chFolderPath = '';
    let chDirName = '';

    if (chapterSubdirs.length > 0) {
      chDirName = chapterSubdirs[0].name;
      chFolderPath = path.join(folderPath, chDirName);
    } else {
      chDirName = `${chPrefix} - ${slugify(chapterTitle, 30)}`;
      chFolderPath = path.join(folderPath, chDirName);
      fs.mkdirSync(chFolderPath, { recursive: true });
    }

    const imgFolderPath = path.join(chFolderPath, 'imagenes');
    if (!fs.existsSync(imgFolderPath)) {
      fs.mkdirSync(imgFolderPath, { recursive: true });
    }

    // Count existing images to set filename
    const existingImages = fs.readdirSync(imgFolderPath).filter((f) => f.endsWith('.svg') || f.endsWith('.png'));
    const nextIdx = existingImages.length + 1;
    const fileName = `imagen_${nextIdx}.svg`;
    const filePath = path.join(imgFolderPath, fileName);

    // Generate Artistic Vector Graphic Illustration
    const svgContent = generateArtisticSvg(scenePrompt || chapterTitle, visualStyle || '', chapterTitle);
    fs.writeFileSync(filePath, svgContent, 'utf-8');

    const imageUrl = `/api/novels/image?folder=${encodeURIComponent(safeFolderName)}&chapter=${encodeURIComponent(chDirName)}&file=${encodeURIComponent(fileName)}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: error.message || 'Error al generar la imagen' }, { status: 500 });
  }
}
