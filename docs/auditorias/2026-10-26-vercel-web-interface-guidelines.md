# Auditoría · Vercel Web Interface Guidelines — 2026-10-26

> Pautas: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md (versión del 26/10/2026), aplicadas con la skill `web-design-guidelines`.
> Auditoría de solo lectura hecha por un agente: leyó el código, no lo ejecutó en un navegador. Los contrastes y el recorte del foco en `.nav` son estimaciones.
> Las líneas citadas corresponden al estado del repositorio en el commit `5de8d33`.
> Estado: pendiente. El modo presentación y los gráficos SVG nuevos (posteriores a esta auditoría) ya nacen con variables de tema, `role="img"`, diálogo modal y foco atrapado.

## Top 10 por impacto

| # | Qué arreglar | Dónde se arregla una sola vez | Esfuerzo |
|---|---|---|---|
| 1 | **Colores fijos en los gráficos Recharts de la terminal.** El precio (`#EAF0F6`) queda invisible en el tema claro. Hay que armar un mapa de colores derivado de `theme` (variables CSS, nunca hex). | `index.html`: `LINES` y los `<LineChart>` de `MarketSection` / `PortfolioSection` (líneas 1174 y siguientes) | S |
| 2 | **Base del router.** Al cambiar de pestaña hay que mover el foco al título y actualizar `document.title`. Además: un `h1` por ruta, `aria-current` en la navegación, `scroll-padding-top` y un skip link compatible con el router de hash (un botón que haga `main.focus()`). | `App` y `SectionHead` de `index.html` (líneas 2258–2356) | M |
| 3 | **Movimiento.** Falta un `@media (prefers-reduced-motion: reduce)` global que cubra la cinta, `pulse`, `blink`, el scroll suave y el hover de las tarjetas. También hace falta un botón para pausar la cinta. | Bloque CSS de `index.html` y `lab.css` | S |
| 4 | **`color-scheme` y `theme-color`.** Los `<select>`/`<option>` y las barras de scroll se ven mal en el tema oscuro en Windows. | `index.html:18`, `lab.css` (líneas 6, 16, 175 y 182) y un marcador `@head` en `build.js` | S |
| 5 | **Formularios sin label en API y Carteras.** Hay que asociar `htmlFor`/`id`, poner `aria-label` por ticker en el checkbox y en el peso, agregar label al textarea y sumar `name`, `autoComplete` y `spellCheck`. | `ApiSection` y `PortfolioSection` de `index.html` | S |
| 6 | **Teclado y estados.** Filas de la tabla de Mercado con `<button>`; `aria-pressed` en chips y presets; el chip "Precio" deshabilitado; `aria-label` en la papelera; `aria-hidden` en `Icon`. | `MarketSection`, `PortfolioSection` e `Icon` de `index.html` | S |
| 7 | **Regiones vivas.** Faltan en los toasts, la consola de la API, el aviso "COPIADO" y el conteo del glosario. | `Toasts` y `ApiSection` de `index.html`, `lab.js` y `glosario.html` | S |
| 8 | **Legibilidad en proyector.** Subir `--dim` a 4,5:1 o más y llevar las etiquetas de 8,5–10 px a 11–12 px como mínimo. | Tokens de `index.html` (líneas 21 y 33) y `lab.css` (líneas 9 y 20) | S |
| 9 | **Bugs de datos y textos.** "NaN" en el resultado de la cartera (1417); aviso de copia siempre rojo (1800); typo `paddingadding` (1446); números sin formato es-AR (1726, 2152); espacio no separable antes de `%`; el reloj rerenderiza todo cada segundo. | Helpers (846–854), `GuidedAutomation` y `App` de `index.html` | S |
| 10 | **Estructura del taller.** Usar `<nav>` como landmark, agregar un skip link y `scroll-padding-top` global para los anclajes del kit, y pasar los `h4` de `.flow-row` a `h3`. | `docs/taller/build.js` (un rebuild corrige las 13 páginas), `lab.css` y un reemplazo masivo | M |

Fuera del top 10: llevar el estado a la URL (ticker, pesos, señal, pregunta) para tener deep links, y agregar `overflow-x` a las tablas sueltas (kit, docente y automatizaciones) para el celular.

## Hallazgos por archivo

### index.html (terminal)

