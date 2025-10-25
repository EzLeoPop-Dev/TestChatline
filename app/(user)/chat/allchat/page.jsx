"use client";
import { useState } from "react";

export default function ChatPanel() {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function sendMessage() {
    setStatus("กำลังส่ง...");
    const res = await fetch("/api/lineSendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message }),
    });

    if (res.ok) setStatus("✅ ส่งสำเร็จ");
    else setStatus("❌ ส่งไม่สำเร็จ");
  }

  return (
    <div className="p-6 max-w-md mx-auto border rounded-2xl">
      <h2 className="text-lg font-bold mb-4">ส่งข้อความถึงลูกค้า</h2>
      <input
        type="text"
        placeholder="LINE userId"
        className="border p-2 w-full mb-2 rounded"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <textarea
        placeholder="ข้อความที่ต้องการส่ง"
        className="border p-2 w-full mb-2 rounded"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={sendMessage}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        ส่งข้อความ
      </button>
      <p className="text-sm text-gray-600 mt-2">{status}</p>
    </div>
  );
}
