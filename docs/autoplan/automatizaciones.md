# Ejemplos de automatización

**Archivos:** `docs/automatizaciones/index.html`, `docs/automatizaciones/aviso-senal.html`, `docs/automatizaciones/resumen-diario.html`, `docs/automatizaciones/informe-semanal-ia.html`, `docs/automatizaciones/precios-a-sheets.html`

## Medidas

| | Lectura | Oraciones largas | Notas |
|---|---:|---:|---:|
| Antes | 4833 | 21 | 14 |
| Después | 1576 | 13 | 0 |

## Docente didáctico (¿se entiende fácil?)

_Auditoría 2026-11-03._

- Fuera de foco del docente.

## Simplificador (¿qué sobra?)

_Auditoría 2026-11-03. Los ahorros son estimaciones del agente._

- M3 · en las cuatro: borrar "Qué resuelve" (~70), la nota de proveedores (~55) y la tabla "Qué hay que completar" (~50). ~175 por página, ~700 en total. Solo se leyó línea por línea informe-semanal-ia.

## Pasada 2 (2026-11-03)

**Simplificador (aplicado):** índice de 1.151 a ~330 palabras (sin tabla de ingredientes, reglas, constructor propio ni ruta sugerida); en las cuatro páginas: lede de una oración, sin chips, "Armalo paso a paso" de 3 pasos, "Cómo funciona" sin la explicación bajo cada nodo, "Hablá con la IA" con 2 prompts + constructor, "Cómo saber si funciona" de 2 bullets, "Límites" de 2–3 bullets, notas de "Qué resuelve" borradas.

**Docente (aplicado):** una línea por página dice qué completar (los dos marcadores de correo; en precios, cambiar By ID por From list); ya no dice "reemplazá la URL por tu dominio"; el índice define nodo, item, credencial y expresión en una línea cada una; la línea de la cartera avisa de las comas; append definido como "agregar al final".

**Conflicto resuelto:** el simplificador borraba las notas de advertencia; el docente las protegía. Se conservó lo que cambia lo que el alumno hace: el aviso del correo diario, la clave fuera del JSON y el costo por corrida, ahora como una línea en Límites.

**No aplicado:** constructor a 2 campos (no se probó que lab.js lo soporte) y los cambios de redacción de los prompts de código.

## Cambios aplicados

- En las cuatro: borrado el párrafo de "Qué resuelve" y la tabla "Qué hay que completar"; en informe-semanal-ia, también la nota de proveedores.

## Estado

Cerrada el 2026-11-03 · lectura 1576 de 2.250 palabras (dentro del presupuesto)

## Pasada 3 (2026-11-04)

- Nuevo ejemplo 05 "Calendario de eventos" (`calendario-eventos.html`, `workflows/calendario-eventos.json`, `api/market/calendar.js`): cron semanal, fechas de ejemplo calculadas desde hoy, sección "Cómo se programa: el cron".
- La secuencia de "Cómo funciona" de los cinco ejemplos ahora muestra el dato concreto que pasa por cada caja (por ejemplo, 6.628,2 USD en el resumen).
- Lectura: 2081 de 2700 (el máximo subió con la quinta página).
