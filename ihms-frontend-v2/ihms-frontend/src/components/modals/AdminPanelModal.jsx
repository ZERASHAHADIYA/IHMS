import React, { useState } from 'react'
import { createUser } from '../../services/api'

const ROLES = ['STUDENT', 'FACULTY', 'ADMIN']
const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'MBA', 'MCA', 'Admin Office']

export default function AdminPanelModal({ onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', role: 'STUDENT', department: 'CSE', rollNo: '', employeeId: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setError(''); setResult(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setResult(null); setLoading(true)
    try {
      const payload = { ...form }
      if (form.role === 'STUDENT') delete payload.employeeId
      else delete payload.rollNo
      const res = await createUser(payload)
      setResult(res.data)
      setForm({ name: '', email: '', role: 'STUDENT', department: 'CSE', rollNo: '', employeeId: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-surface rounded-2xl shadow-modal w-full max-w-md animate-slide-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Create user</h2>
            <p className="text-xs text-ink-4 mt-0.5">Admin panel · A temporary password will be generated</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-3 text-ink-4 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2.5 bg-danger/8 border border-danger/20 rounded-lg text-sm text-danger">{error}</div>
          )}
          {result && (
            <div className="px-3 py-3 bg-success/8 border border-success/20 rounded-lg text-sm text-success space-y-1">
              <p className="font-medium">User created successfully!</p>
              <p className="text-xs font-mono bg-success/10 rounded px-2 py-1">
                Temp password: <strong>{result.temporaryPassword}</strong>
              </p>
              <p className="text-xs text-success/70">Share this with {result.user?.name} securely.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Full name</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Jane Doe"
                className="w-full px-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-lg placeholder-ink-4 text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="jane@institution.edu"
                className="w-full px-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-lg placeholder-ink-4 text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Role</label>
              <select value={form.role} onChange={(e) => set('role', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400">
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Department</label>
              <select value={form.department} onChange={(e) => set('department', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400">
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            {form.role === 'STUDENT' && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Roll number</label>
                <input type="text" value={form.rollNo} onChange={(e) => set('rollNo', e.target.value)} placeholder="e.g. 2024CSE001"
                  className="w-full px-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-lg placeholder-ink-4 text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
              </div>
            )}
            {(form.role === 'FACULTY' || form.role === 'ADMIN') && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-ink-3 mb-1.5">Employee ID</label>
                <input type="text" value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)} placeholder="e.g. FAC001"
                  className="w-full px-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-lg placeholder-ink-4 text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400" />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
            {loading ? 'Creating…' : 'Create user'}
          </button>
        </form>
      </div>
    </div>
  )
}
