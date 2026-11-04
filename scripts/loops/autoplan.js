#!/usr/bin/env node
// Mide la simplicidad de cada parte del material (docs/autoplan/partes.json) y escribe docs/autoplan/ESTADO.md.
//   node scripts/loops/autoplan.js           → imprime y actualiza ESTADO.md
//   node scripts/loops/autoplan.js --init    → además crea docs/autoplan/<parte>.md si no existe (nunca pisa uno existente)
//   node scripts/loops/autoplan.js --check   → termina con error si alguna parte supera el presupuesto
// "lectura" = palabras visibles sin prompts (<pre>), scripts, estilos, svg, nav, encabezado ni pie.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DIR = path.join(ROOT, 'docs', 'autoplan');
const { reglas, partes } = JSON.parse(fs.readFileSync(path.join(DIR, 'partes.json'), 'utf8'));

const sinTags = (html) => html
  .replace(/<(script|style|svg|nav|header|footer|pre|template)\b[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z]+;|&#\d+;/gi, ' ');

function medir(archivo) {
  const html = fs.readFileSync(path.join(ROOT, archivo), 'utf8');
  const texto = sinTags(html.split('<body')[1] || html);
  const palabras = texto.split(/\s+/).filter(Boolean);
  const oraciones = texto.split(/[.!?:;]\s+/).map((o) => o.split(/\s+/).filter(Boolean).length);
  const prompts = [...html.matchAll(/<pre\b[^>]*id="[^"]*"[^>]*>([\s\S]*?)<\/pre>/g)].reduce((a, m) => a + m[1].split(/\s+/).filter(Boolean).length, 0);
  return {
    lectura: palabras.length,
    prompts,
    largas: oraciones.filter((n) => n > reglas.oracionLargaPalabras).length,
    notas: (html.match(/class="note\b/g) || []).length,
    bloques: (html.match(/<section class="block/g) || []).length
  };
}

const suma = (a, b) => Object.fromEntries(Object.keys(a).map((k) => [k, a[k] + b[k]]));
const filas = partes.map((p) => {
  if (p.medir === false) return { ...p, m: null, estado: 'a mano' };
  const m = p.archivos.map(medir).reduce(suma);
  const limite = reglas.lecturaMax * p.archivos.length;
  return { ...p, m, limite, estado: m.lectura <= limite && m.largas <= reglas.oracionesLargasMax * p.archivos.length ? 'OK' : 'EXCEDE' };
});

const tabla = ['| Parte | Lectura | Máx. | Prompts | Oraciones largas | Notas | Bloques | Estado |', '|---|---:|---:|---:|---:|---:|---:|---|']
  .concat(filas.map((f) => (f.m
    ? `| ${f.nombre} | ${f.m.lectura} | ${f.limite} | ${f.m.prompts} | ${f.m.largas} | ${f.m.notas} | ${f.m.bloques} | ${f.estado} |`
    : `| ${f.nombre} | — | — | — | — | — | — | a mano |`)));
const medidas = filas.filter((f) => f.m);
const total = medidas.reduce((a, f) => a + f.m.lectura, 0);
const excede = medidas.filter((f) => f.estado === 'EXCEDE').length;
const md = `# Estado del autoplan\n\n> Generado por \`node scripts/loops/autoplan.js\`. No se edita a mano.\n> Presupuesto: ${reglas.lecturaMax} palabras de lectura por página y hasta ${reglas.oracionesLargasMax} oraciones de más de ${reglas.oracionLargaPalabras} palabras.\n\n${tabla.join('\n')}\n\n**Total de lectura:** ${total} palabras · **Partes que exceden:** ${excede} de ${medidas.length}\n`;
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, 'ESTADO.md'), md);
console.log(md);

if (process.argv.includes('--init')) {
  for (const p of partes) {
    const ruta = path.join(DIR, `${p.id}.md`);
    if (fs.existsSync(ruta)) continue;
    fs.writeFileSync(ruta, `# ${p.nombre}\n\n**Archivos:** ${p.archivos.map((a) => '`' + a + '`').join(', ')}\n\n## Medidas\n\n| | Lectura | Oraciones largas | Notas |\n|---|---:|---:|---:|\n| Antes | | | |\n| Después | | | |\n\n## Docente didáctico (¿se entiende fácil?)\n\n- *(pendiente)*\n\n## Simplificador (¿qué sobra?)\n\n- *(pendiente)*\n\n## Cambios aplicados\n\n- *(ninguno)*\n\n## Estado\n\npendiente\n`);
    console.log('creado', path.relative(ROOT, ruta));
  }
}
if (process.argv.includes('--check') && excede) process.exit(1);
