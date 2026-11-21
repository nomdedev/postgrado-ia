# FIN·LAB (Postgrado-IA)

Demo didáctica del postgrado de IA aplicada a Finanzas: una terminal de análisis de mercado, un taller que la construye paso a paso y automatizaciones de ejemplo para n8n y Colab. Este glosario nombra las cosas propias del proyecto; el vocabulario de clase para estudiantes vive en `docs/taller/glosario.html`.

## Producto y material didáctico

**FIN·LAB**:
Terminal de análisis de mercado y carteras con datos simulados que el taller enseña a construir.
_Dónde_: `index.html`, `README.md`
_Evitar_: la app, el sistema, trading

**Taller**:
Recorrido de quince pasos en tres clases para construir FIN·LAB con IA.
_Dónde_: `docs/taller/index.html`
_Evitar_: curso (el curso es el postgrado completo)

**Paso**:
Unidad del taller identificada P0–P14, con objetivo, pedido a la IA y comprobación humana.
_Dónde_: `docs/taller/paso-0.html` … `docs/taller/paso-14.html`
_Evitar_: clase, módulo

**Clase**:
Agrupación de pasos por momento del recorrido: ver y medir, sacarlo afuera, delegar en agentes.
_Dónde_: `docs/taller/index.html`, `docs/autoplan/partes.json`
_Evitar_: unidad, etapa (etapa es la otra agrupación de `index.html`)

**Nivel de IA**:
Grado de autonomía que se le pide a la IA en cada paso, de 1 (conversar) a 5 (orquestar).
_Dónde_: `docs/taller/index.html`
_Evitar_: dificultad

**Rescate**:
Copia de FIN·LAB al final de un paso, para descargar y seguir si el grupo se atrasó.
_Dónde_: `docs/taller/rescate/` (generado por `build.js`)
_Evitar_: backup, solución

**Kit del grupo**:
Página que reúne los prompts y todos los descargables del taller.
_Dónde_: `docs/taller/kit.html`
_Evitar_: kit de herramientas

**Retos**:
Cinco ejercicios cortos opcionales para practicar con otros ejemplos del curso.
_Dónde_: `docs/taller/retos.html`
_Evitar_: tareas, ejercicios (cada paso ya trae los suyos)

**Automatización de ejemplo**:
Flujo de n8n documentado con guía, prompt y JSON descargable.
_Dónde_: `docs/automatizaciones/`
_Evitar_: workflow a secas (workflow es el archivo de n8n)

