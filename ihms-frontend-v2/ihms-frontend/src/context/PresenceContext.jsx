import React, { createContext, useContext, useEffect, useState } from 'react'
import { getSocket } from '../hooks/useSocket'

// The backend broadcasts `userOnline` / `userOffline` (with { userId }) globally
// to every connected socket on connect/disconnect — see socketHandler.js.
// We mirror that into a Set here so any component can check presence.
const PresenceContext = createContext({ onlineIds: new Set(), isOnline: () => false })

export function PresenceProvider({ children, ready }) {
  const [onlineIds, setOnlineIds] = useState(new Set())

  useEffect(() => {
    let socket = getSocket()
    let pollId

    const attach = (s) => {
      const onOnline = ({ userId }) => setOnlineIds((prev) => new Set(prev).add(userId))
      const onOffline = ({ userId }) => setOnlineIds((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
      s.on('userOnline', onOnline)
      s.on('userOffline', onOffline)
      return () => {
        s.off('userOnline', onOnline)
        s.off('userOffline', onOffline)
      }
    }

    let detach = null
    if (socket) {
      detach = attach(socket)
    } else {
      // useSocket()'s effect may not have run yet on first mount — poll briefly.
      pollId = setInterval(() => {
        const s = getSocket()
        if (s) {
          clearInterval(pollId)
          detach = attach(s)
        }
      }, 150)
    }

    return () => {
      if (pollId) clearInterval(pollId)
      if (detach) detach()
    }
  }, [ready])

  const isOnline = (userId) => onlineIds.has(userId)

  return (
    <PresenceContext.Provider value={{ onlineIds, isOnline }}>
      {children}
    </PresenceContext.Provider>
  )
}

export const usePresence = () => useContext(PresenceContext)
