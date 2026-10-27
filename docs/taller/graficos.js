// Gráficos del taller: genera SVG inline (tema claro/oscuro por CSS) dentro de cada paso, entre marcadores
//   <!-- @viz:pN --> … <!-- /@viz:pN -->
// Datos: la versión de rescate (precios simulados, fijados al 26/10/2026) y la muestra fija de la API del curso.
// Uso: node docs/taller/graficos.js            → reescribe los gráficos desactualizados
//      node docs/taller/graficos.js --check    → no escribe; falla si alguno está desactualizado
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = __dirname;
const FECHA = new Date('2026-10-26T12:00:00');
const FECHA_TXT = '26/10/2026';

// ---------- Datos ----------
const datosSrc = fs.readFileSync(path.join(DIR, 'rescate', 'finlab-v4.html'), 'utf8').match(/<script id="finlab-datos">([\s\S]*?)<\/script>/)[1];
const D = {};
vm.runInNewContext(datosSrc, D);
const SERIES = Object.fromEntries(D.TICKERS.map((t) => [t.symbol, D.simulateSeries(t, FECHA)]));
const NOMBRES = Object.fromEntries(D.TICKERS.map((t) => [t.symbol, t.name]));
const API = vm.runInNewContext(fs.readFileSync(path.join(DIR, '..', '..', 'api', 'market', 'summary.js'), 'utf8').match(/const tickers = (\[[\s\S]*?\]);/)[1]);
const PRESETS = {
  Conservadora: { JNJ: 30, KO: 25, PG: 25, MSFT: 20 },
  Moderada: { AAPL: 20, MSFT: 20, KO: 15, JNJ: 15, GGAL: 15, PG: 15 },
  Agresiva: { GGAL: 30, YPF: 25, PAM: 20, AAPL: 15, MSFT: 10 }
};
const RF = 0.043;

// ---------- Utilidades de dibujo ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (x, d = 2) => x.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
const r1 = (x) => Math.round(x * 10) / 10;
const escala = (d0, d1, r0, r1_) => (v) => r0 + ((v - d0) / (d1 - d0)) * (r1_ - r0);
function marcas(min, max, n = 5) {
  const paso0 = (max - min) / n, pot = Math.pow(10, Math.floor(Math.log10(paso0)));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * pot).find((p) => p >= paso0);
  const out = [];
  for (let v = Math.ceil(min / paso) * paso; v <= max + 1e-9; v += paso) out.push(+v.toFixed(10));
  return out;
}
const linea = (pts) => 'M' + pts.map(([x, y]) => `${r1(x)},${r1(y)}`).join('L');
const svg = (id, w, h, titulo, desc, cuerpo) =>
  `<svg class="viz-svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${id}-t ${id}-d"><title id="${id}-t">${esc(titulo)}</title><desc id="${id}-d">${esc(desc)}</desc>${cuerpo}</svg>`;
const figura = (id, titulo, idea, svgTxt, fuente) =>
  `<figure class="viz" id="${id}" data-titulo="${esc(titulo)}">\n      <div class="viz-grafico">${svgTxt}</div>\n      <figcaption><b>${esc(titulo)}.</b> ${idea}<small>${fuente}</small></figcaption>\n    </figure>`;

