import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RANK_COMMANDS: Record<string, string> = {
  // MODS
  'rank-lord':     'lp user {nick} parent addtemp lord-tier2 30d',
  'rank-vizconde': 'lp user {nick} parent addtemp vizconde-tier3 30d',
  'rank-conde':    'lp user {nick} parent addtemp conde-tier4 30d',
  'rank-alteza':   'lp user {nick} parent addtemp alteza-tier5 30d',
  // VANILLA
  'v-rank-lord':     'lp user {nick} parent addtemp v-lord-tier2 30d',
  'v-rank-vizconde': 'lp user {nick} parent addtemp v-vizconde-tier3 30d',
  'v-rank-conde':    'lp user {nick} parent addtemp v-conde-tier4 30d',
  'v-rank-alteza':   'lp user {nick} parent addtemp v-alteza-tier5 30d',
};

const CHUNK_COMMANDS: Record<string, string> = {
  // MODS
  'acc-chunks-20':  'ftbchunks admin extra_claim_chunks {nick} add 20',
  'acc-chunks-50':  'ftbchunks admin extra_claim_chunks {nick} add 50',
  'acc-chunks-100': 'ftbchunks admin extra_claim_chunks {nick} add 100',
  // VANILLA
  'v-acc-chunks-20':  'ftbchunks admin extra_claim_chunks {nick} add 20',
  'v-acc-chunks-50':  'ftbchunks admin extra_claim_chunks {nick} add 50',
  'v-acc-chunks-100': 'ftbchunks admin extra_claim_chunks {nick} add 100',
};

async function sendRconCommand(command: string): Promise<boolean> {
  const rconHost = Deno.env.get("RCON_HOST") || "144.217.199.1";
  const rconPort = parseInt(Deno.env.get("RCON_PORT") || "25575");
  const rconPassword = Deno.env.get("RCON_PASSWORD") || "";

  try {
    const conn = await Deno.connect({ hostname: rconHost, port: rconPort });
    const authPayload = encodeRconPacket(1, 3, rconPassword);
    await conn.write(authPayload);
    await readRconResponse(conn);
    const cmdPayload = encodeRconPacket(2, 2, command);
    await conn.write(cmdPayload);
    await readRconResponse(conn);
    conn.close();
    console.log(`RCON comando enviado: ${command}`);
    return true;
  } catch (err) {
    console.error(`RCON error para comando "${command}":`, err);
    return false;
  }
}

function encodeRconPacket(id: number, type: number, body: string): Uint8Array {
  const bodyBytes = new TextEncoder().encode(body);
  const length = 4 + 4 + bodyBytes.length + 2;
  const buffer = new ArrayBuffer(4 + length);
  const view = new DataView(buffer);
  let offset = 0;
  view.setInt32(offset, length, true); offset += 4;
  view.setInt32(offset, id, true); offset += 4;
  view.setInt32(offset, type, true); offset += 4;
  new Uint8Array(buffer, offset, bodyBytes.length).set(bodyBytes); offset += bodyBytes.length;
  view.setUint8(offset, 0); offset++;
  view.setUint8(offset, 0);
  return new Uint8Array(buffer);
}

async function readRconResponse(conn: Deno.TcpConn): Promise<void> {
  const buf = new Uint8Array(4096);
  await conn.read(buf);
}

async function sendDiscordNotification(nick: string, items: Array<{id: string; name: string}>, total: number, server: string) {
  const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (!webhookUrl) return;
  const itemsList = items.map(i => `• ${i.name}`).join('\n');
  const serverLabel = server === 'vanilla' ? '🌿 Vanilla' : '⚔️ Mods';
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: "✅ Nueva compra completada",
        color: server === 'vanilla' ? 0x22c55e : 0x9333ea,
        fields: [
          { name: "👤 Jugador", value: nick, inline: true },
          { name: "🖥️ Servidor", value: serverLabel, inline: true },
          { name: "💰 Total", value: `$${total.toFixed(2)} USD`, inline: true },
          { name: "📦 Productos", value: itemsList, inline: false },
        ],
        timestamp: new Date().toISOString(),
      }]
    })
  });
}

// ═══════════════════════════════════════════════════════════════
// 🍋 VERIFICACIÓN DE FIRMA LEMON SQUEEZY
// ═══════════════════════════════════════════════════════════════
// ❗ COMPLETAR CUANDO TENGAS LA CUENTA:
// Ir a Lemon Squeezy Dashboard → Settings → Webhooks
// Copiar el "Signing secret" y ponerlo en variables de entorno como LS_WEBHOOK_SECRET
async function verifyLsSignature(body: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) {
    console.error("Webhook rechazado: falta header X-Signature");
    return false;
  }

  const webhookSecret = Deno.env.get("LS_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.warn("LS_WEBHOOK_SECRET no configurado — saltando verificación");
    return true;
  }

  try {
    // Lemon Squeezy firma con HMAC-SHA256
    const keyBytes = new TextEncoder().encode(webhookSecret);
    const msgBytes = new TextEncoder().encode(body);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign("HMAC", cryptoKey, msgBytes);
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    const providedSignature = signatureHeader.trim().toLowerCase();

    // Comparación segura
    if (providedSignature.length !== expectedSignature.length) return false;
    let diff = 0;
    for (let i = 0; i < providedSignature.length; i++) {
      diff |= providedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    return diff === 0;
  } catch (err) {
    console.error("Error verificando firma Lemon Squeezy:", err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// 🍋 LEMON SQUEEZY WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Verificar firma
    const bodyText = await req.text();
    const signatureHeader = req.headers.get("X-Signature");

    const isValid = await verifyLsSignature(bodyText, signatureHeader);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Firma inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceRoleKey = Deno.env.get("SR_KEY");
    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ error: "SR_KEY no configurado" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient("https://mkgspobqmvekpuvfluxi.supabase.co", serviceRoleKey);
    const body = JSON.parse(bodyText);

    console.log("ls-webhook evento recibido:", body.meta?.event_name);

    // Lemon Squeezy envía "order_created" cuando se completa un pago
    if (body.meta?.event_name === "order_created") {
      const orderData = body.data;
      const customData = orderData.attributes?.customer_metadata?.custom || {};
      const orderId = customData.order_id;
      const minecraft_nick = customData.minecraft_nick;
      const server = customData.server || 'mods';
      const itemsRaw = customData.items || "[]";
      const items = JSON.parse(itemsRaw);

      if (!orderId || !minecraft_nick) {
        console.error("Metadata incompleta en orden Lemon Squeezy:", orderData.id);
        return new Response(JSON.stringify({ error: "Metadata incompleta" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        console.error("Orden no encontrada:", orderId);
        return new Response(JSON.stringify({ error: "Orden no encontrada" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      await supabase
        .from("orders")
        .update({ status: "completed", stripe_payment_intent: orderData.id })
        .eq("id", orderId);

      // Ejecutar comandos RCON para cada item
      for (const item of items) {
        const rankCmd = RANK_COMMANDS[item.id];
        const chunkCmd = CHUNK_COMMANDS[item.id];
        if (rankCmd) await sendRconCommand(rankCmd.replace('{nick}', minecraft_nick));
        if (chunkCmd) await sendRconCommand(chunkCmd.replace('{nick}', minecraft_nick));
      }

      if (!order.discord_notified) {
        await sendDiscordNotification(minecraft_nick, order.items, order.total, server);
        await supabase.from("orders").update({ discord_notified: true }).eq("id", orderId);
      }

      console.log(`✅ Orden ${orderId} completada para ${minecraft_nick} vía Lemon Squeezy`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: unknown) {
    console.error("Error en ls-webhook:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});