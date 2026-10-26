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
