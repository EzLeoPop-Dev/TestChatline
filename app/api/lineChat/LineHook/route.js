export async function POST(req) {
  try {
    const body = await req.json();

    console.log("📩 Webhook body:", JSON.stringify(body, null, 2));

    if (!body.events || body.events.length === 0) {
      return new Response("No events", { status: 200 });
    }

    const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

    for (const event of body.events) {
      // ข้อมูลผู้ใช้
      const userId = event.source?.userId || "UnknownUser";
      const type = event.type;

      if (type === "message" && event.message.type === "text") {
        const userMessage = event.message.text;
        const replyToken = event.replyToken;

        // 🔍 Log แสดงข้อมูลใน Console (Vercel จะเห็นใน Logs)
        console.log(`👤 User ID: ${userId}`);
        console.log(`💬 Message: ${userMessage}`);

        // ตอบกลับข้อความ
        const replyMessage = {
          replyToken: replyToken,
          messages: [
            { type: "text", text: `คุณ (${userId}) พิมพ์ว่า: ${userMessage}` },
          ],
        };

        // ส่งข้อความกลับไป LINE
        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
          },
          body: JSON.stringify(replyMessage),
        });
      } else {
        console.log(`⚠️ Received unsupported event type: ${type}`);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new Response("Error", { status: 500 });
  }
}

export async function GET() {
  return new Response("LINE Webhook is running ✅", { status: 200 });
}
