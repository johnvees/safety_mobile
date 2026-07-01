# WhatsApp-Parity Chat Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add read receipts + online status, voice messages, forward/star/date-separators, and pin/mute/block-chat to the existing `safety_mobile` chat module, matching the design in `docs/superpowers/specs/2026-07-01-whatsapp-parity-chat-design.md`.

**Architecture:** Lift message mutation (send/edit/unsend/star/status/forward) out of `ChatConversationScreen`'s local `useState` and into `ChatContext`, so conversations remain the single source of truth and forwarding/read-receipt timers work even if the origin screen unmounts. Extend the existing mock data shapes (`chatData.ts`) rather than introducing a new store. New UI (ticks, audio player, date pills, action sheets) follows the existing inline-`StyleSheet` screen pattern already used throughout the module.

**Tech Stack:** React Native (Expo 54), TypeScript, `@tabler/icons-react-native`, new dependency `expo-audio` (SDK54-current audio API — `expo-av` is deprecated, do not use it).

## Global Constraints

- Path alias `@/*` → `src/*` — always import with `@/...`.
- No test runner is configured in this repo (confirmed in `CLAUDE.md`). Every task's verification step is `npx tsc --noEmit` (must report `No errors found`) plus a manual Expo run-through described in the task — there is no unit test suite to add to.
- Screens/components style with inline `StyleSheet.create({...})` referencing `C` (colors) and `F` (typography) — follow this, do not introduce a new styling layer.
- All new user-facing strings are Bahasa Indonesia, matching existing copy (e.g. "Batal", "Hapus", "Balas").
- Icons only via the existing `Icon` component / `ICON_MAP` in `src/components/Icon.tsx` (Tabler icons) — do not import icon libraries directly into screens.
- Commit after every task.

---

### Task 1: Icon additions

**Files:**
- Modify: `src/components/Icon.tsx`

**Interfaces:**
- Produces: `Icon` accepts these new `name` values: `'mic'`, `'pin'`, `'pause-circle'`, `'checks'`, `'corner-up-right'`, `'ban'`.

- [ ] **Step 1: Add Tabler icon imports and map entries**

In `src/components/Icon.tsx`, add to the `@tabler/icons-react-native` import block (after `IconArchive`):

```ts
  IconMicrophone,
  IconPin,
  IconPlayerPause,
  IconChecks,
  IconCornerUpRight,
  IconBan,
} from '@tabler/icons-react-native';
```

(replace the existing closing `} from '@tabler/icons-react-native';` — this list just adds six more names before it)

Add to `ICON_MAP` (after `archive: IconArchive,`):

```ts
  mic: IconMicrophone,
  pin: IconPin,
  'pause-circle': IconPlayerPause,
  checks: IconChecks,
  'corner-up-right': IconCornerUpRight,
  ban: IconBan,
};
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: `No errors found` (this file has no logic to break, just confirms no typo in the import block)

- [ ] **Step 3: Commit**

```bash
git add src/components/Icon.tsx
git commit -m "feat: add mic/pin/pause/checks/forward/ban icons for chat parity features"
```

---

### Task 2: Data model + shared helpers

**Files:**
- Modify: `src/data/chatData.ts`

**Interfaces:**
- Produces:
  - `ChatMessage.status?: 'sent' | 'delivered' | 'read'`
  - `ChatMessage.starred?: boolean`
  - `ChatAttachment.type` now includes `'audio'`, plus `ChatAttachment.duration?: number` (seconds)
  - `Conversation.pinned?: boolean`, `Conversation.muted?: boolean`
  - `ChatProfile.online?: boolean`, `ChatProfile.lastSeen?: string`, `ChatProfile.blocked?: boolean`
  - `export function nowTime(): string` — moved here from `ChatConversationScreen` so `ChatContext` can reuse it
  - `export function formatDateSeparator(isoOrLabel: string): string`

- [ ] **Step 1: Extend interfaces**

In `src/data/chatData.ts`, replace the `ChatAttachment`, `ChatMessage`, `Conversation` interfaces with:

```ts
export interface ChatAttachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'audio';
  uri: string;
  name: string;
  duration?: number; // seconds, audio only
}

export interface ChatReplyRef {
  id: string;
  senderName: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
  attachments?: ChatAttachment[];
  edited?: boolean;
  deleted?: boolean;
  replyTo?: ChatReplyRef;
  status?: 'sent' | 'delivered' | 'read';
  starred?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  color: string;
  archived: boolean;
  deletedAt?: string;
  pinned?: boolean;
  muted?: boolean;
  messages: ChatMessage[];
}
```

- [ ] **Step 2: Extend `ChatProfile` and add `nowTime`/`formatDateSeparator` helpers**

Replace the `ChatProfile` interface and add helpers right after the `daysRemaining` function (before `export const CONVERSATIONS`):

```ts
export interface ChatProfile {
  role: string;
  phone: string;
  email: string;
  bio: string;
  isGroup: boolean;
  online?: boolean;
  lastSeen?: string;
  blocked?: boolean;
}

