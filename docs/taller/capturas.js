// Capturas de "Así va quedando": cómo se ve la terminal después de cada paso (versiones de rescate y terminal final),
// con datos de ejemplo cargados (se tocan los botones antes de sacar la foto).
// Uso: node docs/taller/capturas.js   (necesita Google Chrome y Python con Pillow; escribe docs/img/avance/*.webp)
'use strict';
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const RAIZ = path.join(__dirname, '..', '..');
const OUT = path.join(RAIZ, 'docs', 'img', 'avance');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PUERTO = 9333;
const url = (rel) => 'file:///' + path.join(RAIZ, rel).split(path.sep).join('/');
const boton = (texto) => `[...document.querySelectorAll('button')].find(b => b.textContent.trim().includes(${JSON.stringify(texto)}))?.click()`;

// id → [dirección, acciones (JS) antes de la foto, espera en ms]
const CAPTURAS = {
  meta: [url('index.html') + '#/inicio'],
  ...Object.fromEntries([1, 2, 3, 4, 5].map((v) => ['v' + v, [url(`docs/taller/rescate/finlab-v${v}.html`) + (v === 5 ? '#carteras' : '')]])),
  v6: [url('docs/taller/rescate/finlab-v6.html') + '#api', [boton('Enviar'), boton('Crear alerta')]],
  v7: [url('docs/taller/rescate/finlab-v7.html') + '#python'],
  guiado: [url('index.html') + '#/guiado'],
  agentes: [url('index.html') + '#/agentes', [boton('EJECUTAR'), "document.querySelector('.ag-steps')?.scrollIntoView({block:'center'})"], 9000]
};
// Los diagramas Archify, recortados al panel del dibujo (sin barra de herramientas), para verlos dentro de cada paso.
const DIAGRAMAS = fs.readdirSync(path.join(__dirname, 'diagramas')).filter((f) => /^[a-z0-9-]+\.html$/.test(f)).map((f) => f.replace('.html', ''));
for (const d of DIAGRAMAS) CAPTURAS['diagrama-' + d] = [url('docs/taller/diagramas/' + d + '.html'), ["document.querySelectorAll('.toolbar,.no-print').forEach(e => e.style.display = 'none')"], 300, '.diagram-container svg', 1440, 900];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(OUT, '..', 'diagramas'), { recursive: true });
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'finlab-chrome-'));
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PUERTO}`,
    `--user-data-dir=${perfil}`, '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' });
  try {
    let pestana;
    for (let i = 0; i < 50 && !pestana; i++) {
      await esperar(200);
      pestana = await fetch(`http://127.0.0.1:${PUERTO}/json`).then((r) => r.json()).then((l) => l.find((t) => t.type === 'page')).catch(() => null);
    }
    if (!pestana) throw new Error('Chrome no abrió el puerto de depuración');
    const ws = new WebSocket(pestana.webSocketDebuggerUrl);
    await new Promise((r, e) => { ws.onopen = r; ws.onerror = e; });
    let n = 0; const pendientes = new Map();
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (pendientes.has(d.id)) { pendientes.get(d.id)(d); pendientes.delete(d.id); } };
    const cdp = (method, params = {}) => new Promise((r) => { const id = ++n; pendientes.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
    for (const [id, [destino, acciones = [], espera = 1500, recorte, ancho = 1280, alto = 800]] of Object.entries(CAPTURAS)) {
      await cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false });
      // todo en tema claro: es lo que mejor se lee proyectado y con la página del taller en cualquiera de los dos temas
      await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
      await cdp('Page.navigate', { url: 'about:blank' });
      await cdp('Page.navigate', { url: destino });
      await esperar(3500); // React + Babel compilan en el navegador
      for (const js of acciones) { await cdp('Runtime.evaluate', { expression: js }); await esperar(600); }
      await esperar(espera);
      let clip;
      if (recorte) {
        const r = await cdp('Runtime.evaluate', { expression: `JSON.stringify(document.querySelector('${recorte}').getBoundingClientRect())`, returnByValue: true });
        const b = JSON.parse(r.result.result.value);
        clip = { x: b.x, y: b.y, width: b.width, height: b.height, scale: 1 };
      }
      const foto = await cdp('Page.captureScreenshot', { format: 'png', ...(clip ? { clip } : {}) });
      const png = path.join(perfil, id + '.png');
      fs.writeFileSync(png, Buffer.from(foto.result.data, 'base64'));
      execFileSync('python', ['-c', 'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"WEBP",quality=78)',
        png, id.startsWith('diagrama-') ? path.join(OUT, '..', 'diagramas', id.slice(9) + '.webp') : path.join(OUT, id + '.webp')]);
      console.log('ok', id);
    }
    ws.close();
  } finally {
    chrome.kill();
  }
}
main().catch((e) => { console.error(e.message); process.exit(1); });
