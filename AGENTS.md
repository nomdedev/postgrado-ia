# AGENTS.md — Postgrado-IA (FIN·LAB)

Demo didáctica del postgrado de IA: sitio HTML autocontenido (`index.html`), endpoint público
`api/market/summary.js` (Vercel), workflow n8n importable (`n8n/`), notebook Colab (`notebooks/`),
documentación Archify (`docs/`) y tests con `node --test` (`test/`).

## Proceso Uniforme de Agentes (Graph Engineering)

Este proyecto sigue el proceso uniforme definido en `D:\martin\Proyectos\_agent-package\`.
Grafo: `.claude/graph/agent-graph.json` · Estado: `.claude/state/STATE.md` · Visión: `.claude/VISION.md`.

### Regla EVAL REPORT (obligatoria)

Cada interacción que **edite archivos o ejecute comandos** DEBE:

1. **PRE-EVAL**: `node scripts/loops/agent-graph-runner.js --phase pre`
2. Ejecutar el cambio.
3. **POST-EVAL**: `node scripts/loops/agent-graph-runner.js --phase post`
4. Al final, incluir el bloque:

```
═══ EVAL REPORT ═══
PRE:  <evals> → ✅/❌
POST: <evals> → ✅/❌
Files touched: <archivos> (<tipo>)
Veredict: ✅ All evals passed | ❌ HARD STOP
```

Si un eval falla → **DETENER**, reportar, no continuar.

Tareas solo lectura → NO ejecutar evals.

### Hard stops

- 100k tokens máx · 5 iteraciones máx · 10 min máx · `onEvalFailure: STOP_AND_REPORT`

### Integración con Hermes

- **Hermes = orquestador externo** (flota de perfiles, cron, entrega).
- **agent-graph = gatekeeper del repo**. Todo perfil Hermes que toque archivos aquí
  ejecuta `graph:pre` / `graph:post` igual que el agente interactivo.
- Los prompts de crons LLM se versionan en `.hermes/prompts/`; solo el schedule vive en Hermes.

### WIP

- Máximo **1** feature en `in_progress` (ver `.claude/state/STATE.md`).