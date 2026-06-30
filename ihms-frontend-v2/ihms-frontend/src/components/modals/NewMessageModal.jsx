import React, { useState, useEffect } from 'react'
import Avatar from '../ui/Avatar'
import { RoleBadge } from '../ui/Badge'
import Spinner from '../ui/Spinner'
import { searchUsers, createConversation } from '../../services/api'

export default function NewMessageModal({ onClose, onCreated }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await searchUsers(query)
        setResults(res.data)
      } catch { setResults([]) }
      setLoading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleSelect = async (u) => {
    setCreating(true)
    setError('')
    try {
      const res = await createConversation({ participantIds: [u.id], isGroup: false })
      onCreated(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start conversation.')
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-surface rounded-2xl shadow-modal w-full max-w-md animate-slide-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-4">
          <div>
            <h2 className="text-base font-semibold text-ink">New message</h2>
            <p className="text-xs text-ink-4 mt-0.5">Tap a person to start chatting</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-3 text-ink-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, department"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-xl placeholder-ink-4 text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-0.5">
            {loading && <div className="flex justify-center py-6"><Spinner /></div>}
            {!loading && query && results.length === 0 && (
              <p className="text-sm text-ink-4 text-center py-6">No users found.</p>
            )}
            {!loading && !query && (
              <p className="text-sm text-ink-4 text-center py-6">Type to search people.</p>
            )}
            {results.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSelect(u)}
                disabled={creating}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-2 transition-colors text-left disabled:opacity-50"
              >
                <Avatar name={u.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{u.name}</p>
                  <p className="text-xs text-ink-4 truncate">{u.department}</p>
                </div>
                <RoleBadge role={u.role} />
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </div>
    </div>
  )
}
