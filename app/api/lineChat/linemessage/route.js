export async function POST(req) {
  try {
    const { userId, message } = await req.json();

    if (!userId || !message)
      return new Response(
        JSON.stringify({ error: "Missing userId or message" }),
        { status: 400 }
      );

    const token = process.env.LINE_ACCESS_TOKEN;
    if (!token)
      return new Response(
        JSON.stringify({ error: "LINE_ACCESS_TOKEN not set" }),
        { status: 500 }
      );

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text: message }],
      }),
    });

    const text = await res.text();
    console.log("📦 LINE API Response:", text);

    if (!res.ok) {
      return new Response(JSON.stringify({ error: text }), { status: res.status });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
