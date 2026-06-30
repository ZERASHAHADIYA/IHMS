import React from 'react'
import clsx from 'clsx'

export default function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        'rounded-md bg-gradient-to-r from-surface-3 via-surface-4 to-surface-3 bg-[length:800px_100%] animate-shimmer',
        className
      )}
    />
  )
}

export function ConversationSkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-2.5 w-8" />
        </div>
        <Skeleton className="h-2.5 w-4/5" />
      </div>
    </div>
  )
}
