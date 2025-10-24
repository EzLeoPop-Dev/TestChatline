export async function POST(req) {
    try {
        const body = await req.json(); // อ่าน JSON จาก request body

        console.log("req 1", body);
        // console.log("req 2", body.events[0].message); // message text
        console.log("req 3", body.events[0].deliveryContext);
        console.log("req 4", body.events[0].source);

        const msg = body.events[0].message?.text;
        const userId = body.events[0].source?.userId;
        const groupId = body.events[0].source?.groupId;

        console.log({ msg, userId, groupId });

        // LINE ต้องการให้ตอบกลับ 200 เสมอ
        return Response.json({ code: 200 }, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return Response.json({ code: 200 }, { status: 200 });
    }
}
