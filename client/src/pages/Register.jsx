import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      login(res.data.token, res.data.user)
      navigate('/student')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your information.')
    } finally {
      setLoading(false)
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
          <h1 className="text-lg font-medium text-white">Create student account</h1>
          <p className="text-slate-400 text-xs mt-0.5">Register to report and track campus facility issues</p>
        </div>

        {/* Card */}
        <div className="card p-6 bg-white border border-slate-200">
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 mb-4 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field pl-9 text-xs sm:text-sm"
                  placeholder="Alex Johnson"
                />
              </div>
            </div>

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
                  placeholder="alex@campuspulse.edu"
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
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  className="input-field pl-9 text-xs sm:text-sm"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2 mt-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
