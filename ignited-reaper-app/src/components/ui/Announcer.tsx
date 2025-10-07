"use client";

import { useEffect, useState } from "react";
import { useCemeteryStore } from "@/store/cemetery";

export function Announcer() {
  const [message, setMessage] = useState("");
  const { searchQuery, filteredProfiles } = useCemeteryStore();

  useEffect(() => {
    const results = filteredProfiles();
    if (searchQuery) {
      setMessage(`${results.length} spirits found`);
      setTimeout(() => setMessage(""), 1000);
    }
  }, [searchQuery, filteredProfiles]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}






