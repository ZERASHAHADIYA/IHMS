import React, { useState, useEffect, useRef, useCallback } from "react";
import { getMessages, sendMessage, editMessage, deleteMessage } from "../services/api";
import { getSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";

function MessageBubble({ msg, isOwn, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.encryptedContent);

  const handleEdit = async () => {
    if (!editText.trim() || editText === msg.encryptedContent) { setEditing(false); return; }
    await onEdit(msg.id, editText);
    setEditing(false);
  };

  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? "order-2" : "order-1"}`}>
        {/* Sender name (for group convs) */}
        {!isOwn && (
          <p className="text-xs text-gray-400 mb-1 ml-1 font-medium">{msg.sender?.name}</p>
        )}

        <div className="relative flex items-end gap-1.5">
          {/* Action buttons */}
          {isOwn && !msg.isDeleted && showActions && (
            <div className="flex items-center gap-1 mb-1 order-1">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
                  title="Edit"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => onDelete(msg.id)}
                className="p-1 rounded-md bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition"
                title="Delete"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}

          <div className={`order-2 ${isOwn ? "" : ""}`}>
            {editing ? (
              <div className="flex gap-2 items-center">
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleEdit(); if (e.key === "Escape") setEditing(false); }}
                  className="text-sm px-3 py-2 border border-brand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[200px]"
                />
                <button onClick={handleEdit} className="text-xs bg-brand-500 text-white px-2.5 py-1.5 rounded-lg">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs text-gray-500 px-2.5 py-1.5 rounded-lg hover:bg-gray-100">Cancel</button>
              </div>
            ) : (
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isOwn
                    ? "bg-brand-500 text-white rounded-br-sm"
                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                } ${msg.isDeleted ? "opacity-50 italic" : ""}`}
              >
                {msg.encryptedContent}
                {msg.isEdited && !msg.isDeleted && (
                  <span className={`text-[10px] ml-1.5 ${isOwn ? "text-blue-200" : "text-gray-400"}`}>(edited)</span>
                )}
              </div>
            )}
          </div>
        </div>

        <p className={`text-[10px] mt-1 ${isOwn ? "text-right text-gray-400" : "text-gray-400 ml-1"}`}>{time}</p>
      </div>
    </div>
  );
}

export default function ChatWindow({ conversation, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const { user } = useAuth();

  const otherParticipant = !conversation.isGroup
    ? conversation.participants?.find((p) => p.userId !== currentUserId)
    : null;
  const displayName = conversation.isGroup
    ? conversation.name || "Group"
    : otherParticipant?.user?.name || "Chat";

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMessages(conversation.id);
      setMessages(res.data);
    } catch {}
    setLoading(false);
  }, [conversation.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Join socket room and listen for new messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("joinConversation", conversation.id);
    const handler = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [conversation.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const draft = text;
    setText("");
    try {
      const res = await sendMessage(conversation.id, draft);
      setMessages((prev) => {
        if (prev.find((m) => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
    } catch {
      setText(draft); // restore on error
    }
  };

  const handleEdit = async (id, content) => {
    try {
      const res = await editMessage(id, content);
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, encryptedContent: res.data.encryptedContent, isEdited: true } : m));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isDeleted: true, encryptedContent: "This message was deleted" } : m));
    } catch {}
  };

  // Group messages by date
  const groupedByDate = messages.reduce((acc, msg) => {
    const d = new Date(msg.createdAt).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    if (!acc[d]) acc[d] = [];
    acc[d].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat header */}
      <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700 flex-shrink-0">
          {displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{displayName}</h2>
          {conversation.isGroup && (
            <p className="text-xs text-gray-400">
              {conversation.participants?.length} members
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-gray-400 text-sm">No messages yet.</p>
              <p className="text-gray-300 text-xs mt-1">Send the first one!</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t border-gray-100" />
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{date}</span>
                <div className="flex-1 border-t border-gray-100" />
              </div>
              <div className="space-y-2">
                {msgs.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.senderId === currentUserId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message…"
            className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-xl transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
