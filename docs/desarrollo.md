# Desarrollo de Neto Autónomo

Volver al [README](../README.md).

## Mapa del código

| Ubicación | Responsabilidad |
| --- | --- |
| `app/` | Rutas, metadatos, sitemap, robots y manifest. |
| `app/globals.css` y `app/styles/` | Entrada de estilos y hojas separadas en orden de cascada. |
| `components/HomePage.tsx`, `Header.tsx`, `Footer.tsx`, `FAQ.tsx` | Portada, navegación y preguntas frecuentes. |
| `components/CalculatorForm.tsx`, `MonthlyCostCalculator.tsx`, `ResultCard.tsx` | Formularios y presentación de resultados. |
| `components/LeadMagnetForm.tsx` | Captación del kit de tarifa. |
| `lib/calculator.ts` | Reglas de cálculo y fiscales, independientes de React. |
| `lib/calculatorForm.ts`, `spanishNumber.ts` | Valores iniciales, validación, URL compartible y lectura de números españoles. |
| `lib/site.ts` y `lib/format.ts` | Configuración global y formato de resultados. |
| `lib/billableHoursExamples.ts` | Agendas hipotéticas de la guía de horas, con sus restas y tarifas derivadas. |
| `pages/` | Rutas heredadas y redirecciones, entre ellas `index.tsx` y `cuanto-facturar-autonomo.tsx`. |
| `public/recursos/` | Descarga del kit de tarifa. |
| `tests/` | Pruebas de cálculo, formularios, accesibilidad y configuración. |

## Rutas principales

- `/`: calculadora principal.
- `/cuanto-cuesta-ser-autonomo`: costes mensuales.
- `/cuanto-facturar-autonomo` y `/tabla-cuanto-facturar-autonomo`: guía y tabla de objetivos netos.
- `/cuanto-facturar-autonomo-1500-euros` y `/cuanto-facturar-autonomo-3000-euros`: casos de objetivos concretos.
- `/tarifa-freelance-por-hora`, `/tarifa-diaria-freelance` y `/horas-facturables-freelance`: tarifas y capacidad.
- `/cuota-autonomos-2026`: cuota orientativa.
- `/kit-tarifa-autonomo`: recurso y captación.
- `/mejores-programas-facturacion-autonomos`: guía de herramientas.
- `/aviso-legal`, `/privacidad` y `/cookies`: información legal.

`/gracias-kit-tarifa` es una página de conversión no indexable y se excluye del sitemap. Las antiguas rutas de 2000 y 2500 euros redirigen a sus filas de la tabla.

## Configuración y publicidad

El dominio canónico de producción es <https://www.cuantofacturar.es/>. La Content Security Policy es estricta en producción; en desarrollo solo se relaja Trusted Types para permitir el overlay de errores de Next.js.

Los espacios publicitarios están preparados, pero `lib/ads.ts` exige `NEXT_PUBLIC_ADSENSE_ENABLED=true` y consentimiento gestionado para mostrarlos. No actives esa variable hasta que AdSense apruebe el sitio y se compruebe el flujo de consentimiento.

## Rastreo y respuesta del servidor

- `vercel.json` sitúa las funciones en París (`cdg1`), cerca del público español.
- `/ads.txt` se genera al compilar con el ID de editor configurado. Cambiar ese ID requiere un nuevo despliegue; no contiene datos de visitantes.
- `app/sitemap.ts` registra fechas de cambios editoriales reales. No actualices `lastContentUpdates` solo por desplegar o cambiar estilos.
- Las solicitudes de indexación ya aceptadas no se repiten para intentar adelantar la cola. La aprobación de AdSense y la indexación son procesos independientes de Google.

## Revisión local antes de publicar

### Pagos mensuales, trimestrales y anuales (27 de octubre de 2026)

La calculadora de costes acepta el importe de
cada pago y su frecuencia. La cuota conserva su importe mensual. El ejemplo
ficticio combina gestoría trimestral, software y seguro anuales y otros costes
mensuales: 5760 EUR al año, 480 EUR de media mensual y 6 EUR/h con 80 h/mes.
La guía usa exactamente los mismos datos y explica la diferencia entre repartir
un coste para fijar la tarifa y disponer de dinero para un vencimiento próximo.

