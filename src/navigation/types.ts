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
  HseModulDetail: {
    id: string;
    title: string;
    cat: string;
    module: string;
    updated: string;
    attachments?: { id: string; type: string; name: string }[];
    deskripsi?: string;
    poin?: { id: string; text: string }[];
    onSave?: (updated: {
      title: string;
      cat: string;
      attachments: { id: string; type: string; name: string }[];
      deskripsi: string;
      poin: { id: string; text: string }[];
    }) => void;
    onDelete?: () => void;
  };
};

export type BottomTabParamList = {
  Home: undefined;
  Laporan: undefined;
  HSE: undefined;
  Chat: undefined;
  More: undefined;
};
