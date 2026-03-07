import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Routes each role is redirected to after login
const ROLE_HOME: Record<string, string> = {
	super_admin: "/admin",
	org_admin:   "/dashboard",
	expert:      "/workspace",
	member:      "/learn",
	user:        "/pending",       // awaiting approval
};

// Auth pages — redirect away if already signed in
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];

// Route prefixes that require a session
const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/workspace", "/learn", "/pending"];

// Minimum role required to enter a prefix
const PROTECTED_ACCESS: { prefix: string; roles: string[] }[] = [
	{ prefix: "/admin",     roles: ["super_admin"] },
	{ prefix: "/dashboard", roles: ["super_admin", "org_admin"] },
	{ prefix: "/workspace", roles: ["super_admin", "org_admin", "expert"] },
	{ prefix: "/learn",     roles: ["super_admin", "org_admin", "expert", "member"] },
	{ prefix: "/pending",   roles: ["user"] },
];

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const session = await auth.api.getSession({ headers: request.headers });
	const role = (session?.user as any)?.role as string | undefined;

	const isAuthenticated = !!session;
	const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
	const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

	// 1. Redirect logged-in users away from auth pages → their role home
	if (isAuthenticated && isAuthRoute) {
		const home = ROLE_HOME[role ?? ""] ?? "/";
		return NextResponse.redirect(new URL(home, request.url));
	}

	// 2. Redirect unauthenticated users away from protected pages
	if (!isAuthenticated && isProtected) {
		const url = request.nextUrl.clone();
		url.pathname = "/auth/sign-in";
		url.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(url);
	}

	// 3. Role-based access guard — wrong role for a section
	if (isAuthenticated && isProtected && role) {
		const section = PROTECTED_ACCESS.find((p) => pathname.startsWith(p.prefix));
		if (section && !section.roles.includes(role)) {
			// Redirect to their correct home rather than a 403
			const home = ROLE_HOME[role] ?? "/";
			return NextResponse.redirect(new URL(home, request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths EXCEPT:
		 * - _next/static, _next/image
		 * - favicon.ico
		 * - /api/auth (Better Auth routes)
		 * - public files (.png, .svg, etc.)
		 */
		"/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
