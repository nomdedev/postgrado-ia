# STATE — Postgrado-IA (FIN·LAB)

> Estado del proyecto. Regla: **WIP = 1** (una única tarea in_progress).
> Mantenido por `.claude/hooks/post-session-state-manager.js`.

**Última actualización**: 2026-10-24 (instalación del paquete uniforme de agentes)

## En progreso (in_progress)

- *(vacío)*

## Done

- REESTRUCTURA-TALLER (2026-10-26): etapas 0–5 del plan (docs/planes/2026-10-26-reestructura-taller.md): generador de diagramas en el repo, partes comunes con build.js y barra por clase, legibilidad, anatomía Hacer/Entender, bienvenida INICIO en la raíz, guía del docente (docs/docente, noindex, sin enlazar) y kit del grupo. Extras: redirecciones con barra final en vercel.json y tema unificado (finlab-tema). Pendiente: etapa 6 (opcionales).

- EVALS-REALES (2026-10-26): el runner no ejecutaba ningún eval (faltaba evals/ y los marcaba SKIPPED como aprobados; git diff no veía archivos nuevos). Ahora: evals/test-unit.js, typecheck.js y verify-only.js; un eval sin script falla; detección con git status. Verificado: frena con un test roto y con un error de sintaxis.

- AUDITORIA-H9-H15 (2026-10-26): maquetas con la muestra fija de la API, alcance de la semilla, API simulada con el formato publicado (change_pct + {ok,data}), Sharpe con unidades, discusión de correlación y benchmark, 4 roles en el diagrama P0 y contraste ≥ 5,5:1. Auditoría 2026-10-26 completa.

- AUDITORIA-H7-H8 (2026-10-26): rescate del paso 8 (aviso-rsi.json + versión sin internet, generados por build.js) y paso 9 con tres caminos (publicada, doble clic, 127.0.0.1:4173), tiempos 25+20 min y comandos de Mac/Windows corregidos. También H17 (constantes en el nodo Code).

- AUDITORIA-TOP5 (2026-10-26): aplicados H1–H5, H6 y H16 de docs/auditorias/2026-10-26-docente-didactico.md. Pendientes: ninguno.

- TALLER-RESCATE (2026-10-26): versiones de rescate v1–v7 + CSV de respaldo generados por `docs/taller/rescate/build.js`, enlazados desde los pasos 1–7; comprobaciones de cada paso verificadas en Chrome.

- TALLER-PASO-A-PASO (2026-10-26): `docs/taller/` con índice, glosario, pasos 0–9 y 11 diagramas Archify (showcase 9/9, visual-check pass); reemplaza `docs/automatizaciones/construir-finlab.html`. Test en `test/automatizaciones.test.js`.

- INSTALACIÓN-PAQUETE-AGENTES: `.claude/graph/agent-graph.json`, `scripts/loops/agent-graph-runner.js`, hooks de sesión, STATE.md, VISION.md y AGENTS.md creados.

## Next

- Definir la siguiente mejora de la demo (endpoint, workflow n8n o notebook) y marcarla como única in_progress.

## Riesgos / bloqueos

- *(ninguno)*

---

## Sesiones

<!-- El hook post-session-state-manager.js agrega aquí cada cierre de sesión -->