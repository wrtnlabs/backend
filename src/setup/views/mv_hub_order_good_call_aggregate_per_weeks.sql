CREATE OR REPLACE VIEW hub.v_date_weeks AS
SELECT V.date AS "date"
FROM generate_series(
    '2024-05-12',
    CURRENT_DATE,
    -- CURRENT_DATE - INTERVAL '7 day', 
    '7 day'::INTERVAL
) AS V;

DROP MATERIALIZED VIEW IF EXISTS hub.mv_hub_order_good_call_aggregate_per_weeks;

CREATE MATERIALIZED VIEW hub.mv_hub_order_good_call_aggregate_per_weeks
AS
SELECT
    OG.id AS hub_order_good_id,
    DATE_TRUNC('week', OGC.created_at) AS date,
    COUNT(OGC.id) AS total_calls,
    COUNT(CASE WHEN OGC.status IN (200, 201) THEN 1 END) AS success,
    COUNT(CASE WHEN OGC.status BETWEEN 202 AND 299 THEN 1 END) AS status_2xx,
    COUNT(CASE WHEN OGC.status BETWEEN 300 AND 399 THEN 1 END) AS status_3xx,
    COUNT(CASE WHEN OGC.status BETWEEN 400 AND 499 THEN 1 END) AS status_4xx,
    COUNT(CASE WHEN OGC.status BETWEEN 500 AND 599 THEN 1 END) AS status_5xx,
    COUNT(CASE WHEN OGC.status IS NULL THEN 1 END) AS none,
    AVG(EXTRACT(EPOCH FROM (OGC.respond_at - OGC.created_at))) AS latency_mean,
    STDDEV(EXTRACT(EPOCH FROM (OGC.respond_at - OGC.created_at))) AS latency_stdev
FROM
    hub.hub_order_goods AS OG
        INNER JOIN hub.hub_order_good_calls AS OGC ON OG.id = OGC.hub_order_good_id
GROUP BY
    OG.id, DATE_TRUNC('week', OGC.created_at);

CREATE UNIQUE INDEX uk_mv_hub_order_good_call_aggregate_per_weeks
    ON hub.mv_hub_order_good_call_aggregate_per_weeks ("date", hub_order_good_id);
CREATE INDEX ind_mv_hub_order_good_call_aggregate_per_weeks
    ON hub.mv_hub_order_good_call_aggregate_per_weeks (hub_order_good_id, "date");