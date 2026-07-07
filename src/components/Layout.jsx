import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calculator, FileText, Calendar,
  BarChart3, ChevronLeft, ChevronRight, Bell, Search,
  Settings, LogOut, Building2, Menu, X, ChevronDown,
} from 'lucide-react'
import { COMPANY_INFO } from '../data/employees.js'

const navItems = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees',    icon: Users,           label: 'Employees' },
  { to: '/payroll-run',  icon: Calculator,      label: 'Payroll Run' },
  { to: '/payslips',     icon: FileText,        label: 'Payslips' },
  { to: '/leave',        icon: Calendar,        label: 'Leave Management' },
  { to: '/tax-calc',     icon: Calculator,      label: 'Tax Calculator' },
  { to: '/reports',      icon: BarChart3,       label: 'Reports' },
  { to: '/config',       icon: Settings,        label: 'Configuration' },
]

function SidebarLink({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
          isActive
            ? 'bg-cream-100/20 text-cream-100 shadow-sm'
            : 'text-navy-300 hover:bg-white/10 hover:text-cream-100'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gold-400 rounded-r-full" />
          )}
          <item.icon size={18} className="shrink-0" />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-navy-800 text-cream-100 text-xs rounded-md
                            opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
                            transition-opacity duration-150 shadow-lg border border-navy-700">
              {item.label}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const currentPage = navItems.find(n => {
    if (n.to === '/') return location.pathname === '/'
    return location.pathname.startsWith(n.to)
  })

  return (
    <div className="flex h-screen bg-cream-100 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          flex flex-col bg-navy-900 transition-all duration-300 ease-in-out shadow-2xl
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-navy-800">
          <div className="shrink-0 w-9 h-9 bg-gold-400 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-navy-900 font-black text-base">P</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-cream-100 font-bold text-base leading-tight truncate">PayFuta</div>
              <div className="text-navy-400 text-xs truncate">Payroll System</div>
            </div>
          )}
        </div>

        {/* Company badge */}
        {!collapsed && (
          <div className="mx-3 mt-3 px-3 py-2 bg-navy-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 size={13} className="text-gold-400 shrink-0" />
              <span className="text-navy-300 text-xs truncate">{COMPANY_INFO.name}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-navy-800 p-2 space-y-0.5">
          <button className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                              text-navy-300 hover:bg-white/10 hover:text-cream-100 transition-colors`}>
            <Settings size={18} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
          <button className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                              text-navy-300 hover:bg-red-500/20 hover:text-red-300 transition-colors`}>
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-navy-900 border border-navy-700 rounded-full
                     flex items-center justify-center text-navy-400 hover:text-cream-100
                     transition-colors shadow-md hidden lg:flex"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-cream-200 px-4 lg:px-6 py-3.5 flex items-center gap-4 shrink-0 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-navy-600 hover:text-navy-900 p-1"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold text-navy-900 leading-tight">
              {currentPage?.label ?? 'PayFuta'}
            </h1>
            <p className="text-xs text-navy-400">Tax Year 2024/2025 &bull; {COMPANY_INFO.name}</p>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-cream-100 border border-cream-200 rounded-lg px-3 py-2 w-64">
            <Search size={14} className="text-navy-400 shrink-0" />
            <input
              type="text"
              placeholder="Search employees, payslips..."
              className="bg-transparent text-sm text-navy-700 placeholder-navy-400 outline-none flex-1"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-navy-500 hover:text-navy-900 hover:bg-cream-100 rounded-lg transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User */}
          <button className="flex items-center gap-2.5 pl-3 border-l border-cream-200">
            <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center shrink-0">
              <span className="text-cream-100 text-xs font-bold">PA</span>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-navy-900 leading-tight">Payroll Admin</div>
              <div className="text-xs text-navy-400">Administrator</div>
            </div>
            <ChevronDown size={14} className="text-navy-400 hidden md:block" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-cream-100 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
