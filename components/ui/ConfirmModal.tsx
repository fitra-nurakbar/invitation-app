'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, AlertCircle } from 'lucide-react';
import styles from './ConfirmModal.module.css';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  let iconWrapClass = styles.iconWrapDanger;
  let IconComponent = Trash2;
  if (variant === 'warning') {
    iconWrapClass = styles.iconWrapWarning;
    IconComponent = AlertTriangle;
  } else if (variant === 'default') {
    iconWrapClass = styles.iconWrapDefault;
    IconComponent = AlertCircle;
  }

  const confirmBtnClass = variant === 'danger' ? styles.btnConfirmDanger : styles.btnConfirmDefault;

  return (
    <div
      className={styles.overlay}
      onClick={e => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className={styles.modalHeader}>
          <div className={iconWrapClass}>
            <IconComponent size={18} strokeWidth={2} />
          </div>
          <h3 id="confirm-modal-title" className={styles.title}>
            {title}
          </h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            disabled={loading}
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnCancel} onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className={confirmBtnClass} onClick={onConfirm} disabled={loading}>
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
