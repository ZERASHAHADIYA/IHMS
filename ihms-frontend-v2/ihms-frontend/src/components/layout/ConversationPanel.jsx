import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from '../ui/Avatar'
import { UnreadBadge } from '../ui/Badge'
import { ConversationSkeletonRow } from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import { getConvDisplayName, getConvSubtitle, formatTime } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { usePresence } from '../../context/PresenceContext'
import clsx from 'clsx'

const FILTERS = [
  { id: 'all',    label: 'All' },
  { id: 'direct', label: 'Direct' },
  { id: 'groups', label: 'Groups' },
]

function ConvItem({ conv, currentUserId, isActive, unread, onClick }) {
  const { isOnline } = usePresence()
  const name     = getConvDisplayName(conv, currentUserId)
  const subtitle = getConvSubtitle(conv)
  const timeStr  = formatTime(conv.lastMessageAt)
  const isGroup  = conv.isGroup
  const isAnnouncement = conv.isAnnouncement
  const otherParticipant = !isGroup ? conv.participants?.find((p) => p.userId !== currentUserId) : null
  const online = !isGroup && otherParticipant ? isOnline(otherParticipant.userId) : false

  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ x: isActive ? 0 : 2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.15 }}
      className={clsx(
        'relative w-full flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-xl text-left group',
        isActive ? 'bg-surface-4/70' : 'hover:bg-surface-2'
      )}
    >
      {isActive && (
        <motion.span
          layoutId="conv-active-bar"
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand-500"
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      )}

      <Avatar name={name} size="md" online={isGroup ? undefined : online} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <span className={clsx(
            'text-[13.5px] truncate',
            isActive ? 'font-semibold text-ink' : unread ? 'font-semibold text-ink' : 'font-medium text-ink-2'
          )}>
            {isAnnouncement && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 mr-1.5 align-middle" />
            )}
            {name}
          </span>
          <span className={clsx(
            'text-[10.5px] flex-shrink-0 tabular-nums',
            unread ? 'text-brand-500 font-semibold' : 'text-ink-4'
          )}>{timeStr}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5 gap-2">
          <p className={clsx(
            'text-[12.5px] truncate leading-tight',
            unread ? 'text-ink-2 font-medium' : 'text-ink-4'
          )}>{subtitle}</p>
          <UnreadBadge count={unread} />
        </div>
      </div>
    </motion.button>
  )
}

export default function ConversationPanel({
  conversations,
  loading,
  activeConvId,
  onSelectConv,
  onNewMessage,
  onNewGroup,
  filter,
  onFilterChange,
  unreadMap = {},
}) {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const filtered = conversations.filter((c) => {
    const name = getConvDisplayName(c, user?.userId).toLowerCase()
    const matchSearch = name.includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filter === 'direct') return !c.isGroup
    if (filter === 'groups') return c.isGroup
    return true
  })

  return (
    <div className="flex flex-col h-full w-[300px] bg-surface border-r border-surface-4 flex-shrink-0">
      {/* Header */}
      <div className="px-4 pt-5 pb-3.5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-ink tracking-tight">Messages</h2>
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onNewMessage}
              title="New direct message"
              className="p-2 rounded-lg hover:bg-surface-3 text-ink-3 hover:text-brand-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onNewGroup}
              title="New group"
              className="p-2 rounded-lg hover:bg-surface-3 text-ink-3 hover:text-brand-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <motion.div
          animate={{ scale: searchFocused ? 1.01 : 1 }}
          transition={{ duration: 0.15 }}
          className="relative"
        >
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search conversations…"
            className={clsx(
              'w-full pl-9 pr-3 py-2.5 text-[13px] bg-surface-2 border rounded-xl placeholder-ink-4 text-ink transition-all',
              searchFocused ? 'border-brand-400 ring-2 ring-brand-500/15 bg-surface' : 'border-surface-4'
            )}
          />
        </motion.div>

        {/* Filters */}
        <div className="relative flex gap-1 mt-3 p-0.5 bg-surface-2 rounded-lg">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={clsx(
                'relative flex-1 text-[12px] font-semibold px-3 py-1.5 rounded-md transition-colors z-10',
                filter === f.id ? 'text-white' : 'text-ink-3 hover:text-ink-2'
              )}
            >
              {filter === f.id && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 bg-brand-500 rounded-md -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-0.5">
        {loading ? (
          <div className="space-y-0.5 pt-1">
            {Array.from({ length: 7 }).map((_, i) => <ConversationSkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            title={search ? 'No results found' : 'No conversations yet'}
            subtitle={search ? 'Try a different name or department.' : 'Start a new chat to get the conversation going.'}
            action={!search && (
              <button
                onClick={onNewMessage}
                className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
              >
                Start a conversation →
              </button>
            )}
          />
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((conv) => (
              <motion.div
                key={conv.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <ConvItem
                  conv={conv}
                  currentUserId={user?.userId}
                  isActive={conv.id === activeConvId}
                  unread={unreadMap[conv.id] || 0}
                  onClick={() => onSelectConv(conv)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
