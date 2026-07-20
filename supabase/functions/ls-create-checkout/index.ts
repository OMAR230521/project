import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ═══════════════════════════════════════════════════════════════
// 🛒 Precios oficiales (en USD)
// ═══════════════════════════════════════════════════════════════
const VALID_PRICES: Record<string, { name: string; price: number }> = {
  // MODS
  'rank-lord':        { name: 'Rango Lord',             price: 0.60  },
  'rank-vizconde':    { name: 'Rango Vizconde',         price: 5.99  },
  'rank-conde':       { name: 'Rango Conde',            price: 9.34  },
  'rank-alteza':      { name: 'Rango Alteza',           price: 13.59 },
  'acc-chunks-20':    { name: 'Chunks x20',             price: 2.99  },
  'acc-chunks-50':    { name: 'Chunks x50',             price: 6.99  },
  'acc-chunks-100':   { name: 'Chunks x100',            price: 9.99  },
  // VANILLA
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
    // ───────────────────────────────────────────────────────────
    // 🔑 LE MON SQUEEZY — Configuración (completar cuando tengas la cuenta)
    // ───────────────────────────────────────────────────────────
    const apiKey = Deno.env.get("LS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Lemon Squeezy no configurado (falta LS_API_KEY)." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const storeId = Deno.env.get("LS_STORE_ID");
    if (!storeId) {
      return new Response(
        JSON.stringify({ error: "Lemon Squeezy no configurado (falta LS_STORE_ID)." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ⚠️ IMPORTANTE: Crear un producto "Carrito BolaLand" en Lemon Squeezy dashboard
    // con una variante llamada "Compra" (precio mínimo $0.50 USD).
    // Luego poner acá el ID de esa variante:
    const CART_VARIANT_ID = parseInt(Deno.env.get("LS_CART_VARIANT_ID") || "0");
    if (!CART_VARIANT_ID) {
      return new Response(
        JSON.stringify({ error: "Falta LS_CART_VARIANT_ID en las variables de entorno." }),
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

    // ───────────────────────────────────────────────────────────
    // 🚦 Rate limiting
    // ───────────────────────────────────────────────────────────
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { data: allowed, error: rlError } = await supabase.rpc("check_rate_limit", {
      p_ip: clientIP,
      p_endpoint: "ls-create-checkout",
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

    // ───────────────────────────────────────────────────────────
    // 📦 Validar body
    // ───────────────────────────────────────────────────────────
    const body = await req.json();
    const { items, minecraft_nick } = body;

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
      i.server === 'Vanilla' || i.server === 'vanilla'
    ) ? 'vanilla' : 'mods';

    const total = items.reduce((sum: number, item: { id: string; quantity: number }) => {
      return sum + VALID_PRICES[item.id].price * item.quantity;
    }, 0);

    // ───────────────────────────────────────────────────────────
    // 💾 Crear orden en Supabase
    // ───────────────────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        minecraft_nick: minecraft_nick.trim(),
        items,
        total: Math.round(total * 100) / 100,
        payment_method: "lemon-squeezy",
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || "No se pudo crear la orden");
    }

    const origin = req.headers.get("origin") || "https://bolaland.pages.dev";

    // ───────────────────────────────────────────────────────────
    // 🍋 Crear checkout en Lemon Squeezy
    // ───────────────────────────────────────────────────────────
    const lsResponse = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            custom_price: Math.round(total * 100), // en centavos de USD
            product_options: {
              name: "BolaLand Tienda",
              description: `Compra de ${items.length} producto(s) para ${minecraft_nick}`,
              redirect_url: `${origin}/pago-realizado`,
            },
            checkout_options: {
              embed: false,
              media: false,
              logo: true,
              dark: true,
            },
            checkout_data: {
              email: `${minecraft_nick}@bolaland.net`,
              name: minecraft_nick,
              custom: {
                order_id: order.id,
                minecraft_nick: minecraft_nick.trim(),
                server,
                items: JSON.stringify(items.map((i: { id: string; quantity: number }) => ({
                  id: i.id,
                  quantity: i.quantity,
                }))),
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: storeId,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: String(CART_VARIANT_ID),
              },
            },
          },
        },
      }),
    });

    const lsData = await lsResponse.json();
    console.log("Lemon Squeezy checkout response:", JSON.stringify(lsData));

    if (!lsResponse.ok) {
      console.error("Lemon Squeezy error:", lsData);
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      return new Response(
        JSON.stringify({
          error: lsData.errors?.[0]?.detail || "Error al crear el checkout en Lemon Squeezy.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const checkoutUrl = lsData.data?.attributes?.url;
    const checkoutId = lsData.data?.id;

    if (!checkoutUrl) {
      throw new Error("Lemon Squeezy no devolvió URL de checkout");
    }

    // Guardar ID del checkout
    await supabase
      .from("orders")
      .update({ stripe_session_id: checkoutId })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({ url: checkoutUrl, order_id: order.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    console.error("Error en ls-create-checkout:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});