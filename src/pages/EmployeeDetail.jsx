import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, User, CreditCard, FileText, Calendar, Building2,
  Save, Check, Eye, Download, Landmark, Wallet, ChevronRight,
} from 'lucide-react'
import { usePayroll } from '../store/PayrollProvider.jsx'
import { COMPANY_INFO } from '../data/employees.js'
import { formatNAD } from '../utils/namibianTax.js'
import { downloadPayslipPDF } from '../utils/download.js'

const SECTIONS = [
  { id: 'basic',      label: 'Basic Information', icon: User },
  { id: 'payrate',    label: 'Pay Rate & Package', icon: Wallet },
  { id: 'components', label: 'Recurring Components', icon: CreditCard },
  { id: 'payslips',   label: 'Payslips', icon: FileText },
  { id: 'banking',    label: 'Banking Details', icon: Landmark },
  { id: 'leave',      label: 'Leave', icon: Calendar },
]

function Labeled({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEmployee, getEmployeeRaw, updateEmployee, periods } = usePayroll()
  const [section, setSection] = useState('basic')
  const [saved, setSaved] = useState(false)

  const employee = getEmployee(id)
  if (!employee) {
    return (
      <div className="card p-10 text-center">
        <div className="text-navy-500">Employee not found.</div>
        <Link to="/employees" className="btn-secondary mt-4 inline-flex"><ArrowLeft size={14} /> Back to Employees</Link>
      </div>
    )
  }
  const raw = getEmployeeRaw(id)
  const p = employee.payroll

  // Local editable form state
  const [form, setForm] = useState(raw)
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))
  const setNum = (field, value) => setForm(f => ({ ...f, [field]: value === '' ? '' : Number(value) }))

  function save() {
    updateEmployee(id, form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/employees')} className="btn-ghost px-2"><ArrowLeft size={16} /></button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-cream-100 font-bold">{employee.firstName[0]}{employee.lastName[0]}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-navy-900">{employee.firstName} {employee.lastName}</h1>
            <div className="text-sm text-navy-400">{employee.id} &bull; {employee.jobTitle} &bull; {employee.department}</div>
          </div>
        </div>
        <span className={employee.status === 'Active' ? 'badge badge-green' : 'badge badge-yellow'}>{employee.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sub-nav */}
        <div className="lg:col-span-1">
          <div className="card p-2 sticky top-0">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  section === s.id ? 'bg-navy-900 text-cream-100' : 'text-navy-600 hover:bg-cream-100'
                }`}
              >
                <s.icon size={16} className="shrink-0" />
                <span className="flex-1 text-left">{s.label}</span>
                {section === s.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Basic Information */}
          {section === 'basic' && (
            <div className="card p-5">
              <div className="section-title">Basic Information</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Labeled label="First Name"><input className="input" value={form.firstName || ''} onChange={e => set('firstName', e.target.value)} /></Labeled>
                <Labeled label="Last Name"><input className="input" value={form.lastName || ''} onChange={e => set('lastName', e.target.value)} /></Labeled>
                <Labeled label="ID Number"><input className="input" value={form.idNumber || ''} onChange={e => set('idNumber', e.target.value)} /></Labeled>
                <Labeled label="SSC Number"><input className="input" value={form.sscNumber || ''} onChange={e => set('sscNumber', e.target.value)} placeholder="Required for payroll" /></Labeled>
                <Labeled label="Tax Number"><input className="input" value={form.taxNumber || ''} onChange={e => set('taxNumber', e.target.value)} /></Labeled>
                <Labeled label="Citizenship"><input className="input" value={form.citizenship || ''} onChange={e => set('citizenship', e.target.value)} /></Labeled>
                <Labeled label="Email"><input className="input" value={form.email || ''} onChange={e => set('email', e.target.value)} /></Labeled>
                <Labeled label="Phone"><input className="input" value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></Labeled>
                <Labeled label="Job Title"><input className="input" value={form.jobTitle || ''} onChange={e => set('jobTitle', e.target.value)} /></Labeled>
                <Labeled label="Department"><input className="input" value={form.department || ''} onChange={e => set('department', e.target.value)} /></Labeled>
                <Labeled label="Grade"><input className="input" value={form.grade || ''} onChange={e => set('grade', e.target.value)} /></Labeled>
                <Labeled label="Cost Centre"><input className="input" value={form.costCentre || ''} onChange={e => set('costCentre', e.target.value)} /></Labeled>
                <Labeled label="Employment Type">
                  <select className="select" value={form.employmentType || ''} onChange={e => set('employmentType', e.target.value)}>
                    {['Permanent', 'Fixed Term', 'Hourly', 'Relief'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </Labeled>
                <Labeled label="Status">
                  <select className="select" value={form.status || ''} onChange={e => set('status', e.target.value)}>
                    {['Active', 'On Leave', 'Inactive'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </Labeled>
              </div>
            </div>
          )}

          {/* Pay Rate */}
          {section === 'payrate' && (
            <div className="card p-5">
              <div className="section-title">Pay Rate &amp; Package</div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 mb-4">
                Changing pay values affects all future payslip calculations for this employee.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Labeled label="Basic Salary (N$)"><input type="number" className="input" value={form.basicSalary ?? ''} onChange={e => setNum('basicSalary', e.target.value)} /></Labeled>
                <Labeled label="Taxable Allowances (N$)"><input type="number" className="input" value={form.allowances ?? ''} onChange={e => setNum('allowances', e.target.value)} /></Labeled>
                <Labeled label="Housing Allowance (N$)"><input type="number" className="input" value={form.housingAllowance ?? ''} onChange={e => setNum('housingAllowance', e.target.value)} /></Labeled>
                <Labeled label="Fringe Benefits (N$)"><input type="number" className="input" value={form.fringeBenefits ?? ''} onChange={e => setNum('fringeBenefits', e.target.value)} /></Labeled>
                <Labeled label="Pension — Employee (N$)"><input type="number" className="input" value={form.pensionEmployee ?? ''} onChange={e => setNum('pensionEmployee', e.target.value)} /></Labeled>
                <Labeled label="Pension — Employer (N$)"><input type="number" className="input" value={form.pensionEmployer ?? ''} onChange={e => setNum('pensionEmployer', e.target.value)} /></Labeled>
                <Labeled label="Medical Aid — Employee (N$)"><input type="number" className="input" value={form.medicalAid ?? ''} onChange={e => setNum('medicalAid', e.target.value)} /></Labeled>
                <Labeled label="Medical Aid — Employer (N$)"><input type="number" className="input" value={form.medicalAidEmployer ?? ''} onChange={e => setNum('medicalAidEmployer', e.target.value)} /></Labeled>
                <Labeled label="Other Deductions (N$)"><input type="number" className="input" value={form.otherDeductions ?? ''} onChange={e => setNum('otherDeductions', e.target.value)} /></Labeled>
              </div>
              {/* Live preview */}
              <div className="mt-4 bg-navy-900 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Gross', value: p.grossSalary },
                  { label: 'PAYE', value: p.paye },
                  { label: 'Deductions', value: p.totalDeductions },
                  { label: 'Net Pay', value: p.netPay, gold: true },
                ].map(x => (
                  <div key={x.label} className="text-center">
                    <div className="text-navy-300 text-xs">{x.label}</div>
                    <div className={`font-bold text-sm ${x.gold ? 'text-gold-400' : 'text-cream-100'}`}>{formatNAD(x.value)}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-navy-400 mt-2">Preview reflects saved values. Click Save Changes to apply your edits.</div>
            </div>
          )}

          {/* Recurring Components (read view of current payslip composition) */}
          {section === 'components' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-cream-200 bg-cream-50 text-sm font-semibold text-navy-900">
                Recurring Payroll Components
              </div>
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-cream-200">
                <div className="p-4">
                  <div className="text-xs font-bold text-navy-600 uppercase tracking-wide mb-2">Earnings</div>
                  {[
                    ['Basic Salary', 'SAL', p.basicSalary],
                    ['Allowances', 'OTHEREARN', p.allowances],
                    ['Housing Allowance', 'AHOUSE', p.housingAllowance],
                  ].filter(r => r[2] > 0).map(r => (
                    <div key={r[0]} className="flex justify-between text-sm py-1.5 border-b border-cream-100 last:border-0">
                      <span className="text-navy-700">{r[0]} <span className="text-[10px] font-mono text-navy-400 bg-cream-100 px-1 rounded">{r[1]}</span></span>
                      <span className="tabular-nums font-medium">{formatNAD(r[2])}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4">
                  <div className="text-xs font-bold text-navy-600 uppercase tracking-wide mb-2">Deductions</div>
                  {[
                    ['PAYE', 'Tax', p.paye],
                    ['SSC Employee', 'SOCEE', p.sscEmployee],
                    ['Pension Fund EE', 'PENFUND', p.pensionEmployee],
                    ['Medical Aid EE', 'MEDEE', p.medicalAid],
                  ].filter(r => r[2] > 0).map(r => (
                    <div key={r[0]} className="flex justify-between text-sm py-1.5 border-b border-cream-100 last:border-0">
                      <span className="text-navy-700">{r[0]} <span className="text-[10px] font-mono text-navy-400 bg-cream-100 px-1 rounded">{r[1]}</span></span>
                      <span className="tabular-nums font-medium text-red-600">{formatNAD(r[2])}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-5 py-3 bg-cream-50 border-t border-cream-200 text-xs text-navy-500">
                To add once-off items (bonus, overtime, extra deductions) for a specific month, open that month's payslip and use "Add Component".
              </div>
            </div>
          )}

          {/* Payslips list → link to functional payslip */}
          {section === 'payslips' && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-cream-200 bg-cream-50 text-sm font-semibold text-navy-900">
                Payslips — Tax Year 2026/2027
              </div>
              <div className="divide-y divide-cream-100">
                {[...periods].reverse().map(period => (
                  <div key={period} className="flex items-center gap-3 px-5 py-3 hover:bg-cream-50 transition-colors">
                    <FileText size={16} className="text-navy-400 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-navy-900">{period}</div>
                      <div className="text-xs text-navy-400">Main Run &bull; Net {formatNAD(p.netPay)}</div>
                    </div>
                    <button
                      onClick={() => navigate(`/employees/${id}/payslip/${encodeURIComponent(period)}`)}
                      className="btn-secondary text-xs"
                    >
                      <Eye size={13} /> Open
                    </button>
                    <button
                      onClick={() => downloadPayslipPDF(p, employee, period, COMPANY_INFO)}
                      className="btn-primary text-xs"
                    >
                      <Download size={13} /> PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banking */}
          {section === 'banking' && (
            <div className="card p-5">
              <div className="section-title">Banking Details</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Labeled label="Bank"><input className="input" value={form.bankName || ''} onChange={e => set('bankName', e.target.value)} /></Labeled>
                <Labeled label="Account Number"><input className="input" value={form.accountNumber || ''} onChange={e => set('accountNumber', e.target.value)} /></Labeled>
                <Labeled label="Branch Code"><input className="input" value={form.branchCode || ''} onChange={e => set('branchCode', e.target.value)} /></Labeled>
              </div>
            </div>
          )}

          {/* Leave */}
          {section === 'leave' && (
            <div className="card p-5">
              <div className="section-title">Leave Balances</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Annual Leave', balance: employee.leaveBalance.annual, total: 24, color: 'bg-navy-900' },
                  { label: 'Sick Leave', balance: employee.leaveBalance.sick, total: 26, color: 'bg-gold-400' },
                  { label: 'Family Resp.', balance: employee.leaveBalance.familyResponsibility, total: 5, color: 'bg-emerald-600' },
                ].map(l => (
                  <div key={l.label} className="card p-3 text-center">
                    <div className="text-xs text-navy-500 mb-1">{l.label}</div>
                    <div className="text-2xl font-bold text-navy-900">{l.balance.toFixed(1)}</div>
                    <div className="text-xs text-navy-400">of {l.total} days</div>
                    <div className="mt-2 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${l.color}`} style={{ width: `${Math.min(100, (l.balance / l.total) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save bar (for editable sections) */}
          {['basic', 'payrate', 'banking'].includes(section) && (
            <div className="flex justify-end gap-2">
              {saved && <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium"><Check size={15} /> Saved</span>}
              <button className="btn-primary" onClick={save}><Save size={14} /> Save Changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
