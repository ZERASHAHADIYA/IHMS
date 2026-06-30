import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { PresenceProvider } from '../context/PresenceContext'
import { useSocket } from '../hooks/useSocket'
import { getConversations } from '../services/api'
import NavRail from '../components/layout/NavRail'
import ConversationPanel from '../components/layout/ConversationPanel'
import ChatWindow from '../components/chat/ChatWindow'
import InfoDrawer from '../components/chat/InfoDrawer'
import NewMessageModal from '../components/modals/NewMessageModal'
import NewGroupModal from '../components/modals/NewGroupModal'
import AdminPanelModal from '../components/modals/AdminPanelModal'
import EmptyState from '../components/ui/EmptyState'
import Avatar from '../components/ui/Avatar'
import { RoleBadge } from '../components/ui/Badge'
import ChangePasswordPage from './ChangePasswordPage'
import ProfilePage from './ProfilePage'

export default function ChatPage() {
  const { user } = useAuth()
  const socketRef = useSocket(user?.token)

  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv]       = useState(null)
  const [loadingConvs, setLoadingConvs]   = useState(true)
  const [activeTab, setActiveTab]         = useState('chats')
  const [filter, setFilter]               = useState('all')
  const [infoOpen, setInfoOpen]           = useState(false)
  const [unreadMap, setUnreadMap]         = useState({})

  // Modals
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [showNewGroup, setShowNewGroup]     = useState(false)
  const [showAdmin, setShowAdmin]           = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  const loadConversations = useCallback(async () => {
    try {
      const res = await getConversations()
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.lastMessageAt || b.createdAt || 0) - new Date(a.lastMessageAt || a.createdAt || 0)
      )
      setConversations(sorted)
      if (!activeConv && sorted.length > 0) setActiveConv(sorted[0])
    } catch {}
    setLoadingConvs(false)
  }, [])

  useEffect(() => { loadConversations() }, [loadConversations])

  // Socket: bump conversation to top on new message + track unread
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    const onMessage = (msg) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === msg.conversationId ? { ...c, lastMessageAt: msg.createdAt } : c
        )
        return [...updated].sort(
          (a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
        )
      })
      setActiveConv((current) => {
        if (!current || current.id !== msg.conversationId) {
          setUnreadMap((u) => ({ ...u, [msg.conversationId]: (u[msg.conversationId] || 0) + 1 }))
        }
        return current
      })
    }

    const onNewConversation = (conv) => {
      setConversations((prev) => {
        if (prev.find((c) => c.id === conv.id)) return prev
        return [conv, ...prev]
      })
    }

    socket.on('newMessage', onMessage)
    socket.on('newConversation', onNewConversation)
    return () => {
      socket.off('newMessage', onMessage)
      socket.off('newConversation', onNewConversation)
    }
  }, [socketRef])

  const handleSelectConv = (conv) => {
    setActiveConv(conv)
    setInfoOpen(false)
    setUnreadMap((u) => ({ ...u, [conv.id]: 0 }))
  }

  const handleConvCreated = (conv) => {
    setConversations((prev) => {
      if (prev.find((c) => c.id === conv.id)) return prev
      return [conv, ...prev]
    })
    setActiveConv(conv)
    setShowNewMessage(false)
    setShowNewGroup(false)
  }

  const handleConversationUpdated = (updatedConv) => {
    setActiveConv((current) => (current?.id === updatedConv.id ? updatedConv : current))
    setConversations((prev) => prev.map((c) => (c.id === updatedConv.id ? updatedConv : c)))
  }

  // Bubbled up from InfoDrawer after the current user leaves or deletes a group
  const handleConversationRemoved = (convId) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId))
    setActiveConv((current) => (current?.id === convId ? null : current))
    setInfoOpen(false)
  }

  const renderMiddlePanel = () => {
    switch (activeTab) {
      case 'announcements':
        return (
          <ConversationPanel
            conversations={conversations.filter((c) => c.isAnnouncement)}
            loading={loadingConvs}
            activeConvId={activeConv?.id}
            onSelectConv={handleSelectConv}
            onNewMessage={() => setShowNewMessage(true)}
            onNewGroup={() => setShowNewGroup(true)}
            filter={filter}
            onFilterChange={setFilter}
            unreadMap={unreadMap}
          />
        )
      case 'people':
        return <DirectoryPanel />
      case 'settings':
        return (
          <SettingsPanel
            user={user}
            onCreateUser={user?.role === 'ADMIN' ? () => setShowAdmin(true) : null}
            onChangePassword={() => setShowChangePassword(true)}
            onViewProfile={() => setActiveTab('profile')}
          />
        )
      default:
        return (
          <ConversationPanel
            conversations={conversations}
            loading={loadingConvs}
            activeConvId={activeConv?.id}
            onSelectConv={handleSelectConv}
            onNewMessage={() => setShowNewMessage(true)}
            onNewGroup={() => setShowNewGroup(true)}
            filter={filter}
            onFilterChange={setFilter}
            unreadMap={unreadMap}
          />
        )
    }
  }

  return (
    <PresenceProvider ready={!!socketRef.current}>
    <div className="flex h-screen overflow-hidden bg-surface-3">
      <NavRail activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'profile' ? (
        <ProfilePage />
      ) : (
        <>
          {renderMiddlePanel()}

          {/* Chat + Info Drawer — chat takes 100% of remaining width; the drawer
              animates its own width in/out via Framer Motion instead of being
              permanently reserved space. */}
          <div className="flex-1 flex overflow-hidden min-w-0">
            {activeConv && (activeTab === 'chats' || activeTab === 'announcements') ? (
              <ChatWindow
                key={activeConv.id}
                conversation={activeConv}
                infoOpen={infoOpen}
                onInfoOpen={() => setInfoOpen((v) => !v)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-surface-2">
                <EmptyState
                  size="lg"
                  icon={
                    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  }
                  title="No conversation selected"
                  subtitle="Choose a conversation from the left, or start something new."
                />
              </div>
            )}

            <AnimatePresence>
              {infoOpen && activeConv && (
                <InfoDrawer
                  key="info-drawer"
                  conversation={activeConv}
                  onClose={() => setInfoOpen(false)}
                  onConversationUpdated={handleConversationUpdated}
                  onConversationDeleted={handleConversationRemoved}
                  onLeftGroup={handleConversationRemoved}
                />
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showNewMessage && (
          <NewMessageModal onClose={() => setShowNewMessage(false)} onCreated={handleConvCreated} />
        )}
        {showNewGroup && (
          <NewGroupModal onClose={() => setShowNewGroup(false)} onCreated={handleConvCreated} />
        )}
        {showAdmin && (
          <AdminPanelModal onClose={() => setShowAdmin(false)} />
        )}
        {showChangePassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm overflow-y-auto"
          >
            <ChangePasswordPage
              onDone={() => setShowChangePassword(false)}
              onCancel={() => setShowChangePassword(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PresenceProvider>
  )
}

// ── Inline lightweight panels for non-chat tabs ──────────────────────────────

function DirectoryPanel() {
  return (
    <div className="flex flex-col h-full w-[300px] bg-surface border-r border-surface-4 flex-shrink-0">
      <div className="px-4 pt-5 pb-3.5 border-b border-surface-4">
        <h2 className="text-[17px] font-bold text-ink tracking-tight">Directory</h2>
        <p className="text-[12px] text-ink-4 mt-0.5">Browse faculty & students</p>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          title="Coming soon"
          subtitle="A full staff and student directory with department filters will appear here."
        />
      </div>
    </div>
  )
}

function SettingRow({ icon, title, subtitle, onClick, danger }) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-surface-2 text-left transition-colors"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-danger/10 text-danger' : 'bg-brand-50 text-brand-500'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold ${danger ? 'text-danger' : 'text-ink'}`}>{title}</p>
        <p className="text-[11.5px] text-ink-4 truncate">{subtitle}</p>
      </div>
      <svg className="w-4 h-4 text-ink-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </motion.button>
  )
}

function SettingsPanel({ user, onCreateUser, onChangePassword, onViewProfile }) {
  return (
    <div className="flex flex-col h-full w-[300px] bg-surface border-r border-surface-4 flex-shrink-0">
      <div className="px-4 pt-5 pb-3.5 border-b border-surface-4">
        <h2 className="text-[17px] font-bold text-ink tracking-tight">Settings</h2>
        <p className="text-[12px] text-ink-4 mt-0.5">Manage your account & preferences</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Profile card */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onViewProfile}
          className="relative w-full rounded-2xl overflow-hidden border border-surface-4 shadow-card text-left"
        >
          <div className="h-12 bg-gradient-to-br from-brand-500 to-brand-700" />
          <div className="px-4 pb-4 pt-0 flex flex-col items-center text-center -mt-7">
            <div className="ring-4 ring-surface rounded-full">
              <Avatar name={user?.name} size="xl" />
            </div>
            <p className="mt-2.5 text-[14px] font-bold text-ink">{user?.name}</p>
            <div className="mt-1"><RoleBadge role={user?.role} /></div>
            <p className="mt-2 text-[11px] font-semibold text-brand-500">View full profile →</p>
          </div>
        </motion.button>

        <div className="space-y-0.5">
          <p className="text-[10.5px] font-bold text-ink-4 uppercase tracking-wider px-3.5 mb-1">Account</p>
          <SettingRow
            onClick={onChangePassword}
            title="Change password"
            subtitle="Update your login password"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            }
          />
          {onCreateUser && (
            <SettingRow
              onClick={onCreateUser}
              title="Create user"
              subtitle="Open the admin panel"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            />
          )}
        </div>

        <div className="space-y-0.5">
          <p className="text-[10.5px] font-bold text-ink-4 uppercase tracking-wider px-3.5 mb-1">Preferences</p>
          <ThemeToggle />
          <div className="px-3.5 py-3 rounded-xl flex items-center gap-3 opacity-60">
            <div className="w-9 h-9 rounded-xl bg-surface-3 flex items-center justify-center text-ink-4 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-ink-2">Notifications</p>
              <p className="text-[11.5px] text-ink-4">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <div className="px-3.5 py-3 rounded-xl flex items-center gap-3 hover:bg-surface-2 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
        {isDark ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink">Appearance</p>
        <p className="text-[11.5px] text-ink-4">{isDark ? 'Dark mode' : 'Light mode'}</p>
      </div>
      <button
        onClick={toggleTheme}
        role="switch"
        aria-checked={isDark}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isDark ? 'bg-brand-500' : 'bg-surface-4'}`}
      >
        <motion.span
          animate={{ x: isDark ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-card"
        />
      </button>
    </div>
  )
}
