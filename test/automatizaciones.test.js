const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, '..', 'docs', 'automatizaciones');
const WORKFLOWS = path.join(DIR, 'workflows');
const EXAMPLES = ['aviso-senal.html', 'resumen-diario.html', 'informe-semanal-ia.html', 'precios-a-sheets.html'];

function read(file) {
  return fs.readFileSync(path.join(DIR, file), 'utf8');
}

test('el índice y los cuatro ejemplos cargan la hoja de estilos y el script compartidos', () => {
  for (const file of ['index.html', ...EXAMPLES]) {
    const html = read(file);
    assert.match(html, /<html lang="es">/, `${file}: falta lang="es"`);
    assert.match(html, /<title>[^<]{10,}<\/title>/, `${file}: falta un título descriptivo`);
    assert.match(html, /href="lab\.css"/, `${file}: no enlaza lab.css`);
    assert.match(html, /src="lab\.js"/, `${file}: no enlaza lab.js`);
  }
});

test('cada ejemplo trae prompts copiables, constructor y su workflow descargable', () => {
  for (const file of EXAMPLES) {
    const html = read(file);
    assert.match(html, /data-section="prompts"/, `${file}: falta la sección de prompts`);
    const copyButtons = html.match(/data-copy="#[a-z0-9-]+"/g) || [];
    assert.ok(copyButtons.length >= 3, `${file}: menos de 3 prompts copiables`);
    assert.match(html, /class="builder" data-builder/, `${file}: falta el constructor de prompts`);
    assert.match(html, /<script type="text\/template">/, `${file}: el constructor no tiene plantilla`);

    const workflow = html.match(/href="(workflows\/[a-z-]+\.json)" download/);
    assert.ok(workflow, `${file}: no ofrece descargar el workflow`);
    assert.ok(fs.existsSync(path.join(DIR, workflow[1])), `${file}: el workflow enlazado no existe`);
  }
});

