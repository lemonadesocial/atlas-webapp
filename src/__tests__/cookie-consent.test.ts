import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCookieConsent } from "@/lib/hooks/useCookieConsent";

describe("useCookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts as undecided", () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.consent).toBe("undecided");
  });

  it("accept sets consent to accepted and stores in localStorage", () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.accept();
    });

    expect(result.current.consent).toBe("accepted");
    expect(localStorage.getItem("atlas_cookie_consent")).toBe("accepted");
  });

  it("reject sets consent to rejected and stores in localStorage", () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.reject();
    });

    expect(result.current.consent).toBe("rejected");
    expect(localStorage.getItem("atlas_cookie_consent")).toBe("rejected");
  });

  it("reads existing consent from localStorage", () => {
    localStorage.setItem("atlas_cookie_consent", "accepted");
    const { result } = renderHook(() => useCookieConsent());

    // After useEffect fires
    expect(result.current.loaded).toBe(true);
    expect(result.current.consent).toBe("accepted");
  });

  it("loaded becomes true after mount", () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.loaded).toBe(true);
  });
});
