# VISION — Postgrado-IA (FIN·LAB)

> Propósito anti-goal-drift. Revisar cada 3 meses.

## Propósito

Demo didáctica para un postgrado de IA: explicar análisis de mercado, automatización con n8n
y consultas desde Google Colab, con un sitio HTML autocontenido + endpoint Vercel de solo lectura.

## Objetivos

1. Material educativo claro, reproducible y sin dependencias frágiles.
2. Que cada cambio mantenga `node --test` en verde y el endpoint documentado.

## Anti-objetivos (NO hacer)

1. No es un servicio financiero real: los datos son muestras fijas, sin persistencia ni alertas reales.

## Principios

- La calidad se verifica con gates ejecutables, no con opinión.
- Maker ≠ Checker: quien escribe no califica su propio trabajo.
- Todo cambio pasa por el runner (`graph:pre` / `graph:post`).