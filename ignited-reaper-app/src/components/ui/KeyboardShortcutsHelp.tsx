"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "?") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen]);

  const shortcuts = [
    { key: "?", description: "Show this help" },
    { key: "/", description: "Focus search bar" },
    { key: "Escape", description: "Close panels/modals" },
    { key: "n", description: "Toggle day/night mode" },
    { key: "g", description: "Toggle grid/3D view" },
    { key: "↑↓", description: "Navigate search results" },
    { key: "Enter", description: "Select search result" },
    { key: "Tab", description: "Navigate interactive elements" },
  ];

  return (
    <>
      {/* Help button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-panel)] px-4 py-3 text-sm text-primary shadow-moon-mist backdrop-blur-xl hover:bg-[rgba(26,33,56,0.95)] transition-all spectral-ring"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard size={18} />
        <span className="hidden sm:inline">Shortcuts</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-panel)] p-6 shadow-moon-mist backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="shortcuts-title"
            >
              {/* Atmospheric effects */}
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(238,90,111,0.08),_transparent_60%)] pointer-events-none" />

              {/* Header */}
              <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-ember-500/35 bg-[rgba(33,28,45,0.75)] text-ember-300">
                    <Keyboard size={20} />
                  </div>
                  <h2
                    id="shortcuts-title"
                    className="text-xl font-semibold text-primary"
                  >
                    Keyboard Shortcuts
                  </h2>
                </div>

                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-[rgba(36,46,78,0.85)] text-secondary hover:text-primary transition-all spectral-ring"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close shortcuts help"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Shortcuts list */}
              <div className="relative space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <motion.div
                    key={shortcut.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-translucent)] border border-[var(--surface-border)] hover:border-ember-400/30 transition-all"
                  >
                    <span className="text-sm text-secondary">
                      {shortcut.description}
                    </span>
                    <kbd className="px-3 py-1.5 text-xs font-semibold text-primary bg-[rgba(26,33,56,0.75)] border border-[var(--surface-border)] rounded shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </motion.div>
                ))}
              </div>

              {/* Footer tip */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative mt-6 text-xs text-center text-muted uppercase tracking-[0.3em]"
              >
                Press ? to toggle this help
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}






