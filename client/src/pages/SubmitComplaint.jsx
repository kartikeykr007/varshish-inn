import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  CheckCircle2, AlertCircle, ArrowLeft,
  Copy, Check, ArrowRight
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import api from '../api/axios'

const CATEGORIES = [
  'Electricity', 'Water', 'Wi-Fi', 'Cleanliness',
  'Hostel', 'Classroom', 'Infrastructure', 'Other'
]

const LOCATIONS = [
  'Main Building', 'Engineering Block', 'Science Block', 'Arts Block',
  'Main Library', 'Hostel Block A', 'Hostel Block B', 'Hostel Block C',
  'Main Canteen', 'Sports Complex', 'Parking Area', 'Administrative Block', 'Other'
]

const PRIORITIES = [
  { id: 'Low', label: 'Low', desc: 'Minor repair or suggestion' },
  { id: 'Medium', label: 'Medium', desc: 'Standard maintenance' },
  { id: 'High', label: 'High', desc: 'Disrupts study or classes' },
  { id: 'Critical', label: 'Critical', desc: 'Immediate safety or hazard' },
]

export default function SubmitComplaint() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '', priority: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.description.trim() || !form.category || !form.location) {
      return setError('Please fill in all mandatory fields.')
    }
    setLoading(true)
    try {
      const res = await api.post('/complaints', {
        ...form,
        title: form.title.trim(),
        description: form.description.trim()
      })
      setSuccess(res.data.complaint)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit complaint.'
      const existing = err.response?.data?.existingComplaint
      setError(existing ? `${msg} (ID: ${existing})` : msg)
    } finally {
      setLoading(false)
    }
  }

  const copyId = () => {
    if (!success?.complaint_number) return
    navigator.clipboard.writeText(success.complaint_number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (success) {
    return (
      <div className="flex bg-[#f8fafc] min-h-screen">
        <Sidebar role="student" />
        <main className="lg:ml-64 flex-1 min-h-screen flex items-center justify-center p-6 pt-20 lg:pt-6">
          <div className="card p-6 sm:p-8 text-center max-w-md w-full">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-semibold text-slate-900 mb-1">Complaint submitted</h2>
            <p className="text-slate-500 text-xs sm:text-sm mb-5 leading-relaxed">
              Your issue has been logged in the campus database and routed to maintenance dispatch.
            </p>

            {/* Tracking ID Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mb-5 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs text-slate-400">Tracking identifier</p>
                <p className="text-slate-900 font-mono font-medium text-sm mt-0.5">{success.complaint_number}</p>
              </div>
              <button
                type="button"
                onClick={copyId}
                className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 shadow-none"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-5 text-left bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400">Assigned priority:</span>
                <p className="font-medium text-slate-800 mt-0.5">{success.priority}</p>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <p className="font-medium text-amber-800 mt-0.5">{success.status}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setSuccess(null)
                  setForm({ title: '', description: '', category: '', location: '', priority: '' })
                }}
                className="btn-secondary flex-1 text-xs py-2"
              >
                Submit another
              </button>
              <button
                onClick={() => navigate('/student/complaints')}
                className="btn-primary flex-1 text-xs py-2"
              >
                View my complaints
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar role="student" />
      <main className="lg:ml-64 flex-1 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto pt-16 lg:pt-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/student"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to overview
            </Link>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Report campus issue
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Provide specific location and description details to assist facility technicians.
            </p>
          </div>

          <div className="card p-5 sm:p-6">
            {error && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-3 mb-5 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Issue title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="input-field text-xs sm:text-sm"
                  placeholder="e.g. Broken classroom ceiling fan in Room 204"
                  maxLength={100}
                />
              </div>

              {/* Category & Location */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="input-field text-xs sm:text-sm cursor-pointer"
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Campus location <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="input-field text-xs sm:text-sm cursor-pointer"
                    required
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Priority level <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  {form.priority && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, priority: '' })}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Clear (auto-detect)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRIORITIES.map(p => {
                    const isSelected = form.priority === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setForm({ ...form, priority: form.priority === p.id ? '' : p.id })}
                        className={`p-2.5 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <p className="text-xs font-medium">{p.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{p.desc}</p>
                      </button>
                    )
                  })}
                </div>

                <p className="text-[11px] text-slate-400 mt-1.5">
                  If unselected, priority will be automatically determined by safety keyword rules.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Detailed description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none leading-relaxed text-xs sm:text-sm"
                  rows={4}
                  maxLength={1000}
                  placeholder="Describe the failure, safety hazards, affected students, or landmark room numbers..."
                />
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>Be descriptive to prevent duplicate tickets.</span>
                  <span className="tabular-nums">{form.description.length}/1000</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/student')}
                  className="btn-secondary flex-1 text-xs py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 text-xs py-2"
                >
                  {loading ? 'Submitting...' : 'Submit complaint'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
