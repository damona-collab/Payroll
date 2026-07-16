import React, { useState } from 'react'
import {
  Settings, Check, X, Shield, Percent, Landmark,
  Gift, MinusCircle, PlusCircle, CalendarDays, Lock, Building2,
} from 'lucide-react'
import {
  EARNINGS, ALLOWANCES, DEDUCTIONS, EMPLOYER_CONTRIBUTIONS,
  FRINGE_BENEFITS, PUBLIC_HOLIDAYS_2026,
} from '../data/payComponents.js'
import { COMPANY_INFO } from '../data/employees.js'
import {
  SSC_RATE, SSC_MAX_MONTHLY, SSC_CEILING, VET_RATE,
  WC_RATE, WC_EARNINGS_CEILING_ANNUAL, formatNAD,
} from '../utils/namibianTax.js'

function Flag({ value }) {
  if (value === 'partial') return <span className="badge badge-yellow">Partial</span>
  return value
    ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100"><Check size={12} className="text-emerald-700" /></span>
    : <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cream-200"><X size={12} className="text-navy-400" /></span>
}

function AllocationBadge({ value }) {
  const map = { statutory: 'badge-red', automatic: 'badge-navy', manual: 'badge-blue' }
  return <span className={`badge ${map[value] || ''} capitalize`}>{value}</span>
}

const TABS = [
  { id: 'company',     label: 'Company',         icon: Building2 },
  { id: 'earnings',    label: 'Earnings',        icon: PlusCircle },
  { id: 'allowances',  label: 'Allowances',      icon: Gift },
  { id: 'deductions',  label: 'Deductions',      icon: MinusCircle },
  { id: 'employer',    label: 'Employer Contributions', icon: Landmark },
  { id: 'fringe',      label: 'Fringe Benefits', icon: Percent },
  { id: 'statutory',   label: 'Statutory Rates', icon: Shield },
  { id: 'holidays',    label: 'Public Holidays', icon: CalendarDays },
]

// Read-only field display used on the Company tab
function Field({ label, value, required }) {
  return (
    <div className="bg-cream-100 rounded-xl p-3">
      <div className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</div>
      <div className="text-sm font-medium text-navy-900 truncate">{value || '—'}</div>
    </div>
  )
}

