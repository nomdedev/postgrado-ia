# Auditoría didáctica FIN·LAB — 2026-10-26

> **Nota posterior (2026-10-26):** después de esta auditoría el proyecto se publicó en https://postgrado-ia.vercel.app y los materiales ya apuntan a esa API, así que el riesgo "URL de Vercel desplegada" quedó resuelto. Los hallazgos H1–H17 siguen pendientes. Informe generado por el agente `docente-didactico` (`.claude/agents/docente-didactico.md`).

## Veredicto
**GO con ajustes.** El taller tiene una estructura consistente y excelente (10 pasos con la misma anatomía, rescate en cada paso 1–7, fórmulas correctas en la plantilla y en la terminal; `node --test` 9/9 OK), pero hay cuatro problemas que van a trabar a los grupos y conviene corregir antes de la clase: el resultado esperado del paso 8 contradice la API real, la comprobación del RSI en Colab puede dar ❌ con un Wilder correcto, la pestaña EMPEZAR revela las respuestas de los ejercicios antes de discutirlas, y la consola del navegador bloquea pegar en los pasos 2–3.

## Puntaje por dimensión
| Dimensión | 1–5 | En una línea |
|---|---|---|
| 1 Claridad para no programadores | 4 | Clic por clic, glosario completo (todos los anclajes existen); pocas trampas de redacción. |
| 2 Progresión y carga cognitiva | 3 | Una idea por paso, pero P7 y P9 meten 2–3 actividades y los tiempos nominales (165 min) son optimistas. |
| 3 Exactitud financiera | 4 | SMA, EMA, Wilder, covarianza ×252, Sharpe y drawdown bien; fallan maquetas numéricas y la frase que interpreta el Sharpe. |
| 4 Verificabilidad | 3 | Excelentes comprobaciones (Sheets, Colab, Sharpe a mano), pero dos de P5 no son ejecutables con el archivo propio y la de RSI en P7 da falsos ❌. |
| 5 Robustez en el aula | 3 | Rescates v1–v7 y CSV de respaldo; sin plan B para P8 ni para el servidor de P9. |
| 6 Trabajo en grupo | 3 | Roles rotativos bien pensados, pero los ejercicios de EMPEZAR muestran la respuesta antes de discutir. |
| 7 Consistencia | 2 | Precios, señales y nombres de campos cambian entre maquetas, rescate, terminal y API; dos juegos de roles distintos. |
| 8 Accesibilidad y usabilidad | 3 | Botones COPIAR y teclado bien; texto `--dim` con contraste 3,3:1 en tamaños de 9,5–12 px. |
| 9 Ética y advertencias | 4 | "Simulados / no es asesoramiento" en todas partes; falta aviso de datos personales en el chat y de credenciales en máquinas compartidas. |

## Lo que funciona bien (máx. 5)
- Plan de rescate en cada paso: "¿Llegan tarde…? Bajen la versión con la que termina el paso N−1" (`docs/taller/paso-3.html:33`, `paso-7.html:33`) y CSV de respaldo (`paso-7.html:75`).
- La verificación cruzada de P7 funciona con el CSV de respaldo: recalculé con `node -e` replicando el bloque B sobre `rescate/finlab-AAPL.csv` y la diferencia máxima es 0,0050 en SMA20, SMA50 y RSI (< 0,01 → ✅); las primeras SMA50/RSI aparecen en las filas 49 y 14 (base 0), como dice `paso-4.html:118`.
- Fórmulas correctas y comentadas: EMA alfa 2/(n+1) con arranque SMA (`rescate/finlab.template.html:104`, `index.html:521-528`), Wilder con arranque simple (`finlab.template.html:105-115`, `index.html:530-543`), covarianza muestral ×252 y Sharpe (`finlab.template.html:233-251`, `index.html:612-622`); la cartera ilustrativa (8,1 − 4,3) / 9,4 = 0,40 cierra (`paso-5.html:40`).
- El cierre fija la idea central de que la verificación es trabajo humano, con auditoría cruzada en un chat nuevo y "no inventes hallazgos" (`paso-9.html:117-127`, `paso-9.html:142`).
- El prompt de contexto explica el porqué de cada regla (`paso-0.html:97-108`): archivo completo, fórmula comentada, "nunca digas que son cotizaciones reales".

