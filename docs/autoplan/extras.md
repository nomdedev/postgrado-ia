# Extras del taller

**Archivos:** `docs/taller/errores.html`, `docs/taller/traza.html`, `docs/taller/backtest.html`, `docs/taller/retos.html`, `docs/taller/kit.html`, `docs/taller/glosario.html`

## Medidas

| | Lectura | Oraciones largas | Notas |
|---|---:|---:|---:|
| Antes | 6270 | 31 | 8 |
| Después | 3152 | 21 | 7 |

## Docente didáctico (¿se entiende fácil?)

_Auditoría 2026-11-03._

- H5 · backtest: definir "comprar y mantener" y nombrar el sesgo como "mirar el futuro (look-ahead)": "contar el retorno de hoy con una señal que recién se conoce al cierre".
- H9 · el reto 5 enseña el error que backtest advierte (sin desfase de un día ni costos): resuelto si se borra o se enlaza a backtest.
- H12 · agregar al glosario: anualizar, desvío estándar, backtest, sesgo de anticipación, comprar y mantener, traza, tope de pasos (≤15 palabras cada una).

## Simplificador (¿qué sobra?)

_Auditoría 2026-11-03. Los ahorros son estimaciones del agente._

- I3 · errores: cada error en título + tabla + UNA línea "Se detecta" + prompt (~90 palabras en vez de ~170); BORRAR el error 5 (dividendos, sin cuenta posible) y pasar "Cómo usarlo en clase" a la hoja docente. 1.115 → ~700.
- I4 · jerga sin glosario en errores, backtest y traza: "Wilder" → "suavizado estándar", "retorno aritmético" → "promedio diario por 252", "reparo" → "objeción".
- I5 · backtest: aviso de 3 líneas → una; dejar solo la viñeta "Mirar el futuro". 703 → ~580.
- I6 · traza: "simulado" aparece 5 veces; borrar "Un solo agente contra el comité" y "Qué mirar en una traza real" (van al paso 13 o al docente). 785 → ~575.
- I9 · retos: de 10 a 6 (borrar 2, 5, 9 y 10; el 5 se reemplaza por un enlace a backtest). ~820 palabras.
- M2 · glosario: borrar entradas de programación que el alumno no ve (Babel, Recharts, Componente, Función, Variable, Lista, Objeto, localStorage). ~170 palabras.

## Cambios aplicados

- errores: de 5 a 4 errores, una línea "Se detecta" por error, sin jerga; traza: sin comparación ni lista de qué mirar, "reparo" → "objeción", un solo aviso; backtest: aviso de una línea y una sola viñeta, con enlaces al glosario; retos: de 10 a 6 (el backtest remite a su página).
- Glosario: fuera Babel, Recharts, Componente, Función, Variable, Lista, Objeto y localStorage; nuevas: anualizar, desvío estándar, backtest, sesgo de anticipación, comprar y mantener, traza, tope de pasos; frases más claras en volatilidad, Sharpe, covarianza, credencial, agente y MCP.

## Pasada 2 (2026-11-03)

**Docente:** referencias rotas arregladas (cuatro cuentas, objeción, paso 13), retos renumerados 1–6, brecha del dólar definida, comprobación de correlación sin código, aclaración del error 3, ejemplo en la regla del backtest. Definiciones reescritas: RSI, sesgo de anticipación, anualizar (con el ejemplo 1,5 % × 15,9), correlación, máxima caída.

**Simplificador:** glosario de 80 a 57 entradas (fuera código, JavaScript, navegador, CDN, React, router, endpoint, HTTP, status, serie, KPI, cartera, retorno, desvío, localhost, puerto, terminal, Python, pandas, matplotlib, EMA, importar y costo; lo necesario quedó dentro de anualizar, colab, workflow, token, sma y servidor-local); 36 entradas más cortas; cabecera y pager del glosario fuera. Retos: sin tiempo ni requisitos repetidos en cada uno (están en el menú) y sin la línea de copiar. Kit: sin subtítulos de tarjetas, sin filas sin archivo, sin pager. Traza: sin la tabla del auditor y con tres objeciones. Backtest: lede, regla y aviso más cortos. Errores: sin chip, sin hint, etiqueta PROMPT.

**Conflicto resuelto:** el simplificador pedía borrar prompt-contexto, chat, versión, equiponderada y volatilidad; se conservaron porque los pasos 0, 5 y 9 usan esas palabras (veto del docente: sin reemplazo).

**Escalón 2 (aplicado):** reto 6 borrado (duplicaba una automatización; quedan 5 retos y el test pide 5), tarjetas del kit borradas (queda la tabla de archivos) y entrada hash fuera. **No se aplicó** borrar maxima-caida, tope-pasos, if-node, sparkline, base-100 y normalizar: los pasos 3, 5, 8 y 12 usan esas palabras y no hay reemplazo (veto del docente).

**Cierre:** dos pasadas y la parte queda en 3.152 palabras contra 2.700. La diferencia es casi toda del glosario (~1.360), que es una página de consulta y no de lectura; el tope de 450 por página no le corresponde. Se sigue con la próxima parte.

## Estado

Cerrada tras dos pasadas el 2026-11-03 · lectura 3.152 de 2.700 palabras; el excedente es el glosario (consulta, no lectura)
