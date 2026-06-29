export const C = {
  teal: '#3b82f6',
  tealD: '#2563eb',
  teal100: '#DBEAFE',
  navy: '#1E40AF',
  ink: '#0F172A',
  sec: '#64748B',
  mut: '#94A3B8',
  line: '#E2E8F0',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  ok: '#16A34A',
  ok700: '#15803D',
  green100: '#DCFCE7',
  warn: '#D97706',
  warn700: '#B45309',
  amber100: '#FEF3C7',
  danger: '#DC2626',
  danger800: '#991B1B',
  danger700: '#B91C1C',
  red100: '#FEE2E2',
  violet: '#6D28D9',
  violet100: '#EDE9FE',
  surface: '#F1F5F9',
};

export const Colors = C;

export const GradientHeaders = {
  home: ['#3b82f6', '#2563eb'],
  laporan: ['#6366f1', '#4338ca'],
  incident: ['#DC2626', '#B91C1C'],
  inspeksi: ['#16A34A', '#15803D'],
  permit: ['#D97706', '#B45309'],
  hse: ['#10b981', '#059669'],
  more: ['#0F172A', '#1E293B'],
};

export const StatusMap: Record<string, [string, string]> = {
  Terbuka: ['#DC2626', '#FEE2E2'],
  Investigasi: ['#1D4ED8', '#DBEAFE'],
  'Tindakan Korektif': ['#C2410C', '#FFEDD5'],
  Terverifikasi: ['#15803D', '#DCFCE7'],
  Selesai: ['#15803D', '#DCFCE7'],
  Menunggu: ['#B45309', '#FEF3C7'],
  Ditolak: ['#B91C1C', '#FEE2E2'],
  Approved: ['#15803D', '#DCFCE7'],
  Review: ['#1D4ED8', '#DBEAFE'],
  Draft: ['#64748B', '#F1F5F9'],
  Published: ['#2563EB', '#DBEAFE'],
  Berlangsung: ['#1D4ED8', '#DBEAFE'],
  Terjadwal: ['#B45309', '#FEF3C7'],
  Aktif: ['#15803D', '#DCFCE7'],
};

export const SeverityMap: Record<string, [string, string]> = {
  Rendah: ['#15803D', '#DCFCE7'],
  Sedang: ['#B45309', '#FEF3C7'],
  Tinggi: ['#C2410C', '#FFEDD5'],
  Kritis: ['#B91C1C', '#FEE2E2'],
};

export const RoleColors: Record<string, string> = {
  'Lv.0 · Admin': '#6D28D9',
  'Lv.1 · President': '#1E40AF',
  'Lv.2 · Vice President': '#2563EB',
  'Lv.3 · General Manager': '#0369A1',
  'Lv.4 · Manager': '#15803D',
  'Lv.5 · Supervisor': '#B45309',
  'Lv.6 · Staff': '#475569',
};
