// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

const API_KEY = Deno.env.get("LOGFLARE_API_KEY")
const ENV = Deno.env.get("ENV")


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Not a POST",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
  const { flow_id, builtin_id } = await req.json();

  const supabase = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get("SUPABASE_URL"),
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get("SUPABASE_ANON_KEY"),
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    }
  );

  
  // Now we can get the session or user object
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    return new Response(
      JSON.stringify({
        error: "User must be logged in",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      }
    );
  }
  const queryParams = new URLSearchParams({
    user_id: user.id,
    builtin_id,
    flow_id
  }).toString()
  const url = `https://api.logflare.app/api/endpoints/query/run_logs.${ENV}?${queryParams}`
  const request = new Request(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY
    }
  })
  const {result, error} = await fetch(request).then(r=> r.json())

  if (error){
    return new Response(String(error), {
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
    status: 500})
  }
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
