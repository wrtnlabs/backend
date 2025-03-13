CREATE OR REPLACE VIEW hub.v_date_days AS
SELECT V.date AS "date"
FROM generate_series(
    '2024-05-12',
    CURRENT_DATE,
    -- CURRENT_DATE - INTERVAL '1 day',
    '1 day'::INTERVAL
) AS V;

DROP MATERIALIZED VIEW IF EXISTS hub.mv_hub_sale_snapshot_inquiry_aggregate_per_days;

CREATE MATERIALIZED VIEW hub.mv_hub_sale_snapshot_inquiry_aggregate_per_days
AS
SELECT SS.id                                                              AS hub_sale_snapshot_id,
       D.date,
       COUNT(DISTINCT CASE WHEN SNI.type = 'question' THEN SNI.id END)    AS question_count,
       COUNT(DISTINCT CASE WHEN SNI.type = 'review' THEN SNI.id END)      AS review_count,
       COALESCE(AVG(CASE WHEN SNI.type = 'review' THEN SRS.score END), 0) AS average
FROM hub.v_date_days AS D
         JOIN hub.hub_sale_snapshots AS SS
              ON EXISTS (
                  SELECT 1
                  FROM hub.hub_sale_snapshot_inquiries AS SNI
                           JOIN hub.bbs_articles AS BA ON SNI.id = BA.id
                  WHERE SS.id = SNI.hub_sale_snapshot_id
                    AND D.date = DATE(BA.created_at)
                    AND BA.deleted_at IS NULL
              )
         LEFT JOIN hub.hub_sale_snapshot_inquiries AS SNI
                   ON SS.id = SNI.hub_sale_snapshot_id
                       AND D.date = (SELECT DATE(created_at) FROM hub.bbs_articles WHERE id = SNI.id AND deleted_at IS NULL)
         LEFT JOIN hub.bbs_articles AS BA
                   ON SNI.id = BA.id
         LEFT JOIN hub.bbs_article_snapshots AS BAS
                   ON BA.id = BAS.bbs_article_id
         LEFT JOIN hub.hub_sale_snapshot_review_snapshots AS SRS
                   ON BAS.id = SRS.id AND SNI.type = 'review'
GROUP BY SS.id, D.date;

CREATE UNIQUE INDEX uk_mv_hub_sale_snapshot_inquiry_aggregate_per_days
    ON hub.mv_hub_sale_snapshot_inquiry_aggregate_per_days ("date", hub_sale_snapshot_id);
CREATE INDEX ind_mv_hub_sale_snapshot_inquiry_aggregate_per_days
    ON hub.mv_hub_sale_snapshot_inquiry_aggregate_per_days (hub_sale_snapshot_id, "date");