## Top 5 antes de la próxima clase
1. Corregir el resultado esperado de P8 para que coincida con la API (JNJ y KO, no YPF y GGAL) — hoy la "cuenta a mano" contradice el ejemplo — S.
2. Fijar en el prompt de P4 el arranque del RSI de Wilder y corregir el diagnóstico de P7 — un Wilder válido da diferencia 14,7 y ❌ — S.
3. Sacar las respuestas visibles de la pestaña EMPEZAR (y de `paso-9.html:138`) — anulan la consigna "predigan en grupo" — S.
4. Agregar en P2/P3 el aviso de "permitir pegar" en la consola — Chrome/Firefox bloquean pegar ahí y los botones COPIAR invitan a hacerlo — S.
5. Pedir en el prompt de P5 la columna "volatilidad individual" — sin ella dos de las cuatro comprobaciones no se pueden hacer — S.

## Hallazgos

### 🔴 Bloquean la clase
Ninguno: todo lo que sigue se puede salvar en el aula, aunque con costo de tiempo y confianza.

### 🟠 Importantes

#### H1 · El resultado esperado del paso 8 no coincide con la API publicada
- **Dónde:** `docs/taller/paso-8.html:38-43` y `paso-8.html:124`, contra `api/market/summary.js:4-9` y `docs/automatizaciones/aviso-senal.html:156`.
- **Qué observé:** el ejemplo muestra "YPF … RSI 41.7 · señal VENTA" y "GGAL … RSI 72.4 · NEUTRAL". En la API, YPF tiene RSI 54,5 y señal COMPRA, y GGAL RSI 59,0. Con la regla "VENTA o RSI fuera de 30–70" salen JNJ (VENTA, RSI 28,1) y KO (RSI 70,7). La propia `aviso-senal.html:156` dice "en la muestra fija, JNJ".
- **Por qué le importa al alumno:** la comprobación pide contar a mano en la API; el número coincide (2) pero los activos no, y el grupo va a pensar que su workflow está mal.
- **Cómo mejorarlo:** reemplazar el `<pre>` por:
  ```
  Asunto: FIN·LAB · 2 activos para mirar

  - JNJ: 117.88 USD · RSI 28.1 · señal VENTA → motivo: señal de venta y RSI menor a 30
  - KO: 66.09 USD · RSI 70.7 · señal COMPRA → motivo: RSI mayor a 70
  ```
- **Esfuerzo:** S

#### H2 · RSI poco especificado en P4 → ❌ en Colab con diagnóstico equivocado en P7
- **Dónde:** `paso-4.html:99` (prompt), `paso-7.html:114` (bloque B) y `paso-7.html:187` ("Si algo falla").
- **Qué observé:** el prompt dice solo "RSI de Wilder (suavizado con alfa = 1/14)". El bloque B arranca con el promedio simple de las primeras 14 variaciones. Simulé con `node -e`, sobre `finlab-AAPL.csv`, un Wilder que arranca desde el primer cambio (lectura literal de "alfa = 1/14"): la diferencia máxima da **14,68** y sigue > 0,01 hasta la fila 105. El texto de "Si algo falla" lo atribuye a "promedio simple en lugar de Wilder", lo cual es falso en este caso.
- **Por qué le importa al alumno:** el paso que debía darle confianza le dice que está mal cuando no lo está, y la corrección sugerida no resuelve nada.
- **Cómo mejorarlo:** en `paso-4.html:99` pedir: `- rsi(precios, 14): RSI de Wilder. Arranque: promedio simple de las primeras 14 subas y de las primeras 14 bajas. Después: promedio = (promedio anterior × 13 + valor de hoy) / 14. Resultado entre 0 y 100.` En `paso-7.html:187` agregar: "Si la diferencia es grande solo en las primeras ~100 filas y después baja a casi 0, es el *arranque* del suavizado, no un error de fórmula. Si es grande en todas las filas, una versión usa promedio simple."
- **Esfuerzo:** S

