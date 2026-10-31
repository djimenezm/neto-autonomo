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

### Aclarar los supuestos al trasladar costes (31 de octubre de 2026)

Publicación autorizada el 31 de octubre de 2026: aclaración del traslado de
costes y guía actualizada, con anuncios, piloto y seguimientos intactos.
El traslado de costes abre un cálculo nuevo: envía
gastos deducibles/no deducibles, cuota manual y horas, pero no recupera el neto,
IRPF o IVA de otro escenario. La nota de llegada pedía revisar únicamente el
neto, lo que podía hacer pensar que se estaban actualizando los costes del
escenario anterior.

El aviso previo al traslado identifica sus valores iniciales: 1500 EUR netos,
IRPF progresivo para territorio común e IVA simulado al 21 %. Sus cantidades
y criterios se leen de `DEFAULT_FORM_VALUES`; el botón lo incluye en su
descripción accesible. Al llegar se pide revisar neto, criterio y comunidad
de IRPF e IVA, junto con los costes y la cuota recibidos. La guía explica el
mismo recorrido. El resultado sigue esperando un envío manual válido.

Es una aclaración de interfaz: no se cambia el GET, los valores iniciales,
las fórmulas, el almacenamiento o los eventos. Anuncios, captación, piloto,
configuración y seguimientos permanecen intactos.

Validación: 50 pruebas existentes del formulario, traslado y guía, lint y
compilación correctos. En navegador local se revisa el aviso previo y su
descripción accesible, se hace el traslado GET y se confirman los valores de
llegada: neto 1500, IRPF progresivo, territorio común, IVA simulado activado y
cuota manual de 320 EUR. La nota pide revisar esos supuestos y todavía no hay
resultado calculado. Sin errores en la consola revisada.

### Preparar costes sin conocer todavía las horas (31 de octubre de 2026)

Publicación autorizada el 31 de octubre de 2026: preparación de costes sin
conocer todavía las horas y guía actualizada, con anuncios, piloto y
seguimientos intactos. En la ayuda de costes, borrar las 80 horas para
escribir otra cifra ocultaba también una media válida de 480 EUR/mes, los
5760 EUR/año, el desglose y el reparto deducible. Al volver a indicar horas,
el desglose reaparecía cerrado. Los pagos y el reparto seguían en memoria,
pero no se podían consultar ni preparar mientras faltaran las horas.

`MonthlyCostCalculator.tsx` valida los costes por separado. La suma mensual,
la anual, el desglose abierto y el reparto deducible permanecen disponibles
con horas vacías o inválidas; cambiar un pago actualiza esos totales. Solo
el coste por hora necesita horas positivas. El traslado sigue requiriendo
horas enteras mayores que cero, cuota positiva y un reparto válido.

Las horas vacías no son un error para sumar costes. Si se intenta trasladar
sin completarlas, o se indica un dato inválido, el error queda asociado al
campo de horas. El intento de traslado lo enfoca e impide el GET. Los importes
inválidos siguen retirando los totales; no se muestran costes anteriores.
La guía explica las mismas reglas sin modificar fechas editoriales.

No se cambian fórmulas, eventos, almacenamiento, captación, anuncios, piloto,
configuración o seguimientos.

Validación: 739 pruebas en 77 archivos, lint y compilación correctos. Se
reprodujeron seis fallos antes del arreglo. Las regresiones cubren horas
vacías, cero, negativas, malformadas y fraccionarias; conservación del
desglose/reparto, actualización de pagos y bloqueo del traslado. En navegador
se mantienen los 480 EUR/mes y 5760 EUR/año al vaciar horas; cambiar software
a 65 EUR/mes actualiza la suma a 510 EUR y 6120 EUR/año. El traslado incompleto
no navega y enfoca horas; al indicar 60, reaparecen 8,50 EUR/h y una vista
previa de 100 EUR deducibles, 90 EUR no deducibles y 320 EUR de cuota.
El desglose sigue abierto y la consola revisada no muestra errores.

### Recuperar el plan previo al ejemplo de caja (31 de octubre de 2026)

Publicación autorizada el 31 de octubre de 2026: recuperación del plan de caja
tras probar el ejemplo y guía actualizada, con anuncios, piloto y seguimientos
intactos. «Probar las fechas ficticias» sustituía el saldo y
todos los movimientos propios sin ofrecer recuperación. Un borrador incompleto
podía contener hasta veinte filas y todavía no era exportable. El caso se
reprodujo con un saldo de 123,456 EUR, una salida de 80,125 EUR y una segunda
fila sin fecha antes de cargar el ejemplo.

`CashDatePlanner.tsx` conserva en memoria los valores anteriores al primer
ejemplo, con textos, orden de filas y marca ficticia originales. Repetir el
ejemplo o editarlo no sobrescribe esa copia. «Recuperar mi plan anterior»
restaura incluso entradas incompletas, retira el resultado y exige comprobar
los vencimientos otra vez. También cancela una lectura pendiente de archivo,
limpia su aviso y devuelve el foco al saldo inicial. Los identificadores de
filas no se reutilizan al añadir movimientos después de recuperar.

El aviso indica que recuperar sustituye los cambios posteriores. La copia se
consume al recuperar y se pierde al salir o recargar; el archivo sigue siendo
la forma de conservar un plan comprobado para otro día. La guía de costes
explica estas reglas sin cambiar fechas editoriales, tipos ni fórmulas.

No se añaden eventos, almacenamiento persistente ni envío de datos. Motor,
anuncios, captación, piloto, configuración y seguimientos permanecen intactos.

Validación: 732 pruebas en 77 archivos, lint y compilación correctos. Las seis
regresiones nuevas fallaban antes del arreglo y pasan con él; cubren textos y
filas incompletas, repeticiones, ediciones, lectura de archivo pendiente y la
marca ficticia original. En navegador se verifica recuperar cuatro filas,
mantener saldo e importes sin normalizar, conservar la fecha introducida por
teclado y devolver el foco al saldo. El resultado queda vacío y pide una nueva
comprobación; la consola revisada no muestra errores.

### Conservar las ayudas durante una corrección (31 de octubre de 2026)

