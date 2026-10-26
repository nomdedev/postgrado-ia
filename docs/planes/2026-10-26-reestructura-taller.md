# Plan unificado: reestructura del taller FIN·LAB

**Fecha:** 2026-10-26 · **Estado:** propuesta, a la espera de las decisiones de la sección 5.

**Fuentes:** el consejo de cuatro agentes (diseño visual y UX, docente didáctico, arquitectura de la información, arquitectura técnica), más la auditoría `docs/auditorias/2026-10-26-docente-didactico.md`. Los agentes solo leyeron y propusieron. Este plan combina sus propuestas, marca dónde no coinciden y dice qué se recomienda.

## 1. El problema en una frase

El taller está bien hecho por dentro, pero **está ordenado para entender y no para hacer**. En una actividad de 15 minutos, el botón COPIAR del prompt aparece recién después de 4 pantallas, el diagrama ocupa el 40 % de lo visible y no se lee, y nadie le dice al alumno, al entrar, qué va a construir.

Lo midió el agente de diseño con el sitio publicado a 1366×768:

| Página | Alto total | Dónde aparece COPIAR |
|---|---|---|
| Paso 0 | 5,9 pantallas | pantalla 4,8 |
| Paso 3 | 5,7 pantallas | pantalla 4,1 |
| Paso 4 | 5,7 pantallas | pantalla 4,0 |
| Paso 7 | 6,5 pantallas | pantalla 4,5 |
| Paso 9 | 7,0 pantallas | (no aplica) |

En celular, cada página mide entre 8,6 y 11,5 pantallas. En el proyector (1280×720), la primera pantalla de un paso no tiene ninguna acción.

## 2. En qué coinciden los cuatro agentes

1. **La página de paso se divide en dos zonas.**
   - **Hacer**, abierta y arriba: el resultado esperado, el prompt con COPIAR, el clic por clic, la comprobación y la ayuda si se traban.
   - **Para entender más**, plegada (`<details>` nativo): el flujo, las palabras nuevas y los errores frecuentes.
2. **Se elimina lo repetido.** Las tarjetas de "misión" repiten el clic por clic, y la nota "Tranquilos" es idéntica en los 10 pasos: queda una sola vez, en la bienvenida y en el paso 0. También se borran las referencias "(sección 06)".
3. **El diagrama Archify sale del iframe de cada paso.** En su lugar va una tira de 3 a 6 cajas en castellano llano, con verbos de finanzas y sin nombres de funciones, más un enlace "Ver el diagrama completo ↗". Archify queda para el docente y los curiosos.
   - La tira reusa `.flow` / `.flow-row`, que ya existen en `lab.css:83-89`, y la lista `.legend-read` ya tiene el contenido.
   - Hay un ahorro grande de peso: cada diagrama son ~800 KB, de los cuales el dibujo ocupa 12 KB. Con 30 alumnos, son ~6 MB por paso sobre el wifi del aula.
4. **Falta una guía del docente:** cronograma por clase, qué mirar en cada grupo, respuestas esperadas, criterio para dar el rescate y checklist previa.
5. **El taller dura ~4 h reales, no 165 minutos.** Hay que partirlo en clases y decir dónde se corta.
6. **Hay que mejorar la legibilidad en proyector y celular.**
   - Los rótulos en mono de 9,5 a 11 px suben a 12 px o más.
   - Los botones de rescate parecen etiquetas: pasan a ser botones de verdad.
   - Una fórmula del paso 7 genera scroll horizontal en celular.
7. **Lo que no se toca:**
   - el botón COPIAR ámbar y el plegado "VER EL TEXTO";
   - la maqueta "qué van a lograr" (cambia de lugar);
   - el checklist de comprobación con calculadora o Sheets;
   - la paleta, el tema claro y oscuro, y las versiones de rescate.

## 3. Lo nuevo: la pantalla de bienvenida (pedido del profesor)

Hoy `https://postgrado-ia.vercel.app/` abre directo la pestaña EMPEZAR, que en realidad es el asistente de n8n del final del curso (`index.html:2018`). El alumno entra por el último paso y sin contexto.

