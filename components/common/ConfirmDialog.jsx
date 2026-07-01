'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * A styled confirmation dialog to replace the native browser confirm().
 * Rendered through a portal to <body> so it always centers on the viewport —
 * otherwise a `backdrop-blur`/transform ancestor (e.g. the Topbar) would become
 * the containing block for our fixed overlay and trap it in a corner.
 * Props:
 *   open, onClose, onConfirm, title, message, confirmLabel, variant
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  variant = 'danger',
}) {
  // Portals need the DOM — only render on the client after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle size={20} className="text-danger" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{message}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={
                  variant === 'danger'
                    ? 'bg-danger text-white hover:bg-red-700'
                    : ''
                }
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
