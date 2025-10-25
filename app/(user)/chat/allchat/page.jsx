"use client";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  // 🔁 ดึงรายชื่อ user ทุก 5 วิ
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/lineChat/LineHook");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    loadUsers();
    const interval = setInterval(loadUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  // 📨 ส่งข้อความไปหา LINE User
  async function sendMessage() {
    if (!selected) {
      alert("กรุณาเลือกลูกค้าก่อนส่งข้อความ");
      return;
    }
    if (!message.trim()) {
      alert("กรุณาพิมพ์ข้อความก่อนส่ง");
      return;
    }

    setStatus("⏳ กำลังส่ง...");

    try {
      const res = await fetch("/api/lineChat/LineHook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          userId: selected.userId,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("✅ ส่งข้อความสำเร็จ");
        setMessage("");
      } else {
        setStatus("❌ ส่งไม่สำเร็จ: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* รายชื่อลูกค้า */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="font-bold text-lg mb-4">📋 รายชื่อลูกค้า</h2>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {users.length === 0 && (
            <p className="text-gray-400 text-sm">ยังไม่มีลูกค้าทักเข้ามา</p>
          )}
          {users.map((u) => (
            <div
              key={u.userId}
              onClick={() => setSelected(u)}
              className={`p-3 border rounded-xl cursor-pointer transition ${
                selected?.userId === u.userId
                  ? "bg-green-100 border-green-400"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="font-medium text-sm break-all">{u.userId}</p>
              <p className="text-xs text-gray-500 truncate">
                💬 {u.lastMessage || "ยังไม่มีข้อความ"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* กล่องส่งข้อความ */}
      <div className="bg-white rounded-2xl shadow p-5 flex flex-col">
        <h2 className="font-bold text-lg mb-4">💬 ส่งข้อความ</h2>

        {selected ? (
          <>
            <p className="text-sm text-gray-600 mb-2">
              กำลังตอบ: <span className="font-semibold">{selected.userId}</span>
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
              className="border rounded-xl p-3 w-full mb-3 resize-none focus:ring-2 focus:ring-green-400"
            />

            <button
              onClick={sendMessage}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl transition"
            >
              🚀 ส่งข้อความ
            </button>

            {status && (
              <p className="text-sm mt-3 text-gray-600">{status}</p>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            ← กรุณาเลือกลูกค้าจากฝั่งซ้าย
          </div>
        )}
      </div>
    </div>
  );
}
