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
    button.title = 'Copiar ' + snippet.textContent.trim();
    button.textContent = 'COPIAR';
    snippet.insertAdjacentElement('afterend', button);
  });
})();

/* Modo presentación: la misma página, como diapositivas con solo el gráfico y la idea.
   Diapositivas: título → cada <figure class="viz"> → la tira del flujo → cierre. Teclado: → ← espacio, Inicio/Fin, Esc.
   Cambiar de diapositiva no se anima (se usa con teclado); solo la apertura tiene un fundido corto. ?presentar la abre directo. */
(function () {
  'use strict';
  var main = document.querySelector('main.page');
  var bar = document.querySelector('.top-in');
  var flujo = main && main.querySelector('.flow');
  var figuras = main ? main.querySelectorAll('figure.viz') : [];
  if (!main || !bar || (!flujo && !figuras.length)) return;

  var texto = function (el) { return el ? el.textContent.trim() : ''; };
  var primeraOracion = function (s) { var m = s.match(/^.*?[.!?](\s|$)/); return m ? m[0].trim() : s; };
  var h1 = main.querySelector('h1');
  var slides = [{ tipo: 'titulo', eyebrow: texto(main.querySelector('.eyebrow')), titulo: h1 ? h1.innerHTML : document.title, sub: primeraOracion(texto(main.querySelector('.lede'))) }];
  figuras.forEach(function (f) {
    var cap = f.querySelector('figcaption').cloneNode(true);
    cap.querySelectorAll('b:first-child, small').forEach(function (x) { if (x.tagName === 'SMALL' || x === cap.firstElementChild) x.remove(); });
    slides.push({ tipo: 'visual', h: f.getAttribute('data-titulo'), nodo: f.querySelector('.viz-grafico'), idea: cap.innerHTML.trim() });
  });
  if (flujo) slides.push({ tipo: 'visual', h: 'Cómo funciona', nodo: flujo, idea: '' });
  slides.push({ tipo: 'titulo', eyebrow: 'AHORA, A HACERLO', titulo: 'Abran la página del paso y sigan la zona “Hacer”', sub: 'Prompt → clic por clic → comprobar. Si se traban, la versión de rescate está en “Si algo falla”.' });

  var boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'present-btn';
  boton.textContent = '▶ Presentar';
  boton.setAttribute('aria-label', 'Presentar esta página como diapositivas');
  bar.insertBefore(boton, bar.querySelector('.theme-toggle') || bar.querySelector('.crumb'));

  var capa = null, actual = 0, previo = null;
  function render() {
    var s = slides[actual], cont = capa.querySelector('.pres-slide');
    cont.innerHTML = '';
    if (s.tipo === 'titulo') {
      cont.insertAdjacentHTML('beforeend', '<p class="pres-eyebrow"></p><h2 class="pres-titulo"></h2><p class="pres-sub"></p>');
      cont.querySelector('.pres-eyebrow').textContent = s.eyebrow;
      cont.querySelector('.pres-titulo').innerHTML = s.titulo;
      cont.querySelector('.pres-sub').textContent = s.sub;
    } else {
      var h = document.createElement('h2'); h.className = 'pres-h'; h.textContent = s.h; cont.appendChild(h);
      var v = document.createElement('div'); v.className = 'pres-visual';
      var copia = s.nodo.cloneNode(true);
      copia.querySelectorAll('[id]').forEach(function (el) { el.id = 'pres-' + el.id; }); // ids únicos mientras la página sigue debajo
      copia.querySelectorAll('[aria-labelledby]').forEach(function (el) { el.setAttribute('aria-labelledby', el.getAttribute('aria-labelledby').split(' ').map(function (x) { return 'pres-' + x; }).join(' ')); });
      v.appendChild(copia); cont.appendChild(v);
      if (s.idea) { var p = document.createElement('p'); p.className = 'pres-idea'; p.innerHTML = s.idea; cont.appendChild(p); }
    }
    capa.querySelector('.pres-num').textContent = (actual + 1) + ' / ' + slides.length;
    capa.querySelector('.pres-prog i').style.width = ((actual + 1) / slides.length * 100) + '%';
    capa.querySelector('[data-ir="-1"]').disabled = actual === 0;
    capa.querySelector('[data-ir="1"]').disabled = actual === slides.length - 1;
  }
  function ir(n) { var nuevo = Math.max(0, Math.min(slides.length - 1, n)); if (nuevo !== actual) { actual = nuevo; render(); } }
  function cerrar() {
    if (!capa) return;
    document.removeEventListener('keydown', teclas, true);
    capa.remove(); capa = null;
    document.body.style.overflow = '';
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    if (previo) previo.focus();
  }
  function teclas(e) {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].indexOf(e.key) >= 0) { e.preventDefault(); ir(actual + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].indexOf(e.key) >= 0) { e.preventDefault(); ir(actual - 1); }
    else if (e.key === 'Home') { e.preventDefault(); ir(0); }
    else if (e.key === 'End') { e.preventDefault(); ir(slides.length - 1); }
    else if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
    else if (e.key === 'Tab') { // el foco queda dentro de la presentación
      var f = capa.querySelectorAll('button:not([disabled])'); if (!f.length) return;
      var i = Array.prototype.indexOf.call(f, document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  }
  function abrir(desde) {
    previo = document.activeElement; actual = desde || 0;
    capa = document.createElement('div');
    capa.className = 'pres pres-open';
    capa.setAttribute('role', 'dialog'); capa.setAttribute('aria-modal', 'true'); capa.setAttribute('aria-label', 'Presentación: ' + texto(h1));
    capa.tabIndex = -1;
    capa.innerHTML = '<div class="pres-slide" aria-live="polite"></div><div class="pres-bar"><button type="button" data-ir="-1" aria-label="Diapositiva anterior">←</button><span class="pres-num"></span><button type="button" data-ir="1" aria-label="Diapositiva siguiente">→</button><div class="pres-prog" aria-hidden="true"><i></i></div><span>← → para avanzar · Esc para salir</span><button type="button" data-cerrar>Salir</button></div>';
    capa.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b && b.hasAttribute('data-ir')) ir(actual + Number(b.getAttribute('data-ir')));
      else if (b && b.hasAttribute('data-cerrar')) cerrar();
    });
    document.body.appendChild(capa);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', teclas, true);
    render(); capa.focus();
    if (capa.requestFullscreen) capa.requestFullscreen().catch(function () { /* sin pantalla completa: sigue en la ventana */ });
  }
  boton.addEventListener('click', function () { abrir(0); });
  document.addEventListener('fullscreenchange', function () { if (capa && !document.fullscreenElement && capa.dataset.fs) cerrar(); if (capa && document.fullscreenElement) capa.dataset.fs = '1'; });
  if (/[?&]presentar\b/.test(location.search)) abrir(0);
})();
