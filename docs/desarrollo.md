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

### Mantener los avisos pendientes de la agenda al corregir datos (4 de noviembre de 2026)

Publicación autorizada el 4 de noviembre de 2026. Después de estimar una agenda incompleta,
corregir cualquier campo borraba también los errores de los otros campos,
porque todos dependían de la estimación retirada al editar.

Tras el primer intento explícito, los avisos usan los valores actuales de
los cuatro campos y el mismo motor y parseo existentes. Corregir un campo
retira solo los errores que ya no corresponden. También se actualiza la
comprobación de horas no facturables frente a días y horas de la jornada.
No hay cambios de foco al editar ni avisos nuevos antes del primer intento.

La capacidad y el botón Usar siguen dependiendo exclusivamente de una
estimación explícita: editar los retira, y completar todos los datos muestra
«Datos modificados. Pulsa «Estimar horas» para actualizar la capacidad.».
No se aplican horas automáticamente. Probar el ejemplo valida sus propios
valores; recuperar la agenda anterior restaura el borrador sin errores ni
resultados anteriores y requiere volver a estimar, como antes.

Validación: seis casos nuevos y 66 pruebas correctas en cinco archivos,
con máximo dos workers y sin avisos React. Cubren errores individuales,
dependencia semanal, datos malformados tras una capacidad válida, ejemplo
y recuperación, capacidad cero e integración con el cálculo principal.
ESLint, TypeScript y compilación correctos.

En navegador local, corregir Días deja visibles los otros tres errores.
Completar 5 días, 8 horas, 12 no facturables y 6 semanas no muestra capacidad
hasta estimar; entonces conserva 107,3 h y la aplicación de 107 h completas.
Reducir días a 1 vuelve a señalar la incompatibilidad semanal sin mover
el foco; corregirla retira el aviso y vuelve a pedir estimar. Enter funciona,
las horas principales siguen en 80 y la vista a 320 px no se desborda.
Consola sin errores y pantalla normal restaurada. Datos ficticios.

Se publica mediante la conexión Git existente. No cambian fórmulas, redondeo, formulario GET, enlaces
compartidos ni eventos. Anuncios, piloto y seguimientos intactos.

### Aclarar cómo escribir y pegar importes en el formulario (4 de noviembre de 2026)

Publicación autorizada el 4 de noviembre de 2026. En el navegador, escribir con teclado
1.500 en el control numérico del neto conserva ese texto pero lo interpreta
como 1,5; pegar 1.500 usa en cambio la notación española y significa 1500.
La diferencia corresponde al contrato existente entre entrada numérica
nativa y pegado. No se reinterpreta una cantidad que podría ser decimal.

Una sola nota visible al principio del formulario indica escribir 1500
sin separador de miles y permite pegar un importe como 1.500,50 €.
Su ID se asocia mediante aria-describedby a neto, gastos deducibles,
gastos no deducibles y cuota manual. Conserva los nombres, la pista de
no deducibles y los mensajes de error; no se asocia a horas ni a porcentajes.
No se añade texto repetido debajo de cada campo ni se cambia la guía.

Se amplían las aserciones de los seis casos de accesibilidad existentes:
ayuda con y sin errores, correcciones sin renombrar ni cambiar valores,
pegados inválidos y contenido servido con sus referencias accesibles.
Dos aserciones de importes mínimos pasan a comprobar que la descripción
contiene el error, permitiendo que también incluya la ayuda compartida.
No se añaden casos nuevos solo para comprobar texto estático.

Validación: 57 pruebas correctas en cinco archivos con máximo dos workers,
ESLint, TypeScript y compilación correctos. En navegador local se confirma
que escribir 1500 mantiene 1500 y pegar 1.500,50 € introduce 1500,50.
La nota se lee a 320 px sin desbordamiento. Se restaura la pantalla normal
y no hay errores de consola. Los importes usados son ficticios.

Se publica mediante la conexión Git existente. No cambian parsers, controles, normalización, cálculo,
formulario GET, enlace compartido ni eventos. Anuncios, piloto y
seguimientos intactos.

### Deshacer la última eliminación de un grupo de servicios (4 de noviembre de 2026)

Publicación autorizada el 4 de noviembre de 2026. «Quitar grupo» del plan de servicios
combinados eliminaba cantidad, precio y horas sin recuperarlos. La copia
anterior al ejemplo no cubre una eliminación ordinaria. Se incorpora
«Deshacer la última eliminación» en el componente existente y un párrafo
sobre su alcance en la guía de 3000 EUR.

La copia guarda una fila cruda con su ID e índice; restaurar la reinserta
en su posición y mantiene las ediciones actuales de los otros grupos.
Consume la copia, retira el resultado y devuelve el foco a la cantidad
mediante el efecto de foco ya existente. No recupera cifras antiguas:
requiere volver a comprobar con la referencia actual.

Editar o comprobar mantiene la opción; otra eliminación sustituye la copia.
Añadir un grupo la descarta con aviso explícito. Probar el ejemplo,
recuperar la combinación completa o cambiar la referencia también la
retira. Se respeta el máximo de ocho grupos y la copia completa anterior
al ejemplo permanece independiente. La región de cambios mantiene un
contenedor de estado accesible estable, aunque su contenido esté vacío.

Validación: siete casos nuevos y 53 pruebas correctas en cinco archivos,
con máximo dos workers y sin avisos React. Se cubren datos crudos y ceros,
primera/intermedia/última fila, ediciones posteriores, copia más reciente,
límite de ocho, sustituciones y recuperación completa, cambio de referencia
y conservación del resultado y resumen principal. Un test anterior contaba
cuatro desplegables pese a que el acceso directo al neto ya añadió un quinto;
se sustituye ese recuento por la comprobación de que esta ayuda está dentro
del resultado y de la ayuda de encargos. ESLint y compilación correctos.

En navegador local se recuperan horas malformadas, precio cero y orden,
se conservan los otros cambios y se validan los campos al recomprobar.
El nuevo cálculo refleja 1700,52 EUR y 26 h para los datos ficticios usados.
Tab y Enter a 320 px restauran la cantidad con foco visible; el botón cabe
sin desbordamiento. Se restaura la pantalla normal y la consola no muestra
errores. Son comprobaciones ficticias, no sesiones con usuarios reales.

Se publica mediante la conexión Git existente, sin almacenamiento nuevo. No cambian el motor, GET, enlaces
compartidos ni eventos. Anuncios, piloto y seguimientos intactos.

### Deshacer la última eliminación de un movimiento (4 de noviembre de 2026)

Publicación autorizada el 4 de noviembre de 2026. El comprobador de caja por fechas permitía
eliminar un movimiento completo o incompleto sin recuperarlo. El botón
«Deshacer la última eliminación» vuelve a insertar la fecha, el tipo y el
importe crudos con su ID y posición anterior. Conserva el saldo y las
ediciones de los demás movimientos; no recupera resultados antiguos.

Se conserva una sola eliminación. Editar los campos o comprobar mantiene
la opción; otra eliminación sustituye la copia. Añadir un movimiento la
descarta con un aviso explícito. Así la recuperación no queda bloqueada por
el máximo de 20 filas después de añadir una nueva. Probar un ejemplo,
abrir un archivo válido o recuperar el plan completo también la descarta,
para evitar mezclar datos de planes distintos. Un archivo inválido conserva
la opción. La guía de costes explica este alcance junto al comprobador.

Recuperar consume la copia, enfoca la fecha de la fila restaurada y retira
los saldos y la descarga hasta volver a comprobar. También invalida las
lecturas de archivo pendientes. No se añade almacenamiento: la copia se
pierde al salir o recargar y no se exporta en el archivo del plan.

Validación: siete casos nuevos y 94 pruebas correctas en ocho archivos,
con un máximo de dos workers. Cubren datos incompletos y malformados,
primera/intermedia/última fila, ediciones posteriores, copia más reciente,
límite de 20, descarte al añadir o sustituir, archivos inválidos, lectura
pendiente y exportación solo de los datos comprobados. ESLint y compilación
correctos. En navegador local se prueban el texto malformado recuperado,
la validación posterior, cambios conservados en saldo y otra fila, retirada
de los saldos y foco en la fecha. Enter y presentación a 320 px correctos;
consola sin errores. Las fechas de esa prueba se cargan desde el ejemplo
porque el fill de la herramienta sobre input date no las establece.

Datos de prueba ficticios; no son sesiones con usuarios reales. No cambian
el motor, el formato de archivo, GET, enlaces compartidos ni eventos.
Se publica por la integración Git existente. Anuncios, piloto y seguimientos intactos.

### Copiar el resumen con su enlace desde la portada (4 de noviembre de 2026)

Publicación autorizada el 4 de noviembre de 2026. La portada ofrecía el resumen
detallado en un campo seleccionable y enlaces a servicios externos, pero no
una acción para copiarlo completo y conservar el enlace en unas notas.

