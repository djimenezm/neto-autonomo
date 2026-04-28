export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="/" className="brand">
          Neto Autónomo
        </a>

        <nav className="nav" aria-label="Navegación principal">
          <a href="/#calculadora">Calculadora</a>
          <a href="/#faq">FAQ</a>
          <a href="/cuanto-facturar-autonomo">Guía</a>
          <a href="/tabla-cuanto-facturar-autonomo">Tabla</a>
          <a href="/horas-facturables-freelance">Horas</a>
          <a href="/cuanto-facturar-autonomo-1500-euros">1500 netos</a>
          <a href="/cuanto-facturar-autonomo-2500-euros">2500 netos</a>
          <a href="/cuanto-facturar-autonomo-3000-euros">3000 netos</a>
        </nav>
      </div>
    </header>
  );
}
