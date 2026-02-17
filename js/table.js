import { getTrendData } from './api.js';
import { state, delay } from './state.js';

let currentCampaigns = [];
let hoverBox = null;

export async function loadCampaignTable() {
  const tbody = document.getElementById('campaign-table-body');
  tbody.innerHTML =
    `<tr><td colspan="5">Loading campaigns…</td></tr>`;
  await delay();

  try {
    let trendData = await getTrendData(state.filters);

    const grouped = {};

    trendData.forEach(row => {
      const key = row.campaign_name;

      if (!grouped[key]) {
        grouped[key] = {
          campaign_name: row.campaign_name,
          channel: row.channel,
          clicks: 0,
          purchases: 0,
          revenue: 0,
          dates: []
        };
      }

      grouped[key].clicks += row.clicks || 0;
      grouped[key].purchases += row.purchases || 0;
      grouped[key].revenue += row.revenue || 0;
      grouped[key].dates.push(row.event_date);
    });
// Calculate start_date and end_date per campaign
Object.values(grouped).forEach(c => {
  const sorted = c.dates.sort();
  c.start_date = sorted[0];
  c.end_date = sorted[sorted.length - 1];
});

    let campaigns = Object.values(grouped);
// Determine lowest and highest revenue in filtered dataset
let minRevenue = Infinity;
let maxRevenue = -Infinity;

campaigns.forEach(c => {
  if (c.revenue < minRevenue) minRevenue = c.revenue;
  if (c.revenue > maxRevenue) maxRevenue = c.revenue;
});

    // SORT
    if (state.sortState.key) {
      campaigns.sort((a, b) =>
        state.sortState.direction === 'asc'
          ? a[state.sortState.key] - b[state.sortState.key]
          : b[state.sortState.key] - a[state.sortState.key]
      );
    }

    currentCampaigns = campaigns;

    const { currentPage, rowsPerPage } = state.pagination;
    const totalPages = Math.ceil(campaigns.length / rowsPerPage) || 1;

    if (currentPage > totalPages) {
      state.pagination.currentPage = totalPages;
    }

    const start = (state.pagination.currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedCampaigns = campaigns.slice(start, end);

    tbody.innerHTML = '';

    
    paginatedCampaigns.forEach(c => {
      const row = document.createElement('tr');

     // Revenue-based classification
if (campaigns.length > 0) {
  if (c.revenue === minRevenue) {
    row.classList.add('underperforming');
  }

  if (c.revenue === maxRevenue) {
    row.classList.add('bestperforming');
  }
}


      row.innerHTML = `
        <td class="campaign-name">${c.campaign_name}</td>
        <td>${c.channel}</td>
        <td>${c.clicks}</td>
        <td>${c.purchases}</td>
        <td>${c.revenue.toFixed(2)}</td>
      `;

      const nameCell = row.querySelector('.campaign-name');

      nameCell.addEventListener('mouseenter', (e) => {
        showHoverBox(e, c);
      });

      nameCell.addEventListener('mousemove', (e) => {
        moveHoverBox(e);
      });

      nameCell.addEventListener('mouseleave', hideHoverBox);

      tbody.appendChild(row);
    });

    document.getElementById('page-info').textContent =
      `Page ${state.pagination.currentPage} of ${totalPages}`;

  } catch (e) {
    console.error(e);
    tbody.innerHTML =
      `<tr><td colspan="5">Failed to load campaigns</td></tr>`;
  }
}

/* ---------------- HOVER INFO BOX ---------------- */

function showHoverBox(event, campaign) {

  const sortedDates = campaign.dates.sort();
  const startDate = sortedDates[0];
  const endDate = sortedDates[sortedDates.length - 1];

  hoverBox = document.createElement('div');
  hoverBox.style.position = 'fixed';
  hoverBox.style.background = '#ffffff';
  hoverBox.style.padding = '12px';
  hoverBox.style.borderRadius = '8px';
  hoverBox.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
  hoverBox.style.fontSize = '13px';
  hoverBox.style.zIndex = '9999';
  hoverBox.style.minWidth = '220px';

  hoverBox.innerHTML = `
    <strong>${campaign.campaign_name}</strong><br/>
    Channel: ${campaign.channel}<br/>
    Clicks: ${campaign.clicks}<br/>
    Purchases: ${campaign.purchases}<br/>
    Revenue: $${campaign.revenue.toFixed(2)}<br/>
    <span class="date-text">Start Date: ${startDate}</span><br/>
<span class="date-text">End Date: ${endDate}</span>

  `;

  document.body.appendChild(hoverBox);
  moveHoverBox(event);
}

function moveHoverBox(event) {
  if (!hoverBox) return;

  const offset = 15;
  hoverBox.style.left = event.clientX + offset + 'px';
  hoverBox.style.top = event.clientY + offset + 'px';
}

function hideHoverBox() {
  if (hoverBox) {
    hoverBox.remove();
    hoverBox = null;
  }
}

/* PAGINATION CONTROLS */

document.addEventListener('click', function (e) {

  if (e.target.id === 'prev-page') {
    if (state.pagination.currentPage > 1) {
      state.pagination.currentPage--;
      loadCampaignTable();
    }
  }

  if (e.target.id === 'next-page') {

  const totalPages = Math.ceil(currentCampaigns.length / state.pagination.rowsPerPage) || 1;

  if (state.pagination.currentPage < totalPages) {
    state.pagination.currentPage++;
    loadCampaignTable();
  }
}


  if (e.target.id === 'export-csv-btn') {
    exportToCSV();
  }
});
/* ROWS PER PAGE CONTROL */

document.addEventListener('input', function (e) {
  if (e.target.id === 'rows-per-page-input') {

    let value = parseInt(e.target.value);

    if (isNaN(value) || value < 1) {
      value = 1;
      e.target.value = 1;
    }

    state.pagination.rowsPerPage = value;
    state.pagination.currentPage = 1;  // reset to first page
    loadCampaignTable();
  }
});

/* CSV EXPORT */

function exportToCSV() {
  if (!currentCampaigns.length) return;

 const headers = [
  'Campaign',
  'Channel',
  'Clicks',
  'Purchases',
  'Revenue',
  'Start Date',
  'End Date'
];


 const rows = currentCampaigns.map(c => [
  c.campaign_name,
  c.channel,
  c.clicks,
  c.purchases,
  c.revenue.toFixed(2),
  c.start_date,
  c.end_date
]);

  let csvContent =
    headers.join(',') + '\n' +
    rows.map(r => r.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'campaign_report.csv';
  a.click();

  URL.revokeObjectURL(url);
}
