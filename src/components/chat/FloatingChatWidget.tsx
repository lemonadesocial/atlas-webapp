"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChatContainer } from "./ChatContainer";

export function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isOnChatPage = pathname === "/chat";

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Hide widget on the dedicated /chat page
  if (isOnChatPage) return null;

  return (
    <>
      {/* Chat panel */}
      {open && (
        <>
          {/* Mobile: full-screen overlay */}
          <div
            className="fixed inset-0 z-[60] flex flex-col bg-background md:hidden"
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
            <ChatContainer className="flex-1" />
          </div>

          {/* Desktop: side panel */}
          <div
            className="fixed bottom-20 right-4 z-[60] hidden h-[600px] w-[400px] flex-col overflow-hidden rounded-xl border border-divider bg-background shadow-2xl md:flex"
            role="dialog"
            aria-label="Chat"
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
                  width="18"
                  height="18"
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
            <ChatContainer className="flex-1" />
          </div>
        </>
      )}

      {/* Floating button */}
      <button
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
