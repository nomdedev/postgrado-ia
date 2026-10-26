// Genera las versiones de rescate del taller a partir de finlab.template.html.
// Uso: node docs/taller/rescate/build.js
//   → finlab-v1.html … finlab-v7.html (lo que tendría el grupo al terminar cada paso)
//   → finlab-AAPL.csv (CSV de respaldo para el paso 7, mismo formato que "Exportar CSV")
//   → aviso-rsi.json y aviso-rsi-sin-url.json (workflows de rescate del paso 8)
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = __dirname;
const VERSIONES = 7;
const template = fs.readFileSync(path.join(DIR, 'finlab.template.html'), 'utf8');

// Conserva las líneas cuyos bloques "@if N" cumplen N <= version. Admite @else y anidamiento.
function recortar(texto, version) {
  const pila = [];
  const salida = [];
  const marca = (nombre) => new RegExp(`^\\s*(?://|<!--|\\{/\\*)\\s*@${nombre}\\b`);
  for (const linea of texto.split('\n')) {
    const si = linea.match(/^\s*(?:\/\/|<!--|\{\/\*)\s*@if (\d+)/);
    if (si) { pila.push(version >= Number(si[1])); continue; }
    if (marca('else').test(linea)) { pila.push(!pila.pop()); continue; }
    if (marca('endif').test(linea)) { pila.pop(); continue; }
    if (pila.every(Boolean)) salida.push(linea);
  }
  if (pila.length) throw new Error(`@if sin cerrar en la versión ${version}`);
  return salida.join('\n');
}

// Los bloques Python salen de paso-7.html: una sola fuente para la página y para la v7.
function bloquesPython() {
  const pagina = fs.readFileSync(path.join(DIR, '..', 'paso-7.html'), 'utf8');
  const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const codigo = (id) => {
    const m = pagina.match(new RegExp(`<pre id="${id}">([\\s\\S]*?)</pre>`));
    if (!m) throw new Error(`paso-7.html no tiene el bloque #${id}`);
    return decode(m[1]);
  };
  return [
    { titulo: 'A · Leer el CSV', explica: 'Sube el archivo que exportaste y muestra las últimas filas. Es como abrirlo en una planilla.', codigo: codigo('cA') },
    { titulo: 'B · Recalcular y comparar', explica: 'Vuelve a calcular las medias y el RSI con Python y dice cuánto difieren de la página. Si sale ✅, coinciden.', codigo: codigo('cB') },
    { titulo: 'C · Graficar', explica: 'Dibuja el precio y las dos medias, para compararlo a ojo con el gráfico de la terminal.', codigo: codigo('cC') }
  ];
}

const bloques = JSON.stringify(bloquesPython(), null, 2);
for (let v = 1; v <= VERSIONES; v++) {
  const html = recortar(template, v)
    .replace(/<!-- Plantilla[\s\S]*?-->\n/, '')
    .replace(/\{\{V\}\}/g, String(v))
    .replace('{{BLOQUES}}', bloques);
  fs.writeFileSync(path.join(DIR, `finlab-v${v}.html`), html);
}

// CSV de respaldo: ejecuta las funciones de datos e indicadores de la v4 fuera del navegador.
const datos = recortar(template, 4).match(/<script id="finlab-datos">([\s\S]*?)<\/script>/)[1];
const ctx = {};
vm.runInNewContext(datos, ctx);
const aapl = ctx.TICKERS.find((t) => t.symbol === 'AAPL');
const serie = ctx.simulateSeries(aapl);
const cierres = serie.map((x) => x.c);
const [s20, s50, r14] = [ctx.sma(cierres, 20), ctx.sma(cierres, 50), ctx.rsi(cierres, 14)];
const vacio = (x) => (x == null ? '' : x.toFixed(2));
const filas = ['fecha,cierre,sma20,sma50,rsi14', ...serie.map((x, i) => [x.d, x.c.toFixed(2), vacio(s20[i]), vacio(s50[i]), vacio(r14[i])].join(','))];
fs.writeFileSync(path.join(DIR, 'finlab-AAPL.csv'), filas.join('\n') + '\n');

// ===== Rescate del paso 8: el workflow de n8n ya adaptado (señal VENTA o RSI fuera de 30–70) =====
// Los umbrales quedan en constantes al principio del nodo Code para probar el caso vacío sin tocar la lógica.
const FILTRO = `// Para probar el caso vacío: RSI_ALTO = 99, RSI_BAJO = 1 y SENAL = 'NINGUNA'.
const RSI_ALTO = 70;
const RSI_BAJO = 30;
const SENAL = 'VENTA';

const response = $input.first().json;
if (!response.ok || !response.data || !Array.isArray(response.data.tickers)) {
  throw new Error('La API no devolvió una lista de activos válida.');
}

const avisos = [];
for (const t of response.data.tickers) {
  const motivos = [];
  if (t.signal === SENAL) motivos.push('señal de ' + SENAL.toLowerCase());
  if (t.rsi14 > RSI_ALTO) motivos.push('RSI mayor a ' + RSI_ALTO);
  if (t.rsi14 < RSI_BAJO) motivos.push('RSI menor a ' + RSI_BAJO);
  if (motivos.length) {
    avisos.push('- ' + t.symbol + ': ' + t.last + ' USD · RSI ' + t.rsi14 + ' · señal ' + t.signal + ' → motivo: ' + motivos.join(' y '));
  }
}

return [{
  json: {
    session: response.data.session,
    hayAvisos: avisos.length > 0,
    cantidad: avisos.length,
    asunto: 'FIN·LAB · ' + avisos.length + ' activos para mirar',
    texto: avisos.length
      ? avisos.join('\\n') + '\\n\\nMuestra educativa fija de FIN·LAB. No es una recomendación de inversión.'
      : 'Sin activos para mirar en la sesión ' + response.data.session + '.'
  }
}];`;

// La muestra fija sale de api/market/summary.js: una sola fuente para la API y para el rescate sin internet.
const summarySrc = fs.readFileSync(path.join(DIR, '..', '..', '..', 'api', 'market', 'summary.js'), 'utf8');
const tickers = vm.runInNewContext(summarySrc.match(/const tickers = (\[[\s\S]*?\]);/)[1]);
const MUESTRA = `// Muestra fija: los mismos datos que devuelve https://postgrado-ia.vercel.app/api/market/summary
return [{ json: { ok: true, data: { session: new Date().toISOString().slice(0, 10), tickers: ${JSON.stringify(tickers)} } } }];`;

function workflowAvisoRsi(sinUrl) {
  const id = (n) => `8a000000-0000-4000-8000-00000000000${n}`;
  const fuente = sinUrl
    ? { parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: MUESTRA }, id: id(2), name: 'Muestra fija (sin internet)', type: 'n8n-nodes-base.code', typeVersion: 2, position: [480, 320] }
    : { parameters: { url: 'https://postgrado-ia.vercel.app/api/market/summary', options: { timeout: 10000 } }, id: id(2), name: 'Consultar API FIN·LAB', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [480, 320] };
  return {
    name: sinUrl ? 'FINLAB - Rescate paso 8 · aviso por señal y RSI (sin internet)' : 'FINLAB - Rescate paso 8 · aviso por señal y RSI',
    nodes: [
      { parameters: {}, id: id(1), name: 'Ejecutar a mano', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [240, 320] },
      fuente,
      { parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: FILTRO }, id: id(3), name: 'Filtrar avisos', type: 'n8n-nodes-base.code', typeVersion: 2, position: [720, 320] },
      { parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
          conditions: [{ id: id('a'), leftValue: '={{ $json.hayAvisos }}', rightValue: true, operator: { type: 'boolean', operation: 'true', singleValue: true } }],
          combinator: 'and' }, options: {} }, id: id(4), name: '¿Hay algo para avisar?', type: 'n8n-nodes-base.if', typeVersion: 2.2, position: [960, 320] },
      // Desactivado: el flujo corre sin credenciales. Para mandar el correo, conecten su cuenta y actívenlo.
      { parameters: { fromEmail: 'tu-correo@ejemplo.com', toEmail: 'destinatario@ejemplo.com', subject: '={{ $json.asunto }}', text: '={{ $json.texto }}', options: {} },
        id: id(5), name: 'Enviar aviso por email', type: 'n8n-nodes-base.emailSend', typeVersion: 2.1, position: [1200, 220], disabled: true },
      { parameters: {}, id: id(6), name: 'Sin novedades', type: 'n8n-nodes-base.noOp', typeVersion: 1, position: [1200, 420] }
    ],
    connections: {
      'Ejecutar a mano': { main: [[{ node: fuente.name, type: 'main', index: 0 }]] },
      [fuente.name]: { main: [[{ node: 'Filtrar avisos', type: 'main', index: 0 }]] },
      'Filtrar avisos': { main: [[{ node: '¿Hay algo para avisar?', type: 'main', index: 0 }]] },
      '¿Hay algo para avisar?': { main: [[{ node: 'Enviar aviso por email', type: 'main', index: 0 }], [{ node: 'Sin novedades', type: 'main', index: 0 }]] }
    },
    active: false,
    settings: { executionOrder: 'v1' },
    pinData: {},
    tags: []
  };
}
fs.writeFileSync(path.join(DIR, 'aviso-rsi.json'), JSON.stringify(workflowAvisoRsi(false), null, 2) + '\n');
fs.writeFileSync(path.join(DIR, 'aviso-rsi-sin-url.json'), JSON.stringify(workflowAvisoRsi(true), null, 2) + '\n');

console.log(`ok: finlab-v1..v${VERSIONES}.html + finlab-AAPL.csv (${serie.length} ruedas, hasta ${serie.at(-1).d}) + aviso-rsi.json + aviso-rsi-sin-url.json`);
