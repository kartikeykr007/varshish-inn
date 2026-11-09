import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, ChevronRight, Trash2, RefreshCw,
  FileText, X, CheckCircle2
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import PriorityBadge from '../components/PriorityBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import DeleteModal from '../components/DeleteModal'
import api from '../api/axios'

const STATUSES = ['All', 'Submitted', 'In Progress', 'Resolved']
const CATEGORIES = ['All', 'Electricity', 'Water', 'Wi-Fi', 'Cleanliness', 'Hostel', 'Classroom', 'Infrastructure', 'Other']

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All')
  const [updating, setUpdating] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [notification, setNotification] = useState('')

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 100 })
      if (search.trim()) params.set('search', search.trim())
      if (status !== 'All') params.set('status', status)
      if (category !== 'All') params.set('category', category)
      const res = await api.get(`/complaints?${params}`)
      setComplaints(res.data.complaints || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, status, category])

  useEffect(() => {
    const t = setTimeout(fetchComplaints, 250)
    return () => clearTimeout(t)
  }, [fetchComplaints])

  const notify = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3000)
  }

  const updateStatus = async (id, newStatus) => {
    setUpdating(id)
    try {
      await api.patch(`/complaints/${id}/status`, {
        status: newStatus,
        note: `Status updated to "${newStatus}" by administrator`
      })
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
      notify(`Status updated to "${newStatus}"`)
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.id) return
    setDeleteLoading(true)
    try {
      await api.delete(`/complaints/${deleteModal.id}`)
      setComplaints(prev => prev.filter(c => c.id !== deleteModal.id))
      setDeleteModal({ open: false, id: null })
      notify('Complaint deleted')
    } catch (err) {
      notify(err.response?.data?.error || 'Failed to delete complaint')
    } finally {
      setDeleteLoading(false)
    }
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('All')
    setCategory('All')
  }

  const hasFilters = search || status !== 'All' || category !== 'All'

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar role="admin" />
      <main className="lg:ml-64 flex-1 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pt-16 lg:pt-8">

          {/* Floating Toast Notification */}
          {notification && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-3.5 py-2.5 rounded-lg shadow-md border border-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{notification}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 font-medium">Administration</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  {complaints.length} {complaints.length === 1 ? 'record' : 'records'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Manage complaints
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Review reported campus facility issues, update status, and track repairs.
              </p>
            </div>

            <button
              onClick={fetchComplaints}
              className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="card p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field pl-9 text-xs sm:text-sm"
                  placeholder="Search by title, ticket ID, student, or location..."
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="input-field text-xs sm:text-sm sm:w-40 cursor-pointer"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>
                  ))}
                </select>

                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input-field text-xs sm:text-sm sm:w-40 cursor-pointer"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
                  ))}
                </select>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1 text-slate-600 hover:text-slate-900"
                    title="Clear filters"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Data Table */}
          {loading ? (
            <LoadingSpinner label="Loading complaints queue..." />
          ) : complaints.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={FileText}
                title="No complaints match current query"
                description="Try clearing search filters or check again when new campus issues are filed."
                action={
                  hasFilters && (
                    <button onClick={clearFilters} className="btn-secondary text-xs py-2 px-3">
                      Clear filters
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50/70 text-xs font-medium text-slate-500 border-b border-slate-200">
                      <th className="px-4 py-2.5">Ticket</th>
                      <th className="px-4 py-2.5">Student</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Priority</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Date filed</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complaints.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                        {/* ID + Title */}
                        <td className="px-4 py-3">
                          <Link to={`/complaint/${c.id}`} className="group block">
                            <span className="font-mono text-xs text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded group-hover:text-blue-600 transition-colors">
                              {c.complaint_number}
                            </span>
                            <p className="text-xs sm:text-sm font-medium text-slate-900 group-hover:text-blue-600 max-w-xs truncate transition-colors mt-1">
                              {c.title}
                            </p>
                          </Link>
                        </td>

                        {/* Student */}
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                          <p className="font-medium text-slate-800">{c.user_name}</p>
                          <p className="text-[11px] text-slate-400">{c.user_email}</p>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                            {c.category}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <PriorityBadge priority={c.priority} />
                        </td>

                        {/* Status Updater Dropdown */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={c.status}
                            onChange={e => updateStatus(c.id, e.target.value)}
                            disabled={updating === c.id}
                            className={`text-xs font-medium rounded-md px-2 py-1 border cursor-pointer transition-colors ${
                              c.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : c.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            } focus:outline-none focus:border-blue-600 disabled:opacity-50`}
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap tabular-nums">
                          {formatDate(c.created_at)}
                        </td>

                        {/* Action buttons */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/complaint/${c.id}`}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                              title="View details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteModal({ open: true, id: c.id })}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete complaint"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
