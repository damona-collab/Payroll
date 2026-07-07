import React, { useState, useMemo } from 'react'
import {
  Search, Download, ChevronRight, ChevronDown, Layers, Calendar,
} from 'lucide-react'
import { employees, generateMonthlyHistory, TAX_YEAR_PERIODS, COMPANY_INFO } from '../data/employees.js'
import { buildTaxDrilldown, formatNAD } from '../utils/namibianTax.js'

const GROUP_STYLE = {
  EARN:   'text-emerald-700',
  GROSS:  'text-navy-800',
  DEDUCT: 'text-red-600',
  CC:     'text-amber-700',
  INFO:   'text-navy-500',
}

function num(v) {
  return v === 0 ? '–' : formatNAD(v, 2).replace('N$ ', '')
}

function GroupBlock({ group, periods, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const tone = GROUP_STYLE[group.code] || 'text-navy-800'

  return (
    <>
      {/* Group total row */}
      <tr className="bg-cream-50 border-y border-cream-200">
        <td className="px-3 py-2 sticky left-0 bg-cream-50 z-10">
          <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 font-semibold text-navy-900">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {group.label}
          </button>
        </td>
        <td className={`px-3 py-2 text-right font-bold tabular-nums ${tone}`}>{num(group.ytd)}</td>
        {group.monthly.map((v, i) => (
          <td key={i} className={`px-3 py-2 text-right font-semibold tabular-nums ${tone}`}>{num(v)}</td>
        ))}
      </tr>
      {/* Detail rows */}
      {open && group.rows.map(r => (
        <tr key={r.label} className="hover:bg-cream-50/60">
          <td className="px-3 py-1.5 pl-9 sticky left-0 bg-white z-10">
            <span className="text-sm text-navy-700">{r.label}</span>
            <span className="ml-2 text-[10px] font-mono text-navy-400 bg-cream-100 px-1.5 py-0.5 rounded">{r.code}</span>
          </td>
          <td className="px-3 py-1.5 text-right tabular-nums text-sm font-medium text-navy-800">{num(r.ytd)}</td>
          {r.monthly.map((v, i) => (
            <td key={i} className="px-3 py-1.5 text-right tabular-nums text-sm text-navy-600">{num(v)}</td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function TaxDrilldown() {
  const [empId, setEmpId] = useState(employees[0].id)
  const [through, setThrough] = useState('February 2026')
  const [search, setSearch] = useState('')

  const employee = employees.find(e => e.id === empId)

  const { drilldown, months } = useMemo(() => {
    const months = generateMonthlyHistory(employee, through)
    return { drilldown: buildTaxDrilldown(months), months }
  }, [employee, through])

  const filteredEmployees = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.id}`.toLowerCase().includes(search.toLowerCase())
  )

  const periodsWorked = months.length
  const startDate = new Date(employee.startDate)
  const age = 2026 - (1900 + parseInt(employee.idNumber.slice(0, 2)) + (parseInt(employee.idNumber.slice(0, 2)) < 30 ? 100 : 0))

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card p-4 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex items-center gap-2 bg-cream-100 border border-cream-200 rounded-lg px-3 py-2 w-64">
            <Search size={14} className="text-navy-400 shrink-0" />
            <input
              className="bg-transparent text-sm text-navy-700 placeholder-navy-400 outline-none flex-1"
              placeholder="Search employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="select w-56" value={empId} onChange={e => setEmpId(e.target.value)}>
            {filteredEmployees.map(e => (
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.id}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 bg-cream-100 border border-cream-200 rounded-lg px-3 py-2">
            <Calendar size={13} className="text-navy-400" />
            <select className="bg-transparent text-sm text-navy-700 outline-none cursor-pointer"
              value={through} onChange={e => setThrough(e.target.value)}>
              {TAX_YEAR_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <button className="btn-secondary"><Download size={14} /> Download</button>
      </div>

      {/* Header band */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={18} className="text-navy-600" />
          <h2 className="text-base font-semibold text-navy-900">Employee Tax Drilldown</h2>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div><span className="text-navy-400">Employee: </span><span className="font-semibold text-navy-900">{employee.firstName} {employee.lastName} ({employee.id})</span></div>
          <div><span className="text-navy-400">Period from: </span><span className="font-medium text-navy-800">March 2025</span></div>
          <div><span className="text-navy-400">Period to: </span><span className="font-medium text-navy-800">{through}</span></div>
          <div><span className="text-navy-400">Periods: </span><span className="font-medium text-navy-800">{periodsWorked}.00</span></div>
          <div><span className="text-navy-400">Tax Year: </span><span className="font-medium text-navy-800">2025/2026</span></div>
        </div>
      </div>

      {/* Drilldown table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-navy-900 text-cream-100">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 bg-navy-900 z-20">
                  Component
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider bg-navy-800">
                  YTD Totals
                </th>
                {drilldown.periods.map(p => {
                  const [m, y] = p.split(' ')
                  return (
                    <th key={p} className="px-3 py-2.5 text-right text-xs font-semibold whitespace-nowrap">
                      {m.slice(0, 3)} {y.slice(2)}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {drilldown.groups.map((g, i) => (
                <GroupBlock key={g.code} group={g} periods={drilldown.periods} defaultOpen={i < 1} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-cream-50 border-t border-cream-200 text-xs text-navy-500">
          Every value is grouped into Earning, Gross, Deduction, Company Contribution, and Information totals,
          with a year-to-date figure and one column per period. Each line carries its tax code. PAYE is levied on
          <strong> True Taxable Income</strong> (Taxable Income less Total Allowable deductions). Click a group to expand its components.
        </div>
      </div>
    </div>
  )
}