#### Metadatos, carga y tema
- **6:** falta `<meta name="theme-color">`.
- **7:** el `<title>` no cambia según la ruta del hash.
- **10:** falta `preconnect` a `fonts.gstatic.com` (con `crossorigin`) y a `cdn.jsdelivr.net`.
- **18:** el `:root` oscuro no declara `color-scheme:dark`.
- **21:** `--dim` tiene un contraste de ~3,3:1 y en el tema claro (línea 33) de ~4:1. Se usa en etiquetas de 8,5–9 px.
- **415:** `#root` no tiene `<noscript>` ni contenido de respaldo: si falla el CDN, la página queda en blanco.
- **422:** Babel compila en el navegador en cada carga. Es deliberado, pero es el principal costo de arranque.

#### Foco y navegación
- **75:** el anillo de foco mide 1 px; conviene 2 px.
- **78:** la cabecera es sticky pero `html` no tiene `scroll-padding-top`.
- **108:** el `overflow-x:auto` de `.nav` probablemente recorta el anillo de foco.
- **2260:** una ruta desconocida o un `#id` deja la página vacía.
- **2276:** en `hashchange` no se mueve el foco ni se actualiza el título.
- **2346:** no hay skip link.
- **2348:** la pestaña activa no tiene `aria-current="page"`.

#### Movimiento y transiciones
- **40:** `scroll-behavior:smooth` sin la variante reducida.
- **86** y **113:** `pulse` infinito sin la variante reducida.
- **88**, **110**, **129** y **187:** `transition` equivale a `all`; conviene listar las propiedades.
- **98:** la cinta se mueve sin fin y solo se pausa con el mouse.
- **269** y **1581:** `blink` infinito sin la variante reducida.
- **304:** solo `.ag-step` respeta `prefers-reduced-motion`.
- **2172:** el avance automático del agente no tiene botón de pausa.

#### Tipografía y legibilidad
- **119**, **286** y **318:** los títulos no tienen `text-wrap:balance`.
- **139**, **161**, **169**, **184** y **1303:** etiquetas de 8,5–9 px.
- **190:** `.chip.off{opacity:.38}` tiene contraste insuficiente.

#### Formato de números y textos
- **849:** espacio común antes de `%`. Lo mismo en 851, 1363, 1381, 1384 y 1462.
- **1417:** `nf1.format(cond?'+':'')` muestra "NaN" o "0,0". Lo mismo en 1418.
- **1446:** typo `paddingadding`.
- **1726**, **1727** y **2152:** números sin formato es-AR.
- **1800:** `notify(...,'err')` muestra siempre el aviso como error.

#### Iconos y elementos decorativos
- **914:** `Icon` no lleva `aria-hidden="true"`.
- **1138:** la fila duplicada de la cinta no tiene `aria-hidden`.
- **1302:** la sparkline es decorativa y no tiene `aria-hidden`.
- **1670:** `<Icon n="terminal-dummy" s={0}/>` deja un SVG vacío en el DOM.
- **2188:** el glifo `▶` dentro del botón se lee en voz alta.

#### Regiones vivas y avisos
- **1110:** los toasts no tienen `role="status"` ni `aria-live`.
- **1672:** la consola de la API no tiene `aria-live`.
- **1899:** el `role="status"` se monta junto con el mensaje.
- **2339:** el "¿CONFIRMAR?" no se anuncia.

#### Gráficos
- **1174:** el trazo del precio es invisible en el tema claro. También hay colores fijos en 1175–1178, 1248, 1249, 1252, 1302 y 1404–1413.
- **1246**, **1263** y **1402:** los gráficos no tienen alternativa de texto.

#### Controles y formularios
- **1239:** los chips toggle no tienen `aria-pressed`.
- **1240:** el chip "Precio" no hace nada.
- **1297:** `<tr onClick>` sin teclado.
- **1343:** los presets no tienen `aria-pressed`.
- **1354:** checkbox sin label.
- **1357:** input de peso sin label, sin `name` y sin `inputMode="decimal"`.
- **1571:** borrar una alerta no pide confirmación ni permite deshacer.
- **1614:** label sin asociar. Lo mismo en 1616, 1703, 1707 y 1711.
- **1615:** el input no tiene `name`, `autoComplete="off"` ni `spellCheck={false}`. Lo mismo en 1617.
- **1647:** textarea sin label.
- **1730:** la papelera tiene `title` pero no `aria-label`.

