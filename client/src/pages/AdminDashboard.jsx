import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  FileText, Users, CheckCircle2, Clock, TrendingUp, ArrowRight,
  AlertTriangle, RefreshCw
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api/axios'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-md border border-slate-700">
        <p className="font-medium text-slate-300">{label || payload[0].name}</p>
        <p className="text-white font-mono mt-0.5">
          {payload[0].value} {payload[0].value === 1 ? 'ticket' : 'tickets'}
        </p>
      </div>
    )
  }
  return null
}

const PRIORITY_ORDER = ['Critical', 'High', 'Medium', 'Low']
const PRIORITY_COLORS = {
  'Critical': 'bg-rose-500',
  'High': 'bg-orange-500',
  'Medium': 'bg-amber-500',
  'Low': 'bg-slate-400'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = () => {
    setLoading(true)
    api.get('/stats/admin')
      .then(res => setStats(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load system metrics.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex bg-[#f8fafc] min-h-screen">
        <Sidebar role="admin" />
        <main className="lg:ml-64 flex-1 min-h-screen">
          <LoadingSpinner fullScreen label="Loading analytics..." />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex bg-[#f8fafc] min-h-screen">
        <Sidebar role="admin" />
        <main className="lg:ml-64 flex-1 min-h-screen flex items-center justify-center p-6">
          <div className="text-center card p-6 max-w-sm">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h2 className="text-sm font-medium text-slate-900 mb-2">{error}</h2>
            <button onClick={fetchStats} className="btn-primary text-xs py-1.5 px-3">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </main>
      </div>
    )
  }

  const trendData = (stats?.trend || []).map(t => ({
    date: formatDate(t.date),
    complaints: t.count
  }))

  const totalPriorityCount = (stats?.byPriority || []).reduce((acc, p) => acc + p.count, 0) || 1

  const sortedPriorities = [...(stats?.byPriority || [])].sort((a, b) => {
    return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  })

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar role="admin" />
      <main className="lg:ml-64 flex-1 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 font-medium">Campus operations</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-400 font-mono">Real-time facility dispatch</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Operations overview
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Monitoring campus facility reports, technician triage queues, and resolution SLA.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={fetchStats}
                className="btn-secondary text-xs py-2 px-3"
                title="Refresh metrics"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link to="/admin/complaints" className="btn-primary text-xs py-2 px-3.5">
                <span>Manage complaints</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <StatCard
              title="Total tickets"
              value={stats?.total || 0}
              icon={FileText}
              subtitle="All campus logs"
            />
            <StatCard
              title="Submitted"
              value={stats?.submitted || 0}
              icon={Clock}
              subtitle="Awaiting dispatch"
            />
            <StatCard
              title="In progress"
              value={stats?.inProgress || 0}
              icon={TrendingUp}
              subtitle="Under active repair"
            />
            <StatCard
              title="Resolved"
              value={stats?.resolved || 0}
              icon={CheckCircle2}
              subtitle="Closed and verified"
            />
            <StatCard
              title="Active students"
              value={stats?.totalUsers || 0}
              icon={Users}
              subtitle="Registered users"
            />
          </div>

          {/* Average Resolution Time Card (SLA Moment) */}
          {stats?.avgResolutionHours > 0 && (
            <div className="card p-4 sm:p-5 mb-6 border-slate-200/90 flex items-center justify-between flex-wrap gap-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Average resolution speed</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl sm:text-2xl font-semibold text-slate-900 tabular-nums">
                      {stats.avgResolutionHours}
                    </span>
                    <span className="text-xs text-slate-500">hours per issue</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Calculated from historical ticket submission to resolution timestamps
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  SLA normal
                </span>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Category Chart - Spans 2 cols */}
            <div className="card p-4 sm:p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-slate-900 text-sm">Tickets by category</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Volume distribution across facility domains</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {stats?.byCategory?.length || 0} active
                </span>
              </div>

              {stats?.byCategory?.length > 0 ? (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="count"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">No category data recorded yet</div>
              )}
            </div>

            {/* Priority Ranked Breakdown - 1 col */}
            <div className="card p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-slate-900 text-sm">Priority breakdown</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Triage severity distribution</p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Total {stats?.total || 0}</span>
                </div>

                <div className="space-y-3.5 mt-2">
                  {sortedPriorities.map(p => {
                    const percent = Math.round((p.count / totalPriorityCount) * 100)
                    const dotClass = PRIORITY_COLORS[p.priority] || 'bg-slate-400'
                    return (
                      <div key={p.priority} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                            {p.priority}
                          </span>
                          <span className="text-slate-500 font-mono tabular-nums">
                            {p.count} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${dotClass}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-400">
                Priorities elevated automatically via safety keyword rules
              </div>
            </div>
          </div>

          {/* 7-day trend chart */}
          {trendData.length > 0 && (
            <div className="card p-4 sm:p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-slate-900 text-sm">7-day submission volume</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Daily incoming facility reports</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Weekly cadence
                </span>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="complaints" fill="#475569" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Complaints Table */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
              <div>
                <h3 className="font-medium text-slate-900 text-sm">Recent incident log</h3>
                <p className="text-xs text-slate-400 mt-0.5">Latest reports registered in campus database</p>
              </div>
              <Link
                to="/admin/complaints"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                View all complaints <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/70 text-xs font-medium text-slate-500 border-b border-slate-200">
                    <th className="px-4 py-2.5">Ticket</th>
                    <th className="px-4 py-2.5">Issue title</th>
                    <th className="px-4 py-2.5">Reported by</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stats?.recentComplaints || []).map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <Link
                          to={`/complaint/${c.id}`}
                          className="font-mono text-xs text-slate-700 hover:text-blue-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded transition-colors"
                        >
                          {c.complaint_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                        <Link to={`/complaint/${c.id}`} className="hover:text-blue-600 transition-colors">
                          {c.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {c.user_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