`lib/recurringCosts.ts` redondea cada pago a céntimos, lo multiplica por 12, 4 o
1 y suma el coste anual antes de dividir entre 12. No deriva el total anual de
una media mensual redondeada. El desglose opcional expone cada importe y número
de pagos; la página y sus tres esquemas se renderizan en el HTML inicial.

El traslado GET existente conserva cuota, horas y separación entre costes
deducibles/no deducibles, ahora usando las medias mensuales. No se asigna
deducibilidad a una frecuencia. Se invalida la transferencia si un cambio deja
el importe deducible por encima del resto de costes. La suma no calcula IVA,
fechas de cargo, saldo disponible ni imputación fiscal; la guía enlaza a la
explicación de la AEAT sobre el régimen general del IVA.

La mejora no añade eventos ni almacenamiento, no modifica el motor fiscal ni
los formularios de captación y se comprueba con pruebas de cálculo, interfaz,
traslado y revisión móvil. La publicación mantiene los anuncios desactivados y
el piloto y los seguimientos sin cambios; no solicita otra revisión de AdSense.

### Comprobar una tarifa diaria (26 de octubre de 2026)

La guía de tarifa diaria pasa del consejo genérico
a un servicio definido, con seis horas de sesión, una y media de preparación y
media de cierre. `lib/dayRateExample.ts` usa el motor mensual y su tarifa mostrada
de 37,16 EUR/h: ocho horas requieren 297,28 EUR sin IVA; cobrar 222,96 EUR deja
27,87 EUR por cada hora dedicada. Son supuestos ficticios, no precios de mercado.

`DayRatePlanner.tsx` recibe únicamente los números del ejemplo y empieza vacío.
`lib/dayRate.ts` suma tiempo específico del cliente y compara un precio opcional
con esa referencia. Admite cero explícito en preparación/cierre, valida entradas
y redondea dinero a céntimos. Editar un campo elimina el resultado anterior. No
envía los datos ni genera eventos de conversión, no usa almacenamiento y no
altera la calculadora fiscal. La guía explica cómo evitar duplicar preparación
o tiempos generales; añade un borrador de alcance y enlaza al registro del kit.
La guía por hora enlaza directamente al comprobador y usa JSON-LD nativo para
no arrastrar sus esquemas a la página siguiente durante la navegación.

La página conserva el ejemplo y los datos estructurados en el HTML inicial; solo
el comprobador necesita JavaScript. Se revisan cálculo, entradas inválidas,
teclado, vista móvil y navegación. La prueba previa del kit normaliza los finales
de línea en ambos textos para comparar el mismo recurso en Windows y Linux.

La publicación mantiene anuncios desactivados, captación, piloto y seguimientos
sin cambios; no solicita otra revisión de AdSense.

### Ficha y registro de trabajo (26 de octubre de 2026)

El kit incorpora una ficha de supuestos de tarifa, un registro diario para
copiar durante cuatro semanas y una revisión posterior de las horas previstas.
La página lee el mismo archivo público que se descarga en
`/recursos/kit-tarifa-autonomo.txt`; la vista previa se renderiza sin JavaScript.
La ruta y los enlaces de acceso existentes se conservan. El archivo se edita
fuera del sitio; la página no añade campos ni recoge el contenido de las copias.

`lib/workLogExample.ts` contiene cuatro semanas ficticias y comprueba el paso
de la media semanal a la anualizada con `estimateBillableHours`. No son datos de
usuarios ni una referencia del sector. La guía de horas enlaza a la ficha en el
punto donde propone contrastar la estimación con trabajo registrado.

La publicación de esta mejora no cambia formularios de captación, eventos,
fórmulas, anuncios, piloto o seguimientos ni solicita revisión de AdSense.

### Interpretar facturación y neto (26 de octubre de 2026)

