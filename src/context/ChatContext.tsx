import React, { createContext, useContext, useState } from 'react';
import { CONVERSATIONS as INITIAL_CONVERSATIONS, Conversation } from '@/data/chatData';

interface ChatContextValue {
  conversations: Conversation[];
  archiveChat: (id: string) => void;
  unarchiveChat: (id: string) => void;
  softDeleteChat: (id: string) => void;
  restoreChat: (id: string) => void;
  permanentlyDeleteChat: (id: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);

  function archiveChat(id: string) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, archived: true } : c)));
  }

  function unarchiveChat(id: string) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, archived: false } : c)));
  }

  function softDeleteChat(id: string) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, deletedAt: new Date().toISOString(), archived: false } : c,
      ),
    );
  }

  function restoreChat(id: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, deletedAt: undefined } : c)),
    );
  }

  function permanentlyDeleteChat(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <ChatContext.Provider
      value={{
        conversations,
        archiveChat,
        unarchiveChat,
        softDeleteChat,
        restoreChat,
        permanentlyDeleteChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatStore(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatStore must be used within ChatProvider');
  return ctx;
}
