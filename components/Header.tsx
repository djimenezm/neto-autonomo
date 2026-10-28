export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="/" className="brand" aria-label="Neto Autónomo, ir al inicio">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span className="brand-wordmark">
            <strong>Neto Autónomo</strong>
            <small>Tarifas para autónomos</small>
          </span>
        </a>

        <nav className="nav" aria-label="Navegación principal">
          <a href="/cuanto-facturar-autonomo#elegir-herramienta">Herramientas</a>
          <a href="/cuanto-facturar-autonomo">Guía</a>
          <a className="nav-secondary" href="/tabla-cuanto-facturar-autonomo">Tabla</a>
          <a className="nav-cta" href="/#calculadora">Calcular ahora <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </header>
  );
}
