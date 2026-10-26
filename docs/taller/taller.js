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
