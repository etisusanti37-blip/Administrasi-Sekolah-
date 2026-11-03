import React, { useState } from 'react';
import { Student } from '../types';
import { parseStudentFile, downloadStudentTemplate } from '../utils/excelHelper';
import { UploadCloud, FileSpreadsheet, Download, Check, AlertCircle, X, Users } from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: Omit<Student, 'id'>[], mode: 'append' | 'replace') => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedList, setParsedList] = useState<Omit<Student, 'id'>[]>([]);
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage('');
    setLoading(true);

    try {
      const results = await parseStudentFile(selectedFile);
      setParsedList(results);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membaca file Excel/CSV.');
      setParsedList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (parsedList.length === 0) return;
    onImport(parsedList, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800">Impor Daftar Peserta Didik (Excel / CSV)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Instructions banner */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1.5">
            <p className="font-semibold text-blue-950 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-700" />
              Gunakan Format Kolom Standar
            </p>
            <p>
              Pastikan file memiliki kolom: <strong>Nama Siswa</strong>, <strong>NISN</strong>, <strong>NIS</strong>, dan <strong>Jenis Kelamin (L/P)</strong>.
              Daftar siswa ini hanya dimasukkan sekali dan otomatis langsung tersedia di kelima menu penilaian.
            </p>
            <button
              type="button"
              onClick={downloadStudentTemplate}
              className="inline-flex items-center gap-1.5 mt-1 font-semibold text-blue-700 underline hover:text-blue-900 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Template Excel (.xlsx) Siap Pakai
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center transition-colors bg-slate-50/50">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Pilih berkas Excel (.xlsx, .xls) atau .CSV</p>
            <p className="text-xs text-slate-500 mt-1">Maksimal ukuran file 10MB</p>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Terdeteksi {parsedList.length} Peserta Didik
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={mode === 'append'}
                      onChange={() => setMode('append')}
                      className="text-indigo-600"
                    />
                    Tambahkan ke data yang ada
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-amber-700">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={mode === 'replace'}
                      onChange={() => setMode('replace')}
                      className="text-amber-600"
                    />
                    Ganti seluruh data lama
                  </label>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3 w-10">No</th>
                      <th className="py-2 px-3">Nama Siswa</th>
                      <th className="py-2 px-3 w-28">NISN</th>
                      <th className="py-2 px-3 w-20">NIS</th>
                      <th className="py-2 px-3 w-16 text-center">L/P</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedList.map((st, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-mono text-slate-500">{i + 1}</td>
                        <td className="py-1.5 px-3 font-medium text-slate-900">{st.nama}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-600">{st.nisn || '-'}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-600">{st.nis || '-'}</td>
                        <td className="py-1.5 px-3 text-center">{st.jenisKelamin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedList.length === 0 || loading}
            onClick={handleConfirm}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg text-white shadow-sm transition-colors ${
              parsedList.length > 0 && !loading
                ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            {loading ? 'Memproses File...' : `Impor ${parsedList.length} Siswa Sekarang`}
          </button>
        </div>
      </div>
    </div>
  );
};
