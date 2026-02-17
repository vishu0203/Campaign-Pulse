const fs = require('fs');

const trend = JSON.parse(fs.readFileSync('data/trend.json', 'utf-8'));


const campaigns = [
  { name: 'Email Re-engagement', channel: 'Email' },
  { name: 'New Year Sale', channel: 'Ads' },
  { name: 'Flash Discount', channel: 'Social' }
];

const aligned = trend.map((row, index) => {
  const campaign = campaigns[index % campaigns.length];

  return {
    ...row,
    campaign_name: campaign.name,
    channel: campaign.channel,
    opens: row.opens ?? 0,
    purchases: row.purchases ?? 0
  };
});

fs.writeFileSync('data/trend_aligned.json', JSON.stringify(aligned, null, 2));

console.log('trend_aligned.json created');
