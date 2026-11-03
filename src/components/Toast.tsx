import React from 'react';
import { AppNotification } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none no-print">
      {notifications.map((n) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        let borderClass = 'border-emerald-200 bg-white text-slate-800 shadow-md';

        if (n.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
          borderClass = 'border-rose-200 bg-white text-slate-800 shadow-md';
        } else if (n.type === 'warning') {
          icon = <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />;
          borderClass = 'border-amber-200 bg-white text-slate-800 shadow-md';
        } else if (n.type === 'info') {
          icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;
          borderClass = 'border-blue-200 bg-white text-slate-800 shadow-md';
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg border ${borderClass} transition-all duration-200`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium">{n.message}</p>
            </div>
            <button
              onClick={() => onDismiss(n.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
