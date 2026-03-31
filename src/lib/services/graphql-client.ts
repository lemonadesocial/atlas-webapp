import { LEMONADE_BACKEND_URL } from "@/lib/utils/constants";

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function graphqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const res = await fetch(`${LEMONADE_BACKEND_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status}`);
  }

  return res.json();
}
