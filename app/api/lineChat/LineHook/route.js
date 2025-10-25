// ✅ LINE Webhook + Push Message API รวมอยู่ในไฟล์เดียว
let userList = []; // เก็บข้อมูล user ที่ทักมา (ชั่วคราว)

export async function POST(req) {
  try {
    const body = await req.json();
    const token = process.env.LINE_ACCESS_TOKEN;

    if (!token) {
      console.error("❌ Missing LINE_ACCESS_TOKEN in .env.local");
      return new Response(
        JSON.stringify({ error: "LINE_ACCESS_TOKEN not set" }),
        { status: 500 }
      );
    }

    // 🔹 ถ้ามี events แปลว่ามาจาก LINE Webhook
    if (body.events) {
      for (const event of body.events) {
        if (event.type === "message" && event.message.type === "text") {
          const userId = event.source.userId;
          const text = event.message.text;

          // เก็บ user + ข้อความล่าสุด
          const existing = userList.find((u) => u.userId === userId);
          if (existing) {
            existing.lastMessage = text;
          } else {
            userList.push({ userId, lastMessage: text });
          }

          console.log(`📩 รับข้อความจาก ${userId}: ${text}`);
        }
      }

      // ต้องส่งกลับ 200 เพื่อให้ LINE รู้ว่า webhook ทำงานสำเร็จ
      return new Response("OK", { status: 200 });
    }

    // 🔹 ถ้าไม่ใช่ Webhook → อาจเป็นคำสั่งจาก UI
    const { action, userId, message } = body;

    if (action === "sendMessage") {
      if (!userId || !message)
        return new Response(
          JSON.stringify({ error: "Missing userId or message" }),
          { status: 400 }
        );

      console.log(`🚀 ส่งข้อความถึง ${userId}: ${message}`);

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

      const result = await res.text();
      console.log("📦 LINE API Response:", result);

      if (!res.ok)
        return new Response(JSON.stringify({ error: result }), {
          status: res.status,
        });

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response("No valid action", { status: 200 });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// 🔹 ใช้ดึงรายชื่อ user ที่เคยส่งข้อความมา
export async function GET() {
  return Response.json(userList);
}
