'use client';

import React from 'react';
import { Novel } from '@/app/api/novels/route';
import { X, FileText, FileCode, Printer, Download, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ExportModalProps {
  novel: Novel;
  onClose: () => void;
}

export default function ExportModal({ novel, onClose }: ExportModalProps) {
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Archivo ${fileName} descargado.`);
  };

  const handleExportTxt = () => {
    let text = `TÍTULO: ${novel.title}\n\n`;
    text += `DESCRIPCIÓN:\n${novel.description}\n\n`;
    text += `PERSONAJES PRINCIPALES:\n`;
    novel.characters.forEach((c) => {
      text += `- ${c.name}: ${c.description}\n`;
    });
    text += `\n\n=========================================\n\n`;

    novel.chapters.forEach((ch, idx) => {
      text += `CAPÍTULO ${idx + 1}: ${ch.title}\n\n`;
      if (ch.summary) text += `Resumen: ${ch.summary}\n\n`;
      if (ch.content) text += `${ch.content}\n\n`;
      text += `-----------------------------------------\n\n`;
    });

    downloadFile(text, `${novel.folderName || 'novela'}.txt`, 'text/plain;charset=utf-8');
  };

  const handleExportHtml = () => {
    let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${novel.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #222; background: #faf9f6; }
    h1 { font-size: 2.5rem; text-align: center; margin-bottom: 0.5rem; color: #111; }
    .desc { font-style: italic; text-align: center; color: #555; margin-bottom: 2rem; border-bottom: 2px solid #ddd; padding-bottom: 1rem; }
    .chars { background: #eee; padding: 15px; fill-radius: 8px; margin-bottom: 2rem; border-radius: 8px; }
    .chapter { margin-top: 3rem; page-break-before: always; }
    .ch-title { font-size: 1.8rem; color: #2c3e50; border-bottom: 1px solid #ccc; }
    p { text-indent: 1.5em; margin-bottom: 1em; text-align: justify; }
  </style>
</head>
<body>
  <h1>${novel.title}</h1>
  <div class="desc">${novel.description}</div>
  <div class="chars">
    <h3>Personajes Principales</h3>
    <ul>
      ${novel.characters.map(c => `<li><strong>${c.name}:</strong> ${c.description}</li>`).join('')}
    </ul>
  </div>
  ${novel.chapters.map((ch, idx) => `
    <div class="chapter">
      <h2 class="ch-title">Capítulo ${idx + 1}: ${ch.title}</h2>
      ${ch.content ? ch.content.split('\n\n').map(p => `<p>${p}</p>`).join('') : '<p><i>Sin contenido.</i></p>'}
    </div>
  `).join('')}
</body>
</html>`;

    downloadFile(html, `${novel.folderName || 'novela'}.html`, 'text/html;charset=utf-8');
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(novel, null, 2);
    downloadFile(jsonStr, `${novel.folderName || 'novela'}.json`, 'application/json');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h3 className="font-heading font-bold text-lg text-white">Exportar Novela</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleExportHtml}
            className="w-full flex items-center justify-between p-4 rounded-xl glass-card glass-card-hover border border-white/10 hover:border-amber-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <span className="font-heading font-bold text-white block text-sm">Libro Digital HTML (.HTML)</span>
                <span className="text-xs text-muted-foreground">Formato auto-contenido listo para e-Readers</span>
              </div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={handleExportTxt}
            className="w-full flex items-center justify-between p-4 rounded-xl glass-card glass-card-hover border border-white/10 hover:border-purple-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="font-heading font-bold text-white block text-sm">Texto Plano (.TXT)</span>
                <span className="text-xs text-muted-foreground">Novela completa en texto limpio</span>
              </div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={handleExportJson}
            className="w-full flex items-center justify-between p-4 rounded-xl glass-card glass-card-hover border border-white/10 hover:border-indigo-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <FileCode className="h-5 w-5" />
              </div>
              <div>
                <span className="font-heading font-bold text-white block text-sm">Estructura JSON (.JSON)</span>
                <span className="text-xs text-muted-foreground">Datos estructurados completos</span>
              </div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>

          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-between p-4 rounded-xl glass-card glass-card-hover border border-white/10 hover:border-purple-500/40 text-left transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <span className="font-heading font-bold text-white block text-sm">Imprimir / Guardar PDF</span>
                <span className="text-xs text-muted-foreground">Formatear vista previa de impresión</span>
              </div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="pt-2">
          <Button variant="outline" onClick={onClose} className="w-full text-xs">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
