import React, { useState } from 'react';
import {
  AssessmentItem,
  AssessmentWeights,
  SchoolSettings,
  Student,
  StudentScore,
} from '../types';
import { calculateStudentRecap, getAchievementStatus, getPredicate } from '../utils/gradeCalculator';
import { PrintHeader } from '../components/PrintHeader';
import { PrintSignatures } from '../components/PrintSignatures';
import {
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
  Award,
  BookOpen,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface StudentIndividualReportViewProps {
  school: SchoolSettings;
  students: Student[];
  assessments: AssessmentItem[];
  scores: StudentScore[];
  weights: AssessmentWeights;
}

export const StudentIndividualReportView: React.FC<StudentIndividualReportViewProps> = ({
  school,
  students,
  assessments,
  scores,
  weights,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );

  const selectedIndex = students.findIndex((s) => s.id === selectedStudentId);
  const activeStudent = students[selectedIndex] || students[0];

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedStudentId(students[selectedIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (selectedIndex < students.length - 1) {
      setSelectedStudentId(students[selectedIndex + 1].id);
    }
  };

  if (!activeStudent) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Belum ada peserta didik yang terdaftar. Tambahkan siswa terlebih dahulu di menu "Daftar Peserta Didik".
      </div>
    );
  }

  // Calculate student individual recap
  const recap = calculateStudentRecap(
    activeStudent,
    assessments,
    scores,
    weights,
    school.kktp
  );

  const categories = [
    { key: 'diagnostik', label: '1. Penilaian Diagnostik (Awal Pembelajaran)', isGraded: false },
    { key: 'formatif', label: '2. Penilaian Formatif (Proses Pembelajaran)', isGraded: true },
    { key: 'sumatif_materi', label: '3. Sumatif Akhir Materi (Bab)', isGraded: true },
    { key: 'sts', label: '4. Sumatif Tengah Semester (STS)', isGraded: true },
    { key: 'sas', label: '5. Sumatif Akhir Semester (SAS)', isGraded: true },
  ];

  // Auto-generate detailed narrative of competence (Capaian Kompetensi)
  const gradedItems = assessments
    .filter((a) => a.category !== 'diagnostik')
    .map((asm) => {
      const scoreObj = scores.find(
        (s) => s.studentId === activeStudent.id && s.assessmentId === asm.id
      );
      return {
        asm,
        score: scoreObj?.score ?? null,
        feedback: scoreObj?.feedback || '',
      };
    })
    .filter((item): item is { asm: AssessmentItem; score: number; feedback: string } => item.score !== null);

  const highestItems = [...gradedItems].sort((a, b) => b.score - a.score);
  const lowestItems = [...gradedItems].sort((a, b) => a.score - b.score);

  const bestCompetency = highestItems[0]
    ? `Menunjukkan penguasaan yang sangat baik dalam ${highestItems[0].asm.tujuanPembelajaran}.`
    : 'Menunjukkan partisipasi aktif dalam proses pembelajaran.';

  const needImprovement = lowestItems[0] && lowestItems[0].score < school.kktp
    ? `Perlu peningkatan bimbingan dan latihan mandiri secara berkala dalam ${lowestItems[0].asm.tujuanPembelajaran}.`
    : 'Mampu mempertahankan konsistensi capaian pembelajaran pada seluruh kompetensi materi.';

  return (
    <div className="space-y-6">
      {/* Official Print Header */}
      <PrintHeader
        school={school}
        title="LEMBAR HASIL PENILAIAN PESERTA DIDIK (RAPOR PROGRES)"
        subtitle={`Semester ${school.semester} - Tahun Ajaran ${school.tahunAjaran}`}
      />

      {/* Screen Title & Student Selector Bar */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Rekap Hasil Penilaian Individu Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kartu progres belajar siswa per kompetensi lengkap dengan deskripsi capaian rapor
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak Lembar Siswa Ini
          </button>
        </div>
      </div>

      {/* Student Switcher Toolbar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Pilih Peserta Didik:
          </label>
          <select
            value={activeStudent.id}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
          >
            {students.map((st, i) => (
              <option key={st.id} value={st.id}>
                {i + 1}. {st.nama} ({st.nisn ? `NISN: ${st.nisn}` : `NIS: ${st.nis || '-'}`})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handlePrev}
            disabled={selectedIndex === 0}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium ${
              selectedIndex > 0
                ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Siswa Sebelumnya
          </button>
          <span className="font-mono text-slate-500">
            {selectedIndex + 1} / {students.length}
          </span>
          <button
            onClick={handleNext}
            disabled={selectedIndex === students.length - 1}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border font-medium ${
              selectedIndex < students.length - 1
                ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            Siswa Berikutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Student Biodata Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pb-4 border-b border-slate-200">
          <div>
            <span className="text-slate-500 block">Nama Lengkap Siswa</span>
            <span className="font-bold text-slate-900 text-sm block mt-0.5">{activeStudent.nama}</span>
          </div>
          <div>
            <span className="text-slate-500 block">NISN / NIS</span>
            <span className="font-mono font-semibold text-slate-800 text-sm block mt-0.5">
              {activeStudent.nisn || '-'} / {activeStudent.nis || '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Kelas / Fase</span>
            <span className="font-semibold text-slate-800 text-sm block mt-0.5">
              {school.kelas} ({school.fase})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Jenis Kelamin</span>
            <span className="font-semibold text-slate-800 text-sm block mt-0.5">
              {activeStudent.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            </span>
          </div>
        </div>

        {/* Final Grade Summary Box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-xs text-slate-500 block">Rata-rata Formatif</span>
            <span className="text-lg font-mono font-bold text-emerald-700 mt-0.5 block">
              {recap.avgFormatif !== null ? recap.avgFormatif : '-'}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Rata-rata Sumatif</span>
            <span className="text-lg font-mono font-bold text-blue-700 mt-0.5 block">
              {recap.avgSumatifMateri !== null ? recap.avgSumatifMateri : '-'}
            </span>
          </div>
          <div className="bg-indigo-50/70 rounded-lg p-2 border border-indigo-200">
            <span className="text-xs font-semibold text-indigo-900 block">NILAI AKHIR RAPOR</span>
            <span className="text-2xl font-mono font-bold text-indigo-700 mt-0.5 block">
              {recap.nilaiAkhir !== null ? recap.nilaiAkhir : 'Belum Lengkap'}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Predikat & Status</span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">
              {recap.nilaiAkhir !== null ? `${recap.predikatAkhir} · ${recap.statusKetercapaian}` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Per Category */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const catItems = assessments.filter((a) => a.category === cat.key);

          return (
            <div key={cat.key} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  {cat.label}
                </h4>
                {!cat.isGraded && (
                  <span className="text-[10px] text-cyan-800 font-semibold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    Non-Bobot Rapor
                  </span>
                )}
              </div>

              {catItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Belum ada asesmen yang dibuat untuk kategori ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50/50 text-slate-600 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-2 px-3 w-10 text-center">No</th>
                        <th className="py-2 px-3 w-28">Tanggal</th>
                        <th className="py-2 px-3 w-40">Asesmen / Bab</th>
                        <th className="py-2 px-4">Tujuan Pembelajaran (TP)</th>
                        <th className="py-2 px-3 w-24 text-center">Nilai</th>
                        <th className="py-2 px-3 w-28 text-center">Status</th>
                        <th className="py-2 px-4">Catatan Guru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {catItems.map((item, idx) => {
                        const scoreObj = scores.find(
                          (s) => s.studentId === activeStudent.id && s.assessmentId === item.id
                        );
                        const scoreVal = scoreObj?.score ?? null;
                        const kktp = item.kktpOverride || school.kktp;
                        const status = getAchievementStatus(scoreVal, kktp);
                        const pred = getPredicate(scoreVal, kktp);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 text-center font-mono tabular-nums text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                              {item.tanggal || '-'}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-800">
                              {item.judul}
                            </td>
                            <td className="py-2 px-4 text-slate-600 text-[11px] leading-relaxed">
                              {item.tujuanPembelajaran}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {scoreVal !== null ? (
                                <span className="font-mono font-bold text-xs text-slate-900">
                                  {scoreVal}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Belum Dinilai</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className={`text-[11px] ${status.colorClass}`}>
                                {status.status}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-slate-600 text-[11px]">
                              {scoreObj?.feedback || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Deskripsi Capaian Kompetensi Rapor (Official Kurikulum Merdeka Style) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Deskripsi Capaian Kompetensi (Rapor)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Capaian Kompetensi Tertinggi (Kekuatan Siswa)
            </span>
            <p className="text-slate-700 leading-relaxed mt-1">
              {bestCompetency}
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg">
            <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Capaian yang Perlu Ditingkatkan (Rekomendasi)
            </span>
            <p className="text-slate-700 leading-relaxed mt-1">
              {needImprovement}
            </p>
          </div>
        </div>
      </div>

      {/* Official Signatures for Printout */}
      <PrintSignatures school={school} />
    </div>
  );
};
