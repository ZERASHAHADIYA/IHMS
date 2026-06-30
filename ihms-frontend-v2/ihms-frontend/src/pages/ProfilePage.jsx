import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Avatar from '../components/ui/Avatar'
import { RoleBadge } from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { getMyProfile, updateMyProfile } from '../services/api'
import { useToast } from '../context/ToastContext'

export default function ProfilePage() {
  const { show } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', phoneNumber: '', profileImage: '' })

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyProfile()
        setProfile(res.data)
        setForm({
          name: res.data.name || '',
          bio: res.data.bio || '',
          phoneNumber: res.data.phoneNumber || '',
          profileImage: res.data.profileImage || '',
        })
      } catch {
        show('Could not load your profile.', 'error')
      }
      setLoading(false)
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateMyProfile(form)
      setProfile((p) => ({ ...p, ...res.data.user }))
      setEditing(false)
      show('Profile updated', 'success')
    } catch (err) {
      show(err.response?.data?.message || 'Could not update profile.', 'error')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-2">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-2">
        <p className="text-sm text-ink-4">Could not load profile.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-surface-2">
      <div className="max-w-xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-surface rounded-2xl border border-surface-4 shadow-card overflow-hidden"
        >
          <div className="h-24 bg-gradient-to-br from-brand-500 to-brand-700" />
          <div className="px-7 pb-7 -mt-12">
            <div className="flex items-end justify-between">
              <div className="ring-4 ring-surface rounded-full">
                <Avatar name={profile.name} size="2xl" />
              </div>
              {!editing && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setEditing(true)}
                  className="mb-1 px-3.5 py-2 text-[12.5px] font-semibold rounded-lg bg-surface-2 hover:bg-surface-3 text-ink-2 border border-surface-4 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit profile
                </motion.button>
              )}
            </div>

            {!editing ? (
              <>
                <h1 className="mt-4 text-[20px] font-bold text-ink tracking-tight">{profile.name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <RoleBadge role={profile.role} />
                  {profile.department && <span className="text-[12.5px] text-ink-4">{profile.department}</span>}
                </div>
                {profile.bio && <p className="mt-4 text-[13.5px] text-ink-2 leading-relaxed">{profile.bio}</p>}

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <InfoRow icon="mail" label="Email" value={profile.email} />
                  {profile.phoneNumber && <InfoRow icon="phone" label="Phone" value={profile.phoneNumber} />}
                  {profile.rollNo && <InfoRow icon="id" label="Roll Number" value={profile.rollNo} />}
                  {profile.employeeId && <InfoRow icon="id" label="Employee ID" value={profile.employeeId} />}
                  <InfoRow
                    icon="dot"
                    label="Status"
                    value={profile.isActive ? 'Online' : 'Offline'}
                    valueClass={profile.isActive ? 'text-success font-semibold' : 'text-ink-4'}
                  />
                  {profile.createdAt && (
                    <InfoRow icon="calendar" label="Member since" value={new Date(profile.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })} />
                  )}
                </div>
              </>
            ) : (
              <div className="mt-5 space-y-4">
                <Field label="Display name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                <div>
                  <label className="block text-[11px] font-bold text-ink-4 uppercase tracking-wide mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell others a bit about yourself…"
                    className="w-full px-3.5 py-2.5 text-[13.5px] bg-surface-2 border border-surface-4 rounded-xl text-ink resize-none placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400"
                  />
                </div>
                <Field label="Phone number" value={form.phoneNumber} onChange={(v) => setForm((f) => ({ ...f, phoneNumber: v }))} placeholder="e.g. +91 98765 43210" />
                <Field label="Profile image URL" value={form.profileImage} onChange={(v) => setForm((f) => ({ ...f, profileImage: v }))} placeholder="https://…" />

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-[13px] font-medium rounded-lg bg-surface-2 hover:bg-surface-3 text-ink-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <p className="text-[11.5px] text-ink-4 text-center mt-4">
          Email, role, department, and IDs are managed by your institution and can't be changed here.
        </p>
      </div>
    </div>
  )
}

const ICONS = {
  mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone: 'M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  id: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  dot: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
}

function InfoRow({ icon, label, value, valueClass }) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-surface-2 border border-surface-4">
      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-ink-3 flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon]} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10.5px] font-bold text-ink-4 uppercase tracking-wide">{label}</p>
        <p className={`text-[13px] ${valueClass || 'text-ink'} truncate`}>{value}</p>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-ink-4 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 text-[13.5px] bg-surface-2 border border-surface-4 rounded-xl text-ink placeholder-ink-4 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400"
      />
    </div>
  )
}