«Copiar resumen y enlace» usa exactamente el contenido visible del campo,
con sus supuestos y la URL ya generada. Se activa solo en la portada mediante
`enableResultShareCopy`; el antiguo bloque `enableResultCopy={false}` se
mantiene desactivado. Los demás usos conservan el nuevo control desactivado
por defecto. No se cambia el texto ni sus parámetros UTM.

`ShareableSummary` mantiene su estado de copia separado del botón antiguo,
deshabilita el control mientras espera y confirma solo tras resolver la API.
Si falla, enfoca y selecciona el mismo texto para copia manual. Se reutiliza
el auxiliar existente; su campo temporal se retira también si `execCommand`
lanza una excepción. El texto identifica la instancia del control, para no
mostrar un éxito anterior ni enfocar otro resumen tras un cambio de cálculo.
Sin JavaScript permanece la selección manual con su indicación en HTML.

Validación: nueve casos nuevos y 60 pruebas en cinco archivos correctas,
ESLint y compilación incluidos. Cubren copia exacta, espera, rechazo,
fallback verdadero/falso/excepción, selección, limpieza, independencia de
ambos controles, respuestas tardías, activación en la ruta real y HTML/SEO
de consultas válidas e inválidas. No aparecen avisos nuevos en estas pruebas.

En navegador local se comprueban el botón y su confirmación, la retirada al
editar, el aviso vacío en un nuevo cálculo y teclado/móvil de 320 px. El
portapapeles virtual de la herramienta no recoge lo escrito por la API de
la página: la lectura devuelve vacío y no permite comprobar un pegado real.
La igualdad del contenido se comprueba en las pruebas automáticas; no se
presenta como una lectura del portapapeles real. Consola sin errores.

Los datos de comprobación son ficticios. No se envía ningún formulario o
mensaje. No cambian cálculos, GET, metadatos, enlaces, eventos ni seguimiento.
Anuncios, piloto y seguimientos intactos. Se publica por la integración Git existente.

### Conservar los supuestos en el resumen del cálculo (3 de noviembre de 2026)

Publicación autorizada el 4 de noviembre de 2026. El texto exportado conservaba
los resultados, pero omitía los gastos deducibles y el criterio de IRPF y
de cuota. `ResultCard` amplía únicamente `resultSummary`, compartido por la
vista previa, la copia y los textos de WhatsApp, X y email.

Se indican siempre gastos deducibles sin cuota y costes no deducibles,
también cero. El modo manual lleva el porcentaje de reserva sobre el
beneficio y aclara que no es retención de factura. El progresivo se identifica
como estimación simplificada y muestra su comunidad, sin presentar el tipo
efectivo como un porcentaje elegido. La modalidad de cuota procede del
resultado aplicado: manual, estimada por tramo, reducida inicial o prórroga.

Solo la prórroga reducida añade rendimientos y SMI anuales, la comparación
del modelo y los límites que ya muestra `ReducedFeeNotice`: doce meses
iguales, cuota seleccionada conservada sin acreditar derecho, solicitud y
otros requisitos aparte y revisión de cada año si abarca dos años naturales.
No se introduce esa comparación como requisito de la cuota reducida inicial.

Validación: seis casos nuevos y 45 pruebas en tres archivos correctas.
ESLint, compilación y TypeScript pasan. Las pruebas comprueban importes,
modalidades y ambas ramas de la prórroga, igualdad del texto en vista previa,
copia y canales y conservación de URL, parámetros, atributos y eventos.
La ruta principal mantiene `enableResultCopy={false}`: el texto compartido
se comprueba en navegador y la copia al portapapeles en pruebas del componente,
sin activar el botón en esa ruta.

En navegador local se revisan reserva manual, progresivo de Madrid, gastos
cero y prórroga por encima del SMI. Los tres canales llevan el mismo texto
base, sin abrir sus destinos ni enviar mensajes. A 320 px el contenido se
ajusta al ancho del campo. Consola sin errores observados. Datos ficticios.

No cambia el cálculo, los campos, la validación, las URLs ni los controladores
de copia, compartición o seguimiento. Anuncios, piloto y seguimientos intactos.
Se publica por la integración Git existente.

### Acceso directo a la estimación de neto según facturación (3 de noviembre de 2026)

Publicación autorizada el 3 de noviembre de 2026. La ayuda existente para recorrer
la cuenta desde una facturación prevista estaba dentro del desplegable de
desglose. El selector tampoco ofrecía esta pregunta como punto de entrada.

`ResultCard` mueve el mismo desplegable «Estimar qué neto dejaría otra
facturación» al primer nivel del resultado, con el estilo de las otras
ayudas. No duplica el componente ni cambia su referencia, clave o estado.
El desglose y su comprobador de retención se mantienen. Se retira únicamente
el estilo de anidación del neto que deja de utilizarse.

El selector añade «Ya sé lo que voy a facturar» hacia la sección existente
de la guía por hora, con enlace al cálculo para usar gastos y cuota propios.
La tarjeta explica los costes ficticios, la cuota fija y los doce meses
iguales del ejemplo. La guía actualiza el acceso directo y enlaza el cálculo
de partida. No se añaden herramientas, rutas ni datos de entrada nuevos.

Validación: 65 pruebas en siete archivos, ESLint y compilación correctos.
Se adaptan dos pruebas existentes; las dos comprobaciones de acceso fallaban
antes del cambio. Se comprueban las diez decisiones del selector y todos
sus destinos reales, el acceso con el desglose cerrado y la conservación
del importe y la estimación al cerrar y reabrir. En navegador local se sigue
portada, selector, guía y cálculo propio. Con 150 EUR de gastos, cuota de
320 EUR y reserva manual del 15 %, facturar 2500 EUR deja 1725,50 EUR.
El resumen y la URL principal permanecen iguales. Editar y restaurar el
neto principal conserva el borrador; apertura con teclado comprobada a
320 px. No aparecen errores de consola en el recorrido revisado.

No cambia el motor, la validación, el resumen compartido, el formulario GET,
la recuperación de ejemplos ni los eventos. Anuncios, piloto y seguimientos
intactos. Se publica por la integración Git existente.

### Preparar costes propios sin arrastrar el ejemplo (3 de noviembre de 2026)

Publicación autorizada el 3 de noviembre de 2026. La calculadora de costes empieza
con cinco importes ficticios, cuatro frecuencias y 80 horas. Para preparar
otro plan había que sustituir todos esos datos uno a uno.

`MonthlyCostCalculator` añade «Empezar con mis costes»: vacía los importes,
las horas y el reparto deducible, pone las cuatro frecuencias en «Cada mes»
y limpia el intento anterior de traslado. Los importes vacíos siguen contando
como cero; las horas no son necesarias para sumar costes. La introducción y
la guía explican el inicio, los ceros y el alcance de la copia recuperable.

Antes de vaciar conserva una primera copia en memoria de las seis cadenas,
las cuatro frecuencias y los deducibles. Repetir el inicio no la reemplaza.
«Recuperar mis costes anteriores» restaura los textos exactos, incluso
incompletos o inválidos, consume la copia y permite empezar otro ciclo.
Los totales se recalculan en vivo; los errores reales del borrador conservan
su validación. La copia no se conserva al salir o recargar.

Ambas acciones llevan el foco a la cuota después de actualizar la pantalla
y centran el campo sin animación. Se corrigió un caso observado a 320 px:
al aparecer la recuperación, enfocar antes de actualizar dejaba la cuota
fuera de la vista. El campo queda visible tras empezar y recuperar.

Validación: seis regresiones, rojas antes de la implementación, y 48 pruebas
en cinco archivos correctas. ESLint y compilación pasan. En navegador local
se comprueban inicio y recuperación con Enter, primera copia tras repetir,
decimales y frecuencias originales y pantalla estrecha. Un plan ficticio de
350 EUR de cuota y 60 EUR trimestrales de gestoría suma 370 EUR mensuales
y 4440 EUR anuales. Con 80 horas y 10 EUR deducibles, la vista previa y el
traslado GET coinciden: 10 EUR deducibles, 10 no deducibles y cuota de 350.

No cambia el motor, la validación, los datos iniciales, el formulario GET
ni sus eventos. No se añaden peticiones o almacenamiento. Anuncios, piloto
y seguimientos intactos. Se publica por la integración Git existente.

### Mostrar el inicio del resultado bajo la cabecera fija (3 de noviembre de 2026)

Publicación autorizada el 3 de noviembre de 2026. En el build anterior, calcular
en escritorio y en móvil lleva el foco a la tarjeta, pero su título queda
bajo la cabecera fija. Con Enter a 320 px también puede desplazarse hasta
una zona intermedia de un resultado alto. Reproducción con datos ficticios;
no son sesiones con usuarios reales.

