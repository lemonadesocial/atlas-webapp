"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChatContainer } from "./ChatContainer";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isOnChatPage = pathname === "/chat";

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  // Focus management: move focus into panel on open, return to button on close
  useEffect(() => {
    if (open) {
      // Small delay so the panel is rendered before focusing
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      buttonRef.current?.focus();
    }
  }, [open]);

  // Close on Escape + focus trap
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      // Focus trap: cycle Tab within the panel
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;

        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (isOnChatPage) return null;

  return (
    <>
      {/* Single chat panel, responsive styling */}
      {open && (
        <div
          ref={panelRef}
          className="fixed inset-0 z-[55] flex flex-col bg-background md:inset-auto md:bottom-20 md:right-4 md:h-[600px] md:w-[400px] md:rounded-xl md:border md:border-divider md:shadow-2xl"
          role="dialog"
          aria-label="Chat"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-divider px-4 py-3">
            <span className="text-sm font-semibold text-primary font-display">
              Atlas Chat
            </span>
            <button
              onClick={toggle}
              className="rounded-md p-1 text-secondary transition-colors hover:text-primary"
              aria-label="Close chat"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <ChatContainer className="flex-1" inputRef={inputRef} />
        </div>
      )}

      {/* Floating button */}
      <button
        ref={buttonRef}
        onClick={toggle}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
      >
        {open ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
