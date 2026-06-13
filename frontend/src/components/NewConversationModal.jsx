import React, { useState, useEffect } from "react";
import { searchUsers, createConversation } from "../services/api";

export default function NewConversationModal({ onClose, onCreated }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
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

  const toggleSelect = (user) => {
    setSelected((prev) =>
      prev.find((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (selected.length === 0) { setError("Select at least one person."); return; }
    if (selected.length > 1) setIsGroup(true);
    setCreating(true);
    setError("");
    try {
      const res = await createConversation({
        name: isGroup ? groupName || "Group Chat" : undefined,
        participantIds: selected.map((u) => u.id),
        isGroup: selected.length > 1 || isGroup,
      });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create conversation.");
    } finally {
      setCreating(false);
    }
  };

  const roleColor = (role) => {
    if (role === "ADMIN") return "bg-red-100 text-red-600";
    if (role === "FACULTY") return "bg-blue-100 text-blue-600";
    return "bg-green-100 text-green-600";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">New conversation</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Group toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGroup(!isGroup)}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${isGroup ? "bg-brand-500" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transform transition-transform ${isGroup ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm text-gray-600">Group conversation</span>
          </div>

          {isGroup && (
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name (optional)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          )}

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or department"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((u) => (
                <span key={u.id} className="flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {u.name}
                  <button onClick={() => toggleSelect(u)} className="text-brand-400 hover:text-brand-700 ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-52 overflow-y-auto space-y-1">
            {loading && <p className="text-sm text-gray-400 text-center py-3">Searching…</p>}
            {!loading && query && results.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-3">No users found.</p>
            )}
            {results.map((u) => {
              const isChosen = selected.find((s) => s.id === u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => toggleSelect(u)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left ${isChosen ? "bg-brand-50" : "hover:bg-gray-50"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                    {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.department}</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${roleColor(u.role)}`}>
                    {u.role}
                  </span>
                  {isChosen && (
                    <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={creating || selected.length === 0}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-xl transition"
          >
            {creating ? "Creating…" : `Start conversation${selected.length > 1 ? " with " + selected.length + " people" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
