import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          Neto Autonomo
        </Link>

        <nav className="nav" aria-label="Navegacion principal">
          <a href="#calculadora">Calculadora</a>
          <a href="#faq">FAQ</a>
        </nav>
      </div>
    </header>
  );
}
