// Fechas desplazadas desde hoy: así el calendario de ejemplo siempre tiene "próximos eventos" el día de la clase.
const events = [
  { symbol: 'KO', name: 'Coca-Cola Co.', type: 'DIVIDENDO', in_days: 2 },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'RESULTADOS', in_days: 3 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'RESULTADOS', in_days: 5 },
  { symbol: 'GGAL', name: 'Grupo Financiero Galicia', type: 'JUNTA', in_days: 6 },
  { symbol: 'YPF', name: 'YPF S.A.', type: 'RESULTADOS', in_days: 8 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'DIVIDENDO', in_days: 9 },
  { symbol: 'PG', name: 'Procter & Gamble', type: 'RESULTADOS', in_days: 12 },
  { symbol: 'PAM', name: 'Pampa Energía', type: 'DIVIDENDO', in_days: 15 }
];

module.exports = function marketCalendar(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Método no permitido', status: 405 });
  }

  const today = new Date();
  const data = events.map(({ in_days, ...event }) => ({
    ...event,
    date: new Date(today.getTime() + in_days * 86400000).toISOString().slice(0, 10),
    days_until: in_days
  }));
  return res.status(200).json({
    ok: true,
    generated_at: today.toISOString(),
    data: { session: today.toISOString().slice(0, 10), events: data },
    meta: { source: 'calendario educativo de ejemplo; las fechas se calculan desde hoy y no son fechas reales de las empresas' }
  });
};
