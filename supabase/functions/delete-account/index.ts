import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(token);

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = user.id;

  const { data: deckIds } = await adminClient
    .from("decks")
    .select("id")
    .eq("user_id", userId);

  const deckIdList = (deckIds ?? []).map((d: { id: string }) => d.id);

  if (deckIdList.length > 0) {
    const { data: cardIds } = await adminClient
      .from("cards")
      .select("id")
      .in("deck_id", deckIdList);

    const cardIdList = (cardIds ?? []).map((c: { id: string }) => c.id);

    if (cardIdList.length > 0) {
      await adminClient.from("revlog").delete().in("card_id", cardIdList);
      await adminClient.from("card_state").delete().in("card_id", cardIdList);
      await adminClient.from("cards").delete().in("deck_id", deckIdList);
    }

    await adminClient.from("session_log").delete().eq("user_id", userId);
    await adminClient.from("decks").delete().eq("user_id", userId);
  }

  await adminClient.from("profiles").delete().eq("id", userId);

  await adminClient.storage.from("avatars").remove([`${userId}/`]);
  await adminClient.storage.from("card-images").remove([`${userId}/`]);

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

  if (deleteError) {
    return new Response(JSON.stringify({ error: "Failed to delete account" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
