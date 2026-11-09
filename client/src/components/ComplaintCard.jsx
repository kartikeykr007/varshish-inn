import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function ComplaintCard({ complaint }) {
  return (
    <Link
      to={`/complaint/${complaint.id}`}
      className="card p-4 sm:p-5 block hover:border-slate-300 transition-colors duration-150 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Metadata bar */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-mono text-xs text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              {complaint.complaint_number}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <span className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
              {complaint.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-medium text-sm sm:text-base text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
            {complaint.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {complaint.description}
          </p>

          {/* Meta footer */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {complaint.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {timeAgo(complaint.created_at)}
            </span>
            {complaint.user_name && (
              <span className="hidden sm:inline-block text-slate-400">
                by {complaint.user_name}
              </span>
            )}
          </div>
        </div>

        <div className="text-slate-300 group-hover:text-slate-500 transition-colors pt-1">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}
