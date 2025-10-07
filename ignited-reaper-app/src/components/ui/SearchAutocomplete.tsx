"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCemeteryStore } from "@/store/cemetery";
import type { SocialProfile } from "@/lib/types";
import Image from "next/image";

interface SearchAutocompleteProps {
  query: string;
  onSelect: (profileId: string) => void;
  onClose: () => void;
}

interface SearchResult {
  profile: SocialProfile;
  score: number;
  matchType: "name" | "handle" | "bio" | "tag";
  matchText: string;
}

export function SearchAutocomplete({
  query,
  onSelect,
  onClose,
}: SearchAutocompleteProps) {
  const { profiles } = useCemeteryStore();
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const results = predictiveSearch(query, profiles);
    setSuggestions(results);
    setSelectedIndex(-1);
  }, [query, profiles]);

  const predictiveSearch = (
    query: string,
    profiles: SocialProfile[]
  ): SearchResult[] => {
    const normalized = query.toLowerCase().trim();

    const results = profiles.map((profile) => {
      let score = 0;
      let matchType: SearchResult["matchType"] = "bio";
      let matchText = "";

      // Display name matching
      if (profile.displayName.toLowerCase().includes(normalized)) {
        score += 10;
        matchType = "name";
        matchText = profile.displayName;
        if (profile.displayName.toLowerCase().startsWith(normalized)) {
          score += 5;
        }
      }

      // Handle matching
      if (profile.handle.toLowerCase().includes(normalized)) {
        score += 8;
        matchType = "handle";
        matchText = profile.handle;
      }

      // Tag matching
      const matchingTag = profile.tags.find((tag) =>
        tag.toLowerCase().includes(normalized)
      );
      if (matchingTag) {
        score += 6;
        matchType = "tag";
        matchText = matchingTag;
      }

      // Bio matching
      if (profile.bio.toLowerCase().includes(normalized)) {
        score += 4;
      }

      return { profile, score, matchType, matchText };
    });

    return results
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  };

  const highlightMatch = (text: string, query: string) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <span className="font-semibold text-[#4A90A4]">
          {text.substring(index, index + query.length)}
        </span>
        {text.substring(index + query.length)}
      </>
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!suggestions.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            onSelect(suggestions[selectedIndex].profile.id);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [suggestions, selectedIndex, onSelect, onClose]);

  if (!suggestions.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="absolute z-50 mt-2 w-full rounded-xl border border-[var(--surface-border)] bg-[rgba(15,22,36,0.95)] backdrop-blur-xl shadow-moon-mist overflow-hidden"
        role="listbox"
        aria-label="Search suggestions"
      >
        <div className="max-h-80 overflow-y-auto">
          {suggestions.map((result, index) => (
            <motion.button
              key={result.profile.id}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => onSelect(result.profile.id)}
              className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 ${
                index === selectedIndex
                  ? "bg-[rgba(74,144,164,0.15)]"
                  : "hover:bg-[rgba(74,144,164,0.08)]"
              }`}
              whileHover={{ x: 4 }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full border-2 overflow-hidden flex-shrink-0 relative"
                style={{ borderColor: result.profile.color }}
              >
                <Image
                  src={result.profile.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-primary truncate">
                  {highlightMatch(result.profile.displayName, query)}
                </div>
                <div className="text-xs text-secondary truncate">
                  {result.matchType === "handle" && (
                    <>{highlightMatch(result.profile.handle, query)}</>
                  )}
                  {result.matchType === "tag" && (
                    <>#{highlightMatch(result.matchText, query)}</>
                  )}
                  {result.matchType === "bio" && <>{result.profile.platform}</>}
                  {result.matchType === "name" && <>{result.profile.handle}</>}
                </div>
              </div>

              {/* Platform indicator */}
              <div
                className="px-2 py-1 rounded text-xs font-semibold"
                style={{
                  backgroundColor: result.profile.color,
                  color: "#0a0b16",
                }}
              >
                {result.profile.platform}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}






