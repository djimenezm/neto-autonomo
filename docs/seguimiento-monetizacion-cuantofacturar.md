# Seguimiento de monetizacion de cuantofacturar.es

Documento de trabajo para revisar datos paso a paso. La idea es que Codex use esta plantilla para preguntar al usuario lo justo, tomar una decision pequena y evitar tocar demasiadas cosas a la vez.

## Regla principal

No proponer cambios nuevos en la web hasta tener datos suficientes del cambio anterior o una senal clara de bloqueo.

Preferencia:
- Mirar datos.
- Hacer una pregunta concreta.
- Elegir una sola accion.
- Medir de nuevo.

## Preguntas base para cada revision

1. Desde que fecha estamos midiendo?
2. Cuantos clics nuevos ha traido Google Ads?
3. Cuanto se ha gastado en ese periodo?
4. Cuantas conversiones principales hay en Google Ads?
5. Cuantos eventos `result_kit_cta_clicked` hay?
6. Cuantas visitas o conversiones hay en `/gracias-kit-tarifa`?
7. Que terminos de busqueda principales han activado anuncios?

## Ficha de revision

Fecha de revision:

Periodo analizado:

Clics de Google Ads:

Coste:

CPC medio:

Conversiones principales:

Coste por lead:

Eventos `result_kit_cta_clicked`:

Ratio clic CTA / clic Ads:

Visitas a `/gracias-kit-tarifa`:

Terminos de busqueda relevantes:

Terminos de busqueda dudosos o malos:

Decision tomada:

Proximo dato que necesitamos:

## Como decidir

Si hay leads:
- Calcular coste por lead.
- Si el coste por lead parece razonable, mantener la campana y preparar una monetizacion suave.
- No cambiar CTA ni formulario en la misma revision salvo que haya un problema evidente.

Si hay clics en `result_kit_cta_clicked` pero pocos leads:
- El CTA despierta interes.
- Revisar solo el formulario, la promesa del kit o la friccion de entrega.

Si casi nadie hace clic en `result_kit_cta_clicked`:
- El problema probablemente esta en el mensaje posterior al resultado.
- Revisar solo el texto del CTA, su posicion o su relacion con el calculo mostrado.

Si no hay conversiones y tampoco hay datos suficientes:
- Esperar mas clics antes de tocar nada.
- Referencia minima orientativa: 100 a 150 clics nuevos despues del cambio.

Si los terminos de busqueda no encajan:
- Anadir negativas o ajustar enfoque de campana antes de tocar la web.

## Ruta de monetizacion si empiezan a entrar leads

Orden recomendado:
1. Mejorar pagina de gracias con recomendaciones naturales y medibles.
2. Preparar email posterior sencillo, util y no agresivo.
3. Valorar afiliados naturales para autonomos en Espana.
4. Valorar una oferta pequena de pago solo si hay senales de interes real.

## Primera pregunta pendiente

Cuando el usuario quiera revisar datos, pedir primero:

"Desde que fecha se publico el CTA `result_kit_cta_clicked` y cuantos clics de Google Ads han entrado desde entonces?"

## Nota de referencia inicial

El usuario no recuerda la fecha exacta de publicacion del CTA, pero indica que fue por lo menos hace dos semanas. A fecha 18 de mayo de 2026, usar como referencia provisional el periodo desde el 4 de mayo de 2026 hasta hoy, salvo que aparezca una fecha mas precisa.

## Revision 18 de mayo de 2026

Periodo visto en captura: aproximadamente del 11 al 18 de mayo de 2026.

Clics de Google Ads: 359

Impresiones: 10,3 mil

CPC medio: 0,11 EUR

Coste: 41,26 EUR

Lectura inicial:
- Hay muestra suficiente para revisar conversiones y comportamiento.
- El CPC es muy barato.
- Falta comprobar si esos clics llegan a lead o al menos hacen clic en el CTA del kit.

Siguiente pregunta:

"En ese mismo periodo, cuantas conversiones principales aparecen como `Envio de formulario para clientes potenciales`?"

Dato recibido:
- La tabla muestra 294,00 en `Todas las conversiones`.
- La tabla muestra 165,00 en `Conversiones`.
- La unica accion desglosada visible es `Vista de una pagina`.

