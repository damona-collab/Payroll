/**
 * Report data generators — turn live employee data into real report tables
 * ({ columns, rows }) for viewing, CSV and PDF export.
 */
import { formatNAD } from './namibianTax.js'

const money = v => formatNAD(v)

function payrollRegister(emps) {
  return {
    columns: ['Employee No', 'Name', 'Department', 'Basic', 'Allowances', 'Gross', 'PAYE', 'SSC', 'Pension', 'Net Pay'],
    rows: emps.map(e => [
      e.id, `${e.firstName} ${e.lastName}`, e.department,
      money(e.payroll.basicSalary), money(e.payroll.allowances + e.payroll.housingAllowance),
      money(e.payroll.grossSalary), money(e.payroll.paye), money(e.payroll.sscEmployee),
      money(e.payroll.pensionEmployee), money(e.payroll.netPay),
    ]),
    totals: ['', 'TOTAL', '', '', '',
      money(sum(emps, e => e.payroll.grossSalary)), money(sum(emps, e => e.payroll.paye)),
      money(sum(emps, e => e.payroll.sscEmployee)), money(sum(emps, e => e.payroll.pensionEmployee)),
      money(sum(emps, e => e.payroll.netPay))],
  }
}

function bankListing(emps) {
  return {
    columns: ['Employee No', 'Name', 'Bank', 'Account Number', 'Branch Code', 'Net Pay'],
    rows: emps.map(e => [e.id, `${e.firstName} ${e.lastName}`, e.bankName, e.accountNumber, e.branchCode, money(e.payroll.netPay)]),
    totals: ['', 'TOTAL', '', '', '', money(sum(emps, e => e.payroll.netPay))],
  }
}

function payeReturn(emps) {
  return {
    columns: ['Employee No', 'Name', 'Tax Number', 'Taxable Income', 'PAYE'],
    rows: emps.map(e => [e.id, `${e.firstName} ${e.lastName}`, e.taxNumber, money(e.payroll.taxableIncome), money(e.payroll.paye)]),
    totals: ['', 'TOTAL', '', '', money(sum(emps, e => e.payroll.paye))],
  }
}

function sscReport(emps) {
  return {
    columns: ['Employee No', 'Name', 'SSC Number', 'Employee (0.9%)', 'Employer (0.9%)', 'Total'],
    rows: emps.map(e => [e.id, `${e.firstName} ${e.lastName}`, e.sscNumber || '—',
      money(e.payroll.sscEmployee), money(e.payroll.sscEmployer), money(e.payroll.sscEmployee + e.payroll.sscEmployer)]),
    totals: ['', 'TOTAL', '', money(sum(emps, e => e.payroll.sscEmployee)),
      money(sum(emps, e => e.payroll.sscEmployer)), money(sum(emps, e => e.payroll.sscEmployee + e.payroll.sscEmployer))],
  }
}

function employeeListing(emps) {
  return {
    columns: ['Employee No', 'First Name', 'Last Name', 'ID Number', 'Department', 'Grade', 'Type', 'Start Date', 'Status'],
    rows: emps.map(e => [e.id, e.firstName, e.lastName, e.idNumber, e.department, e.grade, e.employmentType, e.startDate, e.status]),
  }
}

function leaveBalances(emps) {
  return {
    columns: ['Employee No', 'Name', 'Annual', 'Sick', 'Family Resp.'],
    rows: emps.map(e => [e.id, `${e.firstName} ${e.lastName}`,
      e.leaveBalance.annual.toFixed(1), e.leaveBalance.sick.toFixed(1), e.leaveBalance.familyResponsibility.toFixed(1)]),
  }
}

