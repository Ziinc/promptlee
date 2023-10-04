import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Import via bare specifier thanks to the import_map.json file.
import Stripe from "https://esm.sh/stripe";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  apiVersion: "2022-11-15",
  httpClient: Stripe.createFetchHttpClient(),
});
// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();


serve(async (request) => {
  const signature = request.headers.get("Stripe-Signature");

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await request.text();
  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    return new Response(err.message, { status: 400 });
  }

  const supabase = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get("SUPABASE_URL"),
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get("SB_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
    }
  );

  if (receivedEvent.type === "checkout.session.completed") {
    const checkoutSessionId = receivedEvent.data.object.id;
    const lineItems = await stripe.checkout.sessions.listLineItems(
      checkoutSessionId
    );

    const creditsToAdd = lineItems.data.reduce((acc, item) => {
      const num = {
        "100 Promptlee Credits": 100,
        "1,000 Promptlee Credits": 1000,
      }[item.description];
      const qty = item.quantity * num;
      acc += qty;
      return acc;
    }, 0);
    const userId = receivedEvent.data.object.client_reference_id;
    // log the prompt run
    const payload = {
      user_id: userId,
      value: creditsToAdd,
      free: false,
    };
    const logResult = await supabase
      .from("prompt_run_credits")
      .insert([payload]);
    if (logResult.error) {
      console.error("Error inserting prompt run credits ", logResult.error.message);
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  return new Response("Unhandled webhook event", { status: 400 });
});
