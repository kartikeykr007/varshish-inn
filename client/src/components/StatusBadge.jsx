import React from 'react'

const configs = {
  'Submitted': {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500'
  },
  'In Progress': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    dot: 'bg-blue-600'
  },
  'Resolved': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    dot: 'bg-emerald-600'
  },
}

export default function StatusBadge({ status }) {
  const c = configs[status] || {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400'
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${c.bg} ${c.border} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  )
}
