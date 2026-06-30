import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'info', duration = 3500) => {
    const tid = ++id
    setToasts((prev) => [...prev, { id: tid, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== tid)), duration)
  }, [])

  const dismiss = (tid) => setToasts((prev) => prev.filter((t) => t.id !== tid))

  const typeStyle = {
    info:    'bg-brand-500 text-white',
    success: 'bg-success  text-white',
    error:   'bg-danger   text-white',
    warning: 'bg-warning  text-white',
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[100] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-float text-sm font-medium pointer-events-auto animate-slide-in ${typeStyle[t.type]}`}
          >
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100 text-base leading-none">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
