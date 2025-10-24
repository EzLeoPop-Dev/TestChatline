export async function POST(req) {
    try {
        const body = await req.json();
        console.log("req 1", body);

        const msg = body.events?.[0]?.message?.text;
        const userId = body.events?.[0]?.source?.userId;
        const groupId = body.events?.[0]?.source?.groupId;

        console.log({ msg, userId, groupId });

        return Response.json({ code: 200 }, { status: 200 });
    } catch (error) {
        console.error("LINE webhook error:", error);
        return Response.json({ code: 200 }, { status: 200 });
    }
}
