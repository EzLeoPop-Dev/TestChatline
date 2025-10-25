let clients = []; // เก็บ client ที่เชื่อม SSE
let chatHistory = []; // เก็บข้อความทั้งหมดในหน่วยความจำ

// 🔹 ส่งข้อความกลับไปยัง LINE
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

// 🔹 broadcast ไปยังทุก client ที่เปิด SSE อยู่
function broadcastUpdate() {
  for (const client of clients) {
    client.send(chatHistory);
  }
}

// ✅ GET: สำหรับดึงข้อมูล หรือเปิด stream แบบ SSE
export async function GET(req) {
  const { searchParams } = new URL(req.url);

  // ถ้ามีพารามิเตอร์ `?stream=true` ให้เปิด SSE แทน
  if (searchParams.get("stream") === "true") {
    return new Response(
      new ReadableStream({
        start(controller) {
          const send = (data) => {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          };

          // เพิ่ม client
          const client = { send };
          clients.push(client);

          // ส่งข้อมูลล่าสุดให้ตอนเชื่อมต่อ
          send(chatHistory);

          // ลบออกเมื่อ client ปิด
          controller.oncancel = () => {
            clients = clients.filter((c) => c !== client);
          };
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      }
    );
  }

  // ถ้าไม่ใช่ stream ก็แสดง chat history ธรรมดา
  return Response.json(chatHistory);
}

// ✅ POST: ใช้ได้ทั้ง webhook จาก LINE และ agent ส่งข้อความ
export async function POST(req) {
  try {
    const body = await req.json();

    // 🟢 1) webhook จาก LINE
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
      broadcastUpdate(); // 🔔 แจ้งทุก client

      return Response.json({ ok: true });
    }

    // 🟢 2) agent ส่งข้อความออกไปหา LINE
    if (body?.userId && body?.text) {
      const { userId, text } = body;

      await sendLineMessage(userId, text);

      const user = chatHistory.find((u) => u.userId === userId);
      if (user) {
        user.messages.push({ from: "agent", text, timestamp: new Date() });
      }

      broadcastUpdate(); // 🔔 แจ้งทุก client
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Invalid POST data" }, { status: 400 });
  } catch (err) {
    console.error("❌ Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
