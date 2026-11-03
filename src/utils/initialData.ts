import {
  AssessmentCategory,
  AssessmentItem,
  AssessmentWeights,
  EnrichmentFollowUp,
  RemedialFollowUp,
  SchoolSettings,
  Student,
  StudentScore,
  TeacherProfile,
} from '../types';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  namaSekolah: 'SMP Negeri 1 Nusantara',
  npsn: '20210099',
  alamatSekolah: 'Jl. Pendidikan Merdeka No. 45, Bandung, Jawa Barat',
  kepalaSekolah: 'Dr. H. Bambang Sudarsono, M.Pd.',
  nipKepalaSekolah: '19740512 199903 1 002',
  namaGuru: 'Eti Susanti, S.Pd.',
  nipGuru: '19820815 200801 2 014',
  mataPelajaran: 'Matematika',
  jenjang: 'SMP',
  fase: 'Fase D',
  kelas: 'VII-A',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  kktp: 75,
  titimangsaKota: 'Bandung',
  titimangsaTanggal: '2026-11-03',
};

export const DEFAULT_WEIGHTS: AssessmentWeights = {
  diagnostik: 0,     // Strictly 0% - non-graded diagnostic assessment
  formatif: 30,      // 30% Formative
  sumatifMateri: 30, // 30% Summative Unit/Chapter
  sts: 20,           // 20% Mid-Semester (STS)
  sas: 20,           // 20% End-of-Semester (SAS)
};

export const INITIAL_STUDENTS: Student[] = [
  { id: 'std-1', nisn: '0098710001', nis: '26001', nama: 'Aditya Rizky Pratama', jenisKelamin: 'L' },
  { id: 'std-2', nisn: '0098710002', nis: '26002', nama: 'Aisyah Putri Maharani', jenisKelamin: 'P' },
  { id: 'std-3', nisn: '0098710003', nis: '26003', nama: 'Bagus Wicaksono', jenisKelamin: 'L' },
  { id: 'std-4', nisn: '0098710004', nis: '26004', nama: 'Citra Dewi Anggraini', jenisKelamin: 'P' },
  { id: 'std-5', nisn: '0098710005', nis: '26005', nama: 'Daffa Raihan Al-Farabi', jenisKelamin: 'L' },
  { id: 'std-6', nisn: '0098710006', nis: '26006', nama: 'Fatimah Az-Zahra', jenisKelamin: 'P' },
  { id: 'std-7', nisn: '0098710007', nis: '26007', nama: 'Gilang Ramadhan', jenisKelamin: 'L' },
  { id: 'std-8', nisn: '0098710008', nis: '26008', nama: 'Hana Clarissa Sitorus', jenisKelamin: 'P' },
  { id: 'std-9', nisn: '0098710009', nis: '26009', nama: 'Ihsan Maulana Yusuf', jenisKelamin: 'L' },
  { id: 'std-10', nisn: '0098710010', nis: '26010', nama: 'Nabila Syifa Kirana', jenisKelamin: 'P' },
];

