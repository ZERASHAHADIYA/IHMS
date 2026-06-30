import React, { useState, useEffect } from 'react'
import Avatar from '../ui/Avatar'
import { RoleBadge } from '../ui/Badge'
import Spinner from '../ui/Spinner'
import { searchUsers, createConversation } from '../../services/api'
import clsx from 'clsx'

export default function NewGroupModal({ onClose, onCreated }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [selected, setSelected] = useState([])
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading]   = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(async () => {
      try { const res = await searchUsers(query); setResults(res.data) }
      catch { setResults([]) }
      setLoading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const toggle = (u) => setSelected((prev) =>
    prev.find((s) => s.id === u.id) ? prev.filter((s) => s.id !== u.id) : [...prev, u]
  )

  const handleCreate = async () => {
    if (selected.length < 2) { setError('Add at least 2 people.'); return }
    setCreating(true)
    setError('')
    try {
      const res = await createConversation({
        name: groupName.trim() || 'Group Chat',
        participantIds: selected.map((u) => u.id),
        isGroup: true,
      })
      onCreated(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create group.')
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-surface rounded-2xl shadow-modal w-full max-w-md animate-slide-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-4">
          <div>
            <h2 className="text-base font-semibold text-ink">New group</h2>
            <p className="text-xs text-ink-4 mt-0.5">Select 2 or more people</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-3 text-ink-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name (optional)"
            className="w-full px-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-xl placeholder-ink-4 text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
          />

          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people to add…"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-xl placeholder-ink-4 text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            />
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((u) => (
                <span key={u.id} className="flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {u.name}
                  <button onClick={() => toggle(u)} className="text-brand-400 hover:text-brand-700 leading-none">×</button>
                </span>
              ))}
            </div>
          )}

          <div className="max-h-52 overflow-y-auto space-y-0.5">
            {loading && <div className="flex justify-center py-4"><Spinner /></div>}
            {!loading && query && results.length === 0 && (
              <p className="text-sm text-ink-4 text-center py-4">No users found.</p>
            )}
            {!loading && !query && (
              <p className="text-sm text-ink-4 text-center py-4">Type to search people.</p>
            )}
            {results.map((u) => {
              const isChosen = !!selected.find((s) => s.id === u.id)
              return (
                <button
                  key={u.id}
                  onClick={() => toggle(u)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left',
                    isChosen ? 'bg-brand-50' : 'hover:bg-surface-2'
                  )}
                >
                  <Avatar name={u.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{u.name}</p>
                    <p className="text-xs text-ink-4 truncate">{u.department}</p>
                  </div>
                  <RoleBadge role={u.role} />
                  {isChosen && (
                    <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={creating || selected.length < 2}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            {creating
              ? 'Creating…'
              : selected.length < 2
              ? `Add ${Math.max(0, 2 - selected.length)} more to create group`
              : `Create group · ${selected.length} people`}
          </button>
        </div>
      </div>
    </div>
  )
}
