import {
  AssessmentItem,
  AssessmentWeights,
  EnrichmentFollowUp,
  RemedialFollowUp,
  SchoolSettings,
  Student,
  StudentScore,
  TeacherProfile,
} from '../types';
import {
  DEFAULT_SCHOOL_SETTINGS,
  DEFAULT_WEIGHTS,
  INITIAL_ASSESSMENTS,
  INITIAL_ENRICHMENT,
  INITIAL_PROFILES,
  INITIAL_REMEDIALS,
  INITIAL_SCORES,
  INITIAL_STUDENTS,
} from './initialData';

const STORAGE_PREFIX = 'aplikasi_penilaian_guru_v2_';

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error loading key ${key} from storage:`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key} to storage:`, e);
  }
}

export const StorageService = {
  loadSettings(): SchoolSettings {
    return safeGet<SchoolSettings>('settings', DEFAULT_SCHOOL_SETTINGS);
  },
  saveSettings(settings: SchoolSettings) {
    safeSet('settings', settings);
  },

  loadWeights(): AssessmentWeights {
    return safeGet<AssessmentWeights>('weights', DEFAULT_WEIGHTS);
  },
  saveWeights(weights: AssessmentWeights) {
    safeSet('weights', weights);
  },

  loadStudents(): Student[] {
    return safeGet<Student[]>('students', INITIAL_STUDENTS);
  },
  saveStudents(students: Student[]) {
    safeSet('students', students);
  },

  loadAssessments(): AssessmentItem[] {
    return safeGet<AssessmentItem[]>('assessments', INITIAL_ASSESSMENTS);
  },
  saveAssessments(assessments: AssessmentItem[]) {
    safeSet('assessments', assessments);
  },

  loadScores(): StudentScore[] {
    return safeGet<StudentScore[]>('scores', INITIAL_SCORES);
  },
  saveScores(scores: StudentScore[]) {
    safeSet('scores', scores);
  },

  loadRemedials(): RemedialFollowUp[] {
    return safeGet<RemedialFollowUp[]>('remedials', INITIAL_REMEDIALS);
  },
  saveRemedials(remedials: RemedialFollowUp[]) {
    safeSet('remedials', remedials);
  },

  loadEnrichments(): EnrichmentFollowUp[] {
    return safeGet<EnrichmentFollowUp[]>('enrichments', INITIAL_ENRICHMENT);
  },
  saveEnrichments(enrichments: EnrichmentFollowUp[]) {
    safeSet('enrichments', enrichments);
  },

  loadProfiles(): TeacherProfile[] {
    return safeGet<TeacherProfile[]>('profiles', INITIAL_PROFILES);
  },
  saveProfiles(profiles: TeacherProfile[]) {
    safeSet('profiles', profiles);
  },

  exportFullBackup(): string {
    const fullData = {
      exportTimestamp: new Date().toISOString(),
      appName: 'Aplikasi Tabel Penilaian Guru',
      version: '2.0.0',
      settings: this.loadSettings(),
      weights: this.loadWeights(),
      students: this.loadStudents(),
      assessments: this.loadAssessments(),
      scores: this.loadScores(),
      remedials: this.loadRemedials(),
      enrichments: this.loadEnrichments(),
      profiles: this.loadProfiles(),
    };
    return JSON.stringify(fullData, null, 2);
  },

  importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (data.weights) this.saveWeights(data.weights);
      if (data.students) this.saveStudents(data.students);
      if (data.assessments) this.saveAssessments(data.assessments);
      if (data.scores) this.saveScores(data.scores);
      if (data.remedials) this.saveRemedials(data.remedials);
      if (data.enrichments) this.saveEnrichments(data.enrichments);
      if (data.profiles) this.saveProfiles(data.profiles);
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON:', e);
      return false;
    }
  },

  resetToDefaultSample(): void {
    this.saveSettings(DEFAULT_SCHOOL_SETTINGS);
    this.saveWeights(DEFAULT_WEIGHTS);
    this.saveStudents(INITIAL_STUDENTS);
    this.saveAssessments(INITIAL_ASSESSMENTS);
    this.saveScores(INITIAL_SCORES);
    this.saveRemedials(INITIAL_REMEDIALS);
    this.saveEnrichments(INITIAL_ENRICHMENT);
    this.saveProfiles(INITIAL_PROFILES);
  },

  clearAllData(): void {
    this.saveStudents([]);
    this.saveAssessments([]);
    this.saveScores([]);
    this.saveRemedials([]);
    this.saveEnrichments([]);
  },
};