test('el taller: 10 pasos encadenados, cada uno con diagrama Archify, glosario, prompt copiable y comprobación', () => {
  const TALLER = path.join(__dirname, '..', 'docs', 'taller');
  const page = (file) => fs.readFileSync(path.join(TALLER, file), 'utf8');
  assert.match(read('index.html'), /href="\.\.\/taller\/index\.html"/, 'el índice de automatizaciones no enlaza el taller');
  const terminal = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(terminal, /href="docs\/taller\/index\.html"/, 'la terminal (#/guiado) no enlaza el taller');
  // Plan de reestructura, etapa 4: la raíz abre INICIO (bienvenida) y EMPEZAR pasó a AUTOMATIZAR.
  assert.match(terminal, /const PAGES=\[\['inicio','INICIO'\]/, 'INICIO tiene que ser la primera pestaña');
  assert.equal((terminal.match(/\|\|'inicio'/g) || []).length, 2, 'la ruta por defecto (inicial y al cambiar el #) tiene que ser INICIO');
  assert.match(terminal, /\['guiado','05 · AUTOMATIZAR'\]/, 'la pestaña de n8n tiene que llamarse AUTOMATIZAR');
  assert.equal((terminal.match(/className="btn btn-primary wl-go"/g) || []).length, 1, 'la bienvenida tiene que tener un solo botón primario');
  assert.match(terminal, /className="btn btn-primary wl-go" href="docs\/taller\/paso-0\.html"/, 'el botón de la bienvenida tiene que llevar al paso 0');
  const preview = terminal.match(/<img src="(docs\/img\/[a-z-]+\.webp)"/);
  assert.ok(preview && fs.existsSync(path.join(__dirname, '..', preview[1])), 'falta la captura de la vista previa');
  const mapa = fs.readFileSync(path.join(TALLER, 'index.html'), 'utf8');
  assert.match(mapa, /id="clase1"[\s\S]*href="paso-5\.html"[\s\S]*id="clase2"[\s\S]*href="paso-9\.html"/, 'el mapa tiene que mostrar la clase 1 (P0–P5) y la clase 2 (P6–P9)');
  assert.match(mapa, /id="corto"[\s\S]*href="rescate\/finlab-v5\.html"/, 'el mapa tiene que ofrecer el camino corto con los rescates');
  // Auditoría 2026-10-26: la pestaña EMPEZAR no debe revelar respuestas antes de COMPROBAR (H3).
  assert.doesNotMatch(terminal, /el resultado esperado es|\{ex\.time\} · \{ex\.explain\}/, 'EMPEZAR vuelve a mostrar las respuestas antes de discutir');
  // H2 y H5: los prompts fijan el arranque del RSI de Wilder y piden la volatilidad individual.
  assert.match(fs.readFileSync(path.join(TALLER, 'paso-4.html'), 'utf8'), /promedio simple de las primeras 14 subas/, 'el prompt del paso 4 no fija el arranque del RSI');
  assert.match(fs.readFileSync(path.join(TALLER, 'paso-5.html'), 'utf8'), /volatilidad anualizada individual/, 'el prompt del paso 5 no pide la volatilidad individual');

  for (let n = 0; n <= 9; n++) {
    const file = `paso-${n}.html`;
    const html = page(file);
    assert.match(html, /<html lang="es">/, `${file}: falta lang="es"`);
    assert.match(html, /src="taller\.js"/, `${file}: no carga taller.js`);
    assert.match(html, /localStorage\.getItem\("finlab-tema"\)/, `${file}: no aplica el tema guardado antes de pintar`);
    // Anatomía (plan de reestructura, etapa 3): "Hacer" abierto y "Para entender más" plegado al final.
    const entender = html.indexOf('<details class="more"');
    assert.ok(entender > 0, `${file}: falta el bloque plegable "Para entender más"`);
    for (const id of ['logro', 'prompt', 'hacer', 'comprobar', 'falla']) {
      const pos = html.indexOf(`aria-labelledby="${id}"`);
      assert.ok(pos > 0 && pos < entender, `${file}: la sección "${id}" tiene que estar en la zona Hacer`);
    }
    for (const id of ['flujo', 'palabras']) {
      assert.ok(html.indexOf(`aria-labelledby="${id}"`) > entender, `${file}: "${id}" tiene que ir dentro de "Para entender más"`);
    }
    assert.doesNotMatch(html, /sección 0\d|class="mission"|<iframe/, `${file}: quedó una referencia "sección 0N", la misión repetida o un diagrama embebido`);
    assert.match(html, /<div class="flow">/, `${file}: falta la tira del flujo`);
    const diagram = html.match(/<a class="btn" href="(diagramas\/[a-z0-9-]+\.html)"/);
    assert.ok(diagram && fs.existsSync(path.join(TALLER, diagram[1])), `${file}: falta el enlace al diagrama completo`);
    assert.match(html, /href="glosario\.html#/, `${file}: no enlaza el glosario`);
    assert.ok((html.match(/data-copy="#[a-zA-Z0-9-]+"/g) || []).length >= 1, `${file}: sin botones de copiar`);
    for (const [, id] of html.matchAll(/data-copy="#([a-zA-Z0-9-]+)"/g)) {
      assert.match(html, new RegExp(`id="${id}"`), `${file}: el botón copia #${id}, que no existe`);
    }
    assert.match(html, /<ul class="check">/, `${file}: falta la comprobación`);
    if (n < 9) assert.match(html, new RegExp(`href="paso-${n + 1}\\.html"`), `${file}: no enlaza el paso siguiente`);
  }

  const glosario = page('glosario.html');
  for (const file of fs.readdirSync(TALLER).filter((name) => name.endsWith('.html'))) {
    const html = page(file);
    for (const [, anchor] of html.matchAll(/href="glosario\.html#([a-z0-9-]+)"/g)) {
      assert.match(glosario, new RegExp(`id="${anchor}"`), `${file}: el glosario no tiene #${anchor}`);
    }
    for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|#|mailto:|data:)/.test(ref)) continue;
      const target = ref.split('#')[0].split('?')[0];
      if (target) assert.ok(fs.existsSync(path.resolve(TALLER, target)), `${file}: enlace roto → ${ref}`);
    }
  }
});

test('las versiones de rescate del taller están generadas, sin marcas de plantilla y enlazadas desde su paso', () => {
  const RESCATE = path.join(__dirname, '..', 'docs', 'taller', 'rescate');
  const TALLER = path.dirname(RESCATE);
  const bloqueB = fs.readFileSync(path.join(TALLER, 'paso-7.html'), 'utf8').match(/<pre id="cB">([^\n]+)/)[1];
  for (let v = 1; v <= 7; v++) {
    const html = fs.readFileSync(path.join(RESCATE, `finlab-v${v}.html`), 'utf8');
    assert.doesNotMatch(html, /^\s*(?:\/\/|<!--|\{\/\*)\s*@(?:if|else|endif)\b|\{\{(?:V|BLOQUES)\}\}/m, `finlab-v${v}: quedaron marcas de la plantilla (¿falta correr build.js?)`);
    assert.match(fs.readFileSync(path.join(TALLER, `paso-${v}.html`), 'utf8'), new RegExp(`href="rescate/finlab-v${v}\\.html"`), `paso-${v}: no enlaza su versión de rescate`);
    assert.equal(/function simulateSeries/.test(html), v >= 2, `finlab-v${v}: los datos aparecen recién en la v2`);
    assert.equal(/function rsi\(/.test(html), v >= 4, `finlab-v${v}: los indicadores aparecen recién en la v4`);
  }
  assert.ok(fs.readFileSync(path.join(RESCATE, 'finlab-v7.html'), 'utf8').includes(JSON.stringify(bloqueB).slice(1, -1)), 'finlab-v7: el bloque B no coincide con paso-7.html (correr build.js)');
  // Rescate del paso 8: las dos variantes avisan JNJ (VENTA, RSI < 30) y KO (RSI > 70) con la muestra de la API.
  const tickers = new Function(fs.readFileSync(path.join(__dirname, '..', 'api', 'market', 'summary.js'), 'utf8').match(/const tickers = \[[\s\S]*?\];/)[0] + 'return tickers;')();
  const correr = (codigo, entrada) => new Function('$input', codigo)({ first: () => ({ json: entrada }) })[0].json;
  for (const file of ['aviso-rsi.json', 'aviso-rsi-sin-url.json']) {
    const workflow = JSON.parse(fs.readFileSync(path.join(RESCATE, file), 'utf8'));
    const nodo = (nombre) => workflow.nodes.find((n) => n.name === nombre);
    const nombres = new Set(workflow.nodes.map((n) => n.name));
    for (const [from, c] of Object.entries(workflow.connections)) {
      assert.ok(nombres.has(from), `${file}: conexión desde un nodo inexistente (${from})`);
      c.main.flat().forEach((link) => assert.ok(nombres.has(link.node), `${file}: conexión hacia ${link.node}, que no existe`));
    }
    assert.equal(nodo('Enviar aviso por email').disabled, true, `${file}: el correo debe venir desactivado para correr sin credenciales`);
    const entrada = file.includes('sin-url')
      ? correr(nodo('Muestra fija (sin internet)').parameters.jsCode, {})
      : { ok: true, data: { session: '2026-10-26', tickers } };
    const salida = correr(nodo('Filtrar avisos').parameters.jsCode, entrada);
    assert.equal(salida.cantidad, 2, `${file}: tendría que avisar 2 activos`);
    assert.match(salida.texto, /- JNJ: .*motivo: señal de venta y RSI menor a 30\n- KO: .*motivo: RSI mayor a 70/, `${file}: el aviso no coincide con el ejemplo del paso 8`);
  }
  assert.match(fs.readFileSync(path.join(TALLER, 'paso-8.html'), 'utf8'), /href="rescate\/aviso-rsi\.json"/, 'paso-8: no enlaza su workflow de rescate');
  // H11: la API simulada del paso 6 (prompt, ejemplo y rescate) usa el formato de la API publicada.
  const paso6 = fs.readFileSync(path.join(TALLER, 'paso-6.html'), 'utf8');
  assert.match(paso6, /"change_pct"/, 'paso-6: el ejemplo JSON no usa change_pct como la API publicada');
  assert.doesNotMatch(paso6, /changePct/, 'paso-6: quedó changePct en el prompt o el ejemplo');
  const v6 = fs.readFileSync(path.join(RESCATE, 'finlab-v6.html'), 'utf8');
  assert.match(v6, /change_pct:/, 'finlab-v6: la API simulada no usa change_pct');
  assert.match(v6, /body: \{ ok: true, data: \{ session/, 'finlab-v6: la API simulada no usa el envoltorio {ok, data}');

  // El kit del grupo enlaza cada archivo de rescate: si se agrega uno nuevo y no se enlaza, falla.
  const kit = fs.readFileSync(path.join(TALLER, 'kit.html'), 'utf8');
  for (const archivo of fs.readdirSync(RESCATE).filter((f) => !['build.js', 'finlab.template.html'].includes(f))) {
    assert.ok(kit.includes(`href="rescate/${archivo}"`), `kit.html: falta enlazar rescate/${archivo}`);
  }

  const csv = fs.readFileSync(path.join(RESCATE, 'finlab-AAPL.csv'), 'utf8').trim().split('\n');
  assert.equal(csv[0], 'fecha,cierre,sma20,sma50,rsi14');
  assert.equal(csv.length, 253, 'el CSV de respaldo debe tener 252 ruedas');
});

test('las partes comunes del taller (encabezado, barra por clase, pie) están sincronizadas con build.js', () => {
  const { execFileSync } = require('node:child_process');
  try {
    execFileSync(process.execPath, [path.join(__dirname, '..', 'docs', 'taller', 'build.js'), '--check'], { stdio: 'pipe' });
  } catch (e) {
    assert.fail(String(e.stderr || e.message).trim());
  }
});

test('el tema elegido es el mismo en todo el sitio (una sola clave, aplicada antes de pintar)', () => {
  const ROOT = path.join(__dirname, '..');
  const paginas = ['index.html',
    ...fs.readdirSync(path.join(ROOT, 'docs', 'taller')).filter((f) => f.endsWith('.html')).map((f) => `docs/taller/${f}`),
    ...fs.readdirSync(path.join(ROOT, 'docs', 'automatizaciones')).filter((f) => f.endsWith('.html')).map((f) => `docs/automatizaciones/${f}`),
    'docs/docente/index.html'];
  for (const pagina of paginas) {
    const head = fs.readFileSync(path.join(ROOT, pagina), 'utf8').split('</head>')[0];
    assert.match(head, /<script>try\{var t=localStorage\.getItem\("finlab-tema"\)/, `${pagina}: no aplica el tema guardado (finlab-tema) antes de pintar`);
  }
  const lab = fs.readFileSync(path.join(ROOT, 'docs', 'automatizaciones', 'lab.js'), 'utf8');
  assert.match(lab, /setItem\(KEY, root\.dataset\.theme\)[\s\S]*setItem\('archify-theme'/, 'lab.js: el selector tiene que guardar finlab-tema y archify-theme');
  const terminal = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.doesNotMatch(terminal, /setItem\('finlab_theme'/, 'la terminal no puede guardar el tema con la clave vieja');
});

test('cada carpeta de docs/ con index.html redirige a su versión con barra final (rutas relativas)', () => {
  // Con cleanUrls, Vercel sirve /docs/taller sin barra y entonces taller.css o paso-0.html se resuelven contra /docs/: todo da 404.
  const vercel = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
  const DOCS = path.join(__dirname, '..', 'docs');
  const carpetas = fs.readdirSync(DOCS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(DOCS, d.name, 'index.html')))
    .map((d) => d.name);
  assert.ok(carpetas.includes('taller'));
  for (const carpeta of carpetas) {
    const regla = (vercel.redirects || []).find((r) => r.source === `/docs/${carpeta}`);
    assert.ok(regla && regla.destination === `/docs/${carpeta}/`, `vercel.json: falta redirigir /docs/${carpeta} a /docs/${carpeta}/`);
  }
});

test('cada fuente de diagrama tiene su HTML generado y al revés', () => {
  const DIAG = path.join(__dirname, '..', 'docs', 'taller', 'diagramas');
  const fuentes = fs.readdirSync(path.join(DIAG, 'src')).filter((f) => f.endsWith('.workflow.json')).map((f) => f.replace('.workflow.json', '')).sort();
  const html = fs.readdirSync(DIAG).filter((f) => f.endsWith('.html')).map((f) => f.replace('.html', '')).sort();
  assert.deepEqual(html, fuentes, 'diagramas/*.html y diagramas/src/*.workflow.json no coinciden: regenerá con fuentes.js y archify');
  assert.ok(fs.existsSync(path.join(DIAG, 'fuentes.js')), 'falta el generador de fuentes (diagramas/fuentes.js)');
});

test('los workflows de n8n son válidos y sus conexiones apuntan a nodos que existen', () => {
  const files = fs.readdirSync(WORKFLOWS).filter((file) => file.endsWith('.json'));
  assert.equal(files.length, 4, 'se esperan cuatro workflows');

  for (const file of files) {
    const workflow = JSON.parse(fs.readFileSync(path.join(WORKFLOWS, file), 'utf8'));
    assert.ok(Array.isArray(workflow.nodes) && workflow.nodes.length > 1, `${file}: sin nodos`);

    const names = new Set();
    for (const node of workflow.nodes) {
      assert.ok(node.name && node.type && node.id, `${file}: nodo incompleto`);
      assert.ok(!names.has(node.name), `${file}: nombre de nodo repetido (${node.name})`);
      assert.ok(Number.isFinite(node.typeVersion), `${file}: ${node.name} sin typeVersion`);
      assert.ok(Array.isArray(node.position) && node.position.length === 2, `${file}: ${node.name} sin posición`);
      names.add(node.name);
    }

    assert.ok(
      workflow.nodes.some((node) => /trigger/i.test(node.type)),
      `${file}: no tiene disparador`
    );

    for (const [from, connection] of Object.entries(workflow.connections)) {
      assert.ok(names.has(from), `${file}: conexión desde un nodo inexistente (${from})`);
      for (const output of connection.main) {
        for (const link of output) {
          assert.ok(names.has(link.node), `${file}: conexión hacia un nodo inexistente (${link.node})`);
        }
      }
    }
  }
});

test('los enlaces y recursos relativos de las páginas existen en disco', () => {
  for (const file of fs.readdirSync(DIR).filter((name) => name.endsWith('.html'))) {
    const html = read(file);
    for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|#|mailto:|data:)/.test(ref)) continue;
      const target = ref.split('#')[0].split('?')[0];
      if (!target) continue;
      assert.ok(fs.existsSync(path.resolve(DIR, target)), `${file}: enlace roto → ${ref}`);
    }
  }
});
