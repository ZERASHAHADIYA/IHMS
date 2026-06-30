import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from '../ui/Avatar'
import { RoleBadge } from '../ui/Badge'
import Spinner from '../ui/Spinner'
import ConfirmDialog from '../ui/ConfirmDialog'
import { getConvDisplayName } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { usePresence } from '../../context/PresenceContext'
import {
  searchUsers, addParticipant, removeParticipant,
  updateGroup, promoteToAdmin, demoteAdmin, transferOwnership,
  leaveGroup, deleteGroup,
} from '../../services/api'
import clsx from 'clsx'

export default function InfoDrawer({ conversation, onClose, onConversationUpdated, onConversationDeleted, onLeftGroup }) {
  const { user } = useAuth()
  const { show } = useToast()
  const { isOnline } = usePresence()

  const [participants, setParticipants] = useState(conversation?.participants || [])
  const [name, setName] = useState(conversation?.name || '')
  const [description, setDescription] = useState(conversation?.description || '')
  const [editingDetails, setEditingDetails] = useState(false)
  const [savingDetails, setSavingDetails] = useState(false)

  const [showAddMember, setShowAddMember] = useState(false)
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [searching, setSearching] = useState(false)
  const [addingId, setAddingId] = useState(null)
  const [busyUserId, setBusyUserId] = useState(null) // promote/demote/transfer/remove in flight
  const [confirmAction, setConfirmAction] = useState(null) // { type, target? }

  useEffect(() => {
    setParticipants(conversation?.participants || [])
    setName(conversation?.name || '')
    setDescription(conversation?.description || '')
    setShowAddMember(false)
    setEditingDetails(false)
    setQuery('')
    setResults([])
  }, [conversation?.id])

  if (!conversation) return null

  const displayName = getConvDisplayName(conversation, user?.userId)
  const isGroup = conversation.isGroup
  const ownerId = conversation.createdById
  const currentMembership = participants.find((p) => p.userId === user?.userId)
  const isCurrentUserAdmin = !!currentMembership?.isAdmin
  const isCurrentUserOwner = ownerId === user?.userId

  const pushUpdate = (patch) => {
    const next = { ...conversation, participants, ...patch }
    onConversationUpdated?.(next)
  }
  const pushParticipants = (nextParticipants) => {
    setParticipants(nextParticipants)
    onConversationUpdated?.({ ...conversation, participants: nextParticipants })
  }

  // ── Rename / description (admins only) ───────────────────────────────────
  const handleSaveDetails = async () => {
    setSavingDetails(true)
    try {
      const res = await updateGroup(conversation.id, { name, description })
      pushUpdate({ name: res.data.conversation.name, description: res.data.conversation.description })
      setEditingDetails(false)
      show('Group details updated', 'success')
    } catch (err) {
      show(err.response?.data?.message || 'Could not update group.', 'error')
    }
    setSavingDetails(false)
  }

  // ── Add member ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showAddMember) return
    if (!query.trim()) { setResults([]); return }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const res = await searchUsers(query)
        const existingIds = new Set(participants.map((p) => p.userId))
        setResults(res.data.filter((u) => !existingIds.has(u.id)))
      } catch {
        setResults([])
      }
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query, showAddMember, participants])

  const handleAddMember = async (candidate) => {
    setAddingId(candidate.id)
    try {
      const res = await addParticipant(conversation.id, candidate.id)
      const newParticipant = { ...res.data, user: candidate }
      pushParticipants([...participants, newParticipant])
      setResults((prev) => prev.filter((u) => u.id !== candidate.id))
      setQuery('')
      show(`${candidate.name} added to the group`, 'success')
    } catch (err) {
      show(err.response?.data?.message || 'Could not add member.', 'error')
    }
    setAddingId(null)
  }

  // ── Remove / promote / demote / transfer ─────────────────────────────────
  const handleRemoveMember = async (participant) => {
    setBusyUserId(participant.userId)
    try {
      await removeParticipant(conversation.id, participant.userId)
      pushParticipants(participants.filter((p) => p.userId !== participant.userId))
      show(`${participant.user?.name || 'Member'} removed from the group`, 'success')
    } catch (err) {
      show(err.response?.data?.message || 'Could not remove member.', 'error')
    }
    setBusyUserId(null)
    setConfirmAction(null)
  }

  const handlePromote = async (participant) => {
    setBusyUserId(participant.userId)
    try {
      await promoteToAdmin(conversation.id, participant.userId)
      pushParticipants(participants.map((p) => p.userId === participant.userId ? { ...p, isAdmin: true } : p))
      show(`${participant.user?.name} is now an admin`, 'success')
    } catch (err) {
      show(err.response?.data?.message || 'Could not promote member.', 'error')
    }
    setBusyUserId(null)
  }

  const handleDemote = async (participant) => {
    setBusyUserId(participant.userId)
    try {
      await demoteAdmin(conversation.id, participant.userId)
      pushParticipants(participants.map((p) => p.userId === participant.userId ? { ...p, isAdmin: false } : p))
      show(`${participant.user?.name} is no longer an admin`, 'success')
    } catch (err) {
      show(err.response?.data?.message || 'Could not demote admin.', 'error')
    }
    setBusyUserId(null)
    setConfirmAction(null)
  }

  const handleTransferOwnership = async (participant) => {
    setBusyUserId(participant.userId)
    try {
      const res = await transferOwnership(conversation.id, participant.userId)
      pushUpdate({ createdById: res.data.conversation.createdById })
      show(`Ownership transferred to ${participant.user?.name}`, 'success')
    } catch (err) {
      show(err.response?.data?.message || 'Could not transfer ownership.', 'error')
    }
    setBusyUserId(null)
    setConfirmAction(null)
  }

  const handleLeaveGroup = async () => {
    setBusyUserId('__leave__')
    try {
      await leaveGroup(conversation.id)
      show('You left the group', 'success')
      onLeftGroup?.(conversation.id)
    } catch (err) {
      show(err.response?.data?.message || 'Could not leave group.', 'error')
    }
    setBusyUserId(null)
    setConfirmAction(null)
  }

  const handleDeleteGroup = async () => {
    setBusyUserId('__delete__')
    try {
      await deleteGroup(conversation.id)
      show('Group deleted', 'success')
      onConversationDeleted?.(conversation.id)
    } catch (err) {
      show(err.response?.data?.message || 'Could not delete group.', 'error')
    }
    setBusyUserId(null)
    setConfirmAction(null)
  }

  // ── Confirm dialog dispatch ───────────────────────────────────────────────
  const confirmConfig = (() => {
    if (!confirmAction) return null
    switch (confirmAction.type) {
      case 'remove':
        return {
          title: 'Remove member?',
          message: `${confirmAction.target.user?.name} will lose access to this group immediately.`,
          confirmLabel: 'Remove', danger: true,
          onConfirm: () => handleRemoveMember(confirmAction.target),
        }
      case 'demote':
        return {
          title: 'Demote admin?',
          message: `${confirmAction.target.user?.name} will no longer be able to manage this group.`,
          confirmLabel: 'Demote', danger: true,
          onConfirm: () => handleDemote(confirmAction.target),
        }
      case 'transfer':
        return {
          title: 'Transfer ownership?',
          message: `${confirmAction.target.user?.name} will become the group owner. You'll remain an admin but lose owner-only controls.`,
          confirmLabel: 'Transfer',
          onConfirm: () => handleTransferOwnership(confirmAction.target),
        }
      case 'leave':
        return {
          title: 'Leave this group?',
          message: "You'll need to be added back by an admin to rejoin.",
          confirmLabel: 'Leave group', danger: true,
          onConfirm: handleLeaveGroup,
        }
      case 'delete':
        return {
          title: 'Delete this group?',
          message: 'This permanently deletes the group and all its messages for every member. This cannot be undone.',
          confirmLabel: 'Delete group', danger: true,
          onConfirm: handleDeleteGroup,
        }
      default:
        return null
    }
  })()

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="h-full bg-surface border-l border-surface-4 flex-shrink-0 overflow-hidden"
    >
      <div className="flex flex-col h-full w-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-surface-4 flex-shrink-0">
          <h3 className="text-[13px] font-bold text-ink uppercase tracking-wide">Conversation Info</h3>
          <motion.button
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-3 text-ink-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero / profile card */}
          <div className="relative px-4 pt-7 pb-5 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-brand-500 to-brand-700" />
            <div className="relative mt-4 ring-4 ring-surface rounded-full shadow-elevated">
              <Avatar name={displayName} size="2xl" online={!isGroup && isOnline(participants.find((p) => p.userId !== user?.userId)?.userId)} />
            </div>

            {!editingDetails ? (
              <>
                <h2 className="mt-3.5 text-[16px] font-bold text-ink text-center tracking-tight">{displayName}</h2>
                {isGroup && <p className="text-[12px] text-ink-4 mt-0.5">{participants.length} members</p>}
                {conversation.description && (
                  <p className="mt-3 text-[12.5px] text-ink-3 text-center leading-relaxed max-w-[240px]">
                    {conversation.description}
                  </p>
                )}
                {isGroup && isCurrentUserAdmin && (
                  <button
                    onClick={() => setEditingDetails(true)}
                    className="mt-3 text-[11.5px] font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit name & description
                  </button>
                )}
              </>
            ) : (
              <div className="w-full mt-4 space-y-2.5 text-left">
                <div>
                  <label className="block text-[10.5px] font-bold text-ink-4 uppercase tracking-wide mb-1">Group name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-surface-2 border border-surface-4 rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-ink-4 uppercase tracking-wide mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-surface-2 border border-surface-4 rounded-lg text-ink resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingDetails(false)} className="px-3 py-1.5 text-[12px] font-medium rounded-lg bg-surface-2 hover:bg-surface-3 text-ink-2 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSaveDetails} disabled={savingDetails} className="px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50">
                    {savingDetails ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )}

            {conversation.isAnnouncement && (
              <span className="mt-2.5 text-[10px] font-bold uppercase px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full tracking-wide">
                Announcement channel
              </span>
            )}
          </div>

          {/* Members */}
          {isGroup && (
            <div className="px-4 py-4 border-t border-surface-4">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-bold text-ink-4 uppercase tracking-wide">
                  Members · {participants.length}
                </p>
                {isCurrentUserAdmin && (
                  <button
                    onClick={() => setShowAddMember((v) => !v)}
                    className={clsx(
                      'flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-colors',
                      showAddMember ? 'bg-brand-500 text-white' : 'text-brand-500 hover:bg-brand-50'
                    )}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    {showAddMember ? 'Close' : 'Add'}
                  </button>
                )}
              </div>

              {isCurrentUserAdmin && showAddMember && (
                <div className="mb-3 bg-surface-2 border border-surface-4 rounded-xl p-2.5 space-y-2">
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search people to add…"
                      className="w-full pl-8 pr-3 py-2 text-sm bg-surface border border-surface-4 rounded-lg placeholder-ink-4 text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-0.5">
                    {searching && <div className="flex justify-center py-3"><Spinner size="sm" /></div>}
                    {!searching && query && results.length === 0 && (
                      <p className="text-xs text-ink-4 text-center py-2">No matching users.</p>
                    )}
                    {!searching && !query && (
                      <p className="text-xs text-ink-4 text-center py-2">Type a name, email, or department.</p>
                    )}
                    {results.map((candidate) => (
                      <button
                        key={candidate.id}
                        onClick={() => handleAddMember(candidate)}
                        disabled={addingId === candidate.id}
                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-surface text-left transition-colors disabled:opacity-50"
                      >
                        <Avatar name={candidate.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{candidate.name}</p>
                          <p className="text-xs text-ink-4 truncate">{candidate.department}</p>
                        </div>
                        {addingId === candidate.id ? <Spinner size="sm" /> : <RoleBadge role={candidate.role} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-0.5">
                {participants.map((p) => {
                  const isSelf = p.userId === user?.userId
                  const isOwnerRow = p.userId === ownerId
                  const online = isOnline(p.userId)
                  return (
                    <div key={p.id || p.userId} className="flex items-center gap-2.5 py-2 px-2 rounded-xl hover:bg-surface-2 transition-colors group relative">
                      <Avatar name={p.user?.name} size="sm" online={online} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-ink truncate">
                          {p.user?.name}{isSelf && <span className="text-ink-4"> (you)</span>}
                        </p>
                        <p className="text-[11.5px] text-ink-4 truncate">
                          {online ? <span className="text-success font-medium">Online</span> : (p.user?.department || 'Offline')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isOwnerRow ? (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-warning/15 text-warning rounded-md tracking-wide">Owner</span>
                        ) : p.isAdmin && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-brand-50 text-brand-700 rounded-md tracking-wide">Admin</span>
                        )}

                        {/* Per-member admin menu */}
                        {isCurrentUserAdmin && !isSelf && (
                          <MemberMenu
                            participant={p}
                            isOwnerRow={isOwnerRow}
                            isCurrentUserOwner={isCurrentUserOwner}
                            busy={busyUserId === p.userId}
                            onPromote={() => handlePromote(p)}
                            onDemote={() => setConfirmAction({ type: 'demote', target: p })}
                            onTransfer={() => setConfirmAction({ type: 'transfer', target: p })}
                            onRemove={() => setConfirmAction({ type: 'remove', target: p })}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Placeholder sections */}
          <div className="px-4 py-3.5 border-t border-surface-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-ink-4 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
              </svg>
            </div>
            <div>
              <p className="text-[12.5px] font-semibold text-ink">Pinned Messages</p>
              <p className="text-[11.5px] text-ink-4">No pinned messages yet</p>
            </div>
          </div>

          {/* Danger zone */}
          {isGroup && (
            <div className="px-4 py-4 border-t border-surface-4">
              <p className="text-[11px] font-bold text-ink-4 uppercase tracking-wide mb-2.5">Group Actions</p>
              {isCurrentUserOwner ? (
                <button
                  onClick={() => setConfirmAction({ type: 'delete' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-danger hover:bg-danger/8 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete group
                </button>
              ) : (
                <button
                  onClick={() => setConfirmAction({ type: 'leave' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-danger hover:bg-danger/8 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Leave group
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {confirmConfig && (
          <ConfirmDialog
            {...confirmConfig}
            loading={busyUserId !== null}
            onCancel={() => setConfirmAction(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MemberMenu({ participant, isOwnerRow, isCurrentUserOwner, busy, onPromote, onDemote, onTransfer, onRemove }) {
  const [open, setOpen] = useState(false)

  if (busy) return <Spinner size="sm" />

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-ink-4 hover:text-ink-2 hover:bg-surface-3 transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-8 z-20 w-44 bg-surface border border-surface-4 rounded-xl shadow-modal py-1"
            >
              {!isOwnerRow && !participant.isAdmin && (
                <MenuItem onClick={() => { setOpen(false); onPromote() }}>Make admin</MenuItem>
              )}
              {!isOwnerRow && participant.isAdmin && (
                <MenuItem onClick={() => { setOpen(false); onDemote() }}>Remove admin</MenuItem>
              )}
              {isCurrentUserOwner && !isOwnerRow && participant.isAdmin && (
                <MenuItem onClick={() => { setOpen(false); onTransfer() }}>Transfer ownership</MenuItem>
              )}
              {!isOwnerRow && (
                <MenuItem danger onClick={() => { setOpen(false); onRemove() }}>Remove from group</MenuItem>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-3 py-2 text-[12.5px] font-medium transition-colors',
        danger ? 'text-danger hover:bg-danger/8' : 'text-ink-2 hover:bg-surface-2'
      )}
    >
      {children}
    </button>
  )
}
