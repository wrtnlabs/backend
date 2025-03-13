CREATE OR REPLACE VIEW hub.v_date_hours AS
SELECT V AS "date"
FROM generate_series(
             '2024-05-12 00:00:00',
             date_trunc('hour', CURRENT_TIMESTAMP),
         -- date_trunc('hour', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
             '1 hour'::interval
     ) AS V;

DROP MATERIALIZED VIEW IF EXISTS hub.mv_hub_sale_snapshot_view_aggregate_per_hours;

CREATE MATERIALIZED VIEW hub.mv_hub_sale_snapshot_view_aggregate_per_hours
AS
SELECT SS.id                                                                            AS hub_sale_snapshot_id,
       DATE_TRUNC('hour', SVH.created_at) AS date,
       COUNT(SVH.id)                                                                    AS count,
       COUNT(DISTINCT CASE WHEN HC.hub_member_id IS NOT NULL THEN SVH.id END) AS viewer_count
FROM hub.hub_sale_snapshots AS SS
         JOIN hub.hub_sale_snapshot_view_histories AS SVH
              ON SS.id = SVH.hub_sale_snapshot_id
         LEFT JOIN hub.hub_customers AS HC
                   ON SVH.hub_customer_id = HC.id
GROUP BY SS.id, DATE_TRUNC('hour', SVH.created_at);

CREATE UNIQUE INDEX uk_mv_hub_sale_snapshot_view_aggregate_per_hours
    ON hub.mv_hub_sale_snapshot_view_aggregate_per_hours ("date", hub_sale_snapshot_id);
CREATE INDEX ind_mv_hub_sale_snapshot_view_aggregate_per_hours
    ON hub.mv_hub_sale_snapshot_view_aggregate_per_hours (hub_sale_snapshot_id, "date");