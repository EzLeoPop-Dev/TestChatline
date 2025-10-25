"use client";
import { useState, useEffect, useRef } from "react";

export default function ChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const chatEndRef = useRef(null);

  // ✅ ฟัง stream จาก API เดียวกัน
  useEffect(() => {
    const eventSource = new EventSource("/api/lineChat/LineHook?stream=true");

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setUsers(data);
      if (selectedUser) {
        const updated = data.find((u) => u.userId === selectedUser.userId);
        if (updated) setSelectedUser(updated);
      }
    };

    eventSource.onerror = () => {
      console.warn("⚠️ SSE disconnected, reconnecting...");
      eventSource.close();
      setTimeout(() => new EventSource("/api/lineChat/LineHook?stream=true"), 2000);
    };

    return () => eventSource.close();
  }, [selectedUser]);

  // ✅ scroll ล่างสุดเมื่อมีข้อความใหม่
  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser?.messages]);

  const sendMessage = async () => {
    if (!selectedUser || !message.trim()) return;
    await fetch("/api/lineChat/LineHook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUser.userId,
        text: message,
      }),
    });
    setMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r flex flex-col">
        <div className="p-4 font-bold text-lg border-b bg-linear-to-r from-green-500 to-teal-500 text-white">
          ลูกค้า
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map((u) => (
            <div
              key={u.userId}
              onClick={() => setSelectedUser(u)}
              className={`p-3 border-b cursor-pointer hover:bg-green-50 transition ${
                selectedUser?.userId === u.userId ? "bg-green-100" : ""
              }`}
            >
              <div className="font-semibold">{u.displayName}</div>
              <div className="text-xs text-gray-500 truncate">
                {u.messages?.at(-1)?.text || "ยังไม่มีข้อความ"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {selectedUser ? (
          <>
            <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
              <div className="font-bold text-lg">{selectedUser.displayName}</div>
              <div className="text-sm text-gray-400">
                {selectedUser.messages.length} ข้อความ
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedUser.messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.from === "agent" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
                      m.from === "agent"
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none border"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t bg-white flex items-center gap-2">
              <input
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-green-500 text-white rounded-full px-4 py-2 font-semibold hover:bg-green-600 transition"
              >
                ส่ง
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-400">
            👈 เลือกลูกค้าทางด้านซ้ายเพื่อเริ่มแชท
          </div>
        )}
      </div>
    </div>
  );
}
