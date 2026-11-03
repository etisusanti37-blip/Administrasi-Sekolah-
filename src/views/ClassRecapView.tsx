import React, { useState } from 'react';
import {
  AssessmentItem,
  AssessmentWeights,
  SchoolSettings,
  Student,
  StudentScore,
} from '../types';
import { calculateStudentRecap, StudentRecapRow } from '../utils/gradeCalculator';
import { exportClassLedgerToExcel } from '../utils/excelHelper';
import { PrintHeader } from '../components/PrintHeader';
import { PrintSignatures } from '../components/PrintSignatures';
import {
  TableProperties,
  FileSpreadsheet,
  Printer,
  Sliders,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Percent,
  X,
  Save,
} from 'lucide-react';

interface ClassRecapViewProps {
  school: SchoolSettings;
  students: Student[];
  assessments: AssessmentItem[];
  scores: StudentScore[];
  weights: AssessmentWeights;
  onUpdateWeights: (newWeights: AssessmentWeights) => void;
}

export const ClassRecapView: React.FC<ClassRecapViewProps> = ({
  school,
  students,
  assessments,
  scores,
  weights,
  onUpdateWeights,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tuntas' | 'remedial' | 'belum'>('all');
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  // Temporary weights modal state
  const [tempFormatif, setTempFormatif] = useState(weights.formatif);
  const [tempSumatif, setTempSumatif] = useState(weights.sumatifMateri);
  const [tempSts, setTempSts] = useState(weights.sts);
  const [tempSas, setTempSas] = useState(weights.sas);

  const totalTempWeight = tempFormatif + tempSumatif + tempSts + tempSas;

  // Calculate recap rows for all students
  const recapRows: StudentRecapRow[] = students.map((student) =>
    calculateStudentRecap(student, assessments, scores, weights, school.kktp)
  );

  // Statistics across the class
  const gradedRows = recapRows.filter((r) => r.nilaiAkhir !== null);
  const classAvg =
    gradedRows.length > 0
      ? Math.round((gradedRows.reduce((acc, r) => acc + (r.nilaiAkhir || 0), 0) / gradedRows.length) * 10) / 10
      : null;
  const tuntasCount = gradedRows.filter((r) => (r.nilaiAkhir || 0) >= school.kktp).length;
  const tuntasPercent = gradedRows.length > 0 ? Math.round((tuntasCount / gradedRows.length) * 100) : 0;

  // Filtered rows
  const filteredRows = recapRows.filter((row) => {
    const matchesSearch =
      row.student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.student.nisn && row.student.nisn.includes(searchQuery)) ||
      (row.student.nis && row.student.nis.includes(searchQuery));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'belum') return row.nilaiAkhir === null;
    if (statusFilter === 'tuntas') return row.nilaiAkhir !== null && row.nilaiAkhir >= school.kktp;
    if (statusFilter === 'remedial') return row.nilaiAkhir !== null && row.nilaiAkhir < school.kktp;

    return true;
  });

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalTempWeight !== 100) {
      alert('Total persentase bobot harus tepat 100%');
      return;
    }
    onUpdateWeights({
      diagnostik: 0, // Strictly 0
      formatif: tempFormatif,
      sumatifMateri: tempSumatif,
      sts: tempSts,
      sas: tempSas,
    });
    setIsWeightModalOpen(false);
  };

  const handleExport = () => {
    exportClassLedgerToExcel(recapRows, assessments, scores, school);
  };

  return (
    <div className="space-y-6">
      {/* Official Print Header */}
      <PrintHeader
        school={school}
        title="REKAPITULASI HASIL PENILAIAN SISWA (LEDGER NILAI)"
        subtitle={`Semester ${school.semester} - Tahun Ajaran ${school.tahunAjaran}`}
      />

      {/* Screen Title & Action Bar */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-indigo-600" />
            Rekap Nilai Kelas (Ledger Nilai Rapor)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrasi otomatis dari 5 menu penilaian dengan pembobotan Kurikulum Merdeka
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setTempFormatif(weights.formatif);
              setTempSumatif(weights.sumatifMateri);
              setTempSts(weights.sts);
              setTempSas(weights.sas);
              setIsWeightModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            Atur Bobot Penilaian
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Ekspor Excel
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak Ledger
          </button>
        </div>
      </div>

      {/* Active Weighting & Diagnostic Rule Info Bar */}
      <div className="no-print bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-800">Formula Bobot Nilai Akhir:</span>
          <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-medium text-slate-700">
            Formatif: <strong>{weights.formatif}%</strong>
          </span>
          <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-medium text-slate-700">
            Sumatif Materi: <strong>{weights.sumatifMateri}%</strong>
          </span>
          <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-medium text-slate-700">
            STS: <strong>{weights.sts}%</strong>
          </span>
          <span className="px-2 py-0.5 bg-white border border-slate-300 rounded font-medium text-slate-700">
            SAS: <strong>{weights.sas}%</strong>
          </span>
        </div>
        <div className="text-[11px] text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200 font-medium">
          ✓ Nilai Diagnostik 0% (tidak mempengaruhi nilai akhir rapor)
        </div>
      </div>

      {/* Class Statistics Summary */}
      <div className="no-print grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500">Jumlah Siswa</span>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
            {students.length} Siswa
          </p>
          <span className="text-[10px] text-slate-500">{gradedRows.length} sudah memiliki nilai</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500">Rata-rata Nilai Akhir</span>
          <p className="text-xl font-bold font-mono tabular-nums text-indigo-600 mt-0.5">
            {classAvg !== null ? classAvg : '-'}
          </p>
          <span className="text-[10px] text-slate-500">Standar KKTP: {school.kktp}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500">Ketuntasan Klasikal</span>
          <p className="text-xl font-bold font-mono tabular-nums text-emerald-600 mt-0.5">
            {tuntasPercent}%
          </p>
          <span className="text-[10px] text-slate-500">{tuntasCount} siswa mencapai KKTP</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500">Perlu Bimbingan / Remedial</span>
          <p className="text-xl font-bold font-mono tabular-nums text-rose-600 mt-0.5">
            {gradedRows.length - tuntasCount} Siswa
          </p>
          <span className="text-[10px] text-slate-500">Di bawah batas KKTP</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="no-print bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa dalam rekap..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Semua ({recapRows.length})
          </button>
          <button
            onClick={() => setStatusFilter('tuntas')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'tuntas' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Tuntas ({tuntasCount})
          </button>
          <button
            onClick={() => setStatusFilter('remedial')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'remedial' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Remedial ({gradedRows.length - tuntasCount})
          </button>
          <button
            onClick={() => setStatusFilter('belum')}
            className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'belum' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Belum Dinilai ({recapRows.length - gradedRows.length})
          </button>
        </div>
      </div>

      {/* Comprehensive Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3 w-28 font-mono">NISN</th>
                <th className="py-3 px-4 min-w-[170px]">Nama Peserta Didik</th>
                <th className="py-3 px-2 w-10 text-center">L/P</th>

                <th className="py-3 px-3 w-24 text-center bg-cyan-50/40 text-cyan-900">
                  Diagnostik
                  <span className="block text-[9px] font-normal text-cyan-700">Non-Bobot</span>
                </th>

                <th className="py-3 px-3 w-24 text-center bg-emerald-50/40 text-emerald-950">
                  Formatif
                  <span className="block text-[9px] font-normal text-emerald-700">
                    ({weights.formatif}%)
                  </span>
                </th>

                <th className="py-3 px-3 w-24 text-center bg-blue-50/40 text-blue-950">
                  Sumatif Bab
                  <span className="block text-[9px] font-normal text-blue-700">
                    ({weights.sumatifMateri}%)
                  </span>
                </th>

                <th className="py-3 px-3 w-20 text-center bg-amber-50/40 text-amber-950">
                  STS
                  <span className="block text-[9px] font-normal text-amber-700">
                    ({weights.sts}%)
                  </span>
                </th>

                <th className="py-3 px-3 w-20 text-center bg-purple-50/40 text-purple-950">
                  SAS
                  <span className="block text-[9px] font-normal text-purple-700">
                    ({weights.sas}%)
                  </span>
                </th>

                <th className="py-3 px-3 w-24 text-center bg-indigo-50/80 text-indigo-950 font-bold border-l border-indigo-100">
                  NILAI AKHIR
                  <span className="block text-[9px] font-normal text-indigo-700">Rapor</span>
                </th>

                <th className="py-3 px-3 w-20 text-center">Predikat</th>
                <th className="py-3 px-3 w-28 text-center">Status Rapor</th>
                <th className="py-3 px-2 w-16 text-center text-rose-700 font-semibold">Remedial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-500">
                    Tidak ada siswa yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={row.student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                      {row.student.nisn || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {row.student.nama}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-500">
                      {row.student.jenisKelamin}
                    </td>

                    {/* Diagnostik */}
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-cyan-800 bg-cyan-50/20">
                      {row.avgDiagnostik !== null ? row.avgDiagnostik : '-'}
                    </td>

                    {/* Formatif */}
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-emerald-800 bg-emerald-50/20">
                      {row.avgFormatif !== null ? row.avgFormatif : <span className="text-slate-400 italic font-sans text-[11px]">Belum</span>}
                    </td>

                    {/* Sumatif Materi */}
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-blue-800 bg-blue-50/20">
                      {row.avgSumatifMateri !== null ? row.avgSumatifMateri : <span className="text-slate-400 italic font-sans text-[11px]">Belum</span>}
                    </td>

                    {/* STS */}
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-amber-800 bg-amber-50/20">
                      {row.scoreSts !== null ? row.scoreSts : <span className="text-slate-400 italic font-sans text-[11px]">Belum</span>}
                    </td>

                    {/* SAS */}
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-purple-800 bg-purple-50/20">
                      {row.scoreSas !== null ? row.scoreSas : <span className="text-slate-400 italic font-sans text-[11px]">Belum</span>}
                    </td>

                    {/* NILAI AKHIR */}
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold text-sm bg-indigo-50/40 border-l border-indigo-100">
                      {row.nilaiAkhir !== null ? (
                        <span className={row.nilaiAkhir >= school.kktp ? 'text-indigo-900' : 'text-rose-600'}>
                          {row.nilaiAkhir}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal italic text-[11px] font-sans">Belum Dinilai</span>
                      )}
                    </td>

                    {/* Predikat */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-semibold text-slate-800">
                        {row.nilaiAkhir !== null ? row.predikatAkhir : '-'}
                      </span>
                    </td>

                    {/* Status Rapor */}
                    <td className="py-2.5 px-3 text-center">
                      {row.nilaiAkhir !== null ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            row.nilaiAkhir >= school.kktp
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {row.statusKetercapaian}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum Dinilai</span>
                      )}
                    </td>

                    {/* Remedial Count */}
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums font-semibold">
                      {row.remedialNeededCount > 0 ? (
                        <span className="text-rose-600">{row.remedialNeededCount} TP</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures for Printout */}
      <PrintSignatures school={school} />

      {/* Modal: Adjust Weights */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-base">Pengaturan Bobot Penilaian</h3>
              <button
                onClick={() => setIsWeightModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeights} className="space-y-4 pt-4">
              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200 text-xs text-cyan-900 leading-relaxed">
                <strong>Catatan Aturan Kurikulum:</strong> Asesmen Diagnostik terkunci pada 0% (tidak dimasukkan ke nilai akhir rapor). Bobot 4 komponen di bawah harus berjumlah total tepat 100%.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bobot Penilaian Formatif (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={tempFormatif}
                  onChange={(e) => setTempFormatif(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bobot Sumatif Akhir Materi / Bab (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={tempSumatif}
                  onChange={(e) => setTempSumatif(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bobot Sumatif Tengah Semester / STS (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={tempSts}
                  onChange={(e) => setTempSts(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bobot Sumatif Akhir Semester / SAS (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={tempSas}
                  onChange={(e) => setTempSas(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Total Bobot:</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    totalTempWeight === 100 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {totalTempWeight}% {totalTempWeight === 100 ? '(Valid)' : '(Harus 100%)'}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={totalTempWeight !== 100}
                  className={`px-5 py-2 text-sm font-medium rounded-lg text-white shadow-sm ${
                    totalTempWeight === 100
                      ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Simpan Bobot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
