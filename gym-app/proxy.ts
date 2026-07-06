import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const adminPaths = ["/dashboard", "/members", "/payments", "/expenses", "/attendance", "/settings"];
const onboardingPath = "/onboarding";

function isPathMatch(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (isPathMatch(pathname, adminPaths) || pathname === onboardingPath) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|access-denied).*)",
  ],
};
