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

// Clave pública RSA de Conekta para verificar webhooks
const CONEKTA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6aIHtWet9sxmIGvrk2uB
RK38ksGy5l38dRcpeF+rW6V2gx8UDC4LyIvoNyfOCWoSkr5ng7Llqa/BdZtprNH7
qvnmLVBG8dLlvdkVjOyzoZzx/K+sRcDQCV0EMc7Q1Rul+JgxZa/3HXQTq6aPev3n
qgHLuhMFoqG0MH56bYBWgD78LmZeVX5b4xja0vdBC9j/HUZAodDOugEiGnCEFDwS
n0XNTpNOFErI8EaphGRuLAn6DIJn8VfchpfJvKkLiQsxKSnJocu8dMXI7I6sdFxT
Wg5nGBCzEkl/1ctauUC9/E9ncF3ZX7LID8V0s4PvzCGIlSpb8/6B6eh11nddYZuy
IwIDAQAB
-----END PUBLIC KEY-----`;

/**
 * Verifica la firma RSA-SHA256 de un webhook de Conekta.
 * Conekta firma el body del request con RSA y envía la firma en base64
 * en el header "X-Signature".
 */
async function verifyConektaSignature(body: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) {
    console.error("Webhook rechazado: falta header X-Signature");
    return false;
  }

  try {
    // Decodificar la firma base64
    const signatureBase64 = signatureHeader.trim();
    const signatureBytes = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

    // Importar la clave pública RSA
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContent = CONEKTA_PUBLIC_KEY
      .replace(pemHeader, "")
      .replace(pemFooter, "")
      .replace(/\s/g, "");
    const derBytes = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      "spki",
      derBytes,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verificar la firma
    const bodyBytes = new TextEncoder().encode(body);
    const isValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      signatureBytes,
      bodyBytes
    );

    if (!isValid) {
      console.error("Webhook rechazado: firma RSA inválida");
    }
    return isValid;
  } catch (err) {
    console.error("Error verificando firma RSA:", err);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Leer el body como texto para verificar firma
    const bodyText = await req.text();
    const signatureHeader = req.headers.get("X-Signature");

    const isValid = await verifyConektaSignature(bodyText, signatureHeader);
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

    console.log("conekta-webhook evento recibido:", body.type);

    if (body.type === "order.paid") {
      const conektaOrder = body.data.object;
      const orderId = conektaOrder.metadata?.order_id;
      const minecraft_nick = conektaOrder.metadata?.minecraft_nick;
      const server = conektaOrder.metadata?.server || 'mods';

      if (!orderId || !minecraft_nick) {
        console.error("Metadata incompleta:", conektaOrder.id);
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
        .update({ status: "completed", stripe_payment_intent: conektaOrder.id })
        .eq("id", orderId);

      const items = order.items as Array<{ id: string; name: string }>;

      for (const item of items) {
        const rankCmd = RANK_COMMANDS[item.id];
        const chunkCmd = CHUNK_COMMANDS[item.id];
        if (rankCmd) await sendRconCommand(rankCmd.replace('{nick}', minecraft_nick));
        if (chunkCmd) await sendRconCommand(chunkCmd.replace('{nick}', minecraft_nick));
      }

      if (!order.discord_notified) {
        await sendDiscordNotification(minecraft_nick, items, order.total, server);
        await supabase.from("orders").update({ discord_notified: true }).eq("id", orderId);
      }

      console.log(`✅ Orden ${orderId} completada para ${minecraft_nick}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: unknown) {
    console.error("Error en conekta-webhook:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});