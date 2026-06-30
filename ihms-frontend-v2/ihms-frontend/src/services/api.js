import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password })
export const getProfile = () => api.get('/auth/profile') // legacy JWT-payload-only endpoint, kept for compatibility

// My profile (real, full profile — backend: GET/PUT /users/profile)
export const getMyProfile = () => api.get('/users/profile')
export const updateMyProfile = (data) => api.put('/users/profile', data)

// Users (admin only)
export const createUser = (data) => api.post('/users', data)

// Password
export const changePassword = (newPassword) => api.patch('/password', { newPassword })

// Search
export const searchUsers = (q) => api.get(`/search?q=${encodeURIComponent(q)}`)

// Conversations
export const getConversations = () => api.get('/conversations')
export const createConversation = (data) => api.post('/conversations', data)
export const addParticipant = (convId, userId) => api.post(`/conversations/${convId}/participants`, { userId })
export const removeParticipant = (convId, userId) => api.delete(`/conversations/${convId}/participants/${userId}`)

// Group management (backend: PUT /conversations/:id, /:id/promote/:userId, /:id/demote/:userId, /:id/transfer/:userId)
export const updateGroup = (convId, data) => api.put(`/conversations/${convId}`, data) // { name?, description? }
export const promoteToAdmin = (convId, userId) => api.put(`/conversations/${convId}/promote/${userId}`)
export const demoteAdmin = (convId, userId) => api.put(`/conversations/${convId}/demote/${userId}`)
export const transferOwnership = (convId, userId) => api.put(`/conversations/${convId}/transfer/${userId}`)
export const leaveGroup = (convId) => api.delete(`/conversations/${convId}/leave`)
export const deleteGroup = (convId) => api.delete(`/conversations/${convId}`)

// Messages
export const getMessages = (conversationId) => api.get(`/messages/${conversationId}`)
export const sendMessage = (conversationId, content) => api.post('/messages', { conversationId, content })
export const editMessage = (id, content) => api.patch(`/messages/${id}`, { content })
export const deleteMessage = (id) => api.delete(`/messages/${id}`)

// Read receipts (backend: PATCH /messages/:conversationId/delivered | /seen)
export const markDelivered = (conversationId) => api.patch(`/messages/${conversationId}/delivered`)
export const markSeen = (conversationId) => api.patch(`/messages/${conversationId}/seen`)

export default api
