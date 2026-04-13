import React, { useState } from 'react'
import {
  Calendar, Plus, CheckCircle, XCircle, Clock, Info,
  AlertTriangle, ChevronRight, FileText,
} from 'lucide-react'
import { employees } from '../data/employees.js'
import { LEAVE_ENTITLEMENTS, OVERTIME, NOTICE_PERIODS } from '../utils/namibianTax.js'

const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'Family Responsibility', 'Maternity Leave', 'Unpaid Leave']
const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Declined']

// Mock leave applications
const MOCK_APPLICATIONS = [
  {
    id: 'LA001', empId: 'EMP008', type: 'Annual Leave',
    from: '2025-04-07', to: '2025-04-18', days: 10,
    status: 'Approved', reason: 'Family vacation', approver: 'Selma Nangolo',
    applied: '2025-03-20',
  },
  {
    id: 'LA002', empId: 'EMP003', type: 'Sick Leave',
    from: '2025-04-10', to: '2025-04-11', days: 2,
    status: 'Approved', reason: 'Flu and doctor visit', approver: 'Selma Nangolo',
    applied: '2025-04-10',
  },
  {
    id: 'LA003', empId: 'EMP006', type: 'Annual Leave',
    from: '2025-04-28', to: '2025-04-30', days: 3,
    status: 'Pending', reason: 'Personal matters', approver: null,
    applied: '2025-04-13',
  },
  {
    id: 'LA004', empId: 'EMP004', type: 'Family Responsibility',
    from: '2025-04-14', to: '2025-04-14', days: 1,
    status: 'Approved', reason: 'Child school event', approver: 'Maria Nghifikwa',
    applied: '2025-04-12',
  },
  {
    id: 'LA005', empId: 'EMP001', type: 'Annual Leave',
    from: '2025-05-05', to: '2025-05-09', days: 5,
    status: 'Pending', reason: 'Public holiday extension', approver: null,
    applied: '2025-04-13',
  },
]

function StatusBadge({ status }) {
  if (status === 'Approved') return <span className="badge badge-green"><CheckCircle size={10} className="mr-0.5" />{status}</span>
  if (status === 'Pending')  return <span className="badge badge-yellow"><Clock size={10} className="mr-0.5" />{status}</span>
  if (status === 'Declined') return <span className="badge badge-red"><XCircle size={10} className="mr-0.5" />{status}</span>
  return <span className="badge">{status}</span>
}

function LeaveTypeBadge({ type }) {
  const colors = {
    'Annual Leave': 'badge-navy',
    'Sick Leave': 'badge-yellow',
    'Family Responsibility': 'badge-blue',
    'Maternity Leave': 'badge-green',
    'Unpaid Leave': 'badge-red',
  }
  return <span className={`badge ${colors[type] || ''}`}>{type}</span>
}

