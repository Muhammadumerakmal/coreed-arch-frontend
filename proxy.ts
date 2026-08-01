import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The backend sets a host-only `accessToken` cookie on "localhost", which the browser also
// sends to the Next.js server. We use its presence as a lightweight auth guard (the backend
// still does real JWT verification on every API call).

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/subtasks",
  "/notes",
  "/members",
  "/ai-assistant",
  "/calendar",
  "/reports",
  "/profile",
  "/settings",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = Boolean(req.cookies.get("accessToken")?.value);
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!hasToken && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasToken && (isAuthPage || pathname === "/")) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/subtasks/:path*",
    "/notes/:path*",
    "/members/:path*",
    "/ai-assistant/:path*",
    "/calendar/:path*",
    "/reports/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