Lectura:
- En esta captura no aparece la accion `Envio de formulario para clientes potenciales`.
- Hay que comprobar si la campana sigue optimizando o reportando como conversion principal la accion antigua `Vista de una pagina`.
- No tocar la web todavia; primero limpiar la lectura de conversiones en Google Ads.

Siguiente pregunta:

"En Herramientas > Conversiones, que estado y objetivo tiene `Envio de formulario para clientes potenciales`, y que estado tiene `Vista de una pagina`? Necesitamos ver si `Vista de una pagina` sigue como principal."

Dato recibido:
- `Envio de formulario para clientes potenciales`: activo, optimizacion de acciones `Principales`, todas las conversiones 0,00, estado `No hay conversiones recientes`.
- `Vista de una pagina`: optimizacion de acciones `Secundario`, todas las conversiones 294,00, estado activo dentro de un objetivo con `Configuracion erronea`.

Lectura actual:
- La conversion buena parece configurada correctamente como principal.
- La conversion antigua de vista de pagina ya aparece como secundaria.
- El problema actual no parece ser que Google Ads este usando la conversion equivocada para pujar.
- De momento hay 0 leads atribuidos a la accion principal.

Siguiente pregunta:

"En Analytics o en el panel de eventos, cuantos eventos `result_kit_cta_clicked` hay en el mismo periodo? Si hay bastantes clics y 0 leads, miraremos formulario/oferta. Si hay pocos clics, miraremos el mensaje del CTA."

Nota tecnica:
- El evento `result_kit_cta_clicked` se envia actualmente con `window.va`, es decir, a Vercel Web Analytics.
- No se envia actualmente con `gtag`, asi que puede no aparecer en Google Ads ni en GA4.
- Para esta revision, buscarlo primero en Vercel Analytics > Events.

Actualizacion 18 de mayo de 2026:
- Vercel Analytics no muestra eventos personalizados sin plan Pro.
- Se decide no pagar Pro solo para este dato.
- Se actualiza el CTA para enviar `result_kit_cta_clicked` tambien con `window.gtag`.
- A partir del proximo despliegue, medir los clics del CTA desde Google/Tag Assistant en lugar de depender de Vercel Events.

Actualizacion posterior:
- Tag Assistant confirma que `result_kit_cta_clicked` aparece al pulsar el CTA del kit.
- Durante la prueba, el envio del formulario falla porque `formsubmit.co` devuelve error 522 / timeout.
- Se recomienda pausar Google Ads hasta sustituir FormSubmit o anadir un mecanismo de captura mas fiable.
- El usuario confirma que la campana `Search - Calculadora autonomos` queda en pausa.
- El usuario crea formulario en Brevo para la lista `Kit tarifa autonomos - Cuanto Facturar`.
- Se sustituye el envio a FormSubmit por el endpoint de Brevo `2caafd8d.sibforms.com`.
- El formulario redirige correctamente a `/gracias-kit-tarifa`.
- Brevo muestra el email de prueba dentro de la lista del kit.
- Embudo de captacion reparado; siguiente paso recomendado: reactivar Google Ads con presupuesto bajo y observar leads reales.
- El usuario confirma que la campana se reactiva despues de validar el nuevo formulario.
- Se crea y conecta la plantilla de email `Entrega kit tarifa autonomos`.
- El formulario queda con confirmacion simple por email y redireccion a `/gracias-kit-tarifa`.
- Prueba real confirmada: el usuario recibe el email del kit correctamente.

## Revision 19 de mayo de 2026

Primer dato despues de sustituir FormSubmit por Brevo y reactivar la campana.

Clics: 150

Impresiones: 4,67 mil

CPC medio: 0,02 EUR

Coste: 3,63 EUR

Lectura:
- El trafico es extremadamente barato.
- Ya hay muestra suficiente para comprobar si hay contactos nuevos en Brevo.
- Antes de tocar web o campana, revisar contactos reales y conversiones de `/gracias-kit-tarifa`.

Siguiente pregunta:

"En Brevo, cuantos contactos nuevos hay en la lista `Kit tarifa autonomos - Cuanto Facturar` desde que se reactivo la campana?"

Dato recibido:
- Google Ads muestra 150 clics, 4.665 impresiones, 3,63 EUR de coste y 0 conversiones principales.
- Brevo muestra 1 contacto en la lista del kit, aparentemente el contacto de prueba.
- No hay leads nuevos con esta muestra inicial.

