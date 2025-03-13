DROP MATERIALIZED VIEW IF EXISTS hub.mv_hub_order_good_call_aggregate_per_totals;

CREATE MATERIALIZED VIEW hub.mv_hub_order_good_call_aggregate_per_totals
AS
SELECT OG.id                                                              AS hub_order_good_id,
       CURRENT_DATE                                                       AS "date",
       COUNT(CASE WHEN OGC.status = 200 OR OGC.status = 201 THEN 1 END)   AS success,
       COUNT(CASE WHEN OGC.status BETWEEN 202 AND 299 THEN 1 END)         AS "status_2xx",
       COUNT(CASE WHEN OGC.status BETWEEN 300 AND 399 THEN 1 END)         AS "status_3xx",
       COUNT(CASE WHEN OGC.status BETWEEN 400 AND 499 THEN 1 END)         AS "status_4xx",
       COUNT(CASE WHEN OGC.status BETWEEN 500 AND 599 THEN 1 END)         AS "status_5xx",
       COUNT(CASE
                 WHEN OGC.status IS NULL AND OGC.id IS NOT NULL
                     THEN 1
                 ELSE NULL
           END)                                                           AS "none",
       AVG(EXTRACT(EPOCH FROM (OGC.respond_at - OGC.created_at)))         AS latency_mean,
       STDDEV(EXTRACT(EPOCH FROM (OGC.respond_at - OGC.created_at)))      AS latency_stdev
FROM hub.hub_order_goods AS OG
    LEFT JOIN hub.hub_order_good_calls AS OGC
            ON OG.id = OGC.hub_order_good_id
GROUP BY OG.id;

CREATE UNIQUE INDEX uk_mv_hub_order_good_call_aggregate_per_totals
    ON hub.mv_hub_order_good_call_aggregate_per_totals (hub_order_good_id);
