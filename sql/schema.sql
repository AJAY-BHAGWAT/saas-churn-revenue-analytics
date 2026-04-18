-- ============================================================
-- SaaS Churn & Revenue Analytics — Database Schema
-- Project 1 | Ajay's Data Analyst Portfolio
-- ============================================================

-- customers: one row per customer account
CREATE TABLE IF NOT EXISTS customers (
    customer_id   VARCHAR(20)    PRIMARY KEY,
    company_name  VARCHAR(200)   NOT NULL,
    segment       VARCHAR(50)    NOT NULL,   -- SMB | Mid-Market | Enterprise | Freemium
    plan          VARCHAR(50)    NOT NULL,   -- Basic | Pro | Enterprise
    mrr           DECIMAL(10,2)  NOT NULL,
    signup_date   DATE           NOT NULL,
    churn_date    DATE,                      -- NULL if still active
    status        VARCHAR(20)    NOT NULL,   -- active | churned
    country       VARCHAR(100),
    industry      VARCHAR(100)
);

-- subscriptions: tracks plan history
CREATE TABLE IF NOT EXISTS subscriptions (
    sub_id        VARCHAR(30)    PRIMARY KEY,
    customer_id   VARCHAR(20)    REFERENCES customers(customer_id),
    plan          VARCHAR(50)    NOT NULL,
    start_date    DATE           NOT NULL,
    end_date      DATE,
    status        VARCHAR(20)    NOT NULL,
    monthly_value DECIMAL(10,2)  NOT NULL
);

-- events: product usage activity log
CREATE TABLE IF NOT EXISTS events (
    event_id      VARCHAR(20)    PRIMARY KEY,
    customer_id   VARCHAR(20)    REFERENCES customers(customer_id),
    event_date    DATE           NOT NULL,
    event_type    VARCHAR(50),   -- login | feature_use | export | support_ticket
    feature_name  VARCHAR(100)
);

-- monthly_mrr: pre-aggregated MRR snapshot per month
CREATE TABLE IF NOT EXISTS monthly_mrr (
    month              DATE          PRIMARY KEY,
    active_customers   INTEGER,
    mrr                DECIMAL(12,2),
    churned_customers  INTEGER,
    churned_mrr        DECIMAL(12,2),
    churn_rate_pct     DECIMAL(5,2)
);
