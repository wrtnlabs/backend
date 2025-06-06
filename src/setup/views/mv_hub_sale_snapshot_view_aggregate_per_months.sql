CREATE OR REPLACE VIEW hub.v_date_months AS
SELECT V.date AS "date"
FROM generate_series(
    '2024-05-12',
    CURRENT_DATE,
    -- CURRENT_DATE - INTERVAL '1 month',
    '1 month'::INTERVAL
) AS V;

DROP MATERIALIZED VIEW IF EXISTS hub.mv_hub_sale_snapshot_view_aggregate_per_months;

CREATE MATERIALIZED VIEW hub.mv_hub_sale_snapshot_view_aggregate_per_months
AS
SELECT SS.id                                                                            AS hub_sale_snapshot_id,
       DATE_TRUNC('month', SVH.created_at) AS date,
       COUNT(SVH.id)                                                                    AS count,
       COUNT(DISTINCT CASE WHEN HC.hub_member_id IS NOT NULL THEN SVH.id END) AS viewer_count
FROM hub.hub_sale_snapshots AS SS
         JOIN hub.hub_sale_snapshot_view_histories AS SVH
              ON SS.id = SVH.hub_sale_snapshot_id
         LEFT JOIN hub.hub_customers AS HC
                   ON SVH.hub_customer_id = HC.id
GROUP BY SS.id, DATE_TRUNC('month', SVH.created_at);

CREATE UNIQUE INDEX uk_mv_hub_sale_snapshot_view_aggregate_per_months
    ON hub.mv_hub_sale_snapshot_view_aggregate_per_months ("date", hub_sale_snapshot_id);
CREATE INDEX ind_mv_hub_sale_snapshot_view_aggregate_per_months
    ON hub.mv_hub_sale_snapshot_view_aggregate_per_months (hub_sale_snapshot_id, "date");