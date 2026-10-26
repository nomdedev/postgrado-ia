// Genera las versiones de rescate del taller a partir de finlab.template.html.
// Uso: node docs/taller/rescate/build.js
//   → finlab-v1.html … finlab-v7.html (lo que tendría el grupo al terminar cada paso)
//   → finlab-AAPL.csv (CSV de respaldo para el paso 7, mismo formato que "Exportar CSV")
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

console.log(`ok: finlab-v1..v${VERSIONES}.html + finlab-AAPL.csv (${serie.length} ruedas, hasta ${serie.at(-1).d})`);
