import React from 'react'
import { motion } from 'framer-motion'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../context/AuthContext'
import { disconnectSocket } from '../../hooks/useSocket'
import clsx from 'clsx'

const NAV_ITEMS = [
  {
    id: 'chats',
    label: 'Chats',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'announcements',
    label: 'Announcements',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    id: 'people',
    label: 'Directory',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function NavRail({ activeTab, onTabChange }) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    disconnectSocket()
    logout()
  }

  return (
    <nav className="flex flex-col items-center gap-1 w-14 h-full bg-ink py-4 flex-shrink-0">
      {/* Logo */}
      <div className="mb-4 flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>

      <div className="flex-1 flex flex-col items-center gap-1 w-full px-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={item.label}
              whileHover={{ scale: isActive ? 1 : 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={clsx(
                'nav-rail-btn relative w-full flex items-center justify-center h-10 rounded-xl transition-colors duration-150',
                isActive ? 'text-white' : 'text-ink-4 hover:bg-white/10 hover:text-white'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 bg-brand-500 rounded-xl shadow-elevated"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="nav-tooltip">{item.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Bottom: user avatar + logout */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleLogout}
          title="Sign out"
          className="nav-rail-btn relative flex items-center justify-center w-10 h-10 rounded-xl text-ink-4 hover:bg-white/10 hover:text-white transition-colors"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="nav-tooltip">Sign out</span>
        </motion.button>
        <Avatar name={user?.name} size="sm" className="opacity-80" />
      </div>
    </nav>
  )
}