`chrome.css` aplica al resultado el mismo margen de desplazamiento de 7 rem
que las anclas principales. `CalculatorForm` conserva el foco en la tarjeta
y alinea expresamente su inicio tras cada cálculo válido, sin animación.
Se reutilizan los dos puntos de enfoque existentes, incluido el posterior
al montaje. Abrir un cálculo compartido no fuerza este desplazamiento.

Validación: 48 pruebas en cuatro archivos, incluidas tres regresiones de
navegación, correctas. ESLint y compilación pasan. En navegador se comprueban
clic, Enter y recálculo: el título queda a unos 137 px del borde superior,
bajo la cabecera de unos 75 px en escritorio y 105 px en móvil de 390 y
320 px; el foco permanece en el resultado. Consola y servidor sin errores
observados. Los errores conservan el foco en el campo que debe corregirse;
la edición y la carga inicial no fuerzan el desplazamiento al resultado.
No cambia el cálculo, el formulario GET, el resumen, los enlaces, las ayudas
o la recuperación de sus borradores.

No se crean eventos, peticiones ni almacenamiento. Anuncios, piloto y
seguimientos intactos. Se publica por la integración Git existente.

### Acceso directo al kit sin correo desde la portada (3 de noviembre de 2026)

Publicación autorizada el 3 de noviembre de 2026. El acceso «Quiero el kit»
del resultado lleva al bloque de la portada con el formulario de correo. El
kit, la ficha y el registro ya son públicos y se pueden usar sin registrarse,
pero ese bloque no ofrecía un enlace directo a ellos.

`HomePage` añade «Abrir el kit sin correo» en la columna de contenido del
bloque `kit-tarifa-form`, junto a una explicación de la ficha, el registro
de cuatro semanas y las listas. Reutiliza `/kit-tarifa-autonomo`, el archivo
público y los estilos existentes. El formulario de correo conserva sus
props, destino, campos, textos y botón. El acceso del resultado y sus
atributos tampoco cambian. No se añade seguimiento al enlace.

Validación: las 32 pruebas existentes de calculadora, formulario de correo
y kit pasan. ESLint y compilación correctos. Revisión independiente sin
bloqueos. En navegador local se sigue el acceso desde el resultado, se abre
el kit y se encuentra la descarga con el correo vacío, sin enviar el
formulario. El archivo público responde HTTP 200 como texto UTF-8 y sus
11.245 bytes coinciden exactamente con el recurso del repositorio. El
navegador de pruebas no devolvió un evento de descarga; se comprobó el
archivo servido directamente. Consola y servidor sin errores observados.

El cambio se limita al acceso y al texto de la portada. No se cambian el
formulario de captación, la configuración, los eventos, la página de gracias,
los anuncios, el piloto o los seguimientos. Se publica por la integración
Git existente.

### Validar importes positivos que quedan en cero al redondear (3 de noviembre de 2026)

Publicación autorizada el 3 de noviembre de 2026. Reproducción ficticia en
el build local: abrir un cálculo con neto o cuota manual de 0.004 EUR permite
un resultado inicial, pero Enter convierte el campo en cero y actualiza la
URL con ese valor inválido. El resultado desaparece al renderizar de nuevo.
La entrada pasaba la validación por ser positiva antes del redondeo.

`getFieldError` rechaza los positivos de neto y cuota manual que la función
de normalización existente convertiría en cero. Reutiliza ese mismo formato,
sin recursión ni un redondeo alternativo. El mensaje explica el resultado del
redondeo y pide al menos un céntimo. La normalización conserva el dato inválido
para corregirlo, también al pegar un importe español. La validación compartida
protege el envío, el cálculo inicial de una consulta y su imagen compartida.

Se mantiene la frontera existente: 0.005, 0.009 y 0.01 EUR se admiten y se
normalizan a 0.01; los mensajes de cero y negativos no cambian. Gastos y
reserva de IRPF pueden seguir siendo cero. La cuota manual se ignora cuando
la modalidad elegida es automática o reducida. El lector de consultas
conserva su precisión; no se cambia la canonización general de las consultas.

Validación: doce casos nuevos cubren Enter sin blur, salida del campo,
pegado español, conservación del dato, corrección, límites, campos inactivos,
SSR y metadatos. Las pruebas dirigidas y la batería completa (926 pruebas
en 96 archivos, con dos procesos) pasan. ESLint y compilación correctos.
Revisión independiente sin bloqueos. En navegador sobre el build local,
neto y cuota manual de 0.004 se mantienen tras Enter, con error asociado,
sin resultado ni cambios en la URL. La consulta inválida usa la imagen
genérica. Pegar 0,004 EUR conserva el dato; pegar 0,01 EUR y calcular permite
un resultado con la cuota manual de 0,01 EUR, sin pasar a automática.
Consola y servidor sin errores observados.

No cambia el motor, los tipos fiscales, el lector de consultas, el formulario
GET ni los controladores de envío, seguimiento o conversión. Los flags de
estado inicial del servidor se mantienen. No se crean peticiones, eventos ni
almacenamiento nuevos. Anuncios, piloto y seguimientos intactos. Se publica
por la integración Git existente.

### Etiquetas estables y ayudas asociadas en el formulario principal (3 de noviembre de 2026)

Publicación autorizada el 3 de noviembre de 2026. En el formulario principal,
un error de neto, gastos o cuota se incorpora al nombre accesible del campo
porque comparte la etiqueta envolvente. Las pistas de los selectores también
forman parte del nombre y lo alargan al cambiar de modo. En gastos no
deducibles, el error sustituye la pista en `aria-describedby`. Reproducción
ficticia en navegador: neto cero y gastos no deducibles negativos; la búsqueda
por el nombre original del neto deja de resolver y la pista queda sin asociar.

`CalculatorForm` asocia de forma explícita las etiquetas visibles de neto,
gastos deducibles, gastos no deducibles y cuota manual. Los errores quedan
como descripciones, sin renombrar los controles. Los cuatro selectores de
IRPF, comunidad, modalidad de cuota y período reducido también separan su
etiqueta de la pista, que conserva su asociación al cambiar las opciones.
Gastos no deducibles mantiene simultáneamente pista y error, como ya hacían
horas y reserva de IRPF. No se cambia el texto visible.

Validación: seis casos nuevos fallan antes del cambio y pasan después. Las
48 pruebas específicas de componente, etiquetas y validación y la batería
completa (914 pruebas en 94 archivos, con dos procesos) son correctas.
ESLint y compilación correctos. Revisión de React, GET y SSR sin bloqueos:
los identificadores son deterministas y no colisionan en el uso actual.
En navegador sobre el build local, los cuatro nombres numéricos resuelven
exactamente tras mostrar varios errores, la pista no deducible permanece
asociada junto a su error y el foco sigue en el primer campo inválido.
Comunidad, período reducido y modalidades conservan nombres breves y sus
pistas. Volver a la referencia anterior recupera el resumen idéntico. Corregir
los campos y calcular obtiene 2972,94 EUR/mes sin IVA y 37,16 EUR/h con los
supuestos ficticios de 2000 EUR netos, 300 EUR de gastos, 80 h, reserva manual
del 15 % y cuota de 320 EUR. Consola y servidor sin errores observados.

Sin cambios en fórmulas, validación, normalización, GET, resumen, URL,
almacenamiento, peticiones ni eventos de seguimiento. Anuncios, piloto y
seguimientos intactos. Se publica por la integración Git existente.

### Guiar la corrección de los datos que impiden trasladar costes (3 de noviembre de 2026)

Publicación autorizada el 3 de noviembre de 2026. Reproducción ficticia en
la calculadora de costes: intentar trasladar con deducibles vacíos muestra
un aviso pero mantiene el foco en el botón y no enlaza el error con el campo.
Con cuota cero, 80 h y 100 EUR de deducibles, el traslado también se bloquea,
pero la cuota continúa con `aria-invalid=false` y sin mensaje asociado.
Los totales son válidos para planificar; el bloqueo corresponde al traslado.

`MonthlyCostCalculator` muestra el error de cuota junto al importe y el de
deducibles junto al reparto. Ambos se vinculan con `aria-describedby` y
marcan el campo como inválido tras intentar trasladar. El nombre accesible
de deducibles se fija con su etiqueta, independiente del mensaje. Se retira
el aviso genérico del botón para evitar duplicados. Si hay varios errores,
se indican todos y el envío lleva al primero en orden de pantalla: cuota,
horas y deducibles. Corregir un dato retira su aviso sin mover el foco.

La cuota cero o una cantidad que se redondea a cero sigue permitiendo sumar
costes antes del intento de traslado. No cambian importes, frecuencias,
redondeo, criterios de validación, vista previa ni formulario GET. Se
conservan las cadenas escritas y el desglose abierto durante la corrección.
No se añade una guía para describir el manejo del foco; los mensajes útiles
aparecen junto a los campos en el momento en que se necesitan.

