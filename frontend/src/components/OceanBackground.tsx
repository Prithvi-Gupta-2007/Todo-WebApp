import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Generates stable random values for the bubbles so they don't jump around on re-renders
function useBubbles(count: number) {
  const [bubbles, setBubbles] = useState<any[]>([]);
  useEffect(() => {
    const newBubbles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 15 + 5,
      delay: Math.random() * 20,
      duration: Math.random() * 15 + 15,
    }));
    setBubbles(newBubbles);
  }, [count]);
  return bubbles;
}

export default function OceanBackground() {
  const bubbles = useBubbles(30);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Ambient Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse duration-[12000ms]" />
      
      {/* Sparkles / Stars (Subtle) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMC41IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz4KPC9zdmc+')] opacity-30" />

      {/* Floating Bubbles */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute bottom-[-50px] rounded-full border border-white/20 bg-white/5 backdrop-blur-[1px]"
          style={{
            left: `${bubble.x}%`,
            width: bubble.size,
            height: bubble.size,
          }}
          animate={{
            y: ["0vh", "-120vh"],
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            delay: bubble.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
