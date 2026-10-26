// Sincroniza las partes repetidas de las páginas del taller entre marcadores:
//   <!-- @top --> encabezado · <!-- @nav --> barra de pasos por clase · <!-- @pie --> pie y scripts
// El resto de cada página se edita a mano, como siempre.
// Uso: node docs/taller/build.js           → reescribe las páginas que estén desactualizadas
//      node docs/taller/build.js --check   → no escribe; termina con error si alguna está desactualizada
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const TITULOS = ['PREPARAR', 'ESQUELETO', 'DATOS', 'MERCADO', 'INDICADORES', 'CARTERAS', 'API', 'COLAB', 'N8N', '#/GUIADO'];
const CLASES = [{ nombre: 'CLASE 1', pasos: [0, 1, 2, 3, 4, 5] }, { nombre: 'CLASE 2', pasos: [6, 7, 8, 9] }];
const clase = (n) => CLASES.find((c) => c.pasos.includes(n)).nombre;

const PAGINAS = {
  'index.html': { crumb: 'MAPA DEL RECORRIDO', actual: 'index' },
  'glosario.html': { crumb: 'GLOSARIO', actual: 'glosario' },
  'kit.html': { crumb: 'KIT DEL GRUPO', actual: 'kit' },
  ...Object.fromEntries(TITULOS.map((t, n) => [`paso-${n}.html`, { crumb: `${clase(n)} · PASO ${n} / 9 · ${t}`, actual: n }]))
};

const top = (p) => `<header class="top">
  <div class="top-in">
    <a class="brand" href="index.html"><span class="brand-dot"></span><b>FIN·LAB</b> TALLER</a>
    <span class="crumb">${p.crumb}</span>
  </div>
</header>`;

const nav = (p) => {
  const item = (href, texto, actual) => `<li><a href="${href}"${actual ? ' aria-current="page"' : ''}>${texto}</a></li>`;
  const grupos = CLASES.map((c) => `<li class="sep" aria-hidden="true">${c.nombre}</li>` +
    c.pasos.map((n) => item(`paso-${n}.html`, `P${n}`, p.actual === n)).join('')).join('');
  return `<ul class="steps" aria-label="Pasos del taller">
    ${item('index.html', 'MAPA', p.actual === 'index')}${grupos}${item('kit.html', 'KIT', p.actual === 'kit')}${item('glosario.html', 'GLOSARIO', p.actual === 'glosario')}
  </ul>`;
};

const pie = () => `<footer>
  FIN·LAB · material didáctico del posgrado de IA aplicada a Finanzas (UNLP) — taller de construcción guiada.<br>
  Datos simulados con fines educativos. No es asesoramiento financiero.
</footer>

<script src="../automatizaciones/lab.js"></script>
<script src="taller.js"></script>`;

const PARTES = { top, nav, pie };
const check = process.argv.includes('--check');
const desactualizadas = [];

for (const [archivo, pagina] of Object.entries(PAGINAS)) {
  const ruta = path.join(DIR, archivo);
  const original = fs.readFileSync(ruta, 'utf8');
  let html = original;
  for (const [nombre, generar] of Object.entries(PARTES)) {
    const marca = new RegExp(`(<!-- @${nombre} -->)[\\s\\S]*?(<!-- /@${nombre} -->)`);
    if (!marca.test(html)) throw new Error(`${archivo}: faltan los marcadores <!-- @${nombre} --> … <!-- /@${nombre} -->`);
    html = html.replace(marca, (_, abre, cierra) => `${abre}\n${generar(pagina)}\n${cierra}`);
  }
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
