/* FIN·LAB — Taller: capa “amigable” sobre lab.js.
   1) Cada prompt o bloque de código queda plegado: se ve el título y el botón COPIAR;
      el texto completo se abre con “Ver el texto” (los bloques con data-open quedan abiertos).
   2) Cada <span class="code-inline c"> (comando, dirección, fórmula para pegar) recibe su propio botón COPIAR.
   El copiado lo resuelve lab.js a través de data-copy. Se carga después de lab.js. */
(function () {
  'use strict';
  var n = 0;

  document.querySelectorAll('.prompt').forEach(function (prompt) {
    var head = prompt.querySelector('.prompt-h');
    var body = prompt.querySelector('.prompt-b');
    if (!head || !body || prompt.hasAttribute('data-open')) return;
    var label = prompt.classList.contains('code') ? 'VER EL CÓDIGO' : 'VER EL TEXTO';
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'peek';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = label;
    body.id = body.id || 'cuerpo-' + (++n);
    toggle.setAttribute('aria-controls', body.id);
    prompt.classList.add('collapsed');
    toggle.addEventListener('click', function () {
      var open = prompt.classList.toggle('collapsed') === false;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'OCULTAR' : label;
    });
    var copy = head.querySelector('.copy');
    head.insertBefore(toggle, copy);
  });

  document.querySelectorAll('.code-inline.c').forEach(function (snippet) {
    snippet.id = snippet.id || 'snip-' + (++n);
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy mini';
    button.setAttribute('data-copy', '#' + snippet.id);
    button.setAttribute('aria-label', 'Copiar ' + snippet.textContent);
    button.textContent = 'COPIAR';
    snippet.insertAdjacentElement('afterend', button);
  });
})();

/* Selector claro / oscuro: se recuerda en este navegador; sin elección guardada, sigue al sistema. */
(function () {
  'use strict';
  var KEY = 'finlab-tema';
  var root = document.documentElement;
  var bar = document.querySelector('.top-in');
  if (!bar) return;
  var dark = function () {
    return root.dataset.theme ? root.dataset.theme === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
  };
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  var paint = function () {
    button.textContent = dark() ? '☀ Tema claro' : '☾ Tema oscuro';
    button.setAttribute('aria-label', dark() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  };
  // Los diagramas Archify aceptan ?theme=light|dark: así acompañan el tema de la página.
  var syncDiagrams = function () {
    if (!root.dataset.theme) return;
    var query = '?theme=' + root.dataset.theme;
    document.querySelectorAll('iframe[src^="diagramas/"], a[href^="diagramas/"]').forEach(function (el) {
      var attr = el.tagName === 'IFRAME' ? 'src' : 'href';
      var next = el.getAttribute(attr).split('?')[0] + query;
      if (el.getAttribute(attr) !== next) el.setAttribute(attr, next);
    });
  };
  button.addEventListener('click', function () {
    root.dataset.theme = dark() ? 'light' : 'dark';
    try { localStorage.setItem(KEY, root.dataset.theme); } catch (_) { /* sin almacenamiento: vale solo para esta página */ }
    paint();
    syncDiagrams();
  });
  bar.insertBefore(button, bar.querySelector('.crumb'));
  paint();
  syncDiagrams();
})();