Validación: siete casos nuevos fallan en la versión anterior y pasan con la
corrección. Las 38 pruebas específicas de componente, traslado y motor y la
batería completa (908 pruebas en 93 archivos, con dos procesos) son correctas.
ESLint y compilación correctos. Revisión de React y accesibilidad sin bloqueos.
En navegador sobre el build local se reproduce y corrige el flujo de cuota
cero, horas fraccionarias y reparto superior al disponible. Los mensajes
se asocian con cada campo y el foco avanza al corregirlos. El desglose
permanece abierto. Tras corregir el reparto, el GET lleva 100 EUR deducibles,
60 EUR no deducibles, cuota manual de 320 EUR y 80 h a los campos de la
calculadora principal. Consola y servidor sin errores observados.

Sin cambios en fórmulas fiscales, guía, fechas editoriales, enlace compartido,
almacenamiento persistente, peticiones ni eventos nuevos. Anuncios, piloto y
seguimientos intactos. Se publica por la integración Git existente.

### Recuperar la alternativa tras cargar los datos de partida (3 de noviembre de 2026)

Publicación autorizada el 3 de noviembre de 2026. Reproducción ficticia en el comparador de gastos y
horas: escribir 450,555 EUR y 60 h y pulsar «Cargar los datos de partida»
sustituye ambos campos por 300 / 80 sin permitir recuperarlos. No se ha
confirmado un defecto de cálculo de mayor impacto en los motores revisados.

`MonthlyScenarioComparator` conserva la primera alternativa propia anterior
a la carga, incluidas precisión, espacios, ceros y cadenas incompletas.
Repetir la carga, editar o comparar no sustituye esa copia. La procedencia
de los datos cargados se mantiene al comparar, también con Enter: una partida
intacta no se ofrece como alternativa propia. Editar o recuperar permite
iniciar un nuevo ciclo. No se crea copia desde los campos vacíos.

«Recuperar mi alternativa anterior» restaura las dos cadenas sin calcular,
retira comparación, enlace y errores, consume la copia y devuelve el foco a
gastos. Pide volver a comparar. Se mantiene el único estado accesible y la
clave de referencia existente: una referencia equivalente conserva la copia;
cambiar los supuestos reinicia campos, copia y mensajes sin revivirlos al
volver. El aviso y la tabla explican la sustitución de los cambios actuales
y la pérdida de la copia al salir, recargar o cambiar la referencia.

Validación: siete casos nuevos fallan antes y pasan después del cambio.
Las 28 pruebas específicas de recuperación, componente, motor y guía son
correctas. Batería completa: 901 pruebas en 92 archivos, todas correctas con
dos procesos. La primera ejecución, simultánea con lint y build, agotó el
tiempo en una prueba existente de importación de caja; al repetir la batería
con menos carga pasa sin modificarla. ESLint y compilación correctos.
Revisión de React y accesibilidad sin hallazgos. En navegador sobre el build
local, cargas repetidas, botón, Enter y errores posteriores permiten recuperar
exactamente 450,555 / 60. Se retiran resultados y enlace hasta volver a comparar;
entonces se usan 450,56 EUR y 60 h también en el enlace alternativo. El resumen
principal permanece idéntico. Explicación visible y consola sin errores.

Sin cambios en fórmulas, redondeo, fechas editoriales, selector, cálculo
principal o enlace compartido. Sin almacenamiento persistente, peticiones
ni eventos nuevos. Anuncios, piloto y seguimientos intactos. Se publica por
la integración Git existente.

### Recuperar la retención y conservar el aviso de ejemplo (2 de noviembre de 2026)

Publicación autorizada el 2 de noviembre de 2026. Reproducción ficticia en la ayuda
del resultado mensual: escribir 7,125 % y probar el 15 % sustituye el valor
sin recuperarlo. Además, pulsar «Comprobar importe a cobrar» o Enter sin
editar retira la marca ficticia aunque se sigue usando el 15 % del ejemplo.

`WithholdingPreview` conserva la primera cadena propia anterior al ejemplo
dentro de `PreviewEditor`, incluidos precisión, espacios, cero y datos
incompletos. Editar, comprobar o repetir el ejemplo no sustituye esa copia.
«Recuperar mi retención anterior» restaura el campo sin calcular, retira el
resultado y los errores, consume la copia y devuelve el foco. Pide comprobar
de nuevo. El estado vacío y los ejemplos intactos no se ofrecen como datos propios.

`check` conserva por defecto el origen de `checked`: recomprobar o pulsar
Enter no convierte un ejemplo en un porcentaje propio. Editar ya retira
`checked`, por lo que una comprobación posterior usa el porcentaje escrito
sin marca ficticia. No se duplica el estado de origen. Se mantiene la clave
`baseAmount:vatAmount:context`: cambiar cada referencia reinicia campo,
copia, resultado y mensajes; volver atrás no revive la copia antigua.

La guía por hora explica la recuperación en la ayuda mensual y el aviso
ficticio persistente. La descripción del botón nombra base, IVA y referencia
con ejemplos comprensibles (ejemplo o resultado mensual), sin exponer el
nombre interno de la prop. Sin cambios en tipos fiscales, motor, redondeo,
fechas editoriales, tabla, selector, resumen o enlace compartido. Sin nuevos
campos, almacenamiento persistente, peticiones o eventos. Anuncios, piloto
y seguimientos intactos. Se publica por la integración Git existente.

Validación: 34 pruebas específicas de componente, recuperación, motor y guías
y la batería completa (894 pruebas en 91 archivos), todas correctas. ESLint
y compilación correctos; revisión de accesibilidad sin hallazgos. Los siete
casos nuevos cubren marca ficticia tras botón y Enter, edición, primera copia,
texto original, cero válido, errores, nuevo ciclo y reinicios independientes
por base, IVA o contexto. Sin almacenamiento ni envíos. En navegador sobre
el build local, 7,125 / ejemplo del 15 % / botón / Enter mantiene el aviso;
repetir y comprobar un 101 % inválido permite recuperar 7,125 exactamente.
Se retiran resultado y errores, se consume la copia y vuelve el foco. El
resumen detallado principal permanece idéntico. Guía visible y consola sin
errores.

### Recuperar la facturación prevista tras probar el ejemplo de neto (2 de noviembre de 2026)

Publicación autorizada el 2 de noviembre de 2026. Reproducción ficticia en la
guía por hora: escribir 3250,555 EUR de facturación prevista y probar los
2500 EUR del ejemplo sustituye el importe sin permitir recuperarlo. La
previsión puede proceder de sumar varias facturas. No se confirmó un fallo
numérico de mayor impacto en los motores de neto y retención revisados.

`MonthlyNetPreview` conserva dentro de `NetEditor` la primera cadena propia
antes del ejemplo, con precisión, espacios, ceros y datos incompletos.
Editar, estimar o repetir el ejemplo no sustituye esa copia. «Recuperar mi
facturación anterior» restaura el importe sin calcular, retira estimación y
errores, limpia la marca ficticia, consume la copia y devuelve el foco al
campo. Pide estimar de nuevo. Cero es una previsión válida, no ausencia de
datos; el estado vacío y los ejemplos intactos no se ofrecen como copia propia.

Se mantiene `key={JSON.stringify(reference)}`: cambiar los supuestos de
referencia reinicia campo, resultado, copia y mensajes. Volver a los datos
anteriores no recupera la copia. La guía por hora y el aviso junto al botón
aclaran la duración al salir, recargar o cambiar costes, cuota, objetivo o
supuestos de IRPF. Se anuncia la recuperación en el mismo estado accesible.
Sin cambios en fórmulas fiscales, redondeo, fechas editoriales, tabla, selector,
resultado principal o enlace compartido. Sin almacenamiento persistente,
peticiones ni eventos nuevos. Anuncios, piloto y seguimientos intactos.
Se publica por la integración Git existente.

Validación: 42 pruebas específicas de recuperación, componente, motor y guía
y la batería completa (887 pruebas en 90 archivos), todas correctas. ESLint
y compilación correctos; revisión de accesibilidad sin hallazgos. Los seis
casos nuevos cubren cadenas malformadas y precisas, primera copia, repeticiones,
estimaciones válidas o inválidas, segundo ciclo y cero con déficit válido
solo tras estimar explícitamente. Una referencia equivalente mantiene la
copia; cambiar costes o criterio fiscal la reinicia junto al campo, los
mensajes y el resultado, sin revivirla al volver. Sin almacenamiento ni envíos.
En el navegador sobre el build local, ejemplo, importe malformado, estimación
y repetición permiten recuperar exactamente 3250,555, sin estimación anterior
ni errores, con foco en el campo y copia consumida. Guía visible y consola
sin errores.

