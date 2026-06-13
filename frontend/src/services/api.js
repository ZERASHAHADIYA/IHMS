import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({ baseURL: BASE_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const getProfile = () => api.get("/auth/profile");

// Users (admin only)
export const createUser = (data) => api.post("/users", data);

// Password
export const changePassword = (newPassword) =>
  api.post("/password/change", { newPassword });

// Search
export const searchUsers = (q) => api.get(`/search?q=${encodeURIComponent(q)}`);

// Conversations
export const getConversations = () => api.get("/conversations");
export const createConversation = (data) => api.post("/conversations", data);
export const addParticipant = (convId, userId) =>
  api.post(`/conversations/${convId}/participants`, { userId });
export const removeParticipant = (convId, userId) =>
  api.delete(`/conversations/${convId}/participants/${userId}`);

// Messages
export const getMessages = (conversationId) =>
  api.get(`/messages/${conversationId}`);
export const sendMessage = (conversationId, content) =>
  api.post("/messages", { conversationId, content });
export const editMessage = (id, content) =>
  api.patch(`/messages/${id}`, { content });
export const deleteMessage = (id) => api.delete(`/messages/${id}`);

export default api;
