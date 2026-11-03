import React, { useState } from 'react';
import {
  AssessmentCategory,
  AssessmentItem,
  SchoolSettings,
  Student,
  StudentScore,
} from '../types';
import {
  calculateStatistics,
  generateAutoFeedback,
  getAchievementStatus,
  getPredicate,
} from '../utils/gradeCalculator';
import { exportAssessmentToExcel } from '../utils/excelHelper';
import { PrintHeader } from '../components/PrintHeader';
import { PrintSignatures } from '../components/PrintSignatures';
import {
  Plus,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Calendar,
  BookOpen,
  HelpCircle,
  Info,
  Trash2,
  X,
  RotateCcw
} from 'lucide-react';

interface AssessmentTableViewProps {
  category: AssessmentCategory;
  categoryTitle: string;
  categorySubtitle: string;
  school: SchoolSettings;
  students: Student[];
  assessments: AssessmentItem[];
  scores: StudentScore[];
  onUpdateScore: (assessmentId: string, studentId: string, score: number | null, feedback?: string) => void;
  onBatchUpdateScores: (assessmentId: string, updates: { studentId: string; score: number | null; feedback?: string }[]) => void;
  onCreateAssessment: (newItem: Omit<AssessmentItem, 'id'>) => void;
  onDeleteAssessment: (assessmentId: string) => void;
}

