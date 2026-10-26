const test = require('node:test');
const assert = require('node:assert/strict');
const marketSummary = require('../api/market/summary');

function invoke(method) {
  const headers = {};
  let statusCode;
  let body;
  let ended = false;
  const res = {
    setHeader(name, value) { headers[name] = value; return this; },
    status(code) { statusCode = code; return this; },
    json(value) { body = value; return this; },
    end() { ended = true; return this; }
  };
  marketSummary({ method }, res);
  return { headers, statusCode, body, ended };
}

test('GET devuelve un resumen público con los ocho tickers', () => {
  const result = invoke('GET');
  assert.equal(result.statusCode, 200);
  assert.equal(result.body.ok, true);
  assert.equal(result.body.data.tickers.length, 8);
  assert.equal(result.body.data.tickers.find((item) => item.symbol === 'JNJ').signal, 'VENTA');
  assert.equal(result.headers['Access-Control-Allow-Origin'], '*');
  assert.match(result.body.meta.source, /muestra educativa fija/);
});

test('OPTIONS permite la comprobación CORS', () => {
  const result = invoke('OPTIONS');
  assert.equal(result.statusCode, 204);
  assert.equal(result.ended, true);
});

test('los métodos de escritura se rechazan', () => {
  const result = invoke('POST');
  assert.equal(result.statusCode, 405);
  assert.equal(result.body.ok, false);
});
