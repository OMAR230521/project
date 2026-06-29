// @ts-ignore
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature",
};

// Disable JWT verification for Stripe webhooks
export const config = {
  path: "/stripe-webhook",
  auth: false,
}

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

    const supabase = createClient("https://mkgspobqmvekpuvfluxi.supabase.co", serviceRoleKey);

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
      console.log("WEBHOOK - Evento checkout.session.completed recibido");
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      const minecraftNick = session.metadata?.minecraft_nick;
      const server = session.metadata?.server || 'mods';

      console.log("WEBHOOK - Session metadata:", JSON.stringify(session.metadata));
      console.log("WEBHOOK - Server recibido:", server);
      console.log("WEBHOOK - orderId:", orderId);
      console.log("WEBHOOK - minecraftNick:", minecraftNick);

      if (!orderId) {
        console.log("WEBHOOK - No orderId, respondiendo received:true");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("WEBHOOK - Actualizando orden en Supabase...");
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

      console.log("WEBHOOK - Resultado update order:", JSON.stringify({ order, orderError }));

      if (orderError) {
        console.log("WEBHOOK - Error al actualizar orden:", orderError.message);
      }

      if (!orderError && order && discordWebhook) {
        console.log("WEBHOOK - Construyendo embed para Discord...");
        const items = Array.isArray(order.items) ? order.items : [];
        const itemsList = items.length > 0
          ? items.map((i: { name: string; quantity: number; price: number }) =>
              `• **${i.name}** x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`
            ).join("\n")
          : "Sin detalle";

        const isVanilla = server === 'vanilla';
        const serverName = isVanilla ? '🌿 BolaLand VANILLA' : '⚡ BolaLand MODS';
        const embedColor = isVanilla ? 0x22c55e : 0x9333ea;

        const discordPayload = {
          embeds: [
            {
              title: isVanilla ? "✅ Nueva Compra — BolaLand VANILLA" : "✅ Nueva Compra Confirmada",
              color: embedColor,
              fields: [
                { name: "🎮 NickName Minecraft", value: `\`${minecraftNick}\``, inline: true },
                { name: "💰 Total", value: `**$${order.total} USD**`, inline: true },
                { name: "💳 Método", value: "Stripe / Tarjeta", inline: true },
                { name: "🌐 Servidor", value: serverName, inline: true },
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

        console.log("WEBHOOK - Enviando a Discord...");
        const discordResponse = await fetch(discordWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload),
        });

        console.log("WEBHOOK - Respuesta de Discord:", discordResponse.status, discordResponse.statusText);

        if (!discordResponse.ok) {
          const discordBody = await discordResponse.text();
          console.log("WEBHOOK - Cuerpo de respuesta Discord:", discordBody);
        }

        await supabase.from("orders").update({ discord_notified: true }).eq("id", orderId);
        console.log("WEBHOOK - discord_notified actualizado");
      } else {
        console.log("WEBHOOK - No se envió a Discord. orderError:", !!orderError, "order:", !!order, "discordWebhook:", !!discordWebhook);
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
