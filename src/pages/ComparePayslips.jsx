import React, { useState, useMemo } from 'react'
import { GitCompare, Search, Download, Printer } from 'lucide-react'
import { employees, generateMonthlyHistory, TAX_YEAR_PERIODS, COMPANY_INFO } from '../data/employees.js'
import { formatNAD } from '../utils/namibianTax.js'

// Rows of the comparison, mirroring PaySpace's Compare Payslips report layout
const LINES = [
  { key: 'basicSalary',   label: 'Basic Salary',            pick: c => c.basicSalary,   group: 'earn' },
  { key: 'allowances',    label: 'Total Allowances',        pick: c => c.allowances + c.housingAllowance, group: 'earn' },
  { key: 'overtimePay',   label: 'Overtime',                pick: c => c.overtimePay,   group: 'earn' },
  { key: 'gross',         label: 'Gross Salary',            pick: c => c.grossSalary,   group: 'total' },
  { key: 'paye',          label: 'Pay As You Earn (PAYE)',  pick: c => c.paye,          group: 'ded' },
  { key: 'pensionEmployee', label: 'Pension Fund EE',       pick: c => c.pensionEmployee, group: 'ded' },
  { key: 'medicalAid',    label: 'Medical Aid',             pick: c => c.medicalAid,    group: 'ded' },
  { key: 'sscEmployee',   label: 'Social Security Employee', pick: c => c.sscEmployee,  group: 'ded' },
  { key: 'otherDeductions', label: 'Other Deductions',      pick: c => c.otherDeductions, group: 'ded' },
  { key: 'totalDeductions', label: 'Total Deductions',      pick: c => c.totalDeductions, group: 'total' },
  { key: 'netPay',        label: 'Net Pay',                 pick: c => c.netPay,        group: 'net' },
  { key: 'pensionEmployer', label: 'Pension Fund ER',       pick: c => c.pensionEmployer, group: 'cc' },
  { key: 'medicalAidEmployer', label: 'Medical Aid ER',     pick: c => c.medicalAidEmployer, group: 'cc' },
  { key: 'sscEmployer',   label: 'Social Security Employer', pick: c => c.sscEmployer,  group: 'cc' },
  { key: 'wcAssessment',  label: "Workmen's Compensation",  pick: c => c.wcAssessment,  group: 'cc' },
  { key: 'vetLevy',       label: 'VET Levy',                pick: c => c.vetLevy,       group: 'cc' },
  { key: 'totalEmployerCost', label: 'Total Employer Cost', pick: c => c.totalEmployerCost, group: 'total' },
]

export default function ComparePayslips() {
  const [empId, setEmpId] = useState(employees[0].id)
  const [periodA, setPeriodA] = useState('June 2025')
  const [periodB, setPeriodB] = useState('February 2026')
  const [search, setSearch] = useState('')

  const employee = employees.find(e => e.id === empId)
  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.id}`.toLowerCase().includes(search.toLowerCase())
  )

  const { calcA, calcB } = useMemo(() => {
    const history = generateMonthlyHistory(employee, 'February 2026')
    const find = p => history.find(h => h.period === p)?.calc
    return { calcA: find(periodA), calcB: find(periodB) }
  }, [employee, periodA, periodB])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-4 flex flex-col lg:flex-row gap-3 lg:items-center justify-between no-print">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-2 bg-cream-100 border border-cream-200 rounded-lg px-3 py-2 w-56">
            <Search size={14} className="text-navy-400 shrink-0" />
            <input className="bg-transparent text-sm text-navy-700 placeholder-navy-400 outline-none flex-1"
              placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select w-52" value={empId} onChange={e => setEmpId(e.target.value)}>
            {filtered.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.id}</option>)}
          </select>
          <select className="select w-40" value={periodA} onChange={e => setPeriodA(e.target.value)}>
            {TAX_YEAR_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <span className="text-navy-400 text-sm">vs</span>
          <select className="select w-40" value={periodB} onChange={e => setPeriodB(e.target.value)}>
            {TAX_YEAR_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => window.print()}><Printer size={14} /> Print</button>
          <button className="btn-primary"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* Comparison sheet */}
      <div className="card overflow-hidden" id="compare-print">
        <div className="bg-navy-900 px-5 py-4 flex items-center gap-2">
          <GitCompare size={18} className="text-gold-400" />
          <div>
            <div className="text-cream-100 font-semibold">Compare Payslips</div>
            <div className="text-navy-300 text-xs">
              {employee.firstName} {employee.lastName} &bull; {employee.id} &bull; {COMPANY_INFO.name}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream-100 border-b border-cream-200">
                <th className="table-header">Description</th>
                <th className="table-header text-right">{periodA}</th>
                <th className="table-header text-right">{periodB}</th>
                <th className="table-header text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {LINES.map(line => {
                const a = calcA ? line.pick(calcA) : 0
                const b = calcB ? line.pick(calcB) : 0
                if (!a && !b) return null
                const diff = Math.round((b - a) * 100) / 100
                const isTotal = line.group === 'total' || line.group === 'net'
                return (
                  <tr key={line.key} className={isTotal ? 'bg-cream-50 font-semibold' : 'hover:bg-cream-50/60'}>
                    <td className={`table-cell ${isTotal ? 'text-navy-900 font-semibold' : line.group === 'ded' || line.group === 'cc' ? 'pl-6 text-navy-600' : 'text-navy-700'}`}>
                      {line.label}
                    </td>
                    <td className="table-cell text-right tabular-nums">{formatNAD(a)}</td>
                    <td className="table-cell text-right tabular-nums">{formatNAD(b)}</td>
                    <td className={`table-cell text-right tabular-nums font-medium ${
                      diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-red-600' : 'text-navy-300'
                    }`}>
                      {diff === 0 ? '–' : (diff > 0 ? '+' : '') + formatNAD(diff).replace('N$ ', '')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-cream-50 border-t border-cream-200 text-xs text-navy-500">
          The Difference column shows the change from {periodA} to {periodB}. Green = increase, red = decrease.
        </div>
      </div>

      <style>{`
        @media print {
          body > * { display: none; }
          #compare-print { display: block !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
