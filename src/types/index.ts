export type SchoolLevel = 'SD' | 'SMP' | 'SMA' | 'SMK';

export type EducationalPhase = 'Fase A' | 'Fase B' | 'Fase C' | 'Fase D' | 'Fase E' | 'Fase F';

export type AssessmentCategory = 'diagnostik' | 'formatif' | 'sumatif_materi' | 'sts' | 'sas';

export interface SchoolSettings {
  namaSekolah: string;
  npsn: string;
  alamatSekolah: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  namaGuru: string;
  nipGuru: string;
  mataPelajaran: string;
  jenjang: SchoolLevel;
  fase: EducationalPhase;
  kelas: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  kktp: number; // Kriteria Ketercapaian Tujuan Pembelajaran (default: 75)
  titimangsaKota: string;
  titimangsaTanggal: string;
}

export interface AssessmentWeights {
  diagnostik: number; // strictly 0% for final grade calculation in Kurikulum Merdeka
  formatif: number;   // e.g. 30%
  sumatifMateri: number; // e.g. 30%
  sts: number;        // e.g. 20%
  sas: number;        // e.g. 20%
}

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  catatanKhusus?: string;
}

export interface AssessmentItem {
  id: string;
  category: AssessmentCategory;
  subType?: 'Kognitif' | 'Non-Kognitif' | 'Tes Tulis' | 'Praktik' | 'Projek' | 'Portofolio';
  judul: string;
  lingkupMateri: string;
  tujuanPembelajaran: string;
  tanggal: string;
  kktpOverride?: number;
}

export interface StudentScore {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number | null; // CRITICAL: null represents "Belum Dinilai", NOT 0
  feedback?: string;
  statusRemedial?: 'Belum' | 'Selesai' | 'Tidak Perlu';
  nilaiRemedial?: number | null;
}

export interface RemedialFollowUp {
  id: string;
  studentId: string;
  assessmentId: string;
  tpMateri: string;
  nilaiAwal: number;
  nilaiRemedial: number | null;
  bentukRemedial: string;
  tanggalPelaksanaan: string;
  keterangan: string;
}

export interface EnrichmentFollowUp {
  id: string;
  studentId: string;
  assessmentId: string;
  tpMateri: string;
  nilaiAwal: number;
  bentukPengayaan: string;
  tanggalPelaksanaan: string;
  keterangan: string;
}

export interface TeacherProfile {
  id: string;
  namaGuru: string;
  nip: string;
  sekolah: string;
  kelasAktif: string;
  mataPelajaranAktif: string;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}
