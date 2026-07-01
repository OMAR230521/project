import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ✅ PRECIOS REALES — el frontend no puede modificar estos valores
const VALID_PRICES: Record<string, { name: string; price: number }> = {
  // Mods
  'rank-aventurero':  { name: 'Rango Aventurero',  price: 2.99  },
  'rank-guerrero':    { name: 'Rango Guerrero',     price: 5.99  },
  'rank-legendario':  { name: 'Rango Legendario',   price: 19.99 },
  'rank-supremo':     { name: 'Rango Supremo',      price: 34.99 },
  'rank-eterno':      { name: 'Rango Eterno',       price: 49.99 },
  'acc-particulas-fuego':   { name: '20 Chunks',  price: 2.99 },
  'acc-particulas-hielo':   { name: '50 Chunks',  price: 6.99 },
  'acc-particulas-galaxia': { name: '100 Chunks', price: 9.99 },
  // Vanilla
  'v-rank-aventurero':  { name: 'Rango Aventurero Vanilla',  price: 2.99  },
  'v-rank-guerrero':    { name: 'Rango Guerrero Vanilla',     price: 5.99  },
  'v-rank-legendario':  { name: 'Rango Legendario Vanilla',   price: 19.99 },
  'v-rank-supremo':     { name: 'Rango Supremo Vanilla',      price: 34.99 },
  'v-rank-eterno':      { name: 'Rango Eterno Vanilla',       price: 49.99 },
  'v-acc-particulas-fuego':   { name: '20 Chunks Vanilla',  price: 2.99 },
  'v-acc-particulas-hielo':   { name: '50 Chunks Vanilla',  price: 6.99 },
  'v-acc-particulas-galaxia': { name: '100 Chunks Vanilla', price: 9.99 },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe no configurado. Contacta al administrador." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const serviceRoleKey = Deno.env.get("SR_KEY");
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "SR_KEY no configurado. Contacta al administrador." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient("https://mkgspobqmvekpuvfluxi.supabase.co", serviceRoleKey);

    // ✅ RATE LIMITING — máximo 5 intentos de checkout por IP por minuto
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { data: allowed, error: rlError } = await supabase
      .rpc("check_rate_limit", {
        p_ip: clientIP,
        p_endpoint: "create-checkout",
        p_max_requests: 5,
        p_window_seconds: 60,
      });

    if (rlError) {
      console.error("Rate limit check error:", rlError);
    } else if (!allowed) {
      console.warn(`Rate limit excedido para IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Demasiados intentos. Esperá un momento antes de intentar de nuevo." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { items, minecraft_nick, payment_method } = body;

    console.log("create-checkout - body recibido:", JSON.stringify({ items, minecraft_nick, payment_method }));

    // Validar nick
    if (!minecraft_nick || !/^[a-zA-Z0-9_]{3,16}$/.test(minecraft_nick)) {
      return new Response(
        JSON.stringify({ error: "NickName de Minecraft inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "El carrito está vacío." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ VALIDAR cada item contra los precios reales del servidor
    for (const item of items) {
      const valid = VALID_PRICES[item.id];
      if (!valid) {
        console.warn(`create-checkout - item inválido rechazado: ${item.id}`);
        return new Response(
          JSON.stringify({ error: `Producto inválido: ${item.id}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (Math.round(item.price * 100) !== Math.round(valid.price * 100)) {
        console.warn(`create-checkout - precio manipulado detectado para ${item.id}: enviado $${item.price}, real $${valid.price}`);
        return new Response(
          JSON.stringify({ error: "Precio inválido detectado. No se procesó el pago." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Detectar servidor
    const server = items.some((i: { server?: string }) =>
      i.server === 'vanilla' || i.server === 'Vanilla'
    ) ? 'vanilla' : 'mods';

    // ✅ Calcular total con precios del SERVIDOR, no del frontend
    const total = items.reduce((sum: number, item: { id: string; quantity: number }) => {
      return sum + VALID_PRICES[item.id].price * item.quantity;
    }, 0);

    console.log("create-checkout - total validado:", total, "server:", server);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        minecraft_nick: minecraft_nick.trim(),
        items,
        total: Math.round(total * 100) / 100,
        payment_method: payment_method || "stripe",
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || "No se pudo crear la orden");
    }

    const origin = req.headers.get("origin") || "https://bolaland.net";

    // ✅ Usar precios del servidor para Stripe también
    const lineItems = items.map((item: { id: string; quantity: number }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: VALID_PRICES[item.id].name,
          description: `BolaLand - Minecraft Nick: ${minecraft_nick}`,
        },
        unit_amount: Math.round(VALID_PRICES[item.id].price * 100),
      },
      quantity: item.quantity,
    }));

    console.log("create-checkout - creando sesión Stripe:", JSON.stringify({ order_id: order.id, minecraft_nick: minecraft_nick.trim(), server }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/pago-realizado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pago-fallido`,
      metadata: {
        order_id: order.id,
        minecraft_nick: minecraft_nick.trim(),
        server,
      },
      custom_text: {
        submit: {
          message: `Los productos se entregarán al jugador: ${minecraft_nick}`,
        },
      },
    });

    console.log("create-checkout - sesión creada:", session.id);

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id, order_id: order.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    console.error("Error en create-checkout:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message, details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});