export function nowTime(): string {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateSeparator(dayKey: string): string {
  const today = new Date();
  const todayKey = today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = yesterday.toDateString();

  if (dayKey === todayKey) return 'Hari ini';
  if (dayKey === yesterdayKey) return 'Kemarin';
  return new Date(dayKey).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
```

`formatDateSeparator` takes a `Date.toDateString()`-style key (see Task 5, which computes `new Date().toDateString()` per message using each message's send time captured at creation — see Step 3 below for how messages get a real day key).

- [ ] **Step 3: Add `dayKey` to seed messages and mark a few contacts online/last-seen/blocked-capable**

Existing seed messages only have a display `time` string (e.g. `'09:12'`), not a real date, so date-separator grouping has nothing to group by. Add a `dayKey?: string` field to `ChatMessage` (in the interface from Step 1, add `dayKey?: string;` under `time: string;`) and set it on seed data using today/yesterday so the demo data shows both separators. Update `CONVERSATIONS` messages (`m1`, `m2` etc. for conversations `'1'` and `'2'`) to include `dayKey: new Date().toDateString()`, and conversation `'3'` and `'4'` (whose display time is `'Kemarin'`) to include a `dayKey` one day back:

```ts
const TODAY_KEY = new Date().toDateString();
const YESTERDAY_KEY = new Date(Date.now() - 86400000).toDateString();
```

Add this near the top of the file (after imports, before `TRASH_RETENTION_DAYS`), then set `dayKey: TODAY_KEY` on every message under conversations `'1'` and `'2'`, and `dayKey: YESTERDAY_KEY` on every message under conversations `'3'` and `'4'`.

Add `online`/`lastSeen` to `PROFILES`: give `'Budi Santoso'` `online: true`; give `'Siti Rahayu'` `lastSeen: 'terakhir dilihat 10 menit lalu'`; give `'Ahmad Wijaya'` `lastSeen: 'terakhir dilihat kemarin pukul 20.15'`; leave groups (`isGroup: true`) without `online`/`lastSeen` (groups don't show presence in WhatsApp either).

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: errors referencing `ChatConversationScreen.tsx` calling a local `nowTime` are fine for now (not yet removed) — but no errors inside `chatData.ts` itself. If TypeScript reports errors in `chatData.ts`, fix them before proceeding; errors in other files are expected until later tasks and can be ignored at this checkpoint.

- [ ] **Step 5: Commit**

```bash
git add src/data/chatData.ts
git commit -m "feat: extend chat data model for read receipts, voice, pin/mute/block, date grouping"
```

---

### Task 3: ChatContext — centralize message mutations and add pin/mute/block/star/forward

**Files:**
- Modify: `src/context/ChatContext.tsx`

**Interfaces:**
- Consumes: `Conversation`, `ChatMessage`, `ChatAttachment`, `ChatReplyRef`, `nowTime` from `@/data/chatData` (Task 2)
- Produces (new `ChatContextValue` members, consumed by Tasks 5, 6, 7, 8):
  - `pinChat(id: string): void`
  - `muteChat(id: string): void`
  - `blockContact(id: string): void`
  - `sendMessage(conversationId: string, input: { text: string; attachments?: ChatAttachment[]; replyTo?: ChatReplyRef }): void`
  - `editMessage(conversationId: string, messageId: string, text: string): void`
  - `unsendMessage(conversationId: string, messageId: string): void`
  - `toggleStar(conversationId: string, messageId: string): void`
  - `forwardMessage(message: ChatMessage, toConversationId: string): void`

- [ ] **Step 1: Replace `src/context/ChatContext.tsx` in full**

```ts
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
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, blocked: !(c as any).blocked } as Conversation : c)),
    );
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
```

Note: `blockContact` stores `blocked` on the `Conversation` object (not `ChatProfile`) via an `as any` cast for this step only, because `Conversation` doesn't declare `blocked` yet — Task 2 gave `blocked` to `ChatProfile`, but block state needs to live wherever `ChatScreen`/`ChatConversationScreen` already look things up by `conversationId`, which is `Conversation`, not `ChatProfile` (profiles are keyed by name, conversations by id). Fix this properly now instead of leaving the cast:

- [ ] **Step 2: Move `blocked` from `ChatProfile` to `Conversation` and remove the cast**

In `src/data/chatData.ts` (touching up Task 2's work): remove `blocked?: boolean;` from `ChatProfile`, add `blocked?: boolean;` to `Conversation` instead (next to `pinned`/`muted`).

Back in `ChatContext.tsx`, simplify `blockContact`:

```ts
  function blockContact(id: string) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c)));
  }
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: errors will still appear in `ChatConversationScreen.tsx` (it still has its own local `messages` state and a local `nowTime`, not yet migrated) — confirm the *only* errors are in `ChatConversationScreen.tsx`, `ChatScreen.tsx` is untouched so far and should show no new errors. If `ChatContext.tsx` itself has errors, fix them now.

- [ ] **Step 4: Commit**

```bash
git add src/context/ChatContext.tsx src/data/chatData.ts
git commit -m "feat: centralize chat message mutations and add pin/mute/block/star/forward to ChatContext"
```

---

### Task 4: ChatBubble — read-receipt ticks, star indicator, voice message playback

