/**
 * Namibian PAYE Tax Calculation Engine
 * Based on Namibia Revenue Agency (NamRA) tax tables and
 * the Income Tax Act (Act 24 of 1981, as amended)
 * Tax Year: 2024/2025
 */

// Annual tax brackets (N$)
export const TAX_BRACKETS = [
  { min: 0,         max: 50000,    base: 0,       rate: 0.00, label: 'N$0 – N$50,000' },
  { min: 50001,     max: 100000,   base: 0,       rate: 0.18, label: 'N$50,001 – N$100,000' },
  { min: 100001,    max: 300000,   base: 9000,    rate: 0.25, label: 'N$100,001 – N$300,000' },
  { min: 300001,    max: 500000,   base: 59000,   rate: 0.28, label: 'N$300,001 – N$500,000' },
  { min: 500001,    max: 800000,   base: 115000,  rate: 0.30, label: 'N$500,001 – N$800,000' },
  { min: 800001,    max: 1500000,  base: 205000,  rate: 0.32, label: 'N$800,001 – N$1,500,000' },
  { min: 1500001,   max: Infinity, base: 429000,  rate: 0.37, label: 'N$1,500,001+' },
]

// Annual tax rebate
export const ANNUAL_REBATE = 17640
export const MONTHLY_REBATE = ANNUAL_REBATE / 12

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
 * Calculate annual PAYE tax on annual income (before rebate)
 */
export function calculateAnnualTax(annualIncome) {
  if (annualIncome <= 0) return 0
  const taxable = Math.max(0, annualIncome)
  for (const bracket of TAX_BRACKETS) {
    if (taxable <= bracket.max) {
      const excess = Math.max(0, taxable - bracket.min)
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

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    basicSalary: Math.round(basicSalary * 100) / 100,
    allowances: Math.round(allowances * 100) / 100,
    housingAllowance: Math.round(housingAllowance * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    fringeBenefits: Math.round(fringeBenefits * 100) / 100,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    sscIncome: Math.round(Math.min(basicSalary, SSC_CEILING) * 100) / 100,
    pensionDeductible: Math.round(pensionDeductible * 100) / 100,
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
