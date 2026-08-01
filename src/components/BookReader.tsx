'use client';

import React, { useState } from 'react';
import { Novel, Chapter } from '@/app/api/novels/route';
import { 
  X, ChevronLeft, ChevronRight, BookOpen, Users, 
  Download, Volume2, VolumeX, Sparkles, Image as ImageIcon,
  Sun, Moon, Feather, RefreshCw, Sliders, Wand2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BookReaderProps {
  novel: Novel;
  onClose: () => void;
  onExport: (novel: Novel) => void;
}

export default function BookReader({ novel, onClose, onExport }: BookReaderProps) {
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'midnight'>('dark');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [showCharacters, setShowCharacters] = useState(false);
  const [isReadingAudio, setIsReadingAudio] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [currentNovel, setCurrentNovel] = useState<Novel>(novel);
  const [customApiKey, setCustomApiKey] = useState('');
  const [isExpandingChapter, setIsExpandingChapter] = useState(false);

  const currentChapter: Chapter | undefined = currentNovel.chapters[currentChapterIdx];

  const handleExpandChapter = async () => {
    if (!currentChapter) return;
    setIsExpandingChapter(true);
    try {
      const res = await fetch('/api/generate/chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentNovel.title,
          chapterIndex: currentChapterIdx + 1,
          chapterTitle: currentChapter.title,
          chapterSummary: currentChapter.summary || '',
          previousContext: currentChapterIdx > 0 ? currentNovel.chapters[currentChapterIdx - 1]?.content : '',
          characters: currentNovel.characters,
          artifacts: currentNovel.artifacts,
          sceneContext: currentChapter.sceneContext,
          description: currentNovel.description,
          isLastChapter: currentChapterIdx === currentNovel.chapters.length - 1,
          apiKey: customApiKey.trim() || undefined,
          saveToDisk: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al expandir el capítulo.');

      const updatedChapters = [...currentNovel.chapters];
      updatedChapters[currentChapterIdx] = {
        ...updatedChapters[currentChapterIdx],
        content: data.content,
      };

      setCurrentNovel({
        ...currentNovel,
        chapters: updatedChapters,
      });

      toast.success('¡Capítulo expandido con éxito mediante la IA de Gemini!');
    } catch (err: any) {
      toast.error(err.message || 'Error al expandir el capítulo con IA.');
    } finally {
      setIsExpandingChapter(false);
    }
  };

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base leading-relaxed md:text-lg md:leading-loose',
    lg: 'text-lg leading-loose md:text-xl md:leading-loose',
    xl: 'text-xl leading-loose md:text-2xl md:leading-loose',
  };

  const themeClasses = {
    dark: 'bg-background text-zinc-200',
    sepia: 'bg-[#1a1815] text-[#e8dfd1]',
    midnight: 'bg-[#090d16] text-[#d1e0f7]',
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Tu navegador no soporta lectura de voz.');
      return;
    }

    if (isReadingAudio) {
      window.speechSynthesis.cancel();
      setIsReadingAudio(false);
      toast.info('Lectura pausada.');
    } else {
      if (!currentChapter?.content) {
        toast.warning('Este capítulo no tiene contenido de texto para leer.');
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentChapter.content);
      utterance.lang = 'es-ES';
      utterance.rate = speechRate;
      utterance.onend = () => setIsReadingAudio(false);
      utterance.onerror = () => setIsReadingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsReadingAudio(true);
      toast.success(`Iniciando lectura en voz alta (${speechRate}x)...`);
    }
  };

  const handleGenerateChapterImage = async () => {
    if (!currentChapter) return;
    setIsGeneratingImage(true);
    toast.info('Generando ilustración storyboard para este capítulo...');

    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderName: currentNovel.folderName,
          chapterIndex: currentChapterIdx + 1,
          chapterTitle: currentChapter.title,
          scenePrompt: currentChapter.summary || currentChapter.content?.slice(0, 300),
          visualStyle: 'Acuarela y tonos pasteles',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar la imagen.');

      if (data.imageUrl) {
        // Update state with newly added image
        const updatedChapters = [...currentNovel.chapters];
        const currentImgs = updatedChapters[currentChapterIdx].images || [];
        updatedChapters[currentChapterIdx].images = [...currentImgs, data.imageUrl];

        setCurrentNovel({
          ...currentNovel,
          chapters: updatedChapters,
        });

        toast.success('¡Ilustración storyboard agregada con éxito!');
      }
    } catch (err: any) {
      toast.error(err.message || 'No se pudo generar la ilustración.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleClose = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Top Navigation Bar */}
      <header className="glass-panel border-b border-border/50 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="truncate">
            <h2 className="font-heading font-bold text-lg md:text-xl text-white truncate">{currentNovel.title}</h2>
            <p className="text-xs text-muted-foreground truncate">
              {currentNovel.chapters.length} Capítulos &bull; {currentNovel.characters.length} Personajes
            </p>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Selector */}
          <div className="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setReaderTheme('dark')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${readerTheme === 'dark' ? 'bg-purple-600 text-white font-bold' : 'text-muted-foreground hover:text-white'}`}
            >
              Oscuro
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${readerTheme === 'sepia' ? 'bg-amber-600 text-white font-bold' : 'text-muted-foreground hover:text-white'}`}
            >
              Sepia
            </button>
            <button
              onClick={() => setReaderTheme('midnight')}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${readerTheme === 'midnight' ? 'bg-indigo-600 text-white font-bold' : 'text-muted-foreground hover:text-white'}`}
            >
              Noche
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 text-xs rounded ${fontSize === 'sm' ? 'bg-purple-600 text-white font-bold' : 'text-muted-foreground hover:text-white'}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-1 text-xs rounded ${fontSize === 'md' ? 'bg-purple-600 text-white font-bold' : 'text-muted-foreground hover:text-white'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 text-xs rounded ${fontSize === 'lg' ? 'bg-purple-600 text-white font-bold' : 'text-muted-foreground hover:text-white'}`}
            >
              A+
            </button>
          </div>

          {/* Audio Rate Control */}
          <select
            value={speechRate}
            onChange={(e) => setSpeechRate(Number(e.target.value))}
            className="hidden sm:block bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none"
            title="Velocidad de voz"
          >
            <option value={0.75} className="bg-slate-900">0.75x</option>
            <option value={1.0} className="bg-slate-900">1.0x Normal</option>
            <option value={1.25} className="bg-slate-900">1.25x</option>
            <option value={1.5} className="bg-slate-900">1.5x</option>
          </select>

          {/* Audio Speech Button */}
          <Button
            variant={isReadingAudio ? "purple" : "outline"}
            size="icon"
            onClick={toggleSpeech}
            title="Escuchar audio"
          >
            {isReadingAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          {/* Characters Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCharacters(!showCharacters)}
            className="gap-1.5"
          >
            <Users className="h-4 w-4 text-purple-400" />
            <span className="hidden sm:inline">Personajes</span>
          </Button>

          {/* Export Button */}
          <Button
            variant="purple"
            size="sm"
            onClick={() => onExport(currentNovel)}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>

          {/* Close Reader */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Split Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Storyboard & Illustrations Panel */}
        <div className="w-full lg:w-5/12 bg-black/40 border-b lg:border-b-0 lg:border-r border-border/40 p-6 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Storyboard & Ilustraciones
            </h3>
            <Badge variant="outline">Capítulo {currentChapterIdx + 1}</Badge>
          </div>

          {currentChapter?.images && currentChapter.images.length > 0 ? (
            <div className="space-y-4">
              {currentChapter.images.map((imgUrl, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 shadow-2xl glass-card">
                  <img
                    src={imgUrl}
                    alt={`Ilustración ${idx + 1}`}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-white/90 border border-white/10 font-mono">
                    Escena #{idx + 1}
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateChapterImage}
                disabled={isGeneratingImage}
                className="w-full mt-4 gap-2 text-xs"
              >
                <Sparkles className={`h-3.5 w-3.5 text-amber-400 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                {isGeneratingImage ? 'Generando Escena...' : 'Generar Otra Ilustración con IA'}
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-purple-400 opacity-60" />
              </div>
              <h4 className="font-heading text-base text-white font-medium mb-1">Sin Ilustración de Escena</h4>
              <p className="text-xs text-muted-foreground max-w-xs mb-6">
                Genera un storyboard visual en formato acuarela para dar vida a las escenas de este capítulo.
              </p>

              <Button
                variant="default"
                size="sm"
                onClick={handleGenerateChapterImage}
                disabled={isGeneratingImage}
                className="gap-2"
              >
                <Sparkles className={`h-4 w-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                {isGeneratingImage ? 'Generando Ilustración...' : 'Generar Ilustración con IA'}
              </Button>
            </div>
          )}
        </div>

        {/* Right Side: Chapter Text Reader Panel */}
        <div className={`flex-1 flex flex-col p-6 md:p-10 overflow-y-auto ${themeClasses[readerTheme]}`}>
          <div className="max-w-3xl mx-auto w-full flex-1">
            {/* Chapter Header */}
            <div className="border-b border-border/60 pb-6 mb-8 text-center">
              <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase font-mono">
                Capítulo {currentChapterIdx + 1} de {currentNovel.chapters.length}
              </span>
              <h1 className="font-heading text-2xl md:text-4xl font-extrabold text-white mt-2 mb-4">
                {currentChapter?.title || 'Capítulo Sin Título'}
              </h1>
              {currentChapter?.summary && (
                <p className="text-sm italic text-muted-foreground max-w-xl mx-auto bg-white/5 border border-white/10 p-3 rounded-lg">
                  "{currentChapter.summary}"
                </p>
              )}
            </div>

            {/* Chapter Narrative Body */}
            <div className={`font-story space-y-6 ${fontSizeClasses[fontSize]}`}>
              {currentChapter?.content ? (
                currentChapter.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="first-letter:text-3xl first-letter:font-bold first-letter:text-purple-400 first-letter:mr-1">
                    {paragraph}
                  </p>
                ))
              ) : (
                <div className="text-center py-12 px-6 rounded-2xl bg-white/5 border border-purple-500/20 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Este capítulo aún no tiene texto expandido</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Expande la narración completa de este capítulo llamando al modelo de IA de Google Gemini.
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto space-y-2 pt-2">
                    <input
                      type="password"
                      placeholder="API Key de Gemini (Opcional si está en .env)"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 text-center"
                    />
                    <Button
                      variant="default"
                      onClick={handleExpandChapter}
                      disabled={isExpandingChapter}
                      className="w-full gap-2"
                    >
                      <Sparkles className={`h-4 w-4 ${isExpandingChapter ? 'animate-spin' : ''}`} />
                      {isExpandingChapter ? 'Expandiendo Capítulo...' : 'Expandir Capítulo con IA'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chapter Navigation Footer */}
          <div className="max-w-3xl mx-auto w-full pt-8 mt-12 border-t border-border/60 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentChapterIdx === 0}
              onClick={() => setCurrentChapterIdx(prev => Math.max(0, prev - 1))}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <span className="text-xs font-mono text-muted-foreground">
              {currentChapterIdx + 1} / {currentNovel.chapters.length}
            </span>

            <Button
              variant="purple"
              disabled={currentChapterIdx === currentNovel.chapters.length - 1}
              onClick={() => setCurrentChapterIdx(prev => Math.min(currentNovel.chapters.length - 1, prev + 1))}
              className="gap-2"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Characters Modal Drawer */}
      {showCharacters && (
        <div className="absolute right-0 top-16 bottom-0 w-full max-w-md bg-card/95 backdrop-blur-2xl border-l border-border/60 p-6 z-50 overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Personajes Principales
            </h3>
            <button onClick={() => setShowCharacters(false)} className="p-1 text-muted-foreground hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {currentNovel.characters.map((char, idx) => (
              <div key={idx} className="glass-card p-4 rounded-xl space-y-2 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                      {char.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-white text-base">{char.name}</h4>
                      {char.archetype && (
                        <span className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold">
                          {char.archetype}
                        </span>
                      )}
                    </div>
                  </div>
                  {char.emotionalState && (
                    <Badge variant="default" className="text-[10px]">
                      {char.emotionalState}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-12">
                  {char.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