### Recuperar los meses y las horas del calendario anual (1 de noviembre de 2026)

Publicación autorizada el 2 de noviembre de 2026. Reproducción ficticia en la
guía de 1500 EUR: 9 meses activos y 85,505 horas por mes. Probar 10 meses de
70 horas sustituye los dos campos sin permitir recuperar el calendario propio.
No se confirmó un defecto matemático de mayor impacto en las ayudas revisadas.

`AnnualBillingPlanner` conserva en `PlanEditor` la primera copia de los dos
textos propios antes del ejemplo. Incluye precisión, espacios, ceros, vacíos
y datos incompletos. Editar, comprobar o repetir el ejemplo no sustituye la
copia. «Recuperar mi calendario anterior» restaura los campos sin calcular,
retira resultado y errores, limpia la marca ficticia, consume la copia y
enfoca los meses activos. Pide volver a comprobar el plan y permite un nuevo
ciclo. El estado vacío y los ejemplos intactos no se copian como datos propios.

Se mantiene `key={monthlyBilling}`: cambiar la referencia mensual reinicia
campos, resultado, copia y mensajes. Volver a la referencia anterior no
recupera datos del cálculo previo. La guía de 1500 EUR y el aviso junto al
botón aclaran ese límite, además de la pérdida al salir o recargar la página.
Se usa el mismo estado accesible del resultado para anunciar la recuperación.
Sin cambios en motor, redondeo, fechas editoriales, tabla, selector, resultado
principal o enlace compartido. Sin nuevos campos, almacenamiento persistente,
peticiones ni eventos. Anuncios, piloto y seguimientos intactos. Se publica por la integración Git existente.

Validación: 34 pruebas específicas de recuperación, componente, motor y guía
y la batería completa (881 pruebas en 89 archivos), todas correctas. ESLint
y compilación correctos. Revisión de accesibilidad sin hallazgos.
Los seis casos nuevos cubren textos originales, ceros inválidos, campos
incompletos, primera copia, repeticiones, comprobaciones válidas o inválidas
y segundo ciclo. Mantener la misma referencia conserva la copia; cambiarla
reinicia el calendario, la copia y los mensajes, sin recuperarlos al volver
al valor anterior. No hay almacenamiento ni envíos. En el navegador sobre
el build local, probar el ejemplo, comprobar 13 meses, repetir y recuperar
devuelve exactamente 9 / 85,505. Se retiran el resultado y los errores; se consume
la copia y vuelve el foco a meses activos. Guía visible y consola sin errores.

### Recuperar precio y horas al valorar un encargo (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026. Reproducción ficticia en la
guía de 3000 EUR: precio de 650,505 EUR y 18,75 h. Probar el encargo ficticio
sustituye ambos campos por 2100 / 40 sin permitir volver al borrador propio.
Se prioriza esta pérdida frente al plan anual, también de dos campos, por
su uso antes de comprometer precio y alcance. No se confirmó un defecto
matemático o de decisión de mayor impacto en las ayudas revisadas.

`MonthlyProjectPlanner` conserva la primera copia de las dos cadenas propias
antes de probar el ejemplo: precisión, espacios, ceros, vacíos y datos
incompletos. Editar, comprobar o repetir el ejemplo mantiene esa copia.
«Recuperar mis datos del encargo» restaura los campos sin calcular, retira
el resultado y los errores, limpia la marca ficticia, consume la copia y
enfoca el precio. Pide comprobarlos con la referencia mensual vigente; no
restaura objetivos mensuales ni resultados anteriores. Se permite un nuevo
ciclo. El estado vacío y los ejemplos intactos no se ofrecen como datos propios.

La guía de 3000 EUR explica la recuperación y su duración en esta página.
Sin cambios en motor, redondeo, fechas editoriales, tabla, selector o enlace
compartido. Se conserva un único estado accesible para resultado y aviso.
Sin nuevos campos, almacenamiento persistente, peticiones o eventos.
Anuncios, piloto y seguimientos intactos. Se publica por la integración Git existente.

Validación: 67 pruebas específicas de componente, recuperación, motor y guía
y la batería completa (875 pruebas en 88 archivos), todas correctas. ESLint
y compilación correctos; revisión de accesibilidad sin hallazgos. Los seis
casos nuevos cubren cadenas originales, ceros inválidos, campos incompletos,
primera copia, repeticiones, comprobaciones válidas o inválidas y nuevo ciclo.
Tras cambiar la referencia a 5000 EUR y 80 h, recuperar 600 EUR / 30 h y volver
a comprobar obtiene 1875 EUR de referencia y 9,6 h cubiertas, sin restaurar
la referencia anterior. Sin almacenamiento ni envíos. En navegador sobre
el build local, ejemplo, precio malformado, comprobación y repetición permiten
recuperar exactamente 650,505 / 18,75. No quedan resultados ni errores;
se consume la copia, el foco vuelve al precio y aparece la indicación de
comprobar con la referencia actual. Guía visible y consola sin errores.

### Recuperar los datos propios de una factura tras probar el ejemplo (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026. Caso ficticio: base de
2450,755 EUR, IVA supuesto del 10 % y retención supuesta del 7 %. Probar la
factura ficticia de 1000 EUR sustituye los tres campos por 1000 / 21 / 15 sin
permitir volver a los datos propios. No se confirmó un defecto matemático o
de decisión de mayor impacto en las ayudas revisadas.

`InvoiceCheck` conserva las tres cadenas anteriores al primer ejemplo con
datos propios escritos, incluidos precisión, espacios, ceros, campos vacíos
e importes incompletos. Editar, comprobar o repetir el ejemplo mantiene la
primera copia. «Recuperar mis datos de factura» restaura los campos sin
calcular, retira resultado y errores, limpia la marca ficticia, consume la
copia y enfoca la base sin IVA. Pide volver a comprobar la factura. El estado
vacío y los ejemplos puros no se copian como datos propios; se puede iniciar
un segundo ciclo tras recuperar y preparar otros datos.

La guía por hora explica la recuperación, la sustitución de los cambios
actuales y que la copia se pierde al salir o recargar. La ayuda no elige tipos
ni emite facturas. No cambia el motor, el redondeo, la tabla, las fechas
editoriales, el selector o el resultado principal y su enlace. Sin nuevos
campos, almacenamiento persistente, peticiones ni eventos. Anuncios, piloto
y seguimientos intactos. Se publica por la integración Git existente.

Validación: las 39 pruebas específicas de recuperación, componente, motor y
guía y la batería completa (869 pruebas en 87 archivos) pasan. ESLint y
compilación correctos; revisión de accesibilidad sin
hallazgos. Los cinco casos nuevos cubren cadenas originales, ceros, campos
incompletos, primera copia, repeticiones, comprobaciones válidas o inválidas
y un nuevo ciclo, sin almacenamiento ni envíos. En el navegador sobre el
build local, probar el ejemplo, introducir un IVA malformado, comprobar,
repetir y recuperar devuelve exactamente 2450,755 / 10 / 7. Se retiran
resultado y errores, se consume la copia y vuelve el foco a la base. Guía
visible y consola sin errores.

### Recuperar la comparación propia de una rebaja de tarifa (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026. Reproducción ficticia en la
guía por hora: tarifa de 52,505 EUR/h, rebaja del 7,5 %, 64,25 h facturadas y
90,5 h de capacidad. Probar la rebaja ficticia del 10 % sustituye esos cuatro
datos por 40 / 10 / 80 / 80 sin ofrecer vuelta al borrador propio. Una revisión
del motor no detectó un error matemático de mayor impacto en esta ayuda.

`RateDiscountPlanner` conserva ahora las cuatro cadenas del borrador antes de
probar el primer ejemplo. Incluye precisión, espacios, ceros deliberados,
campos vacíos e importes incompletos. Editar, comprobar o repetir el ejemplo
mantiene la primera copia. «Recuperar mi comparación anterior» restaura el
borrador sin calcular, retira resultado y errores, limpia la marca ficticia,
consume la copia y enfoca la tarifa actual por hora. Pide volver a comprobar
la rebaja. Un nuevo borrador puede iniciar otro ciclo; los ejemplos puros o
el estado vacío no se ofrecen como una comparación propia recuperable.

La guía explica la sustitución de los campos, el nuevo cálculo explícito y
que la copia se pierde al salir o recargar la página. Sin cambios en motor,
redondeo, fechas editoriales, tabla, selector, enlace compartido o resultado
principal. Sin almacenamiento persistente, peticiones ni eventos nuevos.
Anuncios, piloto y seguimientos intactos. Se publica por la integración Git existente.

