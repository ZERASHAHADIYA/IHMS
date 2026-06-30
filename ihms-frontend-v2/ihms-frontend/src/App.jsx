import React, { useState } from 'react'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import LoginPage from './pages/LoginPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import ChatPage from './pages/ChatPage'
import Spinner from './components/ui/Spinner'

export default function App() {
  const { user, loading } = useAuth()
  const [needsPwChange, setNeedsPwChange] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-3">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <ToastProvider>
        <LoginPage
          onLogin={(userData) => {
            setNeedsPwChange(userData.mustChangePassword || false)
          }}
        />
      </ToastProvider>
    )
  }

  if (needsPwChange) {
    return (
      <ToastProvider>
        <ChangePasswordPage onDone={() => setNeedsPwChange(false)} />
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <ChatPage />
    </ToastProvider>
  )
}
