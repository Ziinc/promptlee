// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

import LogflareJs from "https://esm.sh/logflare-js@0.1.0";

const analytics = new LogflareJs({
  apiKey: Deno.env.get("LOGFLARE_API_KEY"),
  sourceToken: Deno.env.get("ENV") === "dev" ?  "8dd6e129-c2dc-4872-9e34-b7ff7edca01f" : "84854427-e7cf-4484-ba04-9984e10e4668",
});

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
  const { prompt, flow_id } = await req.json();

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
  console.log("user data", data);
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

  // log the prompt run
  const payload = {
    user_id: user.id,
    flow_id: flow_id,
    value: -1,
  };
  const logResult = await supabase.from("prompt_run_credits").insert([payload]);
  if (logResult.error) {
    console.error(logResult.error);
    throw new Error(logResult.error);
  }

  const body = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  const openAiRequest = new Request(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  const openAiResponse = await fetch(openAiRequest).then((res) => res.json());

  // console.log("openai response", openAiResponse);

  await analytics.sendEvent({
    message: "prompt run successful",
    user_id: user.id,
    inputs: {
      prompt,
    },
    output: {
      openai_response_str: JSON.stringify(openAiResponse),
    },
  });

  return new Response(JSON.stringify(openAiResponse), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
