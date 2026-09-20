import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  loading = false
}) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-bg-0/80 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Click outside to cancel */}
      <div className="absolute inset-0" onClick={onCancel} aria-hidden="true" />

      {/* Modal Container / Mobile Bottom Sheet */}
      <div className="relative z-10 surface-card border border-border-bright w-full max-w-lg p-6 sm:p-7 shadow-depth-3 rounded-t-3xl sm:rounded-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Mobile Drag Pill */}
        <div className="w-12 h-1.5 bg-surface-3 rounded-full mx-auto -mt-2 mb-2 sm:hidden" aria-hidden="true" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {isDangerous ? (
              <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-600/40 text-rose-400 flex items-center justify-center shrink-0 shadow-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-brand-deep/50 border border-brand-bright/30 text-brand-glow flex items-center justify-center shrink-0 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-brand-ice" />
              </div>
            )}
            <h3 id="confirm-dialog-title" className="text-lg font-bold font-heading text-text-primary">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-3 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          {message}
        </p>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
