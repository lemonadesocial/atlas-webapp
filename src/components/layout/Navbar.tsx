"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/lib/hooks/useTheme";
import { useAuth } from "@/lib/hooks/useAuth";
import { STRINGS, LEMONADE_APP_URL } from "@/lib/utils/constants";

function MobileSignOut({ onClose }: { onClose: () => void }) {
  const { signOut } = useAuth();
  return (
    <button
      onClick={() => {
        onClose();
        signOut();
      }}
      className="rounded-md px-3 py-2 text-left text-sm text-secondary transition-colors hover:bg-btn-tertiary hover:text-primary"
    >
      {STRINGS.signOut}
    </button>
  );
}

function UserDropdown() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.display_name || user.username || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-secondary transition-colors hover:bg-btn-tertiary hover:text-primary"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.image_avatar ? (
          <Image
            src={user.image_avatar}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
            {initial}
          </span>
        )}
        <span className="hidden md:inline">{displayName}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-48 rounded-md border border-divider bg-background shadow-lg"
          role="menu"
        >
          <Link
            href={`${LEMONADE_APP_URL}/dashboard`}
            className="block w-full px-4 py-2 text-left text-sm text-secondary hover:bg-btn-tertiary hover:text-primary"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {STRINGS.myEvents}
          </Link>
          <a
            href={`${LEMONADE_APP_URL}/dashboard`}
            className="block w-full px-4 py-2 text-left text-sm text-secondary hover:bg-btn-tertiary hover:text-primary"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {STRINGS.dashboard}
          </a>
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="block w-full px-4 py-2 text-left text-sm text-secondary hover:bg-btn-tertiary hover:text-primary"
            role="menuitem"
          >
            {STRINGS.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading, signIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-divider bg-background/80 backdrop-blur-lg">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-primary font-display"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="14" cy="14" r="14" fill="currentColor" opacity="0.1" />
            <path
              d="M14 4L24 20H4L14 4Z"
              fill="currentColor"
              opacity="0.8"
            />
          </svg>
          Atlas
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/discover"
            className="text-sm text-secondary transition-colors hover:text-primary"
          >
            Explore
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm text-secondary transition-colors hover:text-primary"
          >
            Leaderboard
          </Link>
          <Link
            href="/docs"
            className="text-sm text-secondary transition-colors hover:text-primary"
          >
            Docs
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-md p-2 text-secondary transition-colors hover:bg-btn-tertiary hover:text-primary"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Auth: user dropdown or sign in button */}
          {!loading && (
            <>
              {user ? (
                <UserDropdown />
              ) : (
                <button
                  onClick={() => signIn()}
                  className="hidden rounded-md bg-btn-secondary px-4 py-2 text-sm font-medium text-btn-secondary-content transition-colors hover:bg-btn-secondary-hover md:inline-flex"
                >
                  {STRINGS.signIn}
                </button>
              )}
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-secondary transition-colors hover:bg-btn-tertiary md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-divider bg-background px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/discover"
              className="rounded-md px-3 py-2 text-sm text-secondary transition-colors hover:bg-btn-tertiary hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Explore
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-md px-3 py-2 text-sm text-secondary transition-colors hover:bg-btn-tertiary hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Leaderboard
            </Link>
            <Link
              href="/docs"
              className="rounded-md px-3 py-2 text-sm text-secondary transition-colors hover:bg-btn-tertiary hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Docs
            </Link>
            {!loading && !user && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signIn();
                }}
                className="rounded-md px-3 py-2 text-left text-sm text-secondary transition-colors hover:bg-btn-tertiary hover:text-primary"
              >
                {STRINGS.signIn}
              </button>
            )}
            {!loading && user && (
              <>
                <Link
                  href={`${LEMONADE_APP_URL}/dashboard`}
                  className="rounded-md px-3 py-2 text-sm text-secondary transition-colors hover:bg-btn-tertiary hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {STRINGS.myEvents}
                </Link>
                <MobileSignOut onClose={() => setMobileOpen(false)} />
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
