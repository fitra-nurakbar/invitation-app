'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from '@/components/ui/Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  closing?: boolean;
}

interface ToastContextType {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, closing: true } : t)));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const newToast: ToastItem = { id, type, message, title };

      setToasts(prev => [...prev, newToast]);

      setTimeout(() => {
        dismiss(id);
      }, 4000);
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, title?: string) => {
      addToast('success', message, title || 'Berhasil');
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      addToast('error', message, title || 'Terjadi Kesalahan');
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      addToast('info', message, title || 'Informasi');
    },
    [addToast]
  );

  const value = useMemo(
    () => ({
      success,
      error,
      info,
      dismiss,
    }),
    [success, error, info, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container pinned at bottom right */}
      <div className={styles.toastContainer} aria-live="polite">
        {toasts.map(toast => {
          let typeClass = styles.toastInfo;
          let Icon = Info;
          if (toast.type === 'success') {
            typeClass = styles.toastSuccess;
            Icon = CheckCircle2;
          } else if (toast.type === 'error') {
            typeClass = styles.toastError;
            Icon = AlertCircle;
          }

          return (
            <div
              key={toast.id}
              className={`${styles.toastItem} ${typeClass} ${toast.closing ? styles.closing : ''}`}
              role="alert"
            >
              <div className={styles.toastIconWrap}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <div className={styles.toastBody}>
                {toast.title && <div className={styles.toastTitle}>{toast.title}</div>}
                <div className={styles.toastMessage}>{toast.message}</div>
              </div>
              <button
                type="button"
                className={styles.toastCloseBtn}
                onClick={() => dismiss(toast.id)}
                title="Tutup notifikasi"
                aria-label="Tutup"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
