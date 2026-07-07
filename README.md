# NamPay — Namibian Payroll System

A clean, modern payroll application built for Namibian businesses, fully aligned with the **Labour Act 11 of 2007** and the **NamRA tax tables (2024/2025)**. Styled with a navy blue and cream colour scheme inspired by PaySpace.

![Stack](https://img.shields.io/badge/React-18-blue) ![Build](https://img.shields.io/badge/Vite-5-purple) ![Styling](https://img.shields.io/badge/Tailwind_CSS-3-teal)

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | KPI cards, payroll trend charts, department cost breakdown, statutory deadline reminders |
| **Employees** | Searchable employee register with full profiles, remuneration breakdowns, banking details, and leave balances |
| **Payroll Run** | Guided 4-step wizard: select period → review & adjust → verify totals → approve & process. Supports per-employee bonus/overtime adjustments with live recalculation |
| **Payslips** | Professional printable payslips with earnings, deductions, tax details, and leave balances |
| **Leave Management** | Application workflow (apply / approve / decline), balance tracking, and a built-in Labour Act reference guide |
| **Tax Calculator** | Interactive PAYE calculator with live bracket visualisation, SSC, VET levy, and annual projections |
| **Reports** | Trend analysis, department payroll analysis, monthly reports (payroll register, bank listing, PAYE, SSC, pension/medical schedules, cost-centre costing) and annual reports (ITAS tax certificates, PAYE reconciliation, WC declaration, leave liability, audit pack) |
| **Configuration** | Pay component architecture with PAYE/SSC/WC/Pension inclusion flags per component, deduction priority rules, employer contributions, fringe benefit catalog, statutory rates, and the Namibian public holiday calendar |

## Configuration-Driven Design

The system implements the Katelago Payroll Configuration requirements:

- **Employee master data** — mandatory statutory fields (employee number, legal name, ID, SSC number, tax reference, citizenship, employment category, grade, cost centre, duty station, reporting manager) plus payroll control flags (pay frequency, working days, overtime/public-holiday/leave-accrual eligibility)
- **Pre-payroll validation** — employees with missing SSC or tax reference numbers are automatically excluded from the payroll run
- **Component flags** — every earning, allowance, and fringe benefit carries PAYE / SSC / WC / Pension inclusion flags, allocation type, and package indicator
- **Deduction priority & net-pay protection** — statutory deductions first, then contractual, then voluntary; voluntary deductions are automatically reduced or skipped if they would result in negative net pay
- **Fringe benefits** — notional values are added to taxable income for PAYE without affecting cash pay, and reported separately on the payslip
- **Loan balance tracking** — staff loans and electronics loans carry outstanding balances and monthly recovery amounts
- **Period locking** — processed payroll periods are locked with an audit trail

## Statutory Compliance

### PAYE — Income Tax Act (Act 24 of 1981, as amended) · Tax Year 2024/2025

| Annual Taxable Income | Rate |
|----------------------|------|
| N$0 – N$50,000 | 0% |
| N$50,001 – N$100,000 | 18% |
| N$100,001 – N$300,000 | N$9,000 + 25% |
| N$300,001 – N$500,000 | N$59,000 + 28% |
| N$500,001 – N$800,000 | N$115,000 + 30% |
| N$800,001 – N$1,500,000 | N$205,000 + 32% |
| N$1,500,001+ | N$429,000 + 37% |

Annual rebate: **N$17,640**

### Social Security (Social Security Act 34 of 1994)
- 0.9% employee + 0.9% employer, each capped at **N$81/month** (earnings ceiling N$9,000/month)

### Other
- **VET Levy**: 1% of gross payroll (employers with payroll > N$1m p.a.)
- **Workmen's Compensation**: employer assessment on earnings up to N$81,300 p.a. (Employees' Compensation Act 30 of 1941)
- **Pension**: tax-deductible up to 27.5% of income, max N$150,000 p.a.

### Labour Act 11 of 2007
- Annual leave: 24 working days per year (s.23)
- Sick leave: 26 working days per 3-year cycle (s.24)
- Family responsibility leave: 5 days per year (s.25)
- Maternity leave: minimum 12 weeks (s.26)
- Overtime: 1.5× weekday, 2× Sundays/public holidays (s.17)
- Notice periods per s.34

## Getting Started

```bash
npm install
npm run dev      # development server
npm run build    # production build
```

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3** — custom navy/cream design system
- **React Router 6** — client-side routing
- **Recharts** — data visualisation
- **Lucide React** — icons

## Project Structure

```
src/
├── App.jsx                 # Routes
├── components/Layout.jsx   # Sidebar + topbar shell
├── data/employees.js       # Sample employee data + company info
├── pages/
│   ├── Dashboard.jsx
│   ├── Employees.jsx
│   ├── PayrollRun.jsx
│   ├── Payslips.jsx
│   ├── LeaveManagement.jsx
│   ├── TaxCalculator.jsx
│   └── Reports.jsx
└── utils/namibianTax.js    # PAYE / SSC / VET / leave calculation engine
```

## Disclaimer

Sample data is fictional. Tax tables and statutory rates should be verified against the latest NamRA and SSC publications before production use. This software does not constitute tax or legal advice.
