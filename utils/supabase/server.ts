import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    logger.warn("supabase/server", "Supabase URL or anon key missing; server client disabled", { hasUrl: !!url, hasKey: !!key });
    return null;
  }

  const cookieStore = await cookies();

  try {
    return createServerClient(url, key, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component cookie set - can be ignored
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Server Component cookie remove - can be ignored
          }
        },
      },
    });
  } catch (e) {
    logger.error("supabase/server", "createServerClient failed", e);
    return null;
  }
}