Lectura:
- El formulario y el email funcionan, pero el trafico nuevo no esta convirtiendo.
- La campana aparece como tipo `Maximo rendimiento`, no como una busqueda pura.
- Antes de tocar el formulario, revisar terminos/canales de trafico y calidad de la campana.

Dato de terminos:
- En el periodo amplio, solo aparecen pocos terminos visibles con clics.
- Terminos visibles con clics: `calculadora salario neto espana`, `calcular nomina autonomo`, `cuanto cotiza un autonomo`, `cuanto pagan los autonomos en espana`, `cuotas de autonomos`, `cuotas de autonomos 2026`, `tarifas autonomos 2026`.
- Total campana: 361 clics.
- Total terminos visibles: 7 clics.
- Total otros terminos: 7 clics.

Lectura:
- La mayoria de clics no queda explicada por terminos de busqueda visibles.
- Esto refuerza que la campana de Maximo rendimiento puede estar captando trafico barato fuera de busqueda pura o con poca trazabilidad.
- No escalar presupuesto hasta tener leads reales.

Actualizacion:
- Se pausa la campana de Maximo rendimiento `Search - Calculadora autonomos`.
- Se crea una campana nueva de busqueda pura: `Search - Leads calculadora autonomos`.
- Objetivo: clientes potenciales / envio de formularios.
- Redes: sin partners de busqueda y sin Display.
- Ubicacion: Espana.
- Idioma: espanol.
- AI Max desactivado.
- Presupuesto: 5 EUR/dia.
- Estado inicial visto: activa, tipo `Busqueda`, estrategia de puja en fase de aprendizaje.

## Revision 27 de mayo de 2026

Captura con periodo mostrado como 26 de mayo de 2026.

Campana: `Search - Leads calculadora autonomos`

Clics: 13

Impresiones: 250

CPC medio: 0,76 EUR

Coste: 9,92 EUR

Aviso visible: `Estas llegando a menos busquedas`.

Lectura:
- La campana de busqueda pura tiene mucho menos volumen y CPC bastante mas alto que Maximo rendimiento, lo esperable al quitar trafico de baja trazabilidad.
- CTR aproximado: 5,2 %, razonable para una primera campana de busqueda.
- Antes de tocar presupuesto o palabras clave, comprobar contactos nuevos en Brevo y terminos de busqueda.

Dato adicional recibido:
- El usuario confirma que no hay contactos nuevos en Brevo.
- CSV `Informe de campana.csv` del 27 de mayo de 2026:
  - Campana: `Search - Leads calculadora autonomos`
  - Estado: habilitada / apto
  - Tipo: buscar
  - Clics: 4
  - Impresiones: 92
  - CTR: 4,35 %
  - CPC medio: 0,84 EUR
  - Coste: 3,35 EUR
  - Conversiones: 0

Lectura:
- El informe adjunto es un informe agregado de campana, no de terminos de busqueda.
- No hay contactos nuevos ni conversiones, pero la muestra sigue siendo baja.
- Siguiente paso: revisar terminos de busqueda reales antes de tocar web o formulario.

Dato adicional de palabras clave:
- CSV `Informe de palabras clave de busqueda.csv` del 27 de mayo de 2026.
- La unica palabra clave con clics es `"cuanto cobrar como autonomo"`:
  - Concordancia: frase.
  - Estado: apto.
  - Clics: 4.
  - Impresiones: 97.
  - CTR: 4,12 %.
  - CPC medio: 0,84 EUR.
  - Coste: 3,35 EUR.
  - Conversiones: 0.
- Varias palabras clave relevantes aparecen como `No apto` / `no suele publicarse`, por bajo volumen o poca elegibilidad.

Lectura:
- El trafico actual depende casi por completo de una sola keyword de intencion razonable pero amplia.
- La campana necesita mas volumen controlado antes de decidir sobre landing/formulario.
- Siguiente microaccion posible: ampliar palabras clave con variantes de alta intencion y mantener presupuesto bajo.

