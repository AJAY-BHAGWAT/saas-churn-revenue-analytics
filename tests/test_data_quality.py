"""
SaaS Churn & Revenue Analytics — Data Quality Tests
Project 1 | Ajay's Data Analyst Portfolio

Run: pytest tests/ -v
"""

import pytest
import pandas as pd
import os


@pytest.fixture(scope="module")
def customers():
    path = "data/raw/customers.csv"
    assert os.path.exists(path), f"Missing file: {path}"
    return pd.read_csv(path, parse_dates=["signup_date", "churn_date"])


@pytest.fixture(scope="module")
def events():
    path = "data/raw/events.csv"
    assert os.path.exists(path), f"Missing file: {path}"
    return pd.read_csv(path, parse_dates=["event_date"])


@pytest.fixture(scope="module")
def monthly_mrr():
    path = "data/processed/monthly_mrr.csv"
    assert os.path.exists(path), f"Missing file: {path}"
    return pd.read_csv(path, parse_dates=["month"])


# ── Customers ─────────────────────────────────────────────────────────────────

class TestCustomers:

    def test_no_duplicate_customer_ids(self, customers):
        assert customers["customer_id"].duplicated().sum() == 0

    def test_required_columns_exist(self, customers):
        required = ["customer_id", "company_name", "segment", "mrr",
                    "signup_date", "status", "plan"]
        for col in required:
            assert col in customers.columns, f"Missing column: {col}"

    def test_mrr_non_negative(self, customers):
        assert (customers["mrr"] >= 0).all(), "Some MRR values are negative"

    def test_status_valid_values(self, customers):
        valid = {"active", "churned"}
        assert set(customers["status"].unique()).issubset(valid)

    def test_segment_valid_values(self, customers):
        valid = {"SMB", "Mid-Market", "Enterprise", "Freemium"}
        assert set(customers["segment"].unique()).issubset(valid)

    def test_churn_date_only_for_churned(self, customers):
        active_with_churn = customers[
            (customers["status"] == "active") & (customers["churn_date"].notna())
        ]
        assert len(active_with_churn) == 0, "Active customers should not have a churn date"

    def test_churn_date_after_signup(self, customers):
        churned = customers[customers["churn_date"].notna()].copy()
        assert (churned["churn_date"] > churned["signup_date"]).all()

    def test_minimum_customer_count(self, customers):
        assert len(customers) >= 100, "Dataset too small"

    def test_no_null_customer_ids(self, customers):
        assert customers["customer_id"].isna().sum() == 0


# ── Events ────────────────────────────────────────────────────────────────────

class TestEvents:

    def test_all_event_customers_exist(self, customers, events):
        valid_ids = set(customers["customer_id"])
        assert set(events["customer_id"]).issubset(valid_ids), \
            "Events reference unknown customer IDs"

    def test_event_type_valid_values(self, events):
        valid = {"login", "feature_use", "export", "support_ticket", "upgrade_viewed"}
        assert set(events["event_type"].unique()).issubset(valid)

    def test_no_null_event_ids(self, events):
        assert events["event_id"].isna().sum() == 0

    def test_event_dates_in_range(self, events):
        assert (events["event_date"] >= pd.Timestamp("2023-01-01")).all()
        assert (events["event_date"] <= pd.Timestamp("2025-01-01")).all()


# ── Monthly MRR ───────────────────────────────────────────────────────────────

class TestMonthlyMRR:

    def test_mrr_positive(self, monthly_mrr):
        assert (monthly_mrr["mrr"] > 0).all(), "MRR should always be positive"

    def test_churn_rate_between_0_and_100(self, monthly_mrr):
        assert (monthly_mrr["churn_rate_pct"] >= 0).all()
        assert (monthly_mrr["churn_rate_pct"] <= 100).all()

    def test_expected_months_count(self, monthly_mrr):
        assert len(monthly_mrr) == 24, f"Expected 24 months, got {len(monthly_mrr)}"

    def test_no_null_months(self, monthly_mrr):
        assert monthly_mrr["month"].isna().sum() == 0
