CREATE OR REPLACE VIEW hub.v_date_days AS
SELECT V.date AS "date"
FROM generate_series(
    '2024-05-12',
    CURRENT_DATE,
    -- CURRENT_DATE - INTERVAL '1 day',
    '1 day'::INTERVAL
) AS V;

DROP MATERIALIZED VIEW IF EXISTS hub.mv_hub_sale_snapshot_view_aggregate_per_days;

CREATE MATERIALIZED VIEW hub.mv_hub_sale_snapshot_view_aggregate_per_days
AS
SELECT SS.id                                                                            AS hub_sale_snapshot_id,
       D.date,
       COUNT(SVH.id)                                                                    AS count,
       COUNT(DISTINCT CASE WHEN HC.hub_member_id IS NOT NULL THEN SVH.id END) AS viewer_count
FROM (
         SELECT DISTINCT DATE(SVH.created_at) AS date
         FROM hub.hub_sale_snapshot_view_histories AS SVH
     ) AS D
         JOIN hub.hub_sale_snapshots AS SS
              ON EXISTS (
                  SELECT 1
                  FROM hub.hub_sale_snapshot_view_histories AS SVH
                  WHERE SS.id = SVH.hub_sale_snapshot_id AND
                      D.date = DATE(SVH.created_at)
              )
         LEFT JOIN hub.hub_sale_snapshot_view_histories AS SVH
                   ON SS.id = SVH.hub_sale_snapshot_id AND
                      D.date = DATE(SVH.created_at)
         LEFT JOIN hub.hub_customers AS HC
                   ON SVH.hub_customer_id = HC.id
GROUP BY SS.id, D.date;

CREATE UNIQUE INDEX uk_mv_hub_sale_snapshot_view_aggregate_per_days
    ON hub.mv_hub_sale_snapshot_view_aggregate_per_days ("date", hub_sale_snapshot_id);
CREATE INDEX ind_mv_hub_sale_snapshot_view_aggregate_per_days
    ON hub.mv_hub_sale_snapshot_view_aggregate_per_days (hub_sale_snapshot_id, "date");