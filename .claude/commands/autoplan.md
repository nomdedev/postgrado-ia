---
description: Mejora una parte del material (un paso, el mapa, los extras…) con el docente didáctico y el simplificador, y la mide contra un presupuesto de texto
argument-hint: "[parte | clase N | todo]  (ej: p4, clase 3). Sin argumento: la parte que más se pasa"
---

# /autoplan

Ciclo: **medir → auditar con los dos agentes → recortar → volver a medir**. Una parte por vez (WIP = 1).
Las partes y sus archivos están en `docs/autoplan/partes.json`; el estado, en `docs/autoplan/ESTADO.md`; el plan de cada parte, en `docs/autoplan/<id>.md`.

## Pasos

1. **Elegir la parte.** `node scripts/loops/autoplan.js`. Con `$ARGUMENTS` vacío, la de más palabras de lectura. `clase N` o `todo` = una parte por iteración, de la más pesada a la más liviana.
2. **PRE-EVAL.** `node scripts/loops/agent-graph-runner.js --phase pre`.
3. **Auditar, en paralelo y solo lectura.** Lanzá los dos agentes sobre los archivos de la parte:
   - `docente-didactico`: ¿se entiende fácil lo difícil? Frase de máximo 15 palabras o ejemplo numérico para cada concepto que no se entienda al primer contacto.
   - `simplificador-implacable`: ¿qué sobra? Recorte exacto (qué se borra, qué queda) y ahorro en palabras.
   Pegá un resumen de cada uno en las secciones del `docs/autoplan/<id>.md` y la medida "Antes".
4. **Reconciliar.** Si el docente pide explicar más y el simplificador pide borrar:
   - gana la versión **más corta que sigue entendiéndose**;
   - el docente tiene veto solo para quitar una explicación **sin dejar un reemplazo** (una frase o un ejemplo);
   - el simplificador tiene la última palabra sobre todo lo demás.
5. **Aplicar.** Editás vos (los agentes no editan). No tocar: los números verificados (tienen test), el aviso de "datos simulados / no es asesoramiento" del pie, los ids y enlaces que usan los tests.
6. **POST-EVAL.** `node scripts/loops/agent-graph-runner.js --phase post`, `node --test`, `node docs/taller/build.js --check` y `node scripts/loops/autoplan.js`. Completá la medida "Después" y los "Cambios aplicados" en `docs/autoplan/<id>.md`.
7. **Cerrar la parte** cuando: lectura ≤ máximo, ≤ 3 oraciones largas, ningún hallazgo 🔴 pendiente y los tests en verde. Si en 2 pasadas no baja del presupuesto, anotá por qué en el archivo de la parte y seguí con la próxima.

## Reglas

- Hard stops: 100k tokens, 5 iteraciones, 10 minutos (ver `AGENTS.md`). Si un eval falla, **detenerse y reportar**.
- Cerrá con el bloque `EVAL REPORT` de `AGENTS.md`.
- No hacer commit ni push sin pedirlo.
