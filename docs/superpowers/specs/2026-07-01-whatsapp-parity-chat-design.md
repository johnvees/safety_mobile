# WhatsApp-Parity Chat Features — Design

Date: 2026-07-01
Status: Approved

## Context

`safety_mobile` chat module (`src/screens/Chat*.tsx`, `src/components/ChatBubble.tsx`, `src/context/ChatContext.tsx`, `src/data/chatData.ts`) already has: text send, image/video/file attachments, reply/quote, swipe-to-reply, edit message, unsend/delete-for-everyone, archive, soft-delete + 30-day trash, chat search, unread badges, contact picker, profile screen, group chat display.

No backend exists — all data is local mock data (`src/data/mockData.ts`, `src/data/chatData.ts`), no sockets, no persistence beyond in-memory `ChatContext` state. This design adds the next tier of WhatsApp-parity features, simulated client-side.

Out of scope (explicitly declined during brainstorming): emoji reactions, message-level pin, dedicated starred-messages list screen, typing indicators (no backend to drive them).

## Data Model Changes (`src/data/chatData.ts`)

```ts
export interface ChatMessage {
  // ...existing fields
  status?: 'sent' | 'delivered' | 'read'; // outgoing messages only
  starred?: boolean;
}

export interface ChatAttachment {
  type: 'image' | 'video' | 'file' | 'audio'; // add 'audio'
  duration?: number; // seconds, audio only
  // ...existing fields
}

export interface Conversation {
  // ...existing fields
  pinned?: boolean;
  muted?: boolean;
}

export interface ChatProfile {
  // ...existing fields
  online?: boolean;
  lastSeen?: string; // e.g. "terakhir dilihat 10 menit lalu"
  blocked?: boolean;
}
```

New helper: `formatDateSeparator(timestamp: string): string` — returns "Hari ini" / "Kemarin" / formatted date for grouping messages by day in the conversation list render.

Seed mock data (`CONVERSATIONS`, `PROFILES`) gets a few entries with `online: true`, others with `lastSeen`, so the UI has real variety to show.

## ChatContext Extensions (`src/context/ChatContext.tsx`)

Extend the existing single context (matches current architecture — no new context needed):

- `pinChat(id: string)` — toggles `pinned`, pinned conversations sort to top of list
- `muteChat(id: string)` — toggles `muted`
- `blockContact(id: string)` — toggles `blocked` on that conversation's profile
- `toggleStar(conversationId: string, messageId: string)` — toggles `starred` on a message
- `forwardMessage(fromMessage: ChatMessage, toConversationId: string)` — appends a copy of the message (text/attachments, no reply-to, no edited/starred flags) to the target conversation as a new outgoing message
- `markRead(conversationId: string)` — flips all incoming messages' implicit read state (existing `unread` counter reset) and, for the current user's outgoing messages in that thread, is a no-op (read status is about messages *I* sent being read by *them*, tracked separately below)

## Read Receipts

Outgoing (`isMe: true`) messages carry `status`:
1. On send: `status: 'sent'`
2. ~800ms later (mock `setTimeout`): flips to `'delivered'`
3. Flips to `'read'` when the *other* conversation is opened in a simulated way — since there's no second device, we simulate: after a further mock delay (~2.5s) following delivery, auto-flip to `'read'`. This keeps it simple and demoable without needing a fake "recipient opened chat" event.

`ChatBubble` renders ticks in `metaRow`, outgoing messages only:
- `sent` → single grey check icon
- `delivered` → double grey check icon
- `read` → double check icon, blue/teal tint

## Online / Last-Seen

Static per-contact fields in `PROFILES`. Rendered:
- `ChatConversationScreen` header, small text under contact name ("online" or "terakhir dilihat ...")
- `ChatProfileScreen`, same info in the profile body

No live updates — pure mock display.

## Voice Messages

New dependency: `expo-av` (`Audio.Recording` / `Audio.Sound`) — already common in Expo projects, no native config changes needed for managed workflow beyond permission strings (add `NSMicrophoneUsageDescription` / Android `RECORD_AUDIO` to `app.json` if not present).

**Recording UX**: in `ChatConversationScreen` input bar, when `draft` is empty and no pending attachments, the send button is replaced by a mic button. Press-and-hold starts recording (visual: button grows, red pulsing dot + timer text appears where the input was). Release → stop recording, package as `ChatAttachment` with `type: 'audio'`, `uri`, `duration`, send immediately (no pending-attachment preview step, matches WhatsApp's hold-release-send flow). Drag-to-cancel (swipe left, WhatsApp gesture) is **not** included — release always sends; user can delete via existing unsend flow after.

**Playback UX**: `ChatBubble` renders audio attachments as a row: play/pause circular button (teal, matches bubble accent) + linear progress bar + duration text (`0:12` current / total). Uses `Audio.Sound` for playback, one sound instance per bubble, released on unmount.

## Message Extras

**Date separators**: `ChatConversationScreen` message list groups consecutive messages by calendar day; before the first message of a new day, render a centered pill (`formatDateSeparator`).

**Forward**: long-press action sheet gets a "Teruskan" option (all messages, not just own). Selecting it navigates to `ChatContactPickerScreen` with a new route param `forwardMessage: ChatMessage`. In forward mode, picking a contact calls `forwardMessage()` on the context and navigates directly to that conversation (skipping the normal "new chat" flow).

**Star**: long-press action sheet gets "Bintangi" / "Batal Bintangi" (toggle based on current `starred` state). Starred messages show a small star icon inline in the bubble's `metaRow`, next to the timestamp. No dedicated list screen (per user decision).

## Chat List Extras

**Trigger**: long-press on a chat row in `ChatScreen` opens a bottom-sheet action list (same `Modal` + sheet pattern already used for message actions in `ChatConversationScreen`):
- Pin / Unpin percakapan
- Bisukan / Aktifkan notifikasi
- Arsipkan (existing, now also here for parity with swipe)
- Hapus (existing)

Pinned conversations sort before unpinned ones (both still respect archived/deleted filtering). Row shows a small pin icon when pinned, a muted bell icon when muted.

**Block contact**: lives in `ChatProfileScreen` as a toggle button ("Blokir Kontak" / "Buka Blokir"). When blocked, `ChatConversationScreen` input bar is disabled with a message ("Kontak ini telah diblokir") instead of the text input.

## Testing

No test runner configured in this repo (per `CLAUDE.md`). Verification via `npx tsc --noEmit` plus manual run-through in Expo (start app, exercise each new flow: send voice note, watch ticks progress, pin/mute/block a chat, forward a message, star a message, confirm date separators render).