Publicación autorizada el 31 de octubre de 2026: protección de borradores de
las ayudas, sin activar anuncios ni tocar el piloto o los seguimientos.
Al editar un dato principal, se desmontaba el resultado
y se perdían los datos de sus ayudas, incluidos los grupos de servicios. Volver
al mismo neto u horas restauraba el resultado, pero dejaba las ayudas vacías y
cerradas. El caso se reprodujo en el navegador con dos grupos y el cambio
temporal de 2000 a 2500 EUR y vuelta a 2000 EUR.

`CalculatorForm.tsx` conserva los valores del último cálculo confirmado. El
resultado recibe siempre esa referencia, y una frontera `Activity` mantiene
sus borradores y desplegables mientras permanece oculto por cambios pendientes
o errores. Volver a valores equivalentes o enviarlos de nuevo recupera las
ayudas; no vuelve a aparecer ningún resultado ni enlace accesible mientras
los datos estén pendientes de calcular. Confirmar un escenario distinto
reinicia las ayudas, como antes. La nota del formulario explica ambas reglas.

Los datos permanecen solo en memoria de la página: no se añaden al GET, al
enlace compartido, al almacenamiento o a eventos. El motor fiscal, anuncios,
captación, piloto y seguimientos conservan su estado. No se cambia ninguna
fecha editorial por esta reparación.

Validación: suite completa correcta (725 pruebas) y seis regresiones específicas
correctas, incluida la añadida después para el primer envío del usuario. Lint,
revisión independiente y compilación correctos. En el navegador local se
comprueban dos grupos manuales, la ocultación del resultado y los enlaces al
editar, y la recuperación de grupos, plan y desplegables al restaurar tanto un
valor válido como un campo vacío. El foco y la URL se conservan; sin errores
en la consola revisada.

### Costes y horas coherentes al trasladarlos a la tarifa (31 de octubre de 2026)

Publicación autorizada el 31 de octubre de 2026: traslado de costes y horas,
redondeo, vista previa y guía actualizada, con anuncios, piloto y seguimientos
intactos. La ayuda de costes validaba
horas como `80,00`, pero enviaba el texto original al campo numérico principal,
donde podía aparecer vacío. Ahora el GET lleva la representación numérica
canónica de las horas ya validadas, manteniendo los demás datos del traslado.

`roundCostToCents` en `lib/recurringCosts.ts` redondea mediante notación decimal
antes de obtener los céntimos enteros. Se usa para cada pago, la cuota y el
importe deducible. Un pago de 128,075 EUR pasa a 128,08 EUR: repetido doce veces
suma 1536,96 EUR al año. Se conserva sumar los pagos anuales antes de obtener
la media mensual y se siguen rechazando importes negativos o inseguros.

El resto no deducible se obtiene restando los céntimos del reparto. Si el
deducible redondeado supera los costes disponibles, se pide corregirlo.
La ayuda muestra gastos deducibles, costes no deducibles, cuota separada y
horas que se van a trasladar cuando el reparto es válido. El texto explica
el redondeo por pago y la guía añade un ejemplo aritmético ficticio; su fecha
visible, datos estructurados y entrada del sitemap pasan al 31 de octubre.

Validación: 720 pruebas en 75 archivos, lint y compilación correctos. Las
nueve regresiones nuevas fallaban antes del arreglo. Se cubren las tres
frecuencias, cuota, límites del reparto y el paso por formulario GET,
lectura del servidor y calculadora de tarifa. En navegador local se verifican
el pago normalizado de 128,08 EUR, sus 1536,96 EUR anuales y el traslado de
128,08 EUR deducibles, 125 EUR no deducibles, 320 EUR de cuota y 80 horas.
La tarifa y su enlace conservan los datos; no aparecen errores en la consola
revisada. Anuncios, piloto, seguimiento y motor fiscal mantienen su estado.

### Importes malformados y pegado de varias celdas (31 de octubre de 2026)

Publicación autorizada el 31 de octubre de 2026: protección contra importes
malformados y pegados de varias celdas, con anuncios, piloto y seguimientos
intactos. El lector de números podía
convertir `1,,50` en 1,50 o `12.34,56` en 1234,56. También eliminaba los
separadores de celdas: dos números copiados con un salto de línea o una
tabulación podían convertirse en un único importe distinto.

`lib/spanishNumber.ts` valida la estructura antes de retirar los separadores
de miles. Conserva formatos como `1.234,56`, `1,234.56`, `2 500`, espacios
estrechos, signos y una unidad en los extremos. Comas repetidas, agrupaciones
incompletas, unidades interiores y separadores internos de celdas producen
un dato inválido. Los blancos exteriores habituales del portapapeles siguen
admitidos. Se conserva la distinción de `1.005` como miles y `1,005` como
decimal en la notación española; el estado nativo de la calculadora principal
sigue usando su lectura separada con punto decimal.

`NumericTextInput` protege las ayudas antes de que el navegador elimine
saltos de línea de un campo de una sola línea. Un pegado multicelda muestra
marcadores visibles como `↵` y `⇥`, de modo que la validación lo rechaza y
pide corregirlo. Los pegados ordinarios conservan la selección y la posición
del cursor. Fechas, archivos, campos ocultos y selectores mantienen sus
controles anteriores.

En la calculadora principal, un pegado inválido vacía el campo numérico y
muestra un error asociado a ese campo inmediatamente. Así no queda el
importe anterior como si se hubiese aceptado el nuevo. El resultado y sus
acciones de compartir se retiran hasta corregir el dato y calcular otra vez.
La corrección se puede escribir o pegar, sin cambiar los modos fiscales.

Validación: 711 pruebas en 75 archivos, lint sin avisos y compilación correctos.
Las regresiones cubren los 22 formatos malformados antes aceptados, lectura
de formatos válidos, pegado anterior a blur/Enter, retirada del resultado y
recuperación después de corregir. En navegador se comprueban el error
inmediato de la calculadora, la retirada de resultado y enlaces, el marcador
de dos celdas en factura y la recuperación con `1.234,56`; sin errores en la
consola revisada. Anuncios, captación, piloto, motor fiscal, configuración y
seguimientos conservan su estado. La publicación autorizada incluye esta
protección en la calculadora y sus ayudas.

