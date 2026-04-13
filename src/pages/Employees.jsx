import React, { useState, useMemo } from 'react'
import {
  Search, Plus, Filter, ChevronDown, Eye, Edit2,
  Download, Users, Mail, Phone, Building2, X,
  CheckCircle, AlertCircle, Clock,
} from 'lucide-react'
import { employees, departments } from '../data/employees.js'
import { formatNAD } from '../utils/namibianTax.js'

function StatusBadge({ status }) {
  if (status === 'Active')    return <span className="badge badge-green">Active</span>
  if (status === 'On Leave')  return <span className="badge badge-yellow">On Leave</span>
  if (status === 'Inactive')  return <span className="badge badge-red">Inactive</span>
  return <span className="badge badge-blue">{status}</span>
}

function TypeBadge({ type }) {
  if (type === 'Permanent') return <span className="badge badge-navy">Permanent</span>
  if (type === 'Contract')  return <span className="badge badge-blue">Contract</span>
  return <span className="badge">{type}</span>
}

function EmployeeModal({ employee, onClose }) {
  if (!employee) return null
  const p = employee.payroll
  const yearsService = (employee.monthsEmployed / 12).toFixed(1)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-navy-900 rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gold-400 rounded-xl flex items-center justify-center text-navy-900 font-bold text-xl">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <div className="text-cream-100 font-bold text-lg">
                {employee.firstName} {employee.lastName}
              </div>
              <div className="text-navy-300 text-sm">{employee.jobTitle}</div>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={employee.status} />
                <TypeBadge type={employee.employmentType} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-navy-400 hover:text-cream-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Employee ID', value: employee.id },
              { label: 'ID Number', value: employee.idNumber },
              { label: 'Tax Number', value: employee.taxNumber },
              { label: 'Department', value: employee.department },
              { label: 'Start Date', value: new Date(employee.startDate).toLocaleDateString('en-NA', { day: '2-digit', month: 'short', year: 'numeric' }) },
              { label: 'Years of Service', value: `${yearsService} years` },
              { label: 'Email', value: employee.email },
              { label: 'Phone', value: employee.phone },
              { label: 'Gender', value: employee.gender },
            ].map(f => (
              <div key={f.label} className="bg-cream-100 rounded-xl p-3">
                <div className="label">{f.label}</div>
                <div className="text-sm font-medium text-navy-900 truncate">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Bank details */}
          <div>
            <div className="section-title">Banking Details</div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Bank', value: employee.bankName },
                { label: 'Account Number', value: employee.accountNumber },
                { label: 'Branch Code', value: employee.branchCode },
              ].map(f => (
                <div key={f.label} className="bg-cream-100 rounded-xl p-3">
                  <div className="label">{f.label}</div>
                  <div className="text-sm font-medium text-navy-900">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Current payroll */}
          <div>
            <div className="section-title">Current Month Remuneration</div>
            <div className="bg-cream-100 rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-cream-200">
                <div className="p-4 space-y-2">
                  <div className="text-xs font-bold text-navy-600 uppercase tracking-wide mb-3">Earnings</div>
                  {[
                    { label: 'Basic Salary', value: employee.basicSalary },
                    { label: 'Allowances', value: employee.allowances },
                    { label: 'Housing Allowance', value: employee.housingAllowance },
                    { label: 'Gross Salary', value: p.grossSalary, bold: true },
                  ].map(r => (
                    <div key={r.label} className={`flex justify-between text-sm ${r.bold ? 'border-t border-cream-300 pt-2 font-semibold text-navy-900' : 'text-navy-700'}`}>
                      <span>{r.label}</span>
                      <span className="tabular-nums">{formatNAD(r.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-xs font-bold text-navy-600 uppercase tracking-wide mb-3">Deductions</div>
                  {[
                    { label: 'PAYE', value: p.paye },
                    { label: 'SSC (Employee)', value: p.sscEmployee },
                    { label: 'Pension', value: employee.pensionEmployee },
                    { label: 'Medical Aid', value: employee.medicalAid },
                    { label: 'Other', value: employee.otherDeductions },
                    { label: 'Total Deductions', value: p.totalDeductions, bold: true },
                  ].filter(r => r.value > 0).map(r => (
                    <div key={r.label} className={`flex justify-between text-sm ${r.bold ? 'border-t border-cream-300 pt-2 font-semibold text-navy-900' : 'text-navy-700'}`}>
                      <span>{r.label}</span>
                      <span className="tabular-nums text-red-600">{formatNAD(r.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-navy-900 px-4 py-3 flex justify-between items-center rounded-b-xl">
                <span className="text-cream-100 font-semibold">Net Pay</span>
                <span className="text-gold-400 font-bold text-lg tabular-nums">{formatNAD(p.netPay)}</span>
              </div>
            </div>
          </div>

          {/* Leave balances */}
          <div>
            <div className="section-title">Leave Balances</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Annual Leave', balance: employee.leaveBalance.annual, total: 24, unit: 'days', color: 'bg-navy-900' },
                { label: 'Sick Leave', balance: employee.leaveBalance.sick, total: 26, unit: 'days', color: 'bg-gold-400' },
                { label: 'Family Resp.', balance: employee.leaveBalance.familyResponsibility, total: 5, unit: 'days', color: 'bg-emerald-600' },
              ].map(l => (
                <div key={l.label} className="card p-3 text-center">
                  <div className="text-xs text-navy-500 mb-1">{l.label}</div>
                  <div className="text-2xl font-bold text-navy-900">{l.balance.toFixed(1)}</div>
                  <div className="text-xs text-navy-400">of {l.total} {l.unit}</div>
                  <div className="mt-2 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${l.color}`}
                      style={{ width: `${Math.min(100, (l.balance / l.total) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 pb-6">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary"><Edit2 size={14} /> Edit Employee</button>
        </div>
      </div>
    </div>
  )
}

export default function Employees() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [sortField, setSortField] = useState('lastName')
  const [sortDir, setSortDir] = useState('asc')

  const filtered = useMemo(() => {
    let list = [...employees]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
      )
    }
    if (deptFilter !== 'All') list = list.filter(e => e.department === deptFilter)
    if (statusFilter !== 'All') list = list.filter(e => e.status === statusFilter)
    list.sort((a, b) => {
      const va = a[sortField] ?? ''
      const vb = b[sortField] ?? ''
      const cmp = String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [search, deptFilter, statusFilter, sortField, sortDir])

  const totalGross = filtered.reduce((s, e) => s + e.payroll.grossSalary, 0)
  const totalNet = filtered.reduce((s, e) => s + e.payroll.netPay, 0)

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function SortIcon({ field }) {
    if (sortField !== field) return <ChevronDown size={12} className="text-navy-300" />
    return sortDir === 'asc'
      ? <ChevronDown size={12} className="text-navy-900 rotate-180" />
      : <ChevronDown size={12} className="text-navy-900" />
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Employees', value: employees.length, icon: Users, sub: 'All time' },
          { label: 'Active', value: employees.filter(e => e.status === 'Active').length, icon: CheckCircle, sub: 'Currently working' },
          { label: 'On Leave', value: employees.filter(e => e.status === 'On Leave').length, icon: Clock, sub: 'This period' },
          { label: 'Gross Payroll', value: formatNAD(totalGross), icon: Building2, sub: 'Filtered total' },
        ].map(c => (
          <div key={c.label} className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-navy-50 rounded-xl flex items-center justify-center shrink-0">
              <c.icon size={16} className="text-navy-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-navy-900">{c.value}</div>
              <div className="text-xs text-navy-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-2 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-cream-100 border border-cream-200 rounded-lg px-3 py-2 flex-1 min-w-48">
              <Search size={14} className="text-navy-400 shrink-0" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-navy-700 placeholder-navy-400 outline-none flex-1"
              />
            </div>
            {/* Dept filter */}
            <div className="flex items-center gap-1 bg-cream-100 border border-cream-200 rounded-lg px-3 py-2">
              <Filter size={13} className="text-navy-400" />
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="bg-transparent text-sm text-navy-700 outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {/* Status filter */}
            <div className="flex items-center gap-1 bg-cream-100 border border-cream-200 rounded-lg px-3 py-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm text-navy-700 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="btn-secondary"><Download size={14} /> Export</button>
            <button className="btn-primary"><Plus size={14} /> Add Employee</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50">
                <th className="table-header">
                  <button onClick={() => toggleSort('lastName')} className="flex items-center gap-1 hover:text-navy-900">
                    Employee <SortIcon field="lastName" />
                  </button>
                </th>
                <th className="table-header hidden md:table-cell">Department</th>
                <th className="table-header hidden lg:table-cell">Contact</th>
                <th className="table-header">
                  <button onClick={() => toggleSort('basicSalary')} className="flex items-center gap-1 hover:text-navy-900">
                    Basic Salary <SortIcon field="basicSalary" />
                  </button>
                </th>
                <th className="table-header hidden xl:table-cell">Net Pay</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-cream-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-navy-900 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-cream-100 text-xs font-bold">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-navy-900">{emp.firstName} {emp.lastName}</div>
                        <div className="text-xs text-navy-400">{emp.id} &bull; {emp.jobTitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <span className="badge badge-navy">{emp.department}</span>
                  </td>
                  <td className="table-cell hidden lg:table-cell">
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 text-navy-600">
                        <Mail size={11} className="shrink-0" />{emp.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-navy-400">
                        <Phone size={11} className="shrink-0" />{emp.phone}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell tabular-nums font-medium">{formatNAD(emp.basicSalary)}</td>
                  <td className="table-cell tabular-nums font-semibold text-emerald-700 hidden xl:table-cell">
                    {formatNAD(emp.payroll.netPay)}
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelected(emp)}
                        className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-cream-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-cream-100 rounded-lg transition-colors" title="Edit">
                        <Edit2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-12 text-navy-400">
                    <Users size={40} className="mx-auto mb-3 text-navy-200" />
                    No employees match your filters
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-cream-200 bg-cream-50">
                  <td colSpan={3} className="table-cell text-xs text-navy-500">
                    Showing {filtered.length} of {employees.length} employees
                  </td>
                  <td className="table-cell font-semibold text-navy-900 tabular-nums">
                    {formatNAD(totalGross)}
                  </td>
                  <td className="table-cell font-semibold text-emerald-700 tabular-nums hidden xl:table-cell">
                    {formatNAD(totalNet)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {selected && <EmployeeModal employee={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