// ---------- P2 · Un año de precios: un panel por activo ----------
function p2() {
  const W = 960, H = 470, cols = 4, pw = 220, ph = 180, gx = 20, gy = 40, x0 = 10, y0 = 18;
  let cuerpo = '';
  D.TICKERS.forEach((t, i) => {
    const s = SERIES[t.symbol].map((x) => x.c);
    const px = x0 + (i % cols) * (pw + gx), py = y0 + Math.floor(i / cols) * (ph + gy);
    const min = Math.min(...s), max = Math.max(...s);
    const sx = escala(0, s.length - 1, px + 8, px + pw - 8), sy = escala(min, max, py + ph - 18, py + 46);
    const variacion = (s.at(-1) / s[0] - 1) * 100, sube = variacion >= 0;
    cuerpo += `<g class="viz-panel"><rect class="v-card" x="${px}" y="${py}" width="${pw}" height="${ph}" rx="8"/>` +
      `<text class="v-ink v-b" x="${px + 12}" y="${py + 22}">${t.symbol}</text>` +
      `<text class="${sube ? 'v-up' : 'v-dn'} v-b" x="${px + pw - 12}" y="${py + 22}" text-anchor="end">${sube ? '▲' : '▼'} ${num(variacion, 1)} %</text>` +
      `<text class="v-mut v-sm" x="${px + 12}" y="${py + 38}">${esc(NOMBRES[t.symbol])}</text>` +
      `<path class="v-s1 v-line" d="${linea(s.map((v, k) => [sx(k), sy(v)]))}"><title>${t.symbol}: de ${num(s[0])} a ${num(s.at(-1))} en un año</title></path>` +
      `<circle class="v-s1-fill" cx="${r1(sx(s.length - 1))}" cy="${r1(sy(s.at(-1)))}" r="4"/></g>`;
  });
  const desc = D.TICKERS.map((t) => { const s = SERIES[t.symbol]; return `${t.symbol} ${num((s.at(-1).c / s[0].c - 1) * 100, 1)} %`; }).join(', ');
  return figura('viz-p2', 'Un año de precios simulados', 'Cada activo tiene su carácter: algunos suben parejo, otros saltan mucho. Ese “saltar” es la <b>volatilidad</b>, y la van a medir en el paso 5.',
    svg('viz-p2', W, H, 'Un año de precios simulados de los 8 activos', 'Variación del año: ' + desc, cuerpo),
    `Datos: versión de rescate al ${FECHA_TXT} (252 ruedas). Los de su página van a ser otros.`);
}

// ---------- P3 · La variación del día: barras divergentes ----------
function p3() {
  const W = 960, H = 430, x0 = 170, x1 = 900, y0 = 30, fila = 46;
  const datos = [...API].sort((a, b) => b.change_pct - a.change_pct);
  const lim = Math.ceil(Math.max(...datos.map((d) => Math.abs(d.change_pct))));
  const sx = escala(-lim, lim, x0, x1), cero = sx(0);
  let cuerpo = marcas(-lim, lim, 4).map((v) => `<line class="v-grid" x1="${r1(sx(v))}" x2="${r1(sx(v))}" y1="${y0 - 6}" y2="${y0 + fila * datos.length}"/><text class="v-mut v-sm" x="${r1(sx(v))}" y="${y0 + fila * datos.length + 22}" text-anchor="middle">${num(v, 0)} %</text>`).join('');
  datos.forEach((d, i) => {
    const y = y0 + i * fila + 9, h = 28, sube = d.change_pct >= 0, xv = sx(d.change_pct);
    const x = Math.min(cero, xv) + (sube ? 1 : -1), w = Math.max(2, Math.abs(xv - cero) - 1);
    cuerpo += `<text class="v-ink v-b" x="${x0 - 14}" y="${y + 19}" text-anchor="end">${d.symbol}</text>` +
      `<rect class="${sube ? 'v-up-fill' : 'v-dn-fill'}" x="${r1(x)}" y="${y}" width="${r1(w)}" height="${h}" rx="4"><title>${d.symbol}: ${num(d.change_pct)} % en el día (cierra ${num(d.last)})</title></rect>` +
      `<text class="v-ink v-sm" x="${r1(sube ? xv + 8 : xv - 8)}" y="${y + 19}" text-anchor="${sube ? 'start' : 'end'}">${sube ? '▲ +' : '▼ '}${num(d.change_pct)} %</text>`;
  });
  cuerpo += `<line class="v-axis" x1="${r1(cero)}" x2="${r1(cero)}" y1="${y0 - 10}" y2="${y0 + fila * datos.length}"/>`;
  const suben = API.filter((d) => d.change_pct > 0).length;
  return figura('viz-p3', 'El mercado en un vistazo', `Una barra por activo: a la derecha los que subieron, a la izquierda los que bajaron. Hoy <b>${suben} suben y ${API.length - suben} bajan</b>; el que más se movió fue <b>${datos[0].symbol}</b>.`,
    svg('viz-p3', W, H, 'Variación del día de los 8 activos', datos.map((d) => `${d.symbol} ${num(d.change_pct)} %`).join(', '), cuerpo),
    `Datos: muestra fija de la API del curso (${FECHA_TXT}).`);
}

