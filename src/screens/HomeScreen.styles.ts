import { StyleSheet } from 'react-native';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: { paddingHorizontal: 18, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, height: 65 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontFamily: F.bold,
    color: C.white,
    lineHeight: 42,
    textAlign: 'center',
  },
  headerMid: { flex: 1 },
  headerGreeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: F.regular,
    lineHeight: 16,
  },
  headerName: {
    fontSize: 18,
    fontFamily: F.bold,
    color: C.white,
    lineHeight: 22,
    marginTop: -2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    fontSize: 8,
    fontFamily: F.bold,
    color: C.white,
    lineHeight: 14,
    textAlign: 'center',
  },

  // Breadcrumb row
  breadcrumbRow: { marginHorizontal: -18 },
  breadcrumbContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  scopePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 3,
  },
  scopeSep: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginHorizontal: 1,
  },
  scopePart: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: F.medium,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  roleDot: { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  roleText: { fontSize: 11, fontFamily: F.semiBold },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20 },

  // Sections
  section: { paddingHorizontal: 18, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontFamily: F.bold, color: C.ink },
  seeAll: { fontSize: 13, fontFamily: F.semiBold, color: C.teal },

  // KPI Grid
  kpiRow: { flexDirection: 'row', gap: 12 },
  kpiCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  kpiIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  trendText: { fontSize: 10, fontFamily: F.bold, lineHeight: 13 },
  kpiValue: {
    fontSize: 28,
    fontFamily: F.extraBold,
    letterSpacing: -0.5,
    lineHeight: 32,
    color: C.ink,
  },
  kpiLabel: {
    fontSize: 11.5,
    color: C.sec,
    fontFamily: F.medium,
    marginTop: 3,
  },

  // List card (shared)
  listCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: { height: 1, backgroundColor: C.line, marginLeft: 52 },

  // Plant status
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  plantDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  plantMid: { flex: 1 },
  plantName: { fontSize: 13, fontFamily: F.semiBold, color: C.ink },
  plantDiv: { fontSize: 11, color: C.mut, fontFamily: F.regular, marginTop: 1 },
  plantStatus: { fontSize: 13, fontFamily: F.bold, letterSpacing: 0.3 },

  // Activity feed
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  feedIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  feedBody: { flex: 1, justifyContent: 'center' },
  feedText: {
    fontSize: 13,
    fontFamily: F.semiBold,
    color: C.ink,
    lineHeight: 18,
  },
  feedSub: {
    fontSize: 11.5,
    color: C.mut,
    marginTop: 2,
    fontFamily: F.regular,
  },

  // Quick action overlay
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.82)',
    justifyContent: 'flex-end',
  },
  qaPanel: {
    paddingHorizontal: 18,
    gap: 10,
  },
  qaLabel: {
    fontSize: 11,
    fontFamily: F.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  qaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  qaIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  qaBody: { flex: 1 },
  qaTitle: { fontSize: 14, fontFamily: F.semiBold, color: C.ink },
  qaSub: { fontSize: 12, fontFamily: F.regular, color: C.mut, marginTop: 1 },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabDark: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
});