Actualizacion:
- Se anaden nuevas palabras clave en concordancia de frase:
  - `cuanto cobrar como freelance`
  - `cuanto cobrar por hora autonomo`
  - `cuanto facturar para ganar 2000`
  - `cuanto facturar para ganar 1500`
  - `calculadora sueldo neto autonomo`
  - `calculadora ingresos autonomo`
  - `cuanto tengo que facturar como autonomo`
  - `calcular tarifa hora autonomo`
- El nuevo informe confirma que estan anadidas.
- Varias quedan `Pendiente / en revision` o `No apto / no suele publicarse`; normal justo tras anadirlas y por bajo volumen.
- No tocar presupuesto ni landing hasta ver datos tras la revision.

## Revision 1 de junio de 2026

Captura con periodo `Hoy`, 1 de junio de 2026.

Campana: `Search - Leads calculadora autonomos`

Clics: 7

Impresiones: 197

CTR: 3,55 %

CPC medio: 0,79 EUR

Coste: 5,56 EUR

Conversiones: 0

Lectura:
- La campana de busqueda esta activa y recibiendo trafico.
- No hay conversiones hoy, pero 7 clics no son muestra suficiente para cambiar landing o formulario.
- Google recomienda activar AI Max y concordancia amplia; no aplicar de momento para mantener control.
- Siguiente dato clave: contactos nuevos en Brevo y vista de ultimos 7 dias, no solo hoy.

Dato Brevo:
- La lista `Kit tarifa autonomos - Cuanto Facturar` sigue con 1 contacto.
- Ese contacto corresponde al test inicial, asi que no hay leads nuevos confirmados.

Lectura:
- Con 7 clics hoy y sin leads nuevos, no tocar web todavia.
- Revisar periodo de ultimos 7 dias y terminos de busqueda antes de decidir si ampliar keywords, pausar alguna o ajustar copy.

Dato ultimos 7 dias:
- Periodo: 25 a 31 de mayo de 2026.
- Campana: `Search - Leads calculadora autonomos`.
- Clics: 75.
- Impresiones: 2.489.
- CTR: 3,01 %.
- CPC medio: 0,74 EUR.
- Coste: 55,55 EUR.
- Conversiones: 0.
- Brevo sigue con 1 contacto total, sin leads nuevos confirmados.

Lectura:
- 75 clics y 0 leads ya es senal suficiente para parar y diagnosticar antes de gastar mas.
- No aplicar recomendaciones de AI Max ni concordancia amplia.
- Siguiente paso: pausar temporalmente la campana y revisar terminos de busqueda de los ultimos 7 dias.

Dato adicional de terminos de busqueda:
- Archivo revisado: `Informe de terminos de busqueda.xlsx`.
- Periodo: 25 a 31 de mayo de 2026.
- Total campana:
  - Clics: 75.
  - Impresiones: 2.489.
  - Coste: 55,55 EUR.
  - Conversiones: 0.
- Google solo desglosa 15 clics / 9,00 EUR en terminos visibles.
- Los otros 60 clics / 46,55 EUR aparecen agrupados como `Otros terminos de busqueda`.
- Terminos visibles con clics:
  - `calculadora precio hora autonomo`: 1 clic, 1,48 EUR.
  - `cuota de autonomos`: 2 clics, 1,23 EUR.
  - `precio autonomo`: 1 clic, 1,10 EUR.
  - `cuanto paga un autonomo de seguridad social`: 1 clic, 0,67 EUR.
  - `calculo impuestos autonomo`: 1 clic, 0,62 EUR.
  - `pluriactividad en espana`: 1 clic, 0,60 EUR.
  - `registrarse como autonomo en espana`: 1 clic, 0,57 EUR.
  - `cuanto cuesta hacerse autonomo`: 1 clic, 0,55 EUR.
  - `que paga un autonomo de seguridad social`: 1 clic, 0,50 EUR.
  - `cuanto se paga de autonomo`: 1 clic, 0,41 EUR.
  - `cuanto pagaria de autonomo`: 1 clic, 0,39 EUR.
  - `gastos de un autonomo`: 1 clic, 0,36 EUR.
  - `cuanto paga un autonomo en espana de irpf`: 1 clic, 0,29 EUR.
  - `tabla cuota autonomos 2026`: 1 clic, 0,23 EUR.

