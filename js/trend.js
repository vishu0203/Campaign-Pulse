import { getTrendData } from './api.js';
import { state } from './state.js';

// Register datalabels plugin safely
if (window.ChartDataLabels) {
  Chart.register(ChartDataLabels);
}

export async function loadTrendChart() {

  const trend = await getTrendData(state.filters);

  const chartCanvas = document.getElementById('trendChart');
const chartContainer = chartCanvas.parentElement;

if (state.trendChart) {
  state.trendChart.destroy();
  state.trendChart = null;
}

if (!trend.length) {
  chartContainer.style.display = 'none';
  return;
}

// Show container if data exists
chartContainer.style.display = 'block';

  // ---- Collect unique dates & campaigns ----
  const dates = [...new Set(trend.map(d => d.event_date))].sort();
  const campaigns = [...new Set(trend.map(d => d.campaign_name))];

  const colors = [
    '#2563eb', '#16a34a', '#f59e0b',
    '#ef4444', '#8b5cf6', '#06b6d4',
    '#ec4899', '#84cc16'
  ];

  const datasets = campaigns.map((campaign, index) => {

    const dataPerDate = dates.map(date => {
      const record = trend.find(d =>
        d.event_date === date &&
        d.campaign_name === campaign
      );
      return record ? (record.clicks || 0) : 0;
    });

    return {
      label: campaign,
      data: dataPerDate,
      backgroundColor: colors[index % colors.length]
    };
  });

  state.trendChart = new Chart(
    document.getElementById('trendChart').getContext('2d'),
    {
      type: 'bar',
      data: {
        labels: dates,
        datasets
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false },
          datalabels: {
            color: '#ffffff',
            font: { weight: 'bold', size: 10 },
            formatter: function(value) {
              return value > 0 ? value : '';
            }
          }
        },
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true }
        }
      }
    }
  );
}
