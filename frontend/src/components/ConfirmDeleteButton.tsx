import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDeleteButtonProps {
  isConfirming: boolean;
  onRequestConfirm: (e: React.MouseEvent) => void;
  onConfirm: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
}

export default function ConfirmDeleteButton({
  isConfirming,
  onRequestConfirm,
  onConfirm,
  onCancel,
}: ConfirmDeleteButtonProps) {
  return (
    <div
      className="relative flex items-center justify-end h-9"
      onClick={(e) => e.stopPropagation()}
    >
      <AnimatePresence mode="wait">
        {isConfirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.85, x: 8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onCancel}
              className="px-2.5 py-1 text-xs text-white/50 hover:text-white/80 rounded-lg transition-colors font-medium"
              title="Cancel"
            >
              cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/35 hover:text-red-200 hover:border-red-400/50 transition-all shadow-[0_0_12px_rgba(239,68,68,0.15)] hover:shadow-[0_0_18px_rgba(239,68,68,0.3)]"
              title="Confirm delete"
            >
              confirm?
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onRequestConfirm}
            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            title="Delete"
          >
            <Trash2 size={17} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
