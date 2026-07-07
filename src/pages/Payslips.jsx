import React, { useState, useRef } from 'react'
import { Search, Printer, Download, Eye, FileText, Building2 } from 'lucide-react'
import { employees, COMPANY_INFO } from '../data/employees.js'
import { formatNAD } from '../utils/namibianTax.js'

const PERIODS = ['April 2025', 'March 2025', 'February 2025', 'January 2025', 'December 2024']

function PayslipDocument({ employee, period }) {
  if (!employee) return null
  const p = employee.payroll
  const payDate = `25 ${period}`
  const [month, year] = period.split(' ')

  return (
    <div className="bg-white w-full max-w-2xl mx-auto" id="payslip-print">
      {/* Header */}
      <div className="bg-navy-900 px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gold-400 rounded-lg flex items-center justify-center">
                <span className="text-navy-900 font-black text-lg">N</span>
              </div>
              <div>
                <div className="text-cream-100 font-bold text-lg leading-tight">NamPay</div>
                <div className="text-navy-400 text-xs">Payroll System</div>
              </div>
            </div>
            <div className="text-navy-300 text-sm mt-2">{COMPANY_INFO.name}</div>
            <div className="text-navy-400 text-xs">{COMPANY_INFO.address}</div>
            <div className="text-navy-400 text-xs">Tax No: {COMPANY_INFO.taxNumber} &bull; VAT: {COMPANY_INFO.vatNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-gold-400 font-bold text-xl uppercase tracking-wide">Payslip</div>
            <div className="text-cream-100 text-sm mt-1">{month} {year}</div>
            <div className="text-navy-300 text-xs mt-0.5">Pay Date: {payDate}</div>
          </div>
        </div>
      </div>

      {/* Employee info */}
      <div className="bg-cream-100 px-8 py-4 border-b border-cream-200">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-navy-400 uppercase tracking-wide mb-0.5">Employee</div>
            <div className="font-bold text-navy-900">{employee.firstName} {employee.lastName}</div>
            <div className="text-xs text-navy-500">{employee.jobTitle}</div>
          </div>
          <div>
            <div className="text-xs text-navy-400 uppercase tracking-wide mb-0.5">Employee No.</div>
            <div className="font-medium text-navy-900">{employee.id}</div>
            <div className="text-xs text-navy-500">Tax No: {employee.taxNumber}</div>
            <div className="text-xs text-navy-500">SSC No: {employee.sscNumber || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-navy-400 uppercase tracking-wide mb-0.5">Department</div>
            <div className="font-medium text-navy-900">{employee.department}</div>
            <div className="text-xs text-navy-500">{employee.employmentType} &bull; {employee.costCentre}</div>
          </div>
        </div>
      </div>

      {/* Earnings & Deductions */}
      <div className="px-8 py-5">
        <div className="grid grid-cols-2 gap-6">
          {/* Earnings */}
          <div>
            <div className="text-xs font-bold text-navy-600 uppercase tracking-wider mb-3 pb-2 border-b border-cream-200">
              Earnings
            </div>
            <table className="w-full">
              <tbody className="divide-y divide-cream-100">
                {[
                  { label: 'Basic Salary', value: employee.basicSalary },
                  employee.allowances > 0 && { label: 'Taxable Allowances', value: employee.allowances },
                  employee.housingAllowance > 0 && { label: 'Housing Allowance', value: employee.housingAllowance },
                ].filter(Boolean).map(r => (
                  <tr key={r.label}>
                    <td className="py-1.5 text-sm text-navy-700">{r.label}</td>
                    <td className="py-1.5 text-sm text-navy-900 font-medium text-right tabular-nums">{formatNAD(r.value)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-navy-900">
                  <td className="pt-2 text-sm font-bold text-navy-900">Gross Salary</td>
                  <td className="pt-2 text-sm font-bold text-navy-900 text-right tabular-nums">{formatNAD(p.grossSalary)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Deductions */}
          <div>
            <div className="text-xs font-bold text-navy-600 uppercase tracking-wider mb-3 pb-2 border-b border-cream-200">
              Deductions
            </div>
            <table className="w-full">
              <tbody className="divide-y divide-cream-100">
                {[
                  { label: 'PAYE (Employee Tax)', value: p.paye },
                  { label: 'SSC Contribution', value: p.sscEmployee },
                  employee.pensionEmployee > 0 && { label: 'Pension Fund', value: employee.pensionEmployee },
                  employee.medicalAid > 0 && { label: 'Medical Aid', value: employee.medicalAid },
                  employee.otherDeductions > 0 && { label: 'Other Deductions', value: employee.otherDeductions },
                ].filter(Boolean).map(r => (
                  <tr key={r.label}>
                    <td className="py-1.5 text-sm text-navy-700">{r.label}</td>
                    <td className="py-1.5 text-sm text-red-600 font-medium text-right tabular-nums">{formatNAD(r.value)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-navy-900">
                  <td className="pt-2 text-sm font-bold text-navy-900">Total Deductions</td>
                  <td className="pt-2 text-sm font-bold text-red-600 text-right tabular-nums">{formatNAD(p.totalDeductions)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Net Pay */}
        <div className="mt-5 bg-navy-900 rounded-xl px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-navy-300 text-xs uppercase tracking-wide">Net Pay</div>
            <div className="text-navy-400 text-xs">Credited to account ending ···{employee.accountNumber.slice(-4)}</div>
          </div>
          <div className="text-gold-400 font-black text-3xl tabular-nums">{formatNAD(p.netPay)}</div>
        </div>

        {/* Tax info */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Taxable Income', value: formatNAD(p.taxableIncome) },
            { label: 'Effective Tax Rate', value: `${p.effectiveTaxRate}%` },
            { label: 'Annual PAYE', value: formatNAD(p.paye * 12) },
          ].map(f => (
            <div key={f.label} className="bg-cream-100 rounded-lg p-3 text-center">
              <div className="text-xs text-navy-400 mb-0.5">{f.label}</div>
              <div className="text-sm font-bold text-navy-900">{f.value}</div>
            </div>
          ))}
        </div>

        {/* Fringe benefits (notional — taxed, not paid in cash) */}
        {p.fringeBenefits > 0 && (
          <div className="mt-4">
            <div className="text-xs font-bold text-navy-600 uppercase tracking-wider mb-2">
              Fringe Benefits (Notional Values)
            </div>
            <div className="bg-cream-100 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-navy-700">
                Taxable fringe benefit value — included in taxable income, not paid in cash
              </span>
              <span className="text-sm font-bold text-navy-900 tabular-nums">{formatNAD(p.fringeBenefits)}</span>
            </div>
          </div>
        )}

        {/* Employer contributions (for transparency — not deducted from pay) */}
        <div className="mt-4">
          <div className="text-xs font-bold text-navy-600 uppercase tracking-wider mb-2">
            Employer Contributions (Company Cost)
          </div>
          <div className="bg-cream-100 rounded-lg px-4 py-2 divide-y divide-cream-200">
            {[
              { label: 'SSC — Employer', value: p.sscEmployer },
              p.pensionEmployer > 0 && { label: 'Pension Fund — Employer', value: p.pensionEmployer },
              p.medicalAidEmployer > 0 && { label: 'Medical Aid — Employer', value: p.medicalAidEmployer },
              p.wcAssessment > 0 && { label: "Workmen's Compensation", value: p.wcAssessment },
              { label: 'VET Levy', value: p.vetLevy },
            ].filter(Boolean).map(r => (
              <div key={r.label} className="flex justify-between py-1.5 text-sm">
                <span className="text-navy-600">{r.label}</span>
                <span className="text-navy-900 font-medium tabular-nums">{formatNAD(r.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leave summary */}
        <div className="mt-4">
          <div className="text-xs font-bold text-navy-600 uppercase tracking-wider mb-2">Leave Balances</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Annual Leave', balance: employee.leaveBalance.annual, max: 24 },
              { label: 'Sick Leave', balance: employee.leaveBalance.sick, max: 26 },
              { label: 'Family Resp.', balance: employee.leaveBalance.familyResponsibility, max: 5 },
            ].map(l => (
              <div key={l.label} className="bg-cream-100 rounded-lg p-2 text-center">
                <div className="text-xs text-navy-400">{l.label}</div>
                <div className="text-base font-bold text-navy-900">{l.balance.toFixed(1)} <span className="text-xs font-normal text-navy-400">/ {l.max} days</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-cream-100 border-t border-cream-200 px-8 py-3 flex items-center justify-between">
        <div className="text-xs text-navy-400">
          Generated by NamPay &bull; Namibian Labour Act 11 of 2007 compliant &bull; PAYE per Income Tax Act (Act 24 of 1981)
        </div>
        <div className="text-xs text-navy-400">Confidential</div>
      </div>
    </div>
  )
}

export default function Payslips() {
  const [period, setPeriod] = useState(PERIODS[0])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.id} ${e.department}`.toLowerCase().includes(search.toLowerCase())
  )

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between no-print">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-1 bg-cream-100 border border-cream-200 rounded-lg px-3 py-2">
            <select
              className="bg-transparent text-sm text-navy-700 outline-none cursor-pointer"
              value={period}
              onChange={e => setPeriod(e.target.value)}
            >
              {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-cream-100 border border-cream-200 rounded-lg px-3 py-2 w-56">
            <Search size={13} className="text-navy-400 shrink-0" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-sm text-navy-700 placeholder-navy-400 outline-none flex-1"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {selected && (
            <>
              <button className="btn-secondary" onClick={handlePrint}><Printer size={14} /> Print</button>
              <button className="btn-primary"><Download size={14} /> Download PDF</button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Employee list */}
        <div className="card overflow-hidden no-print">
          <div className="px-4 py-3 border-b border-cream-200 bg-cream-50">
            <div className="text-sm font-semibold text-navy-900">Employees — {period}</div>
            <div className="text-xs text-navy-400">{filtered.length} records</div>
          </div>
          <div className="divide-y divide-cream-100 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filtered.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelected(emp)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cream-50 transition-colors ${
                  selected?.id === emp.id ? 'bg-navy-50 border-r-2 border-navy-900' : ''
                }`}
              >
                <div className="w-9 h-9 bg-navy-900 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-cream-100 text-xs font-bold">{emp.firstName[0]}{emp.lastName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-navy-900 truncate">{emp.firstName} {emp.lastName}</div>
                  <div className="text-xs text-navy-400 truncate">{emp.department} &bull; {emp.id}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-emerald-700 tabular-nums">{formatNAD(emp.payroll.netPay)}</div>
                  <div className="text-xs text-navy-400">net pay</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payslip view */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card overflow-hidden shadow-lg">
              <PayslipDocument employee={selected} period={period} />
            </div>
          ) : (
            <div className="card p-16 text-center">
              <FileText size={48} className="mx-auto text-navy-200 mb-4" />
              <div className="text-navy-500 font-medium">Select an employee to view their payslip</div>
              <div className="text-navy-400 text-sm mt-1">Choose from the list on the left</div>
            </div>
          )}
        </div>
      </div>

      {/* Print styles — show only payslip */}
      <style>{`
        @media print {
          body > * { display: none; }
          #payslip-print { display: block !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
