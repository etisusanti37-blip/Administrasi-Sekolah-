import React from 'react';
import {
  LayoutDashboard,
  BrainCircuit,
  ClipboardCheck,
  FileCheck2,
  CalendarCheck2,
  Award,
  Users,
  TableProperties,
  UserCheck,
  BarChart3,
  SlidersHorizontal,
  X,
  BookOpen,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  studentCount: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  badge?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  studentCount,
}) => {
  const navSections: NavSection[] = [
    {
      group: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard Ringkasan', icon: LayoutDashboard },
      ],
    },
    {
      group: '5 MENU PENILAIAN GURU',
      items: [
        { id: 'diagnostik', label: '1. Penilaian Diagnostik', icon: BrainCircuit, badge: 'Awal TP' },
        { id: 'formatif', label: '2. Penilaian Formatif', icon: ClipboardCheck, badge: 'Proses' },
        { id: 'sumatif_materi', label: '3. Sumatif Akhir Materi', icon: FileCheck2, badge: 'Bab' },
        { id: 'sts', label: '4. Sumatif Tgh Semester (STS)', icon: CalendarCheck2, badge: 'Tengah' },
        { id: 'sas', label: '5. Sumatif Akhir Semester (SAS)', icon: Award, badge: 'Akhir' },
      ],
    },
    {
      group: 'DATA & REKAPITULASI',
      items: [
        { id: 'students', label: 'Daftar Peserta Didik', icon: Users, count: studentCount },
        { id: 'recap', label: 'Rekap Nilai Kelas (Ledger)', icon: TableProperties },
        { id: 'individual', label: 'Rekap Individu Siswa', icon: UserCheck },
        { id: 'analysis', label: 'Analisis & Tindak Lanjut', icon: BarChart3 },
      ],
    },
    {
      group: 'PENGATURAN & SISTEM',
      items: [
        { id: 'settings', label: 'Pengaturan & Database', icon: SlidersHorizontal },
      ],
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 lg:translate-x-0 no-print ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center text-white font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                TABEL PENILAIAN
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Semua Jenjang & Mapel
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {section.group}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate text-left">{item.label}</span>
                    </div>

                    {item.count !== undefined && (
                      <span
                        className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-indigo-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                          isActive
                            ? 'bg-indigo-800 text-indigo-100'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Kurikulum Merdeka & K13 Notice footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Standar Penilaian Kemdikbud</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Mendukung Fase A–F Kurikulum Merdeka & K13. Dilengkapi sistem pemisahan bobot diagnostik.
          </p>
        </div>
      </aside>
    </>
  );
};
