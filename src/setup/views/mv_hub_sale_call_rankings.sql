DROP MATERIALIZED VIEW IF EXISTS hub.mv_hub_sale_call_rankings;

CREATE MATERIALIZED VIEW hub.mv_hub_sale_call_rankings
AS
SELECT T.*,
  ROW_NUMBER() OVER () "value"
FROM
  (
    SELECT S.id AS "hub_sale_id",
      COUNT(OGC.id) AS "count",
      COUNT(OGC.status = 200 OR OGC.status = 201) AS "success"
    FROM hub.hub_order_good_calls AS OGC
      INNER JOIN hub.hub_sale_snapshot_units AS SSU
        ON OGC.hub_sale_snapshot_unit_id = SSU.id
      INNER JOIN hub.hub_sale_snapshots AS SS
        ON SSU.hub_sale_snapshot_id = SS.id
      INNER JOIN hub.hub_sales AS S
        ON SS.hub_sale_id = S.id
    GROUP BY S.id
    ORDER BY 
      COUNT(OGC.id) DESC, 
      COUNT(OGC.status = 200 OR OGC.status = 201) DESC, 
      MIN(S.created_at) ASC
    LIMIT 100
  ) AS T;

CREATE UNIQUE INDEX uk_mv_hub_sale_call_rankings ON hub.mv_hub_sale_call_rankings (hub_sale_id);
CREATE INDEX idx_mv_hub_sale_call_rankings_value ON hub.mv_hub_sale_call_rankings ("value");