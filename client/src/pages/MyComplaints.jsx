import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, PlusCircle, X,
  ChevronLeft, ChevronRight, Inbox
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ComplaintCard from '../components/ComplaintCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import api from '../api/axios'

const STATUSES = ['All', 'Submitted', 'In Progress', 'Resolved']
const CATEGORIES = ['All', 'Electricity', 'Water', 'Wi-Fi', 'Cleanliness', 'Hostel', 'Classroom', 'Infrastructure', 'Other']

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const fetchComplaints = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit })
    if (search.trim()) params.append('search', search.trim())
    if (status !== 'All') params.append('status', status)
    if (category !== 'All') params.append('category', category)

    api.get(`/complaints?${params}`)
      .then(res => {
        setComplaints(res.data.complaints || [])
        setTotal(res.data.total || 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, search, status, category])

  useEffect(() => {
    const timer = setTimeout(fetchComplaints, 250)
    return () => clearTimeout(timer)
  }, [fetchComplaints])

  const clearFilters = () => {
    setSearch('')
    setStatus('All')
    setCategory('All')
    setPage(1)
  }

  const hasFilters = search || status !== 'All' || category !== 'All'
  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar role="student" />
      <main className="lg:ml-64 flex-1 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  My complaints
                </h1>
                <span className="text-xs font-mono text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                  {total}
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm">
                View your complete submission history and follow resolution status.
              </p>
            </div>

            <Link
              to="/student/submit"
              className="btn-primary self-start sm:self-auto text-xs py-2 px-3.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New complaint</span>
            </Link>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="card p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search by title, ticket ID, or keywords..."
                  className="input-field pl-9 text-xs sm:text-sm"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); setPage(1) }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={status}
                  onChange={e => { setStatus(e.target.value); setPage(1) }}
                  className="input-field text-xs sm:text-sm sm:w-40 cursor-pointer"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>
                  ))}
                </select>

                <select
                  value={category}
                  onChange={e => { setCategory(e.target.value); setPage(1) }}
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

          {/* Complaint Cards List */}
          {loading ? (
            <LoadingSpinner label="Loading your complaints..." />
          ) : complaints.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Inbox}
                title={hasFilters ? "No matching complaints" : "No complaints reported"}
                description={
                  hasFilters
                    ? "Try adjusting your search criteria or resetting filters to see results."
                    : "You haven't reported any campus issues yet. When a problem occurs, submit a report here."
                }
                action={
                  hasFilters ? (
                    <button onClick={clearFilters} className="btn-secondary text-xs py-2 px-3">
                      Clear filters
                    </button>
                  ) : (
                    <Link to="/student/submit" className="btn-primary text-xs py-2 px-3.5">
                      <PlusCircle className="w-3.5 h-3.5" />
                      Report an issue
                    </Link>
                  )
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map(c => (
                <ComplaintCard key={c.id} complaint={c} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 text-xs text-slate-500">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="btn-secondary px-2.5 py-1.5 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="btn-secondary px-2.5 py-1.5 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