**Guiado (#/guiado)**:
Pestaña «05 · AUTOMATIZAR» de la terminal terminada, donde se elige una señal y se descarga el workflow.
_Dónde_: `index.html` (`PAGES`), `docs/taller/paso-9.html`
_Evitar_: modo automático, wizard

**Docente-didáctico**:
Agente que audita el material desde la mirada de un alumno de finanzas que no programa; solo lee e informa.
_Dónde_: `.claude/agents/docente-didactico.md`, `docs/auditorias/`
_Evitar_: revisor, QA

**Veredicto GO/NO-GO**:
Resultado de una auditoría didáctica: el material sirve para clase (GO) o debe corregirse antes (NO-GO).
_Dónde_: `docs/auditorias/`, `.claude/agents/docente-didactico.md`
_Evitar_: aprobado/desaprobado

## Proceso del repositorio

**Autoplan**:
Proceso que simplifica una parte del material midiendo su texto contra un presupuesto de lectura.
_Dónde_: `scripts/loops/autoplan.js`, `docs/autoplan/partes.json`
_Evitar_: refactor de textos

**Parte**:
Unidad que mide el autoplan: una página o un grupo de páginas (mapa, p0…p14, extras, docente, automatizaciones, terminal).
_Dónde_: `docs/autoplan/partes.json`
_Evitar_: sección, página

**agent-graph**:
Grafo declarativo que ordena agentes y gates del repo; todo cambio pasa por su runner.
_Dónde_: `.claude/graph/agent-graph.json`, `scripts/loops/agent-graph-runner.js`
_Evitar_: pipeline de CI (CI es GitHub Actions, si existe)

**EVAL REPORT**:
Bloque obligatorio al cerrar una interacción que editó archivos: evals PRE y POST con veredicto.
_Dónde_: `AGENTS.md`, `scripts/loops/agent-graph-runner.js`
_Evitar_: resumen de tests

**WIP = 1**:
Regla de una sola feature `in_progress` a la vez en el estado del proyecto.
_Dónde_: `.claude/state/STATE.md`, `.claude/graph/agent-graph.json`
_Evitar_: límite de tareas

**Hermes**:
Orquestador externo de perfiles y cron; entrega trabajo, pero el gatekeeper de los archivos sigue siendo agent-graph.
_Dónde_: `AGENTS.md`
_Evitar_: el bot, el scheduler

## Mercado y datos

**Activo**:
Cada instrumento de la clase, identificado por su ticker (AAPL, GGAL…).
_Dónde_: `index.html` (`TICKERS`), `api/market/summary.js`
_Evitar_: acción (no todos son acciones), producto

**Rueda**:
Un día hábil de mercado; el año de la simulación tiene 252.
_Dónde_: `index.html` (`businessDaysBack`, `simulateSeries`)
_Evitar_: día, sesión (sesión es la fecha concreta)

**Sesión**:
Fecha de la última rueda disponible en la base; identifica la jornada que ven el usuario y la API.
_Dónde_: `index.html` (`buildMarket`), `api/market/summary.js`
_Evitar_: jornada (se usa como sinónimo en pantalla), fecha

**Muestra fija**:
Conjunto inmutable de ocho activos que publica la API educativa; no son cotizaciones reales.
_Dónde_: `api/market/summary.js`, `README.md`
_Evitar_: datos en vivo, precios reales

**Semilla**:
Número base (`SEED_BASE = 42`) que hace reproducibles todos los precios simulados.
_Dónde_: `index.html`
_Evitar_: random, aleatorio (la simulación es determinista)

**Backend simulado**:
Implementación de la API dentro del navegador, con las mismas rutas y respuestas que el servidor real; solo existe en el playground.
_Dónde_: `index.html` (sección 4, `api`)
_Evitar_: mock, servidor falso

**FINLAB-8**:
Índice sintético propio: los ocho activos con el mismo peso, base 100.
_Dónde_: `index.html` (`buildMarket`), `api/market/summary.js`
_Evitar_: índice de mercado, Merval

**Amplitud (breadth)**:
Cantidad de activos que suben frente a los que bajan en la sesión.
_Dónde_: `index.html` (`buildMarket`), `api/market/summary.js`
_Evitar_: volumen, ancho

## Indicadores y señales

**Medias móviles (SMA/EMA)**:
Promedios de cierres que usa la regla de tendencia: SMA de 20 y 50 ruedas, EMA de 12 y 26.
_Dónde_: `index.html` (`sma`, `ema`)
_Evitar_: promedio móvil sin aclarar si es simple o exponencial

**RSI 14**:
Indicador de 0 a 100 calculado sobre 14 ruedas; el proyecto lo usa para sobreventa (<30) y sobrecompra (>70).
_Dónde_: `index.html` (`rsiCalc`)
_Evitar_: RSI sin el período

**Señal**:
Etiqueta de tendencia de un activo: COMPRA, VENTA o NEUTRAL.
_Dónde_: `index.html` (`signalOf`)
_Evitar_: recomendación, orden

**Doble cruce**:
Regla que produce la señal: COMPRA si SMA20 > SMA50 y EMA12 > EMA26; VENTA si ambas están invertidas; NEUTRAL si discrepan.
_Dónde_: `index.html` (`signalOf`)
_Evitar_: cruce dorado (es otra regla)

## Carteras y riesgo

**Cartera**:
Conjunto de activos con pesos elegidos por el usuario, sobre el que se calculan las métricas.
_Dónde_: `index.html` (`analyzePortfolio`, `PortfolioSection`)
_Evitar_: portafolio, inversión

**Peso**:
Proporción de la cartera asignada a un activo; puede escribirse como fracción o porcentaje.
_Dónde_: `index.html` (`analyzePortfolio`, `PRESETS`)
_Evitar_: participación, porcentaje

**Preset**:
Cartera prearmada Conservadora, Moderada o Agresiva, usada como punto de partida.
_Dónde_: `index.html` (`PRESETS`)
_Evitar_: plantilla, perfil

**Normalizar pesos**:
Reescalar los pesos para que sumen 1 sin cambiar sus proporciones; el análisis siempre normaliza.
_Dónde_: `index.html` (`analyzePortfolio`)
_Evitar_: ajustar pesos

**Benchmark igual-ponderado**:
Cartera de referencia con el mismo peso en cada activo de la selección, contra la que se compara la cartera propia.
_Dónde_: `index.html` (`analyzePortfolio`, serie `b`)
_Evitar_: índice, FINLAB-8 (ese es el índice de los ocho)

**Base 100**:
Convención de los gráficos de evolución: todas las series arrancan en 100 para comparar porcentajes.
_Dónde_: `index.html` (`analyzePortfolio`, `hist`)
_Evitar_: valor inicial

**Tasa libre de riesgo**:
Retorno de referencia sin riesgo usado en el Sharpe; en la demo es 4,3 % anual (`RF = 0.043`).
_Dónde_: `index.html`
_Evitar_: tasa segura, TNA (la tasa no es nominal anual)

**Ratio de Sharpe**:
Exceso de retorno sobre la tasa libre de riesgo por unidad de volatilidad.
_Dónde_: `index.html` (`analyzePortfolio`)
_Evitar_: retorno ajustado por riesgo

**Correlación**:
Medida de −1 a 1 de cuánto se mueven juntos dos activos; la app muestra el promedio entre pares y el mapa de calor.
_Dónde_: `index.html` (`analyzePortfolio`, `corr`, `avgCorr`)
_Evitar_: covarianza (no está acotada)

**Contribución al riesgo**:
Parte de la volatilidad total que aporta cada activo; las contribuciones suman la volatilidad de la cartera.
_Dónde_: `index.html` (`analyzePortfolio`, `contrib`)
_Evitar_: peso (el peso no mide riesgo)

## Alertas y API

**Alerta**:
Regla guardada por el usuario (activo + condición + umbral) que se evalúa con la última sesión y puede estar disparada.
_Dónde_: `index.html` (`evaluateAlerts`, `CONDS`)
_Evitar_: notificación (la demo no envía avisos)

**Condición de alerta**:
Operador permitido de una alerta: precio o RSI por encima o por debajo de un umbral.
_Dónde_: `index.html` (`CONDS`)
_Evitar_: regla, filtro

**Playground**:
Consola de la pestaña «03 · API & Alertas» que ejecuta la API simulada y permite crear o borrar alertas.
_Dónde_: `index.html` (`ApiSection`)
_Evitar_: sandbox, demo (la demo es todo el producto)

**API educativa**:
Función pública de solo lectura `GET /api/market/summary` desplegada en Vercel, sin persistencia ni autenticación.
_Dónde_: `api/market/summary.js`, `vercel.json`
_Evitar_: backend (el backend real no existe), API de la terminal (esa es la simulada)

## Agentes

**Agente auditor**:
Segundo agente del laboratorio que revisa números y faltantes antes de entregar la respuesta; materializa «quien hace no se controla a sí mismo».
_Dónde_: `index.html` (`runAgent`, paso `audita`)
_Evitar_: QA, revisor automático

**Traza**:
Registro paso a paso de lo que hizo un agente: qué pensó, qué herramienta usó y qué respondió.
_Dónde_: `docs/taller/traza.html`, `index.html` (`runAgent`)
_Evitar_: log, historial