export const INITIAL_ASSESSMENTS: AssessmentItem[] = [
  {
    id: 'asm-diag-1',
    category: 'diagnostik',
    subType: 'Kognitif',
    judul: 'Diagnostik Awal: Operasi Bilangan & Logika Pecahan',
    lingkupMateri: 'Prasyarat Bilangan Bulat',
    tujuanPembelajaran: 'Mengidentifikasi kesiapan siswa dalam operasi dasar bilangan dan pemahaman konsep pecahan sebelum materi aljabar',
    tanggal: '2026-07-20',
  },
  {
    id: 'asm-form-1',
    category: 'formatif',
    subType: 'Tes Tulis',
    judul: 'Formatif 1: Konsep Bilangan Bulat Positif & Negatif',
    lingkupMateri: 'Bilangan Bulat',
    tujuanPembelajaran: 'Peserta didik mampu memahami konsep bilangan bulat dalam kehidupan nyata dan membandingkan besaran nilai bilangan',
    tanggal: '2026-08-12',
  },
  {
    id: 'asm-form-2',
    category: 'formatif',
    subType: 'Praktik',
    judul: 'Formatif 2: Garis Bilangan dan Penjumlahan-Pengurangan',
    lingkupMateri: 'Operasi Bilangan Bulat',
    tujuanPembelajaran: 'Peserta didik mampu menyelesaikan operasi penjumlahan dan pengurangan menggunakan alat peraga garis bilangan',
    tanggal: '2026-08-26',
  },
  {
    id: 'asm-sum-1',
    category: 'sumatif_materi',
    subType: 'Tes Tulis',
    judul: 'Sumatif Bab 1: Bilangan Bulat dan Pecahan',
    lingkupMateri: 'Bilangan Bulat dan Pecahan',
    tujuanPembelajaran: 'Menyelesaikan permasalahan kontekstual operasi hitung campuran bilangan bulat dan pecahan dengan tepat',
    tanggal: '2026-09-10',
  },
  {
    id: 'asm-sts-1',
    category: 'sts',
    subType: 'Tes Tulis',
    judul: 'Sumatif Tengah Semester (STS) Ganjil',
    lingkupMateri: 'Bilangan dan Bentuk Aljabar Sederhana',
    tujuanPembelajaran: 'Mengukur pemahaman menyeluruh materi paruh pertama semester ganjil',
    tanggal: '2026-10-02',
  },
  {
    id: 'asm-sas-1',
    category: 'sas',
    subType: 'Tes Tulis',
    judul: 'Sumatif Akhir Semester (SAS) Ganjil',
    lingkupMateri: 'Kompetensi Semester 1 Lengkap',
    tujuanPembelajaran: 'Mengukur pencapaian standar kompetensi lulusan seluruh capaian pembelajaran semester 1',
    tanggal: '2026-11-28',
  },
];

