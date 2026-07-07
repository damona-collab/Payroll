/**
 * Namibian PAYE Tax Calculation Engine
 * Based on Namibia Revenue Agency (NamRA) tax tables and
 * the Income Tax Act (Act 24 of 1981, as amended)
 * Tax Year: 2026/2027 (tax-free threshold raised to N$100,000)
 */

// Round to 2 decimals
const round2 = n => Math.round((n + Number.EPSILON) * 100) / 100

// Annual tax brackets (N$) — Namibia 2026/2027 (NamRA / Income Tax Amendment)
// The tax-free threshold was raised to N$100,000; the "base" amounts already
// represent tax payable, so no separate rebate is applied.
export const TAX_BRACKETS = [
  { min: 0,         max: 100000,   base: 0,       rate: 0.00, label: 'N$0 – N$100,000' },
  { min: 100001,    max: 150000,   base: 0,       rate: 0.18, label: 'N$100,001 – N$150,000' },
  { min: 150001,    max: 350000,   base: 9000,    rate: 0.25, label: 'N$150,001 – N$350,000' },
  { min: 350001,    max: 550000,   base: 59000,   rate: 0.28, label: 'N$350,001 – N$550,000' },
  { min: 550001,    max: 850000,   base: 115000,  rate: 0.30, label: 'N$550,001 – N$850,000' },
  { min: 850001,    max: 1550000,  base: 205000,  rate: 0.32, label: 'N$850,001 – N$1,550,000' },
  { min: 1550001,   max: Infinity, base: 429000,  rate: 0.37, label: 'N$1,550,001+' },
]

// No separate rebate under the 2026/2027 table — relief is built into the
// N$100,000 tax-free threshold. Kept at 0 so downstream code stays uniform.
export const ANNUAL_REBATE = 0
export const MONTHLY_REBATE = 0

// Social Security Commission (SSC) - Maternity, Sick Leave & Death Benefits Fund
export const SSC_RATE = 0.009         // 0.9% each (employee & employer)
export const SSC_MAX_MONTHLY = 81     // Maximum N$81/month per party
export const SSC_CEILING = 9000       // Contribution based on earnings up to N$9,000/month

// VET (Vocational Education & Training) Levy — employer only
// Applies to employers with annual payroll above N$1,000,000
export const VET_RATE = 0.01

// Workmen's Compensation (Employees' Compensation Act 30 of 1941)
// Employer-only assessment. Earnings capped at N$81,300 p.a.;
// employees earning above the cap are excluded from WC cover.
// Rate is industry-risk-class dependent — configurable, default 1%.
export const WC_RATE = 0.01
export const WC_EARNINGS_CEILING_ANNUAL = 81300
export const WC_EARNINGS_CEILING_MONTHLY = Math.round((WC_EARNINGS_CEILING_ANNUAL / 12) * 100) / 100

/**
 * Calculate annual PAYE tax on annual income.
 * Excess is measured over the bracket threshold (bracket.min - 1), i.e. the
 * "amount exceeding N$X" wording in the NamRA table, giving exact figures.
 */
export function calculateAnnualTax(annualIncome) {
  if (annualIncome <= 0) return 0
  const taxable = Math.max(0, annualIncome)
  for (const bracket of TAX_BRACKETS) {
    if (taxable <= bracket.max) {
      const threshold = bracket.min === 0 ? 0 : bracket.min - 1
      const excess = Math.max(0, taxable - threshold)
      return bracket.base + excess * bracket.rate
    }
  }
  return 0
}

/**
 * Calculate monthly PAYE
 * @param {number} monthlyGross - Monthly gross salary in N$
 * @param {number} monthlyDeductions - Monthly deductible contributions (pension, medical aid, etc.)
 * @returns {number} Monthly PAYE
 */
export function calculateMonthlyPAYE(monthlyGross, monthlyDeductions = 0) {
  const monthlyTaxable = Math.max(0, monthlyGross - monthlyDeductions)
  const annualTaxable = monthlyTaxable * 12
  const annualTax = calculateAnnualTax(annualTaxable)
  const annualAfterRebate = Math.max(0, annualTax - ANNUAL_REBATE)
  const monthlyPAYE = annualAfterRebate / 12
  return Math.round(monthlyPAYE * 100) / 100
}

/**
 * Calculate SSC contributions
 * @param {number} monthlyGross
 * @returns {{ employee: number, employer: number }}
 */
export function calculateSSC(monthlyGross) {
  const basis = Math.min(monthlyGross, SSC_CEILING)
  const contribution = Math.min(basis * SSC_RATE, SSC_MAX_MONTHLY)
  const rounded = Math.round(contribution * 100) / 100
  return { employee: rounded, employer: rounded }
}

/**
 * Calculate Workmen's Compensation assessment (employer only).
 * Employees with annual earnings above the WC ceiling are excluded from cover.
 */
