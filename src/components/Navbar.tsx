import React from 'react';
import { SchoolSettings } from '../types';
import { Printer, Menu, School } from 'lucide-react';

interface NavbarProps {
  school: SchoolSettings;
  activeTab: string;
  onOpenMobileMenu: () => void;
  onPrintCurrentView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  school,
  activeTab,
  onOpenMobileMenu,
  onPrintCurrentView,
}) => {
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Ringkasan';
      case 'diagnostik': return 'Penilaian Diagnostik';
      case 'formatif': return 'Penilaian Formatif';
      case 'sumatif_materi': return 'Sumatif Akhir Materi';
      case 'sts': return 'Sumatif Tengah Semester (STS)';
      case 'sas': return 'Sumatif Akhir Semester (SAS)';
      case 'students': return 'Daftar Peserta Didik';
      case 'recap': return 'Rekap Nilai Kelas';
      case 'individual': return 'Rekap Individu Siswa';
      case 'analysis': return 'Analisis & Tindak Lanjut';
      case 'settings': return 'Pengaturan & Database';
      default: return 'Tabel Penilaian';
    }
  };

  return (
    <header className="no-print h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Zone 1: Wordmark & Mobile Trigger */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            <School className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Aplikasi Tabel Penilaian Guru
          </span>
        </div>
      </div>

      {/* Zone 2: Contextual Meta in clean unboxed typography */}
      <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 shrink-0">
        <span className="font-semibold text-slate-800">{getTabLabel(activeTab)}</span>
        <span aria-hidden="true" className="text-slate-300">/</span>
        <span>{school.namaSekolah}</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
          {school.mataPelajaran} {school.kelas}
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>Sem. {school.semester} {school.tahunAjaran}</span>
      </div>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onPrintCurrentView}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          title="Cetak tampilan dokumen ini"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Dokumen</span>
        </button>
      </div>
    </header>
  );
};
