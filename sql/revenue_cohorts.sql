-- ============================================================
-- SaaS Churn & Revenue Analytics — Revenue & Cohort Queries
-- Project 1 | Ajay's Data Analyst Portfolio
-- ============================================================

-- ── 1. MRR by plan tier ───────────────────────────────────────────────────────
SELECT
    plan,
    COUNT(*)                                                   AS customers,
    ROUND(SUM(mrr), 2)                                         AS total_mrr,
    ROUND(AVG(mrr), 2)                                         AS avg_mrr,
    ROUND(SUM(mrr) / SUM(SUM(mrr)) OVER () * 100, 1)           AS mrr_share_pct
FROM customers
WHERE status = 'active'
GROUP BY plan
ORDER BY total_mrr DESC;


-- ── 2. Revenue concentration — top 20% customers ─────────────────────────────
WITH ranked AS (
    SELECT
        customer_id,
        company_name,
        segment,
        mrr,
        NTILE(5) OVER (ORDER BY mrr DESC)                      AS quintile
    FROM customers
    WHERE status = 'active'
)
SELECT
    quintile,
    COUNT(*)                                                   AS customers,
    ROUND(SUM(mrr), 2)                                         AS total_mrr,
    ROUND(SUM(mrr) / SUM(SUM(mrr)) OVER () * 100, 1)           AS mrr_pct
FROM ranked
GROUP BY quintile
ORDER BY quintile;


-- ── 3. LTV and CAC payback by segment ────────────────────────────────────────
-- Assumes CAC = 3x monthly MRR (industry benchmark for SaaS)
SELECT
    segment,
    ROUND(AVG(mrr), 2)                                         AS avg_mrr,
    ROUND(AVG(mrr) * 3, 2)                                     AS assumed_cac,
    ROUND(1.0 / (
        SUM(CASE WHEN status='churned' THEN 1.0 ELSE 0 END)
        / COUNT(*)
    ), 1)                                                      AS avg_lifetime_months,
    ROUND(
        AVG(mrr) / (
            SUM(CASE WHEN status='churned' THEN 1.0 ELSE 0 END)
            / COUNT(*)
        ), 2
    )                                                          AS ltv,
    ROUND(
        (AVG(mrr) * 3) / AVG(mrr), 1
    )                                                          AS cac_payback_months
FROM customers
GROUP BY segment
ORDER BY ltv DESC;


-- ── 4. Monthly new MRR vs churned MRR ─────────────────────────────────────────
SELECT
    DATE_TRUNC('month', signup_date)                           AS month,
    ROUND(SUM(mrr), 2)                                         AS new_mrr_added
FROM customers
GROUP BY DATE_TRUNC('month', signup_date)
ORDER BY month;


-- ── 5. Country revenue breakdown ─────────────────────────────────────────────
SELECT
    country,
    COUNT(*)                                                   AS customers,
    ROUND(SUM(CASE WHEN status='active' THEN mrr ELSE 0 END),2) AS active_mrr,
    ROUND(
        SUM(CASE WHEN status='churned' THEN 1.0 ELSE 0 END)
        / COUNT(*) * 100, 1
    )                                                          AS churn_rate_pct
FROM customers
GROUP BY country
ORDER BY active_mrr DESC
LIMIT 10;


-- ── 6. Net Revenue Retention (NRR) approximation ─────────────────────────────
-- NRR = (MRR start + expansion - contraction - churn) / MRR start * 100
-- Simplified: using active vs churned split as proxy
WITH base AS (
    SELECT
        SUM(mrr)                                               AS total_mrr,
        SUM(CASE WHEN status='churned' THEN mrr ELSE 0 END)    AS churned_mrr,
        SUM(CASE WHEN status='active'  THEN mrr ELSE 0 END)    AS retained_mrr
    FROM customers
)
SELECT
    ROUND(total_mrr, 2)                                        AS starting_mrr,
    ROUND(churned_mrr, 2)                                      AS churned_mrr,
    ROUND(retained_mrr, 2)                                     AS retained_mrr,
    ROUND(retained_mrr / total_mrr * 100, 1)                   AS nrr_pct
FROM base;
