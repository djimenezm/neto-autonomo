export const faqItems = [
  {
    question: '¿Cómo saber cuánto facturar como autónomo?',
    answer:
      'Empieza por el neto mensual que quieres conservar, suma tus gastos, reserva IRPF, cuota de autónomos e IVA cuando corresponda. Esta calculadora hace esa estimación de forma rápida para darte una base de precio.',
  },
  {
    question: '¿El cálculo es exacto?',
    answer:
      'No. Es una estimación orientativa pensada para ayudarte a tomar decisiones rápidas. La tributación real puede variar según tu situación concreta.',
  },
  {
    question: '¿El IVA cuenta como ganancia?',
    answer:
      'No. El IVA normalmente se repercute al cliente y luego se liquida. Por eso esta web lo muestra aparte.',
  },
  {
    question: '¿Sirve para nuevos autónomos?',
    answer:
      'Sí, aunque la cuota real puede variar según bonificaciones, tramo de rendimientos o circunstancias personales.',
  },
  {
    question: '¿Puedo usarlo para calcular mi tarifa por hora?',
    answer:
      'Sí. Si introduces tus horas facturables al mes, la herramienta te devolverá una tarifa orientativa por hora para ayudarte a fijar precios como freelance o profesional por servicios.',
  },
  {
    question: '¿Por qué el IRPF puede cambiar según la comunidad autónoma?',
    answer:
      'Porque una parte del IRPF depende de la escala autonómica. La calculadora usa una aproximación para varias comunidades frecuentes y una referencia general para Territorio común.',
  },
  {
    question: '¿Sustituye a una gestoría o a un asesor fiscal?',
    answer:
      'No. Sirve para orientarte y poner precios con más criterio, pero no reemplaza una revisión profesional si vas a tomar decisiones fiscales o contractuales importantes.',
  },
  {
    question: '¿Sirve si trabajo como freelance en marketing, diseño, desarrollo o consultoría?',
    answer:
      'Sí. La calculadora está pensada precisamente para actividades de servicios donde necesitas traducir un objetivo de neto mensual a una tarifa, una cuota mensual o un precio por proyecto.',
  },
] as const;

export default function FAQ() {
  return (
    <section className="section alt" id="faq" aria-labelledby="faq-title">
      <div className="container text-block">
        <h2 id="faq-title">Preguntas frecuentes</h2>

        <div className="faq-list">
          {faqItems.map((item) => (
            <article className="faq-item" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
