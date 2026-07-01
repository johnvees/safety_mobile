import { C } from '@/theme/colors';

export interface ChatAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  uri: string;
  name: string;
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
  messages: ChatMessage[];
}

export const TRASH_RETENTION_DAYS = 30;

export function daysRemaining(deletedAt: string): number {
  const elapsedMs = Date.now() - new Date(deletedAt).getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  return Math.max(0, TRASH_RETENTION_DAYS - elapsedDays);
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Tim HSE Pusat',
    lastMessage: 'Mohon segera lengkapi laporan inspeksi minggu ini.',
    time: '09:12',
    unread: 2,
    color: C.teal,
    archived: false,
    messages: [
      { id: 'm1', text: 'Selamat pagi, mohon update laporan inspeksi.', isMe: false, time: '09:00' },
      { id: 'm2', text: 'Mohon segera lengkapi laporan inspeksi minggu ini.', isMe: false, time: '09:12' },
    ],
  },
  {
    id: '2',
    name: 'Budi Santoso',
    lastMessage: 'Sudah saya upload dokumen JSA-nya pak.',
    time: '08:45',
    unread: 1,
    color: C.ok,
    archived: false,
    messages: [
      { id: 'm1', text: 'Pak, dokumen JSA sudah siap.', isMe: false, time: '08:40' },
      { id: 'm2', text: 'Sudah saya upload dokumen JSA-nya pak.', isMe: false, time: '08:45' },
    ],
  },
  {
    id: '3',
    name: 'Koordinator K3 Area B',
    lastMessage: 'Terima kasih konfirmasinya.',
    time: 'Kemarin',
    unread: 0,
    color: C.warn,
    archived: false,
    messages: [
      { id: 'm1', text: 'Baik, dikonfirmasi ya untuk jadwal besok.', isMe: true, time: 'Kemarin' },
      { id: 'm2', text: 'Terima kasih konfirmasinya.', isMe: false, time: 'Kemarin' },
    ],
  },
  {
    id: '4',
    name: 'Grup Inspeksi Lapangan',
    lastMessage: 'Jadwal inspeksi besok pindah jadi jam 08.00.',
    time: 'Kemarin',
    unread: 0,
    color: C.violet,
    archived: false,
    messages: [
      { id: 'm1', text: 'Jadwal inspeksi besok pindah jadi jam 08.00.', isMe: false, time: 'Kemarin' },
    ],
  },
];

export interface Contact {
  id: string;
  name: string;
  role: string;
  color: string;
}

export const CONTACTS: Contact[] = [
  { id: 'c1', name: 'Tim HSE Pusat', role: 'Grup', color: C.teal },
  { id: 'c2', name: 'Budi Santoso', role: 'Inspektur K3', color: C.ok },
  { id: 'c3', name: 'Koordinator K3 Area B', role: 'Koordinator', color: C.warn },
  { id: 'c4', name: 'Grup Inspeksi Lapangan', role: 'Grup', color: C.violet },
  { id: 'c5', name: 'Siti Rahayu', role: 'HSE Officer', color: C.danger },
  { id: 'c6', name: 'Ahmad Wijaya', role: 'Supervisor Lapangan', color: C.navy },
];

export interface ChatProfile {
  role: string;
  phone: string;
  email: string;
  bio: string;
  isGroup: boolean;
}

const DEFAULT_PROFILE: ChatProfile = {
  role: 'Anggota',
  phone: '-',
  email: '-',
  bio: 'Belum ada informasi.',
  isGroup: false,
};

export const PROFILES: Record<string, ChatProfile> = {
  'Tim HSE Pusat': {
    role: 'Grup',
    phone: '-',
    email: 'hse.pusat@cpin.co.id',
    bio: 'Grup koordinasi HSE tingkat pusat. 12 anggota.',
    isGroup: true,
  },
  'Budi Santoso': {
    role: 'Inspektur K3',
    phone: '+62 812-3456-7890',
    email: 'budi.santoso@cpin.co.id',
    bio: 'Bertanggung jawab atas inspeksi harian area produksi.',
    isGroup: false,
  },
  'Koordinator K3 Area B': {
    role: 'Koordinator K3',
    phone: '+62 813-2233-4455',
    email: 'k3.areab@cpin.co.id',
    bio: 'Koordinator keselamatan kerja untuk Area B.',
    isGroup: false,
  },
  'Grup Inspeksi Lapangan': {
    role: 'Grup',
    phone: '-',
    email: 'inspeksi.lapangan@cpin.co.id',
    bio: 'Grup koordinasi jadwal inspeksi lapangan. 8 anggota.',
    isGroup: true,
  },
  'Siti Rahayu': {
    role: 'HSE Officer',
    phone: '+62 811-9988-7766',
    email: 'siti.rahayu@cpin.co.id',
    bio: 'Menangani dokumentasi dan pelaporan HSE.',
    isGroup: false,
  },
  'Ahmad Wijaya': {
    role: 'Supervisor Lapangan',
    phone: '+62 814-5566-7788',
    email: 'ahmad.wijaya@cpin.co.id',
    bio: 'Supervisor lapangan untuk operasional harian.',
    isGroup: false,
  },
};

export function getProfile(name: string): ChatProfile {
  return PROFILES[name] ?? DEFAULT_PROFILE;
}
