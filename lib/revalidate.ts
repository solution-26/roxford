import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Demande le rafraîchissement immédiat des pages publiques après une
 * modification faite dans l'administration.
 *
 * Volontairement silencieux en cas d'échec : la page se régénérera de
 * toute façon dans la minute (revalidate = 60). Mieux vaut un délai
 * qu'un message d'erreur sur un enregistrement qui, lui, a réussi.
 */
export async function revalidatePublicPages(supabase: SupabaseClient) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    await fetch("/api/revalidate", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
  } catch {
    // Sans conséquence : le délai d'une minute prend le relais.
  }
}