**Files:**
- Create: `src/components/VoiceMessage.tsx`
- Modify: `src/components/ChatBubble.tsx`
- Modify: `package.json` (add `expo-audio`)

**Interfaces:**
- Consumes: `ChatAttachment` (with `type: 'audio'`, `duration`) from `@/data/chatData` (Task 2)
- Produces: `VoiceMessage` component — `{ uri: string; duration?: number; isMe: boolean }` props, no return value consumed elsewhere (leaf UI component). `ChatBubble` gains `status?: ChatMessage['status']` and `starred?: boolean` props, rendered but not yet wired by any screen (Task 5 wires it).

- [ ] **Step 1: Install `expo-audio`**

Run: `npx expo install expo-audio`
Expected: `package.json` gains an `expo-audio` dependency at the SDK54-compatible version.

- [ ] **Step 2: Create `src/components/VoiceMessage.tsx`**

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';

interface Props {
  uri: string;
  duration?: number;
  isMe: boolean;
}

function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

export default function VoiceMessage({ uri, duration = 0, isMe }: Props) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const totalSeconds = status.duration || duration;
  const currentSeconds = status.currentTime || 0;
  const progress = totalSeconds > 0 ? Math.min(1, currentSeconds / totalSeconds) : 0;

  function toggle() {
    if (status.playing) {
      player.pause();
    } else {
      if (status.currentTime >= totalSeconds && totalSeconds > 0) {
        player.seekTo(0);
      }
      player.play();
    }
  }

  const accent = isMe ? '#fff' : C.teal;
  const track = isMe ? 'rgba(255,255,255,0.35)' : C.line;

  return (
    <TouchableOpacity style={styles.wrap} onPress={toggle} activeOpacity={0.8}>
      <View style={[styles.playBtn, { backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : C.teal100 }]}>
        <Icon name={status.playing ? 'pause-circle' : 'play-circle'} size={22} color={accent} />
      </View>
      <View style={styles.body}>
        <View style={[styles.track, { backgroundColor: track }]}>
          <View style={[styles.trackFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
        </View>
        <Text style={[styles.time, { color: isMe ? 'rgba(255,255,255,0.85)' : C.mut }]}>
          {formatSeconds(status.playing || currentSeconds > 0 ? currentSeconds : totalSeconds)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 160, paddingVertical: 2 },
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 4 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  trackFill: { height: 4, borderRadius: 2 },
  time: { fontSize: 10.5, fontFamily: F.medium },
});
```

- [ ] **Step 3: Wire `VoiceMessage` into `ChatBubble`, add ticks + star**

In `src/components/ChatBubble.tsx`:

Add import: `import VoiceMessage from '@/components/VoiceMessage';`

Extend `Props`:

```ts
interface Props {
  message: string;
  isMe?: boolean;
  timestamp?: string;
  attachments?: ChatAttachment[];
  edited?: boolean;
  deleted?: boolean;
  replyTo?: ChatReplyRef;
  status?: 'sent' | 'delivered' | 'read';
  starred?: boolean;
  onLongPress?: () => void;
  onSwipeReply?: () => void;
}
```

Destructure the two new props in the function signature: `status, starred,` (alongside the existing ones).

In the attachments render block, add an `a.type === 'audio'` branch before the existing `a.type === 'file'` check:

```tsx
                {attachments.map((a) =>
                  a.type === 'audio' ? (
                    <VoiceMessage key={a.id} uri={a.uri} duration={a.duration} isMe={isMe} />
                  ) : a.type === 'file' ? (
```

(this changes the existing ternary chain from `a.type === 'file' ? (...) : (...)` to a three-way chain — keep the existing `file` and image/video branches exactly as they are, just add the new first condition)

In `metaRow`, add starred icon and ticks after the existing `editedTag`/`time`:

```tsx
      <View style={styles.metaRow}>
        {starred && !deleted ? <Icon name="star" size={10} color={C.warn} /> : null}
        {edited && !deleted ? <Text style={styles.editedTag}>diedit</Text> : null}
        {timestamp ? <Text style={styles.time}>{timestamp}</Text> : null}
        {isMe && !deleted && status ? (
          <Icon
            name={status === 'sent' ? 'check' : 'checks'}
            size={13}
            color={status === 'read' ? '#34B7F1' : C.mut}
          />
        ) : null}
      </View>
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: no new errors from `ChatBubble.tsx` or `VoiceMessage.tsx`. Errors remaining in `ChatConversationScreen.tsx` are still expected (fixed in Task 5).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/VoiceMessage.tsx src/components/ChatBubble.tsx
git commit -m "feat: add voice message playback UI and read-receipt ticks to ChatBubble"
```

(if this repo uses a different lockfile, e.g. `yarn.lock`, add that instead of `package-lock.json`)

---

### Task 5: ChatConversationScreen — wire context messages, recording, date separators, presence, block

**Files:**
- Modify: `src/screens/ChatConversationScreen.tsx`
- Modify: `app.json` (microphone permission)
- Modify: `src/navigation/types.ts` (`ChatProfile` route param needs `contactId`)

**Interfaces:**
- Consumes: `useChatStore()` additions from Task 3 (`sendMessage`, `editMessage`, `unsendMessage`, `toggleStar`, `forwardMessage`), `formatDateSeparator`/`nowTime` from Task 2, `VoiceMessage`/ticks support from Task 4.
- Produces: none new (leaf screen).

- [ ] **Step 1: Add microphone permission config**

In `app.json`, add a `plugins` array at the `expo` object's top level (sibling to `"name"`, `"slug"`, etc.):

```json
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "Aplikasi memerlukan akses mikrofon untuk mengirim pesan suara."
        }
      ]
    ],
```

- [ ] **Step 2: Add `contactId` to the `ChatProfile` route param**

In `src/navigation/types.ts`, change:

```ts
  ChatProfile: { name: string; color: string };
```

to:

```ts
  ChatProfile: { contactId: string; name: string; color: string };
```

- [ ] **Step 3: Replace `src/screens/ChatConversationScreen.tsx` in full**

```tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import Icon from '@/components/Icon';
import ChatBubble from '@/components/ChatBubble';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import { ChatMessage, ChatAttachment, ChatReplyRef, getProfile, formatDateSeparator } from '@/data/chatData';
import { useChatStore } from '@/context/ChatContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'ChatConversation'>;

export default function ChatConversationScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const insets = useSafeAreaInsets();
  const { conversations, sendMessage, editMessage, unsendMessage, toggleStar, forwardMessage } =
    useChatStore();
  const conversation = conversations.find((c) => c.id === params.contactId);
  const messages = conversation?.messages ?? [];
  const profile = getProfile(params.name);

  const [draft, setDraft] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [actionSheetMsg, setActionSheetMsg] = useState<ChatMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatReplyRef | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const blocked = !!conversation?.blocked;

  useEffect(() => {
    return () => {
      if (recordTimer.current) clearInterval(recordTimer.current);
    };
  }, []);

  function send() {
    const text = draft.trim();
    if (!text && pendingAttachments.length === 0) return;

    if (editingId) {
      editMessage(params.contactId, editingId, text);
      setEditingId(null);
      setDraft('');
      return;
    }

    sendMessage(params.contactId, {
      text,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
      replyTo: replyingTo ?? undefined,
    });
    setDraft('');
    setPendingAttachments([]);
    setReplyingTo(null);
  }

  function startReply(msg: ChatMessage) {
    setReplyingTo({
      id: msg.id,
      senderName: msg.isMe ? 'Anda' : params.name,
      text: msg.text || (msg.attachments?.length ? 'Lampiran' : ''),
    });
    setActionSheetMsg(null);
  }

  function cancelReply() {
    setReplyingTo(null);
  }

  function startEdit(msg: ChatMessage) {
    setEditingId(msg.id);
    setDraft(msg.text);
    setReplyingTo(null);
    setActionSheetMsg(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft('');
  }

  function unsend(msg: ChatMessage) {
    setActionSheetMsg(null);
    Alert.alert('Hapus Pesan', 'Hapus pesan ini untuk semua orang?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => unsendMessage(params.contactId, msg.id),
      },
    ]);
  }

  function star(msg: ChatMessage) {
    toggleStar(params.contactId, msg.id);
    setActionSheetMsg(null);
  }

  function forward(msg: ChatMessage) {
    setActionSheetMsg(null);
    navigation.navigate('ChatContactPicker', { forwardMessage: msg });
  }

  async function pickMedia() {
    setAttachMenuOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin diperlukan', 'Akses galeri diperlukan untuk melampirkan foto/video.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (result.canceled) return;
    const picked: ChatAttachment[] = result.assets.map((a, i) => ({
      id: `att-${Date.now()}-${i}`,
      type: a.type === 'video' ? 'video' : 'image',
      uri: a.uri,
      name: a.fileName ?? `media-${i}`,
    }));
    setPendingAttachments((prev) => [...prev, ...picked]);
  }

  async function pickFile() {
    setAttachMenuOpen(false);
    const result = await DocumentPicker.getDocumentAsync({ multiple: true, type: '*/*' });
    if (result.canceled) return;
    const picked: ChatAttachment[] = result.assets.map((a, i) => ({
      id: `att-${Date.now()}-${i}`,
      type: 'file',
      uri: a.uri,
      name: a.name,
    }));
    setPendingAttachments((prev) => [...prev, ...picked]);
  }

  function removePending(id: string) {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function startRecording() {
    if (draft.trim() || pendingAttachments.length > 0) return;
    const perm = await AudioModule.requestRecordingPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin diperlukan', 'Akses mikrofon diperlukan untuk mengirim pesan suara.');
      return;
    }
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
    setRecordSeconds(0);
    recordTimer.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
  }

  async function stopRecording() {
    if (!isRecording) return;
    if (recordTimer.current) {
      clearInterval(recordTimer.current);
      recordTimer.current = null;
    }
    setIsRecording(false);
    await recorder.stop();
    const uri = recorder.uri;
    if (uri) {
      sendMessage(params.contactId, {
        text: '',
        attachments: [
          {
            id: `att-${Date.now()}`,
            type: 'audio',
            uri,
            name: 'Pesan suara',
            duration: recordSeconds,
          },
        ],
      });
    }
    setRecordSeconds(0);
  }

  const showMic = !draft.trim() && pendingAttachments.length === 0 && !editingId;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <LinearGradient
        colors={GradientHeaders.chat as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerProfile}
          activeOpacity={0.75}
          onPress={() =>
            navigation.navigate('ChatProfile', {
              contactId: params.contactId,
              name: params.name,
              color: params.color,
            })
          }
        >
          <View style={[styles.avatar, { backgroundColor: params.color }]}>
            <Text style={styles.avatarText}>
              {params.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>{params.name}</Text>
            {profile.online ? (
              <Text style={styles.presence}>online</Text>
            ) : profile.lastSeen ? (
              <Text style={styles.presence} numberOfLines={1}>{profile.lastSeen}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
        <View style={styles.iconBtnPlaceholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="message-circle" size={40} color={C.mut} />
            <Text style={styles.emptyText}>Mulai percakapan dengan {params.name}</Text>
          </View>
        ) : (
          messages.map((m, i) => {
            const prevDayKey = i > 0 ? (messages[i - 1] as any).dayKey : undefined;
            const dayKey = (m as any).dayKey;
            const showSeparator = !!dayKey && dayKey !== prevDayKey;
            return (
              <React.Fragment key={m.id}>
                {showSeparator && (
                  <View style={styles.dateSeparatorWrap}>
                    <Text style={styles.dateSeparatorText}>{formatDateSeparator(dayKey)}</Text>
                  </View>
                )}
                <ChatBubble
                  message={m.text}
                  isMe={m.isMe}
                  timestamp={m.time}
                  attachments={m.attachments}
                  edited={m.edited}
                  deleted={m.deleted}
                  replyTo={m.replyTo}
                  status={m.status}
                  starred={m.starred}
                  onLongPress={!m.deleted ? () => setActionSheetMsg(m) : undefined}
                  onSwipeReply={!m.deleted ? () => startReply(m) : undefined}
                />
              </React.Fragment>
            );
          })
        )}
      </ScrollView>

      {pendingAttachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pendingRow}
          contentContainerStyle={styles.pendingRowContent}
        >
          {pendingAttachments.map((a) => (
            <View key={a.id} style={styles.pendingChip}>
              {a.type === 'file' ? (
                <View style={styles.pendingFile}>
                  <Icon name="file-text" size={18} color={C.ink} />
                  <Text style={styles.pendingFileName} numberOfLines={1}>{a.name}</Text>
                </View>
              ) : (
                <Image source={{ uri: a.uri }} style={styles.pendingImage} />
              )}
              <TouchableOpacity style={styles.pendingRemove} onPress={() => removePending(a.id)}>
                <Icon name="x" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {replyingTo && !editingId && (
        <View style={styles.replyBanner}>
          <Icon name="arrow-left" size={14} color={C.teal} style={{ transform: [{ rotate: '90deg' }] }} />
          <View style={styles.replyBannerBody}>
            <Text style={styles.replyBannerName}>Membalas {replyingTo.senderName}</Text>
            <Text style={styles.replyBannerText} numberOfLines={1}>{replyingTo.text}</Text>
          </View>
          <TouchableOpacity onPress={cancelReply}>
            <Icon name="x" size={16} color={C.mut} />
          </TouchableOpacity>
        </View>
      )}

      {editingId && (
        <View style={styles.editBanner}>
          <Icon name="edit" size={14} color={C.teal} />
          <Text style={styles.editBannerText}>Mengedit pesan</Text>
          <TouchableOpacity onPress={cancelEdit}>
            <Icon name="x" size={16} color={C.mut} />
          </TouchableOpacity>
        </View>
      )}

      {blocked ? (
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Text style={styles.blockedText}>Kontak ini telah diblokir</Text>
        </View>
      ) : (
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity style={styles.attachBtn} onPress={() => setAttachMenuOpen(true)}>
            <Icon name="plus" size={20} color={C.mut} />
          </TouchableOpacity>
          {isRecording ? (
            <View style={styles.recordingRow}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Merekam... {Math.floor(recordSeconds / 60)}:{(recordSeconds % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          ) : (
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Tulis pesan..."
              placeholderTextColor={C.mut}
              style={styles.input}
              multiline
            />
          )}
          {showMic ? (
            <TouchableOpacity
              style={[styles.sendBtn, isRecording && styles.sendBtnRecording]}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Icon name="mic" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.sendBtn} onPress={send}>
              <Icon name={editingId ? 'check' : 'send'} size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={attachMenuOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setAttachMenuOpen(false)}
        >
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.sheetOption} onPress={pickMedia}>
              <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                <Icon name="image" size={20} color={C.teal} />
              </View>
              <Text style={styles.sheetLabel}>Foto & Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={pickFile}>
              <View style={[styles.sheetIconWrap, { backgroundColor: C.violet100 }]}>
                <Icon name="file-text" size={20} color={C.violet} />
              </View>
              <Text style={styles.sheetLabel}>Dokumen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setAttachMenuOpen(false)}>
              <Text style={styles.sheetCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={!!actionSheetMsg} transparent animationType="fade">
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setActionSheetMsg(null)}
        >
          <View style={styles.sheet}>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => actionSheetMsg && startReply(actionSheetMsg)}
            >
              <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                <Icon
                  name="arrow-left"
                  size={20}
                  color={C.teal}
                  style={{ transform: [{ rotate: '90deg' }] }}
                />
              </View>
              <Text style={styles.sheetLabel}>Balas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => actionSheetMsg && forward(actionSheetMsg)}
            >
              <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                <Icon name="corner-up-right" size={20} color={C.teal} />
              </View>
              <Text style={styles.sheetLabel}>Teruskan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => actionSheetMsg && star(actionSheetMsg)}
            >
              <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                <Icon name="star" size={20} color={C.teal} />
              </View>
              <Text style={styles.sheetLabel}>
                {actionSheetMsg?.starred ? 'Batal Bintangi' : 'Bintangi'}
              </Text>
            </TouchableOpacity>
            {actionSheetMsg?.isMe && (
              <>
                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => actionSheetMsg && startEdit(actionSheetMsg)}
                >
                  <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                    <Icon name="edit" size={20} color={C.teal} />
                  </View>
                  <Text style={styles.sheetLabel}>Edit Pesan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => actionSheetMsg && unsend(actionSheetMsg)}
                >
                  <View style={[styles.sheetIconWrap, { backgroundColor: C.red100 }]}>
                    <Icon name="trash" size={20} color={C.danger} />
                  </View>
                  <Text style={[styles.sheetLabel, { color: C.danger }]}>Hapus / Unsend</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setActionSheetMsg(null)}>
              <Text style={styles.sheetCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPlaceholder: { width: 40, height: 40 },
  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontFamily: F.extraBold, color: '#fff' },
  title: { fontSize: 17, fontFamily: F.bold, color: '#fff' },
  presence: { fontSize: 11.5, color: 'rgba(255,255,255,0.75)', fontFamily: F.medium, marginTop: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 16 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 13.5, color: C.mut, fontFamily: F.medium, textAlign: 'center' },
  dateSeparatorWrap: { alignItems: 'center', marginVertical: 12 },
  dateSeparatorText: {
    fontSize: 11.5,
    fontFamily: F.bold,
    color: C.sec,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  pendingRow: { maxHeight: 76, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.line },
  pendingRowContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  pendingChip: { position: 'relative' },
  pendingImage: { width: 56, height: 56, borderRadius: 10, backgroundColor: C.line },
  pendingFile: {
    width: 90,
    height: 56,
    borderRadius: 10,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },
  pendingFileName: { fontSize: 9.5, color: C.ink, fontFamily: F.medium },
  pendingRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: C.teal100,
  },
  editBannerText: { flex: 1, fontSize: 12.5, color: C.teal, fontFamily: F.medium },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: C.teal100,
  },
  replyBannerBody: { flex: 1 },
  replyBannerName: { fontSize: 12, fontFamily: F.bold, color: C.teal },
  replyBannerText: { fontSize: 12, fontFamily: F.regular, color: C.sec, marginTop: 1 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.white,
  },
  blockedText: { flex: 1, textAlign: 'center', fontSize: 13, color: C.mut, fontFamily: F.medium, paddingVertical: 10 },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: F.regular,
    color: C.ink,
    backgroundColor: C.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  recordingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    height: 40,
  },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.danger },
  recordingText: { fontSize: 13, fontFamily: F.medium, color: C.ink },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnRecording: { backgroundColor: C.danger },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  sheetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetLabel: { fontSize: 15, fontFamily: F.medium, color: C.ink },
  sheetCancel: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  sheetCancelText: { fontSize: 15, fontFamily: F.bold, color: C.mut },
});
```

Note: `(m as any).dayKey` / `(messages[i - 1] as any).dayKey` — `dayKey` was added to `ChatMessage` in Task 2 Step 3 without a matching interface field update in this task's snippet; before running this step, confirm Task 2 actually added `dayKey?: string;` to the `ChatMessage` interface (it's specified there). If so, drop the `as any` casts and use `m.dayKey` / `messages[i - 1].dayKey` directly — the casts above are a fallback only if Task 2 is executed out of order; when following this plan in order, use the typed access without `as any`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: `No errors found`, except any remaining error in `ChatContactPickerScreen.tsx` about a `forwardMessage` route param not yet declared (that's Task 6/7's job — if `navigation.navigate('ChatContactPicker', { forwardMessage: msg })` errors because `ChatContactPicker: undefined` in `RootStackParamList`, that's expected until Task 7 updates the route type).

- [ ] **Step 5: Commit**

```bash
git add src/screens/ChatConversationScreen.tsx app.json src/navigation/types.ts
git commit -m "feat: wire read receipts, voice recording, date separators, presence, block into ChatConversationScreen"
```

---

### Task 6: ChatContactPickerScreen — forward mode

**Files:**
- Modify: `src/screens/ChatContactPickerScreen.tsx`
- Modify: `src/navigation/types.ts`

**Interfaces:**
- Consumes: `forwardMessage` from `useChatStore()` (Task 3), `ChatMessage` type from `@/data/chatData`.

- [ ] **Step 1: Update route param type**

In `src/navigation/types.ts`, change:

```ts
  ChatContactPicker: undefined;
