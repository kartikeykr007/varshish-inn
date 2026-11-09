import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.token, res.data.user)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/student')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    setError('')
    if (role === 'admin') {
      setForm({ email: 'admin@campuspulse.edu', password: 'admin123' })
    } else {
      setForm({ email: 'student@campuspulse.edu', password: 'student123' })
    }
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-semibold text-xl text-white tracking-tight">CampusPulse</span>
          </Link>
          <h1 className="text-lg font-medium text-white">Sign in</h1>
          <p className="text-slate-400 text-xs mt-0.5">Enter your credentials to continue</p>
        </div>

        {/* Card */}
        <div className="card p-6 bg-white border border-slate-200">
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 mb-4 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                University email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-9 text-xs sm:text-sm"
                  placeholder="student@campuspulse.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-9 text-xs sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2 mt-1"
            >
              {loading ? 'Authenticating...' : 'Sign in'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Demo Autofill Section */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 mb-2 text-center">
              Quick-fill demo credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="btn-secondary py-1.5 px-2 text-xs flex items-center justify-center gap-1.5 text-slate-700 shadow-none"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="btn-secondary py-1.5 px-2 text-xs flex items-center justify-center gap-1.5 text-slate-700 shadow-none"
              >
                Student
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Register as student
          </Link>
        </p>
      </div>
    </div>
  )
}