Validación: 36 pruebas específicas de componente, recuperación, motor y guía,
y la batería completa (864 pruebas en 86 archivos), todas correctas. ESLint,
compilación y revisión de accesibilidad sin hallazgos. Los cinco casos nuevos
cubren cadenas sin normalizar, ceros, campos incompletos, primera copia,
repeticiones, comprobaciones válidas o inválidas y un nuevo ciclo, sin envíos
ni almacenamiento. En el navegador sobre el build local, probar el ejemplo,
introducir una rebaja malformada, comprobar, repetir y recuperar devuelve
52,505 / 7,5 / 64,25 / 90,5 exactamente. Se retiran resultado y errores,
se consume la copia y vuelve el foco a la tarifa. Guía visible y consola
sin errores.

### Recuperar la revisión propia de un encargo terminado (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026. Reproducción ficticia en el
kit: referencia de 45,005 EUR/h, precio pactado de 850,50 EUR, previsión de
18,5 h y registro de 23,75 h. Probar el ejemplo de 400 EUR sustituía los cuatro
campos por 40 / 400 / 8 / 12 sin permitir recuperar la revisión propia. La
pérdida afecta a horas ya registradas y al precio de un trabajo terminado.

`ProjectReview` conserva ahora las cuatro cadenas del borrador antes de probar
el primer ejemplo, incluidas precisión, espacios, ceros, vacíos e importes incompletos.
Editar, volver a revisar o repetir el ejemplo mantiene la primera copia.
«Recuperar mi revisión anterior» restaura el borrador sin calcular, retira el
resultado y los errores, limpia la marca ficticia, consume la copia y enfoca
la referencia por hora. Pide volver a revisar el encargo. Un nuevo borrador
puede iniciar otro ciclo; un ejemplo puro no se conserva como datos propios.

El kit explica la recuperación y que la copia se pierde al salir o recargar.
No cambia el motor, el redondeo, la ficha descargable, las fechas editoriales,
el acceso desde el resultado ni su resumen o enlace compartido. Sin nuevos
campos, rutas, almacenamiento persistente, peticiones ni eventos. Anuncios,
piloto y seguimientos intactos. Se publica por la integración Git existente.

Validación: las 31 pruebas específicas de recuperación, componente, motor y kit
y la batería completa (859 pruebas en 85 archivos) pasan, al igual que ESLint
y la compilación completa. En el navegador, sobre
el build local, probar el ejemplo, editar sus horas, revisar y repetir el
ejemplo permite recuperar exactamente 45,005 / 850,50 / 18,5 / 23,75. El
resultado queda vacío, desaparece la recuperación consumida y el foco vuelve
a la referencia por hora. Guía visible y consola sin errores. Los cinco
casos nuevos cubren también borradores incompletos, ceros, repetición,
revisión válida o inválida y un segundo ciclo, sin almacenamiento ni envíos.

### Recuperar el borrador al abrir un archivo de caja por fechas (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026. Reproducción: un borrador
con saldo -125,005 EUR, tres filas incompletas y los importes 1500,50, 0 y
1,,50 se sustituye por un archivo válido de un movimiento sin ofrecer vuelta.
El comprobador admite veinte movimientos, hasta 61 campos; un borrador
incompleto no puede guardarse todavía. La protección anterior solo se creaba
al probar el ejemplo.

`CashDatePlanner` comparte ahora una primera copia entre ejemplos e importaciones.
Solo una lectura vigente y validada puede crear la copia antes de sustituir
el plan. Se clonan saldo, filas, identificadores, orden, texto original y marca
ficticia. Abrir otros archivos, editar, comprobar o probar ejemplos mantiene
la primera copia hasta recuperarla. Recuperar invalida las lecturas pendientes,
restaura el borrador sin calcular, retira resultados y descargas y enfoca el
saldo inicial. El siguiente identificador sigue creciendo.

La primera importación en las tres filas iniciales vacías no crea una copia
vacía: después puede recuperarse ese archivo al probar el ejemplo. Un cero,
datos parciales o cambiar el número de filas sí constituyen un borrador.
Se conservan también los planes marcados ficticios. Un archivo inválido,
demasiado grande, fallido u obsoleto no crea ni sustituye la copia.

Si la copia procede de un archivo, su único botón y aviso aparecen junto al
selector para no obligar a recorrer veinte filas. Si procede del ejemplo,
mantienen su ubicación. La confirmación de recuperación aparece junto al
saldo. La guía y su FAQ explican la primera copia y su duración en la página.
No cambia el formato JSON, el guardado, las fórmulas, las fechas editoriales,
el plan de tres meses ni otros comprobadores. Sin almacenamiento persistente,
peticiones o eventos nuevos; anuncios, piloto y seguimientos intactos.
La publicación usa la integración Git existente de Vercel.

Validación: seis regresiones nuevas fallaban en el original por faltar la
recuperación de importaciones; después pasan las 28 pruebas de caja por fechas
y sus archivos, y las cuatro de la guía. Se cubren veinte filas con orden e
identificadores, ceros y cambios de estructura, errores JSON/tamaño/lectura,
carreras con ediciones, importación posterior y recuperación, prioridad de la
primera copia y marca ficticia. Suite completa: 854 pruebas en 84 archivos;
lint y compilación correctos.

Navegador local con un archivo ficticio de saldo 333 EUR y cobro de 444 EUR:
tras abrirlo aparece un único botón de recuperación junto al selector. Probar
el ejemplo y abrir el archivo de nuevo conserva la primera copia. Recuperar
devuelve exactamente -125,005 y las tres filas originales (1500,50 / 0 / 1,,50,
con fechas y tipos incompletos), sin saldos ni descarga anterior. El foco vuelve
al saldo y la copia se consume. Sin errores de consola; captura local guardada.
El archivo de prueba es inventado y se lee en el navegador. En la revisión previa
a publicar se aclara la guía para no prometer siempre la ubicación del botón:
depende de si la primera copia nació de un archivo o del ejemplo. Sus cuatro
pruebas y el lint vuelven a pasar. Esta es la versión autorizada para publicar.

### Recuperar la agenda propia tras probar el ejemplo (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026. Se reproduce en navegador
la sustitución de los cuatro campos de la agenda al probar el ejemplo:
4,5 días, 6,5 horas diarias, 8,25 horas no facturables y 5,5 semanas sin actividad
pasan a los valores ficticios 5, 8, 12 y 6 sin posibilidad de recuperar el
borrador. Esta ayuda alimenta las horas de la calculadora principal.

La recuperación conserva las cuatro cadenas anteriores al primer ejemplo
propio, incluidas precisión, espacios, ceros, vacíos y entradas incompletas.
Se mantiene la primera copia al repetir el ejemplo, editarlo o estimarlo.
«Recuperar mi agenda anterior» restaura el borrador sin estimar ni aplicar,
retira la capacidad, errores y botón de aplicación, consume la copia y devuelve
el foco a los días por semana. Exige volver a estimar antes de usar las horas.
No modifica las horas ya aplicadas a la calculadora; aplicarlas sigue siendo
una acción explícita. Un ejemplo puro no se presenta como borrador propio.

La guía de horas explica el recorrido y que esta copia se pierde al salir o
recargar. Sin cambios en fórmulas, redondeos, parámetros, campos, peticiones,
almacenamiento persistente o eventos. El cálculo principal y su mecanismo de
aplicación permanecen intactos, igual que anuncios, piloto y seguimientos.
La publicación usa la integración Git existente de Vercel.

Validación: cinco regresiones nuevas fallaban contra el original por faltar
la recuperación; después pasan las diez pruebas de agenda y recuperación.
Suite completa: 848 pruebas en 83 archivos, lint y compilación correctos.
Se verifican valores incompletos, ceros, copia inicial, nuevos ciclos, foco,
ausencia de almacenamiento y envíos, y el formulario principal sin submit.

Navegador local: agenda 4 días × 4 h, 4,8 h no facturables y 7 semanas sin
actividad. Tras aplicar las 107 h del ejemplo y reabrir, se recuperan las
cuatro cadenas exactas, sin capacidad ni botón de aplicación. El cálculo
principal sigue en 107 h; estimar de nuevo ofrece 42 h y solo aplicarlas
explícitamente cambia ese campo y cierra la ayuda. La guía muestra las nuevas
instrucciones. Sin errores de consola. Esta es la versión validada en local
que el usuario ha autorizado publicar.

### Horas que cubre un precio cerrado de encargo (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026. La comparación de un encargo
mostraba el desfase económico frente a la referencia, pero exigía hacer otra
cuenta para revisar el alcance manteniendo un precio fijo. Ahora muestra las
horas que cubre ese precio y cuánto excede la estimación ese límite. Reutiliza
el precio y las horas existentes, antes del plan mensual.

`projectTimeReference` deriva la cuenta inversa de la referencia completa:
precio en céntimos × capacidad en centésimas de hora ÷ facturación en céntimos.
La división entera con BigInt redondea hacia abajo, sin usar la tarifa por hora
mostrada. El exceso es la diferencia positiva de las horas previstas con ese
límite. Con 600 EUR, 30 h y referencia de 2687,65 EUR / 100 h se obtienen
22,32 h cubiertas y 7,68 h de exceso. No se limita el resultado a la capacidad
mensual: la disponibilidad se revisa por separado en el plan existente.

