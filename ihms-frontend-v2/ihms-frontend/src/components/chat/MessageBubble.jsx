import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Avatar from '../ui/Avatar'
import { formatMessageTime } from '../../utils/helpers'
import { editMessage, deleteMessage } from '../../services/api'
import clsx from 'clsx'

// Renders ✓ (sent) / ✓✓ gray (delivered) / ✓✓ blue (seen) for own messages.
// "Delivered"/"seen" means every OTHER participant's receipt has that timestamp set.
function ReceiptTicks({ msg, participantCount }) {
  const receipts = msg.receipts || []
  const othersCount = Math.max(participantCount - 1, 0)
  const othersReceipts = receipts.filter((r) => r.userId !== msg.senderId)

  const allSeen = othersCount > 0 && othersReceipts.length >= othersCount && othersReceipts.every((r) => r.seenAt)
  const allDelivered = othersCount > 0 && othersReceipts.length >= othersCount && othersReceipts.every((r) => r.deliveredAt)

  const status = allSeen ? 'seen' : allDelivered ? 'delivered' : 'sent'
  const label = status === 'seen' ? 'Seen' : status === 'delivered' ? 'Delivered' : 'Sent'

  return (
    <span
      className={clsx('inline-flex items-center ml-1', status === 'seen' ? 'text-brand-400' : 'text-ink-4/80')}
      title={label}
    >
      {status === 'sent' ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 13l4 4L13 9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 13l4 4L22 9" />
        </svg>
      )}
    </span>
  )
}

export default function MessageBubble({
  msg, isOwn, senderName, participantCount = 0,
  showAvatar = true, showName = true, tight = false,
  onUpdated, onDeleted,
}) {
  const [showActions, setShowActions] = useState(false)
  const [editing, setEditing]         = useState(false)
  const [editText, setEditText]       = useState(msg.encryptedContent)
  const [saving, setSaving]           = useState(false)

  const time = formatMessageTime(msg.createdAt)
  const isDeleted = msg.isDeleted

  const handleEdit = async () => {
    if (!editText.trim() || editText === msg.encryptedContent) { setEditing(false); return }
    setSaving(true)
    try {
      const res = await editMessage(msg.id, editText)
      onUpdated({ ...msg, encryptedContent: res.data.encryptedContent, isEdited: true })
      setEditing(false)
    } catch {}
    setSaving(false)
  }

  const handleDelete = async () => {
    try {
      await deleteMessage(msg.id)
      onDeleted(msg.id)
    } catch {}
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit() }
    if (e.key === 'Escape') setEditing(false)
  }

  // Corner shaping: the edge nearest the previous/next grouped message flattens,
  // giving the classic "stacked bubble" look used by Slack/Teams/WhatsApp.
  const corner = isOwn
    ? clsx('rounded-2xl', showAvatar ? 'rounded-tr-md' : 'rounded-tr-md', tight ? 'rounded-br-md' : 'rounded-br-md')
    : clsx('rounded-2xl', !showAvatar && 'rounded-tl-md')

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={clsx('flex gap-2.5 group', isOwn ? 'flex-row-reverse' : 'flex-row', tight ? 'mt-0.5' : 'mt-3')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar — only for others, only on the last bubble of a consecutive run */}
      {!isOwn && (
        <div className="w-7 flex-shrink-0">
          {showAvatar && <Avatar name={senderName} size="sm" className="mt-0.5" />}
        </div>
      )}

      <div className={clsx('flex flex-col max-w-[68%]', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && showName && (
          <span className="text-[12px] font-semibold text-ink-2 mb-1 ml-0.5">{senderName}</span>
        )}

        <div className={clsx('relative flex items-end gap-1.5', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          {/* Action buttons */}
          {isOwn && !isDeleted && showActions && !editing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-1 mb-1"
            >
              <button
                onClick={() => { setEditing(true); setEditText(msg.encryptedContent) }}
                className="p-1.5 rounded-lg bg-surface border border-surface-4 shadow-card hover:bg-surface-2 text-ink-3 hover:text-ink-2 transition-colors"
                title="Edit"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg bg-surface border border-surface-4 shadow-card hover:bg-danger/10 text-ink-3 hover:text-danger transition-colors"
                title="Delete"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </motion.div>
          )}

          {/* Bubble */}
          {editing ? (
            <div className="flex flex-col gap-1.5 w-72">
              <textarea
                autoFocus
                rows={2}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 text-sm bg-surface border border-brand-400 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditing(false)} className="text-xs text-ink-3 hover:text-ink px-2 py-1 rounded-md hover:bg-surface-3 transition-colors">
                  Cancel
                </button>
                <button onClick={handleEdit} disabled={saving} className="text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1 rounded-md transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={clsx(
                'relative px-3.5 py-2.5 text-[13.5px] leading-relaxed transition-shadow',
                corner,
                isOwn
                  ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-card'
                  : 'bg-surface border border-surface-4 text-ink shadow-card group-hover:shadow-elevated',
                isDeleted && 'opacity-50 italic'
              )}
            >
              <p className="whitespace-pre-wrap break-words">{msg.encryptedContent}</p>
              {msg.isEdited && !isDeleted && (
                <span className={clsx('text-[10px] ml-1', isOwn ? 'text-white/70' : 'text-ink-4')}>
                  (edited)
                </span>
              )}
            </div>
          )}
        </div>

        {!editing && (
          <span className={clsx('text-[10.5px] mt-1 text-ink-4 flex items-center tabular-nums', isOwn ? 'mr-1' : 'ml-1')}>
            {time}
            {isOwn && !isDeleted && <ReceiptTicks msg={msg} participantCount={participantCount} />}
          </span>
        )}
      </div>
    </motion.div>
  )
}