### Horas completas de una agenda con decimales (30 de octubre de 2026)

Publicación autorizada el 30 de octubre de 2026: corrección de las horas
de agenda y aclaración del redondeo, con anuncios, piloto y seguimientos
intactos. La ayuda de agenda podía
mostrar 42 h/mes pero proponer aplicar 41: las operaciones binarias dejaban
la media en `41.99999999999999` antes de descartar la fracción. También se
reproducían pérdidas de una hora con medias exactas de 84 y 123 horas.

`lib/billableHoursPlan.ts` opera con enteros de escala decimal a partir de
la representación de los números recibidos. La comparación entre jornada
y horas no facturables y la división que decide las horas completas son
exactas. Las cantidades de salida siguen siendo números serializables;
los enteros BigInt permanecen dentro del cálculo. Se conserva la precisión
admitida por las entradas y la regla de descartar fracciones al aplicar
capacidad. Una media realmente inferior a 42 sigue aplicando 41.

La ayuda aclara que la media visible está redondeada a un decimal y que
se usa la cuenta completa para obtener las horas que se aplican.
Con 4 días de 4 horas, 4,8 horas no facturables por semana y 7 semanas sin
actividad, la cuenta es 45 × 11,2 = 504 h/año; entre 12, son 42 h/mes.
La comparación exacta también acepta una agenda cuya jornada se dedica
por completo a trabajo no facturable: 3 × 0,3 − 0,9 deja capacidad cero.

Validación técnica: 647 pruebas en 74 archivos, lint y compilación correctos.
Las regresiones reproducían ocho fallos antes del arreglo y comprueban
límites a ambos lados de un entero, exponentes, capacidad cero y el recorrido
desde agenda decimal hasta horas aplicadas, tarifa y enlace compartido.
En navegador local se comprueban las 42 horas propuestas y aplicadas,
la actualización explícita de la tarifa y la conservación de cifras al
recargar el enlace; sin errores en la consola revisada.
Anuncios, captación, piloto, configuración y seguimientos conservan su estado.

### Entrada de importes y supuesto de IVA (30 de octubre de 2026)

Publicación autorizada el 30 de octubre de 2026: corrección del pegado y
aclaración del IVA al 21 %, con anuncios, piloto y seguimientos intactos.
El pegado de `15,005 €`
podía terminar como `15005`: tras interpretar la coma decimal se volvía a
interpretar el punto de `15.005` como separador de miles. `parseFormNumber`
lee el estado de los campos numéricos y las URL con punto decimal. El
portapapeles conserva su lectura española, incluidos `1.005` como mil cinco
y `1.005,50 €` como mil cinco con cincuenta. Se mantienen los negativos y
las horas fraccionarias visibles para corregirlos, también después de perder
el foco. La validación, el cálculo y la comparación de resultados usan la
misma interpretación del estado.

El formulario declara que solo simula IVA al 21 % o sin IVA. El resultado y
el resumen compartible identifican ese supuesto y lo separan del neto. No
cambian los tipos ni las reglas del motor fiscal.

Validación: 634 pruebas en 74 archivos, lint y compilación correctos.
Las nuevas regresiones reproducían seis fallos antes del arreglo y cubren
los seis campos numéricos, los datos inválidos y la coincidencia entre
importe pegado, resultado y URL. En el navegador local se verifican pegado,
pérdida de foco, cálculo, recuperación al recargar y bloqueo de horas
fraccionarias, sin errores en la consola revisada. Se revisa también la
presentación de la ayuda de IVA y del resultado. Anuncios, captación,
piloto, configuración y seguimientos conservan su estado.

### Guion de prueba con autónomos

Preparado para 3–5 participantes, con sesiones manuales de unos 20 minutos.
Todavía no se han realizado sesiones ni hay resultados de usuarios reales.
Las pruebas técnicas y los ejemplos ficticios no sustituyen esta validación.
Conviene incluir personas que presupuesten por horas y por encargo, con
experiencia distinta y al menos una sesión desde móvil.

Tras explicar el propósito y obtener su consentimiento, pedir que piensen
en voz alta. Usar datos aproximados o anonimizados de su actividad, sin
copiar facturas, identificadores ni información de clientes. Antes de guardar
un enlace, comprobar que sus importes pueden conservarse en la URL.

| Tarea que se plantea al participante | Qué observar sin anticipar la respuesta |
| --- | --- |
| Desde la portada, obtener una referencia para un mes de trabajo propio. | Si sustituye los valores iniciales; qué entiende por horas facturables, facturación sin IVA, reserva de IRPF y neto; qué tipo de IVA cree que usa la herramienta. |
| Revisar un encargo, jornada o factura que haya tenido y elegir una ayuda desde el menú. | Si encuentra una ayuda adecuada sin indicarle su nombre; dónde se atasca; qué decisión tomaría y qué necesita contrastar fuera de la herramienta. |
| Guardar su escenario y abrirlo de nuevo, sin enviarlo a otra persona. | Si puede recuperar los datos y explicar qué representan las cifras; si comprende qué contiene el enlace y descubre discrepancias. |

Por tarea, anotar tiempo aproximado, resultado sin ayuda/con ayuda/no
completado, intervención necesaria y una frase anónima que explique la duda.
Registrar con códigos P01–P05 y dispositivo, sin nombres ni importes propios.
Preguntar al final qué cambiaría su próxima decisión de precio; evitar pedir
solo una valoración general de si le gusta la web.

Una confusión que cambie una decisión de precio o haga tomar IVA por neto
se prioriza antes de ampliar funciones. Si el mismo obstáculo aparece en
dos participantes, preparar un cambio pequeño y repetir la tarea. Con este
tamaño de muestra se describen observaciones, no porcentajes de conversión.
La convocatoria y las sesiones siguen pendientes; este guion no crea envíos,
formularios ni seguimiento automático.

### Comprobar una factura con datos propios (28 de octubre de 2026)

La ayuda de factura de la guía por hora solo dejaba variar la retención sobre
una base y un IVA fijos. `InvoiceCheck.tsx` sustituye ese editor de la guía por
tres campos vacíos: base sin IVA, porcentaje de IVA y porcentaje de retención.
El selector enlaza directamente a `#comprobar-factura` y describe los tres datos
editables. Se conservan la tabla ficticia, `#ejemplo-cobro` y `#comprobar-cobro`.
La ayuda mensual del resultado sigue usando su base e IVA, sin modificaciones.

