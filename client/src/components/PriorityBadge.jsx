import React from 'react'

const configs = {
  'Low': {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400'
  },
  'Medium': {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500'
  },
  'High': {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    dot: 'bg-orange-600'
  },
  'Critical': {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    dot: 'bg-rose-600'
  },
}

export default function PriorityBadge({ priority }) {
  const c = configs[priority] || configs.Low
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${c.bg} ${c.border} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {priority}
    </span>
  )
}
