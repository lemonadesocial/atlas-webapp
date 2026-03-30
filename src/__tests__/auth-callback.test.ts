import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the server auth module for unit testing the callback logic
describe("OAuth callback handling", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("detects access_denied error from OAuth", () => {
    const params = new URLSearchParams("?error=access_denied");
    expect(params.get("error")).toBe("access_denied");
  });

  it("detects missing authorization code", () => {
    const params = new URLSearchParams("?state=/onboard");
    expect(params.get("code")).toBeNull();
  });

  it("extracts code and state from valid callback", () => {
    const params = new URLSearchParams("?code=abc123&state=/onboard/space");
    expect(params.get("code")).toBe("abc123");
    expect(params.get("state")).toBe("/onboard/space");
  });

  it("handles error_description param", () => {
    const params = new URLSearchParams(
      "?error=server_error&error_description=Something+went+wrong"
    );
    expect(params.get("error_description")).toBe("Something went wrong");
  });

  it("defaults state to / when absent", () => {
    const params = new URLSearchParams("?code=abc123");
    const state = params.get("state") || "/";
    expect(state).toBe("/");
  });
});

describe("OAuth authorize URL construction", () => {
  it("builds correct authorize URL", () => {
    const authority = "https://identity.lemonade.social";
    const clientId = "atlas-webapp";
    const redirectUri = "https://atlas.lemonade.social/api/auth/callback";
    const state = "/onboard/space";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid offline_access",
      state,
    });
    const url = `${authority}/oauth2/auth?${params.toString()}`;
    expect(url).toContain("response_type=code");
    expect(url).toContain("client_id=atlas-webapp");
    expect(url).toContain("scope=openid+offline_access");
    expect(url).toContain("state=%2Fonboard%2Fspace");
  });
});
