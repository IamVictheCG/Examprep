import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED = ["/dashboard", "/exam/", "/account"];
const AUTH_ONLY  = ["/login", "/register"];

// Supabase env vars are required only after Backend Phase 1 is wired up.
// Until then, skip auth enforcement so all routes remain accessible.
const SUPABASE_READY =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http");

export async function middleware(request: NextRequest) {
  if (!SUPABASE_READY) {
    return NextResponse.next({ request });
  }

  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY.some((p) => pathname.startsWith(p));

  // Unauthenticated → redirect to login
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated → skip auth pages
  if (isAuthOnly && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
