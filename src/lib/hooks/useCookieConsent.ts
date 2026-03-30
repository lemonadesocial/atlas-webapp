"use client";

import { useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "@/lib/utils/storage";

type ConsentState = "undecided" | "accepted" | "rejected";

const STORAGE_KEY = "atlas_cookie_consent";

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState>("undecided");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = getItem(STORAGE_KEY);
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    }
    setLoaded(true);
  }, []);

  const accept = useCallback(() => {
    setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
  }, []);

  const reject = useCallback(() => {
    setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
  }, []);

  return { consent, loaded, accept, reject };
}
