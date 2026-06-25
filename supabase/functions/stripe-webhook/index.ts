import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const discordWebhook = Deno.env.get("DISCORD_WEBHOOK_URL");

    if (!stripeKey || !webhookSecret) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const serviceRoleKey = Deno.env.get("SR_KEY");

    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "SR_KEY no configurado" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient("https://qlsmrviqbvqpgcuqondr.supabase.co", serviceRoleKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      const minecraftNick = session.metadata?.minecraft_nick;

      if (!orderId) {
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .update({
          status: "completed",
          stripe_payment_intent: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (!orderError && order && discordWebhook) {
        const itemsList = Array.isArray(order.items)
          ? order.items.map((i: { name: string; quantity: number; price: number }) =>
              `• **${i.name}** x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`
            ).join("\n")
          : "Sin detalle";

        const discordPayload = {
          embeds: [
            {
              title: "✅ Nueva Compra Confirmada",
              color: 0x9333ea,
              fields: [
                { name: "🎮 NickName Minecraft", value: `\`${minecraftNick}\``, inline: true },
                { name: "💰 Total", value: `**$${order.total} USD**`, inline: true },
                { name: "💳 Método", value: "Stripe / Tarjeta", inline: true },
                { name: "📦 Productos", value: itemsList },
                { name: "🔑 ID de Compra", value: `\`${orderId}\``, inline: true },
                { name: "🔐 Payment Intent", value: `\`${session.payment_intent || "N/A"}\``, inline: true },
                { name: "📅 Fecha", value: new Date().toLocaleString("es-ES", { timeZone: "America/Buenos_Aires" }), inline: true },
                { name: "📊 Estado", value: "✅ **COMPLETADO**", inline: true },
              ],
              footer: { text: "BolaLand — Sistema de Pagos" },
              timestamp: new Date().toISOString(),
            },
          ],
        };

        await fetch(discordWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload),
        });

        await supabase.from("orders").update({ discord_notified: true }).eq("id", orderId);
      }
    }

    if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await supabase
          .from("orders")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", orderId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
