-- Daily Trend Query for Dashboard Line Chart

SELECT
  DATE(e.action_time) AS event_date,

  -- Daily clicks
  SUM(CASE
        WHEN e.action_type = 'click' THEN 1
        ELSE 0
      END) AS clicks,

  -- Daily revenue
  COALESCE(SUM(p.amount), 0) AS revenue

FROM engagements e
LEFT JOIN purchases p
  ON DATE(e.action_time) = DATE(p.purchase_time)

GROUP BY DATE(e.action_time)
ORDER BY event_date;
