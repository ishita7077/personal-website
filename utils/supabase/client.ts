import { createBrowserClient } from "@supabase/ssr";
import { logger } from "@/lib/logger";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    logger.warn("supabase/client", "Supabase URL or anon key missing; client disabled", { hasUrl: !!url, hasKey: !!key });
    return null;
  }
  try {
    return createBrowserClient(url, key);
  } catch (e) {
    logger.error("supabase/client", "createBrowserClient failed", e);
    return null;
  }
}