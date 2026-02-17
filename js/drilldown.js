import { getCampaignTrend } from './api.js';
import { state, delay } from './state.js';
import { loadCampaignTable } from './table.js';

export async function openDrilldown(name) {
  state.selectedCampaignName = name;

  const panel = document.getElementById('drilldown');
  panel.style.display = 'block';
  panel.innerHTML = `<p>Loading campaign details…</p>`;
  await delay();

  try {
    const trend = await getCampaignTrend(name, state.filters);

    const totals = trend.reduce(
      (a, d) => ({
        opens: a.opens + (d.opens || 0),
        clicks: a.clicks + (d.clicks || 0),
        purchases: a.purchases + (d.purchases || 0)
      }),
      { opens: 0, clicks: 0, purchases: 0 }
    );

    // Calculate unique days
    const uniqueDates = [...new Set(trend.map(d => d.event_date))];

    panel.innerHTML = `
      <button id="close-drilldown">Close</button>
      <h3>${name}</h3>
      <p>Days tracked: ${uniqueDates.length}</p>
      <ul>
        <li>Opens: ${totals.opens}</li>
        <li>Clicks: ${totals.clicks}</li>
        <li>Leads: ${totals.purchases}</li>
      </ul>
      <canvas id="miniTrendChart" height="80"></canvas>
    `;

    renderMiniTrend(trend);
    document.getElementById('close-drilldown').onclick = closeDrilldown;

    loadCampaignTable();
  } catch (e) {
    console.error(e);
    panel.innerHTML = `<p>Unable to load campaign details</p>`;
  }
}


export function closeDrilldown() {
  state.selectedCampaignName = null;
  document.getElementById('drilldown').style.display = 'none';
}

function renderMiniTrend(trend) {
  const grouped = {};

  trend.forEach(d => {
    grouped[d.event_date] =
      (grouped[d.event_date] || 0) + (d.clicks || 0);
  });

  const labels = Object.keys(grouped).sort();
  const data = labels.map(date => grouped[date]);

  if (state.miniTrendChart)
    state.miniTrendChart.destroy();

  state.miniTrendChart = new Chart(
    document.getElementById('miniTrendChart').getContext('2d'),
    {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: '#28a745',
          tension: 0.2
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { autoSkip: true, maxRotation: 45 } }
        }
      }
    }
  );
}
