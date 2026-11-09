import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">CampusPulse</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <span className="font-medium hidden sm:inline">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-secondary text-xs py-1.5 px-3">Sign in</Link>
              <Link to="/register" className="btn-primary text-xs py-1.5 px-3">Get started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
