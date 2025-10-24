"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Grid3x3,
    MessageCircle,
    Contact,
    Headphones,
    LayoutDashboard,
    Shield,
    ChevronDown,
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState(null);

    return (
        <div className="flex min-h-screen p-3 ">
            {/* Sidebar */}
            <div
                className="relative w-[300px] h-screen rounded-3xl overflow-hidden"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(190, 126, 199, 0.5), rgba(139, 90, 158, 0.5))",
                    boxShadow: "0 64px 64px -32px rgba(41, 15, 0, 0.56)",
                }}
            >
                {/* Backdrop blur */}
                <div className="absolute inset-0 backdrop-blur-[160px] bg-white/5"></div>

                {/* Border gradient */}
                <div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                        background: "radial-gradient(circle at 50% 0%, #B86E9F, #662525)",
                        WebkitMask:
                            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        padding: "1px",
                    }}
                ></div>

                <div className="relative z-10 p-6">
                    {/* Header dots */}
                    <div className="flex items-center gap-2 mb-5">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                            <img
                                src="/api/placeholder/48/48"
                                alt="Andrew Smith"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-xs text-white/60 uppercase tracking-wide">Employee</p>
                            <p className="text-white font-medium">Andrew Smith</p>
                        </div>
                    </div>

                    {/* Menu */}
                    <div className="mb-4">
                        <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Main</p>
                        <nav className="space-y-1">
                            {/* Overlay */}
                            <Link
                                href={"/overlay"}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 ${pathname.startsWith("/overlay")
                                    ? "bg-white/20 text-white"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <Grid3x3 size={20} />
                                <span className="text-sm font-medium">Overlay</span>
                            </Link>

                            {/* All Chat Dropdown */}
                            <div>
                                <button
                                    onClick={() =>
                                        setOpenDropdown(openDropdown === "all-chat" ? null : "all-chat")
                                    }
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 ${pathname.startsWith("/chat")
                                        ? "bg-white/20 text-white"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    <MessageCircle size={20} />
                                    <span className="text-sm font-medium">All Chat</span>
                                    <ChevronDown
                                        size={16}
                                        className={`ml-auto transition-transform duration-300 ${openDropdown === "all-chat" ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdown === "all-chat"
                                        ? "max-h-40 opacity-100 mt-1"
                                        : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <div className="ml-4 flex flex-col space-y-1">
                                        <Link
                                            href="/chat/discord"
                                            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors duration-300 ${pathname === "/chat/discord"
                                                ? "bg-white/20 text-white"
                                                : "text-white/70 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            All Chat
                                        </Link>
                                        <Link
                                            href="/chat/facebook"
                                            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors duration-300 ${pathname === "/chat/facebook"
                                                ? "bg-white/20 text-white"
                                                : "text-white/70 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            Facebook
                                        </Link>
                                        <Link
                                            href="/chat/line"
                                            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors duration-300 ${pathname === "/chat/line"
                                                ? "bg-white/20 text-white"
                                                : "text-white/70 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            Line
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <Link
                                href="/contact"
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 ${pathname.startsWith("/contact")
                                    ? "bg-white/20 text-white"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <Contact size={20} />
                                <span className="text-sm font-medium">Contact</span>
                            </Link>

                            {/* AI Support */}
                            <Link
                                href="/ai-support"
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 ${pathname.startsWith("/ai-support")
                                    ? "bg-white/20 text-white"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <Headphones size={20} />
                                <span className="text-sm font-medium">AI Support</span>
                            </Link>

                            {/* Dashboard */}
                            <Link
                                href="/dashboard"
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 ${pathname.startsWith("/dashboard")
                                    ? "bg-white/20 text-white"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <LayoutDashboard size={20} />
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>

                            {/* Admin Panel */}
                            <Link
                                href="/admin"
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-300 ${pathname.startsWith("/admin")
                                    ? "bg-white/20 text-white"
                                    : "text-white/80 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <Shield size={20} />
                                <span className="text-sm font-medium">Admin Panel</span>
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}