"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DayNightOverlayProps {
  isTransitioning: boolean;
  direction: "day" | "night";
}

export function DayNightOverlay({
  isTransitioning,
  direction,
}: DayNightOverlayProps) {
  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Eclipse shadow */}
          <motion.div
            className="absolute inset-0"
            initial={{
              background:
                direction === "night"
                  ? "radial-gradient(circle, transparent 100%, #0a0b16 100%)"
                  : "radial-gradient(circle, transparent 100%, #87ceeb 100%)",
            }}
            animate={{
              background:
                direction === "night"
                  ? [
                      "radial-gradient(circle, transparent 100%, #0a0b16 100%)",
                      "radial-gradient(circle, transparent 50%, #0a0b16 70%)",
                      "radial-gradient(circle, #0a0b16 0%, #0a0b16 100%)",
                    ]
                  : [
                      "radial-gradient(circle, transparent 100%, #87ceeb 100%)",
                      "radial-gradient(circle, transparent 50%, #87ceeb 70%)",
                      "radial-gradient(circle, #87ceeb 0%, #87ceeb 100%)",
                    ],
            }}
            transition={{
              duration: 4,
              times: [0, 0.5, 1],
              ease: [0.6, 0.04, 0.3, 1], // Eclipse easing
            }}
          />

          {/* Atmospheric effect */}
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: [0, 0.3, 0.6, 0.3, 0],
            }}
            transition={{ duration: 4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(238,90,111,0.1)] via-transparent to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}






