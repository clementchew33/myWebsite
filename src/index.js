export default {
  async fetch(request, env) {
    const ALLOWED_ORIGIN = "https://clementchew33.github.io";

    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Method not allowed" }),
        { status: 405, headers: corsHeaders }
      );
    }

    const origin = request.headers.get("Origin");
    if (origin !== ALLOWED_ORIGIN) {
      return new Response(
        JSON.stringify({ ok: false, error: "Forbidden origin" }),
        { status: 403, headers: corsHeaders }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const order = body.order;
    if (!Array.isArray(order) || order.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Order is empty" }),
        { status: 400, headers: corsHeaders }
      );
    }

const lines = order.map((item) => {
  const name = String(item.name || "Unknown item");
  const category = String(item.category || "Menu");
  const qty = Number(item.qty || 0);
  const remark = String(item.remark || "").trim() || "-";

  return `${name} Category: ${category} Qty: ${qty} Remarks: ${remark}`;}).join("\n\n");

const message = `🛒 New order received\n\n${lines}`;

    const discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message })
    });

    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      return new Response(
        JSON.stringify({ ok: false, error: `Discord error: ${errorText}` }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: corsHeaders }
    );
  }
};
