export async function POST(req) {
    try {
        const { userId, message } = await req.json();
        console.log("📨 Sending to userId:", userId);
        console.log("💬 Message:", message);
        console.log("🔑 Token loaded:", !!process.env.local.LINE_ACCESS_TOKEN);

        const res = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                to: userId,
                messages: [{ type: "text", text: message }],
            }),
        });

        const text = await res.text();
        console.log("📦 LINE API Response:", text);

        if (!res.ok) {
            console.error("❌ LINE API Error:", text);
            return new Response(JSON.stringify({ error: text }), { status: res.status });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        console.error("❌ Server Error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
