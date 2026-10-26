const tickers = [
  { symbol: 'AAPL', name: 'Apple Inc.', last: 308.43, change: -2.29, change_pct: -0.74, volume: 61607824, rsi14: 53.5, sma20: 310.71, sma50: 292.33, signal: 'COMPRA' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', last: 471.79, change: -4.78, change_pct: -1.00, volume: 25561334, rsi14: 58.1, sma20: 467.52, sma50: 446.44, signal: 'COMPRA' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', last: 117.88, change: 0.29, change_pct: 0.25, volume: 5262481, rsi14: 28.1, sma20: 119.96, sma50: 128.19, signal: 'VENTA' },
  { symbol: 'KO', name: 'Coca-Cola Co.', last: 66.09, change: 0.54, change_pct: 0.82, volume: 22591545, rsi14: 70.7, sma20: 64.17, sma50: 63.32, signal: 'COMPRA' },
  { symbol: 'PG', name: 'Procter & Gamble', last: 162.55, change: -2.94, change_pct: -1.78, volume: 4692568, rsi14: 61.2, sma20: 161.30, sma50: 152.92, signal: 'COMPRA' },
  { symbol: 'GGAL', name: 'Grupo Financiero Galicia', last: 28.75, change: 0.15, change_pct: 0.52, volume: 1698161, rsi14: 59.0, sma20: 27.15, sma50: 27.76, signal: 'NEUTRAL' },
  { symbol: 'YPF', name: 'YPF S.A.', last: 26.33, change: 0.59, change_pct: 2.29, volume: 8986269, rsi14: 54.5, sma20: 25.65, sma50: 24.77, signal: 'COMPRA' },
  { symbol: 'PAM', name: 'Pampa Energía', last: 59.63, change: 1.36, change_pct: 2.33, volume: 1908277, rsi14: 55.0, sma20: 58.56, sma50: 58.00, signal: 'COMPRA' }
];

module.exports = function marketSummary(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Método no permitido', status: 405 });
  }

  const advancing = tickers.filter((ticker) => ticker.change_pct > 0).length;
  return res.status(200).json({
    ok: true,
    generated_at: new Date().toISOString(),
    data: {
      index: { name: 'FINLAB-8', level: 115.17, change_pct: 0.34 },
      breadth: { advancing, declining: tickers.length - advancing },
      session: new Date().toISOString().slice(0, 10),
      tickers
    },
    meta: { source: 'muestra educativa fija; no son cotizaciones en tiempo real' }
  });
};
