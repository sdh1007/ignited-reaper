"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCemeteryStore } from "@/store/cemetery";

export function ProfileNavigation() {
  const { selectedProfile, setSelectedProfile, filteredProfiles } =
    useCemeteryStore();

  if (!selectedProfile) return null;

  const profiles = filteredProfiles();
  const currentIndex = profiles.findIndex((p) => p.id === selectedProfile.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < profiles.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      setSelectedProfile(profiles[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      setSelectedProfile(profiles[currentIndex + 1]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={goToPrevious}
        disabled={!hasPrevious}
        className="p-2 rounded-full hover:bg-[rgba(36,46,78,0.85)] text-secondary hover:text-primary transition-all spectral-ring disabled:opacity-30 disabled:cursor-not-allowed"
        whileHover={hasPrevious ? { scale: 1.1 } : undefined}
        whileTap={hasPrevious ? { scale: 0.9 } : undefined}
        aria-label="Previous profile"
      >
        <ChevronLeft size={20} />
      </motion.button>

      <span className="text-xs text-muted">
        {currentIndex + 1} / {profiles.length}
      </span>

      <motion.button
        onClick={goToNext}
        disabled={!hasNext}
        className="p-2 rounded-full hover:bg-[rgba(36,46,78,0.85)] text-secondary hover:text-primary transition-all spectral-ring disabled:opacity-30 disabled:cursor-not-allowed"
        whileHover={hasNext ? { scale: 1.1 } : undefined}
        whileTap={hasNext ? { scale: 0.9 } : undefined}
        aria-label="Next profile"
      >
        <ChevronRight size={20} />
      </motion.button>
    </div>
  );
}