Con capacidad cero no se inventa un límite. Un límite calculado de cero advierte
que no se cubren ni 0,01 h. Una salida fuera de la escala numérica segura se
omite con un aviso, sin invalidar los demás resultados. Editar retira las cifras;
una nueva referencia actualiza también este límite. La interfaz explica las
horas decimales, el redondeo hacia abajo y que no reserva agenda ni añade costes
específicos, calcula neto o decide la aceptación.

La guía de 3000 EUR amplía su ejemplo con 40,48 h cubiertas por 2100 EUR y
19,52 h de exceso si el encargo ocupa 60 h, con cuenta derivada del mismo motor.
Su fecha visible y esquema ya son del 1 de noviembre y se mantienen. Sin nuevos
campos, rutas, parámetros compartidos, almacenamiento ni eventos. Anuncios,
piloto, seguimientos y cálculo principal intactos. La publicación usa la integración Git existente de Vercel.

Validación: 18 regresiones matemáticas fallaron antes de añadir la salida y
las 28 previas seguían pasando; después pasan las 46. La interfaz reprodujo
cinco fallos por faltar el nuevo límite y luego pasan sus diez pruebas. Se
comprueban límites y +0,01 h, normalización, capacidad cero, salida menor de
0,01 h y salida fuera de escala sin perder las cuentas existentes. Suite
completa: 843 pruebas en 82 archivos, lint y compilación correctos.

Navegador local: el caso de 600 EUR / 30 h muestra 22,32 h y 7,68 h de exceso;
editar retira las cifras y 900 EUR da 33,48 h, sin exceso. Se mantienen los dos
campos, el resultado principal y el resumen compartido. La guía muestra 40,48 h
y 19,52 h para 60 h tanto en el texto inicial como en la ayuda interactiva.
Sin errores de consola. Esta es la versión validada en local que el usuario ha autorizado publicar.

### Recuperar los tres meses propios después de probar el ejemplo (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026. Se reproduce otra pérdida
de datos en `CashFlowPlanner`: «Probar tres meses ficticios» sustituye el saldo
inicial y los seis importes mensuales. La recuperación publicada para caja
por fechas pertenece a `CashDatePlanner` y no cubre este plan mensual.

La mejora conserva las siete cadenas anteriores al primer ejemplo propio,
incluidos saldo negativo, ceros, precisión, importes incompletos y vacíos.
La copia se mantiene al editar, comprobar o repetir el ejemplo. «Recuperar mis
tres meses anteriores» restaura el borrador, consume la copia y retira los
saldos, errores y marca ficticia; devuelve el foco al saldo inicial y pide
volver a comprobar. Un nuevo borrador permite otro ciclo. Empezar vacío y
repetir solo el ejemplo no crea una copia propia; escribir cero sí cuenta.

La guía de costes explica la recuperación de esta ayuda y su límite temporal:
solo en la página actual, hasta salir o recargar. No añade guardado en archivo
al plan de tres meses. El comprobador por fechas, sus archivos y su recuperación
permanecen intactos. No hay nuevos campos, rutas, peticiones, almacenamiento
persistente ni eventos; no cambian fórmulas, fechas editoriales, anuncios,
piloto ni seguimientos. La publicación usa la integración Git existente de Vercel.

Validación: cinco regresiones nuevas, cuatro fallando contra el componente
original por faltar la recuperación; después pasan las diez pruebas del plan
y su recuperación. Suite completa: 822 pruebas en 82 archivos; lint y compilación
correctos. Navegador local: saldo -125,005 EUR y seis importes, con cero y un
pago vacío; cargar el ejemplo, editarlo, comprobarlo y repetirlo conserva la
primera copia. Se recuperan las siete cadenas exactas, sin resultados antiguos,
con foco en el saldo inicial y sin errores de consola. La copia se consume.
Esta es la versión validada en local que el usuario ha autorizado publicar.

### Recuperar la jornada propia después de probar ejemplos (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026. Reproducción en navegador:
en la ayuda de tarifa diaria se introducen referencia 37,125 EUR/h, jornada
de 5,5 h, preparación de 1,25 h, cierre de 0,5 h y costes de 42,75 EUR, dejando
vacío el precio opcional. «Probar el ejemplo con costes» sustituía los seis
campos por los ficticios sin permitir recuperar el borrador.

`DayRatePlanner` conserva ahora las seis cadenas anteriores al primer ejemplo
propio, sin interpretar ni redondear. La misma copia sobrevive a los dos botones
de ejemplo, ediciones y comprobaciones. «Recuperar mi jornada anterior» restaura
los campos, consume la copia y limpia resultado, errores y marca de ejemplo;
enfoca la referencia por hora y pide volver a comprobar. Una nueva edición
puede iniciar otro ciclo. Empezar vacío y alternar solo los ejemplos no crea
una copia propia; un cero escrito sí cuenta como dato.

El aviso junto al botón explica que recuperar sustituye los cambios actuales
y que la copia se pierde al salir. La guía añade las mismas instrucciones.
No hay almacenamiento persistente, peticiones, parámetros nuevos ni eventos.
Las fórmulas, referencias fiscales, fechas editoriales, anuncios, piloto y
seguimientos no cambian. La publicación usa la integración Git existente de Vercel.

Regresión reproducida con cinco pruebas nuevas: cuatro fallaban en el componente
original por faltar la recuperación y una confirmaba el inicio vacío. Tras el
cambio pasan las doce pruebas de jornada y recuperación, incluidos valores
incompletos, espacios, coma decimal, precio vacío, foco y ausencia de envíos.
Las consultas de resultado existentes se acotan por su nombre accesible para
distinguir el nuevo aviso de recuperación.

Validación final: 817 pruebas en 81 archivos, lint y compilación correctos.
En navegador local se recuperan exactamente los seis campos de la reproducción
después de cargar el primer ejemplo, editarlo, comprobarlo y cargar el de costes.
El precio opcional sigue vacío, la referencia mantiene sus tres decimales, no
queda un resultado anterior y la copia se consume. El foco vuelve al primer
campo; el aviso pide volver a comprobar. Sin errores de consola. Esta es la
versión validada en local que el usuario ha autorizado publicar.

### Comparar el precio de un encargo antes del plan mensual (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026. El acceso «Tengo un precio para
un encargo» llevaba a una ayuda que comenzaba por cuántos encargos completos
se necesitaban durante el mes. Con el precio y las horas ya disponibles, ahora
se muestra primero «Qué supone este encargo»: facturación por hora, referencia
proporcional para sus horas y diferencia frente al precio indicado. Después
se conserva el plan mensual existente.

`lib/projectCapacity.ts` amplía el resultado sin cambiar las cuentas mensuales:
precio por hora del encargo, referencia y diferencia. La referencia reparte
la facturación mensual entre la capacidad del mes y la aplica al tiempo del
encargo; se redondea al céntimo superior. La división entera exacta evita usar
la tarifa por hora redondeada. El caso ficticio de 600 EUR y 30 horas frente
a 2687,65 EUR y 100 horas mensuales da 20 EUR/h, 806,30 EUR de referencia y
206,30 EUR por debajo. Multiplicar 26,88 EUR/h por 30 daría otros 10 céntimos.

Con capacidad mensual normalizada a cero se mantiene el precio por hora del
encargo, sin inventar referencia o diferencia. Las salidas fuera de la escala
de céntimos segura se rechazan. La interfaz distingue esta comparación de
beneficio neto, no añade costes específicos ni decide si conviene aceptar.
Editar retira las cifras y volver a comprobar usa los datos actuales. Los
encabezados se adaptan a la guía y al resultado principal.

La guía de 3000 EUR incorpora la comparación estática de sus encargos de 40 y
60 horas. Su fecha visible, esquema y entrada de sitemap pasan al 1 de noviembre
por esta ampliación de contenido. El selector describe primero la comparación
del precio y después el plan mensual, conservando su acceso existente.
No hay nuevos campos, rutas, eventos o datos
en el enlace compartido; el cálculo principal, anuncios, piloto y seguimientos
permanecen intactos. La publicación usa la integración Git existente de Vercel.

Validación: 812 pruebas en 80 archivos, lint y compilación de producción
correctos. Tras ajustar la descripción del selector, pasan sus tres pruebas,
su lint y la nueva compilación. Navegador local: entrada desde el selector,
comparación con 600 EUR / 30 h, edición a 900 EUR retirando el resultado previo,
plan mensual conservado y resumen compartido sin cambios. El ejemplo de la
guía muestra 52,50 EUR/h, referencia de 2074,71 EUR y diferencia de 25,29 EUR;
encabezados h3 en la guía y h4 dentro del resultado. Sin errores de consola.