#### H3 · La pestaña EMPEZAR revela las respuestas antes de discutir
- **Dónde:** `index.html:1756`, `index.html:1818`; `docs/taller/paso-9.html:99` y `:138`.
- **Qué observé:** junto al selector se lee "el resultado esperado es YPF/AAPL/GGAL" (1756), y cada ejercicio muestra su `explain` antes de COMPROBAR (1818); por ejemplo, el del ejercicio 1 ("Primero lee una muestra local…") y el del 3 ("n8n necesita una URL HTTP…") son las respuestas. El paso 9 pide "predigan en grupo" y su checklist dice "aparece YPF".
- **Por qué le importa al alumno:** desaparece la discusión del grupo, que es el centro del cierre; el contador llega a 3/3 sin pensar.
- **Cómo mejorarlo:** en la línea 1818 mostrar solo `{ex.time}` y dejar `ex.explain` únicamente en el feedback correcto (ya está en la 1830); en la 1756 mostrar "el resultado esperado…" solo después de que el ejercicio `branch` esté comprobado; en `paso-9.html:138`, cambiar a "En n8n, la salida que se activa coincide con la predicción que anotaron (o pueden explicar por qué no)".
- **Esfuerzo:** S/M

#### H4 · La consola bloquea pegar y los pasos 2–3 invitan a hacerlo
- **Dónde:** `paso-2.html:108-109`, `paso-3.html:108`; `docs/taller/taller.js:126-135` (agrega COPIAR a cada `.code-inline.c`).
- **Qué observé:** las tres comprobaciones de consola tienen botón COPIAR. Ninguna página menciona el aviso anti-pegado de Chrome y Firefox (grep de "allow pasting"/"permitir pegar" en `docs/taller/`: 0 resultados).
- **Por qué le importa al alumno:** es la primera vez que abre la consola: pega, aparece una advertencia de seguridad en inglés y no pasa nada. El auditor queda trabado en la comprobación.
- **Cómo mejorarlo:** nota `warn` en la sección 06 de P2 y P3: "**Si la consola no deja pegar:** el navegador muestra un aviso de seguridad. Escriban a mano la frase que pide (en Chrome en inglés: `allow pasting`), Enter, y vuelvan a pegar. Es una protección normal: solo peguen código de este taller."
- **Esfuerzo:** S

#### H5 · Dos comprobaciones de P5 no se pueden hacer con el archivo propio
- **Dónde:** prompt `paso-5.html:92-102`; comprobaciones `paso-5.html:113-114`.
- **Qué observé:** las comprobaciones piden comparar con "la volatilidad individual de KO" y "el promedio ponderado de las volatilidades individuales", pero el prompt no pide mostrarlas. Solo las tiene el rescate (`finlab.template.html:234`, `:268-272`).
- **Por qué le importa al alumno:** la prueba estrella de la covarianza ("100 % en KO") no tiene contra qué compararse.
- **Cómo mejorarlo:** agregar al prompt, después del ítem del deslizante: `- al lado de cada control, la volatilidad anualizada individual de ese activo (desvío de sus retornos diarios × √252)`.
- **Esfuerzo:** S

