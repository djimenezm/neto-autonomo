import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          Neto Autónomo
        </Link>

        <nav className="nav" aria-label="Navegación principal">
          <Link href="/#calculadora">Calculadora</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/cuanto-facturar-autonomo">Guía</Link>
          <Link href="/cuanto-facturar-autonomo-1500-euros">1500 netos</Link>
          <Link href="/cuanto-facturar-autonomo-2500-euros">2500 netos</Link>
          <Link href="/cuanto-facturar-autonomo-3000-euros">3000 netos</Link>
        </nav>
      </div>
    </header>
  );
}
