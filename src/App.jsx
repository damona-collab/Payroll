import React from 'react'
// HashRouter so the app works from file:// inside the packaged desktop app
import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Employees from './pages/Employees.jsx'
import PayrollRun from './pages/PayrollRun.jsx'
import Payslips from './pages/Payslips.jsx'
import LeaveManagement from './pages/LeaveManagement.jsx'
import TaxCalculator from './pages/TaxCalculator.jsx'
import Reports from './pages/Reports.jsx'
import Configuration from './pages/Configuration.jsx'

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/employees"   element={<Employees />} />
          <Route path="/payroll-run" element={<PayrollRun />} />
          <Route path="/payslips"    element={<Payslips />} />
          <Route path="/leave"       element={<LeaveManagement />} />
          <Route path="/tax-calc"    element={<TaxCalculator />} />
          <Route path="/reports"     element={<Reports />} />
          <Route path="/config"      element={<Configuration />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}
