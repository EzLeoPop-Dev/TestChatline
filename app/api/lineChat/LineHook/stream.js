let clients = []; // เก็บ client ที่เชื่อมอยู่
export let chatHistory = []; // ใช้เก็บข้อความในความจำชั่วคราว

export async function GET() {
  return new Response(
    new ReadableStream({
      start(controller) {
        const send = (data) => {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        };

        // เก็บ client ที่เชื่อมต่อ
        const client = { send };
        clients.push(client);

        // ส่งข้อมูลล่าสุดให้ทันทีตอนเชื่อมต่อ
        send(chatHistory);

        // cleanup เมื่อปิดการเชื่อมต่อ
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

// ฟังก์ชัน broadcast แจ้งทุก client เมื่อมีข้อความใหม่
export function broadcastUpdate() {
  for (const client of clients) {
    client.send(chatHistory);
  }
}
