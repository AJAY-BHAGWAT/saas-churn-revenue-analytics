# SaaS Churn & Revenue Analytics

![CI](https://github.com/YOUR_USERNAME/saas-churn-revenue-analytics/actions/workflows/ci.yml/badge.svg)
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![SQL](https://img.shields.io/badge/SQL-PostgreSQL-336791?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green)

> **End-to-end churn and revenue intelligence dashboard for a B2B SaaS company.**  
> Synthetic dataset of 1,000 customers, 39,000+ product events, 24 months of MRR data.  
> Consultant-framed with actionable SCR recommendations.

---

## Business Problem

A B2B SaaS company is losing revenue to customer churn without knowing *which segments* are at risk, *why* they're churning, or *what to do about it*. This project answers all three questions using data.

**Key question answered:** *"Which customer segments are most at risk and what's the revenue impact?"*

---

## Key Findings

| Metric | Value |
|---|---|
| Total MRR | $449,374 |
| Overall Churn Rate | 67.5% (annual) |
| Highest-Risk Segment | SMB (86% annual churn) |
| MRR at Risk — SMB | $68,846 |
| Recommended Recovery | +$12,000 MRR via early-warning programme |

---

## Architecture

```
Raw Data (CSV)
    │
    ▼
generate_data.py          ← Synthetic data: 1,000 customers, 39K events
    │
    ▼
data/raw/                 ← customers.csv, subscriptions.csv, events.csv
    │
    ▼
SQL Analysis              ← churn_metrics.sql, revenue_cohorts.sql
    │
    ▼
Python EDA                ← 02_eda_churn_analysis.py (pandas + matplotlib)
    │
    ▼
data/processed/           ← monthly_mrr.csv, dashboard_charts.png
    │
    ▼
Executive Report          ← SCR-framed consultant recommendations
```

---

## Project Structure

```
saas-churn-revenue-analytics/
│
├── data/
│   ├── generate_data.py          # Synthetic data generator
│   ├── raw/                      # Source CSV files
│   └── processed/                # Aggregated outputs & charts
│
├── notebooks/
│   └── 02_eda_churn_analysis.py  # EDA, visualisations, recommendations
│
├── sql/
│   ├── schema.sql                # Table definitions
│   ├── churn_metrics.sql         # 7 churn analysis queries
│   └── revenue_cohorts.sql       # 6 revenue & LTV queries
│
├── tests/
│   └── test_data_quality.py      # 17 pytest data quality checks
│
├── .github/workflows/ci.yml      # CI pipeline — auto-runs on push
├── requirements.txt
└── README.md
```

---

## Quickstart

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/saas-churn-revenue-analytics.git
cd saas-churn-revenue-analytics

# 2. Install dependencies
pip install -r requirements.txt

# 3. Generate synthetic data
python data/generate_data.py

# 4. Run EDA & analysis
python notebooks/02_eda_churn_analysis.py

# 5. Run data quality tests
pytest tests/ -v
```

---

## SQL Queries Included

**Churn Metrics (`sql/churn_metrics.sql`)**
- Churn rate by segment with MRR at risk
- Monthly churn trend
- At-risk customers by login inactivity
- Average customer lifetime by segment
- Feature usage: churned vs active comparison
- Cohort retention analysis
- Executive KPI summary

**Revenue & LTV (`sql/revenue_cohorts.sql`)**
- MRR by plan tier with share %
- Revenue concentration (Pareto / top 20%)
- LTV and CAC payback by segment
- Monthly new MRR vs churned MRR
- Country revenue breakdown
- Net Revenue Retention (NRR) approximation

---

## Consultant Recommendations (SCR Framework)

**Situation:** 1,000 customers, $449K MRR, churn above industry benchmark across all segments.

**Complication:** SMB segment (45% of customer base) has 86% annual churn — primary revenue leak. Low product engagement in first 30 days is the leading indicator of churn.

**Recommendations:**
1. **Early-warning programme** — Flag SMB customers with <5 logins in month 1 for proactive CSM outreach → estimated +$12K MRR saved
2. **Onboarding redesign** — Add activation milestones (integrate → report → invite) → +12% activation rate
3. **Acquisition reallocation** — Shift 15% of paid budget to referral programme → reduce CAC payback from 7.2 to ~5 months
4. **Enterprise expansion** — Enterprise churn at 18% vs SMB's 86% — grow this segment aggressively

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Python (pandas, numpy, matplotlib) | Data generation, EDA, visualisation |
| SQL (PostgreSQL-compatible) | Analytical queries, metric definitions |
| pytest | Data quality validation (17 checks) |
| GitHub Actions | CI/CD — auto-runs tests on every push |
| Power BI | Interactive dashboard (see `/dashboard`) |

---

## Data Dictionary

**customers.csv**

| Column | Type | Description |
|---|---|---|
| customer_id | VARCHAR | Unique identifier (CUST-XXXX) |
| segment | VARCHAR | SMB / Mid-Market / Enterprise / Freemium |
| mrr | DECIMAL | Monthly recurring revenue |
| signup_date | DATE | Account creation date |
| churn_date | DATE | Cancellation date (NULL if active) |
| status | VARCHAR | active / churned |

**events.csv**

| Column | Type | Description |
|---|---|---|
| event_id | VARCHAR | Unique event ID |
| event_type | VARCHAR | login / feature_use / export / support_ticket |
| feature_name | VARCHAR | Which product feature was used |

---

## Author

**Ajay** |  
[LinkedIn](https://linkedin.com/in/ajay-bhagwat07) · [GitHub](https://github.com/AJAY-BHAGWAT)

---

This project uses a synthetic dataset calibrated to real-world 
SaaS industry benchmarks. Churn rates, MRR ranges, and segment 
distributions are modelled on published SaaS metrics reports 
(Bessemer Venture Partners, ChartMogul 2023 SaaS Benchmarks). 
No proprietary or personal data is used.
