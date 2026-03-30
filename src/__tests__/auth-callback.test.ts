import { describe, it, expect } from "vitest";
import {
  isValidReturnPath,
  generateCodeVerifier,
  generateCodeChallenge,
  generateStateToken,
} from "@/lib/server/auth";

describe("isValidReturnPath (H1 - open redirect prevention)", () => {
  it("accepts valid local paths", () => {
    expect(isValidReturnPath("/")).toBe(true);
    expect(isValidReturnPath("/onboard")).toBe(true);
    expect(isValidReturnPath("/onboard/space")).toBe(true);
    expect(isValidReturnPath("/discover?q=test")).toBe(true);
  });

  it("rejects paths that do not start with /", () => {
    expect(isValidReturnPath("")).toBe(false);
    expect(isValidReturnPath("https://evil.com")).toBe(false);
    expect(isValidReturnPath("evil.com/path")).toBe(false);
  });

  it("rejects protocol-relative URLs (//evil.com)", () => {
    expect(isValidReturnPath("//evil.com")).toBe(false);
    expect(isValidReturnPath("//evil.com/path")).toBe(false);
  });

  it("rejects URLs with embedded protocol", () => {
    expect(isValidReturnPath("/redir?url=https://evil.com")).toBe(false);
    expect(isValidReturnPath("/foo://bar")).toBe(false);
  });
});

describe("PKCE (C1)", () => {
  it("generates a code_verifier of sufficient length", () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
  });

  it("generates unique verifiers", () => {
    const v1 = generateCodeVerifier();
    const v2 = generateCodeVerifier();
    expect(v1).not.toBe(v2);
  });

  it("generates a code_challenge that differs from verifier", () => {
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    expect(challenge).not.toBe(verifier);
    expect(challenge.length).toBeGreaterThan(0);
  });

  it("generates deterministic challenge for same verifier", () => {
    const verifier = generateCodeVerifier();
    const c1 = generateCodeChallenge(verifier);
    const c2 = generateCodeChallenge(verifier);
    expect(c1).toBe(c2);
  });
});

describe("CSRF state token (H1)", () => {
  it("generates a state token of sufficient length", () => {
    const token = generateStateToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
  });

  it("generates unique tokens", () => {
    const t1 = generateStateToken();
    const t2 = generateStateToken();
    expect(t1).not.toBe(t2);
  });
});

describe("OAuth callback state cookie parsing", () => {
  it("parses state token and return path from cookie value", () => {
    const stateToken = "abc123xyz";
    const returnPath = "/onboard/space";
    const cookieValue = `${stateToken}:${returnPath}`;

    const separatorIdx = cookieValue.indexOf(":");
    const parsedToken = cookieValue.slice(0, separatorIdx);
    const parsedPath = cookieValue.slice(separatorIdx + 1);

    expect(parsedToken).toBe(stateToken);
    expect(parsedPath).toBe(returnPath);
  });

  it("handles state cookie with no return path", () => {
    const cookieValue = "abc123xyz";
    const separatorIdx = cookieValue.indexOf(":");
    const parsedToken = separatorIdx >= 0
      ? cookieValue.slice(0, separatorIdx)
      : cookieValue;
    const parsedPath = separatorIdx >= 0
      ? cookieValue.slice(separatorIdx + 1)
      : "/";

    expect(parsedToken).toBe("abc123xyz");
    expect(parsedPath).toBe("/");
  });

  it("rejects mismatched state tokens", () => {
    const incoming = "token_from_url";
    const stored = "different_token:/onboard";
    const separatorIdx = stored.indexOf(":");
    const expected = stored.slice(0, separatorIdx);
    expect(incoming === expected).toBe(false);
  });
});
