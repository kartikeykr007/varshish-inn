import React from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = '',
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-medium text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