**Propuesta combinada de los agentes de arquitectura de la información y de diseño:**

- **Dónde va:** una pestaña nueva **INICIO** en la raíz (`/` sin `#`). Los enlaces que ya circulan (`/#/guiado`, `/#/mercado`) siguen funcionando, y la terminal real queda a un clic, como demo navegable.
- **La pestaña EMPEZAR pasa a llamarse AUTOMATIZAR.** Cada pestaña de la terminal suma una franja de una línea: "Esta pantalla la construyen en el Paso N →".
- **Lo que hay en la primera pantalla, que tiene que entenderse sola en proyector:**
  1. Un titular: "Construyan su propia terminal financiera, con IA". Una línea: no escriben código; la IA lo escribe y ustedes comprueban los números.
  2. Una vista previa del resultado: captura liviana (WebP) de la pestaña **Mercado**, que es lo que un analista reconoce, en un marco de navegador, con "así empiezan → así terminan". Debajo, "Ver la terminal funcionando ↗".
  3. El recorrido en **3 etapas**, no en 10 pasos: ① Ver el mercado · ② Medirlo · ③ Sacarlo afuera. Cada una con sus pasos y su clase.
  4. Tiempo total, tamaño de grupo y lo que necesita cada grupo, en una línea de íconos.
  5. **Un solo botón primario:** "Empezar · Paso 0 →". Como secundario: "¿Vienen de otra clase? Retomar".
- **El mapa actual (`/docs/taller/`) pasa a ser la página "Retomar":** las clases, el camino completo o corto, y las 10 tarjetas agrupadas por etapa.

## 4. Dónde no coinciden y qué recomiendo

| Tema | Posturas | Recomendación |
|---|---|---|
| Cuántas clases | 2 clases, P0–P5 y P6–P9 (arquitectura de la información, recalculado con los tiempos reales) · 4 clases cortas (docente) · 2 o 3 (diseño) | **2 clases: P0–P5 y P6–P9.** La guía del docente incluye la variante de 3 clases y un "mínimo viable": P0, P1, P4, P5 y la auditoría cruzada, usando los rescates. → **Decisión 1** |
| Cómo se comparten las partes repetidas (barra, encabezado, pie) | Componentes por JS (arquitectura de la información) · script que sincroniza con marcadores, sin JS (técnica) | **Script `docs/taller/build.js` con marcadores y un test `--check`.** Funciona sin JS ni red, no cambia URLs y el contenido de cada paso sigue editándose a mano. |
| Paso 7 con dos tareas | Partir en 7a/7b (docente) · los demás no lo mencionan | **No renumerar:** marcar la parte "pestaña Python" como **opcional** dentro del paso 7. Partir el paso obliga a renumerar los rescates, los prompts y `build.js`, y eso tiene riesgo. → **Decisión 4** |
| Fusionar P2 y P3 | Lo propone el docente, con prueba previa | **Postergar** hasta probarlo con un chat gratuito: duplica el riesgo de respuestas cortadas. |
| Barra de navegación | "◀ Paso N de 9 ▶" con barra de progreso (diseño) · pastillas actuales más un "kit" (arquitectura de la información) | Barra compacta "◀ Paso N de 9 ▶" con agrupación por clase. El progreso con `localStorage` va en una etapa posterior. |
| Guía del docente pública | El repo y el sitio son públicos: si la guía tiene las respuestas, contradice "no revelarlas antes de comprobar" | **Publicarla sin enlazarla desde la vista del alumno**, o dejarla fuera del sitio con `.vercelignore` y repartirla como PDF. → **Decisión 2** |
| Botón "COPIAR PROMPT + MI ARCHIVO" (lee el `finlab.html` con un selector de archivo) | Propuesta del docente: elimina el Bloc de notas y la mitad de los gestos | Prototipo en una etapa posterior, con el camino manual siempre visible como plan B. |

## 5. Decisiones que necesito del profesor

