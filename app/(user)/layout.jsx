"use client";

import Sidebar from "../components/SideBar";

export default function SidebarLayout({ children }) {
    return (
        <div className="flex min-h-screen p-3 bg-[url('/Bg.jpg')] bg-cover bg-center w-full">
            <div>
                <Sidebar/>
            </div>
            <div className="flex-1 p-6">
                {children ? children : <p>Main Content Here</p>}
            </div>
        </div>
    );
}