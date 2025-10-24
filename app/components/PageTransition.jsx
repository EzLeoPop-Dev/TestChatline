"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }) {
    const pathname = usePathname();
    const [showChildren, setShowChildren] = useState(true);
    const [overlayKey, setOverlayKey] = useState(pathname);

    useEffect(() => {
        setShowChildren(false); // เริ่ม overlay
        const timer = setTimeout(() => {
            setOverlayKey(pathname); // เปลี่ยน content
            setShowChildren(true);
        }, 600); // ระยะเวลา overlay
        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* Overlay สีดำเต็มจอ */}
            <AnimatePresence mode="wait">
                {!showChildren && (
                    <motion.div
                        key="overlay"
                        initial={{ x: "100%" }}
                        animate={{ x: "0%" }}
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute top-0 left-0 w-full h-full bg-black z-50"
                    />
                )}
            </AnimatePresence>

            {/* Content หน้าใหม่ */}
            <AnimatePresence mode="wait">
                {showChildren && (
                    <motion.div
                        key={overlayKey}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }} // ลดเวลา fade-in
                        className="relative z-10"
                    >
                        {children}
                    </motion.div>

                )}
            </AnimatePresence>
        </div>
    );
}