### Aclarar qué conserva el enlace compartido (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026: aclaración del alcance del
enlace compartido, con anuncios, piloto y seguimientos intactos. Junto al resumen
y las opciones para compartir se indica que conserva el cálculo principal, pero no
los datos de las ayudas; se citan el encargo y la combinación de servicios.
La nota queda asociada al área de texto mediante `aria-describedby`.

Solo cambia la explicación del alcance: no se modifican el contenido del
resumen, el enlace, sus parámetros, los canales de envío ni el almacenamiento.
No cambian fórmulas, eventos, anuncios, piloto o seguimientos.

Validación: 25 pruebas existentes de coherencia del resultado, encargos y
servicios combinados, lint y compilación correctos. Las pruebas comprueban
que las ayudas no alteran el resumen ni el enlace compartido. En navegador
se revisa la nota junto al resumen y los canales, su descripción accesible,
la conservación del texto compartido y el resultado del ejemplo ficticio
de 1800 EUR netos: 2687,65 EUR/mes y 26,88 EUR/h. Sin errores en la consola
revisada.

### Acceso a precio y horas de un encargo desde el selector (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026: acceso para valorar un
encargo desde el selector, con anuncios, piloto y seguimientos intactos.
«Antes de aceptar» incorpora
la tarjeta «Tengo un precio para un encargo», con acceso directo al comprobador
existente en `/cuanto-facturar-autonomo-3000-euros#plan-encargos`.
Se indica preparar el precio total sin IVA y todas las horas, y se explica
que la ayuda comprueba encargos iguales frente al objetivo y capacidad del mes.

La tarjeta identifica la referencia ficticia de 3000 EUR netos de la guía y
explica cómo usar el comprobador desde un resultado propio. Un segundo enlace
lleva a la calculadora para preparar esa referencia. El selector mantiene sus
cuatro grupos, ahora con nueve decisiones, y continúa funcionando como HTML
sin formulario ni JavaScript. No se crea una herramienta o ruta nueva ni se
trasladan datos al destino.

Es una mejora de acceso: no cambia el comprobador, el motor, los valores,
las fórmulas, los eventos, anuncios, piloto o seguimientos. Se conservan las
fechas editoriales de las guías y sitemap.

Validación: 12 pruebas existentes del selector, comprobador y guía, lint y
compilación correctos. Las pruebas recorren todos los enlaces del selector
contra las secciones del HTML real de destino. En navegador se sigue la nueva
tarjeta hasta el mismo comprobador, con sus campos vacíos y referencia de
4149,41 EUR sin IVA y 80 horas. El caso ficticio de 600 EUR y 30 horas calcula
7 encargos y 210 horas, de los que caben 2; también se comprueba el acceso a
la calculadora para obtener una referencia propia. Sin errores en la consola
revisada.

### Aclarar la reserva manual de IRPF (1 de noviembre de 2026)

Publicación autorizada el 1 de noviembre de 2026: aclaración de la reserva
manual de IRPF, con anuncios, piloto y seguimientos intactos. El campo «IRPF
manual (%)» pasa a llamarse «Reserva de IRPF para la simulación (%)». El texto del modo
manual identifica su uso para estimar la facturación. Junto al porcentaje
se explica que es una reserva elegida para la simulación, no la retención
de una factura, y que no determina el tipo de IRPF que corresponde.

La ayuda permanece asociada al campo mediante `aria-describedby`; al validar,
se añade también la referencia al error. `aria-labelledby` mantiene un nombre
accesible breve. No cambian valores, fórmulas, validaciones, parámetros del
GET, eventos, anuncios, piloto o seguimientos.

Validación: 39 pruebas existentes del formulario y coherencia del resultado,
lint y compilación correctos. Solo se actualizan en las pruebas los nombres
del control. En navegador, el ejemplo ficticio de 1800 EUR netos, 250 EUR de
gastos, 100 horas, reserva manual del 15 % y cuota de 320 EUR conserva
2687,65 EUR/mes y 26,88 EUR/h. Con un porcentaje de 100 se mantienen la ayuda
y el error en la descripción accesible y el foco vuelve al campo. Sin errores
en la consola revisada.

### Recuperar la combinación de servicios tras probar el ejemplo (31 de octubre de 2026)

Publicación autorizada el 31 de octubre de 2026: recuperación de servicios
combinados tras probar el ejemplo y guía de 3000 EUR actualizada, con anuncios,
piloto y seguimientos intactos. «Probar dos servicios ficticios» sustituía hasta ocho
grupos propios (24 campos) sin permitir volver al borrador, incluso cuando
contenía datos incompletos que todavía no se podían comprobar.

`MonthlyPortfolioPlanner.tsx` conserva los grupos anteriores al primer ejemplo,
con sus textos exactos, orden e identificadores. Repetir el ejemplo, editarlo,
añadir o quitar grupos y comprobarlo no reemplaza esa copia. «Recuperar mi
combinación anterior» sustituye los cambios actuales, retira los resultados y
la marca de ejemplo, consume la copia y enfoca la primera cantidad. Hay que
volver a comprobar los datos para obtener cifras nuevas. Un nuevo ciclo de
ejemplo conserva el borrador que exista en ese momento.

La copia solo permanece en memoria mientras se utiliza la página; cambiar
el cálculo de referencia reinicia el editor y su recuperación. La nota del
botón y la guía de 3000 EUR explican estos límites. No se añaden almacenamiento,
peticiones, eventos ni campos al GET, y no cambian el motor, el resultado
principal o su enlace. Anuncios, piloto y seguimientos permanecen intactos.

Validación: 796 pruebas en 80 archivos correctas con dos procesos de pruebas,
sin ampliar los tiempos de espera. Lint y compilación correctos. Las siete
regresiones nuevas fallaban antes del arreglo y cubren los 24 campos, texto
incompleto o malformado, ejemplos repetidos, ediciones, comprobaciones, ciclos
nuevos, reinicio por referencia y foco. En navegador se recuperan exactamente
123,456 EUR, 1,005 horas y un segundo grupo incompleto tras editar y repetir
el ejemplo. Desde el resultado principal, la copia sobrevive a borrar y
restablecer las horas; el resultado y el resumen compartido siguen iguales.
No se observan errores en la consola revisada.

### Vista previa compartida con los mismos datos que la calculadora (31 de octubre de 2026)

Publicación autorizada el 1 de noviembre de 2026: corrección de la vista previa
compartida, con anuncios, piloto y seguimientos intactos. La imagen tenía un lector
de números independiente y calculaba sin validar. Con un neto de `2.500,50`,
reserva manual del 15 %, cuota de 320 EUR y 80 horas, la página obtenía
3461,76 EUR/mes y 43,27 EUR/h, pero la imagen sustituía el neto por 1500 EUR y
mostraba 2284,71 EUR/mes y 28,56 EUR/h. Con horas cero o fraccionarias, la
página pedía corregirlas mientras la imagen las ajustaba y anunciaba cifras.

`lib/calculatorQuery.ts` comparte valores iniciales, modos permitidos,
interpretación y validación de la query entre portada e imagen. Los números
válidos se representan con punto decimal para mostrarse en los campos nativos,
sin redondear su valor. Los vacíos y formatos malformados no se sustituyen por
ceros o valores iniciales. Se conserva la primera aparición de un parámetro
duplicado y se respetan los campos inactivos de cada modo.

La ruta de la imagen valida antes de calcular y reutiliza la imagen genérica
existente si hay errores o resultados no finitos. La portada aplica un criterio
separado a sus metadatos sociales; conserva el estado de envío que muestra los
errores del formulario. No se cambia el motor, las condiciones de seguimiento,
la configuración, los anuncios, el piloto ni los seguimientos existentes.

Validación: 788 pruebas en 79 archivos, lint y compilación correctos. La ruta
anterior fallaba en doce regresiones; se cubren formatos españoles, vacíos,
límites activos, campos inactivos, duplicados y enlaces canónicos. Se comprueba
también que los metadatos genéricos no alteran los indicadores de envío y
seguimiento existentes. Las respuestas HTTP reales devuelven PNG de 1200 ×
630: el neto `2.500,50` muestra 3461,76 EUR/mes y 43,27 EUR/h; con 80,5 horas
la respuesta es la imagen genérica sin cifras de resultado. Ambas imágenes
se revisan visualmente. En navegador, el neto aparece como 2500.5 en su campo,
el resultado coincide con la imagen y las horas fraccionarias mantienen el
error sin resultado. La consola revisada no muestra errores.

Comprobación previa a la publicación: las 50 pruebas de lectura de parámetros,
imagen y portada vuelven a pasar. La batería completa de 796 pruebas, lint y
compilación ya se habían validado con este mismo código de la vista previa.

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
