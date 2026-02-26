import { getTrendData } from './api.js';
import { state } from './state.js';

function setKpis(opens, clicks, purchases) {
  document.getElementById('kpi-opens').textContent = opens;
  document.getElementById('kpi-clicks').textContent = clicks;
  document.getElementById('kpi-purchases').textContent = purchases;
}

function setComparison(id, current, previous, days) {
  const el = document.getElementById(id);

  const delta = current - previous;

  if (previous === 0) {
    el.textContent = '';
    return;
  }

  const percent = ((delta / previous) * 100).toFixed(1);

  if (delta > 0) {
    el.innerHTML = `<span class="kpi-up">▲ ${Math.abs(percent)}% vs prev ${days} days</span>`;
  } else if (delta < 0) {
    el.innerHTML = `<span class="kpi-down">▼ ${Math.abs(percent)}% vs prev ${days} days</span>`;
  } else {
    el.textContent = `0% vs prev ${days} days`;
  }
}

function calculateTotals(data) {
  return data.reduce(
    (a, d) => ({
      opens: a.opens + (d.opens || 0),
      clicks: a.clicks + (d.clicks || 0),
      purchases: a.purchases + (d.purchases || 0)
    }),
    { opens: 0, clicks: 0, purchases: 0 }
  );
}

function getPreviousPeriod(filters) {
  const start = new Date(filters.startDate);
  const end = new Date(filters.endDate);

  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (diffDays - 1));

  return {
    startDate: prevStart.toISOString().split('T')[0],
    endDate: prevEnd.toISOString().split('T')[0],
    days: diffDays
  };
}

export async function loadKpis() {
  try {
    const currentData = await getTrendData(state.filters);

    if (!currentData.length) {
      setKpis(0, 0, 0);
      return;
    }

    const currentTotals = calculateTotals(currentData);
    setKpis(currentTotals.opens, currentTotals.clicks, currentTotals.purchases);

    if (!state.filters.startDate || !state.filters.endDate) return;

    const prev = getPreviousPeriod(state.filters);

    const previousData = await getTrendData({
      ...state.filters,
      startDate: prev.startDate,
      endDate: prev.endDate
    });

    const previousTotals = calculateTotals(previousData);

    setComparison(
      'kpi-opens-compare',
      currentTotals.opens,
      previousTotals.opens,
      prev.days
    );

    setComparison(
      'kpi-clicks-compare',
      currentTotals.clicks,
      previousTotals.clicks,
      prev.days
    );

    setComparison(
      'kpi-purchases-compare',
      currentTotals.purchases,
      previousTotals.purchases,
      prev.days
    );

  } catch (e) {
    console.error(e);
    setKpis(0, 0, 0);
  }
}