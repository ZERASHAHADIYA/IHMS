import React from 'react'
import Avatar from '../ui/Avatar'

export default function TypingIndicator({ names = [] }) {
  if (!names.length) return null

  const label = names.length === 1
    ? `${names[0]} is typing…`
    : names.length === 2
    ? `${names[0]} and ${names[1]} are typing…`
    : 'Several people are typing…'

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Avatar name={names[0]} size="xs" />
      <div className="flex items-center gap-2 bg-surface border border-surface-4 shadow-card rounded-2xl rounded-bl-sm px-3 py-2">
        <div className="flex items-center gap-0.5">
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ink-4 inline-block" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ink-4 inline-block" />
          <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ink-4 inline-block" />
        </div>
        <span className="text-xs text-ink-3">{label}</span>
      </div>
    </div>
  )
}
