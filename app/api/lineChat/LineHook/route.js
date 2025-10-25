import { chatHistory, broadcastUpdate } from "./strem.js";

// ส่งข้อความกลับไปหา LINE
async function sendLineMessage(userId, text) {
  const token = process.env.LINE_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_ACCESS_TOKEN not set");

  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text }],
    }),
  });
}

// ✅ POST: รับ webhook จาก LINE หรือข้อความจาก UI
export async function POST(req) {
  try {
    const body = await req.json();

    // 🟢 เคส 1: webhook จาก LINE เข้ามา
    if (body?.events) {
      const event = body.events[0];
      if (!event) return Response.json({ ok: true });

      const userId = event.source?.userId;
      const message = event.message?.text;
      const timestamp = new Date(event.timestamp);
      const displayName = `User-${userId.slice(-4)}`;

      let user = chatHistory.find((u) => u.userId === userId);
      if (!user) {
        user = { userId, displayName, messages: [] };
        chatHistory.push(user);
      }

      user.messages.push({ from: "customer", text: message, timestamp });
      broadcastUpdate(); // 🔔 แจ้งทุก client ที่เปิดอยู่

      return Response.json({ ok: true });
    }

    // 🟢 เคส 2: agent พิมพ์ข้อความส่งไป LINE
    if (body?.userId && body?.text) {
      const { userId, text } = body;

      await sendLineMessage(userId, text);

      const user = chatHistory.find((u) => u.userId === userId);
      if (user) {
        user.messages.push({ from: "agent", text, timestamp: new Date() });
      }

      broadcastUpdate(); // 🔔 แจ้งทุก client ที่เปิดอยู่
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Invalid POST data" }, { status: 400 });
  } catch (err) {
    console.error("❌ Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ✅ GET: ดึงรายชื่อและประวัติแชททั้งหมด
export async function GET() {
  return Response.json(chatHistory);
}
