import { getTrendData } from './api.js';
import { state } from './state.js';

function setKpis(opens, clicks, purchases) {
  document.getElementById('kpi-opens').textContent = opens;
  document.getElementById('kpi-clicks').textContent = clicks;
  document.getElementById('kpi-purchases').textContent = purchases;
}

export async function loadKpis() {

  try {
    const trend = await getTrendData(state.filters);

    if (!trend.length) {
      setKpis(0, 0, 0);
      return;
    }

    const totals = trend.reduce(
      (a, d) => ({
        opens: a.opens + (d.opens || 0),
        clicks: a.clicks + (d.clicks || 0),
        purchases: a.purchases + (d.purchases || 0)
      }),
      { opens: 0, clicks: 0, purchases: 0 }
    );

    setKpis(totals.opens, totals.clicks, totals.purchases);

  } catch (e) {
    console.error(e);
    setKpis(0, 0, 0);
  }
}