#### H6 · El paso 0 manda al ítem equivocado si se cierra el chat
- **Dónde:** `paso-0.html:75`.
- **Qué observé:** "si lo cierran, vuelvan a empezar desde el paso 6 de esta lista"; el ítem 6 es "Lean la respuesta". Hay que volver al 4 (constructor) y, desde P2, pegar también el archivo (como dice `glosario.html:35`).
- **Por qué le importa al alumno:** perder el chat es probable en un aula; la instrucción lo deja sin contexto en la IA.
- **Cómo mejorarlo:** "Usen uno solo para todo el taller. Si se cierra, abran uno nuevo, vuelvan al punto 4 de esta lista y, desde el paso 2 en adelante, peguen también su `finlab.html` actual."
- **Esfuerzo:** S

#### H7 · P8 sin versión de rescate ni plan B sin URL de Vercel
- **Dónde:** `paso-8.html:44`, `paso-8.html:88`, `:130-137`; `docs/taller/index.html:76` ("cada paso trae una versión de rescate").
- **Qué observé:** el paso depende de la URL de Vercel; no hay un `aviso-rsi.json` resuelto y la única alternativa es "mirar a otro grupo" (`index.html:73`).
- **Por qué le importa al alumno:** si la IA rompe el JSON o falta la URL, el grupo pierde 20 minutos sin nada para ejecutar.
- **Cómo mejorarlo:** agregar `rescate/aviso-rsi.json` (el workflow ya adaptado, con un nodo Code de "muestra fija" que replique `summary.js` para poder ejecutarlo sin URL), enlazarlo con el mismo cuadro "¿Se trabaron después de tres intentos?" y corregir `index.html:76` a "los pasos 1 a 8".
- **Esfuerzo:** M

#### H8 · P9 promete 15 minutos y depende de instalar Python o Node
- **Dónde:** `paso-9.html:30`, `:77-112`, `:117`, `:82`, `:149`.
- **Qué observé:** incluye descomprimir el proyecto, levantar un servidor, tres corridas en n8n, tres ejercicios y una auditoría cruzada entre grupos, todo en "15 MIN". El encabezado dice "CON PYTHON (VIENE EN MAC…)", pero en macOS actual `python` no existe (es `python3`). En Windows sin Python, `python` abre el atajo de Microsoft Store, no el mensaje "no se reconoce" que espera `:149`, y `py` solo existe si se instaló desde python.org.
- **Por qué le importa al alumno:** en computadoras del aula sin permisos de instalación, el paso de cierre no arranca.
- **Cómo mejorarlo:** partir en 9A (EMPEZAR + n8n, 20–25 min) y 9B (auditoría cruzada, 20 min); en `:82` poner "CON PYTHON (en Mac: `python3 -m http.server 4173 --bind 127.0.0.1`)"; en `:149` decir "si se abre la Microsoft Store o dice que no se encontró Python…"; probar doble clic sobre `index.html` (ver Riesgos) y, si funciona, ofrecerlo como plan C.
- **Esfuerzo:** M

### 🟡 Mejoras

#### H9 · Las maquetas numéricas se contradicen entre páginas y con los datos reales
- **Dónde:** AAPL 229,15 (`paso-2.html:42`, `paso-3.html:41`, `paso-6.html:41,50`) contra 308,43 (`glosario.html:60`, `api/market/summary.js:2`) y 347,89 (`rescate/finlab-AAPL.csv:253`); YPF 34,90 (`paso-2.html:42`) contra 26,33 (`paso-3.html:41`); "Mayor movimiento YPF +2,29 %" (`paso-3.html:39`) cuando PAM tiene +2,33 % (`summary.js:9`); YPF "VENTA, RSI 41,7" (`paso-6.html:41`) contra COMPRA y 54,5 en la API (`summary.js:8`).
- **Qué observé:** son números inventados que mezclan valores de la terminal con otros que no existen en ninguna fuente.
- **Por qué le importa al alumno:** el auditor atento compara con el ejemplo y desconfía de su archivo o del rescate.
- **Cómo mejorarlo:** tomar todas las maquetas de `summary.js` (la fuente fija) y rotular "valores de la muestra fija del 26/10/2026; los suyos pueden diferir"; en P3 poner PAM +2,33 % como mayor movimiento.
- **Esfuerzo:** S