export const INITIAL_SCORES: StudentScore[] = [
  // Diagnostik (sample cognitive diagnostics)
  { id: 'sc-d-1', assessmentId: 'asm-diag-1', studentId: 'std-1', score: 85, feedback: 'Kesiapan belajar sangat baik, memahami konsep dasar secara mandiri.' },
  { id: 'sc-d-2', assessmentId: 'asm-diag-1', studentId: 'std-2', score: 92, feedback: 'Sangat siap untuk materi aljabar tingkat lanjut.' },
  { id: 'sc-d-3', assessmentId: 'asm-diag-1', studentId: 'std-3', score: 60, feedback: 'Perlu penguatan operasi dasar pembagian sebelum masuk materi utama.' },
  { id: 'sc-d-4', assessmentId: 'asm-diag-1', studentId: 'std-4', score: 78, feedback: 'Kesiapan memadai, aktif bertanya.' },
  { id: 'sc-d-5', assessmentId: 'asm-diag-1', studentId: 'std-5', score: null, feedback: '' }, // Belum Dinilai example!
  { id: 'sc-d-6', assessmentId: 'asm-diag-1', studentId: 'std-6', score: 88, feedback: 'Kesiapan sangat baik.' },
  { id: 'sc-d-7', assessmentId: 'asm-diag-1', studentId: 'std-7', score: 64, feedback: 'Perlu bimbingan membaca soal cerita.' },
  { id: 'sc-d-8', assessmentId: 'asm-diag-1', studentId: 'std-8', score: 80, feedback: 'Cukup siap dan teliti.' },
  { id: 'sc-d-9', assessmentId: 'asm-diag-1', studentId: 'std-9', score: 72, feedback: 'Memerlukan latihan dasar perkalian.' },
  { id: 'sc-d-10', assessmentId: 'asm-diag-1', studentId: 'std-10', score: 90, feedback: 'Sangat siap dan antusias.' },

  // Formatif 1
  { id: 'sc-f1-1', assessmentId: 'asm-form-1', studentId: 'std-1', score: 88, feedback: 'Mampu menjelaskan konsep bilangan bulat dengan percaya diri.' },
  { id: 'sc-f1-2', assessmentId: 'asm-form-1', studentId: 'std-2', score: 95, feedback: 'Penguasaan konsep istimewa, mandiri.' },
  { id: 'sc-f1-3', assessmentId: 'asm-form-1', studentId: 'std-3', score: 68, feedback: 'Masih ragu pada bilangan bulat negatif, sudah diberikan latihan bantuan.' },
  { id: 'sc-f1-4', assessmentId: 'asm-form-1', studentId: 'std-4', score: 82, feedback: 'Mencapai tujuan pembelajaran dengan baik.' },
  { id: 'sc-f1-5', assessmentId: 'asm-form-1', studentId: 'std-5', score: 76, feedback: 'Tuntas sesuai kriteria minimal.' },
  { id: 'sc-f1-6', assessmentId: 'asm-form-1', studentId: 'std-6', score: 90, feedback: 'Sangat baik dalam pemecahan masalah.' },
  { id: 'sc-f1-7', assessmentId: 'asm-form-1', studentId: 'std-7', score: 65, feedback: 'Perlu remedial konsep garis bilangan.' },
  { id: 'sc-f1-8', assessmentId: 'asm-form-1', studentId: 'std-8', score: 84, feedback: 'Penyelesaian soal runtut dan rapi.' },
  { id: 'sc-f1-9', assessmentId: 'asm-form-1', studentId: 'std-9', score: null, feedback: '' }, // Belum Dinilai
  { id: 'sc-f1-10', assessmentId: 'asm-form-1', studentId: 'std-10', score: 92, feedback: 'Aktif membimbing rekan dalam diskusi kelompok.' },

  // Sumatif 1
  { id: 'sc-s1-1', assessmentId: 'asm-sum-1', studentId: 'std-1', score: 85, feedback: 'Mampu menyelesaikan soal cerita pecahan.' },
  { id: 'sc-s1-2', assessmentId: 'asm-sum-1', studentId: 'std-2', score: 94, feedback: 'Hasil sumatif sangat memuaskan.' },
  { id: 'sc-s1-3', assessmentId: 'asm-sum-1', studentId: 'std-3', score: 70, feedback: 'Mengikuti remedial bab 1.' },
  { id: 'sc-s1-4', assessmentId: 'asm-sum-1', studentId: 'std-4', score: 80, feedback: 'Tuntas dengan catatan peningkatan ketelitian.' },
  { id: 'sc-s1-5', assessmentId: 'asm-sum-1', studentId: 'std-5', score: 78, feedback: 'Tuntas dengan baik.' },
  { id: 'sc-s1-6', assessmentId: 'asm-sum-1', studentId: 'std-6', score: 89, feedback: 'Kinerja sumatif sangat baik.' },
  { id: 'sc-s1-7', assessmentId: 'asm-sum-1', studentId: 'std-7', score: 68, feedback: 'Remedial terprogram.' },
  { id: 'sc-s1-8', assessmentId: 'asm-sum-1', studentId: 'std-8', score: 86, feedback: 'Paham seluruh lingkup materi.' },
  { id: 'sc-s1-9', assessmentId: 'asm-sum-1', studentId: 'std-9', score: 75, feedback: 'Tuntas batas minimum.' },
  { id: 'sc-s1-10', assessmentId: 'asm-sum-1', studentId: 'std-10', score: 96, feedback: 'Nilai tertinggi di kelas pada bab ini.' },

  // STS
  { id: 'sc-sts-1', assessmentId: 'asm-sts-1', studentId: 'std-1', score: 86 },
  { id: 'sc-sts-2', assessmentId: 'asm-sts-1', studentId: 'std-2', score: 96 },
  { id: 'sc-sts-3', assessmentId: 'asm-sts-1', studentId: 'std-3', score: 72 },
  { id: 'sc-sts-4', assessmentId: 'asm-sts-1', studentId: 'std-4', score: 84 },
  { id: 'sc-sts-5', assessmentId: 'asm-sts-1', studentId: 'std-5', score: 80 },
  { id: 'sc-sts-6', assessmentId: 'asm-sts-1', studentId: 'std-6', score: 91 },
  { id: 'sc-sts-7', assessmentId: 'asm-sts-1', studentId: 'std-7', score: 70 },
  { id: 'sc-sts-8', assessmentId: 'asm-sts-1', studentId: 'std-8', score: 88 },
  { id: 'sc-sts-9', assessmentId: 'asm-sts-1', studentId: 'std-9', score: 77 },
  { id: 'sc-sts-10', assessmentId: 'asm-sts-1', studentId: 'std-10', score: 95 },
];

