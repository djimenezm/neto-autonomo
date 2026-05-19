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
