import { createClient } from "@supabase/supabase-js";

/**
 * Initializes and exports the Supabase client using environment variables.
 * 
 * Uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for browser compatibility in Qwik/Vite projects.
 * This configuration ensures that only variables with a VITE_ prefix are exposed to the frontend.
 * 
 * @public
 */

// PUBLIC_INTERFACE
export const supabase = (() => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // eslint-disable-next-line no-console
    console.error(
      "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Please create a .env file with these variables in your notes_frontend root. See README for setup."
    );
  }

  return createClient(url, anonKey);
})();
