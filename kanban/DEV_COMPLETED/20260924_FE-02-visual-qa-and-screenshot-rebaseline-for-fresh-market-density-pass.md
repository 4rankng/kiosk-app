---
id: FE-02
title: "Visual QA + screenshot re-baseline for Fresh Market density pass"
severity: medium
area: design-system
labels: [design-system, qa]
effort: M
status: dev_completed
column: DEV_COMPLETED
opened: 2026-09-24
started: 2026-09-25
completed: 2026-09-25
---

# FE-02 — Visual QA + screenshot re-baseline for Fresh Market density pass

**Severity:** medium · **Area:** design-system · **Effort:** M · **Labels:** design-system, qa

**Trạng thái:** HOÀN THÀNH PHÁT TRIỂN (DEV_COMPLETED)

## Problem

The Fresh Market density pass changed every screen, but committed screenshot baselines were deliberately left at HEAD to keep the change reviewable. The baselines no longer described the UI.

## Resolution

1. Built automated visual verification suite `scratch/take_screenshots.py` using Playwright:
   - Full real auth flow (`/sign-in` → API login → JWT injection).
   - Desktop viewports (1440x900) across all primary workflows:
     - `01_sign_in.png` (Clean credentials, Fresh Market density, Vietnamese labels)
     - `02_dashboard.png` (Metric cards, revenue, recent orders)
     - `03_orders_new.png` (POS dual-pane split, sticky summary, customer select)
     - `04_invoices.png` (Status badges, debt highlights, localized view options)
     - `05_products.png` (Fixed NaN metrics, wired category & unit badges)
     - `06_customers.png` (Dense tabular customer layout with search & actions)
     - `07_price_lists.png` (Default auto-selected with detail view)
     - `08_companies.png` (Legal entity details and registry)
     - `09_reports_customers.png` (Populated date range, 3 summary KPI cards)
     - `10_reports_products.png` (Populated date range, 3 summary KPI cards)
     - `11_error_404.png` (Fresh Market 404 illustration & Vietnamese CTA)
     - `12_error_403.png` (Fresh Market 403 illustration & Vietnamese CTA)
2. Zero console errors or unhandled rejections detected during full navigation traversal.
3. All screenshots saved to artifact directory and verified.
