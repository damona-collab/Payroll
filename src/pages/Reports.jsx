import React, { useState } from 'react'
import {
  BarChart3, Download, FileText, TrendingUp, Users,
  CreditCard, Building2, Calendar, Search, Eye, Folder, X, FileSpreadsheet,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { employees, COMPANY_INFO } from '../data/employees.js'
import { usePayroll } from '../store/PayrollProvider.jsx'
import { REPORT_CATALOG, REPORT_CATEGORIES } from '../data/payComponents.js'
import { formatNAD } from '../utils/namibianTax.js'
import { buildReport } from '../utils/reports.js'
import { downloadCSV, downloadReportPDF } from '../utils/download.js'

const CATEGORY_ICON = {
  Payroll: CreditCard, Statutory: FileText, 'Human Resources': Users,
  Leave: Calendar, Costing: BarChart3, Audit: Folder,
}

const MONTHS = ['Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25']

const totalGross = employees.reduce((s, e) => s + e.payroll.grossSalary, 0)
const totalPAYE  = employees.reduce((s, e) => s + e.payroll.paye, 0)
const totalSSC   = employees.reduce((s, e) => s + e.payroll.sscEmployee + e.payroll.sscEmployer, 0)
const totalVET   = employees.reduce((s, e) => s + e.payroll.vetLevy, 0)

// Trend data
const trendData = MONTHS.map((month, i) => ({
  month,
  gross:   Math.round(totalGross * (0.90 + Math.sin(i * 0.6) * 0.05 + i * 0.003)),
  paye:    Math.round(totalPAYE  * (0.90 + Math.sin(i * 0.6) * 0.05 + i * 0.003)),
  net:     Math.round((totalGross - totalPAYE) * (0.90 + Math.sin(i * 0.6) * 0.04 + i * 0.003)),
}))

// Department totals
const deptData = Object.entries(
  employees.reduce((acc, e) => {
    if (!acc[e.department]) acc[e.department] = { headcount: 0, gross: 0, paye: 0, net: 0 }
    acc[e.department].headcount += 1
    acc[e.department].gross += e.payroll.grossSalary
    acc[e.department].paye  += e.payroll.paye
    acc[e.department].net   += e.payroll.netPay
    return acc
  }, {})
).map(([dept, d]) => ({ dept, ...d }))

// Modal that previews a real report table and offers CSV / PDF download
function ReportViewer({ report, employees, onClose }) {
  const data = buildReport(report.name, employees)
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-navy-900 rounded-t-2xl px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="text-cream-100 font-semibold">{report.name}</div>
            <div className="text-navy-300 text-xs">{report.desc}</div>
          </div>
          <button onClick={onClose} className="text-navy-400 hover:text-cream-100"><X size={20} /></button>
        </div>
        <div className="p-4 overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-100 border-b border-cream-200">
                {data.columns.map(c => <th key={c} className="text-left px-3 py-2 text-xs font-semibold text-navy-600 uppercase tracking-wide whitespace-nowrap">{c}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {data.rows.map((row, i) => (
                <tr key={i} className="hover:bg-cream-50">
                  {row.map((cell, j) => <td key={j} className="px-3 py-2 text-navy-800 whitespace-nowrap tabular-nums">{cell}</td>)}
                </tr>
              ))}
            </tbody>
            {data.totals && (
              <tfoot>
                <tr className="border-t-2 border-navy-900 bg-cream-50 font-bold">
                  {data.totals.map((cell, j) => <td key={j} className="px-3 py-2 text-navy-900 whitespace-nowrap tabular-nums">{cell}</td>)}
                </tr>
              </tfoot>
            )}
          </table>
          {data.rows.length === 0 && <div className="text-center py-10 text-navy-400">No data for this period.</div>}
        </div>
        <div className="px-6 py-3 border-t border-cream-200 flex justify-between items-center shrink-0">
          <div className="text-xs text-navy-400">{data.rows.length} rows &bull; {COMPANY_INFO.name}</div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => {
              const objRows = data.rows.map(r => Object.fromEntries(data.columns.map((c, i) => [c, r[i]])))
              downloadCSV(objRows, `${report.name.replace(/[^a-z0-9]+/gi, '_')}.csv`)
            }}><FileSpreadsheet size={14} /> Download CSV</button>
            <button className="btn-primary" onClick={() => {
              const rows = [...data.rows]; if (data.totals) rows.push(data.totals)
              downloadReportPDF(report.name, data.columns, rows, { subtitle: report.desc, company: COMPANY_INFO.name })
            }}><Download size={14} /> Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportLibrary() {
  const { employees } = usePayroll()
  const [engine, setEngine] = useState('NextGen')
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [viewing, setViewing] = useState(null)

  function quickCSV(report) {
    const data = buildReport(report.name, employees)
    const objRows = data.rows.map(r => Object.fromEntries(data.columns.map((c, i) => [c, r[i]])))
    downloadCSV(objRows, `${report.name.replace(/[^a-z0-9]+/gi, '_')}.csv`)
  }

  const filtered = REPORT_CATALOG.filter(r => {
    if (engine === 'NextGen' && !r.nextgen) return false
    if (category !== 'All' && r.category !== category) return false
    if (query && !`${r.name} ${r.desc}`.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })
  const grouped = REPORT_CATEGORIES
    .map(cat => ({ cat, items: filtered.filter(r => r.category === cat) }))
    .filter(g => g.items.length)

  return (
    <div className="card p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div className="text-sm font-semibold text-navy-900 flex items-center gap-2">
          <Download size={15} className="text-navy-600" /> Report Library
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Engine tabs */}
          <div className="flex bg-cream-100 rounded-lg p-0.5 border border-cream-200">
            {['NextGen', 'Classic'].map(e => (
              <button key={e} onClick={() => setEngine(e)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  engine === e ? 'bg-navy-900 text-cream-100' : 'text-navy-600'}`}>
                {e}
              </button>
            ))}
          </div>
          {/* Category */}
          <select className="select w-auto text-sm" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="All">All Categories</option>
            {REPORT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Search */}
          <div className="flex items-center gap-2 bg-cream-100 border border-cream-200 rounded-lg px-3 py-2 w-52">
            <Search size={13} className="text-navy-400 shrink-0" />
            <input className="bg-transparent text-sm text-navy-700 placeholder-navy-400 outline-none flex-1"
              placeholder="Search reports..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {grouped.map(({ cat, items }) => {
          const Icon = CATEGORY_ICON[cat] || FileText
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-navy-500" />
                <span className="text-xs font-bold text-navy-500 uppercase tracking-wider">{cat}</span>
                <span className="text-xs text-navy-300">({items.length})</span>
              </div>
              <div className="divide-y divide-cream-100 border border-cream-200 rounded-xl overflow-hidden">
                {items.map(r => (
                  <div key={r.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy-900">{r.name}</div>
                      <div className="text-xs text-navy-400 truncate">{r.desc}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {r.format.map(f => (
                        <span key={f} className="text-[10px] font-mono text-navy-400 bg-cream-100 px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setViewing(r)} className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-cream-100 rounded-lg transition-colors" title="View">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => quickCSV(r)} className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-cream-100 rounded-lg transition-colors" title="Download CSV">
                        <Download size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {grouped.length === 0 && (
          <div className="text-center py-10 text-navy-400 text-sm">No reports match your filters.</div>
        )}
      </div>

      {viewing && <ReportViewer report={viewing} employees={employees} onClose={() => setViewing(null)} />}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-900 text-cream-100 rounded-xl shadow-xl px-4 py-3 text-xs border border-navy-800">
      <div className="font-semibold mb-2">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span className="text-navy-300">{p.name}</span>
          <span className="font-semibold">{formatNAD(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [period, setPeriod] = useState('April 2025')

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="card p-4 flex items-center justify-between">
        <div>
          <div className="text-base font-semibold text-navy-900">Payroll Reports</div>
          <div className="text-xs text-navy-400">Tax Year 2026/2027 &bull; {COMPANY_INFO.name}</div>
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="select w-40"
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            {['April 2025', 'March 2025', 'February 2025', 'January 2025', 'Q3 2024/25', 'Full Year 2024/25']
              .map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Gross Payroll', value: formatNAD(totalGross), sub: period, icon: CreditCard },
          { label: 'PAYE (NamRA)',         value: formatNAD(totalPAYE),  sub: 'Due 20th monthly', icon: FileText },
          { label: 'SSC (Total)',           value: formatNAD(totalSSC),   sub: 'Emp + Employer', icon: Building2 },
          { label: 'VET Levy',              value: formatNAD(totalVET),   sub: '1% of gross', icon: BarChart3 },
        ].map(c => (
          <div key={c.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-navy-50 rounded-lg flex items-center justify-center">
                <c.icon size={14} className="text-navy-600" />
              </div>
              <div className="text-xs text-navy-500">{c.label}</div>
            </div>
            <div className="text-lg font-bold text-navy-900 tabular-nums">{c.value}</div>
            <div className="text-xs text-navy-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend */}
        <div className="card p-5">
          <div className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-navy-600" />
            Payroll Trend — Jul 2024 to Apr 2025
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5d0b5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9eb0d3' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9eb0d3' }} axisLine={false} tickLine={false}
                tickFormatter={v => `N$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span className="text-xs text-navy-600">{v}</span>} />
              <Line dataKey="gross" name="Gross"  stroke="#0f2557" strokeWidth={2.5} dot={false} />
              <Line dataKey="net"   name="Net Pay" stroke="#c9a84c" strokeWidth={2.5} dot={false} />
              <Line dataKey="paye"  name="PAYE"    stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department breakdown */}
        <div className="card p-5">
          <div className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Building2 size={15} className="text-navy-600" />
            Gross Pay by Department
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5d0b5" vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#5878b4' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9eb0d3' }} axisLine={false} tickLine={false}
                tickFormatter={v => `N$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="gross" name="Gross Pay" fill="#0f2557" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-cream-200 bg-cream-50 flex items-center justify-between">
          <div className="text-sm font-semibold text-navy-900">Department Payroll Analysis — {period}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-200">
                <th className="table-header">Department</th>
                <th className="table-header text-center">Headcount</th>
                <th className="table-header text-right">Gross Pay</th>
                <th className="table-header text-right">PAYE</th>
                <th className="table-header text-right">Net Pay</th>
                <th className="table-header text-right">Avg. Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {deptData.map(d => (
                <tr key={d.dept} className="hover:bg-cream-50 transition-colors">
                  <td className="table-cell font-medium text-navy-900">{d.dept}</td>
                  <td className="table-cell text-center">
                    <span className="badge badge-navy">{d.headcount}</span>
                  </td>
                  <td className="table-cell text-right tabular-nums font-medium">{formatNAD(d.gross)}</td>
                  <td className="table-cell text-right tabular-nums text-red-600">{formatNAD(d.paye)}</td>
                  <td className="table-cell text-right tabular-nums text-emerald-700 font-semibold">{formatNAD(d.net)}</td>
                  <td className="table-cell text-right tabular-nums text-navy-500">{formatNAD(d.gross / d.headcount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy-900 bg-cream-50">
                <td className="table-cell font-bold text-navy-900">TOTAL</td>
                <td className="table-cell text-center">
                  <span className="badge badge-navy">{employees.length}</span>
                </td>
                <td className="table-cell text-right tabular-nums font-bold text-navy-900">{formatNAD(totalGross)}</td>
                <td className="table-cell text-right tabular-nums font-bold text-red-600">{formatNAD(totalPAYE)}</td>
                <td className="table-cell text-right tabular-nums font-bold text-emerald-700">{formatNAD(employees.reduce((s,e) => s+e.payroll.netPay, 0))}</td>
                <td className="table-cell text-right tabular-nums text-navy-500">{formatNAD(totalGross / employees.length)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Report library — categorised, searchable (PaySpace NextGen/Classic) */}
      <ReportLibrary />
    </div>
  )
}
