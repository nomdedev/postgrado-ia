# FIN·LAB · Postgrado de IA

Demo didáctica para explicar análisis de mercado, automatizaciones con n8n y consultas desde Google Colab. El sitio es un HTML autocontenido; Vercel sirve además una función HTTP pública para que n8n y Colab puedan consultar una URL real.

> **Datos educativos:** los precios y señales del endpoint son una muestra fija. No son cotizaciones en tiempo real, recomendaciones de inversión ni datos persistentes.

**Publicado en:** https://postgrado-ia.vercel.app · taller: https://postgrado-ia.vercel.app/docs/taller/ · API: https://postgrado-ia.vercel.app/api/market/summary

## Contenido

- `index.html`: aplicación y modo guiado para estudiantes.
- `api/market/summary.js`: endpoint público `GET /api/market/summary`.
- `n8n/monitor-mercado-vercel.json`: workflow importable que consulta el endpoint y separa las señales de venta.
- `notebooks/finlab-api.ipynb`: cuaderno para abrir en Google Colab.
- `docs/monitor-mercado.html`: explicación visual interactiva hecha con Archify.
- `docs/monitor-mercado.workflow.json`: fuente editable del diagrama Archify.
- `docs/taller/`: taller en grupo de 10 pasos interconectados (de la hoja en blanco a `#/guiado`) con diagramas Archify, glosario para no programadores y prompts/código con botón de copiar. Fuentes de los diagramas en `docs/taller/diagramas/src/`, generadas por `node docs/taller/diagramas/fuentes.js`; los HTML se producen con la skill Archify (2.17.0-dev.1), como explica la cabecera de ese archivo. El encabezado, la barra de pasos (agrupada por clase) y el pie de las páginas del taller se sincronizan con `node docs/taller/build.js` (marcadores `<!-- @top -->`, `@nav` y `@pie`); un test avisa si alguna quedó desactualizada. Las versiones de rescate (`docs/taller/rescate/finlab-v1..v7.html` y `finlab-AAPL.csv`) se generan desde `finlab.template.html` con `node docs/taller/rescate/build.js`; correrlo después de tocar la plantilla o los bloques Python de `paso-7.html`.
- `docs/automatizaciones/`: cuatro ejemplos de automatización (aviso de señal, resumen de cartera, informe con IA y precios a Sheets) con guía paso a paso, prompts copiables y workflow n8n descargable.

El playground de la aplicación conserva una simulación local con `localStorage`. No es el servicio público. El endpoint de Vercel es de solo lectura y no guarda alertas ni jornadas.

## Recorrer los ejemplos de automatización

Abrí `docs/automatizaciones/index.html` (o `/docs/automatizaciones` en Vercel). Cada ejemplo tiene la misma estructura: qué resuelve, cómo funciona, cómo armarlo en n8n, qué pedirle a la IA y cómo verificarlo. Al final de cada página hay un botón para descargar el workflow `.json` y bloques de prompt con botón de copiar.

Los workflows ya apuntan a la API del curso (`https://postgrado-ia.vercel.app`) y traen marcadores (`tu-correo@ejemplo.com`, `TU_ID_DE_PLANILLA`): hay que completarlos y conectar las credenciales en n8n. No incluyen claves ni tokens. Las páginas comparten `docs/automatizaciones/lab.css` y `lab.js`, así que hay que servirlas desde esa carpeta (no alcanza con bajar un HTML suelto).

## Probar localmente

Requiere Node.js 20 o posterior.

```powershell
node --test
npx vercel dev
```

Abrí la URL local que informa Vercel CLI. El endpoint de ejemplo queda en `/api/market/summary`.

## Publicar para el curso

1. Creá un repositorio vacío en GitHub.
2. Desde esta carpeta, inicializá Git y subí la rama principal al repositorio. No subas claves ni archivos `.env`.
3. En Vercel, elegí **Add New → Project**, importá el repositorio y dejá la raíz y el comando de build vacíos. El proyecto es HTML estático más una función Node.js.
4. Esperá el despliegue y probá `https://TU-PROYECTO.vercel.app/api/market/summary`. La respuesta debe tener `ok: true` y ocho elementos en `data.tickers`.
5. Compartí la URL del sitio y la del endpoint con el curso.

No puedo publicar el proyecto en una cuenta de GitHub o Vercel desde este espacio local; después de crear y conectar el repositorio, Vercel hará el despliegue automáticamente en cada push.

## Usar el workflow en n8n

1. Descargá `n8n/monitor-mercado-vercel.json` desde el repositorio.
2. En n8n, importá el archivo como workflow.
3. El nodo **Consultar API FIN·LAB** ya apunta a `https://postgrado-ia.vercel.app/api/market/summary`. Si publicaste tu propio despliegue, cambiá esa URL.
4. Ejecutá manualmente el workflow. La muestra incluye una señal `VENTA` para que se pueda observar la rama positiva.
5. El workflow solo prepara un resultado de demostración; no envía emails ni mensajes.

Para usar un horario, agregá o sustituí el disparador manual por **Schedule Trigger** después de probar el recorrido. No lo actives con demasiada frecuencia: el endpoint es fijo y educativo.

## Usar el notebook en Colab

1. Abrí `notebooks/finlab-api.ipynb` en GitHub y elegí **Open in Colab**, o descargalo y subilo desde Google Colab.
2. La celda de configuración ya apunta a la API del curso; cambiala solo si usás tu propio despliegue.
3. Ejecutá las celdas en orden para consultar y filtrar la misma respuesta usada por n8n.

Cuando el repositorio ya tenga dueño y nombre, el acceso directo se puede formar así:

```text
https://colab.research.google.com/github/USUARIO/REPOSITORIO/blob/main/notebooks/finlab-api.ipynb
```

## API educativa

`GET /api/market/summary` no requiere autenticación ni parámetros. Permite CORS para facilitar el uso desde notebooks; solo expone una muestra fija y rechaza métodos de escritura. No se deben enviar credenciales, datos personales ni órdenes de trading a esta demo.

## Auditoría didáctica del material

El proyecto trae un agente de Claude Code, `docente-didactico` (`.claude/agents/docente-didactico.md`), que audita todo el material de clase desde la mirada de un alumno de finanzas que no programa. Devuelve un informe con veredicto GO/NO-GO, puntaje por dimensión (claridad, progresión, exactitud financiera, verificabilidad, robustez en el aula, trabajo en grupo, consistencia, accesibilidad y advertencias) y hallazgos priorizados con `archivo:línea` y cómo mejorarlos. Solo lee: no modifica archivos.

Para usarlo, en Claude Code dentro de esta carpeta: *"usá el agente docente-didactico para auditar el taller"*. Los informes se guardan en `docs/auditorias/`.
