import React, { useState, useEffect } from "react";
import { searchUsers, createConversation } from "../services/api";

const roleColor = (role) => {
  if (role === "ADMIN") return "bg-red-100 text-red-600";
  if (role === "FACULTY") return "bg-blue-100 text-blue-600";
  return "bg-green-100 text-green-600";
};

export default function NewMessageModal({ onClose, onCreated }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(query);
        setResults(res.data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (user) => {
    setCreating(true);
    setError("");
    try {
      const res = await createConversation({
        participantIds: [user.id],
        isGroup: false,
      });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not start conversation.");
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">New message</h2>
            <p className="text-xs text-gray-400 mt-0.5">Search and tap a person to start chatting</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or department"
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-0.5">
            {loading && <p className="text-sm text-gray-400 text-center py-6">Searching…</p>}
            {!loading && query && results.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No users found.</p>
            )}
            {!loading && !query && (
              <p className="text-sm text-gray-400 text-center py-6">Type a name to search.</p>
            )}
            {results.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSelect(u)}
                disabled={creating}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition text-left disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-xs font-semibold text-brand-600 flex-shrink-0">
                  {(u.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.department}</p>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${roleColor(u.role)}`}>
                  {u.role}
                </span>
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
