import { state } from './state.js';
import { getTrendData } from './api.js';

export async function initFilters(refreshDashboard) {

  const searchInput = document.getElementById('filter-search');
  const suggestionBox = createSuggestionBox(searchInput);

  /* -------- SEARCH INPUT (LIVE SUGGESTIONS ONLY) -------- */

 searchInput.oninput = async e => {
  state.filters.pendingSearch = e.target.value.toLowerCase();
  showSuggestions(await getAllCampaignNames(), suggestionBox);

  // APPLY SEARCH LIVE
  state.filters.search = state.filters.pendingSearch.trim();
  refreshDashboard();
};


  /* Apply search ONLY on blur or Enter */
  searchInput.onblur = () => applySearch(refreshDashboard);
  searchInput.onkeydown = e => {
    if (e.key === 'Enter') {
      applySearch(refreshDashboard);
      searchInput.blur();
    }
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
}

/* ---------------- HELPER FUNCTIONS ---------------- */

function applySearch(refreshDashboard) {
  state.filters.search = state.filters.pendingSearch.trim();
  refreshDashboard();
}

async function getAllCampaignNames() {
  const trend = await getTrendData({});
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

function showSuggestions(allCampaigns, box) {
  const value = state.filters.pendingSearch;

  if (!value) {
    box.style.display = 'none';
    return;
  }

  let matches;

  if (value.endsWith('*')) {
    const prefix = value.slice(0, -1);
    matches = allCampaigns.filter(c =>
      c.toLowerCase().startsWith(prefix)
    );
  } else {
    matches = allCampaigns.filter(c =>
      c.toLowerCase().includes(value)
    );
  }

  if (!matches.length) {
    box.style.display = 'none';
    return;
  }

  box.innerHTML = matches
    .slice(0, 5)
    .map(m =>
      `<div style="padding:6px;cursor:pointer">${m}</div>`
    ).join('');

  box.style.display = 'block';

  box.querySelectorAll('div').forEach(div => {
    div.onclick = () => {
  document.getElementById('filter-search').value = div.textContent;
  state.filters.pendingSearch = div.textContent.toLowerCase();
  state.filters.search = state.filters.pendingSearch.trim();
  box.style.display = 'none';
  refreshDashboard();   // ← THIS WAS MISSING
};

  });
}