`lib/invoiceCheck.ts` normaliza la base y ambos porcentajes a dos decimales,
calcula el IVA en céntimos y reutiliza `previewWithholding` para la retención y
el cobro. Ambos importes se calculan sobre la misma base normalizada y se
redondean por separado antes de sumar y restar. Se valida base positiva,
porcentajes entre cero y cien y una escala entera segura, también con tipos cero.
No se toman porcentajes de la reserva fiscal ni se eligen tipos aplicables.

El ejemplo del botón usa base 1000 EUR, IVA ficticio del 21 % y retención
ficticia del 15 %: 1000 + 210 − 150 = 1060 EUR a cobrar. La guía incluye otro
caso derivado del mismo modelo: 2000 EUR, 10 % y 7 % producen 2060 EUR.
Son supuestos aritméticos, no recomendaciones fiscales. Se explica el método,
la diferencia entre cobro y neto y el alcance de una sola base compartida por
ambos porcentajes. La explicación enlaza a la AEAT sobre IVA repercutido y
retenciones. No emite documentos ni incorpora pagos parciales, suplidos,
varias bases o tipos, fiscalidad definitiva o una liquidación de IVA.

Validación: 621 pruebas en 74 archivos, lint y compilación correctos. Se cubren
ceros explícitos, retención del 100 %, medias de céntimo, precisión extrema,
normalización estable, errores con foco y Enter, retirada del resultado al
editar y ausencia de eventos. Los ejemplos y ocho FAQ coinciden con el HTML
y JSON-LD. La fecha editorial sigue siendo el 28, día de este cambio real.
En navegador se comprueban acceso desde el selector, campos vacíos, error,
ejemplo, otro supuesto, ceros y decimales españoles. Escritorio y 390/320 px
sin desbordamiento de página; no hay errores en la consola revisada.

La publicación autorizada incluye el comprobador, la guía y su acceso desde
el selector. No se activan anuncios, no se toca el piloto o los seguimientos
y no se solicita otra revisión de AdSense. Los campos no tienen
`name` ni formulario, no se envían, no se guardan ni se añaden al resumen o
enlace principal. El modelo y el componente de retención mensual no cambian.

### Elegir una ayuda según la decisión (28 de octubre de 2026)

Tras incorporar las ayudas de tarifa, encargos, factura y caja, el siguiente
problema es encontrarlas. La guía general añade `#elegir-herramienta`, un
selector con ocho dudas agrupadas en cuatro etapas. Cada tarjeta indica qué
datos preparar, qué permite comprobar y el límite que afecta a esa decisión.
Los atajos por etapa y los enlaces a herramientas son anclas y enlaces HTML
normales; no hay selección mediante JavaScript, formulario ni datos que enviar.

`lib/toolChooser.ts` concentra el contenido tipado. `ToolChooser.tsx` lo
presenta con títulos h2/h3/h4 y tarjetas de dos columnas al caber, una en móvil.
Los enlaces están subrayados, tienen foco visible y un mínimo táctil de 44 px.
Se accede desde el menú «Herramientas», la introducción de la guía y la portada
junto a la explicación del método. La calculadora conserva su acción principal.
No se crea otra ruta: la guía existente amplía su contenido, FAQ y metadatos,
con fecha editorial real del 28 de octubre y el mismo cambio en el sitemap.

Se diferencian las ayudas que admiten datos propios de las referencias ficticias
de 1500 y 3000 EUR netos de sus guías. En esos casos se explica cómo llegar a la
ayuda dentro del resultado personal. El ejemplo de factura mantiene base e IVA
ficticios y solo deja variar la retención; se describe así antes de abrirlo.
El selector aclara que sus enlaces no trasladan los datos del cálculo. No cambia
la función existente que permite aplicar los costes al formulario principal.

Validación previa a la publicación: 591 pruebas en 71 archivos, lint y compilación correctos.
Las pruebas comprueban cada ancla contra el HTML de su página real, IDs únicos,
FAQ visible igual al JSON-LD y accesos desde portada, menú e introducción.
La guía mantiene `unstable_runtimeJS: false`. Se revisa el recorrido hasta
rebajas y caja, navegación por teclado y presentación de 390 y 320 px.
Los motores, formularios, resumen compartido, publicidad y seguimiento no
cambian. La publicación autorizada incluye el selector, la guía y sus accesos
desde menú y portada. No se toca el piloto o los seguimientos automáticos,
ni se solicita otra revisión de AdSense.

### Rebaja de tarifa y capacidad mensual (28 de octubre de 2026)

La guía por hora incorpora un comprobador para negociar una rebaja manteniendo
el mismo servicio y alcance. Muestra nueva tarifa, facturación con las mismas
horas, pérdida de facturación, horas necesarias para recuperar el valor inicial
y holgura o falta de capacidad. Se accede desde la ayuda existente de encargos
del resultado y desde la cabecera de la guía, sin añadir otro desplegable al
resultado principal. La tabla y el método están disponibles en el HTML inicial;
la nueva FAQ coincide con JSON-LD y la fecha editorial de guía y sitemap es el 28.

`lib/rateDiscount.ts` trabaja con céntimos, centésimas de porcentaje y centésimas
de hora, comprobando operaciones enteras seguras. Redondea primero el precio
negociado a céntimos y usa ese precio en todas las cuentas. Las horas de
recuperación se redondean al alza para cubrir tarifa original × tiempo antes
del redondeo de factura. Esto evita que una tarifa sin rebaja parezca requerir
menos horas en los importes pequeños. Una tarifa que redondee a cero no produce
horas infinitas: informa de que no se puede recuperar el importe a esa tarifa.

El ejemplo es ficticio: 40 EUR/h × 80 h = 3200 EUR sin IVA. Con un 10 % de
rebaja se cobran 36 EUR/h y se facturan 2880 EUR por las mismas horas: 320 EUR
menos. Recuperar el valor requiere 88,89 h (3200,04 EUR), 8,89 h adicionales.
Con 80 h de capacidad faltan 8,89 h; con 100 h quedan 11,11 h. La capacidad
incluye las horas de partida y descuenta gestión, preparación no facturada,
descansos y otros servicios; no representa horas libres adicionales ni ventas.