#### H10 · P2 promete que "todo el curso compara los mismos números"
- **Dónde:** `paso-2.html:29` contra `paso-2.html:40` ("sus números van a ser otros"), `glosario.html:69`.
- **Qué observé:** la semilla solo garantiza que el mismo código dé siempre lo mismo; cada grupo recibe de su IA un generador distinto. El rescate y la terminal tampoco coinciden entre sí (AAPL 347,89 contra 308,43).
- **Por qué le importa al alumno:** confunde qué garantiza la semilla, y en la auditoría cruzada de P9 los números de dos grupos no van a coincidir.
- **Cómo mejorarlo:** "…salen iguales en cada recarga gracias a una semilla: con el mismo código, cualquiera obtiene los mismos números. Ojo: cada grupo tiene su propio código, así que sus números no van a coincidir con los de otro grupo."
- **Esfuerzo:** S

#### H11 · El JSON de P6 no tiene "los mismos campos" que la API de Vercel
- **Dónde:** `paso-6.html:47-55` y `:104` (`changePct`, sin envoltorio) contra `summary.js:25-34` (`ok`, `data.tickers`, `change_pct`); `paso-8.html:44` ("devuelve los mismos campos").
- **Qué observé:** cambia el nombre del campo (camelCase contra snake_case) y la estructura.
- **Por qué le importa al alumno:** el puente "P6 → API real" se rompe justo cuando compara las dos respuestas.
- **Cómo mejorarlo:** en el prompt de P6 pedir `change_pct` y la forma `{ok, data:{session, tickers}}` y actualizar el ejemplo; o cambiar `paso-8.html:44` a "devuelve campos parecidos (por ejemplo `change_pct` en lugar de `changePct`)".
- **Esfuerzo:** S

#### H12 · La frase que interpreta el Sharpe es imprecisa
- **Dónde:** `paso-5.html:42`, `paso-5.html:102`, `finlab.template.html:281`.
- **Qué observé:** "por cada unidad de riesgo, esta cartera rinde 0,40 por encima de la tasa libre de riesgo" no dice en qué unidades; se puede leer como "rinde 0,40 %" o "40 %".
- **Por qué le importa al alumno:** en un posgrado de finanzas la interpretación tiene que ser exacta.
- **Cómo mejorarlo:** "Por cada punto de volatilidad que asume, esta cartera rinde 0,40 puntos de retorno anual por encima de la tasa libre de riesgo (4,3 %)."
- **Esfuerzo:** S

#### H13 · Activos simulados sin correlación exageran la diversificación
- **Dónde:** `finlab.template.html:91` (semilla independiente por símbolo); `paso-5.html:126`.
- **Qué observé:** recalculé el rescate al 26/10/2026: la Moderada da volatilidad 7,9 % contra 19,8 % de promedio ponderado individual, con Sharpe 2,75; la Agresiva, Sharpe 1,15.
- **Por qué le importa al alumno:** puede llevarse la idea de que diversificar casi elimina el riesgo, o pensar que su Sharpe 2,75 es un error.
- **Cómo mejorarlo:** agregar un "Para discutir" en P5: "En estos datos los activos se mueven de forma independiente; en la realidad las acciones suelen tener correlación positiva, así que la diversificación ayuda menos. ¿Qué Sharpe esperarían con datos reales?"
- **Esfuerzo:** S

