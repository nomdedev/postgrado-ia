// Sincroniza las partes repetidas de las páginas del taller entre marcadores:
//   <!-- @top --> encabezado · <!-- @nav --> barra de pasos por clase · <!-- @pie --> pie y scripts
// El resto de cada página se edita a mano, como siempre.
// Uso: node docs/taller/build.js           → reescribe las páginas que estén desactualizadas
//      node docs/taller/build.js --check   → no escribe; termina con error si alguna está desactualizada
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const TITULOS = ['PREPARAR', 'ESQUELETO', 'DATOS', 'MERCADO', 'INDICADORES', 'CARTERAS', 'API', 'COLAB', 'N8N', '#/GUIADO', 'CLAVES', 'MODELOS', 'AGENTE', 'CONSEJO', 'MCP'];
const CLASES = [{ nombre: 'CLASE 1', pasos: [0, 1, 2, 3, 4, 5] }, { nombre: 'CLASE 2', pasos: [6, 7, 8, 9] }, { nombre: 'CLASE 3', pasos: [10, 11, 12, 13, 14] }];
const ULTIMO = TITULOS.length - 1;
const clase = (n) => CLASES.find((c) => c.pasos.includes(n)).nombre;

const PAGINAS = {
  'index.html': { crumb: 'MAPA DEL RECORRIDO', actual: 'index' },
  'glosario.html': { crumb: 'GLOSARIO', actual: 'glosario' },
  'kit.html': { crumb: 'KIT DEL GRUPO', actual: 'kit' },
  ...Object.fromEntries(TITULOS.map((t, n) => [`paso-${n}.html`, { crumb: `${clase(n)} · PASO ${n} / ${ULTIMO} · ${t}`, actual: n }]))
};

const top = (p) => `<a class="skip" href="#contenido">Saltar al contenido</a>
<header class="top">
  <div class="top-in">
    <a class="brand" href="index.html"><span class="brand-dot"></span><b>FIN·LAB</b> TALLER</a>
    <span class="crumb">${p.crumb}</span>
  </div>
</header>`;

const nav = (p) => {
  const item = (href, texto, actual) => `<li><a href="${href}"${actual ? ' aria-current="page"' : ''}>${texto}</a></li>`;
  const grupos = CLASES.map((c) => `<li class="sep">${c.nombre}</li>` +
    c.pasos.map((n) => item(`paso-${n}.html`, `P${n}`, p.actual === n)).join('')).join('');
  return `<nav class="steps" aria-label="Pasos del taller">
    ${item('index.html', 'MAPA', p.actual === 'index')}${grupos}${item('kit.html', 'KIT', p.actual === 'kit')}${item('glosario.html', 'GLOSARIO', p.actual === 'glosario')}
  </nav>`;
};

const pie = () => `<footer>
  FIN·LAB · material didáctico del posgrado de IA aplicada a Finanzas (UNLP) — taller de construcción guiada.<br>
  Datos simulados con fines educativos. No es asesoramiento financiero.
</footer>

<script src="../automatizaciones/lab.js"></script>
<script src="taller.js"></script>`;

// "Así va quedando": qué partes de la terminal ya existen, una captura con datos de ejemplo y el diagrama del paso.
// Las imágenes salen de node docs/taller/capturas.js. Pasos sin cambio visible en la terminal (8, 10, 11, 13, 14) no llevan captura.
const PIEZAS = ['', 'Esqueleto', 'Datos', 'Mercado', 'Indicadores', 'Carteras', 'API', 'Colab', 'n8n', '#/guiado', 'Clave', 'Modelo', 'Agente', 'Consejo', 'MCP'];
const CAPTURA = {
  0: ['meta', 'La meta: la terminal terminada, con datos de ejemplo. Es lo que van a tener al final del recorrido.', '../../index.html#/inicio'],
  1: ['v1', 'Después de este paso: el encabezado y las cuatro pestañas, todavía vacías.', 'rescate/finlab-v1.html'],
  2: ['v2', 'A la vista casi no cambia, pero adentro ya hay un año de precios simulados para ocho activos.', 'rescate/finlab-v2.html'],
  3: ['v3', 'La pestaña Mercado: tabla de activos y gráfico del que eligen.', 'rescate/finlab-v3.html'],
  4: ['v4', 'El gráfico suma las medias móviles y el RSI, con la señal de cada activo.', 'rescate/finlab-v4.html'],
  5: ['v5', 'La pestaña Carteras: pesos, retorno, volatilidad, Sharpe y máxima caída.', 'rescate/finlab-v5.html#carteras'],
  6: ['v6', 'La API responde: este es el JSON de /api/market/summary con los datos de ejemplo.', 'rescate/finlab-v6.html#api'],
  7: ['v7', 'La pestaña Python & Colab, con los bloques listos para copiar en un notebook.', 'rescate/finlab-v7.html#python'],
  9: ['guiado', 'La terminal terminada, en #/guiado: eligen una señal y descargan el workflow para n8n.', '../../index.html#/guiado'],
  12: ['agentes', 'El agente de la terminal (pestaña 06) respondiendo una pregunta con la API como herramienta.', '../../index.html#/agentes']
};
const DIAGRAMA = ['p0-preparar', 'p1-esqueleto', 'p2-datos', 'p3-mercado', 'p4-indicadores', 'p5-carteras', 'p6-api', 'p7-colab', 'p8-n8n', 'p9-guiado',
  'p10-claves', 'p11-modelos', 'a1-ciclo-agente', 'a2-consejo', 'p14-mcp'];
