import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { removeUserFiles } from "./remove-user-files.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const storageBuckets = ["avatars", "card-images", "card-audio"];

const jsonResponse = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(token);

  if (userError || !user) {
    return jsonResponse({ error: "Invalid token" }, 401);
  }

  try {
    for (const bucket of storageBuckets) {
      await removeUserFiles(adminClient.storage, bucket, user.id);
    }
  } catch (error) {
    console.error("Failed to delete account media", error);
    return jsonResponse({ error: "Failed to delete account data" }, 500);
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );

  if (deleteError) {
    console.error("Failed to delete auth user", deleteError);
    return jsonResponse({ error: "Failed to delete account" }, 500);
  }

  return jsonResponse({ success: true }, 200);
});
