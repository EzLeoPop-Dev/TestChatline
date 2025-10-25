"use client";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);

  // ดึงข้อมูลจาก API ทุกๆ 2 วิ
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch("/api/lineChat/LineHook");
      const data = await res.json();
      setMessages(data);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 flex flex-col items-center py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">💬 LINE Webhook Chat</h1>

      <div className="w-full max-w-md bg-gray-700 rounded-2xl shadow-lg p-4 space-y-3 overflow-y-auto h-[70vh]">
        {messages.length === 0 ? (
          <p className="text-center text-gray-300">ยังไม่มีข้อความ</p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-gray-800/50 rounded-xl p-3"
            >
              <img
                src={msg.pictureUrl || "/default-avatar.png"}
                alt="profile"
                className="w-10 h-10 rounded-full border border-gray-500"
              />
              <div>
                <div className="font-semibold text-green-400">
                  {msg.displayName}
                </div>
                <div className="text-gray-100">{msg.text}</div>
                <div className="text-xs text-gray-400">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