Los cuatro campos empiezan vacíos, admiten decimales españoles y no tienen
`name`, formulario, almacenamiento, eventos de medición ni peticiones. Editar
borra el resultado anterior; el botón ficticio identifica sus supuestos.
La comparación no estima neto, costes adicionales, impuestos ni cobros; enlaza
a la ayuda de neto existente para interpretar otra facturación. No altera el
resultado principal, sus fórmulas ni el enlace compartido.

Validación previa a la publicación: 588 pruebas en 70 archivos, lint y compilación de producción;
flujo real desde el resultado, errores y foco, recálculo con Enter, ejemplo,
capacidad suficiente y tarifa cero. Se revisa en escritorio y móvil de 390 y
320 px. La publicación de esta mejora no activa anuncios. El piloto y los
seguimientos no se modifican y no se solicita revisión de AdSense.

### Guardar y recuperar un plan de caja (28 de octubre de 2026)

El comprobador por fechas permite introducir veinte movimientos, pero el estado
se perdía al salir de la página. Se añade «Guardar este plan en un archivo»
cuando existe un resultado válido y «Abrir un plan guardado» junto al inicio
del editor. No se guarda automáticamente, no hay cuenta, almacenamiento del
navegador ni peticiones con el contenido del plan. La guía de costes explica
el proceso en `#guardar-plan-caja`, mantiene la fecha del cambio real del día 28
y añade una séptima FAQ igual en el texto visible y en JSON-LD.

`lib/cashDatesFile.ts` exporta solo entradas normalizadas: saldo inicial,
movimientos en el orden introducido y marca de ejemplo ficticio. El archivo
`plan-caja-fechas.json` identifica formato, versión 1 y el supuesto de pagos
antes de cobros de la misma fecha. No almacena saldos calculados. Al abrir,
comprueba tamaño UTF-8 (máximo 64 KB), formato, versión, tipos, número de filas,
fechas e importes mediante el modelo existente. Copia únicamente los campos
esperados, ignora resultados guardados o campos ajenos y calcula otra vez con
las entradas válidas. Se conserva la marca de ejemplo y no se cambia el motor
de vencimientos, los redondeos ni su regla para fechas coincidentes.

`CashDatePlanner.tsx` lee el archivo con FileReader en el navegador. Solo
sustituye el saldo y las filas después de validarlo; un error de lectura,
formato, tamaño o datos conserva el plan actual. El selector se vacía para
permitir abrir de nuevo el mismo archivo. Una lectura pendiente no puede
sobrescribir una edición o comprobación posterior. Guardar crea un Blob local,
inicia la descarga y libera su URL; los avisos de apertura y descarga se muestran
junto a sus respectivos controles, con regiones de estado independientes.
Editar retira resultado y opción de guardar hasta volver a comprobar. Se
explica que el archivo contiene fechas e importes y que solo corresponde al
comprobador por fechas, no a los costes o al plan de tres meses. Los controles
siguen sin `name` ni formulario; no se añaden eventos ni datos a enlaces.

Validación: 557 pruebas en 67 archivos, lint y compilación correctos. Se cubren
ida y vuelta del formato, marca ficticia, ceros, orden y fechas coincidentes,
rechazo de formato/versión/tipos/fechas/importes/tamaño inválidos, ignorar
resultados falsificados, descarga, reapertura, cambios pendientes, errores de
lectura/descarga y una lectura tardía frente a una edición nueva. En navegador
se descarga el ejemplo ficticio real, se recarga la página (vuelve vacía) y se
abre ese mismo archivo: se recuperan tres movimientos y los saldos 700 EUR
finales, -800 EUR de mínimo y 800 EUR de aporte inicial. Un archivo de prueba
incompatible conserva esos valores. Se comprueba la reapertura del mismo
archivo y la presentación de 390 y 320 px sin desborde de página; sin errores
en la consola consultada. Las capturas y archivos de prueba usan datos ficticios.

La publicación autorizada incluye guardar y recuperar el plan de caja por
fechas y la guía actualizada. Mantiene los anuncios desactivados, no toca el
piloto ni los seguimientos y no solicita otra revisión de AdSense.

### Vencimientos de caja por fecha (28 de octubre de 2026)

La siguiente mejora cubre el límite que el plan de tres meses ya advertía:
un cierre positivo puede ocultar un pago que llega antes del cobro. La guía de
costes añade `/cuanto-cuesta-ser-autonomo#vencimientos-caja`, con un comprobador
independiente y un enlace directo desde el plan mensual. No se trasladan datos
automáticamente entre ambos ni se alteran los cálculos o campos anteriores.

`lib/cashDates.ts` valida fechas de calendario completas, incluidos años
bisiestos, y de uno a veinte movimientos con tipo cobro/pago e importe no
negativo. Normaliza cada importe a céntimos, agrupa por fecha y ordena sin
mutar las filas introducidas. En una misma fecha resta todos los pagos antes
de sumar cualquier cobro. Este supuesto prudente puede producir un déficit
aunque el día termine positivo; no se presenta como el orden bancario real.
Se rechazan totales y saldos intermedios que pierdan precisión. Se muestra el
saldo final, el mínimo incluido el saldo inicial, el primer punto negativo y
el aporte inicial adicional que compensaría ese déficit bajo el mismo supuesto.

El ejemplo ficticio empieza con 1000 EUR antes del 5 de noviembre de 2026.
Paga 1800 EUR ese día, cobra 2400 EUR el 20 y paga 900 EUR el 25. Termina con
700 EUR, pero el mínimo es -800 EUR y el aporte inicial calculado es 800 EUR.
Adelantar el cobro al día 1 mantiene los 700 EUR finales y elimina el déficit.
Situarlo el día 5 conserva el mínimo de -800 EUR porque se calculan los pagos
primero. Tabla editorial y comprobador usan el mismo modelo. La guía explica
el método, su alcance y la diferencia entre el supuesto y las fechas de abono
reales. Su HTML inicial contiene el ejemplo y seis FAQ iguales al JSON-LD;
fecha editorial y sitemap pasan al día 28 por el cambio de contenido.

