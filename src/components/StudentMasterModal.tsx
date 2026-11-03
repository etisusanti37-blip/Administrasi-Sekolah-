import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { X, UserPlus, Save } from 'lucide-react';

interface StudentMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id'>, existingId?: string) => void;
  studentToEdit?: Student | null;
}

export const StudentMasterModal: React.FC<StudentMasterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
}) => {
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [catatanKhusus, setCatatanKhusus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setNama(studentToEdit.nama);
      setNisn(studentToEdit.nisn || '');
      setNis(studentToEdit.nis || '');
      setJenisKelamin(studentToEdit.jenisKelamin || 'L');
      setCatatanKhusus(studentToEdit.catatanKhusus || '');
    } else {
      setNama('');
      setNisn('');
      setNis('');
      setJenisKelamin('L');
      setCatatanKhusus('');
    }
    setError('');
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama siswa wajib diisi.');
      return;
    }

    onSave(
      {
        nama: nama.trim(),
        nisn: nisn.trim(),
        nis: nis.trim(),
        jenisKelamin,
        catatanKhusus: catatanKhusus.trim() || undefined,
      },
      studentToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800">
              {studentToEdit ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Muhammad Farhan Alamsyah"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NISN (10 Digit)
              </label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="009871xxxx"
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIS / No. Induk
              </label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="26001"
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Kelamin
            </label>
            <div className="flex gap-4 mt-1">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="L"
                  checked={jenisKelamin === 'L'}
                  onChange={() => setJenisKelamin('L')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                Laki-laki (L)
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="P"
                  checked={jenisKelamin === 'P'}
                  onChange={() => setJenisKelamin('P')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                Perempuan (P)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Karakteristik Siswa (Opsional)
            </label>
            <textarea
              rows={2}
              value={catatanKhusus}
              onChange={(e) => setCatatanKhusus(e.target.value)}
              placeholder="Catatan gaya belajar, kelebihan, atau perhatian khusus"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              {studentToEdit ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
