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
export const VET_RATE = 0.01

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
 * Full payroll calculation for one employee per month
 * @param {Object} params
 * @param {number} params.basicSalary
 * @param {number} params.allowances        - Taxable allowances
 * @param {number} params.housingAllowance  - Non-taxable housing allowance (if structured correctly)
 * @param {number} params.pensionEmployee   - Employee pension contribution (deductible, max 27.5% of income or N$150k)
 * @param {number} params.medicalAid        - Medical aid contribution (not deductible for PAYE in Namibia)
 * @param {number} params.otherDeductions   - Other post-tax deductions (loans, etc.)
 */
export function calculatePayroll({
  basicSalary = 0,
  allowances = 0,
  housingAllowance = 0,
  pensionEmployee = 0,
  medicalAid = 0,
  otherDeductions = 0,
}) {
  const grossSalary = basicSalary + allowances + housingAllowance

  // Pension deduction is tax-deductible (up to 27.5% of gross or N$150,000/year)
  const maxPensionDeductible = Math.min(grossSalary * 12 * 0.275, 150000) / 12
  const pensionDeductible = Math.min(pensionEmployee, maxPensionDeductible)

  // Taxable income = gross - pension deduction (housing allowance kept in gross per NamRA rules)
  const taxableIncome = basicSalary + allowances - pensionDeductible

  const paye = calculateMonthlyPAYE(taxableIncome, 0)
  const ssc = calculateSSC(basicSalary)

  const totalDeductions = paye + ssc.employee + pensionEmployee + medicalAid + otherDeductions
  const netPay = Math.max(0, grossSalary - totalDeductions)

  // Employer costs
  const vetLevy = Math.round(grossSalary * VET_RATE * 100) / 100
  const totalEmployerCost = grossSalary + ssc.employer + vetLevy

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    basicSalary: Math.round(basicSalary * 100) / 100,
    allowances: Math.round(allowances * 100) / 100,
    housingAllowance: Math.round(housingAllowance * 100) / 100,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    pensionDeductible: Math.round(pensionDeductible * 100) / 100,
    // Deductions
    paye: Math.round(paye * 100) / 100,
    sscEmployee: ssc.employee,
    sscEmployer: ssc.employer,
    pensionEmployee: Math.round(pensionEmployee * 100) / 100,
    medicalAid: Math.round(medicalAid * 100) / 100,
    otherDeductions: Math.round(otherDeductions * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100,
    // Employer
    vetLevy: Math.round(vetLevy * 100) / 100,
    totalEmployerCost: Math.round(totalEmployerCost * 100) / 100,
    // Effective rate
    effectiveTaxRate: grossSalary > 0 ? Math.round((paye / grossSalary) * 10000) / 100 : 0,
  }
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
  weekday: { rate: 1.5, label: '1.5× — Weekday overtime (first 3 hours)' },
  extended: { rate: 2.0, label: '2× — Beyond 3 hours weekday / Sunday / Public Holiday' },
  sunday: { rate: 2.0, label: '2× — Sunday overtime' },
}

export function calculateOvertimePay(hourlyRate, hours, type = 'weekday') {
  const rate = OVERTIME[type]?.rate ?? 1.5
  return Math.round(hourlyRate * hours * rate * 100) / 100
}
