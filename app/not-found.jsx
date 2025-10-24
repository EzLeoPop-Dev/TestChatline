"use client"

import { useRouter } from "next/navigation"

export default function Page() {
    const router = useRouter()

    const handleGoBack = () => {
        // ลองกลับหน้าก่อนหน้า ถ้าไม่ได้ให้ไปหน้าแรก
        if (window.history.length > 1) {
            router.back()
        } else {
            router.push('/')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-3">
            <div className="section">
                <h1 className="text-5xl lg:text-8xl font-semibold text-center mb-2">404</h1>
                <h5 className="text-2xl font-semibold text-center mb-1">Page is not found</h5>
                <h5 className="text-center mb-5">ขออภัยไม่พบหน้าที่คุณต้องการค้นหา</h5>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={handleGoBack}
                        type="button"
                        className="bg-purple-600 cursor-pointer hover:bg-purple-700 duration-150 text-white rounded-md px-7 py-2"
                    >
                        กลับหน้าก่อนหน้า
                    </button>
                </div>
            </div>
        </div>
    )
}