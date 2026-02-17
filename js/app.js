import { loadKpis } from './kpis.js';
import { loadTrendChart } from './trend.js';
import { loadCampaignTable } from './table.js';
import { initFilters } from './filters.js';

export async function refreshDashboard() {
  await loadKpis();
  await loadTrendChart();
  await loadCampaignTable();
}

initFilters(refreshDashboard);
refreshDashboard();
