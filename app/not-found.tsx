import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="legal-page container">
      <h1>Página no encontrada</h1>
      <p>La página que buscas no existe o ya no está disponible.</p>
      <p>
        Puedes volver a la <Link href="/">calculadora principal</Link>.
      </p>
    </main>
  );
}
