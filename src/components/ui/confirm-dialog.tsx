import Modal from './modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isDestructive = true,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center space-y-4 pt-2 pb-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDestructive ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}`}>
          <AlertTriangle size={32} />
        </div>
        
        <p className="text-text-secondary text-sm px-2">
          {message}
        </p>

        <div className="flex gap-3 w-full pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-surface-raised border border-border text-text-primary font-medium hover:bg-white/5 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 rounded-xl font-semibold text-white transition-colors ${
              isDestructive 
                ? 'bg-danger hover:bg-danger/80' 
                : 'bg-primary text-[#0A0A1A] hover:bg-primary/80'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
