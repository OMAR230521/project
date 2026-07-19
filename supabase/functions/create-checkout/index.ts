import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VALID_PRICES: Record<string, { name: string; price: number }> = {
  'rank-lord':        { name: 'Rango Lord',             price: 3.99  },
  'rank-vizconde':    { name: 'Rango Vizconde',         price: 5.99  },
  'rank-conde':       { name: 'Rango Conde',            price: 10.99 },
  'rank-alteza':      { name: 'Rango Alteza',           price: 13.59 },
  'acc-chunks-20':    { name: 'Chunks x20',             price: 2.99  },
  'acc-chunks-50':    { name: 'Chunks x50',             price: 6.99  },
  'acc-chunks-100':   { name: 'Chunks x100',            price: 9.99  },
  'v-rank-lord':      { name: 'Rango Lord Vanilla',     price: 3.99  },
  'v-rank-vizconde':  { name: 'Rango Vizconde Vanilla', price: 5.99  },
  'v-rank-conde':     { name: 'Rango Conde Vanilla',    price: 10.99 },
  'v-rank-alteza':    { name: 'Rango Alteza Vanilla',   price: 13.59 },
  'v-acc-chunks-20':  { name: 'Chunks x20 Vanilla',    price: 2.99  },
  'v-acc-chunks-50':  { name: 'Chunks x50 Vanilla',    price: 6.99  },
  'v-acc-chunks-100': { name: 'Chunks x100 Vanilla',   price: 9.99  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const conektaKey = Deno.env.get("CONEKTA_SECRET_KEY");
    if (!conektaKey) {
      return new Response(
        JSON.stringify({ error: "Conekta no configurado." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceRoleKey = Deno.env.get("SR_KEY");
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "SR_KEY no configurado." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient("https://mkgspobqmvekpuvfluxi.supabase.co", serviceRoleKey);

    // Rate limiting
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { data: allowed, error: rlError } = await supabase.rpc("check_rate_limit", {
      p_ip: clientIP,
      p_endpoint: "create-checkout",
      p_max_requests: 5,
      p_window_seconds: 60,
    });

    if (rlError) {
      console.error("Rate limit check error:", rlError);
    } else if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Demasiados intentos. Esperá un momento." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { items, minecraft_nick, payment_method } = body;

    // Validar nick
    if (!minecraft_nick || !/^[a-zA-Z0-9_]{3,16}$/.test(minecraft_nick)) {
      return new Response(
        JSON.stringify({ error: "NickName de Minecraft inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "El carrito está vacío." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar precios
    for (const item of items) {
      const valid = VALID_PRICES[item.id];
      if (!valid) {
        return new Response(
          JSON.stringify({ error: `Producto inválido: ${item.id}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (Math.round(item.price * 100) !== Math.round(valid.price * 100)) {
        return new Response(
          JSON.stringify({ error: "Precio inválido detectado." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const server = items.some((i: { server?: string }) =>
      i.server === 'vanilla' || i.server === 'Vanilla'
    ) ? 'vanilla' : 'mods';

    const total = items.reduce((sum: number, item: { id: string; quantity: number }) => {
      return sum + VALID_PRICES[item.id].price * item.quantity;
    }, 0);

    // Crear orden en Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        minecraft_nick: minecraft_nick.trim(),
        items,
        total: Math.round(total * 100) / 100,
        payment_method: payment_method || "conekta",
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || "No se pudo crear la orden");
    }

    const origin = req.headers.get("origin") || "https://bolaland.pages.dev";

    // Crear checkout session hosted en Conekta
    const lineItems = items.map((item: { id: string; quantity: number }) => ({
      name: VALID_PRICES[item.id].name,
      unit_price: Math.round(VALID_PRICES[item.id].price * 100),
      quantity: item.quantity,
    }));

    const conektaResponse = await fetch("https://api.conekta.io/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/vnd.conekta-v2.1.0+json",
        "Authorization": `Basic ${btoa(conektaKey + ":")}`,
      },
      body: JSON.stringify({
        type: "HostedPayment",
        name: `BolaLand — ${minecraft_nick}`,
        success_url: `${origin}/pago-realizado`,
        failure_url: `${origin}/pago-fallido`,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hora
        allowed_payment_methods: ["card"],
        currency: "usd",
        metadata: {
          order_id: order.id,
          minecraft_nick: minecraft_nick.trim(),
          server,
        },
        line_items: lineItems,
      }),
    });

    const conektaData = await conektaResponse.json();
    console.log("Conekta response:", JSON.stringify(conektaData));

    if (!conektaResponse.ok) {
      console.error("Conekta error:", conektaData);
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return new Response(
        JSON.stringify({ error: conektaData.details?.[0]?.message || "Error al crear el checkout." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Guardar el ID del checkout de Conekta
    await supabase
      .from("orders")
      .update({ stripe_session_id: conektaData.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ url: conektaData.url, order_id: order.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    console.error("Error en create-checkout:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});