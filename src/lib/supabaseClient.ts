import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lovable Supabase integration: if connected, these globals will be provided.
// We guard against missing values so the app still renders with guidance.
const SUPABASE_URL = (window as any).__SUPABASE_URL__ || "";
const SUPABASE_ANON_KEY = (window as any).__SUPABASE_ANON_KEY__ || "";

let client: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = client;
export const hasSupabase = !!client;
