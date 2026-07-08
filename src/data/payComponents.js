/**
 * Pay Component Catalog
 * Per Katelago Payroll Configuration Checklist (Item 10B, sections B–F).
 * Every component carries statutory inclusion flags:
 *   paye    — included in taxable income
 *   ssc     — included in SSC income base
 *   wc      — included in Workmen's Compensation income base
 *   pension — pensionable earnings
 * plus allocation type and package indicator.
 */

export const EARNINGS = [
  { code: 'E001', name: 'Basic Salary',            paye: true,  ssc: true,  wc: true,  pension: true,  allocation: 'statutory', inPackage: true,  frequency: 'Monthly' },
  { code: 'E002', name: 'Acting Allowance',        paye: true,  ssc: false, wc: true,  pension: false, allocation: 'manual',    inPackage: false, frequency: 'Ad hoc' },
  { code: 'E003', name: 'Backpay',                 paye: true,  ssc: false, wc: true,  pension: false, allocation: 'manual',    inPackage: false, frequency: 'Ad hoc' },
  { code: 'E004', name: 'Commission',              paye: true,  ssc: false, wc: true,  pension: false, allocation: 'manual',    inPackage: false, frequency: 'Monthly' },
  { code: 'E005', name: 'Lump Sum / Directive',    paye: true,  ssc: false, wc: false, pension: false, allocation: 'manual',    inPackage: false, frequency: 'Ad hoc' },
  { code: 'E006', name: 'Leave Pay',               paye: true,  ssc: false, wc: true,  pension: false, allocation: 'automatic', inPackage: false, frequency: 'Ad hoc' },
  { code: 'E007', name: 'Normal Overtime (1.5×)',  paye: true,  ssc: false, wc: true,  pension: false, allocation: 'automatic', inPackage: false, frequency: 'Ad hoc' },
  { code: 'E008', name: 'Special Overtime (2×)',   paye: true,  ssc: false, wc: true,  pension: false, allocation: 'automatic', inPackage: false, frequency: 'Ad hoc' },
  { code: 'E009', name: 'Public Holiday Overtime (2×)', paye: true, ssc: false, wc: true, pension: false, allocation: 'automatic', inPackage: false, frequency: 'Ad hoc' },
]

export const ALLOWANCES = [
  { code: 'A001', name: 'Approved Housing Scheme Allowance', paye: 'partial', ssc: false, wc: true,  pension: false, allocation: 'automatic', inPackage: true,  frequency: 'Monthly', note: '1/3 exempt where scheme is NamRA-approved' },
  { code: 'A002', name: 'GN Housing Scheme Allowance',       paye: 'partial', ssc: false, wc: true,  pension: false, allocation: 'automatic', inPackage: true,  frequency: 'Monthly' },
  { code: 'A003', name: 'Housing Allowance (non-scheme)',    paye: true,  ssc: false, wc: true,  pension: false, allocation: 'automatic', inPackage: true,  frequency: 'Monthly' },
  { code: 'A004', name: 'Business Allowance',                paye: true,  ssc: false, wc: true,  pension: false, allocation: 'manual',    inPackage: false, frequency: 'Monthly' },
  { code: 'A005', name: 'Fuel Allowance',                    paye: true,  ssc: false, wc: true,  pension: false, allocation: 'manual',    inPackage: false, frequency: 'Monthly' },
  { code: 'A006', name: 'Transport Allowance',               paye: true,  ssc: false, wc: true,  pension: false, allocation: 'automatic', inPackage: true,  frequency: 'Monthly' },
  { code: 'A007', name: 'Mobile Airtime Allowance',          paye: true,  ssc: false, wc: false, pension: false, allocation: 'automatic', inPackage: true,  frequency: 'Monthly' },
  { code: 'A008', name: 'Travel Allowance',                  paye: 'partial', ssc: false, wc: true, pension: false, allocation: 'manual',   inPackage: false, frequency: 'Monthly' },
  { code: 'A009', name: 'Medical Allowance',                 paye: true,  ssc: false, wc: false, pension: false, allocation: 'manual',    inPackage: false, frequency: 'Monthly' },
]

