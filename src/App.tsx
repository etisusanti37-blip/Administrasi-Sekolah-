/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppNotification,
  AssessmentCategory,
  AssessmentItem,
  AssessmentWeights,
  EnrichmentFollowUp,
  RemedialFollowUp,
  SchoolSettings,
  Student,
  StudentScore,
  TeacherProfile,
} from './types';
import { StorageService } from './utils/storage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { StudentMasterModal } from './components/StudentMasterModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { DashboardView } from './views/DashboardView';
import { StudentMasterView } from './views/StudentMasterView';
import { AssessmentTableView } from './views/AssessmentTableView';
import { ClassRecapView } from './views/ClassRecapView';
import { StudentIndividualReportView } from './views/StudentIndividualReportView';
import { AnalysisAndFollowUpView } from './views/AnalysisAndFollowUpView';
import { SettingsAndDatabaseView } from './views/SettingsAndDatabaseView';

export default function App() {
  // Core persistent states
  const [school, setSchool] = useState<SchoolSettings>(() => StorageService.loadSettings());
  const [weights, setWeights] = useState<AssessmentWeights>(() => StorageService.loadWeights());
  const [students, setStudents] = useState<Student[]>(() => StorageService.loadStudents());
  const [assessments, setAssessments] = useState<AssessmentItem[]>(() => StorageService.loadAssessments());
  const [scores, setScores] = useState<StudentScore[]>(() => StorageService.loadScores());
  const [remedials, setRemedials] = useState<RemedialFollowUp[]>(() => StorageService.loadRemedials());
  const [enrichments, setEnrichments] = useState<EnrichmentFollowUp[]>(() => StorageService.loadEnrichments());
  const [profiles, setProfiles] = useState<TeacherProfile[]>(() => StorageService.loadProfiles());

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Student modal states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  // Synchronize to localStorage
  useEffect(() => {
    StorageService.saveSettings(school);
  }, [school]);

  useEffect(() => {
    StorageService.saveWeights(weights);
  }, [weights]);

  useEffect(() => {
    StorageService.saveStudents(students);
  }, [students]);

  useEffect(() => {
    StorageService.saveAssessments(assessments);
  }, [assessments]);

  useEffect(() => {
    StorageService.saveScores(scores);
  }, [scores]);

  useEffect(() => {
    StorageService.saveRemedials(remedials);
  }, [remedials]);

  useEffect(() => {
    StorageService.saveEnrichments(enrichments);
  }, [enrichments]);

  useEffect(() => {
    StorageService.saveProfiles(profiles);
  }, [profiles]);

  const addNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Student CRUD
  const handleSaveStudent = (studentData: Omit<Student, 'id'>, existingId?: string) => {
    if (existingId) {
      setStudents((prev) =>
        prev.map((s) => (s.id === existingId ? { ...s, ...studentData } : s))
      );
      addNotification(`Data peserta didik "${studentData.nama}" berhasil diperbarui.`);
    } else {
      const newId = 'std-' + Date.now();
      const newStudent: Student = { ...studentData, id: newId };
      setStudents((prev) => [...prev, newStudent]);
      addNotification(`Peserta didik baru "${studentData.nama}" berhasil ditambahkan.`);
    }
  };

  const handleDeleteStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Remove scores
    setScores((prev) => prev.filter((sc) => sc.studentId !== id));
    // Remove remedial/enrichment
    setRemedials((prev) => prev.filter((r) => r.studentId !== id));
    setEnrichments((prev) => prev.filter((e) => e.studentId !== id));
    addNotification(`Peserta didik "${student?.nama || ''}" telah dihapus.`, 'info');
  };

  const handleImportStudents = (newStudentsData: Omit<Student, 'id'>[], mode: 'append' | 'replace') => {
    const newStudents: Student[] = newStudentsData.map((s, idx) => ({
      ...s,
      id: `std-imp-${Date.now()}-${idx}`,
    }));

    if (mode === 'replace') {
      setStudents(newStudents);
      setScores([]);
      addNotification(`Berhasil mengganti daftar siswa dengan ${newStudents.length} siswa baru dari Excel.`);
    } else {
      setStudents((prev) => [...prev, ...newStudents]);
      addNotification(`Berhasil menambahkan ${newStudents.length} peserta didik dari Excel/CSV.`);
    }
  };

  const handleClearAllStudents = () => {
    if (window.confirm('Kosongkan seluruh daftar peserta didik? Semua nilai terkait juga akan terhapus.')) {
      setStudents([]);
      setScores([]);
      setRemedials([]);
      setEnrichments([]);
      addNotification('Daftar peserta didik telah dikosongkan.', 'warning');
    }
  };

  // Scoring handlers
  const handleUpdateScore = (
    assessmentId: string,
    studentId: string,
    score: number | null,
    feedback?: string
  ) => {
    setScores((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.assessmentId === assessmentId && s.studentId === studentId
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          score,
          feedback: feedback !== undefined ? feedback : updated[existingIdx].feedback,
        };
        return updated;
      } else {
        const newRecord: StudentScore = {
          id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          assessmentId,
          studentId,
          score,
          feedback: feedback || '',
        };
        return [...prev, newRecord];
      }
    });
  };

  const handleBatchUpdateScores = (
    assessmentId: string,
    updates: { studentId: string; score: number | null; feedback?: string }[]
  ) => {
    setScores((prev) => {
      const nextScores = [...prev];
      for (const update of updates) {
        const idx = nextScores.findIndex(
          (s) => s.assessmentId === assessmentId && s.studentId === update.studentId
        );
        if (idx >= 0) {
          nextScores[idx] = {
            ...nextScores[idx],
            score: update.score,
            feedback: update.feedback !== undefined ? update.feedback : nextScores[idx].feedback,
          };
        } else {
          nextScores.push({
            id: `sc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            assessmentId,
            studentId: update.studentId,
            score: update.score,
            feedback: update.feedback || '',
          });
        }
      }
      return nextScores;
    });
    addNotification('Nilai dan catatan berhasil diperbarui secara massal.');
  };

  // Assessment item management
  const handleCreateAssessment = (newItem: Omit<AssessmentItem, 'id'>) => {
    const id = `asm-${newItem.category}-${Date.now()}`;
    const created: AssessmentItem = { ...newItem, id };
    setAssessments((prev) => [...prev, created]);
    addNotification(`Asesmen baru "${newItem.judul}" berhasil dibuat.`);
  };

  const handleDeleteAssessment = (assessmentId: string) => {
    const item = assessments.find((a) => a.id === assessmentId);
    setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
    setScores((prev) => prev.filter((s) => s.assessmentId !== assessmentId));
    addNotification(`Asesmen "${item?.judul || ''}" berhasil dihapus.`, 'info');
  };

  // Settings & weights
  const handleSaveSettings = (newSettings: SchoolSettings) => {
    setSchool(newSettings);
    addNotification('Identitas sekolah dan pengaturan kelas berhasil disimpan.');
  };

  const handleSaveWeights = (newWeights: AssessmentWeights) => {
    setWeights(newWeights);
    addNotification('Pengaturan bobot penilaian Kurikulum Merdeka berhasil diterapkan.');
  };

  // Profiles
  const handleSwitchProfile = (p: TeacherProfile) => {
    setSchool((prev) => ({
      ...prev,
      namaGuru: p.namaGuru,
      nipGuru: p.nip,
      kelas: p.kelasAktif,
      mataPelajaran: p.mataPelajaranAktif,
    }));
    addNotification(`Profil aktif dialihkan ke "${p.namaGuru} - Kelas ${p.kelasAktif}".`);
  };

  const handleAddProfile = (newProfile: Omit<TeacherProfile, 'id'>) => {
    const id = `prof-${Date.now()}`;
    setProfiles((prev) => [...prev, { ...newProfile, id }]);
    addNotification(`Profil guru untuk kelas ${newProfile.kelasAktif} berhasil ditambahkan.`);
  };

  // Backup & reset
  const handleRestoreBackup = (jsonString: string): boolean => {
    const success = StorageService.importFullBackup(jsonString);
    if (success) {
      setSchool(StorageService.loadSettings());
      setWeights(StorageService.loadWeights());
      setStudents(StorageService.loadStudents());
      setAssessments(StorageService.loadAssessments());
      setScores(StorageService.loadScores());
      setRemedials(StorageService.loadRemedials());
      setEnrichments(StorageService.loadEnrichments());
      setProfiles(StorageService.loadProfiles());
      addNotification('Data berhasil dipulihkan dari cadangan JSON.');
      return true;
    }
    return false;
  };

  const handleResetToSample = () => {
    if (window.confirm('Muat kembali data contoh simulasi? Data saat ini akan ditimpa dengan data contoh.')) {
      StorageService.resetToDefaultSample();
      setSchool(StorageService.loadSettings());
      setWeights(StorageService.loadWeights());
      setStudents(StorageService.loadStudents());
      setAssessments(StorageService.loadAssessments());
      setScores(StorageService.loadScores());
      setRemedials(StorageService.loadRemedials());
      setEnrichments(StorageService.loadEnrichments());
      setProfiles(StorageService.loadProfiles());
      addNotification('Data simulasi contoh berhasil dimuat ulang.');
    }
  };

  const handleClearSampleData = () => {
    if (window.confirm('Kosongkan semua data simulasi untuk mulai dari data bersih kelas Anda?')) {
      StorageService.clearAllData();
      setStudents([]);
      setAssessments([]);
      setScores([]);
      setRemedials([]);
      setEnrichments([]);
      addNotification('Data simulasi telah dikosongkan. Silakan masukkan data kelas Anda.');
    }
  };

  // Remedial & Enrichment
  const handleAddRemedial = (rem: Omit<RemedialFollowUp, 'id'>) => {
    const newRem: RemedialFollowUp = { ...rem, id: `rem-${Date.now()}` };
    setRemedials((prev) => [newRem, ...prev]);
    addNotification('Program remedial siswa berhasil dicatat.');
  };

  const handleDeleteRemedial = (id: string) => {
    setRemedials((prev) => prev.filter((r) => r.id !== id));
    addNotification('Catatan remedial telah dihapus.', 'info');
  };

  const handleAddEnrichment = (enr: Omit<EnrichmentFollowUp, 'id'>) => {
    const newEnr: EnrichmentFollowUp = { ...enr, id: `enr-${Date.now()}` };
    setEnrichments((prev) => [newEnr, ...prev]);
    addNotification('Program pengayaan siswa berhasil dicatat.');
  };

  const handleDeleteEnrichment = (id: string) => {
    setEnrichments((prev) => prev.filter((e) => e.id !== id));
    addNotification('Catatan pengayaan telah dihapus.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification Stack */}
      <Toast notifications={notifications} onDismiss={handleDismissNotification} />

      {/* Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        studentCount={students.length}
      />

      {/* Main Content Area (offset by sidebar on desktop) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          school={school}
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onPrintCurrentView={() => window.print()}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto print:max-w-none print:p-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              school={school}
              students={students}
              assessments={assessments}
              scores={scores}
              weights={weights}
              onNavigate={(tab) => setActiveTab(tab)}
              onResetData={handleResetToSample}
              onClearSample={handleClearSampleData}
            />
          )}

          {/* 5 Main Assessment Menus */}
          {activeTab === 'diagnostik' && (
            <AssessmentTableView
              category="diagnostik"
              categoryTitle="1. Penilaian Diagnostik (Kognitif & Non-Kognitif)"
              categorySubtitle="Pemetaan awal kesiapan belajar, pemahaman prasyarat materi, dan karakteristik gaya belajar siswa. Nilai ini bebas bobot rapor."
              school={school}
              students={students}
              assessments={assessments}
              scores={scores}
              onUpdateScore={handleUpdateScore}
              onBatchUpdateScores={handleBatchUpdateScores}
              onCreateAssessment={handleCreateAssessment}
              onDeleteAssessment={handleDeleteAssessment}
            />
          )}

          {activeTab === 'formatif' && (
            <AssessmentTableView
              category="formatif"
              categoryTitle="2. Penilaian Formatif (Proses Pembelajaran)"
              categorySubtitle="Pemantauan kemajuan belajar siswa per Tujuan Pembelajaran (TP) untuk umpan balik konstruktif dan perbaikan proses mengajar."
              school={school}
              students={students}
              assessments={assessments}
              scores={scores}
              onUpdateScore={handleUpdateScore}
              onBatchUpdateScores={handleBatchUpdateScores}
              onCreateAssessment={handleCreateAssessment}
              onDeleteAssessment={handleDeleteAssessment}
            />
          )}

          {activeTab === 'sumatif_materi' && (
            <AssessmentTableView
              category="sumatif_materi"
              categoryTitle="3. Sumatif Akhir Materi (Asesmen Lingkup Materi / Bab)"
              categorySubtitle="Pengukuran ketercapaian tujuan pembelajaran pada setiap akhir bab atau lingkup materi sebagai dasar pengisian nilai rapor."
              school={school}
              students={students}
              assessments={assessments}
              scores={scores}
              onUpdateScore={handleUpdateScore}
              onBatchUpdateScores={handleBatchUpdateScores}
              onCreateAssessment={handleCreateAssessment}
              onDeleteAssessment={handleDeleteAssessment}
            />
          )}

          {activeTab === 'sts' && (
            <AssessmentTableView
              category="sts"
              categoryTitle="4. Sumatif Tengah Semester (STS)"
              categorySubtitle="Evaluasi pencapaian kompetensi paruh pertama semester untuk mengetahui retensi konsep dan dasar intervensi remedial tengah semester."
              school={school}
              students={students}
              assessments={assessments}
              scores={scores}
              onUpdateScore={handleUpdateScore}
              onBatchUpdateScores={handleBatchUpdateScores}
              onCreateAssessment={handleCreateAssessment}
              onDeleteAssessment={handleDeleteAssessment}
            />
          )}

          {activeTab === 'sas' && (
            <AssessmentTableView
              category="sas"
              categoryTitle="5. Sumatif Akhir Semester (SAS / ASAS)"
              categorySubtitle="Asesmen sumatif akhir semester untuk mengukur capaian seluruh standar kompetensi kelulusan semester 1 atau 2."
              school={school}
              students={students}
              assessments={assessments}
              scores={scores}
              onUpdateScore={handleUpdateScore}
              onBatchUpdateScores={handleBatchUpdateScores}
              onCreateAssessment={handleCreateAssessment}
              onDeleteAssessment={handleDeleteAssessment}
            />
          )}

          {activeTab === 'students' && (
            <StudentMasterView
              students={students}
              school={school}
              onAddStudent={() => {
                setStudentToEdit(null);
                setIsStudentModalOpen(true);
              }}
              onEditStudent={(s) => {
                setStudentToEdit(s);
                setIsStudentModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onOpenImportModal={() => setIsExcelImportModalOpen(true)}
              onClearAllStudents={handleClearAllStudents}
            />
          )}

          {activeTab === 'recap' && (
            <ClassRecapView
              school={school}
              students={students}
              assessments={assessments}
              scores={scores}
              weights={weights}
              onUpdateWeights={handleSaveWeights}
            />
          )}

          {activeTab === 'individual' && (
            <StudentIndividualReportView
              school={school}
              students={students}
              assessments={assessments}
              scores={scores}
              weights={weights}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisAndFollowUpView
              school={school}
              students={students}
              assessments={assessments}
              scores={scores}
              weights={weights}
              remedials={remedials}
              enrichments={enrichments}
              onAddRemedial={handleAddRemedial}
              onDeleteRemedial={handleDeleteRemedial}
              onAddEnrichment={handleAddEnrichment}
              onDeleteEnrichment={handleDeleteEnrichment}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsAndDatabaseView
              school={school}
              weights={weights}
              profiles={profiles}
              onSaveSettings={handleSaveSettings}
              onSaveWeights={handleSaveWeights}
              onSwitchProfile={handleSwitchProfile}
              onAddProfile={handleAddProfile}
              onRestoreBackup={handleRestoreBackup}
              onResetData={handleResetToSample}
              onClearSample={handleClearSampleData}
            />
          )}
        </main>
      </div>

      {/* Student Add/Edit Modal */}
      <StudentMasterModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      {/* Excel / CSV Import Modal */}
      <ExcelImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onImport={handleImportStudents}
      />
    </div>
  );
}