const IMG = path.join(DIR, '..', 'img');
// Ancho y alto de un .webp (VP8, VP8L o VP8X) para reservar el lugar de la imagen antes de que cargue.
function medida(archivo) {
  const b = fs.readFileSync(archivo), tipo = b.toString('ascii', 12, 16);
  if (tipo === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (tipo === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (tipo === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
  throw new Error(`${archivo}: formato webp desconocido`);
}
const img = (ruta, alt) => { const [w, h] = medida(path.join(IMG, ruta)); return `<img src="../img/${ruta}" width="${w}" height="${h}" loading="lazy" alt="${alt}">`; };
const avance = (p) => {
  const n = p.actual;
  const piezas = PIEZAS.slice(1).map((t, i) => {
    const k = i + 1, estado = k < n ? 'hecho' : k === n ? 'ahora' : 'falta';
    return `<li class="${estado}">${estado === 'hecho' ? '<span aria-hidden="true">✓</span> ' : ''}${t}<span class="sr-only"> (${{ hecho: 'ya está', ahora: 'este paso', falta: 'todavía no' }[estado]})</span></li>`;
  }).join('');
  const diag = DIAGRAMA[n];
  const titulo = fs.readFileSync(path.join(DIR, 'diagramas', diag + '.html'), 'utf8').match(/<title>([^<]*)<\/title>/)[1].replace(/\s*Diagram$/, '').trim();
  const cap = CAPTURA[n];
  const captura = cap ? `
    <figure class="viz avance-fig" data-titulo="${n === 0 ? 'A dónde vamos' : 'Así va quedando'}">
      <div class="viz-grafico"><ol class="piezas" aria-label="Partes de la terminal">${piezas}</ol>
        <a href="${cap[2]}" target="_blank" rel="noopener">${img(`avance/${cap[0]}.webp`, 'Captura: ' + cap[1])}</a></div>
      <figcaption><b>${n === 0 ? 'A dónde vamos.' : 'Así va quedando.'}</b> ${cap[1]}<small>Captura con datos simulados. Clic en la imagen para abrirla.</small></figcaption>
    </figure>` : `
    <div class="viz-grafico"><ol class="piezas" aria-label="Partes de la terminal">${piezas}</ol></div>
    <p class="hint">En este paso la terminal no cambia: lo nuevo pasa en n8n o en el asistente. El diagrama muestra cómo.</p>`;
  return `<section class="block" aria-labelledby="avance">
    <span class="num"></span>
    <h2 id="avance">${n === 0 ? 'A dónde vamos' : 'Así va quedando'}</h2>${captura}
    <figure class="viz" data-titulo="El diagrama del paso">
      <div class="viz-grafico"><a href="diagramas/${diag}.html" target="_blank" rel="noopener">${img(`diagramas/${diag}.webp`, 'Diagrama: ' + titulo)}</a></div>
      <figcaption><b>El diagrama.</b> ${titulo}: cada caja es una parte y las flechas, el orden en que se usan.<small>Diagrama hecho con Archify. Clic para abrir la versión interactiva (zoom, búsqueda, modo presentación).</small></figcaption>
    </figure>
  </section>`;
};

const PARTES = { top, nav, pie };
const HEAD = `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<meta name="theme-color" content="#0B0F13" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F2F5F2" media="(prefers-color-scheme: light)">`;
const check = process.argv.includes('--check');
const desactualizadas = [];

for (const [archivo, pagina] of Object.entries(PAGINAS)) {
  const ruta = path.join(DIR, archivo);
  const original = fs.readFileSync(ruta, 'utf8');
  let html = original;
  const partes = typeof pagina.actual === 'number' ? { ...PARTES, avance } : PARTES;
  for (const [nombre, generar] of Object.entries(partes)) {
    const marca = new RegExp(`(<!-- @${nombre} -->)[\\s\\S]*?(<!-- /@${nombre} -->)`);
    if (!marca.test(html)) throw new Error(`${archivo}: faltan los marcadores <!-- @${nombre} --> … <!-- /@${nombre} -->`);
    html = html.replace(marca, (_, abre, cierra) => `${abre}\n${generar(pagina)}\n${cierra}`);
  }
  // El <head> no lleva marcadores: se completa si falta lo que comparten todas las páginas.
  if (!html.includes('name="theme-color"') || !html.includes('fonts.gstatic.com')) {
    html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n${HEAD}`);
  }
  if (!/<main[^>]*id="contenido"/.test(html)) html = html.replace(/<main(\s|>)/, '<main id="contenido"$1');
  if (html !== original) {
    desactualizadas.push(archivo);
    if (!check) fs.writeFileSync(ruta, html);
  }
}

if (check && desactualizadas.length) {
  console.error(`Páginas desactualizadas: ${desactualizadas.join(', ')}. Corré: node docs/taller/build.js`);
  process.exit(1);
}
console.log(check ? 'ok: todas las páginas del taller están sincronizadas' : `ok: ${desactualizadas.length} página(s) actualizada(s)`);
