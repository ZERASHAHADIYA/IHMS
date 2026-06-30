import React from 'react'
import { getInitials } from '../../utils/helpers'
import clsx from 'clsx'

const PALETTES = [
  'bg-brand-100 text-brand-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-green-100 text-green-700',
  'bg-sky-100 text-sky-700',
  'bg-orange-100 text-orange-700',
]

function pickPalette(name = '') {
  const code = name.charCodeAt(0) || 0
  return PALETTES[code % PALETTES.length]
}

const SIZE = {
  xs:  'w-6  h-6  text-[10px]',
  sm:  'w-8  h-8  text-xs',
  md:  'w-9  h-9  text-sm',
  lg:  'w-10 h-10 text-sm',
  xl:  'w-12 h-12 text-base',
  '2xl':'w-14 h-14 text-lg',
}

export default function Avatar({ name = '', size = 'md', online, className }) {
  const initials = getInitials(name)
  const palette  = pickPalette(name)
  const sz       = SIZE[size] || SIZE.md

  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      <div className={clsx(
        'rounded-full flex items-center justify-center font-semibold select-none',
        sz, palette
      )}>
        {initials}
      </div>
      {online != null && (
        <span className={clsx(
          'absolute bottom-0 right-0 rounded-full border-2 border-surface',
          size === 'xs' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5',
          online ? 'bg-success' : 'bg-ink-5'
        )} />
      )}
    </div>
  )
}
