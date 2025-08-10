import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    __SUPABASE_URL__?: string;
    __SUPABASE_ANON_KEY__?: string;
  }
}

// Lovable Supabase integration: if connected, these globals will be provided.
// We guard against missing values so the app still renders with guidance.
const SUPABASE_URL = window.__SUPABASE_URL__ || "";
const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || "";

let client: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = client;
export const hasSupabase = !!client;
