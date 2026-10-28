export type ToolChooserLink = {
  href: string;
  label: string;
};

export type ToolChooserCard = {
  id: string;
  title: string;
  prepare: string;
  shows: string;
  limit: string;
  link: ToolChooserLink;
  relatedLinks: readonly ToolChooserLink[];
};

export type ToolChooserGroup = {
  id: string;
  title: string;
  cards: readonly ToolChooserCard[];
};

export const toolChooserGroups: readonly ToolChooserGroup[] = [
  {
    id: 'ayudas-preparar-tarifa',
    title: 'Preparar la tarifa',
    cards: [
      {
        id: 'tarifa-partida',
        title: 'Quiero calcular mi tarifa de partida',
        prepare: 'Tu neto deseado, gastos, cuota y horas que puedes facturar al mes.',
        shows: 'Obtén una referencia de facturación mensual y tarifa por hora para presupuestar.',
        limit: 'Es una simulación orientativa. Si todavía no conoces tus costes u horas, prepara primero esos datos con las ayudas relacionadas.',
        link: { href: '/#calculadora', label: 'Calcular mi referencia de tarifa' },
        relatedLinks: [
          { href: '/cuanto-cuesta-ser-autonomo#cost-calculator-heading', label: 'Preparar mis costes mensuales' },
          { href: '/horas-facturables-freelance#agenda-anual-title', label: 'Estimar mis horas con una agenda anual' },
        ],
      },
      {
        id: 'meses-sin-facturacion',
        title: 'No facturo todos los meses',
        prepare: 'Tu referencia mensual, meses con facturación y horas de cada mes activo.',
        shows: 'Reparte la necesidad anual entre meses activos, manteniendo objetivo y costes los doce meses.',
        limit: 'La guía parte de 1500 EUR netos ficticios. Para tu objetivo, calcula primero y abre «Planificar los meses sin facturación» en el resultado.',
        link: { href: '/cuanto-facturar-autonomo-1500-euros#comprobar-plan-anual', label: 'Ver el ejemplo de meses activos' },
        relatedLinks: [],
      },
    ],
  },
  {
    id: 'ayudas-antes-de-aceptar',
    title: 'Antes de aceptar',
    cards: [
      {
        id: 'precio-jornada',
        title: 'Tengo un precio para una jornada',
        prepare: 'Tu referencia por hora, duración, preparación, cierre y costes específicos. Añade el precio ofrecido si lo tienes.',
        shows: 'Compara el precio de la jornada con todo el tiempo y los costes que debe cubrir.',
        limit: 'No dupliques gastos ya incluidos en tu referencia. El importe por hora que queda no es beneficio neto.',
        link: { href: '/tarifa-diaria-freelance#comprobar-jornada', label: 'Comprobar una jornada completa' },
        relatedLinks: [],
      },
      {
        id: 'rebaja-tarifa',
        title: 'Me piden una rebaja de tarifa',
        prepare: 'Tarifa actual, porcentaje de rebaja, horas facturadas y capacidad mensual para esos servicios.',
        shows: 'Ve cuánto baja la facturación con las mismas horas y cuántas más necesitarías para recuperarla.',
        limit: 'Se mantiene el mismo servicio y alcance. Que las horas quepan no garantiza venderlas ni conservar el mismo neto.',
        link: { href: '/tarifa-freelance-por-hora#descuento-tarifa', label: 'Comprobar la rebaja y las horas necesarias' },
        relatedLinks: [],
      },
    ],
  },
  {
    id: 'ayudas-organizar-actividad',
    title: 'Organizar la actividad',
    cards: [
      {
        id: 'servicios-combinados',
        title: 'Vendo cuotas y proyectos distintos',
        prepare: 'Cantidad, precio y horas de cada tipo de servicio del mes; objetivo de facturación y capacidad.',
        shows: 'Comprueba si la combinación alcanza la facturación objetivo y cabe por horas.',
        limit: 'La guía parte de 3000 EUR netos ficticios. Para tu objetivo, abre la combinación de servicios dentro de la ayuda de encargos de tu resultado.',
        link: { href: '/cuanto-facturar-autonomo-3000-euros#combinar-encargos', label: 'Ver el ejemplo de servicios combinados' },
        relatedLinks: [],
      },
      {
        id: 'caja-por-fechas',
        title: 'Cobro y pago en días diferentes',
        prepare: 'Saldo inicial y fechas e importes previstos de cobros y pagos.',
        shows: 'Comprueba si aparece un déficit antes de cobrar, aunque el saldo final sea positivo.',
        limit: 'En una misma fecha se restan primero los pagos y después se suman los cobros. Es un supuesto, no el orden real del banco.',
        link: { href: '/cuanto-cuesta-ser-autonomo#vencimientos-caja', label: 'Comprobar los vencimientos por fecha' },
        relatedLinks: [
          { href: '/cuanto-cuesta-ser-autonomo#plan-caja', label: 'Empezar por un plan de tres meses' },
        ],
      },
    ],
  },
  {
    id: 'ayudas-entender-y-revisar',
    title: 'Entender y revisar',
    cards: [
      {
        id: 'base-iva-retencion',
        title: 'Quiero entender base, IVA y retención',
        prepare: 'Tu duda sobre base, IVA, retención e importe a cobrar.',
        shows: 'Sigue un ejemplo de factura y prueba cómo cambia el cobro al variar la retención.',
        limit: 'Solo cambia la retención: la base y el IVA son ficticios. No determina tus tipos aplicables ni tu impuesto final.',
        link: { href: '/tarifa-freelance-por-hora#ejemplo-cobro', label: 'Entender el ejemplo de base, IVA y retención' },
        relatedLinks: [],
      },
      {
        id: 'revision-encargo',
        title: 'Quiero revisar un encargo terminado',
        prepare: 'Tu referencia por hora, precio final sin IVA y horas previstas y reales del encargo.',
        shows: 'Compara el ingreso por hora previsto con el real y revisa el tiempo consumido.',
        limit: 'Cuenta preparación, reuniones y revisiones. El ingreso por hora no descuenta gastos, cuota ni impuestos y no acredita el cobro.',
        link: { href: '/kit-tarifa-autonomo#revision-encargo', label: 'Revisar el precio y las horas reales' },
        relatedLinks: [],
      },
    ],
  },
];
