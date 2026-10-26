/* FIN·LAB — comportamiento compartido de las páginas de automatizaciones.
   1) Botones "copiar": <button data-copy="#id-del-bloque">
   2) Constructor de prompts: .builder con <script type="text/template"> y campos [data-key] */
(function () {
  'use strict';

  function textOf(target) {
    return target ? target.innerText.replace(/\u00a0/g, ' ').trim() : '';
  }

  document.addEventListener('click', async function (event) {
    var button = event.target.closest('[data-copy]');
    if (!button) return;
    var source = document.querySelector(button.getAttribute('data-copy'));
    var text = textOf(source);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      var area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    var original = button.textContent;
    button.textContent = 'COPIADO';
    button.classList.add('done');
    setTimeout(function () {
      button.textContent = original;
      button.classList.remove('done');
    }, 1600);
  });

  document.querySelectorAll('.builder').forEach(function (builder) {
    var template = builder.querySelector('script[type="text/template"]');
    var output = builder.querySelector('[data-output]');
    if (!template || !output) return;
    var fields = builder.querySelectorAll('[data-key]');
    function render() {
      output.textContent = template.textContent.replace(/\{([a-z_]+)\}/g, function (match, key) {
        var field = builder.querySelector('[data-key="' + key + '"]');
        var value = field && field.value.trim();
        return value || '[' + key + ']';
      }).trim();
    }
    fields.forEach(function (field) {
      field.addEventListener('input', render);
      field.addEventListener('change', render);
    });
    render();
  });
})();

/* Selector claro / oscuro, compartido por el taller y las automatizaciones (la terminal usa la misma clave).
   Se recuerda en este navegador con la clave finlab-tema; sin elección guardada, sigue al sistema.
   También guarda archify-theme para que los diagramas Archify abran con el mismo tema. */
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
    try {
      localStorage.setItem(KEY, root.dataset.theme);
      localStorage.setItem('archify-theme', root.dataset.theme);
    } catch (_) { /* sin almacenamiento: vale solo para esta página */ }
    paint();
    syncDiagrams();
  });
  bar.insertBefore(button, bar.querySelector('.crumb'));
  paint();
  syncDiagrams();
})();
