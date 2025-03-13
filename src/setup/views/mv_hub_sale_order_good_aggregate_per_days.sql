CREATE OR REPLACE VIEW hub.v_date_days AS
SELECT V.date AS "date"
FROM generate_series(
             '2024-05-12',
             CURRENT_DATE,
         -- CURRENT_DATE - INTERVAL '1 day',
             '1 day'::INTERVAL
     ) AS V;

DROP MATERIALIZED VIEW IF EXISTS hub.mv_hub_sale_order_good_aggregate_per_days;

CREATE MATERIALIZED VIEW hub.mv_hub_sale_order_good_aggregate_per_days
AS
SELECT OG.id                                                            AS hub_order_good_id,
       D.date                                                           AS date,
       COUNT(CASE WHEN DATE(OG.opened_at) = D.date 
           THEN 1 
           ELSE NULL 
         END
       ) AS publish_count,
       COUNT(CASE WHEN OGC.status = 200 OR OGC.status = 201 THEN 1 END) AS success_count,
       COUNT(CASE WHEN OGC.status BETWEEN 202 AND 299 THEN 1 END)       AS "status_2xx",
       COUNT(CASE WHEN OGC.status BETWEEN 300 AND 399 THEN 1 END)       AS "status_3xx",
       COUNT(CASE WHEN OGC.status BETWEEN 400 AND 499 THEN 1 END)       AS "status_4xx",
       COUNT(CASE WHEN OGC.status BETWEEN 500 AND 599 THEN 1 END)       AS "status_5xx",
       COUNT(CASE
                 WHEN OGC.status IS NULL AND OGC.id IS NOT NULL
                     THEN 1
                 ELSE NULL
           END)                                                         AS "none"
FROM hub.v_date_days AS D
         CROSS JOIN hub.hub_order_goods AS OG
         LEFT JOIN hub.hub_order_good_calls AS OGC
                   ON OG.id = OGC.hub_order_good_id AND
                      D.date = DATE(OGC.created_at)
GROUP BY OG.id, D.date;

CREATE UNIQUE INDEX uk_mv_hub_sale_order_good_aggregate_per_days
    ON hub.mv_hub_sale_order_good_aggregate_per_days ("date", hub_order_good_id);
CREATE INDEX ind_mv_hub_sale_order_good_aggregate_per_days
    ON hub.mv_hub_sale_order_good_aggregate_per_days (hub_order_good_id, "date");
