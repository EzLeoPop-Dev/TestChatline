"use client";
import { useState, useEffect } from "react";

export default function ChatPanel() {
    const [customers, setCustomers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        async function fetchUsers() {
            const res = await fetch("/api/lineChat/LineHook");
            const data = await res.json();
            setCustomers(data);
        }
        fetchUsers();
        const interval = setInterval(fetchUsers, 5000); // อัปเดตทุก 5 วิ
        return () => clearInterval(interval);
    }, []);

    async function sendMessage() {
        if (!selectedUser) return alert("กรุณาเลือกลูกค้า");
        const res = await fetch("/api/lineChat/linemessage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: selectedUser.userId,
                message,
            }),
        });
        setStatus(res.ok ? "✅ ส่งสำเร็จ" : "❌ ส่งไม่สำเร็จ");
    }

    return (
        <div className="p-6 grid grid-cols-2 gap-6">
            <div className="border rounded-2xl p-4">
                <h3 className="font-bold mb-3">รายชื่อลูกค้า</h3>
                <ul className="space-y-2">
                    {customers.map((c) => (
                        <li
                            key={c.userId}
                            onClick={() => setSelectedUser(c)}
                            className={`p-2 border rounded cursor-pointer ${selectedUser?.userId === c.userId
                                    ? "bg-green-100 border-green-400"
                                    : "hover:bg-gray-50"
                                }`}
                        >
                            <p className="text-sm font-medium">{c.userId}</p>
                            <p className="text-xs text-gray-500">{c.lastMessage}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="border rounded-2xl p-4">
                <h3 className="font-bold mb-3">ส่งข้อความ</h3>
                {selectedUser ? (
                    <>
                        <p className="text-sm text-gray-500 mb-2">
                            กำลังตอบ: <b>{selectedUser.userId}</b>
                        </p>
                        <textarea
                            className="border p-2 w-full rounded mb-3"
                            rows={3}
                            placeholder="พิมพ์ข้อความ"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-green-600 text-white px-4 py-2 rounded w-full"
                        >
                            ส่งข้อความ
                        </button>
                        <p className="text-sm mt-2">{status}</p>
                    </>
                ) : (
                    <p className="text-gray-400">← กรุณาเลือกลูกค้า</p>
                )}
            </div>
        </div>
    );
}
