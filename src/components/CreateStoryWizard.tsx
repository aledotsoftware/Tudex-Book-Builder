'use client';

import React, { useState } from 'react';
import { 
  X, Sparkles, Wand2, BookOpen, Users, Check, 
  ChevronRight, Feather, Palette, Image as ImageIcon, Key, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { Novel, Character, Chapter } from '@/app/api/novels/route';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CreateStoryWizardProps {
  onClose: () => void;
  onSuccess: (newNovel: Novel) => void;
}

export default function CreateStoryWizard({ onClose, onSuccess }: CreateStoryWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Fantasía / Cuento');
  const [targetAudience, setTargetAudience] = useState('Infantil / Juvenil');
  const [visualStyle, setVisualStyle] = useState('Acuarela, tonos pasteles y texturas suaves');
  const [chapterCount, setChapterCount] = useState<number>(3);
  const [autoGenerateImages, setAutoGenerateImages] = useState(true);
  const [userPrompt, setUserPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Generated Structure State
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [pacing, setPacing] = useState<'exposition' | 'conflict' | 'climax' | 'resolution'>('exposition');

  // Step 1 -> Step 2: Generate Outline via API
  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Por favor ingresa un título para tu novela o cuento.');
      return;
    }

    setIsLoading(true);
    setProgressPercent(20);
    setLoadingText('Consultando modelo IA para estructurar personajes, artefactos y capítulos...');

    try {
      const res = await fetch('/api/generate/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          genre,
          targetAudience,
          visualStyle,
          chapterCount,
          userPrompt,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar la estructura.');

      setGeneratedDescription(data.description || '');
      setCharacters(data.characters || []);
      setArtifacts(data.artifacts || []);
      setChapters(data.chapters || []);
      setStep(2);
      setProgressPercent(50);

      if (data.apiError) {
        toast.warning(`Proyecto guardado en disco como borrador. Nota de IA: ${data.apiError}`);
      } else {
        toast.success('¡Estructura narrativa creada en disco y lista para expandir!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Ocurrió un error al generar la estructura.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Expand Chapters & Auto-generate images
  const handleExpandAndSave = async () => {
    setIsLoading(true);
    const expandedChapters: Chapter[] = [];

    try {
      let previousContext = '';
      const totalSteps = chapters.length;

      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        const isLastChapter = i === chapters.length - 1;
        const currentProgress = 50 + Math.round(((i + 1) / totalSteps) * 40);
        setProgressPercent(currentProgress);
        setLoadingText(`Expandiendo Capítulo ${i + 1} de ${chapters.length}: "${ch.title}"...`);

        const res = await fetch('/api/generate/chapter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            chapterIndex: i + 1,
            chapterTitle: ch.title,
            chapterSummary: ch.summary,
            previousContext,
            characters,
            artifacts,
            sceneContext: ch.sceneContext,
            pacing: ch.sceneContext?.pacing || pacing,
            description: generatedDescription,
            isLastChapter,
            apiKey: apiKey.trim() || undefined,
            saveToDisk: true,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Error al expandir el capítulo ${i + 1}`);

        previousContext = data.content;
        let images: string[] = [];

        // Auto generate storyboard illustration if checked
        if (autoGenerateImages) {
          setLoadingText(`Generando storyboard ilustrado para el Capítulo ${i + 1}...`);
          const dateStr = new Date().toISOString().split('T')[0];
          const folderName = data.folderName || `${dateStr} - ${title.replace(/[^\w\s-]/g, '').replace(/[-\s]+/g, '_').slice(0, 50)}`;
          
          try {
            const imgRes = await fetch('/api/generate/image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                folderName,
                chapterIndex: i + 1,
                chapterTitle: ch.title,
                scenePrompt: ch.summary || data.content.slice(0, 200),
                visualStyle,
              }),
            });
            const imgData = await imgRes.json();
            if (imgRes.ok && imgData.imageUrl) {
              images.push(imgData.imageUrl);
            }
          } catch (imgErr) {
            console.error('Image generation warning:', imgErr);
          }
        }

        expandedChapters.push({
          title: ch.title,
          summary: ch.summary,
          content: data.content,
          parts: [data.content],
          images,
        });
      }

      setProgressPercent(100);
      const dateStr = new Date().toISOString().split('T')[0];
      const folderName = `${dateStr} - ${title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[-\s]+/g, '_').slice(0, 50)}`;

      const newNovel: Novel = {
        folderName,
        title,
        description: generatedDescription,
        characters,
        chapters: expandedChapters,
        dateCreated: dateStr,
        isComplete: true,
      };

      toast.success('¡Novela ilustrada generada y guardada completamente!');
      onSuccess(newNovel);
    } catch (err: any) {
      toast.error(err.message || 'Error durante la expansión de los capítulos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="glass-panel border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-white">Creador Comercial de Novelas</h2>
              <p className="text-xs text-muted-foreground">Paso {step} de 2: {step === 1 ? 'Parámetros Narrativos & Estilo' : 'Revisión de Estructura'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                <Sparkles className="h-8 w-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2 max-w-md w-full">
                <h3 className="font-heading text-xl font-bold text-white">Generando Obra Literaria...</h3>
                <p className="text-xs text-purple-300 bg-purple-950/40 p-3 rounded-xl border border-purple-500/20 animate-pulse">
                  {loadingText}
                </p>
                <Progress value={progressPercent} className="mt-4" />
              </div>
            </div>
          ) : step === 1 ? (
            /* STEP 1: Form Input */
            <form onSubmit={handleGenerateOutline} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Feather className="h-4 w-4 text-purple-400" />
                  Título de la Novela / Cuento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. El Guardian del Reino Olvidado"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white">Género</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-xs"
                  >
                    <option value="Fantasía / Cuento">Fantasía / Cuento</option>
                    <option value="Aventura">Aventura</option>
                    <option value="Ciencia Ficción">Ciencia Ficción</option>
                    <option value="Misterio">Misterio</option>
                    <option value="Drama / Ficción Emocional">Drama / Ficción</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white">Estilo de Ilustración</label>
                  <select
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-xs"
                  >
                    <option value="Acuarela, tonos pasteles y texturas suaves">Acuarela & Tonos Pasteles</option>
                    <option value="Lápiz de color y dibujo detallado">Lápiz de Color Tradicional</option>
                    <option value="Ilustración digital moderna y vibrante">Digital Moderno & Vibrante</option>
                    <option value="Estilo libro de cuentos clásico europeo">Cuento Clásico Ilustrado</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white">Cantidad de Capítulos</label>
                  <select
                    value={chapterCount}
                    onChange={(e) => setChapterCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 text-xs"
                  >
                    <option value={3}>3 Capítulos (Corto)</option>
                    <option value={5}>5 Capítulos (Estándar)</option>
                    <option value={8}>8 Capítulos (Extenso)</option>
                  </select>
                </div>
              </div>

              {/* Storyboard Toggle */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Autogenerar Storyboard Ilustrado</span>
                    <span className="text-[11px] text-muted-foreground">Crea gráficos de escenas de forma automática para cada capítulo</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoGenerateImages}
                  onChange={(e) => setAutoGenerateImages(e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-slate-900 text-purple-600 focus:ring-purple-500 accent-purple-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Premisa o Detalles Creativos (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones específicas, giros narrativos o temas de la obra..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                <label className="text-xs font-semibold text-purple-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-amber-400" />
                    Clave API de Google Gemini (GEMINI_API_KEY)
                  </span>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-purple-400 hover:underline"
                  >
                    Obtener clave gratis en Google AI Studio ↗
                  </a>
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-muted-foreground">
                  Ingresa tu clave de Gemini (comienza con <code className="text-purple-300 font-mono">AIzaSy...</code>) o déjala en blanco para usar la del archivo <code className="text-purple-300 font-mono">.env</code>.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/40">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" variant="default">
                  Generar Estructura con IA
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </form>
          ) : (
            /* STEP 2: Outline Preview & Confirmation */
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading font-bold text-2xl text-gradient">{title}</h3>
                  <Badge variant="amber">{chapters.length} Capítulos</Badge>
                </div>
                <p className="text-xs text-zinc-300 bg-white/5 p-4 rounded-xl border border-white/10 leading-relaxed">
                  {generatedDescription}
                </p>
              </div>

              {/* Characters Preview */}
              <div className="space-y-3">
                <h4 className="font-heading font-semibold text-xs text-purple-300 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Personajes Principales ({characters.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {characters.map((c, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/10 text-xs">
                      <strong className="text-white block font-heading mb-1">{c.name}</strong>
                      <span className="text-muted-foreground text-[11px] leading-snug block">{c.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chapters Outline Preview */}
              <div className="space-y-3">
                <h4 className="font-heading font-semibold text-xs text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  Capítulos Planificados ({chapters.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {chapters.map((ch, i) => (
                    <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/10 text-xs space-y-1">
                      <div className="font-heading font-bold text-white">
                        Capítulo {i + 1}: {ch.title}
                      </div>
                      <p className="text-muted-foreground text-[11px]">{ch.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-border/40">
                <Button variant="outline" type="button" onClick={() => setStep(1)}>
                  Atrás
                </Button>
                <Button type="button" variant="default" onClick={handleExpandAndSave}>
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Expandir Texto & Generar Novela Completa
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
