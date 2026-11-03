import React, { useState } from 'react';
import {
  AssessmentWeights,
  EducationalPhase,
  SchoolLevel,
  SchoolSettings,
  TeacherProfile,
} from '../types';
import { StorageService } from '../utils/storage';
import {
  SlidersHorizontal,
  School,
  Save,
  Database,
  Cloud,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Code2,
  Key,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SettingsAndDatabaseViewProps {
  school: SchoolSettings;
  weights: AssessmentWeights;
  profiles: TeacherProfile[];
  onSaveSettings: (settings: SchoolSettings) => void;
  onSaveWeights: (weights: AssessmentWeights) => void;
  onSwitchProfile: (profile: TeacherProfile) => void;
  onAddProfile: (profile: Omit<TeacherProfile, 'id'>) => void;
  onRestoreBackup: (jsonString: string) => boolean;
  onResetData: () => void;
  onClearSample: () => void;
}

export const SettingsAndDatabaseView: React.FC<SettingsAndDatabaseViewProps> = ({
  school,
  weights,
  profiles,
  onSaveSettings,
  onSaveWeights,
  onSwitchProfile,
  onAddProfile,
  onRestoreBackup,
  onResetData,
  onClearSample,
}) => {
  // Form states
  const [formData, setFormData] = useState<SchoolSettings>({ ...school });
  const [weightData, setWeightData] = useState<AssessmentWeights>({ ...weights });
  const [showCodeGuide, setShowCodeGuide] = useState(false);
  const [showTestingGuide, setShowTestingGuide] = useState(false);

  // New Profile Form
  const [isAddProfileOpen, setIsAddProfileOpen] = useState(false);
  const [newGuruName, setNewGuruName] = useState('');
  const [newGuruNip, setNewGuruNip] = useState('');
  const [newGuruKelas, setNewGuruKelas] = useState('');
  const [newGuruMapel, setNewGuruMapel] = useState('');

  const totalWeight =
    weightData.formatif + weightData.sumatifMateri + weightData.sts + weightData.sas;

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
  };

  const handleWeightsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      alert('Total persentase bobot harus 100%');
      return;
    }
    onSaveWeights({
      ...weightData,
      diagnostik: 0, // strictly 0%
    });
  };

  const handleDownloadBackup = () => {
    const jsonStr = StorageService.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Aplikasi_Penilaian_Guru_${school.mataPelajaran}_${school.kelas}_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onRestoreBackup(content);
        if (success) {
          alert('Data berhasil dipulihkan dari berkas cadangan!');
        } else {
          alert('Format berkas cadangan tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuruName.trim() || !newGuruKelas.trim()) return;

    onAddProfile({
      namaGuru: newGuruName.trim(),
      nip: newGuruNip.trim(),
      sekolah: school.namaSekolah,
      kelasAktif: newGuruKelas.trim(),
      mataPelajaranAktif: newGuruMapel.trim() || school.mataPelajaran,
    });

    setNewGuruName('');
    setNewGuruNip('');
    setNewGuruKelas('');
    setNewGuruMapel('');
    setIsAddProfileOpen(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          Pengaturan Aplikasi & Konfigurasi Database
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur identitas satuan pendidikan, bobot nilai Kurikulum Merdeka, profil guru, serta manajemen penyimpanan data
        </p>
      </div>

      {/* SECTION 1: IDENTITAS SEKOLAH & KELAS */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-200">
          <School className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm">
            1. Identitas Sekolah, Guru & Mata Pelajaran
          </h3>
        </div>

        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Sekolah / Satuan Pendidikan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.namaSekolah}
                onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NPSN Sekolah
              </label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Sekolah (Untuk Kop Cetak)
            </label>
            <input
              type="text"
              value={formData.alamatSekolah}
              onChange={(e) => setFormData({ ...formData, alamatSekolah: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kepala Sekolah & Gelar
              </label>
              <input
                type="text"
                value={formData.kepalaSekolah}
                onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.nipKepalaSekolah}
                onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Guru Pengampu
              </label>
              <input
                type="text"
                value={formData.namaGuru}
                onChange={(e) => setFormData({ ...formData, namaGuru: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP Guru Pengampu
              </label>
              <input
                type="text"
                value={formData.nipGuru}
                onChange={(e) => setFormData({ ...formData, nipGuru: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenjang Sekolah
              </label>
              <select
                value={formData.jenjang}
                onChange={(e) => setFormData({ ...formData, jenjang: e.target.value as SchoolLevel })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="SD">SD / MI</option>
                <option value="SMP">SMP / MTs</option>
                <option value="SMA">SMA / MA</option>
                <option value="SMK">SMK / MAK</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fase Pembelajaran
              </label>
              <select
                value={formData.fase}
                onChange={(e) => setFormData({ ...formData, fase: e.target.value as EducationalPhase })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Fase A">Fase A (Kelas 1-2 SD)</option>
                <option value="Fase B">Fase B (Kelas 3-4 SD)</option>
                <option value="Fase C">Fase C (Kelas 5-6 SD)</option>
                <option value="Fase D">Fase D (Kelas 7-9 SMP)</option>
                <option value="Fase E">Fase E (Kelas 10 SMA/SMK)</option>
                <option value="Fase F">Fase F (Kelas 11-12 SMA/SMK)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rombongan Belajar (Kelas)
              </label>
              <input
                type="text"
                value={formData.kelas}
                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                placeholder="Contoh: VII-A, X-MIPA 1"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mata Pelajaran
              </label>
              <input
                type="text"
                value={formData.mataPelajaran}
                onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                value={formData.tahunAjaran}
                onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                placeholder="2026/2027"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e: any) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Ganjil">Ganjil (Semester 1)</option>
                <option value="Genap">Genap (Semester 2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                KKTP / KKM Standar (0-100)
              </label>
              <input
                type="number"
                min={50}
                max={95}
                value={formData.kktp}
                onChange={(e) => setFormData({ ...formData, kktp: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold text-emerald-700 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kota Titimangsa Tanda Tangan
              </label>
              <input
                type="text"
                value={formData.titimangsaKota}
                onChange={(e) => setFormData({ ...formData, titimangsaKota: e.target.value })}
                placeholder="Bandung"
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Identitas Sekolah & Kelas
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: BOBOT PENILAIAN */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              2. Pengaturan Bobot Penilaian (Kurikulum Merdeka)
            </h3>
          </div>
          <div className="text-xs">
            Total Bobot:{' '}
            <span
              className={`font-mono font-bold tabular-nums ${
                totalWeight === 100 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {totalWeight}% {totalWeight === 100 ? '(Sesuai)' : '(Wajib 100%)'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-lg text-xs text-cyan-950 mb-5 leading-relaxed">
          <strong>Prinsip Penilaian:</strong> Nilai Asesmen Diagnostik terkunci pada 0% (tidak otomatis dihitung ke nilai akhir rapor). Anda bebas menyesuaikan porsi bobot antara penilaian proses (Formatif) dan penilaian hasil (Sumatif Materi, STS, SAS).
        </div>

        <form onSubmit={handleWeightsSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Formatif (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={weightData.formatif}
                onChange={(e) => setWeightData({ ...weightData, formatif: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sumatif Materi (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={weightData.sumatifMateri}
                onChange={(e) => setWeightData({ ...weightData, sumatifMateri: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                STS (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={weightData.sts}
                onChange={(e) => setWeightData({ ...weightData, sts: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SAS (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={weightData.sas}
                onChange={(e) => setWeightData({ ...weightData, sas: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={totalWeight !== 100}
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg text-white shadow-xs transition-colors ${
                totalWeight === 100
                  ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Terapkan Bobot Penilaian
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: MULTI-GURU & MULTI-KELAS PROFILE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                3. Manajemen Multi-Guru & Multi-Kelas
              </h3>
              <p className="text-[11px] text-slate-500">
                Pemisahan data kelas dan mata pelajaran untuk guru berbeda pada satu perangkat
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddProfileOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
          >
            + Tambah Profil Kelas / Guru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {profiles.map((p) => {
            const isActive =
              p.namaGuru === school.namaGuru &&
              p.kelasAktif === school.kelas &&
              p.mataPelajaranAktif === school.mataPelajaran;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900">{p.namaGuru}</span>
                  {isActive ? (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                      Aktif
                    </span>
                  ) : (
                    <button
                      onClick={() => onSwitchProfile(p)}
                      className="text-[11px] text-indigo-600 font-semibold hover:underline"
                    >
                      Pilih Profil
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Kelas:</strong> {p.kelasAktif} · <strong>Mapel:</strong> {p.mataPelajaranAktif}
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-1">NIP: {p.nip || '-'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: BACKUP & RESTORE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-200">
          <HardDrive className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm">
            4. Cadangan & Pemulihan Berkas (Offline Backup JSON)
          </h3>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Simpan seluruh tabel, identitas, daftar siswa, nilai dari ke-5 menu, dan tindak lanjut ke dalam satu berkas cadangan mandiri. Berkas ini dapat dipindahkan dengan mudah ke laptop atau ponsel lain tanpa membutuhkan koneksi internet.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Unduh Berkas Cadangan (.JSON)
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Pulihkan dari Cadangan (.JSON)
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>

          <button
            onClick={onClearSample}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
          >
            Kosongkan Data Simulasi
          </button>

          <button
            onClick={onResetData}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Muat Kembali Data Contoh
          </button>
        </div>
      </div>

      {/* SECTION 5: DATABASE TRANSPARENCY & CLOUD SYNC GUIDE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
          <Database className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              5. Status Penyimpanan Data & Panduan Konfigurasi Database (Firebase / Multi-Perangkat)
            </h3>
            <p className="text-[11px] text-slate-500">
              Transparansi penyimpanan data, keamanan data pribadi peserta didik, dan integrasi cloud
            </p>
          </div>
        </div>

        {/* Current Status Box (Honest & Accurate) */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3 text-xs text-emerald-950">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-emerald-900 text-sm">
              Status Penyimpanan Saat Ini: LocalStorage Peramban (Lokal & Terisolasi)
            </p>
            <p className="text-slate-700 leading-relaxed">
              Semua data identitas, daftar siswa, dan nilai tersimpan secara persisten pada peramban (browser) dan perangkat Anda. Data <strong>tidak akan hilang saat halaman dimuat ulang (refresh)</strong>. Penyimpanan lokal menjamin <strong>data pribadi peserta didik tidak pernah terkirim ke server publik yang tidak terotorisasi</strong>.
            </p>
          </div>
        </div>

        {/* Cloud Database Guide Toggle */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCodeGuide(!showCodeGuide)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-xs text-slate-800">
                Petunjuk Teknis: Menghubungkan Firebase Firestore untuk Akses Lintas Perangkat & Multi-Guru
              </span>
            </div>
            {showCodeGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showCodeGuide && (
            <div className="p-5 text-xs text-slate-700 space-y-4 bg-white border-t border-slate-200">
              <p className="leading-relaxed">
                Untuk menyinkronkan data nilai antar perangkat (komputer sekolah dan ponsel) atau digunakan secara bersama oleh banyak guru dengan hak akses terpisah:
              </p>

              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Buat Proyek Firebase:</strong> Buka <em>console.firebase.google.com</em> dan aktifkan <strong>Cloud Firestore</strong> serta <strong>Authentication (Email/Google Sign-In)</strong>.
                </li>
                <li>
                  <strong>Pemisahan Data Guru & Sekolah (Multi-Tenant):</strong> Buat struktur koleksi Firestore:
                  <div className="p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] mt-1 overflow-x-auto">
                    /sekolah/&#123;sekolahId&#125;/guru/&#123;guruUid&#125;/kelas/&#123;kelasId&#125;/penilaian/...
                  </div>
                </li>
                <li>
                  <strong>Aturan Keamanan (Firestore Security Rules):</strong> Lindungi data pribadi peserta didik agar hanya guru bersangkutan yang dapat melihat dan mengubah nilai:
                  <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg font-mono text-[11px] mt-1 overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sekolah/{sekolahId}/guru/{guruUid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == guruUid;
    }
  }
}`}
                  </pre>
                </li>
                <li>
                  <strong>Inisialisasi SDK di Aplikasi:</strong> Simpan konfigurasi Firebase di file konfigurasi aman:
                  <pre className="p-3 bg-slate-900 text-cyan-300 rounded-lg font-mono text-[11px] mt-1 overflow-x-auto leading-relaxed">
{`import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sekolah-penilaian.firebaseapp.com",
  projectId: "sekolah-penilaian",
  storageBucket: "sekolah-penilaian.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);`}
                  </pre>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Feature Testing Guide Toggle */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowTestingGuide(!showTestingGuide)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs text-slate-800">
                Langkah Pengujian Setiap Fitur Aplikasi (Verification Checklist)
              </span>
            </div>
            {showTestingGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showTestingGuide && (
            <div className="p-5 text-xs text-slate-700 space-y-3 bg-white border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">1. Uji Satu Kali Masukan Siswa (Single Entry)</span>
                  <p className="text-slate-600">
                    Buka menu "Daftar Peserta Didik", tambahkan satu siswa baru. Periksa kelima menu penilaian (Diagnostik, Formatif, Sumatif Materi, STS, SAS) serta Rekap Kelas; nama siswa tersebut otomatis langsung muncul tanpa perlu diinput ulang.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">2. Uji Status "Belum Dinilai" vs Nol</span>
                  <p className="text-slate-600">
                    Kosongkan kolom nilai siswa pada suatu tabel. Nilai akan berstatus "Belum Dinilai" dan rata-rata kelas tidak akan menganggapnya sebagai angka 0.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">3. Uji Validasi Rentang Nilai (0-100)</span>
                  <p className="text-slate-600">
                    Ketik angka 105 atau -5 pada kolom nilai; aplikasi langsung menampilkan peringatan validasi merah "Nilai harus 0-100" dan menolak input tidak valid.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">4. Uji Non-Bobot Diagnostik</span>
                  <p className="text-slate-600">
                    Buka Rekap Nilai Kelas (Ledger). Perhatikan bahwa nilai diagnostik hanya berstatus pemetaan awal dan sama sekali tidak dimasukkan ke kalkulasi nilai akhir rapor.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Profile */}
      {isAddProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm mb-4">
              Tambah Profil Guru / Rombel Baru
            </h3>
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Guru
                </label>
                <input
                  type="text"
                  required
                  value={newGuruName}
                  onChange={(e) => setNewGuruName(e.target.value)}
                  placeholder="Contoh: Siti Rahmawati, M.Pd."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIP Guru
                </label>
                <input
                  type="text"
                  value={newGuruNip}
                  onChange={(e) => setNewGuruNip(e.target.value)}
                  placeholder="19850101 201001 2 005"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas / Rombel
                  </label>
                  <input
                    type="text"
                    required
                    value={newGuruKelas}
                    onChange={(e) => setNewGuruKelas(e.target.value)}
                    placeholder="VII-B"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={newGuruMapel}
                    onChange={(e) => setNewGuruMapel(e.target.value)}
                    placeholder="Matematika"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddProfileOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
