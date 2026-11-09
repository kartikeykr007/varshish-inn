import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = 'Delete complaint',
  description = 'Are you sure you want to delete this complaint? All associated status history will be permanently deleted. This action cannot be undone.'
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-xl shadow-lg border border-slate-200 max-w-sm w-full p-5 z-10">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 text-rose-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900">{title}</h3>
            <p className="text-xs text-rose-600 mt-0.5">Permanent action</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 text-xs py-2"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-danger flex-1 text-xs py-2 shadow-none"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Confirm delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
