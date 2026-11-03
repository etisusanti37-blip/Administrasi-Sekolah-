import React, { useState } from 'react';
import {
  AssessmentItem,
  AssessmentWeights,
  EnrichmentFollowUp,
  RemedialFollowUp,
  SchoolSettings,
  Student,
  StudentScore,
} from '../types';
import { calculateStudentRecap, getPredicate } from '../utils/gradeCalculator';
import { PrintHeader } from '../components/PrintHeader';
import { PrintSignatures } from '../components/PrintSignatures';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
  Plus,
  Printer,
  Trash2,
  Calendar,
  X,
  FileText,
} from 'lucide-react';

interface AnalysisAndFollowUpViewProps {
  school: SchoolSettings;
  students: Student[];
  assessments: AssessmentItem[];
  scores: StudentScore[];
  weights: AssessmentWeights;
  remedials: RemedialFollowUp[];
  enrichments: EnrichmentFollowUp[];
  onAddRemedial: (rem: Omit<RemedialFollowUp, 'id'>) => void;
  onDeleteRemedial: (id: string) => void;
  onAddEnrichment: (enr: Omit<EnrichmentFollowUp, 'id'>) => void;
  onDeleteEnrichment: (id: string) => void;
}

export const AnalysisAndFollowUpView: React.FC<AnalysisAndFollowUpViewProps> = ({
  school,
  students,
  assessments,
  scores,
  weights,
  remedials,
  enrichments,
  onAddRemedial,
  onDeleteRemedial,
  onAddEnrichment,
  onDeleteEnrichment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'grafik' | 'remedial' | 'pengayaan'>('grafik');

  // Remedial modal
  const [isRemedialModalOpen, setIsRemedialModalOpen] = useState(false);
  const [remStudentId, setRemStudentId] = useState(students[0]?.id || '');
  const [remTpMateri, setRemTpMateri] = useState('');
  const [remNilaiAwal, setRemNilaiAwal] = useState('65');
  const [remNilaiAkhir, setRemNilaiAkhir] = useState('78');
  const [remBentuk, setRemBentuk] = useState('Tutor sebaya dan pengerjaan lembar kerja bimbingan khusus');
  const [remTanggal, setRemTanggal] = useState(new Date().toISOString().substring(0, 10));
  const [remKeterangan, setRemKeterangan] = useState('Tuntas setelah remedial.');

  // Enrichment modal
  const [isEnrichModalOpen, setIsEnrichModalOpen] = useState(false);
  const [enrStudentId, setEnrStudentId] = useState(students[0]?.id || '');
  const [enrTpMateri, setEnrTpMateri] = useState('');
  const [enrNilaiAwal, setEnrNilaiAwal] = useState('95');
  const [enrBentuk, setEnrBentuk] = useState('Pemberian modul soal pengayaan HOTS dan menjadi tutor sebaya');
  const [enrTanggal, setEnrTanggal] = useState(new Date().toISOString().substring(0, 10));
  const [enrKeterangan, setEnrKeterangan] = useState('Menyelesaikan soal tantangan dengan sangat memuaskan.');

  // Calculate recap rows
  const recapRows = students.map((s) =>
    calculateStudentRecap(s, assessments, scores, weights, school.kktp)
  );

  // Distribution bins
  const validFinals = recapRows
    .map((r) => r.nilaiAkhir)
    .filter((n): n is number => n !== null);

  const binSangatBaik = validFinals.filter((n) => n >= 88).length;
  const binBaik = validFinals.filter((n) => n >= school.kktp && n < 88).length;
  const binCukup = validFinals.filter((n) => n >= Math.max(0, school.kktp - 10) && n < school.kktp).length;
  const binPerluBimbingan = validFinals.filter((n) => n < Math.max(0, school.kktp - 10)).length;
  const maxBinCount = Math.max(binSangatBaik, binBaik, binCukup, binPerluBimbingan, 1);

  // Per assessment averages
  const assessmentStats = assessments.map((asm) => {
    const itemScores = scores
      .filter((s) => s.assessmentId === asm.id && s.score !== null)
      .map((s) => s.score as number);
    const avg =
      itemScores.length > 0
        ? Math.round((itemScores.reduce((a, b) => a + b, 0) / itemScores.length) * 10) / 10
        : null;
    const tuntasPercent =
      itemScores.length > 0
        ? Math.round((itemScores.filter((x) => x >= (asm.kktpOverride || school.kktp)).length / itemScores.length) * 100)
        : 0;

    return {
      asm,
      avg,
      count: itemScores.length,
      tuntasPercent,
    };
  });

  const handleSaveRemedial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remStudentId) return;

    onAddRemedial({
      studentId: remStudentId,
      assessmentId: assessments[0]?.id || 'custom',
      tpMateri: remTpMateri.trim() || 'Materi Remedial Pembelajaran',
      nilaiAwal: Number(remNilaiAwal) || 60,
      nilaiRemedial: remNilaiAkhir ? Number(remNilaiAkhir) : null,
      bentukRemedial: remBentuk.trim(),
      tanggalPelaksanaan: remTanggal,
      keterangan: remKeterangan.trim(),
    });
    setIsRemedialModalOpen(false);
  };

  const handleSaveEnrichment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrStudentId) return;

    onAddEnrichment({
      studentId: enrStudentId,
      assessmentId: assessments[0]?.id || 'custom',
      tpMateri: enrTpMateri.trim() || 'Pendalaman Materi & HOTS',
      nilaiAwal: Number(enrNilaiAwal) || 92,
      bentukPengayaan: enrBentuk.trim(),
      tanggalPelaksanaan: enrTanggal,
      keterangan: enrKeterangan.trim(),
    });
    setIsEnrichModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Official Print Header */}
      <PrintHeader
        school={school}
        title="LAPORAN ANALISIS HASIL BELAJAR & PROGRAM TINDAK LANJUT"
        subtitle={`Semester ${school.semester} - Tahun Ajaran ${school.tahunAjaran}`}
      />

      {/* Screen Title & Action Bar */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Analisis Hasil Belajar & Program Tindak Lanjut
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik distribusi capaian nilai, program remedial terstruktur, dan program pengayaan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak Laporan & Berita Acara
          </button>
        </div>
      </div>

      {/* Sub Tabs Selector */}
      <div className="no-print flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('grafik')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'grafik'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          1. Grafik & Distribusi Nilai
        </button>
        <button
          onClick={() => setActiveSubTab('remedial')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'remedial'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          2. Program Remedial ({remedials.length})
        </button>
        <button
          onClick={() => setActiveSubTab('pengayaan')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'pengayaan'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          3. Program Pengayaan ({enrichments.length})
        </button>
      </div>

      {/* TAB 1: GRAFIK & DISTRIBUSI NILAI */}
      {activeSubTab === 'grafik' && (
        <div className="space-y-6">
          {/* Histogram Bins */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Distribusi Rentang Capaian Nilai Akhir
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Berdasarkan batas kriteria ketuntasan (KKTP: {school.kktp})
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Sangat Baik */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <span className="text-xs font-bold text-emerald-900 block">Sangat Baik (A)</span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">Rentang 88 - 100</span>
                <p className="text-2xl font-mono font-bold text-emerald-800 mt-2 tabular-nums">
                  {binSangatBaik} <span className="text-xs font-normal">Siswa</span>
                </p>
                <div className="w-full bg-emerald-200/60 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(binSangatBaik / maxBinCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Baik */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                <span className="text-xs font-bold text-blue-900 block">Baik (B)</span>
                <span className="text-[11px] text-blue-700 block mt-0.5">Rentang {school.kktp} - 87</span>
                <p className="text-2xl font-mono font-bold text-blue-800 mt-2 tabular-nums">
                  {binBaik} <span className="text-xs font-normal">Siswa</span>
                </p>
                <div className="w-full bg-blue-200/60 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(binBaik / maxBinCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Cukup */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                <span className="text-xs font-bold text-amber-900 block">Cukup (C)</span>
                <span className="text-[11px] text-amber-700 block mt-0.5">Rentang {school.kktp - 10} - {school.kktp - 1}</span>
                <p className="text-2xl font-mono font-bold text-amber-800 mt-2 tabular-nums">
                  {binCukup} <span className="text-xs font-normal">Siswa</span>
                </p>
                <div className="w-full bg-amber-200/60 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(binCukup / maxBinCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Perlu Bimbingan */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
                <span className="text-xs font-bold text-rose-900 block">Perlu Bimbingan (D)</span>
                <span className="text-[11px] text-rose-700 block mt-0.5">Di bawah {school.kktp - 10}</span>
                <p className="text-2xl font-mono font-bold text-rose-800 mt-2 tabular-nums">
                  {binPerluBimbingan} <span className="text-xs font-normal">Siswa</span>
                </p>
                <div className="w-full bg-rose-200/60 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-rose-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(binPerluBimbingan / maxBinCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Per Asesmen Performance Chart / Bars */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1">
              Rata-rata Capaian Nilai per Tujuan Pembelajaran / Asesmen
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Evaluasi ketercapaian per materi pokok dibandingkan dengan batas KKTP ({school.kktp})
            </p>

            <div className="space-y-4">
              {assessmentStats.map((item) => (
                <div key={item.asm.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <span className="font-bold text-xs text-slate-800">{item.asm.judul}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Lingkup Materi: {item.asm.lingkupMateri}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        Rerata: {item.avg !== null ? item.avg : '-'}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-emerald-700">
                        {item.tuntasPercent}% Tuntas
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
                    {/* KKTP Indicator line at e.g. 75% */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10"
                      style={{ left: `${school.kktp}%` }}
                      title={`Batas KKTP: ${school.kktp}`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (item.avg || 0) >= school.kktp ? 'bg-indigo-600' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, item.avg || 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROGRAM REMEDIAL */}
      {activeSubTab === 'remedial' && (
        <div className="space-y-6">
          <div className="no-print flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Daftar Pelaksanaan Remedial Terstruktur
              </h3>
              <p className="text-xs text-slate-500">
                Program bimbingan khusus bagi peserta didik yang belum mencapai kriteria ketercapaian (KKTP: {school.kktp})
              </p>
            </div>
            <button
              onClick={() => setIsRemedialModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Catat Remedial Siswa
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-4 min-w-[160px]">Nama Peserta Didik</th>
                    <th className="py-3 px-4 min-w-[160px]">Materi / TP yang Diremedial</th>
                    <th className="py-3 px-3 w-20 text-center">Nilai Awal</th>
                    <th className="py-3 px-4 min-w-[200px]">Bentuk Intervensi Remedial</th>
                    <th className="py-3 px-3 w-24 text-center">Tgl Remedial</th>
                    <th className="py-3 px-3 w-24 text-center">Nilai Akhir</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-2 w-12 text-center no-print">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {remedials.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Belum ada catatan pelaksanaan program remedial.
                      </td>
                    </tr>
                  ) : (
                    remedials.map((rem, idx) => {
                      const studentObj = students.find((s) => s.id === rem.studentId);
                      return (
                        <tr key={rem.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            {studentObj?.nama || 'Siswa'}
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 font-medium">
                            {rem.tpMateri}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums text-rose-600 font-bold">
                            {rem.nilaiAwal}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {rem.bentukRemedial}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">
                            {rem.tanggalPelaksanaan || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums text-emerald-700 font-bold">
                            {rem.nilaiRemedial !== null ? rem.nilaiRemedial : 'Proses'}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                            {rem.keterangan || 'Tuntas remedial.'}
                          </td>
                          <td className="py-2.5 px-2 text-center no-print">
                            <button
                              onClick={() => onDeleteRemedial(rem.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Hapus baris remedial"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROGRAM PENGAYAAN */}
      {activeSubTab === 'pengayaan' && (
        <div className="space-y-6">
          <div className="no-print flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Daftar Pelaksanaan Program Pengayaan
              </h3>
              <p className="text-xs text-slate-500">
                Pemberian materi pendalaman, soal tantangan tingkat lanjut (HOTS), atau peran tutor sebaya
              </p>
            </div>
            <button
              onClick={() => setIsEnrichModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Catat Pengayaan Siswa
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-4 min-w-[160px]">Nama Peserta Didik</th>
                    <th className="py-3 px-4 min-w-[160px]">Materi Pengayaan</th>
                    <th className="py-3 px-3 w-20 text-center">Nilai Awal</th>
                    <th className="py-3 px-4 min-w-[200px]">Bentuk Kegiatan Pengayaan</th>
                    <th className="py-3 px-3 w-24 text-center">Tgl Kegiatan</th>
                    <th className="py-3 px-4">Hasil / Keterangan</th>
                    <th className="py-3 px-2 w-12 text-center no-print">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrichments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Belum ada catatan program pengayaan siswa.
                      </td>
                    </tr>
                  ) : (
                    enrichments.map((enr, idx) => {
                      const studentObj = students.find((s) => s.id === enr.studentId);
                      return (
                        <tr key={enr.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            {studentObj?.nama || 'Siswa'}
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 font-medium">
                            {enr.tpMateri}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums text-indigo-700 font-bold">
                            {enr.nilaiAwal}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {enr.bentukPengayaan}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">
                            {enr.tanggalPelaksanaan || '-'}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 text-[11px]">
                            {enr.keterangan || 'Sangat baik.'}
                          </td>
                          <td className="py-2.5 px-2 text-center no-print">
                            <button
                              onClick={() => onDeleteEnrichment(enr.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Hapus baris pengayaan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Signatures for Printout */}
      <PrintSignatures school={school} />

      {/* Modal: Add Remedial Record */}
      {isRemedialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">Catat Program Remedial Siswa</h3>
              <button
                onClick={() => setIsRemedialModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRemedial} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Peserta Didik
                </label>
                <select
                  value={remStudentId}
                  onChange={(e) => setRemStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nama} ({st.nisn ? `NISN: ${st.nisn}` : `NIS: ${st.nis || '-'}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tujuan Pembelajaran / Materi Belum Tuntas
                </label>
                <input
                  type="text"
                  required
                  value={remTpMateri}
                  onChange={(e) => setRemTpMateri(e.target.value)}
                  placeholder="Contoh: Operasi Hitung Campuran Bilangan Pecahan"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nilai Awal (Sebelum Remedial)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={remNilaiAwal}
                    onChange={(e) => setRemNilaiAwal(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nilai Setelah Remedial
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={remNilaiAkhir}
                    onChange={(e) => setRemNilaiAkhir(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bentuk Kegiatan Remedial
                </label>
                <input
                  type="text"
                  value={remBentuk}
                  onChange={(e) => setRemBentuk(e.target.value)}
                  placeholder="Contoh: Pembelajaran ulang terbimbing dan tes perbaikan"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    value={remTanggal}
                    onChange={(e) => setRemTanggal(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Keterangan
                  </label>
                  <input
                    type="text"
                    value={remKeterangan}
                    onChange={(e) => setRemKeterangan(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRemedialModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Simpan Catatan Remedial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Enrichment Record */}
      {isEnrichModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">Catat Program Pengayaan Siswa</h3>
              <button
                onClick={() => setIsEnrichModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEnrichment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Peserta Didik
                </label>
                <select
                  value={enrStudentId}
                  onChange={(e) => setEnrStudentId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.nama} ({st.nisn ? `NISN: ${st.nisn}` : `NIS: ${st.nis || '-'}`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Materi Pokok / Bidang Pendalaman
                </label>
                <input
                  type="text"
                  required
                  value={enrTpMateri}
                  onChange={(e) => setEnrTpMateri(e.target.value)}
                  placeholder="Contoh: Soal Penalaran Tingkat Tinggi (HOTS) & Olimpiade Matematika"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Awal (Tinggi / Melampaui KKTP)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={enrNilaiAwal}
                  onChange={(e) => setEnrNilaiAwal(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bentuk Kegiatan Pengayaan
                </label>
                <input
                  type="text"
                  value={enrBentuk}
                  onChange={(e) => setEnrBentuk(e.target.value)}
                  placeholder="Contoh: Tutor sebaya dan penyelesaian proyek terapan"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    value={enrTanggal}
                    onChange={(e) => setEnrTanggal(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hasil / Catatan Guru
                  </label>
                  <input
                    type="text"
                    value={enrKeterangan}
                    onChange={(e) => setEnrKeterangan(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEnrichModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Simpan Catatan Pengayaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