```

to:

```ts
  ChatContactPicker: { forwardMessage?: ChatMessage } | undefined;
```

Add `ChatMessage` to the import at the top of `src/navigation/types.ts` — check the existing import line for chat types (if `src/navigation/types.ts` doesn't currently import from `@/data/chatData`, add: `import { ChatMessage } from '@/data/chatData';` near the top, after the other imports).

- [ ] **Step 2: Handle forward mode in `ChatContactPickerScreen`**

In `src/screens/ChatContactPickerScreen.tsx`, add imports:

```ts
import { useRoute, RouteProp } from '@react-navigation/native';
import { useChatStore } from '@/context/ChatContext';
```

Add a route type: `type Rt = RouteProp<RootStackParamList, 'ChatContactPicker'>;`

Inside the component, read the param and context:

```ts
  const { params } = useRoute<Rt>();
  const { forwardMessage } = useChatStore();
  const isForwarding = !!params?.forwardMessage;
```

Change the header title conditionally — replace `title="Chat Baru"` with `title={isForwarding ? 'Teruskan Pesan' : 'Chat Baru'}`.

Change the row `onPress` handler:

```tsx
            onPress={() => {
              if (isForwarding && params?.forwardMessage) {
                forwardMessage(params.forwardMessage, c.id);
                navigation.navigate('ChatConversation', {
                  contactId: c.id,
                  name: c.name,
                  color: c.color,
                });
              } else {
                navigation.replace('ChatConversation', {
                  contactId: c.id,
                  name: c.name,
                  color: c.color,
                });
              }
            }}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: `No errors found`.

