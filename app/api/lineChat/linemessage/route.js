export async function POST(req) {
  try {
    const { userId, message } = await req.json();

    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing userId or message" }),
        { status: 400 }
      );
    }

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("LINE API error:", errorText);
      return new Response(JSON.stringify({ error: errorText }), {
        status: res.status,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
