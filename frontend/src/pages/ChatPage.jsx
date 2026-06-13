import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { getConversations } from "../services/api";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import AdminPanel from "../components/AdminPanel";

export default function ChatPage() {
  const { user } = useAuth();
  const socketRef = useSocket(user?.token);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getConversations();
        setConversations(res.data);
        if (res.data.length > 0) setActiveConv(res.data[0]);
      } catch {}
      setLoadingConvs(false);
    })();
  }, []);

  // Listen for real-time new messages to bump conversation order
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = (msg) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessageAt: msg.createdAt }
            : c
        ).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
      );
    };
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [socketRef]);

  const handleConvCreated = (conv) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === conv.id);
      if (exists) return prev;
      return [conv, ...prev];
    });
    setActiveConv(conv);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col">
        {loadingConvs ? (
          <div className="flex-1 flex items-center justify-center bg-white border-r border-gray-100">
            <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : (
          <Sidebar
            conversations={conversations}
            activeConvId={activeConv?.id}
            onSelectConv={setActiveConv}
            onConvCreated={handleConvCreated}
          />
        )}

        {/* Admin button at bottom of sidebar */}
        {user?.role === "ADMIN" && (
          <div className="border-t border-gray-100 bg-white p-3">
            <button
              onClick={() => setShowAdmin(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create user
            </button>
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeConv ? (
          <ChatWindow
            key={activeConv.id}
            conversation={activeConv}
            currentUserId={user?.userId}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-700">No conversation selected</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Pick one from the sidebar or start a new conversation.
            </p>
          </div>
        )}
      </div>

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}
