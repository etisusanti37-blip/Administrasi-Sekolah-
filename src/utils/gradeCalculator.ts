import { AssessmentItem, AssessmentWeights, Student, StudentScore } from '../types';

export interface ScoreStatistics {
  totalSiswa: number;
  dinilaiCount: number;
  belumDinilaiCount: number;
  rataRata: number | null;
  nilaiTertinggi: number | null;
  nilaiTerendah: number | null;
  tuntasCount: number;
  remedialCount: number;
  persentaseTuntas: number;
}

export function getPredicate(score: number | null, kktp: number = 75): {
  code: 'A' | 'B' | 'C' | 'D' | '-';
  label: string;
  badgeClass: string;
} {
  if (score === null || score === undefined) {
    return {
      code: '-',
      label: 'Belum Dinilai',
      badgeClass: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
    };
  }

  // Interval dinamis berdasarkan KKTP
  const interval = (100 - kktp) / 3;
  const batasA = Math.round(kktp + interval * 2);
  const batasB = Math.round(kktp + interval);

  if (score >= batasA) {
    return {
      code: 'A',
      label: 'Sangat Baik',
      badgeClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300',
    };
  }
  if (score >= kktp) {
    return {
      code: 'B',
      label: 'Baik',
      badgeClass: 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300',
    };
  }
  if (score >= Math.max(0, kktp - 10)) {
    return {
      code: 'C',
      label: 'Cukup',
      badgeClass: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300',
    };
  }
  return {
    code: 'D',
    label: 'Perlu Bimbingan',
    badgeClass: 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300',
  };
}

export function getAchievementStatus(score: number | null, kktp: number = 75): {
  status: 'Tercapai' | 'Perlu Bimbingan' | 'Belum Dinilai';
  isTuntas: boolean;
  colorClass: string;
} {
  if (score === null || score === undefined) {
    return {
      status: 'Belum Dinilai',
      isTuntas: false,
      colorClass: 'text-slate-500',
    };
  }
  if (score >= kktp) {
    return {
      status: 'Tercapai',
      isTuntas: true,
      colorClass: 'text-emerald-600 dark:text-emerald-400 font-semibold',
    };
  }
  return {
    status: 'Perlu Bimbingan',
    isTuntas: false,
    colorClass: 'text-rose-600 dark:text-rose-400 font-semibold',
  };
}

export function generateAutoFeedback(
  namaSiswa: string,
  score: number | null,
  tujuanPembelajaran: string,
  kktp: number = 75
): string {
  if (score === null || score === undefined) {
    return 'Belum dilakukan penilaian.';
  }

  const cleanTP = tujuanPembelajaran ? tujuanPembelajaran.trim() : 'materi ini';

  if (score >= 90) {
    return `Sangat mahir dan menunjukkan penguasaan materi yang istimewa dalam ${cleanTP}.`;
  }
  if (score >= kktp) {
    return `Mencapai kompetensi dengan baik dalam ${cleanTP}. Mampu menyelesaikan penugasan secara konsisten.`;
  }
  if (score >= kktp - 10) {
    return `Cukup memahami ${cleanTP}, namun perlu latihan terarah pada bagian pemahaman konsep kunci.`;
  }
  return `Memerlukan pendampingan dan bimbingan individual tambahan untuk menguasai ${cleanTP}. Direkomendasikan remedial.`;
}

export function calculateStatistics(
  scores: (number | null)[],
  kktp: number = 75
): ScoreStatistics {
  const totalSiswa = scores.length;
  const validScores = scores.filter((s): s is number => s !== null && s !== undefined && !isNaN(s));
  const dinilaiCount = validScores.length;
  const belumDinilaiCount = totalSiswa - dinilaiCount;

  if (dinilaiCount === 0) {
    return {
      totalSiswa,
      dinilaiCount: 0,
      belumDinilaiCount: totalSiswa,
      rataRata: null,
      nilaiTertinggi: null,
      nilaiTerendah: null,
      tuntasCount: 0,
      remedialCount: 0,
      persentaseTuntas: 0,
    };
  }

  const sum = validScores.reduce((acc, val) => acc + val, 0);
  const rataRata = Math.round((sum / dinilaiCount) * 10) / 10;
  const nilaiTertinggi = Math.max(...validScores);
  const nilaiTerendah = Math.min(...validScores);
  const tuntasCount = validScores.filter((s) => s >= kktp).length;
  const remedialCount = validScores.filter((s) => s < kktp).length;
  const persentaseTuntas = Math.round((tuntasCount / dinilaiCount) * 100);

  return {
    totalSiswa,
    dinilaiCount,
    belumDinilaiCount,
    rataRata,
    nilaiTertinggi,
    nilaiTerendah,
    tuntasCount,
    remedialCount,
    persentaseTuntas,
  };
}

