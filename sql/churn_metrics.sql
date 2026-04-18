-- ============================================================
-- SaaS Churn & Revenue Analytics — Churn Metric Queries
-- Project 1 | Ajay's Data Analyst Portfolio
-- ============================================================

-- ── 1. Overall churn rate by segment ──────────────────────────────────────────
SELECT
    segment,
    COUNT(*)                                                   AS total_customers,
    SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END)        AS churned,
    SUM(CASE WHEN status = 'active'  THEN 1 ELSE 0 END)        AS active,
    ROUND(
        SUM(CASE WHEN status = 'churned' THEN 1.0 ELSE 0 END)
        / COUNT(*) * 100, 2
    )                                                          AS churn_rate_pct,
    ROUND(SUM(mrr), 2)                                         AS total_mrr,
    ROUND(
        SUM(CASE WHEN status = 'churned' THEN mrr ELSE 0 END), 2
    )                                                          AS mrr_at_risk
FROM customers
GROUP BY segment
ORDER BY churn_rate_pct DESC;


-- ── 2. Monthly churn trend ─────────────────────────────────────────────────────
SELECT
    DATE_TRUNC('month', churn_date)                             AS churn_month,
    COUNT(*)                                                    AS customers_churned,
    ROUND(SUM(mrr), 2)                                          AS mrr_churned
FROM customers
WHERE status = 'churned'
  AND churn_date IS NOT NULL
GROUP BY DATE_TRUNC('month', churn_date)
ORDER BY churn_month;


-- ── 3. Customers at highest churn risk (low usage proxy) ──────────────────────
SELECT
    c.customer_id,
    c.company_name,
    c.segment,
    c.mrr,
    c.signup_date,
    COUNT(e.event_id)                                           AS total_events,
    MAX(e.event_date)                                           AS last_activity_date,
    CURRENT_DATE - MAX(e.event_date)                            AS days_since_last_login
FROM customers c
LEFT JOIN events e
    ON c.customer_id = e.customer_id
    AND e.event_type = 'login'
WHERE c.status = 'active'
GROUP BY c.customer_id, c.company_name, c.segment, c.mrr, c.signup_date
HAVING COUNT(e.event_id) < 5
    OR MAX(e.event_date) < CURRENT_DATE - INTERVAL '30 days'
ORDER BY c.mrr DESC;


-- ── 4. Average customer lifetime by segment ───────────────────────────────────
SELECT
    segment,
    ROUND(AVG(
        CASE
            WHEN status = 'churned'
            THEN julianday(churn_date) - julianday(signup_date)
            ELSE julianday('now')    - julianday(signup_date)
        END
    ) / 30.0, 1)                                               AS avg_lifetime_months,
    ROUND(AVG(mrr), 2)                                         AS avg_mrr,
    ROUND(
        AVG(mrr) * AVG(
            CASE
                WHEN status = 'churned'
                THEN julianday(churn_date) - julianday(signup_date)
                ELSE julianday('now')      - julianday(signup_date)
            END
        ) / 30.0, 2
    )                                                          AS estimated_ltv
FROM customers
GROUP BY segment
ORDER BY estimated_ltv DESC;


-- ── 5. Feature usage by churned vs active customers ───────────────────────────
SELECT
    e.feature_name,
    c.status,
    COUNT(e.event_id)                                           AS usage_count,
    COUNT(DISTINCT e.customer_id)                               AS unique_users
FROM events e
JOIN customers c ON e.customer_id = c.customer_id
WHERE e.event_type = 'feature_use'
GROUP BY e.feature_name, c.status
ORDER BY e.feature_name, c.status;


-- ── 6. Cohort retention — customers who signed up in same month ───────────────
SELECT
    DATE_TRUNC('month', signup_date)                            AS cohort_month,
    COUNT(*)                                                    AS cohort_size,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)          AS still_active,
    ROUND(
        SUM(CASE WHEN status = 'active' THEN 1.0 ELSE 0 END)
        / COUNT(*) * 100, 1
    )                                                          AS retention_pct
FROM customers
GROUP BY DATE_TRUNC('month', signup_date)
ORDER BY cohort_month;


-- ── 7. Executive summary — single-row KPIs ────────────────────────────────────
SELECT
    COUNT(*)                                                    AS total_customers,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)          AS active_customers,
    ROUND(SUM(CASE WHEN status='active' THEN mrr ELSE 0 END),2) AS total_mrr,
    ROUND(
        SUM(CASE WHEN status='churned' THEN 1.0 ELSE 0 END)
        / COUNT(*) * 100, 2
    )                                                          AS overall_churn_rate_pct,
    ROUND(
        AVG(CASE WHEN status='active' THEN mrr END), 2
    )                                                          AS avg_mrr_per_customer
FROM customers;
