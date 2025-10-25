let userList = []; // เก็บชั่วคราว ถ้าใช้ DB จริงก็ใช้ DB แทน

export async function POST(req) {
  try {
    const body = await req.json();

    // 🔹 ถ้าเป็น webhook event จาก LINE
    if (body.events) {
      for (const event of body.events) {
        if (event.type === "message" && event.message.type === "text") {
          const userId = event.source.userId;
          const text = event.message.text;

          const existing = userList.find((u) => u.userId === userId);
          if (existing) {
            existing.lastMessage = text;
          } else {
            userList.push({ userId, lastMessage: text });
          }

          console.log(`📩 ${userId}: ${text}`);
        }
      }
      return new Response("OK", { status: 200 });
    }

    // 🔹 ถ้าเป็น request ส่งข้อความ (push) จาก UI
    const { action, userId, message } = body;
    if (action === "sendMessage") {
      if (!userId || !message)
        return new Response(JSON.stringify({ error: "Missing userId or message" }), { status: 400 });

      const token = process.env.LINE_ACCESS_TOKEN;
      if (!token)
        return new Response(JSON.stringify({ error: "LINE_ACCESS_TOKEN not set" }), { status: 500 });

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

      const textRes = await res.text();
      console.log("📦 LINE API Response:", textRes);

      if (!res.ok) {
        return new Response(JSON.stringify({ error: textRes }), { status: res.status });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response("No action", { status: 200 });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// GET ใช้ดึงรายชื่อลูกค้าสำหรับ UI
export async function GET() {
  return Response.json(userList);
}