export interface StudentRecapRow {
  student: Student;
  avgDiagnostik: number | null; // purely informational, excluded from final grade
  avgFormatif: number | null;
  avgSumatifMateri: number | null;
  scoreSts: number | null;
  scoreSas: number | null;
  nilaiAkhir: number | null;
  predikatAkhir: string;
  statusKetercapaian: string;
  remedialNeededCount: number;
}

export function calculateStudentRecap(
  student: Student,
  assessments: AssessmentItem[],
  scores: StudentScore[],
  weights: AssessmentWeights,
  kktp: number = 75
): StudentRecapRow {
  const getCategoryScores = (category: string) => {
    const itemIds = assessments.filter((a) => a.category === category).map((a) => a.id);
    const studentItemScores = scores
      .filter((s) => s.studentId === student.id && itemIds.includes(s.assessmentId))
      .map((s) => s.score)
      .filter((s): s is number => s !== null && s !== undefined && !isNaN(s));
    return studentItemScores;
  };

  const getAverage = (numList: number[]): number | null => {
    if (numList.length === 0) return null;
    return Math.round((numList.reduce((a, b) => a + b, 0) / numList.length) * 10) / 10;
  };

  const diagScores = getCategoryScores('diagnostik');
  const formatifScores = getCategoryScores('formatif');
  const sumatifMateriScores = getCategoryScores('sumatif_materi');
  const stsScores = getCategoryScores('sts');
  const sasScores = getCategoryScores('sas');

  const avgDiagnostik = getAverage(diagScores);
  const avgFormatif = getAverage(formatifScores);
  const avgSumatifMateri = getAverage(sumatifMateriScores);
  const scoreSts = getAverage(stsScores);
  const scoreSas = getAverage(sasScores);

  // Remedial count across all graded items
  const allGradedScores = scores
    .filter((s) => s.studentId === student.id && s.score !== null)
    .map((s) => s.score as number);
  const remedialNeededCount = allGradedScores.filter((s) => s < kktp).length;

  // Final grade calculation:
  // Strictly without diagnostik!
  // Normalizing active weights
  let weightedSum = 0;
  let activeWeightSum = 0;

  if (avgFormatif !== null && weights.formatif > 0) {
    weightedSum += avgFormatif * weights.formatif;
    activeWeightSum += weights.formatif;
  }
  if (avgSumatifMateri !== null && weights.sumatifMateri > 0) {
    weightedSum += avgSumatifMateri * weights.sumatifMateri;
    activeWeightSum += weights.sumatifMateri;
  }
  if (scoreSts !== null && weights.sts > 0) {
    weightedSum += scoreSts * weights.sts;
    activeWeightSum += weights.sts;
  }
  if (scoreSas !== null && weights.sas > 0) {
    weightedSum += scoreSas * weights.sas;
    activeWeightSum += weights.sas;
  }

  const nilaiAkhir =
    activeWeightSum > 0 ? Math.round((weightedSum / activeWeightSum) * 10) / 10 : null;

  const predikat = getPredicate(nilaiAkhir, kktp);
  const status = getAchievementStatus(nilaiAkhir, kktp);

  return {
    student,
    avgDiagnostik,
    avgFormatif,
    avgSumatifMateri,
    scoreSts,
    scoreSas,
    nilaiAkhir,
    predikatAkhir: predikat.label,
    statusKetercapaian: status.status,
    remedialNeededCount,
  };
}
