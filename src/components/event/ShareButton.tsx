"use client";

import { useState, useEffect, useRef } from "react";
import { STRINGS } from "@/lib/utils/constants";

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // M18: Escape to close + click-outside handler
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md bg-btn-tertiary px-3 py-2 text-sm text-btn-tertiary-content transition-colors hover:bg-btn-tertiary-hover"
        aria-label="Share event"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-card-border bg-overlay-primary p-2 shadow-lg"
          role="menu"
        >
          <button
            onClick={copyLink}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-secondary hover:bg-card-hover"
            role="menuitem"
          >
            {copied ? "Copied!" : STRINGS.shareLink}
          </button>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-secondary hover:bg-card-hover"
            role="menuitem"
          >
            {STRINGS.shareTwitter}
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-secondary hover:bg-card-hover"
            role="menuitem"
          >
            {STRINGS.shareWhatsApp}
          </a>
        </div>
      )}
    </div>
  );
}
