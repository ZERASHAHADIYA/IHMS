import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  const { user, loading } = useAuth();
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage
        onLogin={(userData) => {
          // Backend sets isFirstLogin flag — check via role or a flag in response
          // For now check if the stored token has isFirstLogin
          setNeedsPasswordChange(userData.isFirstLogin || false);
        }}
      />
    );
  }

  if (needsPasswordChange) {
    return <ChangePasswordPage onDone={() => setNeedsPasswordChange(false)} />;
  }

  return <ChatPage />;
}
