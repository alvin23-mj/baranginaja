"use client";

import { useEffect, useState, useRef } from "react";

function SunIcon({ className = "h-4 w-4 text-amber-500" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className = "h-4 w-4 text-indigo-400" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleThemeChange(nextTheme: "light" | "dark") {
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setIsOpen(false);
  }

  if (!mounted) {
    return (
      <div
        className={`h-8 w-36 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className}`}
      />
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/70 transition-colors"
        aria-label="Pilih Mode Tema"
      >
        {theme === "dark" ? (
          <>
            <MoonIcon />
            <span>Mode Malam</span>
          </>
        ) : (
          <>
            <SunIcon />
            <span>Mode Siang</span>
          </>
        )}
        <svg
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-50 animate-in fade-in zoom-in-95 duration-100">
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => handleThemeChange("light")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              theme === "light"
                ? "bg-zinc-100 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
            }`}
          >
            <SunIcon />
            <span>Mode Siang (Terang)</span>
          </button>
          <button
            suppressHydrationWarning
            type="button"
            onClick={() => handleThemeChange("dark")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              theme === "dark"
                ? "bg-zinc-100 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
            }`}
          >
            <MoonIcon />
            <span>Mode Malam (Gelap)</span>
          </button>
        </div>
      )}
    </div>
  );
}

