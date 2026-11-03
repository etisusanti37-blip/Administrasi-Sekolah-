import React, { useState } from 'react';
import { SchoolSettings, Student } from '../types';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Trash2,
  Edit2,
  Printer,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PrintHeader } from '../components/PrintHeader';
import { PrintSignatures } from '../components/PrintSignatures';
import { downloadStudentTemplate } from '../utils/excelHelper';

interface StudentMasterViewProps {
  students: Student[];
  school: SchoolSettings;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenImportModal: () => void;
  onClearAllStudents: () => void;
}

export const StudentMasterView: React.FC<StudentMasterViewProps> = ({
  students,
  school,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenImportModal,
  onClearAllStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJk, setFilterJk] = useState<'all' | 'L' | 'P'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nisn && s.nisn.includes(searchQuery)) ||
      (s.nis && s.nis.includes(searchQuery));
    const matchesJk = filterJk === 'all' || s.jenisKelamin === filterJk;
    return matchesSearch && matchesJk;
  });

  const countL = students.filter((s) => s.jenisKelamin === 'L').length;
  const countP = students.filter((s) => s.jenisKelamin === 'P').length;

  return (
    <div className="space-y-6">
      {/* Official Print Header */}
      <PrintHeader
        school={school}
        title="Daftar Induk Peserta Didik"
        subtitle={`Kelas ${school.kelas} - Tahun Ajaran ${school.tahunAjaran}`}
      />

      {/* Screen Title & Action Bar */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Daftar Peserta Didik (Master Siswa)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar siswa ini hanya dimasukkan sekali dan otomatis digunakan pada seluruh menu penilaian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadStudentTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            title="Unduh format tabel Excel untuk diisi secara offline"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Template Excel
          </button>

          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Impor Excel / CSV
          </button>

          <button
            onClick={onAddStudent}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Info notice about zero re-entry */}
      <div className="no-print p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-start gap-3 text-xs text-indigo-900">
        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Prinsip Satu Kali Masukan (Single Roster):</span> Siswa yang terdaftar di halaman ini langsung tersinkronisasi otomatis ke Penilaian Diagnostik, Penilaian Formatif, Sumatif Materi, STS, dan SAS. Anda tidak perlu memasukkan kembali nama siswa di setiap tabel.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, NISN, atau NIS..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterJk('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                filterJk === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({students.length})
            </button>
            <button
              onClick={() => setFilterJk('L')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                filterJk === 'L' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laki-laki ({countL})
            </button>
            <button
              onClick={() => setFilterJk('P')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                filterJk === 'P' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Perempuan ({countP})
            </button>
          </div>

          {students.length > 0 && (
            <button
              onClick={onClearAllStudents}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
            >
              Kosongkan Semua Siswa
            </button>
          )}
        </div>
      </div>

      {/* Main Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 w-32 font-mono">NISN</th>
                <th className="py-3 px-4 w-24 font-mono">NIS</th>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-3 w-16 text-center">L/P</th>
                <th className="py-3 px-4 hidden md:table-cell">Catatan / Karakteristik</th>
                <th className="py-3 px-4 w-24 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">Tidak ada peserta didik yang sesuai kriteria.</p>
                    <p className="text-xs mt-1">
                      {students.length === 0
                        ? 'Daftar siswa masih kosong. Tambahkan siswa secara manual atau impor dari Excel.'
                        : 'Coba ubah kata kunci pencarian atau filter jenis kelamin.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-500">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                      {student.nisn || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                      {student.nis || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {student.nama}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          student.jenisKelamin === 'L'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {student.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 hidden md:table-cell truncate max-w-xs">
                      {student.catatanKhusus || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus data siswa "${student.nama}"?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
    </div>
  );
};
