export async function POST(req) {
  try {
    // อ่านข้อมูลจาก body (LINE ส่ง JSON มา)
    const body = await req.json();

    // แสดงผลใน log เพื่อ debug ได้ใน Vercel
    console.log("📩 Webhook body:", JSON.stringify(body, null, 2));

    // ตรวจสอบ event
    if (!body.events || body.events.length === 0) {
      return new Response("No events", { status: 200 });
    }

    // ดึง token สำหรับ reply (กรณีต้องตอบกลับ)
    const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

    // loop ทุก event
    for (const event of body.events) {
      // ตัวอย่าง: ถ้ามีข้อความเข้ามา
      if (event.type === "message" && event.message.type === "text") {
        const replyToken = event.replyToken;
        const userMessage = event.message.text;

        // สร้างข้อความตอบกลับ
        const replyMessage = {
          replyToken: replyToken,
          messages: [
            { type: "text", text: `คุณพิมพ์ว่า: ${userMessage}` },
          ],
        };

        // ส่งกลับไปยัง LINE API
        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
          },
          body: JSON.stringify(replyMessage),
        });
      }
    }

    // ต้องตอบกลับ 200 เสมอ เพื่อให้ LINE ไม่ retry
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new Response("Error", { status: 500 });
  }
}

export async function GET() {
  // ใช้ตรวจสอบว่า API ทำงานไหม
  return new Response("LINE Webhook is running ✅", { status: 200 });
}