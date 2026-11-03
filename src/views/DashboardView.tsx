import React from 'react';
import {
  AssessmentCategory,
  AssessmentItem,
  AssessmentWeights,
  SchoolSettings,
  Student,
  StudentScore,
} from '../types';
import { calculateStatistics } from '../utils/gradeCalculator';
import {
  Users,
  BrainCircuit,
  ClipboardCheck,
  FileCheck2,
  CalendarCheck2,
  Award,
  ArrowRight,
  Sparkles,
  School,
  CheckCircle2,
  Info,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface DashboardViewProps {
  school: SchoolSettings;
  students: Student[];
  assessments: AssessmentItem[];
  scores: StudentScore[];
  weights: AssessmentWeights;
  onNavigate: (tabId: string) => void;
  onResetData: () => void;
  onClearSample: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  school,
  students,
  assessments,
  scores,
  weights,
  onNavigate,
  onResetData,
  onClearSample,
}) => {
  // Statistics calculations
  const totalStudents = students.length;

  const getCategoryStats = (cat: AssessmentCategory) => {
    const itemIds = assessments.filter((a) => a.category === cat).map((a) => a.id);
    const catScores = scores
      .filter((s) => itemIds.includes(s.assessmentId))
      .map((s) => s.score);
    return calculateStatistics(catScores, school.kktp);
  };

  const diagStats = getCategoryStats('diagnostik');
  const formatifStats = getCategoryStats('formatif');
  const sumatifStats = getCategoryStats('sumatif_materi');
  const stsStats = getCategoryStats('sts');
  const sasStats = getCategoryStats('sas');

  // Overall completion
  const totalSlots = assessments.length * totalStudents;
  const gradedSlots = scores.filter((s) => s.score !== null).length;
  const overallCompletion = totalSlots > 0 ? Math.round((gradedSlots / totalSlots) * 100) : 0;

  const menuCards = [
    {
      id: 'diagnostik',
      number: '1',
      title: 'Penilaian Diagnostik',
      desc: 'Pemetaan awal kesiapan belajar, gaya belajar, & prasyarat materi sebelum pembelajaran.',
      note: 'Non-bobot (tidak masuk nilai rapor)',
      icon: BrainCircuit,
      color: 'border-cyan-200 bg-cyan-50/50 hover:border-cyan-400',
      iconColor: 'text-cyan-700 bg-cyan-100',
      stats: `${diagStats.dinilaiCount} dari ${students.length} dinilai`,
      badge: 'Pemetaan Awal',
    },
    {
      id: 'formatif',
      number: '2',
      title: 'Penilaian Formatif',
      desc: 'Pemantauan proses belajar per Tujuan Pembelajaran (TP) untuk umpan balik berkala.',
      note: `Bobot Rapor: ${weights.formatif}%`,
      icon: ClipboardCheck,
      color: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400',
      iconColor: 'text-emerald-700 bg-emerald-100',
      stats: `Rata-rata: ${formatifStats.rataRata ?? '-'} · ${formatifStats.persentaseTuntas}% Tuntas`,
      badge: `${assessments.filter((a) => a.category === 'formatif').length} Asesmen`,
    },
    {
      id: 'sumatif_materi',
      number: '3',
      title: 'Sumatif Akhir Materi',
      desc: 'Asesmen pencapaian lingkup materi/Bab untuk memastikan ketuntasan kompetensi.',
      note: `Bobot Rapor: ${weights.sumatifMateri}%`,
      icon: FileCheck2,
      color: 'border-blue-200 bg-blue-50/50 hover:border-blue-400',
      iconColor: 'text-blue-700 bg-blue-100',
      stats: `Rata-rata: ${sumatifStats.rataRata ?? '-'} · ${sumatifStats.persentaseTuntas}% Tuntas`,
      badge: `${assessments.filter((a) => a.category === 'sumatif_materi').length} Asesmen`,
    },
    {
      id: 'sts',
      number: '4',
      title: 'Sumatif Tengah Semester (STS)',
      desc: 'Evaluasi capaian belajar tengah semester untuk mengukur retensi konsep siswa.',
      note: `Bobot Rapor: ${weights.sts}%`,
      icon: CalendarCheck2,
      color: 'border-amber-200 bg-amber-50/50 hover:border-amber-400',
      iconColor: 'text-amber-700 bg-amber-100',
      stats: `Rata-rata: ${stsStats.rataRata ?? '-'} · ${stsStats.persentaseTuntas}% Tuntas`,
      badge: `${assessments.filter((a) => a.category === 'sts').length} Asesmen`,
    },
    {
      id: 'sas',
      number: '5',
      title: 'Sumatif Akhir Semester (SAS)',
      desc: 'Pengukuran komprehensif seluruh capaian pembelajaran semester untuk nilai rapor.',
      note: `Bobot Rapor: ${weights.sas}%`,
      icon: Award,
      color: 'border-purple-200 bg-purple-50/50 hover:border-purple-400',
      iconColor: 'text-purple-700 bg-purple-100',
      stats: `Rata-rata: ${sasStats.rataRata ?? '-'} · ${sasStats.persentaseTuntas}% Tuntas`,
      badge: `${assessments.filter((a) => a.category === 'sas').length} Asesmen`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Privacy & Sample Data Protection Banner */}
      <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900">Perlindungan Data Pribadi Siswa & Penyimpanan Lokal</p>
            <p className="text-slate-600 mt-0.5">
              Data peserta didik tersimpan secara aman di peramban (browser) dan perangkat Anda tanpa dikirim ke server pihak ketiga.
              Jika nama siswa yang tampil saat ini adalah data simulasi, Anda dapat menggantinya dengan data kelas asli Anda.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClearSample}
            className="px-3 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Kosongkan Data Simulasi
          </button>
          <button
            onClick={onResetData}
            className="px-3 py-1.5 font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Muat Data Contoh
          </button>
        </div>
      </div>

      {/* School Identity Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{school.namaSekolah}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  NPSN: {school.npsn}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{school.alamatSekolah}</p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">Mata Pelajaran:</span>{' '}
                  <span className="text-indigo-600 font-bold">{school.mataPelajaran}</span>
                </div>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <div>
                  <span className="font-semibold text-slate-800">Kelas / Fase:</span>{' '}
                  <span className="font-medium text-slate-900">{school.kelas} ({school.fase})</span>
                </div>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <div>
                  <span className="font-semibold text-slate-800">Tahun Ajaran:</span>{' '}
                  <span className="font-medium text-slate-900">{school.tahunAjaran} ({school.semester})</span>
                </div>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <div>
                  <span className="font-semibold text-slate-800">KKTP / KKM:</span>{' '}
                  <span className="font-mono font-bold text-emerald-600">{school.kktp}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <span className="text-xs text-slate-500">Guru Pengampu:</span>
            <span className="text-sm font-bold text-slate-800">{school.namaGuru}</span>
            <span className="text-xs font-mono text-slate-500">{school.nipGuru ? `NIP: ${school.nipGuru}` : 'NIP: -'}</span>
            <button
              onClick={() => onNavigate('settings')}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
            >
              Ubah Pengaturan Kelas →
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500">Total Peserta Didik</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {totalStudents}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {students.filter((s) => s.jenisKelamin === 'L').length} L ·{' '}
            {students.filter((s) => s.jenisKelamin === 'P').length} P
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500">Kemajuan Input Nilai</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-indigo-600 mt-1">
            {overallCompletion}%
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${overallCompletion}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500">Rerata Formatif</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {formatifStats.rataRata ?? '-'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {formatifStats.persentaseTuntas}% Tuntas KKTP ({school.kktp})
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500">Rerata Sumatif Materi</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-blue-600 mt-1">
            {sumatifStats.rataRata ?? '-'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {sumatifStats.persentaseTuntas}% Tuntas KKTP ({school.kktp})
          </p>
        </div>
      </div>

      {/* 5 Menus Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">5 Menu Utama Penilaian Guru</h3>
            <p className="text-xs text-slate-500">
              Sesuai kaidah asesmen Kurikulum Merdeka dan Kurikulum 2013 untuk semua jenjang
            </p>
          </div>
          <button
            onClick={() => onNavigate('recap')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            Lihat Rekap Nilai Rapor
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className={`p-5 rounded-xl border bg-white transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between group ${card.color}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${card.iconColor}`}>
                        {card.number}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{card.badge}</span>
                    </div>
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{card.stats}</span>
                  <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Buka
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Roster Card */}
          <div
            onClick={() => onNavigate('students')}
            className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:border-indigo-300 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-indigo-700">Master Data</span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                Daftar Peserta Didik
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Kelola nama siswa, NISN, NIS, serta impor massal dari Excel atau CSV. Cukup dimasukkan sekali dan otomatis digunakan pada seluruh penilaian.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-200/80 flex items-center justify-between text-xs">
              <span className="text-indigo-900 font-semibold">{totalStudents} Siswa Terdaftar</span>
              <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Kelola
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
