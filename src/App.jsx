import React from 'react'
// HashRouter so the app works from file:// inside the packaged desktop app
import { HashRouter, Routes, Route } from 'react-router-dom'
import { PayrollProvider } from './store/PayrollProvider.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Employees from './pages/Employees.jsx'
import EmployeeDetail from './pages/EmployeeDetail.jsx'
import EmployeePayslip from './pages/EmployeePayslip.jsx'
import PayrollRun from './pages/PayrollRun.jsx'
import Payslips from './pages/Payslips.jsx'
import LeaveManagement from './pages/LeaveManagement.jsx'
import TaxCalculator from './pages/TaxCalculator.jsx'
import Reports from './pages/Reports.jsx'
import Configuration from './pages/Configuration.jsx'
import TaxDrilldown from './pages/TaxDrilldown.jsx'
import ComparePayslips from './pages/ComparePayslips.jsx'

export default function App() {
  return (
    <PayrollProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/employees"   element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/employees/:id/payslip/:period" element={<EmployeePayslip />} />
            <Route path="/payroll-run" element={<PayrollRun />} />
            <Route path="/payslips"    element={<Payslips />} />
            <Route path="/leave"       element={<LeaveManagement />} />
            <Route path="/tax-calc"    element={<TaxCalculator />} />
            <Route path="/tax-drilldown" element={<TaxDrilldown />} />
            <Route path="/compare"     element={<ComparePayslips />} />
            <Route path="/reports"     element={<Reports />} />
            <Route path="/config"      element={<Configuration />} />
          </Routes>
        </Layout>
      </HashRouter>
    </PayrollProvider>
  )
}
