import { getSiteUrl, siteConfig } from '@/lib/site';
import ToolChooser from '@/components/ToolChooser';

export const route = '/cuanto-facturar-autonomo';
export const title = 'Cuánto facturar como autónomo en España';
export const description =
  'Calcula cuánto facturar como autónomo y elige la ayuda para tu duda: tarifa, jornadas, rebajas, servicios combinados, meses sin facturar, facturas, caja o encargos terminados.';

export const pageFaqItems = [
  {
    question: '¿Qué ayuda uso después de calcular mi tarifa?',
    answer:
      'Elige según la decisión: comprobar una jornada o una rebaja antes de aceptar, combinar servicios y meses activos para planificar, distinguir base y cobro de una factura, ordenar cobros y pagos por fecha o revisar las horas de un encargo terminado. El selector indica los datos necesarios y los límites de cada ayuda. Sus enlaces abren cada ayuda sin trasladar los datos de tu cálculo.',
  },
  {
    question: '¿Cuánto tengo que facturar para ganar 1.500 euros netos?',
    answer:
      'Depende de tus gastos, de tu cuota de autónomos, del IRPF que te corresponda, del IVA si aplica y de cuántas horas puedas facturar al mes. Por eso conviene calcularlo con una simulación en vez de asumir que facturación y neto son lo mismo.',
  },
  {
    question: '¿Es mejor pensar en precio por hora o por proyecto?',
    answer:
      'Las dos opciones pueden funcionar, pero incluso si presupuestas por proyecto te conviene conocer tu referencia por hora. Te ayuda a detectar encargos poco rentables y a decidir con más criterio si una propuesta te deja el margen que buscas.',
  },
  {
    question: '¿Sirve esta guía si soy freelance y no me identifico como autónomo?',
    answer:
      'Sí. Está pensada para profesionales independientes que facturan servicios en España. Si trabajas como freelance, consultor o proveedor de servicios, la lógica de neto, gastos, impuestos y horas facturables te afecta igual.',
  },
] as const;

export default function CuantoFacturarAutonomoPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = new URL(route, siteUrl).toString();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: 'es',
    mainEntityOfPage: pageUrl,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    datePublished: '2026-04-22',
    dateModified: '2026-10-28',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: new URL('/', siteUrl).toString(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: pageUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pageFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <main id="contenido-principal">
      <script
        id="cuanto-facturar-autonomo-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="cuanto-facturar-autonomo-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script
        id="cuanto-facturar-autonomo-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <section className="hero">
        <div className="container article-layout">
          <div className="text-block">
            <span className="eyebrow">Guía práctica</span>
            <h1>Cuánto facturar como autónomo en España sin quedarte corto</h1>
            <p className="lead">
              Parte del neto que quieres conservar y cubre gastos, cuota y reserva de IRPF para
              obtener una facturación objetivo sin IVA. Después distingue esa base del importe
              que abonaría el cliente: el IVA y las retenciones, cuando correspondan, cambian
              la cuenta del cobro. Tus horas facturables permiten convertir la base en tarifa.
            </p>
            <div className="hero-badges" aria-label="Qué cubre esta guía">
              <span className="hero-badge">Neto objetivo</span>
              <span className="hero-badge">IRPF e IVA</span>
              <span className="hero-badge">Tarifa por hora</span>
            </div>
            <div className="guide-cta">
              <a href="/#calculadora" className="primary-button">
                Ir a la calculadora
              </a>
              <a href="#elegir-herramienta" className="link-button">Elegir una ayuda para mi duda</a>
            </div>
          </div>

          <aside className="feature-card article-summary">
            <h2>Qué vas a entender aquí</h2>
            <ul className="article-list">
              <li>Por qué facturar y ganar no son lo mismo.</li>
              <li>Qué variables debes tener en cuenta antes de poner precio.</li>
              <li>Cómo convertir tu objetivo de neto mensual en una cifra de facturación.</li>
              <li>Cómo pasar esa cifra a una tarifa por hora o a un presupuesto por proyecto.</li>
              <li>Qué ayuda usar según la decisión que necesitas tomar.</li>
            </ul>
          </aside>
        </div>
      </section>

      <ToolChooser />

      <section className="section">
        <div className="container text-block">
          <h2>Qué incluye realmente lo que tienes que facturar</h2>
          <p>
            Cuando hablas de cuánto facturar como autónomo, en realidad estás intentando responder
            a una pregunta más útil: cuánto necesitas ingresar para que, después de pagar tus gastos
            y tus obligaciones fiscales, te quede el neto que buscas.
          </p>
          <p>
            Esa cifra no depende solo de lo que quieres ganar. También cambia según tus gastos
            deducibles, tu cuota de autónomos, el IRPF que reserves, si tu actividad lleva IVA y el
            número de horas facturables que seas capaz de sostener sin saturarte.
          </p>
          <p>
            No confundas facturación, cobro y neto. Una base de 1000 EUR con 210 EUR de IVA y
            una retención hipotética de 150 EUR daría un cobro de 1060 EUR; ni ese cobro ni los
            1000 EUR de base son por sí solos el neto. Puedes revisar la cuenta en el
            {' '}<a href="/tarifa-freelance-por-hora#ejemplo-cobro">ejemplo y comprobador de base, IVA y retención</a>.
          </p>
          <div className="disclaimer-box">
            <strong>Idea clave:</strong> si quieres ganar 1.500 euros netos, normalmente tendrás que
            facturar bastante más de 1.500. La diferencia es justo lo que esta guía y la calculadora
            te ayudan a aterrizar.
          </div>
          <p className="scenario-note">Actualizada el <time dateTime="2026-10-28">28 de octubre de 2026</time>.</p>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Pasos para calcular cuánto facturar">
          <article className="feature-card">
            <h2>1. Define tu neto real</h2>
            <p>
              Empieza por lo que quieres conservar al mes, no por el precio que te gustaría cobrar.
              Ese neto es tu referencia de vida y de negocio.
            </p>
          </article>

          <article className="feature-card">
            <h2>2. Suma lo que tu actividad consume</h2>
            <p>
              Añade gastos, cuota de autónomos y una reserva razonable de IRPF. Si tu actividad lleva
              IVA, recuerda que ese importe no es ingreso real: se cobra y luego se liquida.
            </p>
          </article>

          <article className="feature-card">
            <h2>3. Baja la cifra a horas o proyectos</h2>
            <p>
              Una vez tienes la facturación objetivo, compárala con tus horas facturables reales para
              saber qué tarifa por hora te sostiene o cuánto margen tienes en cada propuesta.
              {' '}La <a href="/horas-facturables-freelance">guía de horas facturables mensuales</a>{' '}
              muestra cómo descontar gestión, captación y reserva sin contar dos veces una tarea.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Fórmula mental rápida antes de presupuestar</h2>
          <ol className="article-list article-list-ordered">
            <li>Piensa cuánto quieres conservar de verdad al mes.</li>
            <li>Suma tus gastos mensuales deducibles.</li>
            <li>Añade una cuota de autónomos realista para tu situación.</li>
            <li>Reserva IRPF antes de tocar ese dinero.</li>
            <li>Separa siempre el IVA si tu actividad lo repercute.</li>
            <li>Divide el total entre tus horas facturables, no entre todas tus horas de trabajo.</li>
          </ol>
          <p>
            El error más frecuente es dividir lo que quieres ganar entre las horas que te gustaría
            vender y olvidarte del resto. Eso da una tarifa demasiado optimista y suele acabar en
            presupuestos ajustados o en semanas llenas de trabajo con un margen pobre.
          </p>
        </div>
      </section>

      <section className="section alt">
        <div className="container feature-grid" aria-label="Errores frecuentes al poner precio">
          <article className="feature-card">
            <h2>Confundir ingresos con neto</h2>
            <p>
              Facturar no equivale a ganar. Si no reservas impuestos ni cubres gastos, la cifra que
              parece buena sobre el papel se desinfla rápido.
            </p>
          </article>

          <article className="feature-card">
            <h2>Sobreestimar horas vendibles</h2>
            <p>
              No todas tus horas de trabajo son horas facturables. Administración, ventas, reuniones
              y gestión también ocupan tiempo y reducen el número real de horas que puedes cobrar.
            </p>
          </article>

          <article className="feature-card">
            <h2>Poner precio sin escenario</h2>
            <p>
              Una tarifa aislada dice poco. Lo útil es comparar escenarios con más o menos gastos,
              horas o carga fiscal para ver dónde está tu mínimo razonable.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <h2>Usa la calculadora para aterrizar tu caso</h2>
          <p>
            Esta guía te da el marco mental. La calculadora te ayuda a llevarlo a números concretos.
            Puedes probar distintos escenarios con neto mensual, gastos, IRPF, cuota de autónomos,
            horas facturables e IVA para obtener una referencia mensual y una tarifa por hora más
            defendible.
          </p>
          <p>
            Si tu objetivo está cerca de un caso muy concreto, también puedes apoyarte en la guía
            sobre{' '}
            <a href="/tabla-cuanto-facturar-autonomo#neto-2000">
              cuánto facturar como autónomo para ganar 2000 euros netos
            </a>.
          </p>
          <p>
            Y cuando ya tengas clara tu cifra, puedes revisar también la comparativa de{' '}
            <a href="/mejores-programas-facturacion-autonomos">
              mejores programas de facturación para autónomos
            </a>{' '}
            para elegir con qué herramienta ordenar esa parte del negocio.
          </p>
          <div className="guide-cta">
            <a href="/#calculadora" className="primary-button">
              Calcular mi referencia
            </a>
          </div>
        </div>
      </section>

      <section className="section alt" aria-labelledby="cuanto-facturar-faq-title">
        <div className="container text-block">
          <h2 id="cuanto-facturar-faq-title">Preguntas frecuentes sobre cuánto facturar</h2>

          <div className="faq-list">
            {pageFaqItems.map((item) => (
              <article className="faq-item" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container text-block">
          <span className="eyebrow">Siguiente lectura</span>
          <h2>Después de la facturación, toca aterrizar tu tarifa</h2>
          <p>
            Si ya tienes clara tu referencia mensual, el siguiente paso útil es convertirla en una
            tarifa por hora que te sirva para presupuestos, propuestas y proyectos cerrados.
          </p>
          <p>
            Y si lo que todavía te genera dudas es la parte de cotización, también puedes revisar
            cómo encaja la cuota de autónomos de 2026 dentro de este cálculo.
          </p>
          <div className="guide-cta">
            <a href="/tarifa-freelance-por-hora" className="primary-button">
              Leer guía sobre tarifa por hora
            </a>
            <a href="/cuota-autonomos-2026" className="primary-button">
              Ver guía sobre cuota 2026
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
