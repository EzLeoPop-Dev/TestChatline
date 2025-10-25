// ChatUI.jsx
import { useEffect, useState, useRef } from "react";

export default function ChatUI() {
    const [chatHistory, setChatHistory] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState("");
    const messageEndRef = useRef();

    // SSE สำหรับ realtime
    useEffect(() => {
        const evtSource = new EventSource("/api/chat?stream=true");
        evtSource.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setChatHistory(data);
        };
        return () => evtSource.close();
    }, []);

    // scroll ลงข้อความล่าสุด
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, selectedUser]);

    const sendMessage = async () => {
        if (!message || !selectedUser) return;
        await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: selectedUser.userId, text: message }),
        });
        setMessage("");
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r overflow-y-auto">
                <h2 className="text-xl font-bold p-4 border-b">Users</h2>
                {chatHistory.map((user) => (
                    <div
                        key={user.userId}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 cursor-pointer hover:bg-gray-200 ${selectedUser?.userId === user.userId ? "bg-gray-200" : ""
                            }`}
                    >
                        <div className="font-semibold">{user.displayName}</div>
                        <div className="text-sm text-gray-500">
                            {user.messages[user.messages.length - 1]?.text || ""}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat window */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto">
                    {!selectedUser && <div className="text-gray-500">Select a user</div>}
                    {selectedUser?.messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`my-2 flex ${msg.from === "agent" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`px-4 py-2 rounded-lg max-w-xs ${msg.from === "agent"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-300 text-gray-900"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messageEndRef} />
                </div>

                {/* Input */}
                {selectedUser && (
                    <div className="p-4 border-t flex">
                        <input
                            type="text"
                            className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
                            placeholder="Type a message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
