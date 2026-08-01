'use client';

import React, { useEffect, useState } from 'react';
import { Novel } from '@/app/api/novels/route';
import BookReader from '@/components/BookReader';
import CreateStoryWizard from '@/components/CreateStoryWizard';
import ExportModal from '@/components/ExportModal';
import { 
  BookOpen, Sparkles, Plus, Search, Filter, 
  Users, Feather, Download, RefreshCw, BookMarked,
  Trash2, FileText, Image as ImageIcon, Layers, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function Dashboard() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'chapters' | 'words'>('date');

  // Modals & Active State
  const [activeNovel, setActiveNovel] = useState<Novel | null>(null);
  const [exportNovel, setExportNovel] = useState<Novel | null>(null);
  const [novelToDelete, setNovelToDelete] = useState<Novel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const fetchNovels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/novels');
      const data = await res.json();
      if (res.ok && data.novels) {
        setNovels(data.novels);
      } else {
        toast.error('No se pudieron cargar los libros de la biblioteca.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al conectar con la biblioteca local.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  const handleDeleteNovel = async () => {
    if (!novelToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/novels?folder=${encodeURIComponent(novelToDelete.folderName)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`La novela "${novelToDelete.title}" ha sido eliminada.`);
        setNovelToDelete(null);
        fetchNovels();
      } else {
        toast.error(data.error || 'Error al eliminar la novela.');
      }
    } catch (err) {
      toast.error('Ocurrió un error al intentar eliminar la novela.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics calculation
  const totalBooks = novels.length;
  const totalChapters = novels.reduce((acc, n) => acc + (n.chapters ? n.chapters.length : 0), 0);
  const totalWords = novels.reduce((acc, n) => acc + (n.totalWords || 0), 0);
  const totalImages = novels.reduce((acc, n) => acc + (n.totalImages || 0), 0);

  // Filter & Sort
  const filteredNovels = novels
    .filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'chapters') return (b.chapters?.length || 0) - (a.chapters?.length || 0);
      if (sortBy === 'words') return (b.totalWords || 0) - (a.totalWords || 0);
      // default: date
      return (b.dateCreated || '').localeCompare(a.dateCreated || '');
    });

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Header Banner */}
      <section className="relative rounded-3xl glass-panel border border-white/10 p-8 md:p-12 overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            Node.js & Docker Commercial Engine
          </div>

          <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Tudex Book Builder <br />
            <span className="text-gradient">Plataforma de Novelas Ilustradas</span>
          </h1>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-sans max-w-2xl">
            Genera relatos ricos en detalles, diseña personajes y construye storyboards visuales asistidos por IA en un entorno de producción contenerizado.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              onClick={() => setShowWizard(true)}
              className="shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Nueva Novela con IA
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={fetchNovels}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
              Actualizar Biblioteca
            </Button>
          </div>
        </div>
      </section>

      {/* Commercial Metrics Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <BookMarked className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold font-heading text-white block">{totalBooks}</span>
            <span className="text-xs text-muted-foreground">Novelas Creadas</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold font-heading text-white block">{totalChapters}</span>
            <span className="text-xs text-muted-foreground">Capítulos Expandidos</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold font-heading text-white block">{totalWords.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">Palabras Narradas</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold font-heading text-white block">{totalImages}</span>
            <span className="text-xs text-muted-foreground">Escenas Ilustradas</span>
          </div>
        </div>
      </section>

      {/* Library Controls Bar */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="font-heading font-bold text-2xl text-white flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-purple-400" />
            Biblioteca de Historias
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredNovels.length} {filteredNovels.length === 1 ? 'libro disponible' : 'libros disponibles'} en el almacenamiento
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar título o sinopsis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-white/10 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          >
            <option value="date">Ordenar por Fecha</option>
            <option value="title">Ordenar por Título</option>
            <option value="chapters">Ordenar por Capítulos</option>
            <option value="words">Ordenar por Palabras</option>
          </select>
        </div>
      </section>

      {/* Novels Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando biblioteca de novelas...</p>
        </div>
      ) : filteredNovels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNovels.map((novel, idx) => (
            <Card
              key={idx}
              className="glass-card-hover flex flex-col justify-between space-y-5 border border-white/10 relative group"
            >
              <CardHeader className="p-6 pb-0 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="default">
                    {novel.chapters.length} {novel.chapters.length === 1 ? 'Capítulo' : 'Capítulos'}
                  </Badge>
                  {novel.dateCreated && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {novel.dateCreated}
                    </span>
                  )}
                </div>

                <CardTitle className="group-hover:text-purple-300 transition-colors line-clamp-1">
                  {novel.title}
                </CardTitle>

                <CardDescription className="line-clamp-3 leading-relaxed">
                  {novel.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                {/* Stats row */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-white/5">
                  <span>{novel.totalWords ? `${novel.totalWords.toLocaleString()} palabras` : 'Texto expandido'}</span>
                  <span>{novel.totalImages ? `${novel.totalImages} ilustraciones` : 'Sin imágenes'}</span>
                </div>

                {/* Characters Badges */}
                {novel.characters && novel.characters.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider block">
                      Personajes ({novel.characters.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {novel.characters.slice(0, 3).map((c, cIdx) => (
                        <Badge key={cIdx} variant="secondary" className="truncate max-w-[120px]">
                          {c.name}
                        </Badge>
                      ))}
                      {novel.characters.length > 3 && (
                        <Badge variant="outline">
                          +{novel.characters.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Actions Footer */}
              <CardFooter className="p-6 pt-0 flex items-center gap-2">
                <Button
                  variant="purple"
                  className="flex-1 gap-2"
                  onClick={() => setActiveNovel(novel)}
                >
                  <BookOpen className="h-4 w-4" />
                  Leer Libro
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setExportNovel(novel)}
                  title="Exportar archivo"
                >
                  <Download className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setNovelToDelete(novel)}
                  className="hover:border-red-500/40 hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                  title="Eliminar novela"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel border border-white/10 rounded-2xl p-8 space-y-4">
          <Feather className="h-12 w-12 text-purple-400 mx-auto opacity-50" />
          <h3 className="font-heading font-bold text-lg text-white">No se encontraron novelas</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery ? 'Intenta con otro término de búsqueda.' : 'Aún no hay historias creadas. ¡Empieza creando tu primer libro con la IA!'}
          </p>
          <Button onClick={() => setShowWizard(true)} variant="purple" className="gap-2">
            <Plus className="h-4 w-4" />
            Crear Primera Novela
          </Button>
        </div>
      )}

      {/* Active Reader View */}
      {activeNovel && (
        <BookReader
          novel={activeNovel}
          onClose={() => setActiveNovel(null)}
          onExport={(n) => setExportNovel(n)}
        />
      )}

      {/* Story Wizard Modal */}
      {showWizard && (
        <CreateStoryWizard
          onClose={() => setShowWizard(false)}
          onSuccess={(newNovel) => {
            setShowWizard(false);
            fetchNovels();
            setActiveNovel(newNovel);
          }}
        />
      )}

      {/* Export Modal */}
      {exportNovel && (
        <ExportModal
          novel={exportNovel}
          onClose={() => setExportNovel(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {novelToDelete && (
        <Dialog open={!!novelToDelete} onOpenChange={() => setNovelToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-400">
                <Trash2 className="h-5 w-5" />
                Eliminar Novela
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar permanentemente la novela <strong className="text-white">"{novelToDelete.title}"</strong>? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 gap-2">
              <Button variant="outline" onClick={() => setNovelToDelete(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteNovel}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Definición'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
