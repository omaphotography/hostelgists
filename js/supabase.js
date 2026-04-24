import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://pkbyrrjvgaspclslthuf.supabase.co";
const supabaseKey = "sb_publishable_EqoT7CZIDt9k_j7B729dZA_OIOEboi1";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});