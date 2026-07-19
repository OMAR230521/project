import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RANK_COMMANDS: Record<string, string> = {
  'rank-lord':     'lp user {nick} parent addtemp lord-tier2 30d',
  'rank-vizconde': 'lp user {nick} parent addtemp vizconde-tier3 30d',
  'rank-conde':    'lp user {nick} parent addtemp conde-tier4 30d',
  'rank-alteza':   'lp user {nick} parent addtemp alteza-tier5 30d',
};

const CHUNK_COMMANDS: Record<string, string> = {
  'acc-chunks-20':  'ftbchunks admin extra_claim_chunks {nick} add 20',
  'acc-chunks-50':  'ftbchunks admin extra_claim_chunks {nick} add 50',
  'acc-chunks-100': 'ftbchunks admin extra_claim_chunks {nick} add 100',
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const serviceRoleKey = Deno.env.get("SR_KEY");
    if (!serviceRoleKey) {
      return new Response(JSON.stringify({ error: "SR_KEY no configurado" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient("https://mkgspobqmvekpuvfluxi.supabase.co", serviceRoleKey);
    const body = await req.json();

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