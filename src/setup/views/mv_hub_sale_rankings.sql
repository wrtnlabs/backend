DROP MATERIALIZED VIEW IF EXISTS hub.mv_hub_sale_rankings;

CREATE MATERIALIZED VIEW hub.mv_hub_sale_rankings
AS
SELECT T.*
FROM (SELECT S.id                  AS "hub_sale_id",
             COUNT(DISTINCT VH.id) AS "view_count"
      FROM hub.hub_sales AS S
               INNER JOIN hub.hub_sale_snapshots AS SS
                          ON SS.hub_sale_id = S.id
               INNER JOIN hub.hub_sale_snapshot_units AS SSU
                          ON SS.id = SSU.hub_sale_snapshot_id
               LEFT JOIN hub.hub_sale_snapshot_view_histories AS VH
                         ON VH.hub_sale_snapshot_id = SS.id
      GROUP BY S.id
      ORDER BY COUNT(DISTINCT VH.id) DESC) AS T;


CREATE UNIQUE INDEX uk_mv_hub_sale_rankings ON hub.mv_hub_sale_rankings (hub_sale_id);
CREATE INDEX idx_mv_hub_sale_rankings ON hub.mv_hub_sale_rankings ("view_count");