`CashDatePlanner.tsx` empieza con saldo y tres filas vacíos, sin nombres ni
formulario. Admite añadir y eliminar movimientos; mantiene el foco en una fila
disponible y exige completar cada fila o eliminarla. Editar fecha, tipo, importe,
saldo o filas retira el resultado y la marca de ejemplo. Enter en un campo
comprueba de nuevo. Los errores se describen por separado de las etiquetas,
que mantienen su nombre accesible al validar. El primer error recibe el foco.
Se usan movimientos de cuenta, contando cada salida una sola vez; no se
recalculan impuestos, comisiones, intereses, reservas ni movimientos recurrentes.
Un saldo positivo puede incluir dinero reservado para obligaciones posteriores.
No se añaden peticiones, conexión bancaria, almacenamiento, eventos ni datos
a enlaces compartidos. La calculadora fiscal, costes recurrentes, captación,
resumen principal y seguimiento permanecen intactos.

Validación: 526 pruebas en 65 archivos, lint y compilación correctos. Se cubren
orden de fechas, agrupación y pagos primero, adelanto del cobro, saldo inicial
negativo, ceros, normalización, bisiestos, entradas inválidas, límites de filas,
inmutabilidad y aritmética insegura. El navegador local verifica navegación
desde el plan mensual, errores y foco, edición real de fechas con teclado,
retiro de resultados, Enter, alta y eliminación de filas y ejemplo. Las vistas
de 390 y 320 px no desbordan la página; la tabla tiene desplazamiento propio
y foco por teclado. No aparecen errores en la consola revisada. Las capturas
locales muestran el ejemplo sin datos de una cuenta real.

La publicación autorizada incluye el comprobador de vencimientos por fecha,
la guía actualizada y el enlace desde el plan de tres meses. Mantiene los
anuncios desactivados, no toca el piloto ni los seguimientos y no solicita
otra revisión de AdSense.

### Costes específicos de una jornada (27 de octubre de 2026)

Se amplía el comprobador diario existente para resolver una limitación de la
comparación entre precio y horas: un servicio puede superar la tarifa por hora
y quedar por debajo al pagar un coste que esa tarifa no cubría. No se añade otro
comprobador al resultado principal. La guía por hora enlaza al nuevo ejemplo en
`/tarifa-diaria-freelance#costes-jornada`; el acceso anterior al comprobador se conserva.

`DayRatePlanner.tsx` añade un campo vacío de costes específicos, con cero
explícito si no hay. Se suman una sola vez al importe de las horas; el precio
opcional se compara con esa referencia total. Se muestra también el precio
menos dichos costes y el importe por hora que queda para cubrir la referencia
habitual. No son sueldo neto ni margen: aún deben cubrir los gastos habituales,
cuota y reserva fiscal incorporados en la tarifa. Un precio inferior al coste
produce importes negativos y un aviso específico. La guía explica cómo evitar
duplicar gastos ya repartidos entre los costes mensuales, o importes que el
cliente contrata y paga directamente. Enlaza a la AEAT sobre requisitos de
deducción del IVA soportado, sin calcular ni presumir deducibilidad o IVA recuperable.

El primer ejemplo de 297,28 EUR se conserva con costes cero. El nuevo usa sus
mismas ocho horas a 37,16 EUR/h, más 90 EUR ficticios de alquiler no contemplado
en los gastos habituales. La referencia total es 387,28 EUR. Un precio de
350 EUR parece dar 43,75 EUR/h, pero tras esos costes quedan 260 EUR y 32,50 EUR/h;
faltan 37,28 EUR para la referencia total. El modelo alimenta tabla y comprobador.
Se aclara que el borrador anterior de alcance corresponde al caso sin costes.
El método, ambos ejemplos y las seis FAQ coincidentes con JSON-LD se incluyen
en el HTML inicial; la fecha editorial y el sitemap recogen el cambio real.

`lib/dayRate.ts` normaliza dinero y horas a centésimas antes de operar y devuelve
esos valores a los campos. Trabaja con productos enteros seguros, valida costes
no negativos y sumas, y redondea simétricamente el importe negativo por hora sin
cero negativo. El modelo admite omitir el coste como cero para conservar sus
llamadas existentes; la interfaz exige escribirlo. Editar retira el resultado
y la marca de ejemplo; Enter vuelve a calcular y enfoca el primer error.
Los seis campos siguen sin `name`; no se añaden peticiones, almacenamiento,
eventos ni datos a enlaces compartidos. La calculadora fiscal, captación,
reparto de gastos mensuales y resumen principal permanecen intactos.

Validación: 487 pruebas en 63 archivos, lint y compilación correctos. Se cubren
costes cero, precio opcional, igualdad, déficit por costes, precio inferior al
desembolso, decimales, redondeo y cantidades inseguras. En navegador se revisan
errores y foco, Enter, edición, ejemplo, navegación desde la guía por hora y
pantallas de 390 y 320 px sin desborde de página. Las tablas tienen desplazamiento
propio y foco por teclado. El nuevo enlace tiene una caja pulsable completa y
foco visible; tras ajustar ese estilo se repiten las 11 pruebas de las guías
afectadas, lint y compilación. No aparecen errores en la consola revisada.

La publicación autorizada el 28 de octubre incluye el comprobador, la guía
actualizada y el enlace desde la guía por hora. Mantiene los anuncios
desactivados, no toca el piloto ni los seguimientos y no solicita otra revisión
de AdSense. La fecha editorial conserva la del cambio de contenido, el día 27.

### Plan de caja de tres meses (27 de octubre de 2026)

La página de costes añade un plan de caja independiente del reparto medio de
gastos. `CashFlowPlanner.tsx` pide siete importes: saldo inicial de la cuenta,
y cobros y pagos de tres meses consecutivos. Empiezan vacíos, admiten cero
explícito y no tienen `name`; el saldo inicial también admite valores negativos.
Los cobros son entradas en cuenta, con IVA y retenciones ya reflejados cuando
proceda. Los pagos incluyen actividad, cuota, impuestos y retiradas personales.
Los recibos anuales se anotan completos en su mes, no por su media mensual.

