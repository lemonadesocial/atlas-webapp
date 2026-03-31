import "server-only";

import { cookies } from "next/headers";

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("atlas_session");
  cookieStore.delete("atlas_refresh");
}
