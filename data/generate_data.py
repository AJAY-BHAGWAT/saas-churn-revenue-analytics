"""
SaaS Churn & Revenue Analytics — Synthetic Data Generator
Project 1 | Ajay's Data Analyst Portfolio
"""

import pandas as pd
import numpy as np
from faker import Faker
import random
from datetime import datetime, timedelta
import os

fake = Faker()
np.random.seed(42)
random.seed(42)

# ── Config ──────────────────────────────────────────────────────────────────
N_CUSTOMERS = 1000
START_DATE = datetime(2023, 1, 1)
END_DATE = datetime(2024, 12, 31)

SEGMENTS = {
    "SMB":        {"weight": 0.45, "mrr_range": (49, 299),   "churn_prob": 0.071},
    "Mid-Market": {"weight": 0.30, "mrr_range": (300, 999),  "churn_prob": 0.038},
    "Enterprise": {"weight": 0.15, "mrr_range": (1000, 5000),"churn_prob": 0.012},
    "Freemium":   {"weight": 0.10, "mrr_range": (0, 49),     "churn_prob": 0.093},
}

PLANS = ["Basic", "Pro", "Enterprise"]
COUNTRIES = ["United Kingdom", "United States", "Germany", "France", "India",
             "Canada", "Australia", "Singapore", "UAE", "Netherlands"]

FEATURES = ["dashboard", "reporting", "api_access", "integrations",
            "analytics", "export", "collaboration", "automation"]

# ── Customers ────────────────────────────────────────────────────────────────
def generate_customers():
    records = []
    seg_list = list(SEGMENTS.keys())
    weights = [SEGMENTS[s]["weight"] for s in seg_list]

    for i in range(N_CUSTOMERS):
        segment = random.choices(seg_list, weights=weights)[0]
        seg_cfg = SEGMENTS[segment]
        mrr = round(random.uniform(*seg_cfg["mrr_range"]), 2)
        signup_date = fake.date_between(start_date=START_DATE.date(), end_date=(END_DATE - timedelta(days=30)).date())
        signup_date = datetime.combine(signup_date, datetime.min.time())

        # Churn logic: low-usage + SMB = higher churn
        churned = random.random() < seg_cfg["churn_prob"] * 12  # annual view
        churn_date = None
        if churned:
            days_active = random.randint(30, (END_DATE - signup_date).days)
            churn_date = signup_date + timedelta(days=days_active)
            if churn_date > END_DATE:
                churn_date = None
                churned = False

        records.append({
            "customer_id":   f"CUST-{i+1:04d}",
            "company_name":  fake.company(),
            "segment":       segment,
            "plan":          random.choice(PLANS),
            "mrr":           mrr,
            "signup_date":   signup_date.strftime("%Y-%m-%d"),
            "churn_date":    churn_date.strftime("%Y-%m-%d") if churn_date else None,
            "status":        "churned" if churned else "active",
            "country":       random.choice(COUNTRIES),
            "industry":      random.choice(["SaaS", "Fintech", "E-commerce", "Healthcare",
                                            "EdTech", "Logistics", "Marketing", "HR Tech"]),
        })

    return pd.DataFrame(records)


# ── Subscriptions ─────────────────────────────────────────────────────────────
def generate_subscriptions(customers_df):
    records = []
    for _, row in customers_df.iterrows():
        start = row["signup_date"]
        end = row["churn_date"] if row["status"] == "churned" else None
        records.append({
            "sub_id":        f"SUB-{row['customer_id']}",
            "customer_id":   row["customer_id"],
            "plan":          row["plan"],
            "start_date":    start,
            "end_date":      end,
            "status":        row["status"],
            "monthly_value": row["mrr"],
        })
    return pd.DataFrame(records)


# ── Events (product usage) ────────────────────────────────────────────────────
def generate_events(customers_df):
    records = []
    event_types = ["login", "feature_use", "export", "support_ticket", "upgrade_viewed"]

    for _, row in customers_df.iterrows():
        signup = datetime.strptime(row["signup_date"], "%Y-%m-%d")
        end = (datetime.strptime(row["churn_date"], "%Y-%m-%d")
               if pd.notna(row["churn_date"]) and row["churn_date"] else END_DATE)

        # Low-usage customers churn more → SMB gets fewer events
        n_events = random.randint(5, 20) if row["segment"] == "SMB" else random.randint(20, 80)
        if row["segment"] == "Enterprise":
            n_events = random.randint(60, 150)

        for _ in range(n_events):
            days_range = max((end - signup).days, 1)
            event_date = signup + timedelta(days=random.randint(0, days_range))
            records.append({
                "event_id":     fake.uuid4()[:8],
                "customer_id":  row["customer_id"],
                "event_date":   event_date.strftime("%Y-%m-%d"),
                "event_type":   random.choice(event_types),
                "feature_name": random.choice(FEATURES),
            })

    return pd.DataFrame(records)


# ── Monthly MRR Snapshot ──────────────────────────────────────────────────────
def generate_monthly_mrr(customers_df):
    records = []
    months = pd.date_range(start="2023-01-01", end="2024-12-01", freq="MS")

    for month in months:
        month_str = month.strftime("%Y-%m-%d")
        active = customers_df[
            (pd.to_datetime(customers_df["signup_date"]) <= month) &
            ((customers_df["churn_date"].isna()) |
             (pd.to_datetime(customers_df["churn_date"]) > month))
        ]
        churned_this_month = customers_df[
            customers_df["churn_date"].notna() &
            (pd.to_datetime(customers_df["churn_date"]).dt.to_period("M") ==
             month.to_period("M"))
        ]
        records.append({
            "month":             month_str,
            "active_customers":  len(active),
            "mrr":               round(active["mrr"].sum(), 2),
            "churned_customers": len(churned_this_month),
            "churned_mrr":       round(churned_this_month["mrr"].sum(), 2),
            "churn_rate_pct":    round(len(churned_this_month) / max(len(active), 1) * 100, 2),
        })

    return pd.DataFrame(records)


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    os.makedirs("data/raw", exist_ok=True)
    os.makedirs("data/processed", exist_ok=True)

    print("Generating customers...")
    customers = generate_customers()
    customers.to_csv("data/raw/customers.csv", index=False)
    print(f"  ✓ {len(customers)} customers saved")

    print("Generating subscriptions...")
    subs = generate_subscriptions(customers)
    subs.to_csv("data/raw/subscriptions.csv", index=False)
    print(f"  ✓ {len(subs)} subscriptions saved")

    print("Generating events...")
    events = generate_events(customers)
    events.to_csv("data/raw/events.csv", index=False)
    print(f"  ✓ {len(events)} events saved")

    print("Generating monthly MRR snapshots...")
    mrr = generate_monthly_mrr(customers)
    mrr.to_csv("data/processed/monthly_mrr.csv", index=False)
    print(f"  ✓ {len(mrr)} months saved")

    print("\n✅ All data generated successfully!")
    print(f"   Customers: {len(customers)} | Active: {(customers['status']=='active').sum()} | Churned: {(customers['status']=='churned').sum()}")
    print(f"   Total MRR (latest): ${customers[customers['status']=='active']['mrr'].sum():,.0f}")