#### Estructura y semántica
- **1199:** `className="dim"` no está definida.
- **1456:** la tabla de contribución no tiene `overflow-x`. Lo mismo en 1719.
- **1809:** `aria-label` en un `<div>` sin rol. Lo mismo en 1875.
- **2233:** el título salta de `h1` a `h3`.
- **2363:** las rutas que no son inicio no tienen `h1`.
- **2391:** `<footer>` está dentro de `<main>`.

#### Rendimiento
- **2228:** la imagen del hero no tiene `fetchpriority="high"`.
- **2287:** el reloj en `App` rerenderiza todo cada segundo.

#### Estado en la URL
- **1169:** la selección no va en la URL. Lo mismo en 1322, 1788 y 2160.

### docs/automatizaciones/lab.css
- **6:** sin `color-scheme`. Lo mismo en las líneas 16, 175 y 182.
- **9** y **20:** `--dim` tiene un contraste menor a 4,5:1.
- **26:** sin `touch-action:manipulation`.
- **44:** `.top` es sticky pero `html` no tiene `scroll-padding-top`.
- **57:** `h1` sin `text-wrap:balance`.
- **62**, **66**, **76**, **89**, **107**, **129**, **151** y **154:** etiquetas de 9,5–10 px.
- **87:** `.flow-row h4` salta la jerarquía.
- **100**, **135** y **149:** `transition` equivale a `all`.
- **124:** la tabla responsive solo funciona dentro de `.panel-b`.
- **150:** `transform` en hover sin la variante reducida; además, no hay ningún `prefers-reduced-motion` en el archivo.

### docs/automatizaciones/lab.js
- **28:** el cambio a "COPIADO" no se anuncia.

### docs/taller/taller.css
- **13:** el contenido de `::before` ("⧉", "✓") se lee en voz alta.
- **37:** `.mock td` sin `font-variant-numeric:tabular-nums`.
- **68:** `.steps a` mide unos 26 px de alto: área táctil chica.
- **79:** falta `scroll-margin-top` en las secciones.

### docs/taller/taller.js
- **38:** el `aria-label` lleva el texto completo del fragmento y pisa el aviso de copiado.

### docs/taller/build.js (se repite en las 13 páginas del taller)
- **22:** sin skip link.
- **33:** `.steps` no es un `<nav>` y queda antes del `h1`.
- **31:** los `.sep` con `aria-hidden` pierden el agrupamiento por clase.
- **15:** el `<head>` no se sincroniza (`theme-color`, `preconnect`, script de tema).

### docs/taller/paso-3.html (patrón de los pasos)
- **7:** falta `preconnect` a `fonts.gstatic.com` (se repite en todas las páginas).
- **11:** sin `theme-color`.
- **35** y **94:** el glifo `⬇` dentro del link se lee en voz alta (se repite en los pasos 1 a 8).
- **40:** `aria-label` en un `<div>` sin rol: las maquetas necesitan `role="img"` (se repite en los pasos 1, 2, 4, 5, 6 y 9).
- **41:** espacio común antes de `%`.
- **109:** `h4` directamente bajo `h2`.

### docs/taller/kit.html
- **39:** los anclajes `paso-N.html#prompt` quedan tapados por la `.top` sticky.
- **56:** la `.tbl` no tiene `overflow-x` en el celular.

### docs/taller/glosario.html
- **173:** el filtro no tiene estado vacío ni conteo con `aria-live`.

### docs/taller/paso-0.html
- **52–53:** inputs sin `name`, sin `autocomplete="off"` y sin `spellcheck="false"`.

### docs/automatizaciones
- **index.html:38:** `h4` antes de cualquier `h3`.
- **index.html:42:** "80%" necesita un espacio no separable antes de `%`.
- **index.html:129–133:** inputs sin `name` y sin `autocomplete="off"`.
- **aviso-senal.html:134:** el destinatario debería ser `type="email"`.
- **aviso-senal.html:133–135:** inputs sin `name`.

### docs/docente/index.html
- **33, 45, 75, 94, 107, 124 y 144:** las tablas no tienen `overflow-x`.
- **106:** el `h3` tiene estilos inline.
