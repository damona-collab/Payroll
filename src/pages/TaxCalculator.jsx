import React, { useState, useMemo } from 'react'
import { Calculator, Info, TrendingUp, RefreshCw } from 'lucide-react'
import {
  TAX_BRACKETS, calculateMonthlyPAYE, calculateSSC,
  calculatePayroll, formatNAD,
} from '../utils/namibianTax.js'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

function BracketBar({ bracket, annualIncome }) {
  const inBracket = annualIncome > bracket.min
  const amount = inBracket
    ? Math.min(annualIncome, bracket.max === Infinity ? annualIncome : bracket.max) - bracket.min
    : 0
  const pct = bracket.max === Infinity ? 100 : ((bracket.max - bracket.min) / 1500000) * 100

  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
      inBracket && annualIncome <= (bracket.max === Infinity ? Infinity : bracket.max)
        ? 'bg-navy-900 text-cream-100'
        : inBracket ? 'bg-navy-100 text-navy-700' : 'bg-cream-50 text-navy-400'
    }`}>
      <div className="w-24 text-xs font-medium shrink-0">{(bracket.rate * 100).toFixed(0)}%</div>
      <div className="flex-1">
        <div className="text-xs mb-1 truncate">{bracket.label}</div>
        <div className="h-1.5 bg-current opacity-20 rounded-full overflow-hidden">
          <div
            className="h-full bg-current opacity-80 rounded-full"
            style={{ width: `${Math.min(100, (amount / Math.max(1, bracket.max === Infinity ? annualIncome : bracket.max - bracket.min)) * 100)}%` }}
          />
        </div>
      </div>
      {inBracket && amount > 0 && (
        <div className="text-xs font-medium shrink-0 tabular-nums">
          {formatNAD(amount * bracket.rate)}
        </div>
      )}
    </div>
  )
}

export default function TaxCalculator() {
  const [form, setForm] = useState({
    basicSalary: 25000,
    allowances: 2000,
    housingAllowance: 3000,
    pensionEmployee: 2500,
    medicalAid: 1500,
    otherDeductions: 0,
  })

  const result = useMemo(() => calculatePayroll(form), [form])
  const annualIncome = result.grossSalary * 12
  const annualTaxable = result.taxableIncome * 12

  function update(field) {
    return e => setForm(f => ({ ...f, [field]: parseFloat(e.target.value) || 0 }))
  }

  function reset() {
    setForm({ basicSalary: 25000, allowances: 2000, housingAllowance: 3000, pensionEmployee: 2500, medicalAid: 1500, otherDeductions: 0 })
  }

  // Monthly breakdown for chart
  const breakdown = [
    { name: 'Net Pay',   value: result.netPay,            fill: '#0f2557' },
    { name: 'PAYE',      value: result.paye,              fill: '#c9a84c' },
    { name: 'Pension',   value: result.pensionEmployee,   fill: '#5878b4' },
    { name: 'Med. Aid',  value: result.medicalAid,        fill: '#9eb0d3' },
    { name: 'SSC',       value: result.sscEmployee,       fill: '#7790c1' },
    { name: 'Other',     value: result.otherDeductions,   fill: '#c5d0e5' },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inputs */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-navy-600" />
              <div className="text-base font-semibold text-navy-900">Income Details</div>
            </div>
            <button onClick={reset} className="btn-ghost text-xs"><RefreshCw size={12} /> Reset</button>
          </div>

          <div>
            <div className="label">Basic Salary (N$)</div>
            <input type="number" className="input" value={form.basicSalary} onChange={update('basicSalary')} min={0} step={500} />
          </div>
          <div>
            <div className="label">Taxable Allowances (N$)</div>
            <input type="number" className="input" value={form.allowances} onChange={update('allowances')} min={0} step={100} />
          </div>
          <div>
            <div className="label">Housing Allowance (N$)</div>
            <input type="number" className="input" value={form.housingAllowance} onChange={update('housingAllowance')} min={0} step={100} />
          </div>

          <div className="border-t border-cream-200 pt-4">
            <div className="text-xs font-bold text-navy-600 uppercase tracking-wide mb-3">Deductions</div>
            <div className="space-y-3">
              <div>
                <div className="label">Pension Contribution (N$) <span className="text-navy-400 normal-case font-normal">— tax deductible</span></div>
                <input type="number" className="input" value={form.pensionEmployee} onChange={update('pensionEmployee')} min={0} step={100} />
              </div>
              <div>
                <div className="label">Medical Aid (N$)</div>
                <input type="number" className="input" value={form.medicalAid} onChange={update('medicalAid')} min={0} step={100} />
              </div>
              <div>
                <div className="label">Other Deductions (N$)</div>
                <input type="number" className="input" value={form.otherDeductions} onChange={update('otherDeductions')} min={0} step={100} />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Net pay hero */}
          <div className="card bg-navy-900 p-6">
            <div className="text-navy-400 text-sm mb-1">Monthly Net Pay</div>
            <div className="text-gold-400 font-black text-4xl tabular-nums mb-3">{formatNAD(result.netPay)}</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Gross',       value: result.grossSalary },
                { label: 'PAYE',        value: result.paye },
                { label: 'Eff. Rate',   value: `${result.effectiveTaxRate}%`, isText: true },
              ].map(f => (
                <div key={f.label} className="bg-white/10 rounded-xl p-3 text-center">
                  <div className="text-navy-300 text-xs mb-0.5">{f.label}</div>
                  <div className="text-cream-100 font-bold text-sm">
                    {f.isText ? f.value : formatNAD(f.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown chart */}
          <div className="card p-5">
            <div className="text-sm font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <TrendingUp size={15} className="text-navy-600" /> Monthly Salary Breakdown
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={breakdown} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5d0b5" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9eb0d3' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `N$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#234188' }} axisLine={false} tickLine={false} width={56} />
                <Tooltip
                  formatter={(v) => [formatNAD(v), '']}
                  contentStyle={{ background: '#0f2557', border: 'none', borderRadius: 10, color: '#faf6ef', fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {breakdown.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Full breakdown table */}
          <div className="card p-5">
            <div className="text-sm font-semibold text-navy-900 mb-3">Full Calculation</div>
            <div className="space-y-1.5 text-sm">
              {[
                { label: 'Basic Salary',       value: result.basicSalary,      type: 'earn' },
                { label: 'Allowances',         value: result.allowances,       type: 'earn' },
                { label: 'Housing Allowance',  value: result.housingAllowance, type: 'earn' },
                { label: 'Gross Salary',       value: result.grossSalary,      type: 'sub' },
                { label: 'Pension Deduction',  value: -result.pensionDeductible, type: 'ded' },
                { label: 'Taxable Income',     value: result.taxableIncome,    type: 'sub' },
                { label: 'PAYE',               value: -result.paye,            type: 'ded' },
                { label: 'SSC (Employee)',      value: -result.sscEmployee,     type: 'ded' },
                { label: 'Pension (post-tax)', value: -(result.pensionEmployee - result.pensionDeductible), type: 'ded' },
                { label: 'Medical Aid',        value: -result.medicalAid,      type: 'ded' },
                { label: 'Other Deductions',   value: -result.otherDeductions, type: 'ded' },
                { label: 'Net Pay',            value: result.netPay,           type: 'net' },
              ].filter(r => r.value !== 0).map(r => (
                <div key={r.label} className={`flex justify-between py-1 ${
                  r.type === 'sub' ? 'border-t border-cream-200 font-semibold pt-2 mt-1' :
                  r.type === 'net' ? 'border-t-2 border-navy-900 font-bold text-navy-900 pt-2 mt-1' : ''
                }`}>
                  <span className={r.type === 'ded' ? 'text-navy-500 pl-3' : ''}>{r.label}</span>
                  <span className={`tabular-nums ${
                    r.type === 'ded' ? 'text-red-600' :
                    r.type === 'net' ? 'text-emerald-700 text-base' :
                    r.type === 'sub' ? 'text-navy-900' :
                    'text-emerald-700'
                  }`}>
                    {r.value < 0 ? `–${formatNAD(Math.abs(r.value))}` : formatNAD(r.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tax Brackets reference */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-navy-600" />
          <div className="text-base font-semibold text-navy-900">
            PAYE Tax Brackets — Namibia 2026/2027
          </div>
          <span className="ml-auto text-xs text-navy-400">Tax-free threshold: {formatNAD(100000, 0)}</span>
        </div>
        <div className="space-y-1.5">
          {TAX_BRACKETS.map(bracket => (
            <BracketBar key={bracket.min} bracket={bracket} annualIncome={annualTaxable} />
          ))}
        </div>
        <div className="mt-3 text-xs text-navy-400">
          Highlighted bracket = your current marginal tax rate. Annual taxable income: <strong>{formatNAD(annualTaxable)}</strong>
        </div>
      </div>

      {/* Annual summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Annual Gross',     value: formatNAD(annualIncome) },
          { label: 'Annual PAYE',      value: formatNAD(result.paye * 12) },
          { label: 'Annual Net Pay',   value: formatNAD(result.netPay * 12) },
          { label: 'Employer Cost p.a.', value: formatNAD(result.totalEmployerCost * 12) },
        ].map(c => (
          <div key={c.label} className="card p-4 text-center">
            <div className="text-xs text-navy-500 mb-1">{c.label}</div>
            <div className="text-base font-bold text-navy-900 tabular-nums">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
