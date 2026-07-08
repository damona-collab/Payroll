import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Plus, Trash2, Download, Printer, Save, Check, X,
} from 'lucide-react'
import { usePayroll } from '../store/PayrollProvider.jsx'
import { COMPANY_INFO } from '../data/employees.js'
import { formatNAD, calculatePayroll } from '../utils/namibianTax.js'
import { downloadPayslipPDF } from '../utils/download.js'

const KIND_OPTIONS = [
  { value: 'earning',   label: 'Earning / Allowance' },
  { value: 'overtime',  label: 'Overtime' },
  { value: 'deduction', label: 'Deduction' },
]

export default function EmployeePayslip() {
  const { id, period: rawPeriod } = useParams()
  const period = decodeURIComponent(rawPeriod)
  const navigate = useNavigate()
  const { getEmployee, getPayslip, getAdjustments, setAdjustments } = usePayroll()

  const employee = getEmployee(id)
  const [draft, setDraft] = useState(() => getAdjustments(id, period))
  const [saved, setSaved] = useState(false)
  const [newItem, setNewItem] = useState({ kind: 'earning', label: '', amount: '' })

  if (!employee) {
    return (
      <div className="card p-10 text-center">
        <div className="text-navy-500">Employee not found.</div>
        <Link to="/employees" className="btn-secondary mt-4 inline-flex"><ArrowLeft size={14} /> Back</Link>
      </div>
    )
  }

  // Live payslip recomputed from the *draft* (unsaved) adjustments
  const p = (() => {
    const extraEarn = draft.filter(a => a.kind === 'earning').reduce((s, a) => s + Number(a.amount || 0), 0)
    const extraOt   = draft.filter(a => a.kind === 'overtime').reduce((s, a) => s + Number(a.amount || 0), 0)
    const extraDed  = draft.filter(a => a.kind === 'deduction').reduce((s, a) => s + Number(a.amount || 0), 0)
    const emp = employee
    return calculatePayroll({
      basicSalary: Number(emp.basicSalary || 0),
      allowances: Number(emp.allowances || 0) + extraEarn,
      housingAllowance: Number(emp.housingAllowance || 0),
      overtimePay: extraOt,
      fringeBenefits: Number(emp.fringeBenefits || 0),
      pensionEmployee: Number(emp.pensionEmployee || 0),
      pensionEmployer: Number(emp.pensionEmployer || 0),
      medicalAid: Number(emp.medicalAid || 0),
      medicalAidEmployer: Number(emp.medicalAidEmployer || 0),
      otherDeductions: Number(emp.otherDeductions || 0) + extraDed,
    })
  })()

  function addItem() {
    if (!newItem.label || !newItem.amount) return
    setDraft(d => [...d, { ...newItem, amount: Number(newItem.amount), id: Date.now() }])
    setNewItem({ kind: 'earning', label: '', amount: '' })
  }
  function removeItem(idx) {
    setDraft(d => d.filter((_, i) => i !== idx))
  }
  function save() {
    setAdjustments(id, period, draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  const dirty = JSON.stringify(draft) !== JSON.stringify(getAdjustments(id, period))

  const [month, year] = period.split(' ')

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 no-print">
        <button onClick={() => navigate(`/employees/${id}`)} className="btn-ghost px-2"><ArrowLeft size={16} /></button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-navy-900">Payslip — {period}</h1>
          <div className="text-sm text-navy-400">{employee.firstName} {employee.lastName} &bull; {employee.id}</div>
        </div>
        {saved && <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium"><Check size={15} /> Saved</span>}
        <button className="btn-secondary" onClick={() => window.print()}><Printer size={14} /> Print</button>
        <button className="btn-secondary" onClick={() => downloadPayslipPDF(p, employee, period, COMPANY_INFO)}><Download size={14} /> Download PDF</button>
        <button className={`btn-primary ${!dirty ? 'opacity-50' : ''}`} onClick={save} disabled={!dirty}><Save size={14} /> Save</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* The payslip document */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden shadow-lg" id="payslip-print">
            {/* Header */}
            <div className="bg-navy-900 px-8 py-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-gold-400 rounded-lg flex items-center justify-center">
                    <span className="text-navy-900 font-black text-lg">B</span>
                  </div>
                  <div>
                    <div className="text-cream-100 font-bold text-lg leading-tight">BluvoPay</div>
                    <div className="text-navy-400 text-xs">Payroll System</div>
                  </div>
                </div>
                <div className="text-navy-300 text-sm mt-2">{COMPANY_INFO.name}</div>
                <div className="text-navy-400 text-xs">{COMPANY_INFO.address}</div>
              </div>
              <div className="text-right">
                <div className="text-gold-400 font-bold text-xl uppercase tracking-wide">Payslip</div>
                <div className="text-cream-100 text-sm mt-1">{month} {year}</div>
                <div className="text-navy-300 text-xs mt-0.5">Pay Date: 25 {period}</div>
              </div>
            </div>

            {/* Employee band */}
            <div className="bg-cream-100 px-8 py-4 border-b border-cream-200 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-navy-400 uppercase tracking-wide mb-0.5">Employee</div>
                <div className="font-bold text-navy-900">{employee.firstName} {employee.lastName}</div>
                <div className="text-xs text-navy-500">{employee.jobTitle}</div>
              </div>
              <div>
                <div className="text-xs text-navy-400 uppercase tracking-wide mb-0.5">Employee No.</div>
                <div className="font-medium text-navy-900">{employee.id}</div>
                <div className="text-xs text-navy-500">Tax: {employee.taxNumber}</div>
              </div>
              <div>
                <div className="text-xs text-navy-400 uppercase tracking-wide mb-0.5">Department</div>
                <div className="font-medium text-navy-900">{employee.department}</div>
                <div className="text-xs text-navy-500">SSC: {employee.sscNumber || '—'}</div>
              </div>
            </div>

            {/* Earnings & deductions */}
            <div className="px-8 py-5 grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-bold text-navy-600 uppercase tracking-wider mb-3 pb-2 border-b border-cream-200">Earnings</div>
                {[
                  { label: 'Basic Salary', value: p.basicSalary },
                  p.allowances > 0 && { label: 'Allowances', value: p.allowances },
                  p.housingAllowance > 0 && { label: 'Housing Allowance', value: p.housingAllowance },
                  p.overtimePay > 0 && { label: 'Overtime', value: p.overtimePay },
                ].filter(Boolean).map(r => (
                  <div key={r.label} className="flex justify-between py-1.5 text-sm border-b border-cream-100 last:border-0">
                    <span className="text-navy-700">{r.label}</span>
                    <span className="tabular-nums font-medium">{formatNAD(r.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-1 border-t-2 border-navy-900 font-bold text-navy-900">
                  <span>Gross Salary</span><span className="tabular-nums">{formatNAD(p.grossSalary)}</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-navy-600 uppercase tracking-wider mb-3 pb-2 border-b border-cream-200">Deductions</div>
                {[
                  { label: 'PAYE', value: p.paye },
                  { label: 'SSC (Employee)', value: p.sscEmployee },
                  p.pensionEmployee > 0 && { label: 'Pension Fund', value: p.pensionEmployee },
                  p.medicalAid > 0 && { label: 'Medical Aid', value: p.medicalAid },
                  p.otherDeductions > 0 && { label: 'Other Deductions', value: p.otherDeductions },
                ].filter(Boolean).map(r => (
                  <div key={r.label} className="flex justify-between py-1.5 text-sm border-b border-cream-100 last:border-0">
                    <span className="text-navy-700">{r.label}</span>
                    <span className="tabular-nums font-medium text-red-600">{formatNAD(r.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-1 border-t-2 border-navy-900 font-bold text-navy-900">
                  <span>Total Deductions</span><span className="tabular-nums text-red-600">{formatNAD(p.totalDeductions)}</span>
                </div>
              </div>
            </div>

            {/* Net pay */}
            <div className="px-8 pb-6">
              <div className="bg-navy-900 rounded-xl px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="text-navy-300 text-xs uppercase tracking-wide">Net Pay</div>
                  <div className="text-navy-400 text-xs">Account ending ···{String(employee.accountNumber || '').slice(-4)}</div>
                </div>
                <div className="text-gold-400 font-black text-3xl tabular-nums">{formatNAD(p.netPay)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit panel */}
        <div className="lg:col-span-1 space-y-4 no-print">
          <div className="card p-5">
            <div className="section-title flex items-center gap-2"><Plus size={15} className="text-navy-600" /> Add Component</div>
            <div className="space-y-3">
              <div>
                <label className="label">Type</label>
                <select className="select" value={newItem.kind} onChange={e => setNewItem(n => ({ ...n, kind: e.target.value }))}>
                  {KIND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" placeholder="e.g. Performance Bonus" value={newItem.label} onChange={e => setNewItem(n => ({ ...n, label: e.target.value }))} />
              </div>
              <div>
                <label className="label">Amount (N$)</label>
                <input type="number" className="input" placeholder="0.00" value={newItem.amount} onChange={e => setNewItem(n => ({ ...n, amount: e.target.value }))} />
              </div>
              <button className="btn-primary w-full justify-center" onClick={addItem}><Plus size={14} /> Add to Payslip</button>
            </div>
          </div>

          {/* Current adjustments */}
          <div className="card p-5">
            <div className="section-title">This Month's Adjustments</div>
            {draft.length === 0 && <div className="text-sm text-navy-400">No once-off components added.</div>}
            <div className="space-y-2">
              {draft.map((a, i) => (
                <div key={a.id ?? i} className="flex items-center gap-2 bg-cream-100 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-900 truncate">{a.label}</div>
                    <div className="text-xs text-navy-400 capitalize">{a.kind}</div>
                  </div>
                  <span className={`tabular-nums text-sm font-medium ${a.kind === 'deduction' ? 'text-red-600' : 'text-emerald-700'}`}>
                    {a.kind === 'deduction' ? '−' : '+'}{formatNAD(a.amount)}
                  </span>
                  <button onClick={() => removeItem(i)} className="p-1 text-navy-400 hover:text-red-600 rounded"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            {dirty && (
              <button className="btn-primary w-full justify-center mt-3" onClick={save}><Save size={14} /> Save Changes</button>
            )}
          </div>

          {/* Income perspectives */}
          <div className="card p-5">
            <div className="section-title">Income Perspectives</div>
            <div className="space-y-1.5">
              {Object.values(p.incomeStreams).map(s => (
                <div key={s.code} className="flex justify-between text-sm">
                  <span className="text-navy-600">{s.label} <span className="text-[10px] font-mono text-navy-400">{s.code}</span></span>
                  <span className="tabular-nums font-medium text-navy-900">{formatNAD(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
