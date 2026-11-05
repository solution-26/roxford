import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Rafraîchit les pages publiques à la demande.
 *
 * Sans cela, une modification faite dans /admin met jusqu'à une minute
 * à apparaître (revalidate = 60), et comme Next sert la version périmée
 * pendant qu'il régénère, il faut même recharger deux fois. Le
 * propriétaire croit alors que son enregistrement n'a pas pris.
 *
 * Réservé aux administrateurs : l'appelant doit présenter son jeton
 * Supabase, et figurer dans admin_users. Sans ce contrôle, n'importe
 * qui pourrait vider le cache en boucle.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { revalidated: false, reason: "Supabase non configuré" },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return NextResponse.json(
      { revalidated: false, reason: "Jeton manquant" },
      { status: 401 },
    );
  }

  // Client porteur du jeton de l'appelant : is_admin() s'évalue donc
  // bien pour lui, et non pour un utilisateur anonyme.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      { revalidated: false, reason: "Jeton invalide" },
      { status: 401 },
    );
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (adminError || isAdmin !== true) {
    return NextResponse.json(
      { revalidated: false, reason: "Compte non administrateur" },
      { status: 403 },
    );
  }

  revalidatePath("/");
  revalidatePath("/carte");

  return NextResponse.json({ revalidated: true, at: Date.now() });
}
