export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="/" className="brand">
          Neto Autónomo
        </a>

        <nav className="nav" aria-label="Navegación principal">
          <a href="/#calculadora">Calculadora</a>
          <a href="/#como-funciona">Qué obtienes</a>
          <a href="/cuanto-facturar-autonomo">Guía</a>
          <a href="/tabla-cuanto-facturar-autonomo">Tabla</a>
        </nav>
      </div>
    </header>
  );
}
