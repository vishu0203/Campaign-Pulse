import { state } from './state.js';
import { getTrendData } from './api.js';

export async function initFilters(refreshDashboard) {

  const searchInput = document.getElementById('filter-search');
  const suggestionBox = createSuggestionBox(searchInput);

  /* -------- SEARCH INPUT (LIVE SUGGESTIONS ONLY) -------- */

searchInput.oninput = async e => {

  state.filters.pendingSearch = e.target.value.toLowerCase();

  showSuggestions(
    await getAllCampaignNames(),
    suggestionBox
  );

  // DO NOT search yet
};



  

  /* -------- DATE FILTERS -------- */

  document.getElementById('filter-start-date').onchange =
    e => {
      state.filters.startDate = e.target.value;
      refreshDashboard();
    };

  document.getElementById('filter-end-date').onchange =
    e => {
      state.filters.endDate = e.target.value;
      refreshDashboard();
    };

  document.getElementById('filter-channel').onchange =
    e => {
      state.filters.channel = e.target.value;
      refreshDashboard();
    };

  /* -------- SORTING -------- */

  document.querySelectorAll('th.sortable')
    .forEach(th => {
      th.onclick = () => {
        const key = th.dataset.sortKey;

        state.sortState.direction =
          state.sortState.key === key &&
          state.sortState.direction === 'desc'
            ? 'asc'
            : 'desc';

        state.sortState.key = key;

        document.querySelectorAll('th.sortable')
          .forEach(h =>
            h.textContent =
              h.textContent.replace(/ ↑| ↓/, '')
          );

        th.textContent +=
          state.sortState.direction === 'asc'
            ? ' ↑'
            : ' ↓';

        refreshDashboard();
      };
    });

  /* -------- INITIAL DATE = TODAY - 5 DAYS -------- */

  const today = new Date();
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(today.getDate() - 5);

  const format = d => d.toISOString().split('T')[0];

  state.filters.startDate = format(fiveDaysAgo);
  state.filters.endDate = format(today);

  document.getElementById('filter-start-date').value = state.filters.startDate;
  document.getElementById('filter-end-date').value = state.filters.endDate;

  refreshDashboard();

  function showSuggestions(allCampaigns, box) {

  const value = state.filters.pendingSearch.trim().toLowerCase();

  if (!value) {
    box.style.display = 'none';
    return;
  }

  // 1️⃣ First match campaigns that START with typed value
  const startsWithMatches = allCampaigns.filter(c =>
    c.toLowerCase().startsWith(value)
  );

  // 2️⃣ Then match campaigns that INCLUDE typed value
  const includesMatches = allCampaigns.filter(c =>
    !c.toLowerCase().startsWith(value) &&
    c.toLowerCase().includes(value)
  );

  // Combine with priority
  const matches = [...startsWithMatches, ...includesMatches];

  if (!matches.length) {
    box.style.display = 'none';
    return;
  }

  box.innerHTML = matches
    .slice(0, 7)   // slightly increase limit
    .map(m =>
      `<div style="padding:6px;cursor:pointer">${m}</div>`
    ).join('');

  box.style.display = 'block';

  box.querySelectorAll('div').forEach(div => {
    div.onclick = () => {
      const selected = div.textContent;

      document.getElementById('filter-search').value = selected;
      state.filters.pendingSearch = selected.toLowerCase();
      state.filters.search = selected.toLowerCase().trim();

      box.style.display = 'none';

      refreshDashboard();
    };
  });
}

searchInput.onblur = () => applySearch(refreshDashboard);

searchInput.onkeydown = e => {
  if (e.key === 'Enter') {
    applySearch(refreshDashboard);
    searchInput.blur();
  }
};

}

/* ---------------- HELPER FUNCTIONS ---------------- */

function applySearch(refreshDashboard) {
  state.filters.search = state.filters.pendingSearch.trim();
  refreshDashboard();
}

async function getAllCampaignNames() {

  const res = await fetch('../data/trend.json');
  if (!res.ok) return [];

  const trend = await res.json();

  return [...new Set(trend.map(t => t.campaign_name))];
}



function createSuggestionBox(input) {
  const box = document.createElement('div');
  box.style.position = 'absolute';
  box.style.background = '#fff';
  box.style.border = '1px solid #ddd';
  box.style.width = input.offsetWidth + 'px';
  box.style.zIndex = 999;
  box.style.display = 'none';
  input.parentNode.appendChild(box);
  return box;
}


