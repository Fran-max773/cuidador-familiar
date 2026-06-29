import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (typeof window !== "undefined") {
  console.log("[Supabase] url length:", url.length, "key length:", key.length,
    "key prefix:", key.substring(0, 15),
    "url ok:", /^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url),
    "key ok:", /^[a-zA-Z0-9._-]+$/.test(key));
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
