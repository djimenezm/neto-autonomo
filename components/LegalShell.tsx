import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function LegalShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="contenido-principal" className="legal-page container">
        {children}
      </main>
      <Footer />
    </>
  );
}