export const DEDUCTIONS = [
  { code: 'D001', name: 'PAYE (Tax)',                 category: 'Statutory',   priority: 1, allocation: 'statutory' },
  { code: 'D002', name: 'Additional Tax',             category: 'Statutory',   priority: 1, allocation: 'manual' },
  { code: 'D003', name: 'Social Security — Employee', category: 'Statutory',   priority: 1, allocation: 'statutory' },
  { code: 'D004', name: 'Pension Fund — Employee',    category: 'Contractual', priority: 2, allocation: 'automatic' },
  { code: 'D005', name: 'Medical Aid — Employee',     category: 'Contractual', priority: 2, allocation: 'automatic' },
  { code: 'D006', name: 'Staff Loan',                 category: 'Voluntary',   priority: 3, allocation: 'automatic', trackBalance: true, requiresConsent: true },
  { code: 'D007', name: 'Loan: Electronics',          category: 'Voluntary',   priority: 3, allocation: 'automatic', trackBalance: true, requiresConsent: true },
  { code: 'D008', name: 'Uniform',                    category: 'Voluntary',   priority: 3, allocation: 'manual',    requiresConsent: true },
  { code: 'D009', name: 'Employee Purchases',         category: 'Voluntary',   priority: 3, allocation: 'manual',    requiresConsent: true },
  { code: 'D010', name: 'Social Club',                category: 'Voluntary',   priority: 3, allocation: 'automatic', requiresConsent: true },
]

export const EMPLOYER_CONTRIBUTIONS = [
  { code: 'C001', name: 'Social Security — Employer',  basis: '0.9% of basic (max N$81/month)' },
  { code: 'C002', name: 'Pension Fund — Employer',     basis: 'Per fund rules (e.g. 10% of pensionable pay)' },
  { code: 'C003', name: 'Medical Aid — Employer',      basis: 'Per scheme (typically 50–60% of premium)' },
  { code: 'C004', name: "Workmen's Compensation",      basis: 'Risk-class rate on earnings ≤ N$81,300 p.a.' },
  { code: 'C005', name: 'VET Levy',                    basis: '1% of payroll (employers > N$1m p.a.)' },
  { code: 'C006', name: 'Social Club',                 basis: 'Fixed amount where applicable' },
  { code: 'C007', name: 'Leave Provision (accounting)', basis: 'Accrued leave liability posting' },
]

export const FRINGE_BENEFITS = [
  { code: 'F001', name: 'Housing Fringe Benefit',       calc: 'Notional rental value less employee contribution', paye: true },
  { code: 'F002', name: 'Medical Fringe Benefit',        calc: 'Employer medical contribution (per NamRA schedule)', paye: true },
  { code: 'F003', name: 'Travel Benefit',                calc: 'Private-use portion of company vehicle', paye: true },
  { code: 'F004', name: 'Loan Interest Fringe Benefit',  calc: 'Interest saved vs official rate on staff loans', paye: true },
  { code: 'F005', name: 'Mortgage Subsidy',              calc: 'Employer-paid interest subsidy', paye: true },
]

/**
 * Report catalogue — categorised, described reports modelled on the PaySpace
 * NextGen / Classic report library. `nextgen: true` marks reports available in
 * the modern report engine; all are available in Classic.
 */
