import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          Neto Autónomo
        </Link>

        <nav className="nav" aria-label="Navegación principal">
          <a href="#calculadora">Calculadora</a>
          <a href="#faq">FAQ</a>
        </nav>
      </div>
    </header>
  );
}
