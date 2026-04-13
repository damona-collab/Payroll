import React from 'react'
import {
  Users, TrendingUp, CreditCard, AlertCircle,
  ArrowUp, ArrowDown, Building2, FileCheck,
  Calendar, Clock,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { employees, COMPANY_INFO } from '../data/employees.js'
import { formatNAD } from '../utils/namibianTax.js'

const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']

const activeEmployees = employees.filter(e => e.status === 'Active')
const totalGross = employees.reduce((s, e) => s + e.payroll.grossSalary, 0)
const totalPAYE = employees.reduce((s, e) => s + e.payroll.paye, 0)
const totalNet = employees.reduce((s, e) => s + e.payroll.netPay, 0)
const totalSSC = employees.reduce((s, e) => s + e.payroll.sscEmployee + e.payroll.sscEmployer, 0)
const totalVET = employees.reduce((s, e) => s + e.payroll.vetLevy, 0)

const payrollTrend = MONTHS.map((month, i) => ({
  month,
  gross: Math.round(totalGross * (0.92 + Math.sin(i * 0.5) * 0.04 + Math.random() * 0.03)),
  net: Math.round(totalNet * (0.92 + Math.sin(i * 0.5) * 0.04 + Math.random() * 0.03)),
}))

const deptData = Object.entries(
  employees.reduce((acc, e) => {
    if (!acc[e.department]) acc[e.department] = 0
    acc[e.department] += e.payroll.grossSalary
    return acc
  }, {})
).map(([name, value]) => ({ name, value }))

const DEPT_COLORS = ['#0f2557', '#234188', '#3a60a7', '#5878b4', '#7790c1', '#c9a84c', '#d4a843', '#b8822e']

function KPICard({ icon: Icon, label, value, sub, trend, trendUp, color = 'navy' }) {
  const colorMap = {
    navy:  { bg: 'bg-navy-900',   icon: 'text-cream-100',   val: 'text-cream-100',   sub: 'text-navy-300' },
    gold:  { bg: 'bg-gold-400',   icon: 'text-navy-900',    val: 'text-navy-900',    sub: 'text-navy-700' },
    cream: { bg: 'bg-white',      icon: 'text-navy-600',    val: 'text-navy-900',    sub: 'text-navy-400' },
    red:   { bg: 'bg-red-50',     icon: 'text-red-600',     val: 'text-navy-900',    sub: 'text-navy-400' },
  }
  const c = colorMap[color]
  return (
    <div className={`card p-5 ${color === 'navy' ? 'bg-navy-900' : color === 'gold' ? 'bg-gold-400 border-gold-500' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          color === 'navy' ? 'bg-white/10' : color === 'gold' ? 'bg-navy-900/10' : 'bg-navy-50'
        }`}>
          <Icon size={20} className={c.icon} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {trendUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {trend}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold mb-1 ${c.val}`}>{value}</div>
      <div className={`text-sm font-medium ${c.val} opacity-80`}>{label}</div>
      {sub && <div className={`text-xs mt-1 ${c.sub}`}>{sub}</div>}
    </div>
  )
}

function RecentActivity() {
  const activities = [
    { type: 'payroll', msg: 'March 2025 payroll processed', time: '2 hours ago', icon: FileCheck, color: 'text-emerald-600 bg-emerald-50' },
    { type: 'employee', msg: 'Anna Shipanga added to Sales dept.', time: '1 day ago', icon: Users, color: 'text-navy-600 bg-navy-50' },
    { type: 'leave', msg: 'Frieda Gaoseb on approved leave', time: '2 days ago', icon: Calendar, color: 'text-amber-600 bg-amber-50' },
    { type: 'tax', msg: 'PAYE submission due Apr 20', time: '7 days left', icon: AlertCircle, color: 'text-red-500 bg-red-50' },
    { type: 'payroll', msg: 'February 2025 payslips generated', time: '1 month ago', icon: FileCheck, color: 'text-emerald-600 bg-emerald-50' },
  ]
  return (
    <div className="card p-5">
      <div className="section-title flex items-center gap-2">
        <Clock size={16} className="text-navy-600" />
        Recent Activity
      </div>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}>
              <a.icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-navy-800 font-medium leading-tight">{a.msg}</div>
              <div className="text-xs text-navy-400 mt-0.5">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-900 text-cream-100 rounded-xl shadow-xl px-4 py-3 text-xs border border-navy-800">
      <div className="font-semibold mb-2 text-sm">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span className="text-navy-300">{p.name}</span>
          <span className="font-semibold">{formatNAD(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-900 text-cream-100 rounded-xl shadow-xl px-3 py-2 text-xs border border-navy-800">
      <div className="font-semibold">{payload[0].name}</div>
      <div>{formatNAD(payload[0].value)}</div>
    </div>
  )
}

export default function Dashboard() {
  const upcomingPayDate = `${COMPANY_INFO.payDate} April 2025`

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <AlertCircle size={16} className="text-amber-600 shrink-0" />
        <span className="text-sm text-amber-800 font-medium">
          PAYE submission deadline: <strong>20 April 2025</strong>. NamRA monthly return due.
        </span>
        <button className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 shrink-0 underline">
          View Details
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Users}
          label="Active Employees"
          value={activeEmployees.length}
          sub={`${employees.length} total headcount`}
          trend={4.2}
          trendUp
          color="navy"
        />
        <KPICard
          icon={CreditCard}
          label="Total Gross Payroll"
          value={formatNAD(totalGross)}
          sub="Current month"
          trend={2.1}
          trendUp
          color="gold"
        />
        <KPICard
          icon={TrendingUp}
          label="Total Net Pay"
          value={formatNAD(totalNet)}
          sub="After all deductions"
          trend={1.8}
          trendUp
          color="cream"
        />
        <KPICard
          icon={AlertCircle}
          label="PAYE Liability"
          value={formatNAD(totalPAYE)}
          sub="Due 20th of month"
          color="cream"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payroll trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="section-title flex items-center gap-2">
            <TrendingUp size={16} className="text-navy-600" />
            Payroll Trend (Jul 2024 – Apr 2025)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={payrollTrend} barGap={4} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5d0b5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5878b4' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#9eb0d3' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `N$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle" iconSize={8}
                formatter={v => <span className="text-xs text-navy-600">{v}</span>}
              />
              <Bar dataKey="gross" name="Gross Pay" fill="#0f2557" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net"   name="Net Pay"   fill="#c9a84c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dept breakdown */}
        <div className="card p-5">
          <div className="section-title flex items-center gap-2">
            <Building2 size={16} className="text-navy-600" />
            Payroll by Department
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={deptData}
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {deptData.map((_, i) => (
                  <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                iconType="circle" iconSize={8}
                formatter={v => <span className="text-xs text-navy-600 truncate">{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payroll summary */}
        <div className="card p-5 lg:col-span-2">
          <div className="section-title flex items-center gap-2">
            <CreditCard size={16} className="text-navy-600" />
            Payroll Summary — April 2025
          </div>
          <div className="space-y-2">
            {[
              { label: 'Basic Salaries', value: employees.reduce((s, e) => s + e.basicSalary, 0), type: 'earning' },
              { label: 'Allowances', value: employees.reduce((s, e) => s + e.allowances, 0), type: 'earning' },
              { label: 'Housing Allowances', value: employees.reduce((s, e) => s + e.housingAllowance, 0), type: 'earning' },
              { label: 'Total Gross', value: totalGross, type: 'total' },
              { label: 'PAYE (Employee Tax)', value: -totalPAYE, type: 'deduction' },
              { label: 'SSC (Employee)', value: -employees.reduce((s, e) => s + e.payroll.sscEmployee, 0), type: 'deduction' },
              { label: 'Pension Contributions', value: -employees.reduce((s, e) => s + e.pensionEmployee, 0), type: 'deduction' },
              { label: 'Medical Aid', value: -employees.reduce((s, e) => s + e.medicalAid, 0), type: 'deduction' },
              { label: 'Net Pay to Employees', value: totalNet, type: 'net' },
              { label: 'SSC (Employer)', value: -employees.reduce((s, e) => s + e.payroll.sscEmployer, 0), type: 'employer' },
              { label: 'VET Levy (Employer 1%)', value: -totalVET, type: 'employer' },
              { label: 'Total Employer Cost', value: employees.reduce((s, e) => s + e.payroll.totalEmployerCost, 0), type: 'final' },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between items-center py-1.5 ${
                row.type === 'total' || row.type === 'net' || row.type === 'final'
                  ? 'border-t border-cream-200 font-semibold text-navy-900 mt-1'
                  : 'text-navy-700'
              }`}>
                <span className={`text-sm ${row.type === 'deduction' ? 'pl-4 text-navy-500' : row.type === 'employer' ? 'pl-4 text-navy-500' : ''}`}>
                  {row.label}
                </span>
                <span className={`text-sm tabular-nums font-medium ${
                  row.type === 'deduction' || row.type === 'employer' ? 'text-red-600' :
                  row.type === 'net' || row.type === 'final' ? 'text-navy-900 text-base' :
                  row.type === 'total' ? 'text-navy-900' :
                  'text-emerald-700'
                }`}>
                  {formatNAD(Math.abs(row.value))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming + activity */}
        <div className="space-y-4">
          {/* Upcoming dates */}
          <div className="card p-5">
            <div className="section-title flex items-center gap-2">
              <Calendar size={16} className="text-navy-600" />
              Key Dates
            </div>
            <div className="space-y-3">
              {[
                { label: 'Pay Date', date: upcomingPayDate, tag: 'pay', color: 'badge-navy' },
                { label: 'PAYE Due', date: '20 April 2025', tag: 'NamRA', color: 'badge-red' },
                { label: 'SSC Due', date: '07 May 2025', tag: 'SSC', color: 'badge-yellow' },
                { label: 'VET Levy', date: '20 April 2025', tag: 'NTA', color: 'badge-blue' },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-navy-500">{d.label}</div>
                    <div className="text-sm font-medium text-navy-900">{d.date}</div>
                  </div>
                  <span className={`badge ${d.color}`}>{d.tag}</span>
                </div>
              ))}
            </div>
          </div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
