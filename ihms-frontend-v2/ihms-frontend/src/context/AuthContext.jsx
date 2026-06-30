import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, changePassword as changePasswordApi } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await loginApi(email, password)
    const { token, role, name } = res.data
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userData = { token, role, name, userId: payload.userId, mustChangePassword: payload.mustChangePassword }
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const changePassword = async (newPassword) => {
    await changePasswordApi(newPassword)
    const updated = { ...user }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
