// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
  const { prompt } = await req.json();
  console.log("prompt", prompt);

  // select
  // content
  //  from
  //    http_post(
  //      'https://api.openai.com/v1/chat/completions',
  //      -- jsonb_build_object(
  //      --   'myvar','myval','foo','bar'
  //      --   ),
  //      '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hello!"}]}',
  //      ARRAY[
  //        http_header('Content-Type','application/json'),
  //        http_header('Authorization','Bearer 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')
  //      ]
  //    );
  const body = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  console.log('OPENAI_API_KEY :', OPENAI_API_KEY)
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
  const openAiResponse = await fetch(openAiRequest).then(res =>res.json() )
  
  console.log("openai response", openAiResponse);
  
  return new Response(JSON.stringify(openAiResponse), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