Lectura:
- La mayoria de terminos visibles apuntan a cuota, seguridad social, alta de autonomo, impuestos o tarifa plana.
- Esa intencion no encaja bien con el lead magnet de revisar una tarifa antes de enviarla.
- La ausencia de leads no prueba todavia que el formulario falle; la explicacion mas probable es desajuste de trafico/intencion.
- Siguiente microaccion recomendada: mantener la campana pausada, anadir negativas de intencion baja y revisar si existen palabras clave en concordancia amplia antes de reactivar.

Dato adicional de negativas:
- Archivo revisado: `Informe de palabras clave negativas.xlsx`.
- Las negativas estan anadidas a nivel de campana en `Search - Leads calculadora autonomos`.
- Total de negativas detectadas: 22.
- Se ven negativas alineadas con el diagnostico: cuota, cuotas, seguridad social, tarifa plana, darse de alta, hacerse autonomo, registrarse, registrar, registro, societario, pluriactividad, ayudas, base reguladora, cotizaciones, reta.
- Tambien aparecen negativas mas especificas: `cuota de autonomo`, `cuota autonomo`, `seguridad social autonomo`, `cuanto pagan los autonomos`, `cuanto paga un autonomo`.

Lectura:
- La configuracion principal es correcta y reduce trafico de coste/cuota/tramites.
- Conviene quitar `autonomo al mes` antes de reactivar, porque podria bloquear busquedas utiles como `cuanto facturar autonomo al mes`.
- Revisar mas adelante si `empresa` bloquea busquedas utiles, aunque de momento no es critico.

## Revision 15 de junio de 2026

Campana: `Search - Leads calculadora autonomos`

Datos vistos en Google Ads:
- Clics: 43.
- Impresiones: 1.637.
- CTR: 2,63 %.
- CPC medio: 0,78 EUR.
- Coste: 33,70 EUR.
- Conversiones: 0.

Dato del dia 15 de junio de 2026:
- Clics: 8.
- Impresiones: 265.
- CTR: 3,02 %.
- CPC medio: 0,88 EUR.
- Coste: 7,05 EUR.
- Conversiones: 0.

Dato Brevo:
- La lista `Kit tarifa autonomos - Cuanto Facturar` sigue con 1 contacto.
- Ese contacto corresponde al test inicial, asi que no hay leads nuevos confirmados.

Lectura:
- Tras limpiar negativas, la campana sigue gastando sin captar emails.
- No parece un problema de entrega de Brevo, porque el formulario ya fue probado y el email llego.
- Siguiente paso: pausar de nuevo la campana y revisar terminos de busqueda del periodo posterior a las negativas antes de tocar la web.

Dato adicional de terminos de busqueda del 15 de junio de 2026:
- Archivo revisado: `Informe de terminos de busqueda.csv`.
- Periodo del informe: 15 de junio de 2026.
- Total campana:
  - Clics: 10.
  - Impresiones: 295.
  - CPC medio: 0,87 EUR.
  - Coste: 8,70 EUR.
  - Conversiones: 0.
- Google solo desglosa 2 clics / 2,57 EUR en terminos visibles.
- Los otros 8 clics / 6,13 EUR aparecen como `Otros terminos de busqueda`.
- Terminos visibles con clics:
  - `factoo cooperativa`: 1 clic, 1,31 EUR.
  - `hacerse autonomo`: 1 clic, 1,26 EUR.
- Terminos visibles con impresiones que muestran mala intencion:
  - `ser autonomo en espana`
  - `cooperativa de autonomos`
  - `contasimple telefono atencion al cliente`
  - `cese actividad autonomos`
  - `asesoria algeciras`
  - `gestoria gandia`
  - `taxfix`
  - `billeo`
  - `hacienda`
  - `autonomos`

Lectura:
- Las negativas anteriores redujeron parte del trafico, pero la campana sigue entrando por concordancia amplia y terminos de baja intencion.
- El problema principal sigue estando en Google Ads, no en Brevo ni necesariamente en la web.
- Siguiente microaccion recomendada: no reactivar todavia; anadir nuevas negativas conservadoras y revisar palabras clave positivas para quitar cualquier concordancia amplia.

Dato adicional de palabras clave y negativas:
- Archivos revisados:
  - `Informe de palabras clave negativas.csv`.
  - `Informe de palabras clave de busqueda (3).csv`.
