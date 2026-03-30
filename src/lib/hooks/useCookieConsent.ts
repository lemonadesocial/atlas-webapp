"use client";

import { useState, useEffect, useCallback } from "react";

type ConsentState = "undecided" | "accepted" | "rejected";

const STORAGE_KEY = "atlas_cookie_consent";

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState>("undecided");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    }
    setLoaded(true);
  }, []);

  const accept = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
  }, []);

  const reject = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
  }, []);

  return { consent, loaded, accept, reject };
}
