import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function ChangePasswordPage({ onDone, onCancel }) {
  const { changePassword } = useAuth()
  const { show } = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm]         = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  const isMandatory = !onCancel

  const strength = (() => {
    if (!newPassword) return 0
    let score = 0
    if (newPassword.length >= 8) score++
    if (newPassword.length >= 12) score++
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++
    if (/\d/.test(newPassword)) score++
    if (/[^A-Za-z0-9]/.test(newPassword)) score++
    return Math.min(score, 4)
  })()
  const strengthLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['bg-surface-4', 'bg-danger', 'bg-warning', 'bg-brand-400', 'bg-success'][strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirm) { setError("Passwords don't match."); return }
    setLoading(true)
    try {
      await changePassword(newPassword)
      show('Password changed successfully.', 'success')
      onDone?.()
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password.'
      setError(message)
      show(message, 'error')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-3 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-warning mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-ink">
            {isMandatory ? 'Set a new password' : 'Change your password'}
          </h1>
          <p className="text-sm text-ink-4 mt-1 max-w-xs mx-auto">
            {isMandatory
              ? 'Your temporary password must be changed before you can continue.'
              : 'Choose a strong new password for your account.'}
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-card border border-surface-4 p-6">
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-danger/8 border border-danger/20 rounded-lg text-sm text-danger">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="w-full px-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-lg placeholder-ink-4 text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColor : 'bg-surface-4'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-ink-4 mt-1">{strengthLabel}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-3 mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full px-3 py-2.5 text-sm bg-surface-2 border border-surface-4 rounded-lg placeholder-ink-4 text-ink focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
            </div>
            {newPassword && (
              <div className="space-y-1">
                {[
                  { label: 'At least 8 characters', ok: newPassword.length >= 8 },
                  { label: 'Passwords match', ok: newPassword === confirm && confirm.length > 0 },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${ok ? 'bg-success' : 'bg-surface-4'}`}>
                      {ok && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className={`text-xs ${ok ? 'text-success' : 'text-ink-4'}`}>{label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-surface-2 hover:bg-surface-3 border border-surface-4 text-ink-2 text-sm font-medium py-2.5 rounded-lg transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2.5 rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Saving…' : isMandatory ? 'Save password & continue' : 'Save password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
