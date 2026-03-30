import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { graphqlRequest } from "@/lib/services/graphql-client";

describe("graphqlRequest", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends GraphQL request to /api/graphql", async () => {
    const mockResponse = { data: { getMe: { _id: "123", username: "test" } } };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await graphqlRequest("query { getMe { _id username } }");
    expect(result).toEqual(mockResponse);
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "query { getMe { _id username } }" }),
    });
  });

  it("retries on 401 by refreshing token", async () => {
    const mockResponse = { data: { getMe: { _id: "123" } } };
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/graphql") {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ ok: false, status: 401 });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
        });
      }
      if (url === "/api/auth/refresh") {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });

    const result = await graphqlRequest("query { getMe { _id } }");
    expect(result).toEqual(mockResponse);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3); // original + refresh + retry
  });

  it("throws on 401 when refresh also fails", async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/graphql") {
        return Promise.resolve({ ok: false, status: 401 });
      }
      if (url === "/api/auth/refresh") {
        return Promise.resolve({ ok: false, status: 401 });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });

    await expect(graphqlRequest("query { getMe { _id } }")).rejects.toThrow(
      "Session expired"
    );
  });

  it("throws on non-401 error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(graphqlRequest("query { getMe { _id } }")).rejects.toThrow(
      "GraphQL request failed: 500"
    );
  });

  it("passes variables to request body", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: {} }),
    });

    await graphqlRequest("mutation($input: AISpaceInput!) { aiCreateSpace(input: $input) { _id } }", {
      input: { title: "Test Space" },
    });

    const body = JSON.parse(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
    );
    expect(body.variables).toEqual({ input: { title: "Test Space" } });
  });
});
