import { describe, it, expect, vi, afterEach } from "vitest";
import { graphqlRequest } from "@/lib/services/graphql-client";

describe("Connector error handling", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("handles connectPlatform returning no authUrl", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: {
            connectPlatform: {
              connectionId: "conn_1",
              requiresApiKey: false,
              authUrl: null,
            },
          },
        }),
    });

    const result = await graphqlRequest<{
      connectPlatform: { connectionId: string; requiresApiKey: boolean; authUrl: string | null };
    }>("mutation { connectPlatform(input: {}) { connectionId requiresApiKey authUrl } }");

    expect(result.data?.connectPlatform.authUrl).toBeNull();
    expect(result.data?.connectPlatform.connectionId).toBe("conn_1");
  });

  it("handles submitApiKey returning disabled (invalid key)", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: {
            submitApiKey: {
              id: "conn_1",
              connectorType: "luma",
              status: "error",
              enabled: false,
            },
          },
        }),
    });

    const result = await graphqlRequest<{
      submitApiKey: { id: string; status: string; enabled: boolean };
    }>("mutation { submitApiKey(input: {}) { id status enabled } }");

    expect(result.data?.submitApiKey.enabled).toBe(false);
    expect(result.data?.submitApiKey.status).toBe("error");
  });

  it("handles GraphQL errors in connector mutations", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: null,
          errors: [{ message: "Space not found" }],
        }),
    });

    const result = await graphqlRequest("mutation { connectPlatform(input: {}) { connectionId } }");
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toBe("Space not found");
    expect(result.data).toBeNull();
  });

  it("handles network failure gracefully", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    await expect(
      graphqlRequest("mutation { connectPlatform(input: {}) { connectionId } }")
    ).rejects.toThrow("Network error");
  });

  it("handles requiresApiKey flow for Lu.ma", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: {
            connectPlatform: {
              connectionId: "conn_luma_1",
              requiresApiKey: true,
              authUrl: null,
            },
          },
        }),
    });

    const result = await graphqlRequest<{
      connectPlatform: { connectionId: string; requiresApiKey: boolean; authUrl: string | null };
    }>("mutation { connectPlatform(input: {}) { connectionId requiresApiKey authUrl } }");

    expect(result.data?.connectPlatform.requiresApiKey).toBe(true);
    expect(result.data?.connectPlatform.connectionId).toBe("conn_luma_1");
  });
});
