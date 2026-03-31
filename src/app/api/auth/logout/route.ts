import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearAuthCookies } from "@/lib/server/auth";

const KRATOS_PUBLIC_URL = process.env.NEXT_PUBLIC_KRATOS_PUBLIC_URL || "";

export async function POST() {
  // Invalidate Kratos session server-side (no CORS issues)
  try {
    const cookieStore = await cookies();
    const kratosSessionCookie = cookieStore.get("ory_kratos_session_staging")?.value
      || cookieStore.get("ory_kratos_session")?.value;

    if (KRATOS_PUBLIC_URL && kratosSessionCookie) {
      const logoutFlowRes = await fetch(`${KRATOS_PUBLIC_URL}/self-service/logout/browser`, {
        headers: { Cookie: `ory_kratos_session_staging=${kratosSessionCookie}` },
      });
      if (logoutFlowRes.ok) {
        const data = await logoutFlowRes.json();
        if (data.logout_token) {
          await fetch(`${KRATOS_PUBLIC_URL}/self-service/logout?token=${data.logout_token}`, {
            headers: { Cookie: `ory_kratos_session_staging=${kratosSessionCookie}` },
          });
        }
      }
    }
  } catch {
    // Continue with cookie cleanup even if Kratos call fails
  }

  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
