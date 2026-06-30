import React from 'react'
import clsx from 'clsx'

export function RoleBadge({ role }) {
  const map = {
    ADMIN:   'bg-red-100   text-red-700',
    FACULTY: 'bg-brand-100 text-brand-700',
    STUDENT: 'bg-green-100 text-green-700',
  }
  return (
    <span className={clsx(
      'text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-sm flex-shrink-0',
      map[role] || map.STUDENT
    )}>
      {role}
    </span>
  )
}

export function UnreadBadge({ count }) {
  if (!count) return null
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-semibold flex-shrink-0">
      {count > 99 ? '99+' : count}
    </span>
  )
}
