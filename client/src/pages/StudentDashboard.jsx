import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Clock, CheckCircle2, PlusCircle, TrendingUp,
  ArrowRight, Info
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import ComplaintCard from '../components/ComplaintCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/stats/student'),
      api.get('/complaints?limit=5')
    ]).then(([statsRes, complaintsRes]) => {
      setStats(statsRes.data)
      setRecent(complaintsRes.data.complaints || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex bg-[#f8fafc] min-h-screen">
        <Sidebar role="student" />
        <main className="lg:ml-64 flex-1 min-h-screen">
          <LoadingSpinner fullScreen label="Loading dashboard..." />
        </main>
      </div>
    )
  }

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar role="student" />
      <main className="lg:ml-64 flex-1 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pt-16 lg:pt-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 font-medium">Student portal</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Overview
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Track status updates on your reported issues or file a new campus facility maintenance request.
              </p>
            </div>

            <Link to="/student/submit" className="btn-primary self-start sm:self-auto text-xs py-2 px-3.5">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report issue</span>
            </Link>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard
              title="Total reports"
              value={stats?.total || 0}
              icon={FileText}
              subtitle="All submissions"
            />
            <StatCard
              title="Submitted"
              value={stats?.submitted || 0}
              icon={Clock}
              subtitle="Awaiting triage"
            />
            <StatCard
              title="In progress"
              value={stats?.inProgress || 0}
              icon={TrendingUp}
              subtitle="Technician dispatched"
            />
            <StatCard
              title="Resolved"
              value={stats?.resolved || 0}
              icon={CheckCircle2}
              subtitle="Repairs verified"
            />
          </div>

          {/* Automated Triage Informational Notice */}
          <div className="card p-4 sm:p-5 mb-6 border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5 sm:mt-0">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-xs sm:text-sm text-slate-900">
                  Automated urgency triage
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Critical hazards (flooding, electrical sparks, structural safety) are automatically elevated to high priority.
                </p>
              </div>
            </div>
            <Link
              to="/student/submit"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 self-start sm:self-auto whitespace-nowrap"
            >
              Submit report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Recent Complaints Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-slate-900">Recent complaints</h2>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                  {recent.length}
                </span>
              </div>
              <Link
                to="/student/complaints"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                View all ({stats?.total || 0}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={FileText}
                  title="No complaints reported yet"
                  description="When you encounter a facility issue on campus, report it here to dispatch maintenance."
                  action={
                    <Link to="/student/submit" className="btn-primary text-xs py-2 px-3.5">
                      <PlusCircle className="w-3.5 h-3.5" />
                      Submit your first issue
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {recent.map(c => (
                  <ComplaintCard key={c.id} complaint={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
