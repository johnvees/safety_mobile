import { C } from '@/theme/colors';

export const JENIS_OPTIONS: Record<string, string[]> = {
  SoP: ['Keselamatan Kerja (K3)', 'Pengelolaan Lingkungan', 'Kesehatan Kerja', 'Tanggap Darurat', 'Manajemen Risiko'],
  WI: ['Operasional Alat', 'Proses Produksi', 'Perawatan & Pemeliharaan', 'Penanganan Bahan Kimia', 'Prosedur Evakuasi'],
  Form: ['Inspeksi Harian', 'Checklist APD', 'Laporan Kecelakaan', 'Audit Internal', 'Pemeriksaan Berkala'],
  Edukasi: ['Video Edukasi', 'Modul Pelatihan', 'Infografis', 'Presentasi', 'Quiz & Evaluasi'],
};

export const MODULE_META: Record<
  string,
  { label: string; color: string; tint: string; icon: string }
> = {
  SoP: { label: 'SoP', color: C.teal, tint: C.teal100, icon: 'book-open' },
  WI: { label: 'Work Instruction', color: C.ok, tint: C.green100, icon: 'list' },
  Form: { label: 'Form', color: C.warn, tint: C.amber100, icon: 'file-text' },
  Edukasi: { label: 'Edukasi', color: C.violet, tint: C.violet100, icon: 'play-circle' },
};
