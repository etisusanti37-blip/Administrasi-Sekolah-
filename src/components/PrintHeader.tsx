import React from 'react';
import { SchoolSettings } from '../types';

interface PrintHeaderProps {
  school: SchoolSettings;
  title: string;
  subtitle?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ school, title, subtitle }) => {
  return (
    <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4 text-center">
      <div className="flex items-center justify-between gap-4">
        <div className="w-16 h-16 shrink-0 flex items-center justify-center border border-slate-300 rounded font-bold text-xs text-slate-500">
          LOGO
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-slate-700">Pemerintah Daerah / Yayasan Pendidikan</p>
          <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900">{school.namaSekolah}</h1>
          <p className="text-xs text-slate-600">{school.alamatSekolah} | NPSN: {school.npsn}</p>
        </div>
        <div className="w-16 h-16 shrink-0 flex items-center justify-center border border-slate-300 rounded font-bold text-xs text-slate-500">
          KEMDIKBUD
        </div>
      </div>
      <div className="border-t border-slate-900 mt-3 pt-3">
        <h2 className="text-base font-bold uppercase underline text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-700 mt-0.5">{subtitle}</p>}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-left text-xs mt-3 pt-2 border-t border-slate-200">
        <div><span className="font-semibold">Mata Pelajaran:</span> {school.mataPelajaran}</div>
        <div><span className="font-semibold">Tahun Ajaran:</span> {school.tahunAjaran} / Semester {school.semester}</div>
        <div><span className="font-semibold">Kelas / Fase:</span> {school.kelas} ({school.fase})</div>
        <div><span className="font-semibold">KKTP / KKM:</span> {school.kktp}</div>
        <div><span className="font-semibold">Guru Pengampu:</span> {school.namaGuru}</div>
        <div><span className="font-semibold">NIP Guru:</span> {school.nipGuru || '-'}</div>
      </div>
    </div>
  );
};
