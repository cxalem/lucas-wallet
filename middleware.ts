import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createI18nMiddleware } from "next-international/middleware";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "es", "fr", "pcm"],
  defaultLocale: "en",
});

export async function middleware(request: NextRequest) {
  // First handle the session update
  const sessionResponse = await updateSession(request);

  // If we got a redirect response from the session update, return it
  if (sessionResponse && sessionResponse.status !== 200) {
    return sessionResponse;
  }

  // Otherwise, apply the i18n middleware
  return I18nMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
