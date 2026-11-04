"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Client Supabase côté navigateur (utilisé par l'administration).
 * Renvoie null si les variables d'environnement ne sont pas renseignées,
 * ce qui permet à l'interface d'afficher un message clair plutôt que de planter.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
