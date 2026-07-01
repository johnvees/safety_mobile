import React, { createContext, useContext, useState } from 'react';
import {
  CONVERSATIONS as INITIAL_CONVERSATIONS,
  Conversation,
  ChatMessage,
  ChatAttachment,
  ChatReplyRef,
  nowTime,
} from '@/data/chatData';

interface ChatContextValue {
  conversations: Conversation[];
  archiveChat: (id: string) => void;
  unarchiveChat: (id: string) => void;
  softDeleteChat: (id: string) => void;
  restoreChat: (id: string) => void;
  permanentlyDeleteChat: (id: string) => void;
  pinChat: (id: string) => void;
  muteChat: (id: string) => void;
  blockContact: (id: string) => void;
  sendMessage: (
    conversationId: string,
    input: { text: string; attachments?: ChatAttachment[]; replyTo?: ChatReplyRef },
  ) => void;
  editMessage: (conversationId: string, messageId: string, text: string) => void;
  unsendMessage: (conversationId: string, messageId: string) => void;
  toggleStar: (conversationId: string, messageId: string) => void;
  forwardMessage: (message: ChatMessage, toConversationId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);

  function updateMessage(
    conversationId: string,
    messageId: string,
    updater: (m: ChatMessage) => ChatMessage,
  ) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: c.messages.map((m) => (m.id === messageId ? updater(m) : m)) }
          : c,
      ),
    );
  }

  function appendOutgoingMessage(
    conversationId: string,
    text: string,
    attachments?: ChatAttachment[],
    replyTo?: ChatReplyRef,
  ) {
    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dayKey = new Date().toDateString();
    const message: ChatMessage = {
      id,
      text,
      isMe: true,
      time: nowTime(),
      dayKey,
      attachments,
      replyTo,
      status: 'sent',
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, message],
              lastMessage: text || (attachments?.length ? 'Lampiran' : ''),
              time: message.time,
            }
          : c,
      ),
    );

    setTimeout(() => updateMessage(conversationId, id, (m) => ({ ...m, status: 'delivered' })), 800);
    setTimeout(() => updateMessage(conversationId, id, (m) => ({ ...m, status: 'read' })), 3300);
  }

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

  function pinChat(id: string) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
  }

  function muteChat(id: string) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, muted: !c.muted } : c)));
  }

  function blockContact(id: string) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c)));
  }

  function sendMessage(
    conversationId: string,
    input: { text: string; attachments?: ChatAttachment[]; replyTo?: ChatReplyRef },
  ) {
    appendOutgoingMessage(conversationId, input.text, input.attachments, input.replyTo);
  }

  function editMessage(conversationId: string, messageId: string, text: string) {
    updateMessage(conversationId, messageId, (m) => ({ ...m, text, edited: true }));
  }

  function unsendMessage(conversationId: string, messageId: string) {
    updateMessage(conversationId, messageId, (m) => ({
      ...m,
      deleted: true,
      text: '',
      attachments: undefined,
    }));
  }

  function toggleStar(conversationId: string, messageId: string) {
    updateMessage(conversationId, messageId, (m) => ({ ...m, starred: !m.starred }));
  }

  function forwardMessage(message: ChatMessage, toConversationId: string) {
    appendOutgoingMessage(toConversationId, message.text, message.attachments, undefined);
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
        pinChat,
        muteChat,
        blockContact,
        sendMessage,
        editMessage,
        unsendMessage,
        toggleStar,
        forwardMessage,
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
