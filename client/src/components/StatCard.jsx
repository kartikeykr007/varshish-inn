import React from 'react'

export default function StatCard({ title, value, icon: Icon, subtitle, highlight = false }) {
  return (
    <div className={`card p-4 sm:p-5 flex flex-col justify-between ${highlight ? 'border-blue-300 bg-blue-50/20' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium">{title}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-semibold text-slate-900 tabular-nums tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-normal">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
