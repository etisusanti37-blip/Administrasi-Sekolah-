import * as XLSX from 'xlsx';
import { AssessmentItem, SchoolSettings, Student, StudentScore } from '../types';
import { getAchievementStatus, getPredicate, StudentRecapRow } from './gradeCalculator';

export function downloadStudentTemplate() {
  const templateData = [
    {
      'NISN': '0091234567',
      'NIS': '24001',
      'Nama Siswa': 'Aditya Pratama Putra',
      'Jenis Kelamin (L/P)': 'L',
      'Catatan': 'Aktif dalam diskusi',
    },
    {
      'NISN': '0091234568',
      'NIS': '24002',
      'Nama Siswa': 'Alya Zahra Salsabila',
      'Jenis Kelamin (L/P)': 'P',
      'Catatan': '',
    },
    {
      'NISN': '0091234569',
      'NIS': '24003',
      'Nama Siswa': 'Bima Arya Nugraha',
      'Jenis Kelamin (L/P)': 'L',
      'Catatan': '',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
  XLSX.writeFile(wb, 'Format_Impor_Daftar_Siswa.xlsx');
}

export async function parseStudentFile(file: File): Promise<Omit<Student, 'id'>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('File tidak memiliki data siswa yang dapat dibaca.');
  }

  // Column matching logic
  const findKey = (row: Record<string, any>, possibilities: string[]) => {
    const keys = Object.keys(row);
    for (const key of keys) {
      const normalized = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (possibilities.some((p) => normalized.includes(p))) {
        return key;
      }
    }
    return null;
  };

  const sample = rawRows[0];
  const nameKey = findKey(sample, ['nama', 'siswa', 'pesertadidik', 'name']);
  const nisnKey = findKey(sample, ['nisn']);
  const nisKey = findKey(sample, ['nis', 'noinduk']);
  const jkKey = findKey(sample, ['jeniskelamin', 'jk', 'gender', 'lp', 'sex']);
  const noteKey = findKey(sample, ['catatan', 'keterangan', 'note']);

  if (!nameKey) {
    throw new Error('Kolom Nama Siswa tidak terdeteksi. Pastikan ada kolom bernama "Nama" atau "Nama Siswa".');
  }

  const students: Omit<Student, 'id'>[] = [];
  
  for (let idx = 0; idx < rawRows.length; idx++) {
    const row = rawRows[idx];
    const rawName = String(row[nameKey] || '').trim();
    if (!rawName) continue;

    let rawJk = jkKey ? String(row[jkKey] || '').trim().toUpperCase() : 'L';
    let jk: 'L' | 'P' = 'L';
    if (rawJk.startsWith('P') || rawJk.includes('PEREMPUAN') || rawJk.includes('FEMALE')) {
      jk = 'P';
    }

    students.push({
      nama: rawName,
      nisn: nisnKey ? String(row[nisnKey] || '').trim() : `00${idx + 1}000000`,
      nis: nisKey ? String(row[nisKey] || '').trim() : `${idx + 1}`,
      jenisKelamin: jk,
      catatanKhusus: noteKey && row[noteKey] ? String(row[noteKey]).trim() : undefined,
    });
  }

  if (students.length === 0) {
    throw new Error('Tidak ditemukan baris siswa yang valid dalam file.');
  }

  return students;
}

export function exportAssessmentToExcel(
  assessment: AssessmentItem,
  students: Student[],
  scores: StudentScore[],
  school: SchoolSettings
) {
  const kktp = assessment.kktpOverride || school.kktp;

  const dataRows = students.map((student, idx) => {
    const studentScore = scores.find(
      (s) => s.studentId === student.id && s.assessmentId === assessment.id
    );
    const scoreVal = studentScore ? studentScore.score : null;
    const predicate = getPredicate(scoreVal, kktp);
    const status = getAchievementStatus(scoreVal, kktp);

    return {
      'No': idx + 1,
      'NISN': student.nisn || '-',
      'NIS': student.nis || '-',
      'Nama Siswa': student.nama,
      'Jenis Kelamin': student.jenisKelamin,
      'Tujuan Pembelajaran / Lingkup Materi': assessment.tujuanPembelajaran || assessment.lingkupMateri,
      'Tanggal Penilaian': assessment.tanggal || '-',
      'Nilai': scoreVal !== null ? scoreVal : 'Belum Dinilai',
      'Predikat': predicate.label,
      'Status Ketercapaian': status.status,
      'Catatan Guru': studentScore?.feedback || '-',
    };
  });

  const ws = XLSX.utils.json_to_sheet(dataRows);
  const wb = XLSX.utils.book_new();

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // NISN
    { wch: 10 }, // NIS
    { wch: 28 }, // Nama
    { wch: 6 },  // JK
    { wch: 35 }, // TP
    { wch: 14 }, // Tanggal
    { wch: 12 }, // Nilai
    { wch: 16 }, // Predikat
    { wch: 18 }, // Status
    { wch: 40 }, // Catatan
  ];

  const sheetTitle = assessment.judul.replace(/[/\\?%*:|"<>]/g, '_').substring(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle || 'Penilaian');

  const filename = `Nilai_${assessment.category.toUpperCase()}_${assessment.judul.replace(/\s+/g, '_')}_${school.kelas}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportClassLedgerToExcel(
  recapRows: StudentRecapRow[],
  assessments: AssessmentItem[],
  scores: StudentScore[],
  school: SchoolSettings
) {
  const ledgerData = recapRows.map((row, idx) => {
    return {
      'No': idx + 1,
      'NISN': row.student.nisn,
      'NIS': row.student.nis,
      'Nama Siswa': row.student.nama,
      'L/P': row.student.jenisKelamin,
      'Rerata Formatif (30%)': row.avgFormatif !== null ? row.avgFormatif : 'Belum Lengkap',
      'Rerata Sumatif Materi (30%)': row.avgSumatifMateri !== null ? row.avgSumatifMateri : 'Belum Lengkap',
      'Nilai STS (20%)': row.scoreSts !== null ? row.scoreSts : 'Belum Ada',
      'Nilai SAS (20%)': row.scoreSas !== null ? row.scoreSas : 'Belum Ada',
      'NILAI AKHIR': row.nilaiAkhir !== null ? row.nilaiAkhir : 'Belum Dinilai',
      'Predikat': row.predikatAkhir,
      'Status Rapor': row.statusKetercapaian,
      'Jml Remedial': row.remedialNeededCount,
      'Diagnostik (Non-Bobot)': row.avgDiagnostik !== null ? row.avgDiagnostik : '-',
    };
  });

  const ws = XLSX.utils.json_to_sheet(ledgerData);
  const wb = XLSX.utils.book_new();

  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 14 }, // NISN
    { wch: 10 }, // NIS
    { wch: 28 }, // Nama
    { wch: 6 },  // JK
    { wch: 22 }, // Formatif
    { wch: 24 }, // Sumatif
    { wch: 16 }, // STS
    { wch: 16 }, // SAS
    { wch: 14 }, // Nilai Akhir
    { wch: 16 }, // Predikat
    { wch: 18 }, // Status
    { wch: 14 }, // Remedial
    { wch: 20 }, // Diagnostik
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi Nilai Rapor');
  const filename = `REKAP_NILAI_RAPOR_${school.mataPelajaran.replace(/\s+/g, '_')}_${school.kelas}_${school.tahunAjaran.replace(/\//g, '-')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
