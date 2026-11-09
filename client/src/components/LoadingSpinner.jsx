import React from 'react'

export default function LoadingSpinner({ fullScreen = false, size = 'md', label = 'Loading...' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2'
  }

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          {label && <p className="text-xs text-slate-500 font-medium">{label}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2.5">
      <div className={`${sizes[size] || sizes.md} border-slate-200 border-t-blue-600 rounded-full animate-spin`} />
      {label && <p className="text-xs text-slate-400">{label}</p>}
    </div>
  )
}
