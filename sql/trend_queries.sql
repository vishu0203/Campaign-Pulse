-- Daily Campaign-Level Trend Query

SELECT
  DATE(e.action_time) AS event_date,
  c.campaign_name,

  CASE c.channel_id
    WHEN 1 THEN 'Email'
    WHEN 2 THEN 'Ads'
    WHEN 3 THEN 'Social'
    ELSE 'Unknown'
  END AS channel,

  SUM(CASE WHEN e.action_type = 'open' THEN 1 ELSE 0 END) AS opens,
  SUM(CASE WHEN e.action_type = 'click' THEN 1 ELSE 0 END) AS clicks,

  COUNT(DISTINCT p.purchase_id) AS purchases,
  COALESCE(SUM(p.amount), 0) AS revenue

FROM campaigns c
LEFT JOIN engagements e
  ON c.campaign_id = e.campaign_id
LEFT JOIN purchases p
  ON c.campaign_id = p.campaign_id
  AND DATE(e.action_time) = DATE(p.purchase_time)

WHERE e.action_time IS NOT NULL

GROUP BY DATE(e.action_time), c.campaign_id
ORDER BY event_date;