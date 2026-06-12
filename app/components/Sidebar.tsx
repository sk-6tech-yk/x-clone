"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
    }

    return (
        <aside className="fixed left-0 top-0 h-full w-64 border-r border-gray-800 px-4 py-6 flex flex-col justify-between">
            <div className="flex flex-col gap-2">
                {/* ロゴ */}
                <Link href="/home" className="text-3xl font-bold text-white px-3 py-2 mb-4 block">
                    𝕏
                </Link>

                {/* ナビゲーション */}
                <Link
                    href="/home"
                    className="flex items-center gap-4 text-white text-xl px-3 py-3 rounded-full hover:bg-gray-900 transition-colors"
                >
                    <span>🏠</span>
                    <span>ホーム</span>
                </Link>
                <Link
                    href="/profile"
                    className="flex items-center gap-4 text-white text-xl px-3 py-3 rounded-full hover:bg-gray-900 transition-colors"
                >
                    <span>👤</span>
                    <span>プロフィール</span>
                </Link>
                <Link
                    href="/search"
                    className="flex items-center gap-4 text-white text-xl px-3 py-3 rounded-full hover:bg-gray-900 transition-colors"
                >
                    <span>🔍</span>
                    <span>検索</span>
                </Link>
            </div>

            {/* ログアウト */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-4 text-white text-xl px-3 py-3 rounded-full hover:bg-gray-900 transition-colors w-full"
            >
                <span>🚪</span>
                <span>ログアウト</span>
            </button>
        </aside>
    )
}