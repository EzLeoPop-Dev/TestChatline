"use client";
import { useState, useEffect } from "react";

export default function ChatDashboard() {
    const [customers, setCustomers] = useState([]);      // รายชื่อลูกค้า
    const [selectedUser, setSelectedUser] = useState(null); // ลูกค้าที่เลือกตอบ
    const [message, setMessage] = useState("");          // ข้อความที่จะส่ง
    const [status, setStatus] = useState("");            // สถานะส่งข้อความ

    // 🔄 ดึงรายชื่อลูกค้า ทุก 5 วินาที
    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch("/api/lineChat/LineHook");
                const data = await res.json();
                setCustomers(data);
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        }
        fetchUsers();
        const interval = setInterval(fetchUsers, 5000);
        return () => clearInterval(interval);
    }, []);

    // ส่งข้อความไปลูกค้า
    async function sendMessage() {
        if (!selectedUser) return alert("กรุณาเลือกลูกค้า");
        if (!message.trim()) return alert("กรุณาพิมพ์ข้อความก่อนส่ง");

        try {
            const res = await fetch("/api/line", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "sendMessage",
                    userId: selectedUser.userId,
                    message,
                }),
            });

            if (res.ok) {
                setStatus("✅ ส่งข้อความสำเร็จ");
                setMessage(""); // เคลียร์ข้อความหลังส่ง
            } else {
                const data = await res.json();
                setStatus("❌ ส่งไม่สำเร็จ: " + (data.error || ""));
            }
        } catch (err) {
            console.error(err);
            setStatus("❌ เกิดข้อผิดพลาด");
        }
    }

    return (
        <div className="p-6 grid grid-cols-2 gap-6">

            {/* ฝั่งรายชื่อลูกค้า */}
            <div className="border rounded-2xl p-4">
                <h3 className="font-bold mb-3 text-lg">รายชื่อลูกค้า</h3>
                <ul className="space-y-2 max-h-[500px] overflow-y-auto">
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
                    {customers.length === 0 && (
                        <li className="text-gray-400 text-sm">ยังไม่มีลูกค้า</li>
                    )}
                </ul>
            </div>

            {/* ฝั่งส่งข้อความ */}
            <div className="border rounded-2xl p-4">
                <h3 className="font-bold mb-3 text-lg">ส่งข้อความ</h3>
                {selectedUser ? (
                    <>
                        <p className="text-sm text-gray-500 mb-2">
                            กำลังตอบ: <b>{selectedUser.userId}</b>
                        </p>
                        <textarea
                            className="border p-2 w-full rounded mb-3"
                            rows={4}
                            placeholder="พิมพ์ข้อความ"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
                        >
                            ส่งข้อความ
                        </button>
                        <p className="text-sm mt-2">{status}</p>
                    </>
                ) : (
                    <p className="text-gray-400">← กรุณาเลือกลูกค้าจากฝั่งซ้าย</p>
                )}
            </div>
        </div>
    );
}
