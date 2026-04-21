export const faqItems = [
  {
    question: 'Como saber cuanto facturar como autonomo?',
    answer:
      'Empieza por el neto mensual que quieres conservar, suma tus gastos, reserva IRPF, cuota de autonomos e IVA cuando corresponda. Esta calculadora hace esa estimacion de forma rapida para darte una base de precio.',
  },
  {
    question: 'El calculo es exacto?',
    answer:
      'No. Es una estimacion orientativa pensada para ayudarte a tomar decisiones rapidas. La tributacion real puede variar segun tu situacion concreta.',
  },
  {
    question: 'El IVA cuenta como ganancia?',
    answer:
      'No. El IVA normalmente se repercute al cliente y luego se liquida. Por eso esta web lo muestra aparte.',
  },
  {
    question: 'Sirve para nuevos autonomos?',
    answer:
      'Si, aunque la cuota real puede variar segun bonificaciones, tramo de rendimientos o circunstancias personales.',
  },
  {
    question: 'Puedo usarlo para calcular mi tarifa por hora?',
    answer:
      'Si. Si introduces tus horas facturables al mes, la herramienta te devolvera una tarifa orientativa por hora para ayudarte a fijar precios como freelance o profesional por servicios.',
  },
  {
    question: 'Por que el IRPF puede cambiar segun la comunidad autonoma?',
    answer:
      'Porque una parte del IRPF depende de la escala autonomica. La calculadora usa una aproximacion para varias comunidades frecuentes y una referencia general para Territorio comun.',
  },
  {
    question: 'Sustituye a una gestoria o a un asesor fiscal?',
    answer:
      'No. Sirve para orientarte y poner precios con mas criterio, pero no reemplaza una revision profesional si vas a tomar decisiones fiscales o contractuales importantes.',
  },
  {
    question: 'Sirve si trabajo como freelance en marketing, diseno, desarrollo o consultoria?',
    answer:
      'Si. La calculadora esta pensada precisamente para actividades de servicios donde necesitas traducir un objetivo de neto mensual a una tarifa, una cuota mensual o un precio por proyecto.',
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
