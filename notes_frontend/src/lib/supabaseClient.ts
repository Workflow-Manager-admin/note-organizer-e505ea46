import { createClient } from "@supabase/supabase-js";

/**
 * Loads Supabase API credentials from environment variables.
 * In Qwik, variables must be prefixed with VITE_ to be exposed to client (Vite convention).
 */
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Warn if keys are missing
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    "[Supabase] URL or ANON KEY not set. Ensure you have .env variables 'VITE_SUPABASE_URL' and 'VITE_SUPABASE_ANON_KEY' defined and exposed."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