#### H14 · Dos juegos de roles y benchmark que no coincide
- **Dónde:** roles del taller en `paso-0.html:51` (piloto/redactor/auditor/presentador) contra los de la terminal en `index.html:1806-1809` (coordina/sigue el flujo/opera n8n/relata); el diagrama P0 nombra solo tres (`diagramas/src/p0-preparar.workflow.json`, "piloto · redactor · auditor"); el benchmark de la terminal es equiponderado solo entre los activos de la cartera (`index.html:638`), mientras el taller dice "de todos los activos" (`paso-5.html:59,100`; `finlab.template.html:247`).
- **Qué observé:** las mismas ideas tienen nombres o definiciones distintas según la página.
- **Por qué le importa al alumno:** en el cierre cambia la dinámica del grupo y la comparación "lo que hicimos vs la terminal" no cierra.
- **Cómo mejorarlo:** mapear roles en `paso-9.html:108` ("piloto → opera n8n, auditor → sigue el flujo, redactor → coordina, presentador → relata"); sumar "presentador" al diagrama P0; aclarar en P5 que la terminal compara contra "equiponderada de los activos de la cartera".
- **Esfuerzo:** S

#### H15 · Contraste bajo en textos con instrucciones
- **Dónde:** `docs/automatizaciones/lab.css:9` y `taller.css:98` (`--dim:#54677A` sobre `#0B0F13`), aplicado en `lab.css:97` (`.prompt-h .d`, 12 px, p. ej. "Pegar debajo el archivo del paso 3") y `lab.css:111` (etiquetas del constructor, 9,5 px).
- **Qué observé:** contraste calculado de 3,30:1 en tema oscuro, por debajo del 4,5:1 de WCAG AA.
- **Por qué le importa al alumno:** con proyector o notebook vieja no se lee justo la instrucción de qué pegar.
- **Cómo mejorarlo:** usar `--mut` (5,79:1) en `.prompt-h .d` y `.field label`, y subir esas etiquetas a 11 px como mínimo.
- **Esfuerzo:** S

#### H16 · Falta advertir sobre datos personales y credenciales
- **Dónde:** `paso-0.html:72-79`; `paso-8.html:90`.
- **Qué observé:** se cuida que no haya claves en los nodos (`paso-8.html:107,126`), pero no se dice que no se peguen datos personales o de la empresa en el chat de IA, ni que hay que borrar la credencial de correo de una cuenta n8n compartida.
- **Por qué le importa al alumno:** son profesionales de finanzas; es el hábito que se llevan al trabajo.
- **Cómo mejorarlo:** en P0: "**Regla del grupo:** al chat de IA no se pega nada que no publicarían: ni datos de clientes, ni carteras reales, ni contraseñas." En P8: "Si crean una credencial en una computadora o cuenta compartida, bórrenla al terminar (Credentials → ⋯ → Delete)."
- **Esfuerzo:** S

#### H17 · El "caso vacío" de P8 obliga a editar JavaScript
- **Dónde:** `paso-8.html:125`.
- **Qué observé:** pide cambiar umbrales y quitar una condición dentro del nodo Code, sin decir dónde ni cómo.
- **Por qué le importa al alumno:** es la única comprobación que exige tocar código.
- **Cómo mejorarlo:** agregar al prompt de P8 "dejá los umbrales y la señal en constantes al principio del código (`const RSI_ALTO = 70`, `RSI_BAJO = 30`, `SENAL = 'VENTA'`)", como ya hace `aviso-senal.json` con `const SENAL`; la comprobación pasa a ser "cambien RSI_ALTO a 99, RSI_BAJO a 1 y SENAL a 'NINGUNA'".
- **Esfuerzo:** S

## Recorrido del alumno
Los tiempos nominales suman 165 minutos; la estimación real total es de unas 4 horas.

