export type RootStackParamList = {
  MainTabs: undefined;
  CaseIncident: undefined;
  InsidenDetail: { id: string };
  InspeksiList: undefined;
  InspeksiDetail: { id: string };
  PermitList: undefined;
  PermitDetail: { id: string };
  Notifikasi: undefined;
  DashboardFull: undefined;
  SettingsFull: undefined;
  MasterData: undefined;
  Chat: undefined;
  HseModuleBuat: { moduleType: 'SoP' | 'WI' | 'Form' | 'Edukasi' };
  HseModulDetail: { id: string; title: string; cat: string; module: string; updated: string };
};

export type BottomTabParamList = {
  Home: undefined;
  Laporan: undefined;
  HSE: undefined;
  More: undefined;
};