// ---------- P4 · Medias móviles y el cruce que da la señal ----------
function p4medias() {
  const VENTANA = 130;
  let elegido = null;
  for (const t of D.TICKERS) {
    const c = SERIES[t.symbol].map((x) => x.c), a = D.sma(c, 20), b = D.sma(c, 50);
    for (let i = c.length - 15; i > c.length - VENTANA + 10; i--) {
      if (a[i - 1] != null && b[i - 1] != null && (a[i - 1] - b[i - 1]) * (a[i] - b[i]) < 0) {
        if (!elegido || i > elegido.i) elegido = { t, c, a, b, i, alza: a[i] > b[i] };
        break;
      }
    }
  }
  const { t, c, a, b, i: ic, alza } = elegido;
  const ini = c.length - VENTANA, W = 960, H = 460, x0 = 70, x1 = 840, y0 = 24, y1 = 410;
  const tramo = (arr) => arr.slice(ini);
  const todos = [...tramo(c), ...tramo(a), ...tramo(b)].filter((v) => v != null);
  const min = Math.min(...todos), max = Math.max(...todos), pad = (max - min) * 0.06;
  const sx = escala(0, VENTANA - 1, x0, x1), sy = escala(min - pad, max + pad, y1, y0);
  let cuerpo = marcas(min - pad, max + pad, 5).map((v) => `<line class="v-grid" x1="${x0}" x2="${x1}" y1="${r1(sy(v))}" y2="${r1(sy(v))}"/><text class="v-mut v-sm" x="${x0 - 10}" y="${r1(sy(v)) + 5}" text-anchor="end">${num(v, 0)}</text>`).join('');
  const pts = (arr) => tramo(arr).map((v, k) => (v == null ? null : [sx(k), sy(v)])).filter(Boolean);
  const fechas = SERIES[t.symbol].slice(ini);
  [[c, 'v-ink-line', 'Precio'], [b, 'v-s2 v-line', 'SMA 50'], [a, 'v-s1 v-line', 'SMA 20']].forEach(([arr, cls, nombre]) => {
    const p = pts(arr), ult = p.at(-1);
    cuerpo += `<path class="${cls}" d="${linea(p)}"><title>${nombre}: último valor ${num(arr.at(-1))}</title></path>` +
      `<text class="v-ink v-sm v-b" x="${r1(ult[0] + 10)}" y="${r1(ult[1] + 5)}">${nombre}</text>`;
  });
  const cx = sx(ic - ini), cy = sy(a[ic]);
  cuerpo += `<line class="v-mark" x1="${r1(cx)}" x2="${r1(cx)}" y1="${y0}" y2="${y1}"/>` +
    `<circle class="v-ring" cx="${r1(cx)}" cy="${r1(cy)}" r="9"><title>Cruce el ${fechas[ic - ini].d}: la SMA 20 pasa ${alza ? 'por encima' : 'por debajo'} de la SMA 50</title></circle>` +
    `<text class="v-ink v-b" x="${r1(cx + (cx > 600 ? -14 : 14))}" y="${y0 + 18}" text-anchor="${cx > 600 ? 'end' : 'start'}">cruce ${alza ? 'al alza → COMPRA' : 'a la baja → VENTA'}</text>` +
    `<text class="v-mut v-sm" x="${x0}" y="${H - 14}">${fechas[0].d}</text><text class="v-mut v-sm" x="${x1}" y="${H - 14}" text-anchor="end">${fechas.at(-1).d}</text>`;
  return figura('viz-p4a', 'La señal nace de un cruce', `Cuando la media corta (SMA 20) cruza ${alza ? '<b>por encima</b>' : '<b>por debajo</b>'} de la larga (SMA 50), el precio cambió de tendencia: es la señal de <b>${alza ? 'COMPRA' : 'VENTA'}</b>. Acá, en ${t.symbol}.`,
    svg('viz-p4a', W, H, `Precio de ${t.symbol} con SMA 20 y SMA 50`, `Últimas ${VENTANA} ruedas; cruce ${alza ? 'al alza' : 'a la baja'} el ${fechas[ic - ini].d}`, cuerpo),
    `Datos: versión de rescate al ${FECHA_TXT}, últimas ${VENTANA} ruedas de ${t.symbol}.`);
}