- [ ] **Step 4: Manual check**

Run `npm start`, open a conversation, long-press any message, tap "Teruskan", pick a contact — confirm it navigates to that contact's conversation and the forwarded message appears as the newest outgoing message with its own fresh `sent → delivered → read` tick lifecycle.

- [ ] **Step 5: Commit**

```bash
git add src/screens/ChatContactPickerScreen.tsx src/navigation/types.ts
git commit -m "feat: add forward-message mode to ChatContactPickerScreen"
```

---

### Task 7: ChatScreen — pin/mute chat action sheet

**Files:**
- Modify: `src/screens/ChatScreen.tsx`

**Interfaces:**
- Consumes: `pinChat`, `muteChat` from `useChatStore()` (Task 3).

- [ ] **Step 1: Add long-press action sheet state and sort pinned-first**

In `src/screens/ChatScreen.tsx`, add to the imports: `useState` already imported; add `Modal` to the `react-native` import list.

Add to the destructured store: `const { conversations, archiveChat, softDeleteChat, pinChat, muteChat } = useChatStore();`

Add state: `const [actionSheetChat, setActionSheetChat] = useState<typeof conversations[number] | null>(null);`

Change the `filtered` computation to sort pinned first (pinned conversations before unpinned, preserving existing relative order otherwise):

