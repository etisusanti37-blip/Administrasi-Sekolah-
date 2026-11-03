import React from 'react';
import { SchoolSettings } from '../types';

interface PrintSignaturesProps {
  school: SchoolSettings;
}

export const PrintSignatures: React.FC<PrintSignaturesProps> = ({ school }) => {
  const formattedDate = school.titimangsaTanggal
    ? new Date(school.titimangsaTanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  return (
    <div className="hidden print:grid grid-cols-2 gap-8 text-xs text-slate-900 mt-8 pt-4">
      <div className="text-center">
        <p>Mengetahui,</p>
        <p className="font-semibold">Kepala Sekolah</p>
        <div className="h-16"></div>
        <p className="font-bold underline uppercase">{school.kepalaSekolah}</p>
        <p>NIP. {school.nipKepalaSekolah || '-'}</p>
      </div>

      <div className="text-center">
        <p>
          {school.titimangsaKota || 'Kota'}, {formattedDate}
        </p>
        <p className="font-semibold">Guru Mata Pelajaran</p>
        <div className="h-16"></div>
        <p className="font-bold underline uppercase">{school.namaGuru}</p>
        <p>NIP. {school.nipGuru || '-'}</p>
      </div>
    </div>
  );
};