export const INITIAL_REMEDIALS: RemedialFollowUp[] = [
  {
    id: 'rem-1',
    studentId: 'std-3',
    assessmentId: 'asm-sum-1',
    tpMateri: 'Operasi Campuran Pecahan',
    nilaiAwal: 70,
    nilaiRemedial: 78,
    bentukRemedial: 'Tutor sebaya dan pengerjaan 5 soal latihan terbimbing',
    tanggalPelaksanaan: '2026-09-17',
    keterangan: 'Tuntas remedial dengan nilai 78.',
  },
  {
    id: 'rem-2',
    studentId: 'std-7',
    assessmentId: 'asm-sum-1',
    tpMateri: 'Garis Bilangan dan Bilangan Negatif',
    nilaiAwal: 68,
    nilaiRemedial: 76,
    bentukRemedial: 'Bimbingan khusus dan penugasan lembar kerja mandiri',
    tanggalPelaksanaan: '2026-09-18',
    keterangan: 'Tuntas remedial dengan nilai 76.',
  },
];

export const INITIAL_ENRICHMENT: EnrichmentFollowUp[] = [
  {
    id: 'enr-1',
    studentId: 'std-2',
    assessmentId: 'asm-sum-1',
    tpMateri: 'Eksplorasi Aljabar Terapan & Olimpiade Matematika Dasar',
    nilaiAwal: 94,
    bentukPengayaan: 'Pemberian modul eksplorasi masalah logika dan proyek mini pembuatan teka-teki bilangan',
    tanggalPelaksanaan: '2026-09-20',
    keterangan: 'Menyelesaikan modul pengayaan dengan sangat memuaskan.',
  },
  {
    id: 'enr-2',
    studentId: 'std-10',
    assessmentId: 'asm-sum-1',
    tpMateri: 'Tutor Sebaya dan Soal Tantangan HOTS',
    nilaiAwal: 96,
    bentukPengayaan: 'Menjadi fasilitator tutor sebaya dalam kelompok diskusi & menyelesaikan soal tantangan HOTS',
    tanggalPelaksanaan: '2026-09-20',
    keterangan: 'Sangat kooperatif dan mampu membantu pemahaman teman.',
  },
];

export const INITIAL_PROFILES: TeacherProfile[] = [
  {
    id: 'prof-1',
    namaGuru: 'Eti Susanti, S.Pd.',
    nip: '19820815 200801 2 014',
    sekolah: 'SMP Negeri 1 Nusantara',
    kelasAktif: 'VII-A',
    mataPelajaranAktif: 'Matematika',
  },
  {
    id: 'prof-2',
    namaGuru: 'Eti Susanti, S.Pd.',
    nip: '19820815 200801 2 014',
    sekolah: 'SMP Negeri 1 Nusantara',
    kelasAktif: 'VII-B',
    mataPelajaranAktif: 'Matematika',
  },
  {
    id: 'prof-3',
    namaGuru: 'Drs. Hendra Kusuma',
    nip: '19790320 200501 1 008',
    sekolah: 'SMP Negeri 1 Nusantara',
    kelasAktif: 'VIII-C',
    mataPelajaranAktif: 'Ilmu Pengetahuan Alam (IPA)',
  },
];
