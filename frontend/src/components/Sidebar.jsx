import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { disconnectSocket } from "../hooks/useSocket";
import NewConversationModal from "./NewConversationModal";

function Avatar({ name, size = "md" }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function ConversationItem({ conv, currentUserId, isActive, onClick }) {
  const isGroup = conv.isGroup;
  const otherParticipants = conv.participants?.filter(
    (p) => p.userId !== currentUserId
  );
  const displayName = isGroup
    ? conv.name || "Group"
    : otherParticipants?.[0]?.user?.name || "Unknown";

  const lastMsg = conv.lastMessageAt
    ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition text-left ${
        isActive ? "bg-brand-50 border border-brand-100" : "hover:bg-gray-50"
      }`}
    >
      <Avatar name={displayName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium truncate ${isActive ? "text-brand-700" : "text-gray-800"}`}>
            {displayName}
          </span>
          {lastMsg && <span className="text-xs text-gray-400 flex-shrink-0 ml-1">{lastMsg}</span>}
        </div>
        {isGroup && (
          <span className="text-xs text-gray-400 mt-0.5 block">
            {otherParticipants?.length + 1} members
          </span>
        )}
      </div>
    </button>
  );
}

export default function Sidebar({ conversations, activeConvId, onSelectConv, onConvCreated }) {
  const { user, logout } = useAuth();
  const [showNewConv, setShowNewConv] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) => {
    const other = c.participants?.find((p) => p.userId !== user?.userId);
    const name = c.isGroup ? c.name : other?.user?.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const handleLogout = () => {
    disconnectSocket();
    logout();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Messages</h1>
            <p className="text-xs text-gray-400 mt-0.5">{user?.name}</p>
          </div>
          <div className="flex items-center gap-1">
            {user?.role === "ADMIN" && (
              <span className="text-[10px] font-semibold uppercase tracking-wide bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition ml-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            <p>No conversations yet.</p>
            <p className="mt-1 text-xs">Start one below.</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              currentUserId={user?.userId}
              isActive={conv.id === activeConvId}
              onClick={() => onSelectConv(conv)}
            />
          ))
        )}
      </div>

      {/* New conversation button */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => setShowNewConv(true)}
          className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2.5 rounded-xl transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New conversation
        </button>
      </div>

      {showNewConv && (
        <NewConversationModal
          onClose={() => setShowNewConv(false)}
          onCreated={(conv) => {
            setShowNewConv(false);
            onConvCreated(conv);
          }}
        />
      )}
    </div>
  );
}
