import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, PlusCircle, ClipboardList, LogOut,
  Zap, Menu, X, Shield, ArrowUpRight
} from 'lucide-react'

function NavLink({ to, icon: Icon, children, onClick }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`sidebar-link ${
        isActive
          ? 'sidebar-link-active'
          : 'sidebar-link-inactive'
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
      <span className="flex-1">{children}</span>
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}
    </Link>
  )
}

export default function Sidebar({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Overview' },
    { to: '/student/submit', icon: PlusCircle, label: 'Submit issue' },
    { to: '/student/complaints', icon: ClipboardList, label: 'My complaints' },
  ]

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Analytics' },
    { to: '/admin/complaints', icon: ClipboardList, label: 'Manage issues' },
  ]

  const links = role === 'admin' ? adminLinks : studentLinks

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-300 border-r border-slate-800/80">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm tracking-tight">CampusPulse</span>
              <span className="text-[11px] text-slate-400 font-mono">v1.0</span>
            </div>
            <p className="text-slate-400 text-xs truncate">Facility operations</p>
          </div>
        </Link>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>{role === 'admin' ? 'Administration' : 'Student portal'}</span>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>

        {links.map(link => (
          <NavLink key={link.to} to={link.to} icon={link.icon} onClick={() => setOpen(false)}>
            {link.label}
          </NavLink>
        ))}

        <div className="pt-3 mt-3 border-t border-slate-800/60 px-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1.5 transition-colors"
          >
            <span>Landing page</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>
        </div>
      </nav>

      {/* User Card in Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0d1326]">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 mb-2">
          <div className="w-7 h-7 rounded bg-slate-800 text-slate-200 font-medium text-xs flex items-center justify-center flex-shrink-0 border border-slate-700">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              {user?.role === 'admin' ? (
                <span className="text-blue-400">Admin</span>
              ) : (
                <span>Student</span>
              )}
              <span>•</span>
              <span className="truncate max-w-[80px]" title={user?.email}>
                {user?.email?.split('@')[0]}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-1.5 px-3 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">CampusPulse</span>
          </div>
        </div>
        <span className="text-xs text-slate-500 font-mono capitalize">
          {role}
        </span>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile slide-out drawer */}
      <div
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 shadow-lg transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop permanent sidebar */}
      <div className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-30">
        <SidebarContent />
      </div>
    </>
  )
}