1. **Clases:** ¿2 clases (P0–P5 / P6–P9, unas 2 h 15 a 2 h 30 cada una)? ¿O preferís 3?
2. **Guía del docente:** ¿publicada pero sin enlazar desde la vista del alumno? ¿O fuera del sitio, como PDF?
3. **Bienvenida:** ¿la ponemos en la raíz como pestaña INICIO y renombramos EMPEZAR a AUTOMATIZAR?
4. **Paso 7:** ¿marcamos la parte "pestaña Python" como opcional, o lo partimos en 7a/7b con renumeración?

## 6. Plan por etapas

Cada etapa se sube por separado, se despliega sola y no cambia ninguna URL publicada. En cada una se corren los evals, que ahora sí ejecutan los tests (`evals/`, arreglado en `1d1f852`), y se hace una verificación visual con Chrome headless.

| # | Etapa | Qué incluye | Esfuerzo |
|---|---|---|---|
| 0 | Red de seguridad | ✅ Hecho: el control de evals ejecuta los tests. Pendiente: versionar en el repo el generador de los diagramas (hoy es un script temporal) y documentar la versión de Archify; agregar un test que verifique que cada fuente `src/*.json` tiene su `.html`; actualizar la nota vieja de la auditoría ("H1–H17 siguen pendientes") | S |
| 1 | Partes comunes | `docs/taller/build.js` sincroniza el encabezado, la barra agrupada por clase y el pie entre marcadores; un test con `--check` | S |
| 2 | Legibilidad | Rótulos en 12 px o más con menos espaciado; botones de rescate reales; `overflow` en maquetas y fórmulas para celular | S |
| 3 | Anatomía Hacer / Entender | Reordenar los 10 pasos; caja única "¿Se trabaron?" con los tres botones; tira de flujo en castellano en lugar del iframe; sacar la misión y el "Tranquilos" repetidos; numeración de secciones por CSS. Arreglos que entran acá: la tabla de la maqueta del paso 3 (AAPL todavía en 229,15, el arreglo de H9 quedó a medias), el diagrama del paso 4 (flecha SMA→EMA que no existe) y el del paso 9 (arranca en servidor local); en el paso 1, "pasos 1 a 6" pasa a "1 a 7". Hay que conservar los `<pre id="cA/cB/cC">` del paso 7 y adaptar los tests del iframe | M |
| 4 | Bienvenida | Pestaña INICIO en `/`; EMPEZAR pasa a AUTOMATIZAR; captura de Mercado; 3 etapas; un solo botón; franjas "se construye en el Paso N"; el mapa pasa a "Retomar" con las clases y el camino corto | M |
| 5 | Material del docente y kit | Guía del docente según la decisión 2; `kit.html` con todos los prompts y descargables (un test exige que enlace cada archivo de `rescate/`); la auditoría se mueve junto a la guía | M |
| 6 | Opcionales | Botón "copiar prompt + mi archivo"; progreso con `localStorage`; índice fijo en el glosario; fusionar P2+P3 después de una prueba en seco | M/L |

**Orden sugerido:** 0 → 1 → 2 → 3 → 4 → 5. La 3 y la 4 cambian lo que ve el alumno: conviene hacerlas entre cohortes, no a mitad de un curso.

## 7. Riesgos

- **Material que deja de coincidir:** si los alumnos o el docente ya tienen capturas o un PDF de la versión actual, las referencias cambian. Mitigación: hacer la reestructura entre cohortes.
- **Rescates del paso 7:** `rescate/build.js` lee los bloques Python desde `paso-7.html`. Mitigación: conservar los `id`; el test lo detecta.
- **Lo conceptual queda escondido:** con "Para entender más" plegado, algunos grupos no lo van a abrir. Mitigación: la guía del docente recupera ese contenido en la puesta en común de cada clase.
- **Página de inicio más pesada:** la pestaña INICIO vive dentro de la terminal en React (124 KB más las CDN). Mitigación: captura liviana, sin iframe. Si la carga en el aula resulta lenta, se pasa a una home estática.
- **No validado en el aula:** los tiempos y los cortes de clase son estimaciones. Antes de la primera clase hay que hacer una prueba en seco con un chat de IA gratuito.