```ts
  const filtered = conversations
    .filter((c) => !c.archived && !c.deletedAt && c.name.toLowerCase().includes(searchQ))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
```

- [ ] **Step 2: Add `onLongPress` to the row and pin/mute indicator icons**

Change the row `TouchableOpacity` to add `onLongPress`:

```tsx
              <TouchableOpacity
                style={[styles.row, i < filtered.length - 1 && styles.rowBorder]}
                activeOpacity={0.7}
                onLongPress={() => setActionSheetChat(c)}
                onPress={() =>
                  navigation.navigate('ChatConversation', {
                    contactId: c.id,
                    name: c.name,
                    color: c.color,
                  })
                }
              >
```

In the `body` view (name/lastMessage), add pin/mute icons next to the name:

```tsx
                <View style={styles.body}>
                  <View style={styles.nameRow}>
                    {c.pinned && <Icon name="pin" size={12} color={C.mut} />}
                    <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
                    {c.muted && <Icon name="bell-off" size={12} color={C.mut} />}
                  </View>
                  <Text style={styles.lastMsg} numberOfLines={1}>{c.lastMessage}</Text>
                </View>
```

Add `nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },` to `styles`.

- [ ] **Step 3: Add the action sheet modal**

Add before the closing `</View>` of the component's return (after `<ChatFabMenu />`):

