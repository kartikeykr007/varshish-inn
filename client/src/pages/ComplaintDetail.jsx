import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  MapPin, Clock, Tag, AlertTriangle, Trash2,
  CheckCircle2, User, Send, Shield, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import DeleteModal from '../components/DeleteModal'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api/axios'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function ComplaintDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [updateFeedback, setUpdateFeedback] = useState('')

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`)
      setComplaint(res.data.complaint)
      setHistory(res.data.history || [])
      setNewStatus(res.data.complaint.status)
    } catch (err) {
      setError(err.response?.data?.error || 'Complaint not found.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaint()
  }, [id])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/complaints/${id}`)
      navigate(user?.role === 'admin' ? '/admin/complaints' : '/student/complaints')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete complaint')
      setDeleteLoading(false)
      setShowDelete(false)
    }
  }

  const handleStatusUpdate = async (e) => {
    if (e) e.preventDefault()
    if (!newStatus || (newStatus === complaint?.status && !statusNote.trim())) return
    setStatusLoading(true)
    setUpdateFeedback('')
    try {
      await api.patch(`/complaints/${id}/status`, {
        status: newStatus,
        note: statusNote.trim() || `Status updated to ${newStatus}`
      })
      setStatusNote('')
      setUpdateFeedback(`Status updated to ${newStatus}`)
      setTimeout(() => setUpdateFeedback(''), 3000)
      await fetchComplaint()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex bg-[#f8fafc] min-h-screen">
        <Sidebar role={user?.role} />
        <main className="lg:ml-64 flex-1 min-h-screen">
          <LoadingSpinner fullScreen label="Loading complaint record..." />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex bg-[#f8fafc] min-h-screen">
        <Sidebar role={user?.role} />
        <main className="lg:ml-64 flex-1 min-h-screen flex items-center justify-center p-6 pt-20 lg:pt-6">
          <div className="text-center card p-6 max-w-sm w-full">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-medium text-slate-900 mb-1">{error}</h2>
            <p className="text-xs text-slate-500 mb-4">
              This issue record could not be found or you do not have permission to view it.
            </p>
            <Link
              to={user?.role === 'admin' ? '/admin/complaints' : '/student/complaints'}
              className="btn-primary text-xs py-2 px-3"
            >
              Return to issues list
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const backTo = user?.role === 'admin' ? '/admin/complaints' : '/student/complaints'

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar role={user?.role} />
      <main className="lg:ml-64 flex-1 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
          {/* Breadcrumb Header */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link to={backTo} className="hover:text-slate-700 transition-colors">
              {user?.role === 'admin' ? 'Manage complaints' : 'My complaints'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-mono text-slate-700 font-medium">{complaint.complaint_number}</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Primary Details Card */}
              <div className="card p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="font-mono text-xs text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                    {complaint.complaint_number}
                  </span>
                  <StatusBadge status={complaint.status} />
                  <PriorityBadge priority={complaint.priority} />
                  <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    {complaint.category}
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 tracking-tight">
                  {complaint.title}
                </h1>

                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
                  {complaint.description}
                </div>

                {complaint.resolved_at && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-emerald-900">Marked as resolved</p>
                      <p className="text-emerald-700 text-[11px] mt-0.5">Verified on {formatDate(complaint.resolved_at)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div className="card p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-slate-900 text-sm">Status history & audit trail</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Chronological record of state updates and notes</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                    {history.length} {history.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No historical events recorded.</p>
                ) : (
                  <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                    {history.map((h, i) => {
                      const isResolved = h.status === 'Resolved'
                      const isInProgress = h.status === 'In Progress'

                      return (
                        <div key={h.id || i} className="relative">
                          {/* Node Icon */}
                          <div className={`absolute -left-5 top-1.5 w-4 h-4 rounded-full bg-white border flex items-center justify-center ${
                            isResolved ? 'border-emerald-500' : isInProgress ? 'border-blue-500' : 'border-amber-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isResolved ? 'bg-emerald-500' : isInProgress ? 'bg-blue-500' : 'bg-amber-500'
                            }`} />
                          </div>

                          {/* Event Card */}
                          <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <StatusBadge status={h.status} />
                                <span className="text-xs text-slate-700 font-medium">
                                  {h.changed_by_name || 'System'}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono capitalize">
                                  ({h.changed_by_role || 'user'})
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 tabular-nums" title={formatDate(h.created_at)}>
                                {timeAgo(h.created_at)}
                              </span>
                            </div>

                            {h.note && (
                              <p className="text-xs text-slate-600 mt-1.5 bg-white p-2 rounded border border-slate-200 leading-relaxed">
                                {h.note}
                              </p>
                            )}

                            <p className="text-[11px] text-slate-400 mt-1.5 text-right tabular-nums">
                              {formatDate(h.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-4">
              {/* Metadata Card */}
              <div className="card p-4 sm:p-5">
                <h3 className="font-medium text-slate-900 mb-3 text-xs text-slate-500">
                  Ticket metadata
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400">Location</p>
                      <p className="font-medium text-slate-800 mt-0.5">{complaint.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Tag className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400">Category</p>
                      <p className="font-medium text-slate-800 mt-0.5">{complaint.category}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400">Submitted at</p>
                      <p className="font-medium text-slate-800 mt-0.5 tabular-nums">{formatDate(complaint.created_at)}</p>
                      <p className="text-slate-400 text-[11px]">{timeAgo(complaint.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2.5 border-t border-slate-100">
                    <User className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400">Reported by</p>
                      <p className="font-medium text-slate-800 mt-0.5">{complaint.user_name || 'Student'}</p>
                      {complaint.user_email && (
                        <p className="text-slate-400 text-[11px] mt-0.5">{complaint.user_email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Manage Status Card */}
              {user?.role === 'admin' && (
                <div className="card p-4 sm:p-5 border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-slate-900 text-sm">Update status</h3>
                  </div>

                  {updateFeedback && (
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-3">
                      {updateFeedback}
                    </div>
                  )}

                  <form onSubmit={handleStatusUpdate} className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Target status
                      </label>
                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value)}
                        className="input-field text-xs cursor-pointer"
                      >
                        <option value="Submitted">Submitted (Under review)</option>
                        <option value="In Progress">In Progress (Assigned)</option>
                        <option value="Resolved">Resolved (Fixed & verified)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 mb-1">
                        Audit note
                      </label>
                      <textarea
                        value={statusNote}
                        onChange={e => setStatusNote(e.target.value)}
                        placeholder="e.g. Electrician dispatched to 2nd floor, replaced bulb..."
                        rows={3}
                        className="input-field text-xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={statusLoading || (newStatus === complaint.status && !statusNote.trim())}
                      className="btn-primary w-full text-xs py-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{statusLoading ? 'Updating...' : 'Save status change'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Admin Delete Action */}
              {user?.role === 'admin' && (
                <div className="card p-3 border-rose-200/60 bg-rose-50/20">
                  <button
                    type="button"
                    onClick={() => setShowDelete(true)}
                    className="btn-danger w-full text-xs py-2 shadow-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete issue record</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <DeleteModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