| Paso | Dónde se traba un alumno sin programación | Tiempo nominal | Estimación real |
|---|---|---|---|
| P0 | Si después se cierra el chat, la instrucción lo manda al ítem equivocado (H6). | 10 min | 10–15 min |
| P1 | Guardar desde el Bloc de notas sin que quede `.html.txt` (bien advertido en `paso-1.html:84`); en Mac, TextEdit sigue siendo frágil. | 15 min | 25–30 min |
| P2 | Pegar en la consola está bloqueado (H4); "simulateSeries is not defined" está bien cubierto (`paso-2.html:120`). | 15 min | 20 min |
| P3 | La misma traba de la consola; comparar la tabla con la calculadora sale bien. | 15 min | 20 min |
| P4 | La configuración regional de Sheets y la fila exacta del `=PROMEDIO`; es el paso más denso. | 20 min | 30 min |
| P5 | No tiene contra qué comparar la volatilidad de KO (H5). | 20 min | 25 min |
| P6 | Fluido; la diferencia de nombres con la API aparece recién en P8 (H11). | 15 min | 20 min |
| P7 | Dos tareas en un paso (Colab y la pestaña 03); un ❌ falso si el RSI arranca distinto (H2). | 20 min | 30–35 min |
| P8 | Cuenta de n8n, URL de Vercel, importar el JSON de la IA y un ejemplo que no coincide (H1); sin rescate (H7). | 20 min | 30–40 min |
| P9 | Servidor local sin Python ni Node, respuestas visibles (H3) y auditoría cruzada (H8). | 15 min | 35–45 min |

## Riesgos que no pude verificar
- **Respuestas cortadas en el chat gratuito a partir de P6.** Los archivos de rescate v6/v7 pesan 23–27 KB (unos 7–8 mil tokens de salida). Prueba: pegar `finlab-v5.html` con el prompt 6 en ChatGPT, Gemini y Claude gratuitos y ver si devuelven el archivo completo o si "seguí desde donde cortaste" deja el archivo pegable.
- **La URL de Vercel desplegada.** No pude confirmar que exista; sin ella fallan P8 y el notebook `finlab-api.ipynb`. Prueba: `curl https://<tu-proyecto>.vercel.app/api/market/summary` tiene que devolver `ok: true` y 8 tickers (`README.md:42`). *(Resuelto después: ver la nota del principio.)*
- **Desde dónde abren los alumnos el taller.** `docs/taller/index.html:69-75` no lo dice, y la carpeta del proyecto recién se reparte en P9 (`paso-9.html:78`). Prueba: si se abre con doble clic (`file://`), verificar que los botones "BAJAR LA VERSIÓN DE RESCATE" con atributo `download` descarguen como `finlab.html` y no abran el archivo.
- **La terminal raíz con doble clic.** `index.html` no usa `fetch` ni módulos, así que probablemente funciona sin servidor. Prueba: doble clic en `index.html`, ir a `#/guiado` y descargar el JSON; si funciona, es el plan C de P9.
- **La frase del aviso de pegado en Chrome en castellano.** No sé si es `allow pasting` o una frase traducida. Prueba: en una computadora del aula, abrir DevTools por primera vez y pegar.
- **Google Sheets con región "Estados Unidos".** No confirmé si `=PROMEDIO` se sigue aceptando o hace falta `=AVERAGE`. Prueba: importar `finlab-AAPL.csv` y probar las dos fórmulas.
- **n8n Cloud versión de prueba.** Falta confirmar que importe nodos `httpRequest` 4.2, `if` 2.2 y `emailSend` 2.1 sin error, y qué ve el alumno cuando el nodo de email falla por falta de credencial. Prueba: importar `aviso-senal.json` y ejecutarlo con la URL real.
- **Colab y `files.upload()`.** Puede fallar con cookies de terceros bloqueadas o en Safari. Prueba: correr el bloque A en el navegador del aula y, si falla, documentar la alternativa de subir el archivo desde el panel 📁 de la izquierda.
- **Legibilidad de los diagramas Archify en celular y proyector.** No leí los `.html` generados. Prueba: abrir `diagramas/p4-indicadores.html` a 360 px de ancho y en el proyector.

No leí los HTML generados de los diagramas, `docs/monitor-mercado.html` ni a fondo los ejemplos de `docs/automatizaciones/`. Antes de corregir maquetas o tiempos, conviene una prueba en seco con un chat de IA gratuito.
