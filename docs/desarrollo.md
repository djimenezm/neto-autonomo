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

### Plan anual y meses sin facturación (27 de octubre de 2026)

El resultado incorpora «Planificar los meses
sin facturación». La ayuda parte de la facturación mensual sin IVA publicada
por el cálculo y conserva doce meses del mismo neto y costes. Pide meses
completos con facturación (1–12) y horas facturables por mes activo. Ambos campos
empiezan vacíos, no tienen `name`, no se añaden al GET ni al resumen compartido
y no generan eventos, peticiones ni almacenamiento.

`lib/annualBillingPlan.ts` multiplica la referencia mensual en céntimos por 12
y la reparte entre los meses activos. Redondea al alza el importe de cada mes y
la referencia por hora para no quedar corto al céntimo. Muestra el pequeño
exceso anual del redondeo. Las horas anuales se calculan desde los meses activos
y sus horas reales; no se recortan otra vez las horas del formulario principal.
Una edición retira el plan y un cambio de referencia reinicia los campos.

La guía de 1500 EUR conserva sus dos casos iniciales y añade tres calendarios
del caso ligero (150 EUR de gastos, cuota manual 320 EUR y reserva manual 15 %).
La referencia de 2234,71 EUR/mes supone 26816,52 EUR/año. Con diez meses activos
se necesitan 2681,66 EUR por mes: con 70 h por mes son 700 h/año y 38,31 EUR/h;
con 84 h son 840 h/año y 31,93 EUR/h, igual que doce meses de 70 h con este
redondeo al alza. La diferencia de un céntimo frente al redondeo habitual del
resultado mensual se explica. Los ejemplos se derivan del mismo motor existente.

El modelo no es un calendario de cobros ni una reserva de caja y no recalcula
impuestos o cuotas que cambien durante el año. Se explicita el supuesto de
costes constantes incluso sin facturación. Se enlaza a la agenda anual para
evitar descontar vacaciones dos veces, y a la guía educativa de presupuestos de
Finanzas para Todos. La tabla y las cuatro FAQ quedan en el HTML inicial con
JSON-LD nativo; se conserva exactamente el formulario de captación existente.

Validación: 347 pruebas en 54 archivos, lint y compilación correctos. Se cubren
meses inválidos, horas por mes activo, redondeos, importes inseguros, conservación
de horas anuales, reinicio y resumen/eventos intactos. Revisado en navegador y
móvil. La publicación mantiene los anuncios desactivados, el piloto y los
seguimientos intactos, sin solicitar revisión de AdSense.

### Base, IVA, retención e importe a cobrar (27 de octubre de 2026)

Dentro de «Ver cómo se reparte la facturación»
se añade «Comprobar el cobro si hay retención». Usa la base sin IVA y el IVA del
resultado, sin recalcular ni sustituir sus importes. El porcentaje empieza vacío,
es independiente de la reserva de IRPF y no tiene `name`; no entra en el GET ni
en el resumen compartido. No crea eventos, peticiones ni almacenamiento.

`lib/withholdingPreview.ts` calcula base + IVA − retención aplicada sobre la
base sin IVA. Opera con céntimos y centésimas de porcentaje, comprueba enteros
seguros y acepta el supuesto sin retención. Redondea y muestra el porcentaje
utilizado. Una edición retira el resultado; cambiar la base o el IVA principal
reinicia también el campo. El botón del 15 % se identifica como caso ficticio,
sin determinar sujeción ni tipo legal aplicable.

La referencia principal es mensual: se explicita el supuesto de una misma
retención sobre toda esa base, sin mezclar clientes con tipos distintos. No
recalcula el neto, no descuenta otra vez la reserva de IRPF y no liquida impuestos
ni acredita la emisión o el cobro de una factura.