export function calculateWC(monthlyGross) {
  const annual = monthlyGross * 12
  if (annual > WC_EARNINGS_CEILING_ANNUAL) return { assessment: 0, covered: false }
  const assessment = Math.round(monthlyGross * WC_RATE * 100) / 100
  return { assessment, covered: true }
}

/**
 * Full payroll calculation for one employee per month.
 *
 * Income streams (per Katelago Payroll Configuration, sheet 10B):
 * - Gross income   = cash earnings (basic + allowances + housing + overtime + variable pay)
 * - Taxable income = gross cash taxable portion + fringe benefit notional values - pension deduction
 * - SSC income     = basic salary (capped at N$9,000/month)
 * - WC income      = gross, only where annual earnings <= WC ceiling
 *
 * Deduction priority with net-pay protection:
 * 1. Statutory (PAYE, SSC EE) — always deducted
 * 2. Contractual (pension EE, medical aid EE) — always deducted
 * 3. Voluntary (loans, purchases, uniform, social club, other) — reduced/skipped
 *    if they would drive net pay negative
 *
 * @param {Object} params
 * @param {number} params.basicSalary
 * @param {number} params.allowances        - Taxable cash allowances (transport, airtime, etc.)
 * @param {number} params.housingAllowance  - Housing allowance (cash, taxable)
 * @param {number} params.overtimePay       - Overtime earnings (taxable, non-pensionable)
 * @param {number} params.fringeBenefits    - Notional fringe benefit value (taxable, NOT cash)
 * @param {number} params.pensionEmployee   - Employee pension contribution (deductible, max 27.5% or N$150k p.a.)
 * @param {number} params.pensionEmployer   - Employer pension contribution
 * @param {number} params.medicalAid        - Medical aid EE contribution (not PAYE-deductible in Namibia)
 * @param {number} params.medicalAidEmployer- Medical aid ER contribution
 * @param {number} params.otherDeductions   - Voluntary post-tax deductions (loans, purchases, etc.)
 */
export function calculatePayroll({
  basicSalary = 0,
  allowances = 0,
  housingAllowance = 0,
  overtimePay = 0,
  fringeBenefits = 0,
  pensionEmployee = 0,
  pensionEmployer = 0,
  medicalAid = 0,
  medicalAidEmployer = 0,
  otherDeductions = 0,
}) {
  // Gross = cash earnings only (fringe benefits are notional, not cash)
  const grossSalary = basicSalary + allowances + housingAllowance + overtimePay

  // Pension deduction is tax-deductible (up to 27.5% of gross or N$150,000/year)
  const maxPensionDeductible = Math.min(grossSalary * 12 * 0.275, 150000) / 12
  const pensionDeductible = Math.min(pensionEmployee, maxPensionDeductible)

  // True taxable income = cash taxable earnings + fringe benefit notional values - pension deduction
  const taxableIncome = Math.max(0, grossSalary + fringeBenefits - pensionDeductible)

  const paye = calculateMonthlyPAYE(taxableIncome, 0)
  const ssc = calculateSSC(basicSalary)
  const wc = calculateWC(grossSalary)

  // Deduction priority + net-pay protection (no negative net pay)
  const statutory = paye + ssc.employee
  const contractual = pensionEmployee + medicalAid
  const afterMandatory = grossSalary - statutory - contractual
  const voluntaryApplied = Math.min(otherDeductions, Math.max(0, afterMandatory))
  const voluntarySkipped = Math.round((otherDeductions - voluntaryApplied) * 100) / 100

  const totalDeductions = statutory + contractual + voluntaryApplied
  const netPay = Math.max(0, grossSalary - totalDeductions)

  // Employer costs
  const vetLevy = Math.round(grossSalary * VET_RATE * 100) / 100
  const totalEmployerCost = grossSalary + ssc.employer + vetLevy + wc.assessment
    + pensionEmployer + medicalAidEmployer

  // PaySpace-style income streams ("income perspectives"): every payslip resolves
  // earnings into several income bases, each identified by a tax code. PAYE is
  // levied on True Taxable Income (Taxable Income less Total Allowable deductions).
  const grossIncome = grossSalary + fringeBenefits
  const totalAllowable = pensionDeductible
  const trueTaxableIncome = Math.max(0, grossIncome - totalAllowable)
  const incomeStreams = {
    GROSS:    { code: 'GROSS',   label: 'Gross Income',                 value: round2(grossIncome) },
    SOCI:     { code: 'SOCI',    label: 'Social Security Income',       value: round2(grossSalary) },
    TAXAB:    { code: 'TAXAB',   label: 'Taxable Income',               value: round2(grossIncome) },
    ALLOW:    { code: 'ALLOW',   label: 'Total Allowable',              value: round2(totalAllowable) },
    TTAXAB:   { code: 'TTAXAB',  label: 'True Taxable Income',          value: round2(trueTaxableIncome) },
    WCFI:     { code: 'WCFI',    label: "Workmen's Compensation Income (capped)",   value: round2(Math.min(grossSalary, WC_EARNINGS_CEILING_MONTHLY)) },
    WCFIUNCAP:{ code: 'WCFIUNCAP', label: "Workmen's Compensation Income (uncapped)", value: round2(grossSalary) },
    VETI:     { code: 'VETI',    label: 'VET Levy Income',              value: round2(grossSalary) },
  }

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    basicSalary: Math.round(basicSalary * 100) / 100,
    allowances: Math.round(allowances * 100) / 100,
    housingAllowance: Math.round(housingAllowance * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    fringeBenefits: Math.round(fringeBenefits * 100) / 100,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    trueTaxableIncome: round2(trueTaxableIncome),
    totalAllowable: round2(totalAllowable),
    sscIncome: Math.round(Math.min(basicSalary, SSC_CEILING) * 100) / 100,
    pensionDeductible: Math.round(pensionDeductible * 100) / 100,
    // PaySpace income-stream breakdown
    incomeStreams,
    // Deductions
    paye: Math.round(paye * 100) / 100,
    sscEmployee: ssc.employee,
    sscEmployer: ssc.employer,
    pensionEmployee: Math.round(pensionEmployee * 100) / 100,
    medicalAid: Math.round(medicalAid * 100) / 100,
    otherDeductions: Math.round(voluntaryApplied * 100) / 100,
    voluntarySkipped,
    netPayProtected: voluntarySkipped > 0,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
    // Employer
    pensionEmployer: Math.round(pensionEmployer * 100) / 100,
    medicalAidEmployer: Math.round(medicalAidEmployer * 100) / 100,
    vetLevy: Math.round(vetLevy * 100) / 100,
    wcAssessment: wc.assessment,
    wcCovered: wc.covered,
    totalEmployerCost: Math.round(totalEmployerCost * 100) / 100,
    // Effective rate
    effectiveTaxRate: grossSalary > 0 ? Math.round((paye / grossSalary) * 10000) / 100 : 0,
  }
}

