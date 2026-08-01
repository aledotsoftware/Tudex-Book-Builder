import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { BookOpen, Sparkles, Feather } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tudex Book Builder | Generador de Novelas & Cuentos Ilustrados',
  description: 'Plataforma para crear, leer y explorar novelas y cuentos ilustrados interactivos impulsados por Inteligencia Artificial.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 glass-panel border-b border-border/40 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <div className="h-full w-full bg-background/90 rounded-[10px] flex items-center justify-center">
                  <Feather className="h-5 w-5 text-purple-400 group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div>
                <span className="font-heading text-xl font-bold tracking-wider text-gradient">TUDEX</span>
                <span className="text-xs tracking-widest text-muted-foreground block -mt-1 font-sans">BOOK BUILDER</span>
              </div>
            </Link>

            <nav className="flex items-center gap-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Biblioteca
              </Link>
              <a 
                href="#wizard" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                Crear Cuento / Novela
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="glass-panel border-t border-border/40 py-6 px-6 text-center text-sm text-muted-foreground mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Feather className="h-4 w-4 text-purple-400" />
              <span>Tudex Book Builder &copy; {new Date().getFullYear()}</span>
            </div>
            <p className="text-xs text-muted-foreground/80">
              Generador de historias ilustradas alimentado por Gemini 2.0 Flash
            </p>
          </div>
        </footer>

        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
