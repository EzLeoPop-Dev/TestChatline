let userList = []; // เก็บชั่วคราว (ถ้ามี DB จริงก็เปลี่ยนเป็น DB)

export async function POST(req) {
  try {
    const body = await req.json();

    for (const event of body.events) {
      if (event.type === "message" && event.message.type === "text") {
        const userId = event.source.userId;
        const text = event.message.text;

        // ถ้ายังไม่มี userId นี้ใน list ให้เพิ่ม
        if (!userList.find((u) => u.userId === userId)) {
          userList.push({ userId, lastMessage: text });
        } else {
          userList = userList.map((u) =>
            u.userId === userId ? { ...u, lastMessage: text } : u
          );
        }

        console.log(`📩 ${userId}: ${text}`);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("Error", { status: 500 });
  }
}

// ใช้ดึงรายชื่อลูกค้าทั้งหมด
export async function GET() {
  return Response.json(userList);
}