La guía por hora añade una cuenta completa con 1000 EUR de base y 210 EUR de IVA:
sin retención, 1210 EUR a cobrar; con el 15 % ficticio, 150 EUR retenidos y
1060 EUR a cobrar. Incluye tabla y FAQ en el HTML inicial y una ayuda interactiva
con la misma base. Se enlaza la [explicación de la AEAT sobre retenciones y pagos a cuenta](https://sede.agenciatributaria.gob.es/Sede/irpf/retenciones-ingresos-cuenta-pagos-fraccionados/retenciones-ingresos-cuenta.html).
La guía general aclara facturación, cobro y neto, y enlaza al ejemplo; conserva
su ruta sin JavaScript de cliente. Se mantienen la captación y las fechas de
las demás guías. No se cambian las reglas de cuota, IVA ni estimación de IRPF.

Validación: 319 pruebas en 51 archivos, lint y compilación correctos. Se cubren
retención cero, referencia sin IVA, redondeos de medio céntimo, porcentajes
inválidos, importes inseguros, reinicio y conservación del resumen y eventos.
Se revisa el flujo en navegador, con y sin IVA y en móvil. La publicación mantiene
los anuncios desactivados, el piloto y los seguimientos intactos, sin solicitar
revisión de AdSense.

### Cuota reducida con MEI y prórroga anual (27 de octubre de 2026)

Se corrigen dos referencias que podían sesgar
la decisión de precio: la cuota reducida usada era 80 EUR sin MEI y el aviso de
prórroga comparaba rendimientos mensuales con 1221 EUR. Ahora se usa el total de
88,64 EUR publicado por Importass y se comparan los rendimientos estimados
anuales con los 17094 EUR de SMI anual de 2026, con límite estrictamente inferior.
El anual se obtiene antes del redondeo mensual para no acumular céntimos.

Fuentes verificadas: [Importass, guía de trabajo autónomo](https://portal.seg-social.gob.es/wps/portal/importass/importass/Colectivos/trabajo%2Bautonomo/guia),
[artículo 38 ter de la Ley 20/2007](https://www.boe.es/buscar/act.php?id=BOE-A-2007-13409#a3-5)
y [Real Decreto 126/2026](https://www.boe.es/eli/es/rd/2026/02/18/126).
Se toma el total publicado de 88,64 EUR como referencia explícita. No se deriva
un desglose de MEI desde la base de 950,98 EUR: esa operación daría 88,56 EUR,
distinto del total publicado por Importass. La interfaz identifica la fuente y
remite a la cuota manual si el recibo completo difiere; no se altera ese importe
manual ni la cuota ordinaria por tramos.

El aviso de prórroga aparece antes de la cuadrícula del resultado. Expone ambos
importes en EUR/año y no acredita el derecho a la reducción. Un caso que no
cumple el límite mantiene explícito el supuesto reducido seleccionado y enlaza
al mismo cálculo con cuota automática ordinaria. La comprobación anualiza doce
meses iguales; si el periodo abarca dos años, hay que revisar cada ejercicio.
No comprueba altas, requisitos personales, fechas, solicitudes ni rendimientos
reales. La guía y sus cinco FAQ se incluyen en el HTML inicial con las fuentes.

Los casos ficticios de 1200 y 1400 EUR netos usan gastos de 200 EUR, 80 h/mes y
reserva manual del 15 %. Producen 15755,29 y 18381,18 EUR/año de rendimientos
estimados, respectivamente. Sus enlaces abren el modo reducido y la prórroga
exactos. El resumen compartido recibe el nuevo importe desde el mismo motor;
su construcción, enlaces de seguimiento y eventos permanecen intactos.

Validación: 295 pruebas en 48 archivos, lint y compilación correctos. Se cubren
el límite anual al céntimo, la igualdad, la cuota con MEI, el recibo manual,
los ejemplos, el aviso inicial y el enlace a cuota ordinaria. Se revisa el flujo
en navegador y móvil. La publicación mantiene los anuncios desactivados, el
piloto y los seguimientos intactos, sin solicitar revisión de AdSense.

### Comparar cambios en gastos y horas (27 de octubre de 2026)

El resultado ofrece «Comparar cambios en mis
gastos y horas» con dos campos vacíos: total alternativo de gastos deducibles y
horas facturables mensuales. Conserva el neto, costes no deducibles, comunidad,
IVA y criterios de cuota e IRPF del cálculo de partida. `lib/monthlyScenarios.ts`
reutiliza el motor existente, sin modificar sus reglas fiscales.

La comparación muestra ambas facturaciones y tarifas, con la diferencia en EUR
al mes y por hora. El enlace a la alternativa usa la misma construcción de URL
que la calculadora y los importes redondeados que se muestran. Cambiar un campo
retira la comparación y su enlace; un nuevo cálculo principal reinicia la ayuda.
Los campos no tienen `name`, no se incorporan al GET principal ni al resumen
compartido, no generan eventos y solo se guardan en el estado de React.

La tabla de objetivos añade cuatro escenarios de 2000 EUR netos: partida,
menos horas, más gastos y ambos cambios. Con 300 EUR de gastos, cuota manual de
320 EUR y reserva manual del 15 %, se necesitan 2972,94 EUR sin IVA: 37,16 EUR/h
con 80 h y 49,55 EUR/h con 60 h. Subir los gastos a 450 EUR y bajar a 60 h lleva
a 3122,94 EUR y 52,05 EUR/h. Son supuestos ficticios. La tabla y las FAQ se
renderizan en el HTML inicial; se conservan las anclas de los cuatro objetivos
y la captación. Se enlaza a la AEAT para comprobar la deducibilidad de gastos.

Validación: 281 pruebas en 47 archivos, lint y compilación correctos. Se cubren
entradas inválidas, decimales, escenarios con menos costes, modos fiscales,
enlace reproducible, reinicio y conservación del resultado compartido. Revisión
de navegador en la tabla y el resultado, incluido móvil de 390 y 320 píxeles.
La publicación mantiene los anuncios desactivados, el piloto y los seguimientos
intactos, sin solicitar revisión de AdSense.

### Encargos necesarios y capacidad mensual (27 de octubre de 2026)

El resultado principal incorpora una ayuda
opcional para comparar el precio y tiempo de un encargo repetible con la
facturación mensual y las horas del propio cálculo. Los dos campos empiezan
vacíos y no se añaden al GET ni al resumen compartido. La ayuda no altera el
resultado fiscal ni genera eventos ni guarda datos fuera del estado de React.

`lib/projectCapacity.ts` redondea importes a céntimos y tiempos a centésimas de
hora. Redondea hacia arriba el número de encargos completos necesarios para la
facturación y hacia abajo los que caben por horas. Muestra ambas cuentas, su
diferencia y la facturación de la capacidad disponible. Cambiar un campo borra
el plan anterior; una referencia mensual nueva se refleja al comprobar la ayuda.

La guía de 3000 EUR usa el motor existente y el mismo ejemplo: 4149,41 EUR sin
IVA y 80 h/mes; dos encargos ficticios de 2100 EUR y 40 h requieren 80 h y suman
4200 EUR. Con 60 h por encargo, los dos exigen 120 h; solo cabe uno y faltan
2049,41 EUR de facturación. La guía y sus datos estructurados se renderizan en
el HTML inicial y enlazan al escenario exacto de la calculadora, al registro y
a la ayuda de jornada. El formulario de captación se conserva.

Los ejemplos suponen encargos iguales, completos y facturados en el mismo mes;
no acreditan ventas, cobros o disponibilidad en fechas concretas ni calculan
un nuevo neto. El exceso sobre la facturación objetivo no se presenta como
beneficio. Se comprueban límites de capacidad, decimales, entradas inválidas,
integración con el resultado y lectura móvil. La publicación mantiene los anuncios
desactivados, el piloto y los seguimientos intactos, sin solicitar revisión de AdSense.

### Coherencia entre resultado y enlace compartido (27 de octubre de 2026)

Se reprodujo un caso en que, tras calcular
2000 EUR netos y editar el objetivo a 2500 EUR, el resumen mostraba el objetivo
nuevo pero su enlace seguía abriendo el cálculo de 2000 EUR.

`getCalculationKey` compara los valores activos del formulario con los del
último cálculo válido. Al editar un dato relevante se retiran el resultado y
sus opciones de compartir/copiar hasta recalcular; se muestra un aviso de cambios
pendientes. Un formato numérico equivalente conserva el resultado. Si se vuelve
a los valores ya calculados, el resultado se recupera sin mover el foco del campo.
Las entradas de la ayuda de agenda solo afectan al resultado al aplicarlas.

Al enviar, los campos y el enlace adoptan los mismos valores normalizados. Esto
también cubre Enter sin salir del campo, cuando un porcentaje o importe debe
redondearse. Los enlaces GET siguen reproduciendo los cálculos en el servidor;
las calculadoras embebidas conservan su dirección y renuevan un enlace existente
si lo tenían. La comparación vive en memoria y no crea eventos ni almacenamiento.

Se comprueban ediciones numéricas, modos, IVA, pegado, Enter, errores de entrada,
reversión de cambios y foco, reproducción del enlace y presentación móvil. El
motor fiscal y los bloques de seguimiento se conservan. La publicación mantiene
los anuncios desactivados, el piloto y los seguimientos intactos y no solicita
otra revisión de AdSense. No se cambian fechas editoriales por esta reparación.

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
