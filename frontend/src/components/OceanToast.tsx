import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OceanToastProps {
  message: string;
  visible: boolean;
}

export default function OceanToast({ message, visible }: OceanToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl"
          style={{
            background: "rgba(13, 34, 56, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(127, 223, 255, 0.25)",
            boxShadow:
              "0 0 0 1px rgba(127, 223, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(76, 201, 240, 0.12)",
            color: "#e6f7ff",
            fontFamily: "Nunito, Quicksand, Poppins, sans-serif",
            fontWeight: 600,
            fontSize: "0.9rem",
            letterSpacing: "0.01em",
            minWidth: "220px",
            maxWidth: "380px",
          }}
        >
          <span
            className="flex items-center justify-center w-6 h-6 rounded-full shrink-0"
            style={{
              background: "rgba(76, 201, 240, 0.18)",
              border: "1px solid rgba(76, 201, 240, 0.35)",
              boxShadow: "0 0 10px rgba(76, 201, 240, 0.25)",
              color: "#7fdfff",
            }}
          >
            <Check size={13} strokeWidth={2.5} />
          </span>
          <span style={{ color: "#e6f7ff" }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
