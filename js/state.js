export const state = {
  filters: {
    startDate: '',
    endDate: '',
    channel: '',
    search: ''
  },
  sortState: {
    key: null,
    direction: 'desc'
  },
  selectedCampaignName: null,
  trendChart: null,
  miniTrendChart: null,

  // Pagination state
  pagination: {
    currentPage: 1,
    rowsPerPage: 5
  }
};

export const delay = (ms = 1500) =>
  new Promise(res => setTimeout(res, ms));
