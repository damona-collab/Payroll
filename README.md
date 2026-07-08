# BluvoPay — Namibian Payroll System

A clean, modern payroll application built for Namibian businesses, fully aligned with the **Labour Act 11 of 2007** and the **NamRA tax tables (2026/2027)**. Styled with a navy blue and cream colour scheme inspired by PaySpace.

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

### PAYE — Income Tax Act (Act 24 of 1981, as amended) · Tax Year 2026/2027

| Annual Taxable Income | Rate |
|----------------------|------|
| N$0 – N$100,000 | 0% |
| N$100,001 – N$150,000 | 18% of amount over N$100,000 |
| N$150,001 – N$350,000 | N$9,000 + 25% of amount over N$150,000 |
| N$350,001 – N$550,000 | N$59,000 + 28% of amount over N$350,000 |
| N$550,001 – N$850,000 | N$115,000 + 30% of amount over N$550,000 |
| N$850,001 – N$1,550,000 | N$205,000 + 32% of amount over N$850,000 |
| N$1,550,001+ | N$429,000 + 37% of amount over N$1,550,000 |

The tax-free threshold was raised to **N$100,000**; no separate rebate applies. All amounts are in Namibian Dollar (N$ / NAD).

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

## Desktop App (Recommended)

BluvoPay ships as a proper installable desktop application (Electron). Build the installer once, then install it like any other program — it gets its own icon, Start Menu entry, and desktop shortcut automatically.

**One command on a Linux desktop (Docker required, no Node.js needed):**

```bash
./install-bluvopay.sh
```

This builds the app, installs it, adds **BluvoPay to your application menu**, and puts a **BluvoPay shortcut on your Desktop** automatically.

**Or build only (without installing):**

```bash
./build-desktop-app.sh            # Linux installers (AppImage + .deb)
./build-desktop-app.sh windows    # Windows .exe installer (built via Wine)
sudo apt install ./release/namibia-payroll_1.0.0_amd64.deb
```

**With Node.js directly:**

```bash
npm install          # one-time setup
npm run dist:win     # Windows → release/BluvoPay Setup 1.0.0.exe
npm run dist:mac     # macOS   → release/BluvoPay-1.0.0.dmg
npm run dist:linux   # Linux   → release/BluvoPay-1.0.0.AppImage + .deb
```

Run the installer from the `release/` folder. On Windows the setup wizard creates a **desktop shortcut** and Start Menu entry for you.

For development you can also run the desktop shell against the live dev server:

```bash
npm run dev          # terminal 1 — Vite dev server
npm run app          # terminal 2 — Electron window
```

### Quick-Launch Scripts (no install)

If you prefer not to install anything, double-click launchers are also included:

- **Windows** — right-click `Launch BluvoPay.bat` → *Send to* → *Desktop (create shortcut)*. Double-clicking installs dependencies on first run, starts the app, and opens your browser.
- **macOS** — duplicate `launch-bluvopay.sh` as `launch-bluvopay.command` (`cp launch-bluvopay.sh launch-bluvopay.command && chmod +x launch-bluvopay.command`), then drag it to the Dock or make an alias on the Desktop.
- **Linux** — copy `bluvopay.desktop` to `~/Desktop/` (or `~/.local/share/applications/`), edit the `Exec=` path to your clone location, and mark it executable/trusted.

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
├── data/
│   ├── employees.js        # Sample employees, company info, monthly history
│   └── payComponents.js    # Pay component catalog + public holidays
├── pages/
│   ├── Dashboard.jsx
│   ├── Employees.jsx
│   ├── PayrollRun.jsx      # 4-step run with pre-payroll validation
│   ├── Payslips.jsx        # Printable payslip + income perspectives
│   ├── ComparePayslips.jsx # Side-by-side periods with Difference column
│   ├── TaxDrilldown.jsx    # YTD + monthly hierarchical tax drilldown
│   ├── LeaveManagement.jsx
│   ├── TaxCalculator.jsx
│   ├── Reports.jsx
│   └── Configuration.jsx   # Component flags, statutory rates, holidays
└── utils/namibianTax.js    # PAYE / SSC / WC / VET / income-stream engine

electron/main.cjs           # Desktop shell (Electron)
build/                      # App icons (PNG + ICO)
BluvoPay.html                # Single-file build (open in any browser)
```

## PaySpace-Style Mechanisms

Modelled on the client's PaySpace configuration:

- **Income perspectives** — every payslip resolves earnings into Gross Income, Social Security Income, Taxable Income, Total Allowable, True Taxable Income, Workmen's Comp Income (capped + uncapped), and VET Levy Income, each with a tax code. PAYE is levied on True Taxable Income.
- **Employee Tax Drilldown** — expandable Earning / Gross / Deduction / Company Contribution / Information totals with a YTD column and one column per period.
- **Compare Payslips** — side-by-side period columns with a Difference column.

## Disclaimer

Sample data is fictional. Tax tables and statutory rates should be verified against the latest NamRA and SSC publications before production use. This software does not constitute tax or legal advice.