- Las negativas nuevas estan anadidas a nivel de campana.
- Total de negativas detectadas: 45.
- La campana aparece pausada en el informe.
- Total de palabras clave de la campana el 15 de junio de 2026:
  - Clics: 11.
  - Impresiones: 299.
  - CTR: 3,68 %.
  - CPC medio: 0,88 EUR.
  - Coste: 9,72 EUR.
  - Conversiones: 0.
- Distribucion relevante:
  - `calcular tarifa autonomo`, concordancia amplia: 8 clics, 224 impresiones, 7,48 EUR, 0 conversiones.
  - `"cuanto cobrar como autonomo"`, concordancia de frase: 3 clics, 58 impresiones, 2,24 EUR, 0 conversiones.

Lectura:
- Casi todo el gasto reciente viene de una unica palabra clave en concordancia amplia.
- Esa palabra clave probablemente explica que sigan apareciendo busquedas de cooperativas, gestorias, altas, herramientas y temas alejados del calculo de tarifa.
- Siguiente microaccion recomendada: pausar o retirar `calcular tarifa autonomo` en concordancia amplia y, si se quiere mantener la idea, anadirla solo como frase/exacta.

Dato adicional tras ajuste de palabra clave:
- Archivo revisado: `Informe de palabras clave de busqueda (4).csv`.
- `calcular tarifa autonomo` ya no aparece como concordancia amplia.
- Ahora aparece como:
  - `"calcular tarifa autonomo"` en concordancia de frase.
  - `[calcular tarifa autonomo]` en concordancia exacta.
- Ambas estan habilitadas, pero no aptas mientras la campana siga pausada.

Lectura:
- El ajuste queda correcto.
- Antes de reactivar, la campana ya no deberia usar esa entrada amplia que estaba concentrando gasto de baja calidad.

## Revision 17 de junio de 2026

Archivo revisado: `Informe de grupo de anuncios.csv`.

Periodo del informe: 17 de junio de 2026.

Grupo de anuncios: `Grupo de anuncios 1`

Estado:
- Grupo de anuncios habilitado.
- Estado: apto.
- Tipo: estandar.

Datos:
- Clics: 3.
- Impresiones: 124.
- CTR: 2,42 %.
- CPC medio: 0,78 EUR.
- Coste: 2,35 EUR.
- Conversiones: 0.
- Tasa de conversion: 0,00 %.

Lectura:
- Tras retirar la concordancia amplia problematica, la campana vuelve a recibir algo de trafico.
- La muestra todavia es demasiado pequena para decidir si el cambio ha funcionado.
- No tocar web ni oferta con solo 3 clics nuevos; esperar hasta unos 10-15 EUR de gasto o revisar terminos de busqueda si vuelve a entrar trafico raro.

## Revision 28 de junio de 2026

Archivo revisado: `Informe de campana (1).csv`.

Periodo del informe: 28 de junio de 2026.

Campana: `Search - Leads calculadora autonomos`

Estado:
- Campana habilitada.
- Estado: apto.
- Tipo: busqueda.
- Presupuesto: 5,00 EUR/dia.
- Estrategia: maximizar conversiones.

Datos:
- Clics: 7.
- Impresiones: 69.
- CTR: 10,14 %.
- CPC medio: 1,38 EUR.
- Coste: 9,66 EUR.
- Conversiones: 0.
- Tasa de conversion: 0,00 %.

Dato Brevo:
- La lista `Kit tarifa autonomos - Cuanto Facturar` sigue con 1 contacto.
- No hay leads nuevos confirmados.

Lectura:
- La campana esta activa y recibe trafico, pero vuelve a gastar sin captar emails.
- El CTR es alto, por lo que el anuncio parece atraer clics, pero no sabemos todavia si las busquedas son las correctas.
- El CPC sube respecto a revisiones anteriores, asi que cada prueba cuesta mas.
- Este informe no trae terminos de busqueda; el siguiente paso antes de tocar la web es revisar `Terminos de busqueda` para este mismo periodo o ultimos 7/14 dias.

Dato adicional de terminos de busqueda:
- Archivo revisado: `Informe de terminos de busqueda (1).csv`.
- Periodo del informe: 21 a 27 de junio de 2026.
- Total campana:
  - Clics: 37.
  - Impresiones: 1.103.
  - CTR: 3,35 %.
  - CPC medio: 0,71 EUR.
  - Coste: 26,16 EUR.
  - Conversiones: 0.