function p4rsi() {
  const W = 960, H = 210, x0 = 60, x1 = 900, y = 100;
  const sx = escala(0, 100, x0, x1);
  let cuerpo = `<rect class="v-zone-dn" x="${x0}" y="${y - 40}" width="${r1(sx(30) - x0)}" height="80" rx="6"/>` +
    `<rect class="v-zone-up" x="${r1(sx(70))}" y="${y - 40}" width="${r1(x1 - sx(70))}" height="80" rx="6"/>` +
    `<line class="v-axis" x1="${x0}" x2="${x1}" y1="${y}" y2="${y}"/>` +
    [0, 30, 50, 70, 100].map((v) => `<line class="v-grid" x1="${r1(sx(v))}" x2="${r1(sx(v))}" y1="${y - 40}" y2="${y + 40}"/><text class="v-mut v-sm" x="${r1(sx(v))}" y="${y + 62}" text-anchor="middle">${v}</text>`).join('') +
    `<text class="v-mut v-sm v-b" x="${r1((x0 + sx(30)) / 2)}" y="${y - 52}" text-anchor="middle">SOBREVENTA</text>` +
    `<text class="v-mut v-sm v-b" x="${r1((sx(70) + x1) / 2)}" y="${y - 52}" text-anchor="middle">SOBRECOMPRA</text>`;
  const orden = [...API].sort((a, b) => a.rsi14 - b.rsi14);
  // Etiqueta directa solo para los que quedan afuera del rango; el resto se resume en una línea (y queda en el tooltip).
  orden.forEach((d) => {
    const x = sx(d.rsi14), afuera = d.rsi14 < 30 || d.rsi14 > 70;
    cuerpo += `<circle class="${afuera ? 'v-s1-fill' : 'v-neutral-fill'} v-dot" cx="${r1(x)}" cy="${y}" r="${afuera ? 10 : 7}"><title>${d.symbol}: RSI ${num(d.rsi14, 1)}</title></circle>` +
      (afuera ? `<text class="v-ink v-b" x="${r1(x)}" y="${y - 18}" text-anchor="middle">${d.symbol} ${num(d.rsi14, 1)}</text>` : '');
  });
  const dentro = orden.filter((d) => d.rsi14 >= 30 && d.rsi14 <= 70);
  if (dentro.length) {
    const a = dentro[0].rsi14, b = dentro.at(-1).rsi14;
    cuerpo += `<text class="v-mut v-sm" x="${r1(sx((a + b) / 2))}" y="${y + 30}" text-anchor="middle">los otros ${dentro.length}, entre ${num(a, 0)} y ${num(b, 0)}</text>`;
  }
  const fuera = API.filter((d) => d.rsi14 < 30 || d.rsi14 > 70);
  return figura('viz-p4b', 'El RSI ubica a cada activo', `El RSI va de 0 a 100. Abajo de 30 el activo viene muy castigado (sobreventa); arriba de 70, muy comprado (sobrecompra). Hoy quedan afuera <b>${fuera.map((d) => `${d.symbol} (${num(d.rsi14, 1)})`).join(' y ')}</b>.`,
    svg('viz-p4b', W, H, 'RSI de 14 ruedas de los 8 activos', orden.map((d) => `${d.symbol} ${num(d.rsi14, 1)}`).join(', '), cuerpo),
    `Datos: muestra fija de la API del curso (${FECHA_TXT}).`);
}