function costToCompany(emps) {
  return {
    columns: ['Employee No', 'Name', 'Gross', 'SSC ER', 'Pension ER', 'Medical ER', 'WC', 'VET', 'Total CTC'],
    rows: emps.map(e => {
      const p = e.payroll
      return [e.id, `${e.firstName} ${e.lastName}`, money(p.grossSalary), money(p.sscEmployer),
        money(p.pensionEmployer), money(p.medicalAidEmployer), money(p.wcAssessment), money(p.vetLevy), money(p.totalEmployerCost)]
    }),
    totals: ['', 'TOTAL', money(sum(emps, e => e.payroll.grossSalary)), money(sum(emps, e => e.payroll.sscEmployer)),
      money(sum(emps, e => e.payroll.pensionEmployer)), money(sum(emps, e => e.payroll.medicalAidEmployer)),
      money(sum(emps, e => e.payroll.wcAssessment)), money(sum(emps, e => e.payroll.vetLevy)),
      money(sum(emps, e => e.payroll.totalEmployerCost))],
  }
}

function costingByCostCentre(emps) {
  const map = {}
  emps.forEach(e => {
    const cc = e.costCentre || 'Unassigned'
    if (!map[cc]) map[cc] = { headcount: 0, gross: 0, net: 0, ctc: 0 }
    map[cc].headcount += 1
    map[cc].gross += e.payroll.grossSalary
    map[cc].net += e.payroll.netPay
    map[cc].ctc += e.payroll.totalEmployerCost
  })
  return {
    columns: ['Cost Centre', 'Headcount', 'Gross', 'Net Pay', 'Total CTC'],
    rows: Object.entries(map).map(([cc, d]) => [cc, d.headcount, money(d.gross), money(d.net), money(d.ctc)]),
  }
}

function vetLevy(emps) {
  return {
    columns: ['Employee No', 'Name', 'Gross (VET base)', 'VET Levy (1%)'],
    rows: emps.map(e => [e.id, `${e.firstName} ${e.lastName}`, money(e.payroll.grossSalary), money(e.payroll.vetLevy)]),
    totals: ['', 'TOTAL', money(sum(emps, e => e.payroll.grossSalary)), money(sum(emps, e => e.payroll.vetLevy))],
  }
}

function wcDeclaration(emps) {
  return {
    columns: ['Employee No', 'Name', 'Annual Earnings', 'WC Covered', 'Monthly Assessment'],
    rows: emps.map(e => [e.id, `${e.firstName} ${e.lastName}`, money(e.payroll.grossSalary * 12),
      e.payroll.wcCovered ? 'Yes' : 'Above ceiling', money(e.payroll.wcAssessment)]),
  }
}

function leaveLiability(emps) {
  return {
    columns: ['Employee No', 'Name', 'Annual Days', 'Daily Rate', 'Leave Liability'],
    rows: emps.map(e => {
      const daily = e.payroll.basicSalary / 21.67
      return [e.id, `${e.firstName} ${e.lastName}`, e.leaveBalance.annual.toFixed(1), money(daily), money(daily * e.leaveBalance.annual)]
    }),
    totals: ['', 'TOTAL', '', '', money(sum(emps, e => (e.payroll.basicSalary / 21.67) * e.leaveBalance.annual))],
  }
}

const GENERATORS = {
  'Payroll Register': payrollRegister,
  'Bank Net Pay Listing': bankListing,
  'NamRA PAYE Return': payeReturn,
  'SSC Contribution Report': sscReport,
  'Employee Listing': employeeListing,
  'Leave Balances': leaveBalances,
  'Cost To Company Report': costToCompany,
  'Costing by Cost Centre': costingByCostCentre,
  'VET Levy Report': vetLevy,
  'Workmen’s Compensation Declaration': wcDeclaration,
  'Leave Liability Report': leaveLiability,
}

function sum(arr, fn) { return arr.reduce((s, x) => s + fn(x), 0) }

/**
 * Build report data for a named report. Falls back to the payroll register
 * for reports without a dedicated generator (still real data).
 */
export function buildReport(name, emps) {
  const gen = GENERATORS[name] || payrollRegister
  return gen(emps)
}

export function reportHasData(name) {
  return true // every report renders from live data (register fallback)
}