export const AssessmentTableView: React.FC<AssessmentTableViewProps> = ({
  category,
  categoryTitle,
  categorySubtitle,
  school,
  students,
  assessments,
  scores,
  onUpdateScore,
  onBatchUpdateScores,
  onCreateAssessment,
  onDeleteAssessment,
}) => {
  // Category items
  const categoryAssessments = assessments.filter((a) => a.category === category);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    categoryAssessments[0]?.id || ''
  );

  // If selected assessment was deleted or invalid, fallback to first
  const currentAssessment =
    categoryAssessments.find((a) => a.id === selectedAssessmentId) || categoryAssessments[0];

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tuntas' | 'remedial' | 'belum'>('all');

  // Modals & Batch tools
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBatchScoreModalOpen, setIsBatchScoreModalOpen] = useState(false);
  const [batchScoreValue, setBatchScoreValue] = useState<string>('80');

  // New assessment form state
  const [newJudul, setNewJudul] = useState('');
  const [newMateri, setNewMateri] = useState('');
  const [newTP, setNewTP] = useState('');
  const [newTanggal, setNewTanggal] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [newSubType, setNewSubType] = useState<'Kognitif' | 'Non-Kognitif' | 'Tes Tulis' | 'Praktik' | 'Projek'>(
    category === 'diagnostik' ? 'Kognitif' : 'Tes Tulis'
  );

  // Editing cells state
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  const kktp = currentAssessment?.kktpOverride || school.kktp;

  // Scores for this specific assessment
  const currentAssessmentScores = students.map((student) => {
    const found = scores.find(
      (s) => s.studentId === student.id && s.assessmentId === currentAssessment?.id
    );
    return {
      student,
      scoreRecord: found,
      score: found !== undefined && found.score !== undefined ? found.score : null,
      feedback: found?.feedback || '',
    };
  });

  // Calculate statistics
  const scoreNumbers = currentAssessmentScores.map((c) => c.score);
  const stats = calculateStatistics(scoreNumbers, kktp);

  // Filtered rows
  const filteredRows = currentAssessmentScores.filter(({ student, score }) => {
    const matchesSearch =
      student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nisn && student.nisn.includes(searchQuery)) ||
      (student.nis && student.nis.includes(searchQuery));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'belum') return score === null || score === undefined;
    if (statusFilter === 'tuntas') return score !== null && score >= kktp;
    if (statusFilter === 'remedial') return score !== null && score < kktp;

    return true;
  });

  const handleScoreInputChange = (studentId: string, rawVal: string, feedback?: string) => {
    const errorKey = studentId;

    if (rawVal.trim() === '') {
      // Set to null (Belum Dinilai)
      setInputErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
      if (currentAssessment) {
        onUpdateScore(currentAssessment.id, studentId, null, feedback);
      }
      return;
    }

    const num = Number(rawVal);
    if (isNaN(num) || num < 0 || num > 100) {
      setInputErrors((prev) => ({
        ...prev,
        [errorKey]: 'Nilai harus 0-100',
      }));
      return;
    }

    setInputErrors((prev) => {
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });

    if (currentAssessment) {
      // If no feedback yet, optionally suggest feedback
      const autoNote = feedback !== undefined ? feedback : generateAutoFeedback(studentId, num, currentAssessment.tujuanPembelajaran, kktp);
      onUpdateScore(currentAssessment.id, studentId, num, autoNote);
    }
  };

  const handleGenerateAllFeedback = () => {
    if (!currentAssessment) return;
    const updates = currentAssessmentScores.map(({ student, score }) => {
      const note = generateAutoFeedback(
        student.nama,
        score,
        currentAssessment.tujuanPembelajaran,
        kktp
      );
      return {
        studentId: student.id,
        score,
        feedback: note,
      };
    });
    onBatchUpdateScores(currentAssessment.id, updates);
  };

  const handleApplyBatchScore = () => {
    if (!currentAssessment) return;
    const val = Number(batchScoreValue);
    if (isNaN(val) || val < 0 || val > 100) return;

    const updates = students.map((s) => ({
      studentId: s.id,
      score: val,
      feedback: generateAutoFeedback(
        s.nama,
        val,
        currentAssessment.tujuanPembelajaran,
        kktp
      ),
    }));
    onBatchUpdateScores(currentAssessment.id, updates);
    setIsBatchScoreModalOpen(false);
  };

  const handleResetScores = () => {
    if (!currentAssessment) return;
    if (window.confirm(`Kosongkan seluruh nilai pada "${currentAssessment.judul}"? Semua nilai akan kembali menjadi "Belum Dinilai".`)) {
      const updates = students.map((s) => ({
        studentId: s.id,
        score: null,
        feedback: '',
      }));
      onBatchUpdateScores(currentAssessment.id, updates);
    }
  };

  const handleCreateAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudul.trim()) return;

    onCreateAssessment({
      category,
      judul: newJudul.trim(),
      lingkupMateri: newMateri.trim() || 'Lingkup Materi Pokok',
      tujuanPembelajaran: newTP.trim() || 'Tujuan Pembelajaran Sesuai Alur TP',
      tanggal: newTanggal,
      subType: newSubType,
    });

    setNewJudul('');
    setNewMateri('');
    setNewTP('');
    setIsCreateModalOpen(false);
  };

  const handleExport = () => {
    if (!currentAssessment) return;
    exportAssessmentToExcel(currentAssessment, students, scores, school);
  };

  return (
    <div className="space-y-6">
      {/* Official Print Header */}
      {currentAssessment && (
        <PrintHeader
          school={school}
          title={categoryTitle.toUpperCase()}
          subtitle={`${currentAssessment.judul} - Lingkup Materi: ${currentAssessment.lingkupMateri}`}
        />
      )}

      {/* Screen Title & Category Selector */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{categoryTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{categorySubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categoryAssessments.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                title="Ekspor tabel ini ke file Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Ekspor Excel
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                title="Cetak tabel penilaian"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                Cetak Tabel
              </button>
            </>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Asesmen Baru
          </button>
        </div>
      </div>

      {/* Special Diagnostik Rule Banner */}
      {category === 'diagnostik' && (
        <div className="no-print p-4 bg-cyan-50/70 border border-cyan-200 rounded-xl flex items-start gap-3 text-xs text-cyan-950">
          <Info className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Kaidah Kurikulum Merdeka:</span> Asesmen Diagnostik (Kognitif & Non-Kognitif) digunakan murni untuk memetakan kesiapan, minat, dan kebutuhan belajar siswa pada awal pembelajaran. Sesuai aturan panduan asesmen resmi, <strong>nilai diagnostik tidak dihitung ke dalam nilai akhir rapor</strong>.
          </div>
        </div>
      )}

      {/* Assessment Tabs Switcher */}
      {categoryAssessments.length > 0 ? (
        <div className="no-print bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 px-3 whitespace-nowrap">
            Pilih Asesmen:
          </span>
          <div className="flex items-center gap-1.5">
            {categoryAssessments.map((asm) => {
              const isSelected = asm.id === (currentAssessment?.id || '');
              return (
                <button
                  key={asm.id}
                  onClick={() => setSelectedAssessmentId(asm.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {asm.judul}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="no-print p-8 bg-white border border-dashed border-slate-300 rounded-xl text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Asesmen di Kategori Ini</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Buat asesmen baru untuk memasukkan tujuan pembelajaran, tanggal penilaian, dan mulai memberikan nilai kepada siswa.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Buat Asesmen Sekarang
          </button>
        </div>
      )}

      {currentAssessment && (
        <>
          {/* Assessment Metadata Banner */}
          <div className="no-print bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">
                    {currentAssessment.judul}
                  </h3>
                  {currentAssessment.subType && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {currentAssessment.subType}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
                  <span><strong>Materi:</strong> {currentAssessment.lingkupMateri}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span><strong>Tanggal:</strong> {currentAssessment.tanggal || '-'}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span><strong>KKTP:</strong> <span className="font-mono font-bold text-emerald-600">{kktp}</span></span>
                </div>
                <p className="text-xs text-slate-500 mt-1 italic">
                  <strong>Tujuan Pembelajaran:</strong> {currentAssessment.tujuanPembelajaran}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsBatchScoreModalOpen(true)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Isi nilai serentak untuk seluruh siswa"
                >
                  Nilai Massal
                </button>
                <button
                  onClick={handleGenerateAllFeedback}
                  className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="Generate catatan deskripsi otomatis sesuai nilai dan capaian TP"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto Catatan
                </button>
                <button
                  onClick={handleResetScores}
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded"
                  title="Reset nilai pada asesmen ini"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus asesmen "${currentAssessment.judul}"? Data nilai terkait akan dihapus.`)) {
                      onDeleteAssessment(currentAssessment.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  title="Hapus asesmen ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Strip */}
          <div className="no-print grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Status Dinilai</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {stats.dinilaiCount}
                </span>
                <span className="text-xs text-slate-400">/ {stats.totalSiswa} Siswa</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {stats.belumDinilaiCount} Belum Dinilai
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Rata-rata Kelas</span>
              <div className="text-lg font-bold font-mono tabular-nums text-indigo-600 mt-0.5">
                {stats.rataRata !== null ? stats.rataRata : '-'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Hanya dari siswa dinilai</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Nilai Tertinggi (Max)</span>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 mt-0.5">
                {stats.nilaiTertinggi !== null ? stats.nilaiTertinggi : '-'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Skor terbaik</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Nilai Terendah (Min)</span>
              <div className="text-lg font-bold font-mono tabular-nums text-rose-600 mt-0.5">
                {stats.nilaiTerendah !== null ? stats.nilaiTerendah : '-'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Perlu perhatian</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 col-span-2 md:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Persentase Tuntas</span>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                {stats.persentaseTuntas}%
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                {stats.tuntasCount} Tuntas · {stats.remedialCount} Remedial
              </span>
            </div>
          </div>

          {/* Table Search & Status Filter */}
          <div className="no-print bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa pada tabel..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-full md:w-auto overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Semua ({students.length})
              </button>
              <button
                onClick={() => setStatusFilter('tuntas')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === 'tuntas' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Tuntas ({stats.tuntasCount})
              </button>
              <button
                onClick={() => setStatusFilter('remedial')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === 'remedial' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Remedial ({stats.remedialCount})
              </button>
              <button
                onClick={() => setStatusFilter('belum')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === 'belum' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Belum Dinilai ({stats.belumDinilaiCount})
              </button>
            </div>
          </div>

          {/* Assessment Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3 w-28 font-mono">NISN</th>
                    <th className="py-3 px-4 min-w-[160px]">Nama Peserta Didik</th>
                    <th className="py-3 px-3 w-10 text-center">L/P</th>
                    <th className="py-3 px-3 w-28 text-center">
                      Nilai <span className="text-[10px] font-normal text-slate-500">(0-100)</span>
                    </th>
                    <th className="py-3 px-3 w-28 text-center">Predikat</th>
                    <th className="py-3 px-3 w-32 text-center">Status Ketercapaian</th>
                    <th className="py-3 px-4 min-w-[240px]">Catatan Guru / Capaian TP</th>
                    <th className="py-3 px-2 w-16 text-center no-print">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-500">
                        Tidak ada siswa yang sesuai filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map(({ student, score, feedback }, idx) => {
                      const predicate = getPredicate(score, kktp);
                      const status = getAchievementStatus(score, kktp);
                      const hasError = inputErrors[student.id];

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                            {student.nisn || '-'}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            {student.nama}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-500">
                            {student.jenisKelamin}
                          </td>

                          {/* Editable Score Cell with 0-100 Validation */}
                          <td className="py-2 px-3 text-center">
                            <div className="flex flex-col items-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                value={score !== null && score !== undefined ? score : ''}
                                placeholder="Belum Dinilai"
                                onChange={(e) =>
                                  handleScoreInputChange(student.id, e.target.value, feedback)
                                }
                                className={`w-24 px-2 py-1.5 text-center font-mono tabular-nums text-xs rounded border transition-colors focus:outline-hidden ${
                                  hasError
                                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                                    : score === null || score === undefined
                                    ? 'border-dashed border-slate-300 bg-slate-50 text-slate-400 placeholder:text-slate-400 font-normal italic'
                                    : score >= kktp
                                    ? 'border-emerald-300 bg-emerald-50/30 text-emerald-900 font-bold'
                                    : 'border-rose-300 bg-rose-50/30 text-rose-900 font-bold'
                                }`}
                              />
                              {hasError && (
                                <span className="text-[10px] text-rose-600 font-medium mt-0.5">
                                  {hasError}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Predikat */}
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${predicate.badgeClass}`}
                            >
                              {score !== null ? `${predicate.code} (${predicate.label})` : 'Belum Dinilai'}
                            </span>
                          </td>

                          {/* Status Ketercapaian */}
                          <td className="py-2 px-3 text-center">
                            <span className={`text-xs ${status.colorClass}`}>
                              {status.status}
                            </span>
                          </td>

                          {/* Catatan Guru */}
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={feedback}
                              placeholder="Ketik catatan atau klik Auto Catatan..."
                              onChange={(e) =>
                                onUpdateScore(currentAssessment.id, student.id, score, e.target.value)
                              }
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-indigo-500 focus:outline-hidden text-slate-700"
                            />
                          </td>

                          {/* Quick Actions */}
                          <td className="py-2 px-2 text-center no-print">
                            {score !== null ? (
                              <button
                                onClick={() =>
                                  onUpdateScore(currentAssessment.id, student.id, null, '')
                                }
                                className="text-[11px] text-slate-400 hover:text-rose-600 font-medium"
                                title="Hapus nilai siswa ini"
                              >
                                Kosongkan
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  onUpdateScore(
                                    currentAssessment.id,
                                    student.id,
                                    kktp,
                                    generateAutoFeedback(student.nama, kktp, currentAssessment.tujuanPembelajaran, kktp)
                                  )
                                }
                                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                                title="Beri nilai batas tuntas"
                              >
                                +KKTP
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Official Signatures for Printout */}
      <PrintSignatures school={school} />

      {/* Modal: Create Assessment */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">
                Tambah Asesmen Baru ({categoryTitle})
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessmentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Asesmen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newJudul}
                  onChange={(e) => setNewJudul(e.target.value)}
                  placeholder="Contoh: Formatif 3: Operasi Aljabar"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lingkup Materi / Bab <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMateri}
                  onChange={(e) => setNewMateri(e.target.value)}
                  placeholder="Contoh: Aljabar dan Persamaan Linier"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tujuan Pembelajaran (TP) / Indikator
                </label>
                <textarea
                  rows={2}
                  value={newTP}
                  onChange={(e) => setNewTP(e.target.value)}
                  placeholder="Peserta didik mampu menyelesaikan masalah kontekstual menggunakan ekspresi aljabar..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    value={newTanggal}
                    onChange={(e) => setNewTanggal(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bentuk / Tipe Asesmen
                  </label>
                  <select
                    value={newSubType}
                    onChange={(e: any) => setNewSubType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    {category === 'diagnostik' ? (
                      <>
                        <option value="Kognitif">Diagnostik Kognitif</option>
                        <option value="Non-Kognitif">Diagnostik Non-Kognitif (Gaya Belajar)</option>
                      </>
                    ) : (
                      <>
                        <option value="Tes Tulis">Tes Tulis</option>
                        <option value="Praktik">Unjuk Kerja / Praktik</option>
                        <option value="Projek">Projek</option>
                        <option value="Portofolio">Portofolio</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Simpan & Buat Asesmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Batch Score Tool */}
      {isBatchScoreModalOpen && currentAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">
              Beri Nilai Massal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Isikan nilai yang sama untuk seluruh {students.length} peserta didik pada asesmen "{currentAssessment.judul}". Anda tetap dapat mengedit nilai individual setelahnya.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Massal (0-100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={batchScoreValue}
                  onChange={(e) => setBatchScoreValue(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono text-center font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchScoreModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyBatchScore}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Terapkan ke Semua Siswa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
