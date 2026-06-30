import React from 'react'
import { motion } from 'framer-motion'

export default function EmptyState({ icon, title, subtitle, action, size = 'md' }) {
  const iconBox = size === 'lg' ? 'w-20 h-20' : 'w-16 h-16'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center h-full text-center px-8 py-12 select-none"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`relative ${iconBox} rounded-3xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center mb-5 text-brand-500 shadow-elevated`}
        >
          <div className="absolute inset-0 rounded-3xl bg-brand-400/10 blur-xl -z-10" />
          {icon}
        </motion.div>
      )}
      <p className="text-[15px] font-semibold text-ink tracking-tight">{title}</p>
      {subtitle && <p className="text-sm text-ink-4 mt-1.5 max-w-xs leading-relaxed">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