```tsx
      <Modal visible={!!actionSheetChat} transparent animationType="fade">
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setActionSheetChat(null)}
        >
          <View style={styles.sheet}>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                if (actionSheetChat) pinChat(actionSheetChat.id);
                setActionSheetChat(null);
              }}
            >
              <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                <Icon name="pin" size={20} color={C.teal} />
              </View>
              <Text style={styles.sheetLabel}>
                {actionSheetChat?.pinned ? 'Lepas Sematan' : 'Sematkan Percakapan'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                if (actionSheetChat) muteChat(actionSheetChat.id);
                setActionSheetChat(null);
              }}
            >
              <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                <Icon name="bell-off" size={20} color={C.teal} />
              </View>
              <Text style={styles.sheetLabel}>
                {actionSheetChat?.muted ? 'Aktifkan Notifikasi' : 'Bisukan Notifikasi'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                if (actionSheetChat) archiveChat(actionSheetChat.id);
                setActionSheetChat(null);
              }}
            >
              <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                <Icon name="archive" size={20} color={C.teal} />
              </View>
              <Text style={styles.sheetLabel}>Arsipkan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                if (actionSheetChat) deleteChat(actionSheetChat.id);
                setActionSheetChat(null);
              }}
            >
              <View style={[styles.sheetIconWrap, { backgroundColor: C.red100 }]}>
                <Icon name="trash" size={20} color={C.danger} />
              </View>
              <Text style={[styles.sheetLabel, { color: C.danger }]}>Hapus</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setActionSheetChat(null)}>
              <Text style={styles.sheetCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
```