// ---------- P5 · Riesgo y retorno: activos, carteras y Sharpe ----------
function p5() {
  const R = Object.fromEntries(Object.entries(SERIES).map(([s, ser]) => [s, ser.slice(1).map((x, i) => x.c / ser[i].c - 1)]));
  const media = (r) => r.reduce((a, b) => a + b, 0) / r.length;
  const cov = (a, b) => { const ma = media(a), mb = media(b); return a.reduce((s, x, i) => s + (x - ma) * (b[i] - mb), 0) / (a.length - 1); };
  const activos = D.TICKERS.map((t) => ({ s: t.symbol, ret: media(R[t.symbol]) * 252, vol: Math.sqrt(cov(R[t.symbol], R[t.symbol]) * 252) }));
  const carteras = Object.entries(PRESETS).map(([k, p]) => {
    const tot = Object.values(p).reduce((a, b) => a + b, 0), w = Object.fromEntries(Object.entries(p).map(([s, x]) => [s, x / tot])), ss = Object.keys(w);
    let v = 0; ss.forEach((a) => ss.forEach((b) => { v += w[a] * w[b] * cov(R[a], R[b]) * 252; }));
    const ret = ss.reduce((acc, s) => acc + w[s] * media(R[s]) * 252, 0), vol = Math.sqrt(v);
    return { s: k, ret, vol, sharpe: (ret - RF) / vol };
  });
  const mejor = [...carteras].sort((a, b) => b.sharpe - a.sharpe)[0];
  const W = 960, H = 500, x0 = 80, x1 = 900, y0 = 24, y1 = 430;
  const todos = [...activos, ...carteras];
  const vmax = Math.max(...todos.map((d) => d.vol)) * 1.08, rmin = Math.min(0, ...todos.map((d) => d.ret)) * 1.1, rmax = Math.max(...todos.map((d) => d.ret)) * 1.1;
  const sx = escala(0, vmax, x0, x1), sy = escala(rmin, rmax, y1, y0);
  let cuerpo = marcas(0, vmax, 5).map((v) => `<line class="v-grid" x1="${r1(sx(v))}" x2="${r1(sx(v))}" y1="${y0}" y2="${y1}"/><text class="v-mut v-sm" x="${r1(sx(v))}" y="${y1 + 22}" text-anchor="middle">${num(v * 100, 0)} %</text>`).join('') +
    marcas(rmin, rmax, 5).map((v) => `<line class="v-grid" x1="${x0}" x2="${x1}" y1="${r1(sy(v))}" y2="${r1(sy(v))}"/><text class="v-mut v-sm" x="${x0 - 10}" y="${r1(sy(v)) + 5}" text-anchor="end">${num(v * 100, 0)} %</text>`).join('') +
    `<text class="v-mut v-sm" x="${x1}" y="${y1 + 44}" text-anchor="end">Riesgo: volatilidad anual →</text>` +
    `<text class="v-mut v-sm" x="${x0 - 60}" y="${y0 - 6}">↑ Retorno anual</text>`;
  // Línea del Sharpe: desde la tasa libre de riesgo, con la pendiente de la mejor cartera; si se sale por arriba, se corta en el borde.
  const xFin = Math.min(vmax, (rmax - RF) / mejor.sharpe);
  cuerpo += `<line class="v-s2 v-line v-dash" x1="${r1(sx(0))}" y1="${r1(sy(RF))}" x2="${r1(sx(xFin))}" y2="${r1(sy(RF + mejor.sharpe * xFin))}"/>`;
  // Puntos primero; después las etiquetas, cada una en el primer lugar libre (derecha, izquierda, arriba, abajo).
  const puntos = [
    { x: sx(0), y: sy(RF), r: 6, cls: 'v-s2-fill', tip: 'Tasa libre de riesgo: 4,3 %', txt: 'tasa libre 4,3 %', tcls: 'v-ink v-sm', fs: 13 },
    ...activos.map((d) => ({ x: sx(d.vol), y: sy(d.ret), r: 7, cls: 'v-neutral-fill v-dot', tip: `${d.s}: retorno ${num(d.ret * 100, 1)} % · volatilidad ${num(d.vol * 100, 1)} %`, txt: d.s, tcls: 'v-mut v-sm', fs: 13 })),
    ...carteras.map((d) => ({ x: sx(d.vol), y: sy(d.ret), r: 11, cls: 'v-s1-fill v-dot', tip: `Cartera ${d.s}: retorno ${num(d.ret * 100, 1)} % · volatilidad ${num(d.vol * 100, 1)} % · Sharpe ${num(d.sharpe)}`, txt: `${d.s} · Sharpe ${num(d.sharpe)}`, tcls: 'v-ink v-b', fs: 15 }))
  ];
  const ocupado = puntos.map((p) => ({ x0: p.x - p.r - 2, x1: p.x + p.r + 2, y0: p.y - p.r - 2, y1: p.y + p.r + 2 }));
  const choca = (b) => b.x0 < x0 - 70 || b.x1 > x1 + 50 || b.y0 < y0 - 10 || b.y1 > y1 || ocupado.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
  puntos.forEach((p) => { cuerpo += `<circle class="${p.cls}" cx="${r1(p.x)}" cy="${r1(p.y)}" r="${p.r}"><title>${esc(p.tip)}</title></circle>`; });
  // Las carteras se ubican primero: son las etiquetas importantes.
  [...puntos].sort((a, b) => b.fs - a.fs).forEach((p) => {
    const w = p.txt.length * p.fs * 0.55, h = p.fs, gap = p.r + 6;
    const caja = (tx, ty, an) => { const xa = an === 'start' ? tx : an === 'end' ? tx - w : tx - w / 2; return { tx, ty, a: an, b: { x0: xa, x1: xa + w, y0: ty - h * 0.8, y1: ty + h * 0.2 } }; };
    const opciones = [
      caja(p.x + gap, p.y + h * 0.35, 'start'), caja(p.x - gap, p.y + h * 0.35, 'end'),
      caja(p.x, p.y - gap - 2, 'middle'), caja(p.x, p.y + gap + h, 'middle'),
      caja(p.x - 6, p.y - gap - 2, 'start'), caja(p.x - 6, p.y + gap + h, 'start'),
      caja(p.x + 6, p.y - gap - 2, 'end'), caja(p.x + 6, p.y + gap + h, 'end'),
      caja(p.x - 6, p.y - gap - h - 6, 'start'), caja(p.x - 6, p.y + gap + 2 * h + 6, 'start')
    ];
    // Primero, el primer lugar libre; si no hay, el que menos se superpone.
    const solape = (c) => ocupado.reduce((s, o) => s + Math.max(0, Math.min(c.b.x1, o.x1) - Math.max(c.b.x0, o.x0)) * Math.max(0, Math.min(c.b.y1, o.y1) - Math.max(c.b.y0, o.y0)), 0) + (c.b.x0 < x0 - 70 || c.b.x1 > x1 + 50 ? 1e6 : 0);
    const o = opciones.find((c) => !choca(c.b)) || [...opciones].sort((m, n) => solape(m) - solape(n))[0];
    ocupado.push(o.b);
    cuerpo += `<text class="${p.tcls}" x="${r1(o.tx)}" y="${r1(o.ty)}" text-anchor="${o.a}">${esc(p.txt)}</text>`;
  });
  return figura('viz-p5', 'Riesgo contra retorno', `Cada punto gris es un activo; los ámbar, las tres carteras. Combinar activos lleva la cartera <b>hacia arriba y a la izquierda</b>: más retorno por cada punto de riesgo. La línea punteada sale de la tasa libre de riesgo: cuanto más empinada, mejor Sharpe. La mejor hoy: <b>${mejor.s}</b>.`,
    svg('viz-p5', W, H, 'Riesgo y retorno anual de 8 activos y 3 carteras', carteras.map((d) => `${d.s}: retorno ${num(d.ret * 100, 1)} %, volatilidad ${num(d.vol * 100, 1)} %, Sharpe ${num(d.sharpe)}`).join('; '), cuerpo),
    `Datos: versión de rescate al ${FECHA_TXT}. En datos simulados los activos no se mueven juntos, así que la diversificación ayuda más que en la realidad.`);
}

