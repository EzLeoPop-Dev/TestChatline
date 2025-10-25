let chatHistory = []; // [{ userId, displayName, messages: [{ from, text, timestamp }] }]
let clients = []; // client ของ EventStream

// :white_check_mark: แจ้งทุก client ให้ update
function broadcastUpdate() {
  const data = `data: ${JSON.stringify(chatHistory)}\n\n`;
  for (const client of clients) {
    try {
      client.controller.enqueue(data);
    } catch {
      // ถ้า client หลุด ให้ลบทิ้ง
      clients = clients.filter(c => c !== client);
    }
  }
}

// :white_check_mark: ฟังก์ชันส่งข้อความกลับ LINE
async function sendLineMessage(userId, text) {
  const token = process.env.LINE_ACCESS_TOKEN;
  if (!token) throw new Error(":x: LINE_ACCESS_TOKEN not set");

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

// :white_check_mark: รองรับทั้ง SSE, webhook, และส่งข้อความ
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const stream = searchParams.get("stream");

  // :small_blue_diamond: ถ้าเป็น stream mode (Realtime)
  if (stream === "true") {
    return new Response(
      new ReadableStream({
        start(controller) {
          const client = { controller };
          clients.push(client);

          // ส่งข้อมูลตอนเชื่อมต่อครั้งแรก
          controller.enqueue(`data: ${JSON.stringify(chatHistory)}\n\n`);

          // cleanup เมื่อ client ปิด
          controller.oncancel = () => {
            clients = clients.filter(c => c !== client);
          };
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
  }

  // :small_blue_diamond: ถ้าไม่ใช่ stream ก็ส่งข้อมูลธรรมดา
  return Response.json(chatHistory);
}

// :white_check_mark: POST: webhook จาก LINE หรือข้อความจาก agent
export async function POST(req) {
  try {
    const body = await req.json();

    // :green_circle: เคส 1: ข้อมูลมาจาก LINE Webhook
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
      broadcastUpdate(); // แจ้งทุก client

      return Response.json({ ok: true });
    }

    // :green_circle: เคส 2: ข้อความจากพนักงาน (UI)
    if (body?.userId && body?.text) {
      const { userId, text } = body;

      await sendLineMessage(userId, text);

      const user = chatHistory.find(u => u.userId === userId);
      if (user) {
        user.messages.push({ from: "agent", text, timestamp: new Date() });
      }

      broadcastUpdate();
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Invalid POST data" }, { status: 400 });
  } catch (err) {
    console.error(":x: Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
