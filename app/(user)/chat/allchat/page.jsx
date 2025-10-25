"use client";
import { useEffect, useState } from "react";

export default function ChatPage() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState("");

    // โหลดข้อมูลแบบ Realtime ผ่าน SSE
    useEffect(() => {
        const eventSource = new EventSource("/api/lineChat?stream=true");

        eventSource.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                setUsers(data);

                // ถ้ามีคนถูกเลือกอยู่ → อัปเดตข้อความของคนนั้นด้วย
                if (selectedUser) {
                    const updated = data.find(u => u.userId === selectedUser.userId);
                    if (updated) setSelectedUser(updated);
                }
            } catch (err) {
                console.error("❌ Error parsing SSE:", err);
            }
        };

        eventSource.onerror = () => {
            console.warn("⚠️ SSE disconnected, will retry...");
            eventSource.close();
        };

        return () => eventSource.close();
    }, [selectedUser?.userId]); // เปิดเฉพาะ 1 ครั้ง

    // ส่งข้อความจากพนักงาน
    const sendMessage = async () => {
        if (!selectedUser || !message.trim()) return;

        await fetch("/api/lineChat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: selectedUser.userId, text: message }),
        });

        setMessage("");
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar: รายชื่อลูกค้า */}
            <div className="w-1/4 bg-gray-100 border-r overflow-y-auto">
                <h2 className="p-4 font-bold text-lg border-b">ลูกค้า</h2>
                {users.length === 0 && (
                    <div className="p-4 text-gray-400 text-sm">ยังไม่มีข้อความ</div>
                )}
                {users.map(u => (
                    <div
                        key={u.userId}
                        onClick={() => setSelectedUser(u)}
                        className={`p-3 cursor-pointer border-b hover:bg-gray-200 ${selectedUser?.userId === u.userId ? "bg-gray-300" : ""
                            }`}
                    >
                        {u.displayName}
                    </div>
                ))}
            </div>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedUser ? (
                    <>
                        <div className="flex-1 p-4 overflow-y-auto">
                            {selectedUser.messages.map((m, i) => (
                                <div key={i} className={`my-2 ${m.from === "customer" ? "text-left" : "text-right"}`}>
                                    <span
                                        className={`inline-block px-3 py-2 rounded-2xl ${m.from === "customer" ? "bg-gray-200" : "bg-green-300"
                                            }`}
                                    >
                                        {m.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* กล่องพิมพ์ข้อความ */}
                        <div className="p-4 border-t flex bg-gray-50">
                            <input
                                className="flex-1 border rounded px-3 py-2 mr-2"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="พิมพ์ข้อความ..."
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                ส่ง
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center flex-1 text-gray-500">
                        🗨️ เลือกลูกค้าจากด้านซ้ายเพื่อเริ่มแชท
                    </div>
                )}
            </div>
        </div>
    );
}
