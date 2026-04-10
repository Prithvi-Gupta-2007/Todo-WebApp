import toast from "react-hot-toast";
import { playBubbleSound } from "@/lib/audio";
import OceanToast from "@/components/OceanToast";

export function useOceanToast() {
  const oceanToast = (message: string) => {
    playBubbleSound();
    toast.custom(
      (t) => <OceanToast message={message} visible={t.visible} />,
      { position: "top-center", duration: 3000 }
    );
  };

  return { toast: oceanToast };
}
