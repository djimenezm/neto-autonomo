import { toolChooserGroups } from '@/lib/toolChooser';
import styles from './ToolChooser.module.css';

export default function ToolChooser() {
  return (
    <section className="section alt" aria-labelledby="elegir-herramienta">
      <div className={`container ${styles.chooser}`}>
        <div className={styles.intro}>
          <h2 id="elegir-herramienta">¿Qué necesitas resolver?</h2>
          <p>Empieza por tu duda de hoy; no necesitas recorrer todas las ayudas. Cada enlace abre la ayuda elegida sin trasladar tus datos del cálculo.</p>
        </div>
        <nav aria-label="Etapas para elegir una ayuda">
          <ul className={styles.stages}>
            {toolChooserGroups.map((group) => <li key={group.id}><a href={`#${group.id}`}>{group.title}</a></li>)}
          </ul>
        </nav>
        {toolChooserGroups.map((group) => (
          <div className={styles.group} key={group.id}>
            <h3 id={group.id}>{group.title}</h3>
            <div className={styles.cards}>
              {group.cards.map((card) => (
                <article className={styles.card} key={card.id} aria-labelledby={`ayuda-${card.id}`}>
                  <h4 id={`ayuda-${card.id}`}>{card.title}</h4>
                  <p><strong>Prepara:</strong> {card.prepare}</p>
                  <p>{card.shows}</p>
                  <p className={styles.limit}>{card.limit}</p>
                  <a className={styles.action} href={card.link.href}>{card.link.label}</a>
                  {card.relatedLinks.length > 0 ? (
                    <ul className={styles.related} aria-label={`Ayudas relacionadas: ${card.title}`}>
                      {card.relatedLinks.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
