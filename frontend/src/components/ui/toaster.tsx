import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-[#0f243d]/90 backdrop-blur-xl border border-white/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.5),_0_0_20px_rgba(76,201,240,0.1)] rounded-2xl">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-[15px] font-semibold tracking-wide text-cyan-50">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-cyan-100/70">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-cyan-100/50 hover:text-white transition-colors" />
          </Toast>
        )
      })}
      {/* Viewport styled directly to force top-center rendering safely */}
      <ToastViewport className="fixed top-6 left-[50%] z-[100] flex max-h-screen w-full translate-x-[-50%] flex-col gap-3 md:max-w-[420px]" />
    </ToastProvider>
  )
}
