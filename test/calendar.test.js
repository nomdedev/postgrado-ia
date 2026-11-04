const test = require('node:test');
const assert = require('node:assert/strict');
const marketCalendar = require('../api/market/calendar');

function invoke(method) {
  let statusCode;
  let body;
  const res = {
    setHeader() { return this; },
    status(code) { statusCode = code; return this; },
    json(value) { body = value; return this; },
    end() { return this; }
  };
  marketCalendar({ method }, res);
  return { statusCode, body };
}

test('GET devuelve eventos ordenados, con fecha coherente con days_until y aviso de que son de ejemplo', () => {
  const { statusCode, body } = invoke('GET');
  assert.equal(statusCode, 200);
  assert.equal(body.ok, true);
  const events = body.data.events;
  assert.ok(events.length >= 6);
  const hoy = Date.parse(body.data.session);
  for (const e of events) {
    assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(['RESULTADOS', 'DIVIDENDO', 'JUNTA'].includes(e.type), `tipo inesperado ${e.type}`);
    assert.equal((Date.parse(e.date) - hoy) / 86400000, e.days_until);
  }
  assert.deepEqual(events.map((e) => e.days_until), events.map((e) => e.days_until).sort((a, b) => a - b));
  assert.match(body.meta.source, /no son fechas reales/);
});

test('los eventos son de los mismos ocho activos de la API de mercado', () => {
  const summary = require('../api/market/summary');
  let simbolos;
  summary({ method: 'GET' }, { setHeader() {}, status() { return this; }, json(v) { simbolos = v.data.tickers.map((t) => t.symbol); return this; } });
  for (const e of invoke('GET').body.data.events) assert.ok(simbolos.includes(e.symbol), `${e.symbol} no está en summary`);
});

test('los métodos de escritura se rechazan', () => {
  assert.equal(invoke('POST').statusCode, 405);
});