export const REPORT_CATALOG = [
  // Payroll
  { category: 'Payroll', name: 'Payroll Register', desc: 'Compact view of employees’ payslips with multiple payslips per page.', nextgen: true, format: ['PDF', 'Excel'] },
  { category: 'Payroll', name: 'Payroll Reconciliation', desc: 'Reconciliation of a chosen period’s payslip values against the prior run.', nextgen: true, format: ['PDF', 'Excel'] },
  { category: 'Payroll', name: 'Payslips', desc: 'Individual payslips for a chosen run, per employee.', nextgen: true, format: ['PDF'] },
  { category: 'Payroll', name: 'Bank Net Pay Listing', desc: 'Bank payment file listing of net pay for salary transfers.', nextgen: true, format: ['Excel', 'CSV'] },
  { category: 'Payroll', name: 'Component Variance', desc: 'Compares all input captured between two selected runs.', nextgen: true, format: ['Excel'] },
  { category: 'Payroll', name: 'Cost To Company Report', desc: 'Full cost-to-company breakdown per employee including employer contributions.', nextgen: true, format: ['PDF', 'Excel'] },
  { category: 'Payroll', name: 'Consolidated Payroll Reconciliation', desc: 'Month-to-date figures of all components for selected companies in a group.', nextgen: true, format: ['Excel'] },
  { category: 'Payroll', name: 'Loans Report', desc: 'Outstanding staff loan and electronics-loan balances with monthly recovery.', nextgen: true, format: ['Excel'] },
  { category: 'Payroll', name: 'Pension & Provident Report', desc: 'Pension / provident fund contributions for a chosen period.', nextgen: true, format: ['Excel'] },
  { category: 'Payroll', name: 'Medical Aid Schedule', desc: 'Medical aid contribution schedule per provider.', nextgen: true, format: ['Excel'] },
  { category: 'Payroll', name: 'Arrears Report', desc: 'Listing of employee arrears amounts for a chosen run.', nextgen: false, format: ['PDF'] },
  { category: 'Payroll', name: 'Garnishee Report', desc: 'Listing of employees’ garnishee orders for a chosen period.', nextgen: false, format: ['Excel'] },

  // Statutory
  { category: 'Statutory', name: 'NamRA PAYE Return', desc: 'Employee tax schedule for the monthly NamRA submission (due the 20th).', nextgen: true, format: ['PDF', 'Excel'] },
  { category: 'Statutory', name: 'SSC Contribution Report', desc: 'Social Security employee + employer contributions per employee.', nextgen: true, format: ['Excel'] },
  { category: 'Statutory', name: 'VET Levy Report', desc: 'Vocational Education & Training levy summary for the NTA.', nextgen: true, format: ['Excel'] },
  { category: 'Statutory', name: 'Workmen’s Compensation Declaration', desc: 'Annual WC earnings declaration and assessment.', nextgen: true, format: ['PDF', 'Excel'] },
  { category: 'Statutory', name: 'Tax Certificates (ITAS)', desc: 'Annual employee tax certificates for ITAS submission.', nextgen: true, format: ['PDF'] },
  { category: 'Statutory', name: 'Annual PAYE Reconciliation', desc: 'Year-end PAYE reconciliation to NamRA.', nextgen: true, format: ['Excel'] },

  // Human Resources
  { category: 'Human Resources', name: 'Employee Listing', desc: 'Listing of all employees with core master-data fields.', nextgen: true, format: ['Excel'] },
  { category: 'Human Resources', name: 'Dynamic Employee Details', desc: 'Selectable pre-defined employee fields for a custom extract.', nextgen: true, format: ['Excel'] },
  { category: 'Human Resources', name: 'Dependants Listing', desc: 'Listing of dependants with their details.', nextgen: true, format: ['Excel'] },
  { category: 'Human Resources', name: 'New Engagements and Terminations', desc: 'Employees engaged or terminated within a chosen period.', nextgen: true, format: ['Excel'] },
  { category: 'Human Resources', name: 'Employee Suspension', desc: 'Listing of all suspended employees as at a chosen date.', nextgen: false, format: ['Excel'] },

  // Leave
  { category: 'Leave', name: 'Leave Balances', desc: 'Employees’ leave balances for a chosen period.', nextgen: true, format: ['Excel'] },
  { category: 'Leave', name: 'Leave Transactions', desc: 'All leave transactions for a specified period.', nextgen: true, format: ['Excel'] },
  { category: 'Leave', name: 'Leave Liability Report', desc: 'Accrued leave provision for the financial statements.', nextgen: true, format: ['Excel'] },

  // Costing
  { category: 'Costing', name: 'Costing by Cost Centre', desc: 'Payroll cost split by cost centre and department.', nextgen: true, format: ['Excel'] },
  { category: 'Costing', name: 'Project Costing Report', desc: 'All figures posted to an org unit, project and activity per employee.', nextgen: true, format: ['Excel'] },

  // Audit
  { category: 'Audit', name: 'Audit Trail Report', desc: 'All audit-trail results for chosen parameters.', nextgen: true, format: ['Excel'] },
  { category: 'Audit', name: 'Payroll Audit Support Pack', desc: 'Change logs, approvals and audit-trail extracts for auditors.', nextgen: true, format: ['PDF', 'Excel'] },
]

export const REPORT_CATEGORIES = [...new Set(REPORT_CATALOG.map(r => r.category))]

/** Namibian public holidays (section H) — national calendar */
export const PUBLIC_HOLIDAYS_2025 = [
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-03-21', name: 'Independence Day' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-04-21', name: 'Easter Monday' },
  { date: '2025-05-01', name: "Workers' Day" },
  { date: '2025-05-04', name: 'Cassinga Day' },
  { date: '2025-05-05', name: 'Cassinga Day (observed)' },
  { date: '2025-05-25', name: 'Africa Day' },
  { date: '2025-05-26', name: 'Africa Day (observed)' },
  { date: '2025-05-29', name: 'Ascension Day' },
  { date: '2025-08-26', name: "Heroes' Day" },
  { date: '2025-12-10', name: 'Human Rights Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2025-12-26', name: 'Family Day' },
]

export const PUBLIC_HOLIDAYS_2026 = [
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-03-21', name: 'Independence Day' },
  { date: '2026-04-03', name: 'Good Friday' },
  { date: '2026-04-06', name: 'Easter Monday' },
  { date: '2026-05-01', name: "Workers' Day" },
  { date: '2026-05-04', name: 'Cassinga Day' },
  { date: '2026-05-14', name: 'Ascension Day' },
  { date: '2026-05-25', name: 'Africa Day' },
  { date: '2026-08-26', name: "Heroes' Day" },
  { date: '2026-12-10', name: 'Human Rights Day' },
  { date: '2026-12-25', name: 'Christmas Day' },
  { date: '2026-12-26', name: 'Family Day' },
]

export const PUBLIC_HOLIDAYS = [...PUBLIC_HOLIDAYS_2025, ...PUBLIC_HOLIDAYS_2026]
