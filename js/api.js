export async function getTrendData(filters) {
  try {
   const query = new URLSearchParams(filters).toString();
const res = await fetch(`http://localhost:3000/api/trend?${query}`);
    if (!res.ok) throw new Error('Trend fetch failed');

    let data = await res.json();

    // DATE FILTERS
    if (filters.startDate)
      data = data.filter(d => d.event_date >= filters.startDate);

    if (filters.endDate)
      data = data.filter(d => d.event_date <= filters.endDate);

    // CHANNEL FILTER
    if (filters.channel)
      data = data.filter(d => d.channel === filters.channel);

    // SEARCH FILTER
    if (filters.search && filters.search.trim() !== '') {
      const searchValue = filters.search.toLowerCase().trim();

      // Wildcard support: T*
      if (searchValue.endsWith('*')) {
        const prefix = searchValue.slice(0, -1);
        data = data.filter(d =>
          d.campaign_name.toLowerCase().startsWith(prefix)
        );
      } else {
        data = data.filter(d =>
          d.campaign_name.toLowerCase().includes(searchValue)
        );
      }
    }

    return data;
  } catch (err) {
    console.error(err);
    throw new Error('Unable to load trend data');
  }
}


export async function getCampaignTrend(campaignName, filters) {
  try {
    const res = await fetch('../data/trend.json');
    if (!res.ok) throw new Error('Campaign trend fetch failed');

    let data = await res.json();

    // Filter by campaign
    data = data.filter(d => d.campaign_name === campaignName);

    // DATE FILTERS
    if (filters.startDate)
      data = data.filter(d => d.event_date >= filters.startDate);

    if (filters.endDate)
      data = data.filter(d => d.event_date <= filters.endDate);

    if (filters.channel)
      data = data.filter(d => d.channel === filters.channel);

    return data;
  } catch (err) {
    console.error(err);
    throw new Error('Unable to load campaign details');
  }
}

export async function getCampaignMeta(campaignName) {
  try {
    const res = await fetch('../data/campaigns.json');
    if (!res.ok) throw new Error('Campaign meta fetch failed');

    const data = await res.json();

    return data.find(
      c => c.campaign_name === campaignName
    );
  } catch (err) {
    console.error(err);
    throw new Error('Unable to load campaign metadata');
  }
}
