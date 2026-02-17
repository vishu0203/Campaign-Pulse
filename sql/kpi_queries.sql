
-- Dashboard KPI Aggregation Query
-- This query feeds the KPI cards on the dashboard


SELECT
  -- Total opens
  SUM(CASE WHEN e.action_type = 'open' THEN 1 ELSE 0 END) AS opens,

  -- Total clicks
  SUM(CASE WHEN e.action_type = 'click' THEN 1 ELSE 0 END) AS clicks,

  -- Total purchases
  COUNT(DISTINCT p.purchase_id) AS purchases,

  -- Total revenue
  COALESCE(SUM(p.amount), 0) AS revenue,

  -- Conversion rate: Click > Purchase
  CASE
    WHEN SUM(CASE WHEN e.action_type = 'click' THEN 1 ELSE 0 END) = 0 THEN 0
    ELSE
      ROUND(
        COUNT(DISTINCT p.purchase_id) * 1.0 /
        SUM(CASE WHEN e.action_type = 'click' THEN 1 ELSE 0 END),
        4
      )
  END AS conversion_rate,

  -- Open rate
  ROUND(
    CAST(SUM(CASE WHEN e.action_type = 'open' THEN 1 ELSE 0 END) AS REAL) /
    COUNT(e.engagement_id),
    4
  ) AS open_rate

FROM campaigns c
LEFT JOIN engagements e
  ON c.campaign_id = e.campaign_id
LEFT JOIN purchases p
  ON c.campaign_id = p.campaign_id;