/**
 * Build a PaySpace-style Employee Tax Drilldown from an array of monthly
 * payslip results. Groups every value into Earning / Gross / Deduction /
 * Company Contribution / Information totals, each with a YTD figure and one
 * column per month. Rows carry the PaySpace tax code.
 *
 * @param {Array<{period: string, calc: object, inputs: object}>} months
 *        chronological list (earliest first) of monthly payroll results
 * @returns {{ periods: string[], groups: Array }}
 */
export function buildTaxDrilldown(months) {
  const periods = months.map(m => m.period)
  const sum = fn => months.reduce((s, m) => s + (fn(m) || 0), 0)
  const series = fn => months.map(fn)

  const group = (label, code, rows) => ({
    label,
    code,
    ytd: round2(rows.reduce((s, r) => s + r.ytd, 0)),
    monthly: periods.map((_, i) => round2(rows.reduce((s, r) => s + r.monthly[i], 0))),
    rows,
  })
  const row = (label, code, fn) => ({
    label, code,
    ytd: round2(sum(fn)),
    monthly: series(fn).map(round2),
  })

  const earningRows = [
    row('Salaries / Wages', 'SAL', m => m.inputs.basicSalary),
    row('Allowances', 'ALLOW', m => m.inputs.allowances + m.inputs.housingAllowance),
    row('Overtime', 'OTHEREARN', m => m.inputs.overtimePay || 0),
    row('Fringe Benefits', 'FB', m => m.inputs.fringeBenefits || 0),
  ].filter(r => r.ytd !== 0)

  const deductionRows = [
    row('Pay As You Earn (PAYE)', 'Tax', m => m.calc.paye),
    row('Social Security Employee', 'SOCEE', m => m.calc.sscEmployee),
    row('Pension Fund Employee', 'PENFUND', m => m.calc.pensionEmployee),
    row('Medical Aid Employee', 'MEDEE', m => m.calc.medicalAid),
    row('Other Deductions', '9999', m => m.calc.otherDeductions),
  ].filter(r => r.ytd !== 0)

  const contributionRows = [
    row('Pension Fund Employer', 'PENER', m => m.calc.pensionEmployer),
    row('Medical Aid Employer', 'MEDER', m => m.calc.medicalAidEmployer),
    row('Social Security Employer', 'SOCER', m => m.calc.sscEmployer),
    row("Workmen's Compensation", 'WCA', m => m.calc.wcAssessment),
    row('VET Levy', 'VETL', m => m.calc.vetLevy),
  ].filter(r => r.ytd !== 0)

  const informationRows = [
    row('Gross Income', 'GROSS', m => m.calc.incomeStreams.GROSS.value),
    row('Total Allowable', 'ALLOW', m => m.calc.totalAllowable),
    row('True Taxable Income', 'TTAXAB', m => m.calc.trueTaxableIncome),
    row('Social Security Income', 'SOCI', m => m.calc.incomeStreams.SOCI.value),
    row("Workmen's Comp Income (capped)", 'WCFI', m => m.calc.incomeStreams.WCFI.value),
    row('VET Levy Income', 'VETI', m => m.calc.incomeStreams.VETI.value),
  ].filter(r => r.ytd !== 0)

  return {
    periods,
    groups: [
      group('Earning Total', 'EARN', earningRows),
      group('Gross Total', 'GROSS', [row('Taxable Income', 'TAXAB', m => m.calc.incomeStreams.TAXAB.value)]),
      group('Deduction Total', 'DEDUCT', deductionRows),
      group('Company Contribution Total', 'CC', contributionRows),
      group('Information Total', 'INFO', informationRows),
    ],
  }
}

