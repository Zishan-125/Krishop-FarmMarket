
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token) {
    return NextResponse.next();
  }

  // API calls must receive JSON, not a login-page redirect.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { message: "Please log in to use this feature." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "callbackUrl",
    request.nextUrl.pathname + request.nextUrl.search
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/farmmarket/:path*",
    "/api/farmmarket/:path*",
  ],
};