export default function Configuration() {
  const [tab, setTab] = useState('company')

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="card p-4 border-l-4 border-navy-900 bg-navy-50 flex items-start gap-3">
        <Settings size={16} className="text-navy-600 mt-0.5 shrink-0" />
        <div className="text-sm text-navy-700">
          <span className="font-bold text-navy-900">Payroll Component Architecture.</span>{' '}
          Every pay component carries statutory inclusion flags (PAYE / SSC / WC / Pension), an allocation
          type, and a package indicator — per the Katelago Payroll Configuration Checklist. Statutory
          components are locked <Lock size={11} className="inline text-navy-400" /> and cannot be removed.
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-1 flex gap-1 flex-wrap w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-navy-900 text-cream-100' : 'text-navy-600 hover:bg-cream-100'
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Company — Basic Company Information */}
      {tab === 'company' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-cream-200 bg-cream-50 flex items-center gap-2">
              <Building2 size={15} className="text-navy-600" />
              <span className="text-sm font-semibold text-navy-900">Company Details</span>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Company Name" value={COMPANY_INFO.name} required />
              <Field label="Trading Name" value={COMPANY_INFO.name} />
              <Field label="Registration Number" value={COMPANY_INFO.registrationNumber} required />
              <Field label="Tax Authority" value="Namibia (NamRA)" required />
              <Field label="Tax Number" value={COMPANY_INFO.taxNumber} required />
              <Field label="VAT Number" value={COMPANY_INFO.vatNumber} />
              <Field label="Financial Year End" value="February" />
              <Field label="Pay Frequency" value={COMPANY_INFO.payPeriod} />
              <Field label="Pay Date" value={`${COMPANY_INFO.payDate}th of month`} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Statutory registration */}
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-cream-200 bg-cream-50 flex items-center gap-2">
                <Shield size={15} className="text-navy-600" />
                <span className="text-sm font-semibold text-navy-900">Statutory Registration</span>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <Field label="Employer SSC Number" value={COMPANY_INFO.sscEmployerNumber} required />
                <Field label="Employer VET Levy Number" value="Exempt (< N$1m payroll)" />
                <Field label="WC Employer Sector" value="Info & Communication Technology" />
                <Field label="WC Voluntary Cover" value="No" />
                <Field label="Show emp. no. on ITAS" value="Yes" />
                <Field label="SSC After Termination" value="Calculate" />
              </div>
            </div>

            {/* Address + contact */}
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-cream-200 bg-cream-50 flex items-center gap-2">
                <Landmark size={15} className="text-navy-600" />
                <span className="text-sm font-semibold text-navy-900">Address &amp; Contact</span>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div className="col-span-2"><Field label="Physical Address" value={COMPANY_INFO.address} /></div>
                <Field label="City" value="Windhoek" />
                <Field label="Province" value="Khomas" />
                <Field label="Telephone" value={COMPANY_INFO.phone} />
                <Field label="Email" value={COMPANY_INFO.email} />
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-cream-200 bg-cream-50 flex items-center gap-2">
              <Percent size={15} className="text-navy-600" />
              <span className="text-sm font-semibold text-navy-900">Company Theme</span>
            </div>
            <div className="p-5 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-navy-900 border border-cream-300" />
                <div className="text-sm">
                  <div className="text-navy-900 font-medium">Primary Colour</div>
                  <div className="text-navy-400 text-xs font-mono">#0f2557 Navy</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gold-400 border border-cream-300" />
                <div className="text-sm">
                  <div className="text-navy-900 font-medium">Accent Colour</div>
                  <div className="text-navy-400 text-xs font-mono">#d4a843 Gold</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-cream-100 border border-cream-300" />
                <div className="text-sm">
                  <div className="text-navy-900 font-medium">Background</div>
                  <div className="text-navy-400 text-xs font-mono">#faf6ef Cream</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earnings & Allowances share the flag-table layout */}
      {(tab === 'earnings' || tab === 'allowances') && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50">
                  <th className="table-header">Code</th>
                  <th className="table-header">Component</th>
                  <th className="table-header text-center">PAYE</th>
                  <th className="table-header text-center">SSC</th>
                  <th className="table-header text-center">WC</th>
                  <th className="table-header text-center">Pension</th>
                  <th className="table-header">Allocation</th>
                  <th className="table-header text-center">In Package</th>
                  <th className="table-header">Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {(tab === 'earnings' ? EARNINGS : ALLOWANCES).map(c => (
                  <tr key={c.code} className="hover:bg-cream-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-navy-500">{c.code}</td>
                    <td className="table-cell font-medium text-navy-900">
                      {c.name}
                      {c.note && <div className="text-xs text-navy-400 font-normal">{c.note}</div>}
                    </td>
                    <td className="table-cell text-center"><Flag value={c.paye} /></td>
                    <td className="table-cell text-center"><Flag value={c.ssc} /></td>
                    <td className="table-cell text-center"><Flag value={c.wc} /></td>
                    <td className="table-cell text-center"><Flag value={c.pension} /></td>
                    <td className="table-cell"><AllocationBadge value={c.allocation} /></td>
                    <td className="table-cell text-center"><Flag value={c.inPackage} /></td>
                    <td className="table-cell text-xs text-navy-500">{c.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'deductions' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50">
                  <th className="table-header">Code</th>
                  <th className="table-header">Deduction</th>
                  <th className="table-header">Category</th>
                  <th className="table-header text-center">Priority</th>
                  <th className="table-header">Allocation</th>
                  <th className="table-header text-center">Balance Tracked</th>
                  <th className="table-header text-center">Consent Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {DEDUCTIONS.map(d => (
                  <tr key={d.code} className="hover:bg-cream-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-navy-500">{d.code}</td>
                    <td className="table-cell font-medium text-navy-900">
                      {d.name}
                      {d.category === 'Statutory' && <Lock size={11} className="inline ml-1.5 text-navy-400" />}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        d.category === 'Statutory' ? 'badge-red' :
                        d.category === 'Contractual' ? 'badge-navy' : 'badge-blue'
                      }`}>{d.category}</span>
                    </td>
                    <td className="table-cell text-center font-bold text-navy-700">{d.priority}</td>
                    <td className="table-cell"><AllocationBadge value={d.allocation} /></td>
                    <td className="table-cell text-center"><Flag value={!!d.trackBalance} /></td>
                    <td className="table-cell text-center"><Flag value={!!d.requiresConsent} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-cream-50 border-t border-cream-200 text-xs text-navy-500">
            Deductions apply in priority order (1 = statutory first). Net-pay protection automatically
            reduces or skips priority-3 voluntary deductions that would result in negative net pay.
            Non-statutory deductions require recorded employee consent (Labour Act s.12–13).
          </div>
        </div>
      )}

      {tab === 'employer' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50">
                <th className="table-header">Code</th>
                <th className="table-header">Contribution</th>
                <th className="table-header">Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {EMPLOYER_CONTRIBUTIONS.map(c => (
                <tr key={c.code} className="hover:bg-cream-50 transition-colors">
                  <td className="table-cell font-mono text-xs text-navy-500">{c.code}</td>
                  <td className="table-cell font-medium text-navy-900">{c.name}</td>
                  <td className="table-cell text-sm text-navy-600">{c.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-cream-50 border-t border-cream-200 text-xs text-navy-500">
            Employer contributions are posted to the employee's cost centre, appear in the payroll
            register, and are kept separate from employee net pay.
          </div>
        </div>
      )}

      {tab === 'fringe' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-200 bg-cream-50">
                  <th className="table-header">Code</th>
                  <th className="table-header">Fringe Benefit</th>
                  <th className="table-header">Calculation Basis</th>
                  <th className="table-header text-center">Taxable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {FRINGE_BENEFITS.map(f => (
                  <tr key={f.code} className="hover:bg-cream-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-navy-500">{f.code}</td>
                    <td className="table-cell font-medium text-navy-900">{f.name}</td>
                    <td className="table-cell text-sm text-navy-600">{f.calc}</td>
                    <td className="table-cell text-center"><Flag value={f.paye} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card p-4 border-l-4 border-gold-400 bg-cream-50 text-sm text-navy-700">
            <strong className="text-navy-900">Notional values:</strong> fringe benefits are added to
            taxable income for PAYE purposes but do <em>not</em> affect cash pay. They are reported
            separately from cash earnings on the payslip and in the payroll register.
          </div>
        </div>
      )}

      {tab === 'statutory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'PAYE — Income Tax Act 24 of 1981 (2026/2027)',
              rows: [
                ['Tax-free threshold', 'N$100,000 p.a.'],
                ['Marginal rates', '18% – 37% (7 brackets)'],
                ['Top bracket', 'N$1,550,001+ (37%)'],
                ['Remittance deadline', '20th of following month (NamRA)'],
              ],
            },
            {
              title: 'Social Security — SS Act 34 of 1994',
              rows: [
                ['Employee rate', `${(SSC_RATE * 100).toFixed(1)}% of basic`],
                ['Employer rate', `${(SSC_RATE * 100).toFixed(1)}% of basic`],
                ['Monthly cap (each)', formatNAD(SSC_MAX_MONTHLY)],
                ['Earnings ceiling', `${formatNAD(SSC_CEILING)} / month`],
              ],
            },
            {
              title: "Workmen's Compensation — Act 30 of 1941",
              rows: [
                ['Assessment rate', `${(WC_RATE * 100).toFixed(1)}% (industry risk class)`],
                ['Earnings ceiling', `${formatNAD(WC_EARNINGS_CEILING_ANNUAL, 0)} p.a.`],
                ['Above ceiling', 'Employee excluded from WC cover'],
                ['Paid by', 'Employer only'],
              ],
            },
            {
              title: 'VET Levy — VET Act 1 of 2008',
              rows: [
                ['Rate', `${(VET_RATE * 100).toFixed(0)}% of payroll`],
                ['Threshold', 'Employers with payroll > N$1,000,000 p.a.'],
                ['Paid by', 'Employer only'],
                ['Remitted to', 'Namibia Training Authority (NTA)'],
              ],
            },
          ].map(card => (
            <div key={card.title} className="card p-5">
              <div className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <Shield size={15} className="text-navy-600" /> {card.title}
              </div>
              <div className="space-y-2">
                {card.rows.map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm border-b border-cream-100 pb-1.5 last:border-0">
                    <span className="text-navy-500">{k}</span>
                    <span className="font-medium text-navy-900 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'holidays' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-cream-200 bg-cream-50 flex items-center justify-between">
            <div className="text-sm font-semibold text-navy-900">Namibian Public Holidays — 2026</div>
            <span className="badge badge-navy">{PUBLIC_HOLIDAYS_2026.length} days</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-200">
                <th className="table-header">Date</th>
                <th className="table-header">Day</th>
                <th className="table-header">Holiday</th>
                <th className="table-header">Pay Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {PUBLIC_HOLIDAYS_2026.map(h => {
                const d = new Date(h.date + 'T00:00:00')
                return (
                  <tr key={h.date + h.name} className="hover:bg-cream-50 transition-colors">
                    <td className="table-cell tabular-nums">
                      {d.toLocaleDateString('en-NA', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="table-cell text-navy-500">
                      {d.toLocaleDateString('en-NA', { weekday: 'long' })}
                    </td>
                    <td className="table-cell font-medium text-navy-900">{h.name}</td>
                    <td className="table-cell">
                      <span className="badge badge-blue">Work = 2× pay</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-cream-50 border-t border-cream-200 text-xs text-navy-500">
            Employees who work on a public holiday are paid at double rate (Labour Act s.22).
            Sunday + public holiday overlaps apply the higher rate, not both.
          </div>
        </div>
      )}
    </div>
  )
}
