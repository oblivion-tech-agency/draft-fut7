import type { Metadata } from 'next';
import { DraftProvider } from '@/components/draft7/DraftContext';
import { Header, Footer } from '@/components/draft7/Layout';

export const metadata: Metadata = {
  title: 'Draft7 - Arma tus equipos de Fútbol 7',
  description: 'Organiza tu partido sin discusiones con el sistema de turnos 1-2-2.',
};

export default function Draft7Layout({ children }: { children: React.ReactNode }) {
  return (
    <DraftProvider>
      <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </DraftProvider>
  );
}
