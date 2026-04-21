import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="legal-page container">
      <h1>Pagina no encontrada</h1>
      <p>La pagina que buscas no existe o ya no esta disponible.</p>
      <p>
        Puedes volver a la <Link href="/">calculadora principal</Link>.
      </p>
    </main>
  );
}