const GRAFICOS = { p2: [p2], p3: [p3], p4: [p4medias, p4rsi], p5: [p5] };

const check = process.argv.includes('--check');
const desactualizados = [];
for (const [paso, fns] of Object.entries(GRAFICOS)) {
  const archivo = path.join(DIR, `paso-${paso.slice(1)}.html`);
  const original = fs.readFileSync(archivo, 'utf8');
  const marca = new RegExp(`(<!-- @viz:${paso} -->)[\\s\\S]*?(<!-- /@viz:${paso} -->)`);
  if (!marca.test(original)) throw new Error(`${path.basename(archivo)}: faltan los marcadores <!-- @viz:${paso} -->`);
  const html = original.replace(marca, (_, a, b) => `${a}\n    ${fns.map((f) => f()).join('\n    ')}\n    ${b}`);
  if (html !== original) {
    desactualizados.push(path.basename(archivo));
    if (!check) fs.writeFileSync(archivo, html);
  }
}
if (check && desactualizados.length) {
  console.error(`Gráficos desactualizados en: ${desactualizados.join(', ')}. Corré: node docs/taller/graficos.js`);
  process.exit(1);
}
console.log(check ? 'ok: los gráficos del taller están al día' : `ok: ${desactualizados.length} página(s) con gráficos actualizados`);
