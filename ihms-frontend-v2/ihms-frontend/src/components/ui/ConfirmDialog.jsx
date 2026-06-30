import React from 'react'
import { motion } from 'framer-motion'

export default function ConfirmDialog({
  title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  danger = false, loading = false, onConfirm, onCancel,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-surface rounded-2xl shadow-modal border border-surface-4 p-5"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${danger ? 'bg-danger/10 text-danger' : 'bg-brand-50 text-brand-500'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-[15px] font-bold text-ink mb-1.5">{title}</h3>
        <p className="text-[13px] text-ink-3 leading-relaxed mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 text-[13px] font-medium rounded-lg bg-surface-2 hover:bg-surface-3 text-ink-2 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-3.5 py-2 text-[13px] font-semibold rounded-lg text-white transition-colors disabled:opacity-50 ${
              danger ? 'bg-danger hover:bg-danger/90' : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
