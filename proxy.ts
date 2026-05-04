import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/kiosk(.*)",
  "/api/activation-codes",
  "/api/activation-codes/list",
  "/api/activation-codes/:code",
  "/api/activation-codes/:code/revoke",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/kiosk(.*)",
    "/api/activation-codes(.*)",
  ],
};
