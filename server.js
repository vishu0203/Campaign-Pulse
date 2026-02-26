import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());

const PORT = 3000;

let db;

// Resolve absolute DB path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  const dbPath = path.join(__dirname, 'campaign_pulse__');
  console.log('Opening DB at:', dbPath);

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

app.get('/api/trend', async (req, res) => {
  try {
    const { startDate, endDate, channel, search } = req.query;

    let query = `
SELECT
  e.event_date,
  c.campaign_name,
  CASE c.channel_id
    WHEN 1 THEN 'Email'
    WHEN 2 THEN 'Ads'
    WHEN 3 THEN 'Social'
    ELSE 'Unknown'
  END AS channel,

  e.opens,
  e.clicks,
  COALESCE(p.purchases, 0) AS purchases,
  COALESCE(p.revenue, 0) AS revenue

FROM campaigns c

JOIN (
  SELECT
    campaign_id,
    DATE(action_time) AS event_date,
    SUM(CASE WHEN action_type = 'open' THEN 1 ELSE 0 END) AS opens,
    SUM(CASE WHEN action_type = 'click' THEN 1 ELSE 0 END) AS clicks
  FROM engagements
  GROUP BY campaign_id, DATE(action_time)
) e
ON c.campaign_id = e.campaign_id

LEFT JOIN (
  SELECT
    campaign_id,
    DATE(purchase_time) AS event_date,
    COUNT(*) AS purchases,
    SUM(amount) AS revenue
  FROM purchases
  GROUP BY campaign_id, DATE(purchase_time)
) p
ON c.campaign_id = p.campaign_id
AND e.event_date = p.event_date

WHERE 1=1
`;
    const params = [];

    if (startDate) {
  query += ` AND e.event_date >= ?`;
  params.push(startDate);
}

if (endDate) {
  query += ` AND e.event_date <= ?`;
  params.push(endDate);
}

    if (channel) {
      query += ` AND (
        (c.channel_id = 1 AND ? = 'Email') OR
        (c.channel_id = 2 AND ? = 'Ads') OR
        (c.channel_id = 3 AND ? = 'Social')
      )`;
      params.push(channel, channel, channel);
    }

    if (search) {
      query += ` AND LOWER(c.campaign_name) LIKE ?`;
      params.push(`%${search.toLowerCase()}%`);
    }

    query += `
      GROUP BY e.event_date, c.campaign_id
      ORDER BY e.event_date;
    `;

    const rows = await db.all(query, params);
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Trend query failed' });
  }
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});