import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { employees as SEED, TAX_YEAR_PERIODS, generateMonthlyHistory } from '../data/employees.js'
import { calculatePayroll } from '../utils/namibianTax.js'

const STORAGE_KEY = 'bluvopay.state.v1'

const PayrollContext = createContext(null)

// Fields that make up an employee's standing payslip inputs
function inputsFromEmployee(emp, adjustments = []) {
  const extraEarn = adjustments.filter(a => a.kind === 'earning').reduce((s, a) => s + Number(a.amount || 0), 0)
  const extraDed  = adjustments.filter(a => a.kind === 'deduction').reduce((s, a) => s + Number(a.amount || 0), 0)
  const overtime  = adjustments.filter(a => a.kind === 'overtime').reduce((s, a) => s + Number(a.amount || 0), 0)
  return {
    basicSalary: Number(emp.basicSalary || 0),
    allowances: Number(emp.allowances || 0) + extraEarn,
    housingAllowance: Number(emp.housingAllowance || 0),
    overtimePay: overtime,
    fringeBenefits: Number(emp.fringeBenefits || 0),
    pensionEmployee: Number(emp.pensionEmployee || 0),
    pensionEmployer: Number(emp.pensionEmployer || 0),
    medicalAid: Number(emp.medicalAid || 0),
    medicalAidEmployer: Number(emp.medicalAidEmployer || 0),
    otherDeductions: Number(emp.otherDeductions || 0) + extraDed,
  }
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  // Seed: strip the computed payroll (recomputed live), keep master data
  const employees = SEED.map(({ payroll, ...rest }) => ({ ...rest }))
  return { employees, adjustments: {}, leave: {} }
}

export function PayrollProvider({ children }) {
  const [state, setState] = useState(loadInitial)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const getEmployee = useCallback(id => state.employees.find(e => e.id === id), [state.employees])

  const updateEmployee = useCallback((id, patch) => {
    setState(s => ({ ...s, employees: s.employees.map(e => e.id === id ? { ...e, ...patch } : e) }))
  }, [])

  // Per-period payslip adjustments (extra earnings/deductions/overtime)
  const getAdjustments = useCallback((id, period) => state.adjustments?.[`${id}|${period}`] || [], [state.adjustments])

  const setAdjustments = useCallback((id, period, list) => {
    setState(s => ({ ...s, adjustments: { ...s.adjustments, [`${id}|${period}`]: list } }))
  }, [])

  // Compute a payslip for an employee + period from current master data + adjustments
  const getPayslip = useCallback((id, period) => {
    const emp = state.employees.find(e => e.id === id)
    if (!emp) return null
    const adjustments = state.adjustments?.[`${id}|${period}`] || []
    const inputs = inputsFromEmployee(emp, adjustments)
    return { period, inputs, adjustments, calc: calculatePayroll(inputs) }
  }, [state.employees, state.adjustments])

  // Live payroll for the current period (used by lists/dashboards)
  const withPayroll = useCallback(emp => ({
    ...emp,
    payroll: calculatePayroll(inputsFromEmployee(emp)),
  }), [])

  const employeesLive = state.employees.map(withPayroll)

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(loadInitial())
  }, [])

  const value = {
    employees: employeesLive,
    rawEmployees: state.employees,
    getEmployee: id => employeesLive.find(e => e.id === id),
    getEmployeeRaw: getEmployee,
    updateEmployee,
    getAdjustments, setAdjustments,
    getPayslip,
    periods: TAX_YEAR_PERIODS,
    monthlyHistory: (emp, through) => generateMonthlyHistory(emp, through),
    resetDemo,
  }

  return <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>
}

export function usePayroll() {
  const ctx = useContext(PayrollContext)
  if (!ctx) throw new Error('usePayroll must be used within PayrollProvider')
  return ctx
}
