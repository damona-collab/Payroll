import React, { useState } from 'react'
import {
  BarChart3, Download, FileText, TrendingUp, Users,
  CreditCard, Building2, Calendar,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { employees, COMPANY_INFO } from '../data/employees.js'
import { formatNAD } from '../utils/namibianTax.js'

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

const REPORT_TYPES = [
  { id: 'payroll-summary', label: 'Payroll Summary', icon: CreditCard, desc: 'Monthly gross, deductions, and net pay summary' },
  { id: 'paye-report', label: 'NamRA PAYE Return', icon: FileText, desc: 'Employee tax schedule for NamRA submission' },
  { id: 'ssc-report', label: 'SSC Contribution Report', icon: Building2, desc: 'SSC contributions per employee for the period' },
  { id: 'payroll-register', label: 'Payroll Register', icon: Users, desc: 'Full payroll register with all earnings and deductions' },
  { id: 'leave-report', label: 'Leave Report', icon: Calendar, desc: 'Leave balances and transactions by employee' },
  { id: 'vet-report', label: 'VET Levy Report', icon: BarChart3, desc: 'Vocational Education & Training levy summary' },
]

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
          <div className="text-xs text-navy-400">Tax Year 2024/2025 &bull; {COMPANY_INFO.name}</div>
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

      {/* Report downloads */}
      <div className="card p-5">
        <div className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
          <Download size={15} className="text-navy-600" />
          Generate Reports — {period}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TYPES.map(r => (
            <button
              key={r.id}
              className="flex items-start gap-3 p-4 rounded-xl border border-cream-200 bg-cream-50
                         hover:bg-navy-900 hover:border-navy-900 hover:text-cream-100 transition-all duration-150 group text-left"
            >
              <div className="w-9 h-9 bg-navy-100 group-hover:bg-white/10 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                <r.icon size={16} className="text-navy-600 group-hover:text-cream-100 transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-navy-900 group-hover:text-cream-100 transition-colors">{r.label}</div>
                <div className="text-xs text-navy-400 group-hover:text-navy-300 transition-colors mt-0.5 leading-tight">{r.desc}</div>
              </div>
              <Download size={14} className="text-navy-300 shrink-0 mt-0.5 group-hover:text-gold-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
