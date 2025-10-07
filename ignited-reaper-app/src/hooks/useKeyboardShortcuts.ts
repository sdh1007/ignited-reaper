import { useEffect } from "react";

export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;

      const shortcut = ctrl ? `Ctrl+${key}` : key;

      if (handlers[shortcut]) {
        e.preventDefault();
        handlers[shortcut]();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handlers]);
}