function BalanceBar({ label, used, total, color }) {
  const pct = Math.min(100, (used / total) * 100)
  const remaining = Math.max(0, total - used)
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-navy-600 font-medium">{label}</span>
        <span className="text-xs text-navy-500">{remaining.toFixed(1)} / {total} days left</span>
      </div>
      <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ApplyModal({ onClose }) {
  const [form, setForm] = useState({
    empId: employees[0].id,
    type: 'Annual Leave',
    from: '',
    to: '',
    reason: '',
  })

  function handleSubmit(e) {
    e.preventDefault()
    alert(`Leave application submitted for ${form.type}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="bg-navy-900 rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <div className="text-cream-100 font-semibold">Apply for Leave</div>
          <button onClick={onClose} className="text-navy-400 hover:text-cream-100">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Employee</label>
            <select className="select" value={form.empId} onChange={e => setForm(f => ({ ...f, empId: e.target.value }))}>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Leave Type</label>
            <select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">From Date</label>
              <input type="date" className="input" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} required />
            </div>
            <div>
              <label className="label">To Date</label>
              <input type="date" className="input" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Brief reason for leave..."
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Plus size={14} /> Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LeaveManagement() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [showApply, setShowApply] = useState(false)
  const [activeTab, setActiveTab] = useState('applications')

  const filtered = MOCK_APPLICATIONS.filter(a =>
    statusFilter === 'All' || a.status === statusFilter
  )

  function getEmployee(id) {
    return employees.find(e => e.id === id)
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="card p-1 flex gap-1 w-fit">
        {['applications', 'balances', 'act'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-navy-900 text-cream-100'
                : 'text-navy-600 hover:bg-cream-100'
            }`}
          >
            {tab === 'act' ? 'Labour Act Reference' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Leave Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-navy-900 text-cream-100'
                      : 'bg-white border border-cream-200 text-navy-600 hover:bg-cream-50'
                  }`}
                >
                  {s}
                  {s !== 'All' && (
                    <span className="ml-1.5 text-[10px] opacity-70">
                      ({MOCK_APPLICATIONS.filter(a => a.status === s).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setShowApply(true)}>
              <Plus size={14} /> Apply for Leave
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Pending Approval', count: MOCK_APPLICATIONS.filter(a => a.status === 'Pending').length, color: 'text-amber-600 bg-amber-50', icon: Clock },
              { label: 'Approved This Month', count: MOCK_APPLICATIONS.filter(a => a.status === 'Approved').length, color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
              { label: 'Employees on Leave', count: employees.filter(e => e.status === 'On Leave').length, color: 'text-navy-600 bg-navy-50', icon: Calendar },
            ].map(s => (
              <div key={s.label} className="card p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-navy-900">{s.count}</div>
                  <div className="text-xs text-navy-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-200 bg-cream-50">
                    <th className="table-header">Employee</th>
                    <th className="table-header">Leave Type</th>
                    <th className="table-header">Period</th>
                    <th className="table-header text-center">Days</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Applied</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {filtered.map(app => {
                    const emp = getEmployee(app.empId)
                    return (
                      <tr key={app.id} className="hover:bg-cream-50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-cream-100 text-xs font-bold">
                                {emp?.firstName[0]}{emp?.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-navy-900">{emp?.firstName} {emp?.lastName}</div>
                              <div className="text-xs text-navy-400">{emp?.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell"><LeaveTypeBadge type={app.type} /></td>
                        <td className="table-cell">
                          <div className="text-sm text-navy-800">
                            {new Date(app.from).toLocaleDateString('en-NA', { day: '2-digit', month: 'short' })}
                            {' – '}
                            {new Date(app.to).toLocaleDateString('en-NA', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="table-cell text-center">
                          <span className="badge badge-navy">{app.days}d</span>
                        </td>
                        <td className="table-cell"><StatusBadge status={app.status} /></td>
                        <td className="table-cell text-xs text-navy-400">
                          {new Date(app.applied).toLocaleDateString('en-NA', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="table-cell text-right">
                          {app.status === 'Pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                                <CheckCircle size={15} />
                              </button>
                              <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Decline">
                                <XCircle size={15} />
                              </button>
                            </div>
                          )}
                          {app.status !== 'Pending' && (
                            <span className="text-xs text-navy-400">by {app.approver}</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leave Balances */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-cream-200 bg-cream-50">
              <div className="text-sm font-semibold text-navy-900">Employee Leave Balances — April 2025</div>
            </div>
            <div className="divide-y divide-cream-100">
              {employees.map(emp => (
                <div key={emp.id} className="px-5 py-4 hover:bg-cream-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-navy-900 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <span className="text-cream-100 text-xs font-bold">{emp.firstName[0]}{emp.lastName[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-sm font-medium text-navy-900">{emp.firstName} {emp.lastName}</div>
                          <div className="text-xs text-navy-400">{emp.department} &bull; {(emp.monthsEmployed / 12).toFixed(1)} years service</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <BalanceBar
                          label="Annual Leave"
                          used={24 - emp.leaveBalance.annual}
                          total={24}
                          color="bg-navy-900"
                        />
                        <BalanceBar
                          label="Sick Leave"
                          used={26 - emp.leaveBalance.sick}
                          total={26}
                          color="bg-amber-500"
                        />
                        <BalanceBar
                          label="Family Responsibility"
                          used={5 - emp.leaveBalance.familyResponsibility}
                          total={5}
                          color="bg-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Labour Act Reference */}
      {activeTab === 'act' && (
        <div className="space-y-4">
          <div className="card p-4 border-l-4 border-navy-900 bg-navy-50">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-navy-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold text-navy-900">Namibian Labour Act 11 of 2007</div>
                <div className="text-xs text-navy-600 mt-0.5">
                  The following entitlements are mandatory under Namibian law. Failure to comply may result in penalties by the Ministry of Labour, Industrial Relations and Employment Creation.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leave entitlements */}
            {Object.values(LEAVE_ENTITLEMENTS).map(ent => (
              <div key={ent.label} className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-navy-600" />
                  <div className="text-sm font-semibold text-navy-900">{ent.label}</div>
                </div>
                <div className="text-2xl font-bold text-navy-900 mb-1">
                  {ent.daysPerYear ? `${ent.daysPerYear} days` :
                   ent.daysPerCycle ? `${ent.daysPerCycle} days` :
                   ent.weeksMin ? `${ent.weeksMin}+ weeks` : '–'}
                </div>
                <div className="text-xs text-navy-500 mb-3">{ent.basis}</div>
                <div className="text-xs text-navy-400 italic">{ent.reference}</div>
              </div>
            ))}

            {/* Overtime */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-navy-600" />
                <div className="text-sm font-semibold text-navy-900">Overtime Rates (Section 17)</div>
              </div>
              <div className="space-y-2">
                {Object.entries(OVERTIME).map(([key, ot]) => (
                  <div key={key} className="flex items-start gap-2">
                    <ChevronRight size={14} className="text-navy-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-navy-700">
                      <span className="font-bold text-navy-900">{ot.rate}×</span> — {ot.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notice periods */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-navy-600" />
                <div className="text-sm font-semibold text-navy-900">Notice Periods (Section 34)</div>
              </div>
              <div className="space-y-2">
                {NOTICE_PERIODS.map((np, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight size={14} className="text-navy-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-navy-700">{np.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SSC info */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-navy-600" />
              <div className="text-sm font-semibold text-navy-900">Social Security Commission (SSC)</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-cream-100 rounded-lg p-3">
                <div className="label">Employee Contribution</div>
                <div className="text-lg font-bold text-navy-900">0.9%</div>
                <div className="text-xs text-navy-500">Max N$81/month</div>
              </div>
              <div className="bg-cream-100 rounded-lg p-3">
                <div className="label">Employer Contribution</div>
                <div className="text-lg font-bold text-navy-900">0.9%</div>
                <div className="text-xs text-navy-500">Max N$81/month</div>
              </div>
              <div className="bg-cream-100 rounded-lg p-3">
                <div className="label">Earnings Ceiling</div>
                <div className="text-lg font-bold text-navy-900">N$9,000/mo</div>
                <div className="text-xs text-navy-500">N$108,000 annually</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-navy-400">
              Contributions cover Maternity Leave, Sick Leave, and Death Benefits Fund per the Social Security Act 34 of 1994.
            </div>
          </div>
        </div>
      )}

      {showApply && <ApplyModal onClose={() => setShowApply(false)} />}
    </div>
  )
}