`lib/cashPlan.ts` lleva cada cierre al inicio del mes siguiente, en céntimos,
tras normalizar cada importe. Redondea simétricamente los saldos negativos,
evita el cero negativo y rechaza entradas, saldos intermedios o sumas inseguras.
Muestra saldo final, mínimo entre inicio y cierres, primer punto negativo y el
aporte adicional que eliminaría negativos en esos puntos. No conoce el orden
de movimientos dentro del mes: ese aporte puede no cubrir un vencimiento que
preceda al cobro. Un cierre positivo no acredita liquidez diaria, beneficio o
dinero libre para gastar y puede incluir reservas para obligaciones posteriores.

El ejemplo ficticio empieza en 1000 EUR. Los cobros son 0, 3600 y 1800 EUR;
los pagos, 1800, 1800 y 2100 EUR. Cierra en -800, 1000 y 700 EUR, con mínimo
-800 y aporte de 800 EUR para los puntos observados. Retrasar el cobro del
segundo al tercer mes mantiene los 700 EUR finales pero baja el mínimo a
-2600 EUR. Las cifras se derivan del mismo modelo. La tabla, el método, el
límite temporal y las cinco FAQ se incluyen en el HTML inicial. La guía enlaza
al [Banco de España sobre desfases de cobros y pagos de autónomos](https://clientebancario.bde.es/pcb/es/blog/autonomo--puedes-adelantar-el-cobro-de-tus-facturas.html)
como contexto; no recomienda productos de financiación ni un colchón universal.

La planificación anual enlaza directamente a `/cuanto-cuesta-ser-autonomo#plan-caja`.
No importa datos de la calculadora fiscal, no cambia su resumen, GET, captación
o eventos y no crea almacenamiento, peticiones ni conexión bancaria. Una edición
retira el plan anterior; Enter comprueba los datos y enfoca el primer campo
inválido. Se conserva intacta la calculadora previa de frecuencias de pago.

Validación: 470 pruebas en 63 archivos, lint y compilación correctos. Se cubren
saldo final positivo con déficit previo, cobro retrasado, saldo inicial negativo,
ceros, decimales y redondeos simétricos, límite de tres meses y aritmética
insegura. En navegador se revisan errores y foco, edición, Enter, vista de
320 y 390 px y tabla desplazable sin desborde de página. El enlace desde la
planificación anual está subrayado, tiene foco visible y permite llegar al plan
con los siete campos vacíos, sin modificar el resumen principal. Tras ajustar
su presentación se repiten sus cinco pruebas, lint y compilación. El HTML
inicial contiene el ejemplo y cinco FAQ coherentes con el esquema; sin errores
de consola ni anuncios en las vistas revisadas.

La publicación autorizada incluye el plan de caja, la guía de costes actualizada
y el enlace desde la planificación anual. Mantiene los anuncios desactivados,
no toca el piloto ni los seguimientos y no solicita otra revisión de AdSense.

### Neto a partir de otra facturación (27 de octubre de 2026)

El desglose del resultado añade «Estimar qué neto dejaría otra facturación».
La ayuda pide una facturación mensual sin IVA y conserva los gastos deducibles,
costes no deducibles, cuota y criterio de IRPF de ese resultado. Solo cambia
lo facturado y vuelve a estimar la reserva sobre el beneficio positivo. Se
explicitan doce meses iguales y una cuota fija, incluso si el cálculo previo
la estimó automáticamente o usó una reducción. No comprueba el derecho a esa
reducción ni recalcula cotizaciones, regularizaciones o la declaración real.

`lib/monthlyNet.ts` usa céntimos para las partidas y la conciliación del neto.
El modo manual aplica el mismo porcentaje al beneficio positivo; el progresivo
reutiliza `calculateSimplifiedAnnualIRPF`, que se exporta desde el motor sin
alterar su implementación, tablas o reglas. El modelo admite facturación cero,
no genera una reserva negativa ante pérdidas y muestra el déficit si las
partidas superan lo facturado. Redondea y muestra la facturación utilizada;
los importes o productos inseguros se rechazan. Reproducir un objetivo con
partidas ya redondeadas puede dar un céntimo de diferencia y se explica.

`MonthlyNetPreview.tsx` empieza vacío y no añade `name` ni formulario, peticiones,
almacenamiento o eventos. Editar retira el resultado previo y un cambio en los
supuestos del cálculo principal reinicia la ayuda. No cambia ese resultado ni
su resumen o enlace compartible. IVA, retenciones, otras rentas, circunstancias
personales, reducciones y pagos a cuenta quedan fuera de esta proyección.

La guía por hora conserva los ejemplos anteriores y añade tres casos con
gastos de 300 EUR, cuota manual de 320 EUR, costes no deducibles cero y reserva
manual del 15 %: 2500 EUR sin IVA dejan 1598 EUR; 2972,94 EUR reproducen 2000 EUR;
3500 EUR dejan 2448 EUR. La tabla y sus seis FAQ quedan en el HTML inicial.
Se enlazan el [método de ingresos y gastos de la AEAT](https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/folleto-actividades-economicas/3-impuesto-sobre-renta-personas-fisicas/3_4-estimacion-directa-normal/3_4_1-calculo-rendimiento-neto.html)
y la [explicación de la Seguridad Social sobre regularización de cuotas](https://www.seg-social.es/wps/portal/wss/internet/HerramientasWeb/a0f05310-9c20-45ba-9dd2-47c9e88f34c1?changeLanguage=es).
Son referencias para interpretar los límites, no una validación oficial del modelo.

Validación: 440 pruebas en 61 archivos, lint y compilación correctos. Se cubren
modos manual y progresivo, las cinco referencias autonómicas y cuotas manual,
automática y reducida, comprobando que los resultados de partida se reproducen
con un máximo de un céntimo de diferencia. También se revisan costes no
deducibles, facturación cero, déficits, redondeos y cifras inseguras. En navegador
se verifican errores y foco, edición, decimales y Enter, contexto progresivo con
cuota mantenida, resumen intacto y navegación a la guía. Sin desborde a 320 y
390 px, sin errores de consola ni anuncios en las vistas revisadas. El HTML
inicial contiene la tabla y los esquemas Article/Breadcrumb/FAQ con seis preguntas.

La publicación autorizada incluye la estimación de neto, la guía por hora
actualizada y el acceso desde el resultado. Mantiene los anuncios desactivados,
no toca el piloto ni los seguimientos y no solicita otra revisión de AdSense.

### Combinar servicios distintos en un mes (27 de octubre de 2026)

El comprobador anterior suponía encargos iguales. El resultado añade ahora
«Combinar encargos de distintos precios y horas» dentro de esa misma ayuda,
con hasta ocho grupos: cantidad entera, precio sin IVA de un servicio y horas
de uno. Empieza con un grupo vacío y permite añadir y quitar grupos, conservando
los demás datos y llevando el foco a los campos correspondientes. No añade
otra ayuda al primer nivel del resultado ni modifica el comprobador anterior.

`lib/projectPortfolio.ts` suma cantidad por precio y cantidad por horas de cada
grupo. Normaliza precio y tiempo a dos decimales antes de multiplicar; usa
céntimos y centésimas de hora, valida enteros seguros en productos y sumas,
acepta precio cero explícito para trabajo gratuito y compara por separado el
objetivo de facturación y la capacidad. No optimiza cantidades ni transforma
una diferencia de facturación en beneficio neto. Tampoco recalcula impuestos,
comprueba ventas/cobros o coordina fechas de entrega y costes extraordinarios.

`MonthlyPortfolioPlanner.tsx` usa únicamente la referencia mensual y las horas
del resultado. Los campos no tienen `name`, no entran en el GET ni el resumen
compartido y no crean eventos, peticiones o almacenamiento. Una edición, alta
o baja de grupo retira la comparación anterior. Cambiar la referencia mensual
o las horas del cálculo principal reinicia los grupos. Los nombres de clientes
no son necesarios y no se piden.

La guía de 3000 EUR conserva sus casos anteriores y añade la misma combinación:
tres cuotas ficticias de 800 EUR y 12 h, más un proyecto de 1800 EUR y 32 h.
Suman 4200 EUR y 68 h; frente al ejemplo de 4149,41 EUR y 80 h quedan 50,59 EUR
de facturación y 12 h de capacidad. Si el proyecto ocupa 50 h, el plan pasa a
86 h y faltan 6. Con solo dos cuotas y el proyecto inicial suma 3400 EUR y 56 h:
cabe por tiempo pero faltan 749,41 EUR para la facturación objetivo. Los importes
y casos se derivan del mismo modelo, con referencia del motor fiscal existente.
La tabla, el método y las cinco FAQ permanecen en el HTML inicial.

Validación: 404 pruebas en 58 archivos, lint y compilación correctos. Se cubren
las cuatro combinaciones de cobertura/capacidad, decimales, precio cero,
cantidades inválidas, productos y sumas inseguros, límite de grupos, foco,
eliminación, reinicio y conservación del resumen y los eventos. Verificado en
navegador el acceso desde el resultado, el ejemplo, la edición y pantallas de
320 y 390 px sin desborde. La ayuda anidada reduce sus bordes y relleno en móvil
para conservar espacio de lectura. La guía responde 200 con tabla y cinco FAQ
en sus esquemas nativos, sin errores de consola ni anuncios en las vistas revisadas.

La publicación autorizada incluye el plan de servicios combinados, la guía de
3000 EUR actualizada y el acceso desde el resultado. Mantiene los anuncios
desactivados, no toca el piloto ni los seguimientos y no solicita otra revisión
de AdSense.

### Revisar precio y horas de un encargo terminado (27 de octubre de 2026)

El kit añade una revisión posterior al trabajo, distinta del presupuesto y la
capacidad mensual. `ProjectReview.tsx` pide referencia por hora, precio final
pactado sin IVA, horas previstas y horas registradas. Empieza vacío y admite
precio cero explícito para trabajo gratuito. Los cuatro campos carecen de
`name`; el comprobador no crea formularios, eventos, peticiones ni almacenamiento.
Una edición retira las cifras anteriores. Enter comprueba los datos y los
errores llevan el foco al primer campo inválido.

`lib/projectReview.ts` compara el ingreso por hora previsto y real, la desviación
de tiempo, las horas que cubre el precio a la referencia y la diferencia entre
el precio y el importe de las horas reales a esa referencia. Usa céntimos y
centésimas de hora, valida productos seguros y normaliza los campos a la misma
precisión del cálculo. El ingreso por hora se redondea a céntimos; el importe
de referencia, al alza; las horas cubiertas por el precio, hacia abajo.

El ejemplo ficticio usa 40 EUR/h, 400 EUR de precio final, 8 horas previstas y
12 reales: pasa de 50 a 33,33 EUR/h; son 4 horas más. El precio cubre 10 horas
a esa referencia; para 12 serían 480 EUR, una diferencia de -80 EUR. No es
beneficio neto ni acredita cobro, no evalúa costes extraordinarios fuera de la
referencia y no modifica acuerdos existentes. Se incluyen todas las horas del
cliente una vez, sin duplicar tiempos generales ya cubiertos por la referencia.

El ejemplo, sus límites y las cinco FAQ quedan en el HTML inicial. La descarga
conserva su URL y los bloques anteriores, y añade la ficha de revisión del
encargo; la vista previa sigue leyendo exactamente ese archivo. El resultado
principal incorpora solo un enlace a `/kit-tarifa-autonomo#revision-encargo`,
sin atributos de conversión ni cambios en el resumen o los eventos existentes.

Validación: 369 pruebas en 56 archivos, lint y compilación correctos. Revisados
en navegador los campos vacíos, errores y foco, ejemplo, edición, decimales y
Enter, navegación desde el resultado y pantallas de 320 y 390 px sin desborde.
La página y descarga responden 200, el recurso coincide exactamente con el
archivo y los esquemas Article/Breadcrumb/FAQ reflejan las cinco FAQ visibles.
Sin errores de consola ni scripts o unidades de anuncios en las vistas revisadas.

La publicación autorizada incluye el comprobador, la ficha actualizada y el
enlace desde el resultado. Mantiene los anuncios desactivados, no toca el
piloto ni los seguimientos y no solicita otra revisión de AdSense.

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
