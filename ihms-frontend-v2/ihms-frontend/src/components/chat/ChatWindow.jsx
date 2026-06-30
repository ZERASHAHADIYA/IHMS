import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import Avatar from '../ui/Avatar'
import Spinner from '../ui/Spinner'
import EmptyState from '../ui/EmptyState'
import { getMessages, sendMessage, markDelivered, markSeen } from '../../services/api'
import { getSocket } from '../../hooks/useSocket'
import { useAuth } from '../../context/AuthContext'
import { usePresence } from '../../context/PresenceContext'
import { getConvDisplayName, formatDateGroup } from '../../utils/helpers'
import clsx from 'clsx'

const GROUP_WINDOW_MS = 4 * 60 * 1000 // messages from the same sender within 4 min stack together

export default function ChatWindow({ conversation, onInfoOpen, infoOpen }) {
  const { user } = useAuth()
  const { isOnline } = usePresence()
  const [messages, setMessages]     = useState([])
  const [text, setText]             = useState('')
  const [loading, setLoading]       = useState(true)
  const [sending, setSending]       = useState(false)
  const [typingUserIds, setTypingUserIds] = useState([])
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const typingTimeout = useRef(null)
  const isTypingRef = useRef(false)

  const displayName = getConvDisplayName(conversation, user?.userId)
  const isGroup = conversation?.isGroup
  const memberCount = conversation?.participants?.length || 0
  const otherParticipant = !isGroup
    ? conversation.participants?.find((p) => p.userId !== user?.userId)
    : null
  const otherOnline = !isGroup && otherParticipant ? isOnline(otherParticipant.userId) : false

  const participantName = (userId) =>
    conversation.participants?.find((p) => p.userId === userId)?.user?.name || 'Someone'

  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMessages(conversation.id)
      setMessages(res.data)
    } catch {}
    setLoading(false)
  }, [conversation.id])

  useEffect(() => {
    setMessages([])
    setText('')
    loadMessages()
    inputRef.current?.focus()
    markDelivered(conversation.id).catch(() => {})
    markSeen(conversation.id).catch(() => {})
  }, [loadMessages])

  // Socket: join room + listen for new messages
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    socket.emit('joinConversation', conversation.id)

    const onMessage = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    const onTyping = ({ userId }) => {
      if (userId === user?.userId) return
      setTypingUserIds((prev) => prev.includes(userId) ? prev : [...prev, userId])
    }
    const onStopTyping = ({ userId }) => {
      setTypingUserIds((prev) => prev.filter((id) => id !== userId))
    }

    const upsertReceipt = (userId, field) => {
      setMessages((prev) =>
        prev.map((m) => {
          const receipts = m.receipts || []
          const idx = receipts.findIndex((r) => r.userId === userId)
          const now = new Date().toISOString()
          let nextReceipts
          if (idx === -1) {
            nextReceipts = [...receipts, { userId, [field]: now }]
          } else {
            nextReceipts = receipts.map((r, i) => (i === idx ? { ...r, [field]: r[field] || now } : r))
          }
          return { ...m, receipts: nextReceipts }
        })
      )
    }
    const onDelivered = ({ userId }) => upsertReceipt(userId, 'deliveredAt')
    const onSeen = ({ userId }) => upsertReceipt(userId, 'seenAt')

    socket.on('newMessage', onMessage)
    socket.on('userTyping', onTyping)
    socket.on('userStoppedTyping', onStopTyping)
    socket.on('messagesDelivered', onDelivered)
    socket.on('messagesSeen', onSeen)

    return () => {
      socket.off('newMessage', onMessage)
      socket.off('userTyping', onTyping)
      socket.off('userStoppedTyping', onStopTyping)
      socket.off('messagesDelivered', onDelivered)
      socket.off('messagesSeen', onSeen)
    }
  }, [conversation.id])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUserIds])

  const handleTextChange = (e) => {
    setText(e.target.value)
    const socket = getSocket()
    if (socket && !isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing', { conversationId: conversation.id })
    }
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false
      socket?.emit('stopTyping', { conversationId: conversation.id })
    }, 2000)
  }

  const stopTypingNow = () => {
    clearTimeout(typingTimeout.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      getSocket()?.emit('stopTyping', { conversationId: conversation.id })
    }
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!text.trim() || sending) return
    const draft = text.trim()
    setText('')
    stopTypingNow()
    setSending(true)
    try {
      const res = await sendMessage(conversation.id, draft)
      setMessages((prev) => {
        if (prev.find((m) => m.id === res.data.id)) return prev
        return [...prev, res.data]
      })
    } catch {
      setText(draft)
    }
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleUpdated = (updatedMsg) => {
    setMessages((prev) => prev.map((m) => m.id === updatedMsg.id ? updatedMsg : m))
  }
  const handleDeleted = (id) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isDeleted: true, encryptedContent: 'This message was deleted' } : m))
  }

  // Group messages by date, then annotate consecutive-sender stacking within each day
  const groups = messages.reduce((acc, msg) => {
    const label = formatDateGroup(msg.createdAt)
    if (!acc.length || acc[acc.length - 1].label !== label) {
      acc.push({ label, messages: [msg] })
    } else {
      acc[acc.length - 1].messages.push(msg)
    }
    return acc
  }, [])

  return (
    <div className="flex flex-col h-full bg-surface-2 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3.5 pl-5 pr-4 h-[64px] bg-surface/95 backdrop-blur-sm border-b border-surface-4 flex-shrink-0 z-10">
        <Avatar name={displayName} size="lg" online={isGroup ? undefined : otherOnline} />
        <div className="flex-1 min-w-0">
          <h2 className="text-[14.5px] font-bold text-ink truncate tracking-tight leading-tight">{displayName}</h2>
          <p className="text-[12px] text-ink-4 leading-tight mt-0.5">
            {isGroup
              ? `${memberCount} member${memberCount === 1 ? '' : 's'}`
              : otherOnline ? <span className="text-success font-medium">Online</span> : (otherParticipant?.user?.department || otherParticipant?.user?.role || '')}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            className="p-2.5 rounded-xl hover:bg-surface-3 text-ink-3 hover:text-ink transition-colors"
            title="Search messages"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={onInfoOpen}
            className={clsx(
              'p-2.5 rounded-xl transition-colors',
              infoOpen ? 'bg-brand-50 text-brand-500' : 'hover:bg-surface-3 text-ink-3 hover:text-ink'
            )}
            title="Conversation info"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            title="No messages yet"
            subtitle={`Send the first message to start the conversation with ${displayName}.`}
          />
        ) : (
          <div>
            {groups.map(({ label, messages: msgs }) => (
              <div key={label}>
                <div className="flex items-center gap-3 my-4 sticky top-0 z-[1]">
                  <div className="flex-1 border-t border-surface-4" />
                  <span className="text-[10.5px] font-bold text-ink-4 uppercase tracking-wider bg-surface-2 px-2.5 py-0.5 rounded-full border border-surface-4">
                    {label}
                  </span>
                  <div className="flex-1 border-t border-surface-4" />
                </div>

                <div>
                  {msgs.map((msg, i) => {
                    const prev = msgs[i - 1]
                    const next = msgs[i + 1]
                    const sameSenderAsPrev = prev && prev.senderId === msg.senderId &&
                      (new Date(msg.createdAt) - new Date(prev.createdAt)) < GROUP_WINDOW_MS && !prev.isDeleted
                    const sameSenderAsNext = next && next.senderId === msg.senderId &&
                      (new Date(next.createdAt) - new Date(msg.createdAt)) < GROUP_WINDOW_MS && !msg.isDeleted

                    return (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isOwn={msg.senderId === user?.userId}
                        senderName={msg.sender?.name || ''}
                        participantCount={memberCount}
                        showAvatar={!sameSenderAsNext}
                        showName={!sameSenderAsPrev}
                        tight={sameSenderAsPrev}
                        onUpdated={handleUpdated}
                        onDeleted={handleDeleted}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <TypingIndicator names={typingUserIds.map(participantName)} />
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="bg-surface border-t border-surface-4 px-5 py-3.5 flex-shrink-0">
        <div className="flex items-end gap-2.5">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${displayName}…`}
              className={clsx(
                'w-full px-4 py-3 text-[13.5px] bg-surface-2 border border-surface-4 rounded-2xl resize-none placeholder-ink-4 text-ink',
                'focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all',
                'max-h-32 min-h-[44px]'
              )}
              style={{ height: 'auto', overflowY: text.split('\n').length > 3 ? 'auto' : 'hidden' }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: text.trim() ? 1.06 : 1 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 disabled:opacity-40 disabled:grayscale text-white shadow-card transition-all"
          >
            {sending ? (
              <Spinner size="sm" className="border-white/30 border-t-white" />
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
