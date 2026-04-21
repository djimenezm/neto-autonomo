import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-copy">
          <p>Copyright {new Date().getFullYear()} Neto Autonomo</p>
          <p className="footer-note">Herramienta orientativa. No constituye asesoramiento fiscal ni legal.</p>
        </div>
        <div className="footer-links">
          <Link href="/aviso-legal">Aviso legal</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