- Google desglosa 11 clics / 8,78 EUR en terminos visibles.
- Los otros 26 clics / 17,38 EUR aparecen como `Otros terminos de busqueda`.
- Terminos visibles con clics:
  - `calculadora autonomo espana`: 2 clics, 2,08 EUR.
  - `autonomo precio primer ano`: 1 clic, 2,03 EUR.
  - `autonomo espana cuanto paga`: 1 clic, 0,92 EUR.
  - `coste autonomo primer ano`: 1 clic, 0,72 EUR.
  - `cuanto paga un autonomo al mes en espana`: 1 clic, 0,62 EUR.
  - `cuanto paga un autonomo al mes`: 1 clic, 0,58 EUR.
  - `calcular nomina autonomo`: 1 clic, 0,57 EUR.
  - `calculo autonomos 2026`: 1 clic, 0,55 EUR.
  - `cuanto vale el autonomo en espana`: 1 clic, 0,47 EUR.
  - `cuanto cuesta ser autonomo en espana`: 1 clic, 0,24 EUR.

Lectura:
- Despues de retirar la concordancia amplia problematica, el trafico ha mejorado algo, pero sigue orientado a coste/cuota/alta/lo que paga un autonomo.
- No aparecen clics visibles claros de alta intencion como `cuanto facturar`, `cuanto cobrar por hora`, `tarifa hora freelance` o similares.
- Con 37 clics, 26,16 EUR y 0 leads nuevos, no conviene seguir gastando igual.
- Siguiente microaccion recomendada: pausar la campana y decidir si cerramos mas negativas o cambiamos el enfoque de la landing/oferta para trafico de coste de autonomo.

Dato adicional de negativas:
- Archivo revisado: `Informe de palabras clave negativas (1).csv`.
- Total de negativas detectadas: 57.
- Las negativas estan anadidas a nivel de campana en `Search - Leads calculadora autonomos`.
- Se confirma que se han anadido las nuevas negativas recomendadas:
  - `paga`
  - `pago`
  - `cuesta`
  - `coste`
  - `vale`
  - `primer ano`
  - `nomina` sin y con tilde
  - `ser autonomo` sin y con tilde
  - `darme de alta`
  - `cotizar`

Lectura:
- El filtro de negativas queda aplicado correctamente.
- Como son negativas amplias de una sola palabra, especialmente `vale`, `coste` y `cuesta`, conviene revisarlas si el volumen cae demasiado; de momento son coherentes con el diagnostico de trafico de coste/alta/cuota.

## Revision 1 de julio de 2026

Archivos revisados:
- `Informe de campana (2).csv`.
- `Informe de terminos de busqueda (2).csv`.

Periodo de los informes: 24 a 30 de junio de 2026.

Campana: `Search - Leads calculadora autonomos`

Estado:
- Campana habilitada.
- Estado: apto.
- Presupuesto: 5,00 EUR/dia.
- Tipo: busqueda.
- Estrategia: maximizar conversiones.

Datos de campana:
- Clics: 38.
- Impresiones: 877.
- CTR: 4,33 %.
- CPC medio: 0,96 EUR.
- Coste: 36,41 EUR.
- Conversiones: 0.
- Tasa de conversion: 0,00 %.

Terminos de busqueda:
- Google desglosa 10 clics / 10,20 EUR en terminos visibles.
- Los otros 28 clics / 26,21 EUR aparecen como `Otros terminos de busqueda`.
- Terminos visibles con clics:
  - `autonomo espana precio`: 2 clics, 5,10 EUR.
  - `calculadora autonomo espana`: 2 clics, 2,08 EUR.
  - `coste autonomo primer ano`: 1 clic, 0,72 EUR.
  - `calcular nomina autonomo`: 1 clic, 0,57 EUR.
  - `calculo autonomos 2026`: 1 clic, 0,55 EUR.
  - `cuanto vale el autonomo en espana`: 1 clic, 0,47 EUR.
  - `calculadora impuestos autonomo espana`: 1 clic, 0,47 EUR.
  - `cuanto cuesta ser autonomo en espana`: 1 clic, 0,24 EUR.