/**
 * Pre-payroll validation (per config: "No payroll run may proceed if
 * mandatory statutory fields are missing").
 * Returns an array of blocking errors; empty = employee may be paid.
 */
export function validateEmployeeForPayroll(emp) {
  const errors = []
  if (!emp.id) errors.push('Missing employee number')
  if (!emp.firstName || !emp.lastName) errors.push('Missing full legal name')
  if (!emp.idNumber) errors.push('Missing ID / passport number')
  if (!emp.sscNumber) errors.push('Missing SSC number')
  if (!emp.taxNumber) errors.push('Missing tax reference number')
  if (!emp.startDate) errors.push('Missing employment start date')
  if (!emp.employmentType) errors.push('Missing employment category')
  if (!emp.bankName || !emp.accountNumber) errors.push('Missing banking details')
  return errors
}

/**
 * Format currency in Namibian Dollars
 */
export function formatNAD(amount, decimals = 2) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'N$ 0.00'
  return `N$ ${Number(amount).toLocaleString('en-NA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

/**
 * Labour Act leave entitlements (Labour Act 11 of 2007)
 */
export const LEAVE_ENTITLEMENTS = {
  annual: {
    label: 'Annual Leave',
    daysPerYear: 24,
    basis: 'working days per year',
    reference: 'Section 23, Labour Act 11 of 2007',
  },
  sick: {
    label: 'Sick Leave',
    daysPerCycle: 26,
    cycleDays: 1095, // 3-year cycle
    basis: '26 working days per 3-year cycle',
    reference: 'Section 24, Labour Act 11 of 2007',
  },
  maternity: {
    label: 'Maternity Leave',
    weeksMin: 12,
    basis: 'minimum 12 weeks',
    reference: 'Section 26, Labour Act 11 of 2007',
  },
  familyResponsibility: {
    label: 'Family Responsibility Leave',
    daysPerYear: 5,
    basis: 'working days per year',
    reference: 'Section 25, Labour Act 11 of 2007',
  },
}

/**
 * Calculate leave accrual
 * @param {number} monthsEmployed
 * @returns {{ annual: number, sick: number }}
 */
export function calculateLeaveAccrual(monthsEmployed) {
  const annualAccrued = (LEAVE_ENTITLEMENTS.annual.daysPerYear / 12) * monthsEmployed
  const sickAccrued = (LEAVE_ENTITLEMENTS.sick.daysPerCycle / 36) * monthsEmployed
  return {
    annual: Math.round(annualAccrued * 100) / 100,
    sick: Math.round(sickAccrued * 100) / 100,
  }
}

/**
 * Notice period requirements (Labour Act, Section 34)
 */
export const NOTICE_PERIODS = [
  { maxMonths: 4,   weeks: 1,  label: 'Less than 4 weeks employed: 1 day' },
  { maxMonths: 12,  weeks: 1,  label: '4 weeks – 1 year: 1 week' },
  { maxMonths: 12,  weeks: 4,  label: 'Domestic worker 4 weeks – 1 year: 4 weeks' },
  { maxMonths: null, weeks: 4, label: 'Over 1 year: 4 weeks' },
]

/**
 * Overtime rates (Labour Act, Section 17)
 */
export const OVERTIME = {
  normal:        { rate: 1.5, label: '1.5× — Normal overtime (weekday)' },
  special:       { rate: 2.0, label: '2× — Special overtime (beyond 3 hours weekday)' },
  sunday:        { rate: 2.0, label: '2× — Sunday overtime' },
  publicHoliday: { rate: 2.0, label: '2× — Public holiday overtime' },
}

export function calculateOvertimePay(hourlyRate, hours, type = 'normal') {
  const rate = OVERTIME[type]?.rate ?? 1.5
  return Math.round(hourlyRate * hours * rate * 100) / 100
}
