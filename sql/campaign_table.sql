-- Campaign-level metrics for dashboard table

SELECT
  c.campaign_id,
  c.campaign_name,

  SUM(CASE WHEN e.action_type = 'open' THEN 1 ELSE 0 END) AS opens,
  SUM(CASE WHEN e.action_type = 'click' THEN 1 ELSE 0 END) AS clicks,

  COUNT(DISTINCT p.purchase_id) AS purchases,
  COALESCE(SUM(p.amount), 0) AS revenue

FROM campaigns c
LEFT JOIN engagements e
  ON c.campaign_id = e.campaign_id
LEFT JOIN purchases p
  ON c.campaign_id = p.campaign_id

GROUP BY c.campaign_id, c.campaign_name
ORDER BY revenue DESC;
