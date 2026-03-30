"use client";

import { useRef, FormEvent } from "react";
import { STRINGS } from "@/lib/utils/constants";

interface SearchBarProps {
  defaultValue?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({ defaultValue = "", onSearch }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(inputRef.current?.value.trim() ?? "");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex rounded-lg border border-card-border bg-card">
        <div className="flex items-center pl-3 text-quaternary">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          defaultValue={defaultValue}
          placeholder={STRINGS.searchPlaceholder}
          className="flex-1 bg-transparent px-3 py-3 text-sm text-primary placeholder:text-quaternary focus:outline-none"
          aria-label="Search events"
        />
        <button
          type="submit"
          className="rounded-r-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Search
        </button>
      </div>
    </form>
  );
}