La siguiente mejora sustituye explicaciones genéricas por una resta verificable
con los datos de cada resultado. `BillingBreakdown.tsx` muestra gastos, cuota,
reserva de IRPF y costes no deducibles antes del neto. El IVA se suma aparte;
no se interpreta como neto, cobro o liquidación de impuestos. La explicación es
opcional en el resultado y visible en el ejemplo de la guía de tarifa por hora.

`lib/billingBreakdown.ts` trabaja con las cantidades ya mostradas, en céntimos.
Si sus redondeos no suman exactamente, expone una fila de conciliación; no altera
las fórmulas fiscales ni los importes del motor. La guía usa `calculateExample`
y `getExampleUrl` para que el desglose y los casos de 80 y 40 horas se puedan
reproducir en la calculadora. Las cuotas y porcentajes son supuestos hipotéticos.
La interpretación del IVA enlaza a la documentación de la AEAT.

La publicación de esta mejora no activa anuncios ni solicita una revisión de
AdSense. Las fórmulas, el piloto y los seguimientos se conservan.

### Ayuda para estimar horas (26 de octubre de 2026)

La revisión de páginas detectó que la calculadora partía de 80 h/mes sin ayudar
a obtener ese dato. La guía de 1.500 euros ya tenía una respuesta numérica y
enlaces a sus ejemplos; la mejora priorizada ahora es la calidad de este dato
de entrada, que afecta a todas las tarifas.

`components/BillableHoursPlanner.tsx` añade una ayuda opcional junto al campo de
horas. `lib/billableHoursPlan.ts` resta el trabajo no facturable de la jornada
semanal y las semanas sin actividad de un año de planificación de 52 semanas;
reparte el resultado entre 12 meses y redondea hacia abajo al aplicarlo. Es
capacidad, no una previsión de ventas. Los campos empiezan vacíos y el ejemplo
se identifica como hipotético. Las entradas de la ayuda no se envían con el GET
principal ni generan conversiones; aplicar conserva los otros datos y exige
volver a calcular para renovar el resultado y su enlace compartible.

La guía de horas explica la misma operación y cómo contrastarla con un registro
de trabajo. Las fechas editoriales de portada y guía reflejan este cambio real.
Esta mejora prepara contenido útil para una revisión; no acredita por sí sola
que el sitio completo cumpla los criterios de AdSense ni solicita una revisión.

### Evidencia editorial y titularidad

`lib/site.ts` identifica al responsable real del sitio y alimenta el pie, el aviso
legal y privacidad. No atribuirle experiencia profesional, titulaciones ni una
revisión personal que no se haya confirmado.

La guía de horas facturables sustituye los antiguos rangos sin fuente por tres
agendas hipotéticas. Las 160 horas de partida y cada descuento se muestran en la
tabla; las tarifas parten de 4000 EUR de facturación sin IVA, no de sueldo neto.
`billableHoursEvidence.test.tsx` comprueba que tabla, importes y explicación
corresponden a los mismos datos. La modificación editorial del 17 de octubre de
2026 figura tanto en el artículo como en el sitemap; no debe cambiar por desplegar.

Antes de publicar se comprobaron los ejemplos y la titularidad con pruebas,
compilación y revisión visual en escritorio y móvil. Esa validación no implica
que Google haya indexado la guía o aprobado AdSense.

`npm run dev` abre el servidor de desarrollo en el puerto 3001; `npm run start` sirve en ese mismo puerto una compilación creada con `npm run build`.

1. Ejecutar `npm run lint`, `npm test` y `npm run build`.
2. Probar un cálculo válido y otro con entrada inválida desde `/`.
3. Recorrer navegación, formulario del kit y descarga de `/recursos/kit-tarifa-autonomo.txt`.
4. Comprobar `/sitemap.xml`, `/robots.txt` y `/ads.txt`.

La [cronología de monetización](seguimiento-monetizacion-cuantofacturar.md) es un registro histórico; sus decisiones de campaña no sustituyen una comprobación actual en Google Ads o AdSense.
