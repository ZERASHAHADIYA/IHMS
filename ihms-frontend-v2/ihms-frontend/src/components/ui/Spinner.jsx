import React from 'react'
import clsx from 'clsx'

export default function Spinner({ size = 'md', className }) {
  const sz = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }[size]
  return (
    <div className={clsx(
      'rounded-full border-2 border-ink-5 border-t-brand-500 animate-spin',
      sz, className
    )} />
  )
}
