import React, { useState } from 'react'
import {
  Play, Check, Download, AlertCircle, ChevronDown,
  ChevronUp, RefreshCw, CheckCircle2, Circle,
} from 'lucide-react'
import { employees } from '../data/employees.js'
import { formatNAD, calculatePayroll, validateEmployeeForPayroll } from '../utils/namibianTax.js'

const PERIODS = [
  'July 2026', 'June 2026', 'May 2026', 'April 2026',
  'March 2026', 'February 2026',
]

const STEPS = [
  { id: 1, label: 'Select Pay Period',       desc: 'Choose the payroll month' },
  { id: 2, label: 'Validate & Review',       desc: 'Pre-payroll validation, records and adjustments' },
  { id: 3, label: 'Calculate & Verify',      desc: 'Run calculations and approve figures' },
  { id: 4, label: 'Approve & Process',       desc: 'Finalise, lock period, generate payslips' },
]

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              current > step.id ? 'bg-emerald-500 text-white' :
              current === step.id ? 'bg-navy-900 text-cream-100' :
              'bg-cream-200 text-navy-400'
            }`}>
              {current > step.id ? <Check size={14} /> : step.id}
            </div>
            <div className="hidden md:block">
              <div className={`text-xs font-semibold ${current >= step.id ? 'text-navy-900' : 'text-navy-400'}`}>
                {step.label}
              </div>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${current > step.id ? 'bg-emerald-500' : 'bg-cream-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function PayrollTable({ data, adjustments, onAdjust }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-cream-200 bg-cream-50">
            <th className="table-header">Employee</th>
            <th className="table-header text-right">Basic</th>
            <th className="table-header text-right">Allow.</th>
            <th className="table-header text-right">Gross</th>
            <th className="table-header text-right">PAYE</th>
            <th className="table-header text-right">SSC</th>
            <th className="table-header text-right">Pension</th>
            <th className="table-header text-right">Net Pay</th>
            <th className="table-header text-center">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-100">
          {data.map(row => {
            const adj = adjustments[row.id] || {}
            const calc = calculatePayroll({
              basicSalary: row.basicSalary + (adj.basicAdj || 0),
              allowances: row.allowances + (adj.allowAdj || 0),
              housingAllowance: row.housingAllowance,
              fringeBenefits: row.fringeBenefits,
              pensionEmployee: row.pensionEmployee,
              pensionEmployer: row.pensionEmployer,
              medicalAid: row.medicalAid,
              medicalAidEmployer: row.medicalAidEmployer,
              otherDeductions: row.otherDeductions,
            })
            const isExpanded = expanded === row.id

            return (
              <React.Fragment key={row.id}>
                <tr className="hover:bg-cream-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-cream-100 text-xs font-bold">{row.firstName[0]}{row.lastName[0]}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-navy-900">{row.firstName} {row.lastName}</div>
                        <div className="text-xs text-navy-400">{row.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-right tabular-nums text-sm">
                    {formatNAD(row.basicSalary + (adj.basicAdj || 0))}
                  </td>
                  <td className="table-cell text-right tabular-nums text-sm">
                    {formatNAD(row.allowances + (adj.allowAdj || 0) + row.housingAllowance)}
                  </td>
                  <td className="table-cell text-right tabular-nums text-sm font-semibold">
                    {formatNAD(calc.grossSalary)}
                  </td>
                  <td className="table-cell text-right tabular-nums text-sm text-red-600">
                    {formatNAD(calc.paye)}
                  </td>
                  <td className="table-cell text-right tabular-nums text-sm text-red-500">
                    {formatNAD(calc.sscEmployee)}
                  </td>
                  <td className="table-cell text-right tabular-nums text-sm text-red-500">
                    {formatNAD(row.pensionEmployee)}
                  </td>
                  <td className="table-cell text-right tabular-nums text-sm font-bold text-emerald-700">
                    {formatNAD(calc.netPay)}
                  </td>
                  <td className="table-cell text-center">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : row.id)}
                      className="p-1 text-navy-400 hover:text-navy-700 hover:bg-cream-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-cream-50">
                    <td colSpan={9} className="px-6 py-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Adjustments */}
                        <div>
                          <div className="label mb-2">Salary Adjustment (N$)</div>
                          <input
                            type="number"
                            className="input"
                            placeholder="0.00"
                            value={adj.basicAdj || ''}
                            onChange={e => onAdjust(row.id, 'basicAdj', parseFloat(e.target.value) || 0)}
                          />
                          <div className="text-xs text-navy-400 mt-1">Bonus / overtime / deduction</div>
                        </div>
                        <div>
                          <div className="label mb-2">Allowance Adjustment (N$)</div>
                          <input
                            type="number"
                            className="input"
                            placeholder="0.00"
                            value={adj.allowAdj || ''}
                            onChange={e => onAdjust(row.id, 'allowAdj', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        {/* Tax details */}
                        <div className="bg-white rounded-lg p-3 border border-cream-200">
                          <div className="label mb-2">Tax Breakdown</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-navy-500">Taxable Income</span>
                              <span className="font-medium">{formatNAD(calc.taxableIncome)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-navy-500">Annual Tax</span>
                              <span className="font-medium">{formatNAD(calc.paye * 12)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-navy-500">Effective Rate</span>
                              <span className="font-medium">{calc.effectiveTaxRate}%</span>
                            </div>
                          </div>
                        </div>
                        {/* Employer cost */}
                        <div className="bg-navy-900 rounded-lg p-3">
                          <div className="text-xs font-bold text-navy-300 uppercase tracking-wide mb-2">Employer Cost</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-navy-300">Gross</span>
                              <span className="text-cream-100 font-medium">{formatNAD(calc.grossSalary)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-navy-300">SSC (Employer)</span>
                              <span className="text-cream-100 font-medium">{formatNAD(calc.sscEmployer)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-navy-300">VET Levy</span>
                              <span className="text-cream-100 font-medium">{formatNAD(calc.vetLevy)}</span>
                            </div>
                            <div className="flex justify-between border-t border-navy-700 pt-1 mt-1">
                              <span className="text-gold-400 font-semibold">Total Cost</span>
                              <span className="text-gold-400 font-bold">{formatNAD(calc.totalEmployerCost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function PayrollRun() {
  const [step, setStep] = useState(1)
  const [period, setPeriod] = useState(PERIODS[0])
  const [adjustments, setAdjustments] = useState({})
  const [processed, setProcessed] = useState(false)

  function handleAdjust(empId, field, value) {
    setAdjustments(prev => ({
      ...prev,
      [empId]: { ...prev[empId], [field]: value },
    }))
  }

  // Pre-payroll validation: employees with missing statutory fields are
  // excluded from the run ("No payroll run may proceed if mandatory
  // statutory fields are missing").
  const validation = employees.map(emp => ({
    emp,
    errors: validateEmployeeForPayroll(emp),
  }))
  const validEmployees = validation.filter(v => v.errors.length === 0).map(v => v.emp)
  const blocked = validation.filter(v => v.errors.length > 0)

  const totals = validEmployees.reduce((acc, emp) => {
    const adj = adjustments[emp.id] || {}
    const calc = calculatePayroll({
      basicSalary: emp.basicSalary + (adj.basicAdj || 0),
      allowances: emp.allowances + (adj.allowAdj || 0),
      housingAllowance: emp.housingAllowance,
      fringeBenefits: emp.fringeBenefits,
      pensionEmployee: emp.pensionEmployee,
      pensionEmployer: emp.pensionEmployer,
      medicalAid: emp.medicalAid,
      medicalAidEmployer: emp.medicalAidEmployer,
      otherDeductions: emp.otherDeductions,
    })
    return {
      gross: acc.gross + calc.grossSalary,
      paye: acc.paye + calc.paye,
      sscEmp: acc.sscEmp + calc.sscEmployee,
      sscEmr: acc.sscEmr + calc.sscEmployer,
      pension: acc.pension + emp.pensionEmployee,
      medical: acc.medical + emp.medicalAid,
      net: acc.net + calc.netPay,
      vet: acc.vet + calc.vetLevy,
      wc: acc.wc + calc.wcAssessment,
      total: acc.total + calc.totalEmployerCost,
    }
  }, { gross: 0, paye: 0, sscEmp: 0, sscEmr: 0, pension: 0, medical: 0, net: 0, vet: 0, wc: 0, total: 0 })

  return (
    <div className="space-y-5">
      {/* Steps */}
      <div className="card p-5">
        <StepIndicator steps={STEPS} current={step} />
      </div>

      {/* Step 1 — Select period */}
      {step === 1 && (
        <div className="card p-6 max-w-xl">
          <div className="section-title">Select Pay Period</div>
          <p className="text-sm text-navy-500 mb-5">
            Choose the payroll period to process. Ensure all employee records are up to date before proceeding.
          </p>
          <div className="space-y-4">
            <div>
              <label className="label">Pay Period</label>
              <select
                className="select"
                value={period}
                onChange={e => setPeriod(e.target.value)}
              >
                {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="bg-cream-100 border border-cream-200 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-500">Pay Date</span>
                <span className="font-medium text-navy-900">25 {period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Employees</span>
                <span className="font-medium text-navy-900">{employees.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">PAYE Deadline</span>
                <span className="font-medium text-red-600">20th of following month</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button className="btn-primary" onClick={() => setStep(2)}>
              <Play size={14} /> Start Payroll Run
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Validate & Review */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-navy-900">Validate & Review — {period}</h2>
              <p className="text-xs text-navy-400 mt-0.5">Expand rows to add adjustments (bonus, overtime, deductions)</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={validEmployees.length === 0}
                onClick={() => setStep(3)}
              >
                Calculate <Play size={14} />
              </button>
            </div>
          </div>

          {/* Pre-payroll validation results */}
          {blocked.length > 0 ? (
            <div className="card p-4 border-l-4 border-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-800">
                    {blocked.length} employee{blocked.length > 1 ? 's' : ''} excluded — mandatory statutory fields missing
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {blocked.map(({ emp, errors }) => (
                      <div key={emp.id} className="text-sm text-red-700">
                        <span className="font-medium">{emp.firstName} {emp.lastName} ({emp.id})</span>
                        <span className="text-red-500"> — {errors.join('; ')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-red-500 mt-2">
                    Per configuration policy, no employee may be paid without a complete statutory profile.
                    Update the employee master data to include them in this run.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-3 border-l-4 border-emerald-500 bg-emerald-50 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span className="text-sm text-emerald-800 font-medium">
                Pre-payroll validation passed — all {validEmployees.length} employees have complete statutory profiles.
              </span>
            </div>
          )}

          <div className="card overflow-hidden">
            <PayrollTable
              data={validEmployees}
              adjustments={adjustments}
              onAdjust={handleAdjust}
            />
          </div>
        </div>
      )}

      {/* Step 3 — Verify */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-navy-900">Payroll Summary — {period}</h2>
              <p className="text-xs text-navy-400 mt-0.5">Verify all figures before final approval</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => setStep(2)}>Back</button>
              <button className="btn-primary" onClick={() => setStep(4)}>
                Approve <Check size={14} />
              </button>
            </div>
          </div>

          {/* Totals card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="section-title">Employee Deductions Summary</div>
              <div className="space-y-2">
                {[
                  { label: 'Total Gross Salaries', value: totals.gross, type: 'earning' },
                  { label: 'Total PAYE (Tax)',      value: totals.paye,  type: 'deduction' },
                  { label: 'Total SSC (Employee)',  value: totals.sscEmp, type: 'deduction' },
                  { label: 'Total Pension',         value: totals.pension, type: 'deduction' },
                  { label: 'Total Medical Aid',     value: totals.medical, type: 'deduction' },
                  { label: 'Net Pay to Employees',  value: totals.net,  type: 'net' },
                ].map(r => (
                  <div key={r.label} className={`flex justify-between text-sm py-1 ${r.type === 'net' ? 'border-t-2 border-navy-900 font-bold text-navy-900 mt-1 pt-2' : r.type === 'earning' ? 'text-navy-700' : 'text-navy-500'}`}>
                    <span>{r.label}</span>
                    <span className={`tabular-nums ${r.type === 'deduction' ? 'text-red-600' : r.type === 'net' ? 'text-emerald-700 text-base' : 'text-navy-900 font-semibold'}`}>
                      {formatNAD(r.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <div className="section-title">Statutory Remittances</div>
              <div className="space-y-2">
                {[
                  { label: 'PAYE — Due NamRA by 20th',   value: totals.paye,   authority: 'NamRA' },
                  { label: 'SSC Employee Contributions',  value: totals.sscEmp, authority: 'SSC' },
                  { label: 'SSC Employer Contributions',  value: totals.sscEmr, authority: 'SSC' },
                  { label: 'VET Levy (Employer 1%)',      value: totals.vet,    authority: 'NTA' },
                  { label: "Workmen's Compensation",      value: totals.wc,     authority: 'WC' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-cream-100 last:border-0">
                    <div>
                      <div className="text-sm text-navy-800">{r.label}</div>
                      <span className="badge badge-blue text-[10px]">{r.authority}</span>
                    </div>
                    <span className="tabular-nums text-sm font-semibold text-red-600">{formatNAD(r.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t-2 border-navy-900 font-bold text-navy-900 text-sm">
                  <span>Total Employer Cost</span>
                  <span className="tabular-nums text-base">{formatNAD(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="card p-4 border-l-4 border-amber-400 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-amber-800">Pre-Approval Checklist</div>
                <ul className="mt-2 space-y-1 text-sm text-amber-700">
                  <li className="flex items-center gap-2"><Check size={12} /> Pre-payroll validation passed (SSC + tax reference present)</li>
                  <li className="flex items-center gap-2"><Check size={12} /> All employee banking details verified</li>
                  <li className="flex items-center gap-2"><Check size={12} /> PAYE calculations align with NamRA tax tables 2026/2027</li>
                  <li className="flex items-center gap-2"><Check size={12} /> SSC contributions within statutory cap (N$81/month)</li>
                  <li className="flex items-center gap-2"><Check size={12} /> Net-pay protection applied — no negative net pay</li>
                  <li className="flex items-center gap-2"><Check size={12} /> Payroll approved by Finance Manager — period will be locked on processing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — Approved */}
      {step === 4 && (
        <div className="space-y-4">
          {!processed ? (
            <div className="card p-10 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play size={28} className="text-gold-400" />
              </div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Ready to Process</h2>
              <p className="text-sm text-navy-500 mb-6">
                Payroll for <strong>{period}</strong> is approved and ready to be processed.
                This will generate payslips and bank payment files, and the period will be
                <strong> locked</strong> — no further edits without an audited retro adjustment.
              </p>
              <button className="btn-primary mx-auto" onClick={() => setProcessed(true)}>
                <RefreshCw size={15} /> Process Payroll
              </button>
            </div>
          ) : (
            <div className="card p-10 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-navy-900 mb-2">Payroll Processed &amp; Period Locked</h2>
              <p className="text-sm text-navy-500 mb-6">
                <strong>{period}</strong> payroll has been successfully processed —
                {' '}{validEmployees.length} payslips generated, bank payment file ready,
                and the period is now locked with a full audit trail.
              </p>
              <div className="flex gap-2 justify-center">
                <button className="btn-secondary"><Download size={14} /> Bank File</button>
                <button className="btn-primary"><Download size={14} /> Payslips</button>
              </div>
              <button
                className="mt-4 text-sm text-navy-400 hover:text-navy-700 underline"
                onClick={() => { setStep(1); setProcessed(false); setAdjustments({}) }}
              >
                Start New Payroll Run
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
