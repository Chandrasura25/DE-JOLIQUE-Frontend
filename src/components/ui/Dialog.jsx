import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

/** Accessible modal built on the native <dialog> element (focus trap + Esc for free). */
export function Modal({ open, onClose, title, children, size = 'max-w-md' }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      onClick={(e) => e.target === ref.current && onClose?.()}
      className={`m-auto w-[calc(100%-2rem)] ${size} rounded-2xl bg-white p-0 text-ink-900 shadow-2xl backdrop:bg-ink-950/50 backdrop:backdrop-blur-[2px]`}
    >
      {open && (
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
  loading = false,
  children,
}) {
  return (
    <Modal open={open} onClose={loading ? undefined : onClose} title={title}>
      <div className="flex gap-4">
        {tone === 'danger' && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
        )}
        <div className="text-sm text-ink-500">{message}</div>
      </div>
      {children}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
