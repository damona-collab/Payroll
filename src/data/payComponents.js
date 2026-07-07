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