Add the matching styles (`sheetOverlay`, `sheet`, `sheetOption`, `sheetIconWrap`, `sheetLabel`, `sheetCancel`, `sheetCancelText`) to `styles` — copy verbatim from `ChatConversationScreen.tsx`'s equivalent styles (same names, same values, already established in this codebase).

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: `No errors found`.

- [ ] **Step 5: Manual check**

Run `npm start`, long-press a chat row in the chat list, confirm the sheet opens with Pin/Mute/Archive/Hapus, pinning moves the chat to the top of the list with a pin icon next to its name, muting shows a bell-off icon.

- [ ] **Step 6: Commit**

```bash
git add src/screens/ChatScreen.tsx
git commit -m "feat: add pin/mute chat long-press action sheet to ChatScreen"
```

---

### Task 8: ChatProfileScreen — presence display + block toggle

**Files:**
- Modify: `src/screens/ChatProfileScreen.tsx`

**Interfaces:**
- Consumes: `conversations`, `blockContact` from `useChatStore()` (Task 3); `contactId` route param (added in Task 5, Step 2).

- [ ] **Step 1: Read conversation by id and add block toggle**

In `src/screens/ChatProfileScreen.tsx`, add imports:

```ts
import { useChatStore } from '@/context/ChatContext';
```

Inside the component, after `const profile = getProfile(params.name);`, add:

```ts
  const { conversations, blockContact } = useChatStore();
  const conversation = conversations.find((c) => c.id === params.contactId);
  const blocked = !!conversation?.blocked;
```

- [ ] **Step 2: Render presence under the name**

After the `<Text style={styles.role}>{profile.role}</Text>` line inside `avatarWrap`, add:

```tsx
          {profile.online ? (
            <Text style={styles.presence}>online</Text>
          ) : profile.lastSeen ? (
            <Text style={styles.presence}>{profile.lastSeen}</Text>
          ) : null}
```

Add `presence: { fontSize: 12.5, color: C.mut, fontFamily: F.medium, marginTop: 2 },` to `styles`.

- [ ] **Step 3: Add block button (non-group contacts only)**

After the existing `{!profile.isGroup && (...)}` section (the phone/email block), add a new section:

```tsx
        {!profile.isGroup && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.blockRow}
              onPress={() => conversation && blockContact(conversation.id)}
            >
              <Icon name="ban" size={18} color={C.danger} />
              <Text style={styles.blockText}>{blocked ? 'Buka Blokir Kontak' : 'Blokir Kontak'}</Text>
            </TouchableOpacity>
          </View>
        )}
```

Add to `styles`:

```ts
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  blockText: { fontSize: 14, fontFamily: F.medium, color: C.danger },
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: `No errors found`.

- [ ] **Step 5: Manual check**

Run `npm start`, open a non-group contact's conversation, tap the header to open their profile, confirm presence text shows (online or last-seen) and the block button toggles its label; go back to the conversation and confirm the input bar is now replaced with "Kontak ini telah diblokir" when blocked.

- [ ] **Step 6: Commit**

```bash
git add src/screens/ChatProfileScreen.tsx
git commit -m "feat: show presence and add block-contact toggle to ChatProfileScreen"
```

---

## Final Full-App Verification

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit`
Expected: `No errors found`

- [ ] **Step 2: Manual end-to-end run-through**

Run `npm start`, open the app, and exercise every new flow in one pass:
1. Open a conversation, send a text message — confirm a single grey check appears, then double grey (~1s later), then double blue (~3s later).
2. Hold the mic button, wait ~2s, release — confirm a voice message bubble appears with a working play/pause + progress bar.
3. Scroll a conversation with messages from different days — confirm "Hari ini"/"Kemarin" pills appear between day groups.
4. Long-press a message → Teruskan → pick a contact — confirm it lands in that contact's chat.
5. Long-press a message → Bintangi — confirm a star icon appears next to its timestamp; toggle again to remove it.
6. Long-press a chat row in the chat list → Sematkan Percakapan — confirm it jumps to the top with a pin icon; Bisukan Notifikasi — confirm a bell-off icon appears.
7. Open a contact's profile — confirm online/last-seen text shows; tap Blokir Kontak — confirm the conversation's input bar becomes disabled with the blocked message.
