export async function POST(req) {
    try {
        // อ่านข้อมูลจาก body (LINE ส่งเป็น JSON)
        const body = await req.json();

        console.log("req 1", body);
        // console.log("req 2", body.events[0].message); // message text
        console.log("req 3", body.events[0].deliveryContext);
        console.log("req 4", body.events[0].source); // source id

        // ดึงค่าต่าง ๆ เหมือน Express
        const msg = body.events[0].message.text;
        const userId = body.events[0].source.userId;
        const groupId = body.events[0].source.groupId;

        console.log("💬 msg:", msg);
        console.log("👤 userId:", userId);
        console.log("👥 groupId:", groupId);

        // ตอบกลับ LINE ด้วย status 200 (จำเป็นมาก)
        return new Response("OK", { status: 200 });

    } catch (error) {
        console.error("❌ Error in webhook:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}