Lectura:
- El trafico visible sigue estando centrado en coste, precio, impuestos, nomina y cuanto paga/cuesta ser autonomo.
- Sigue sin aparecer intencion clara de `cuanto facturar`, `cuanto cobrar`, `tarifa hora freelance` o decision de precio de servicio.
- El porcentaje de clics ocultos en `Otros terminos de busqueda` sigue siendo alto: 28 de 38 clics.
- Con 38 clics, 36,41 EUR y 0 conversiones, mantener esta campana igual no parece razonable.
- Siguiente decision recomendada: pausar y elegir entre dos caminos:
  - campana mucho mas estrecha solo con exactas/frases de `cuanto cobrar/facturar/tarifa hora`, aceptando bajo volumen;
  - o crear una ruta/oferta especifica para trafico de `cuanto cuesta ser autonomo`, porque ese parece ser el mercado real que Google esta encontrando.

Decision aplicada:
- Se elige el segundo camino: crear una ruta/oferta especifica para trafico de coste de autonomo.
- Nueva ruta creada: `/cuanto-cuesta-ser-autonomo`.
- Enfoque de la pagina:
  - responder a la duda `cuanto cuesta ser autonomo`;
  - explicar que el coste no es solo la cuota;
  - llevar de forma natural a `cuanto necesitas facturar para cubrirlo`;
  - ofrecer el kit/checklist como siguiente paso para revisar costes y tarifa.
- La ruta se anade al sitemap.
- Verificaciones locales:
  - `npm test`: correcto.
  - `npm run lint`: correcto.
  - `npm run build`: correcto.
  - `http://localhost:3001/cuanto-cuesta-ser-autonomo`: responde 200.
- Verificacion en produccion:
  - `https://www.cuantofacturar.es/cuanto-cuesta-ser-autonomo`: responde 200.
  - La pagina contiene el enfoque de coste de autonomo y el formulario de checklist.
- Siguiente paso en Ads:
  - usar esta ruta como URL final de la campana o de un grupo/anuncio especifico para busquedas de coste de autonomo;
  - mantener presupuesto bajo;
  - revisar Brevo y terminos de busqueda tras 10-15 EUR de gasto.

## Revision 10 de julio de 2026

Archivos revisados:
- `Informe de grupo de anuncios (2).csv`.
- `Informe de terminos de busqueda (3).csv`.

Periodo de los informes: 3 a 9 de julio de 2026.

Campana: `Search - Coste autonomo`

Datos:
- Clics: 20.
- Impresiones: 265.
- CTR: 7,55 %.
- CPC medio: 1,12 EUR.
- Coste: 22,39 EUR.
- Conversiones: 0.
- Tasa de conversion: 0,00 %.

Terminos de busqueda:
- Google desglosa 4 clics / 6,86 EUR en terminos visibles.
- Los otros 16 clics / 15,54 EUR aparecen como `Otros terminos de busqueda`.
- Los terminos visibles con clics estan alineados con la pagina:
  - `cuanto cuesta la cuota de autonomos`: 1 clic, 0,93 EUR.
  - `cuanto es la cuota de autonomo en espana`: 1 clic, 1,09 EUR.
  - `cuota autonomos mensual`: 1 clic, 3,10 EUR.
  - `cuanto vale darse de alta como autonomo`: 1 clic, 1,74 EUR.

Lectura:
- El anuncio atrae busquedas coherentes con coste, cuota, gastos y alta de autonomo.
- El CTR es bueno, por lo que no se cambia el anuncio, las palabras clave ni el presupuesto en esta revision.
- Los 20 clics y 22,39 EUR sin leads indican que el siguiente ajuste debe hacerse despues del clic.
- La captacion estaba al final de una pagina larga y el boton principal enviaba primero a la calculadora.

Decision aplicada:
- La campana se pausa el 10 de julio de 2026 mientras se prepara el siguiente test.
- En `/cuanto-cuesta-ser-autonomo` la checklist de costes pasa a ser la accion principal de la cabecera.
- El formulario se mueve justo despues de la introduccion y se presenta como checklist de cuota, gestoria, herramientas, impuestos y horas no facturables.
- La calculadora queda como accion secundaria.
- Se corrige el salto al formulario para que la cabecera fija no tape el titulo en movil.
- Siguiente medicion: reactivar tras publicar y revisar resultados despues de 15-20 clics nuevos, sin hacer otros cambios durante esa muestra.
