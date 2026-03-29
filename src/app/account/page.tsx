"use client";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function AccountPage() {
  return (
    <div className="min-h-screen w-full bg-pink-200 flex justify-center">
      <div className="relative w-full max-w-md bg-pink-100 min-h-screen shadow-2xl pb-28">

        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md">
          <div className="flex flex-col items-center py-6">
            <div className="h-20 w-20 rounded-full bg-pink-300 flex items-center justify-center text-white text-2xl font-bold shadow">
              S
            </div>
            <h2 className="mt-3 text-lg font-semibold">User</h2>
            <p className="text-sm text-gray-500">spukk@email.com</p>
          </div>
        </header>

        {/* Menu */}
        <main className="px-4 py-4 space-y-3">

          {/* Profile */}
          <MenuItem title="แก้ไขโปรไฟล์" />

          {/* Orders */}
          <MenuItem title="ประวัติคำสั่งซื้อ" />

          {/* Address */}
          <MenuItem title="ที่อยู่จัดส่ง" />



          {/* Settings */}
          <MenuItem title="ตั้งค่า" />

          {/* Logout */}
          <Link
            href = "/"
            className="mt-3 block rounded-xl bg-pink-600 text-white text-center py-3 font-semibold hover:bg-pink-700">
            ออกจากระบบ
          </Link>

        </main>

        {/* Bottom Nav */}
        <BottomNav/>
      </div>
    </div>
  );
}

/* Component menu */
function MenuItem({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:bg-gray-50 cursor-pointer">
      <span className="text-sm font-medium">{title}</span>
      <svg
        className="h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}