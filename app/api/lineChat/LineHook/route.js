// ✅ เก็บข้อความและรายชื่อผู้ใช้ในหน่วยความจำ (ชั่วคราว)
let chatHistory = []; // [{ userId, displayName, messages: [{ from, text, timestamp }] }]

// ✅ ใช้ LINE Messaging API ส่งข้อความกลับลูกค้า
async function sendLineMessage(userId, text) {
  const token = process.env.LINE_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_ACCESS_TOKEN not set");

  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text }],
    }),
  });
}

// ✅ POST: รับ webhook จาก LINE หรือส่งข้อความจาก UI
export async function POST(req) {
  try {
    const body = await req.json();

    // 🟢 เคส 1: LINE webhook ส่งเข้ามา
    if (body?.events) {
      const event = body.events[0];
      if (!event) return Response.json({ ok: true });

      const userId = event.source?.userId;
      const message = event.message?.text;
      const timestamp = new Date(event.timestamp);
      const displayName = `User-${userId.slice(-4)}`;

      let user = chatHistory.find(u => u.userId === userId);
      if (!user) {
        user = { userId, displayName, messages: [] };
        chatHistory.push(user);
      }

      user.messages.push({ from: "customer", text: message, timestamp });

      console.log(`📩 From ${displayName}: ${message}`);
      return Response.json({ ok: true });
    }

    // 🟢 เคส 2: UI ฝั่งพนักงานส่งข้อความ
    if (body?.userId && body?.text) {
      const { userId, text } = body;

      // ส่งไปหา LINE ลูกค้า
      await sendLineMessage(userId, text);

      // เก็บข้อความฝั่งพนักงานใน history
      const user = chatHistory.find(u => u.userId === userId);
      if (user) {
        user.messages.push({ from: "agent", text, timestamp: new Date() });
      }

      console.log(`📤 Sent to ${userId}: ${text}`);
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
