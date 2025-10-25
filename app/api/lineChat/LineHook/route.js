let userList = []; // เก็บชั่วคราว ถ้าใช้ DB จริง เปลี่ยนเป็น DB

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.events) return new Response("No events", { status: 200 });

    for (const event of body.events) {
      if (event.type === "message" && event.message.type === "text") {
        const userId = event.source.userId;
        const text = event.message.text;

        // เพิ่มหรืออัปเดตรายชื่อลูกค้า
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
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new Response("Error", { status: 500 });
  }
}

// GET ใช้ดึงรายชื่อลูกค้าสำหรับ UI
export async function GET() {
  return Response.json(userList);
}
