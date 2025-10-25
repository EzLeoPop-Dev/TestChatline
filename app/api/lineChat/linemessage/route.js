export async function POST(req) {
    try {
        const { userId, message } = await req.json();
        const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

        if (!userId || !message) {
            return new Response("Missing parameters", { status: 400 });
        }

        const body = {
            to: userId,
            messages: [{ type: "text", text: message }],
        };

        const res = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const error = await res.text();
            console.error("LINE API Error:", error);
            return new Response("LINE push failed", { status: 500 });
        }

        console.log(`✅ Sent message to ${userId}: ${message}`);
        return new Response("OK", { status: 200 });
    } catch (err) {
        console.error("❌ Error:", err);
        return new Response("Error", { status: 500 });
    }
}
