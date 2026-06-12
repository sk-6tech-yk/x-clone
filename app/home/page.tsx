"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";

type Tweet = {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        username: string;
        name: string;
        avatar: string | null;
    };
    _count: {
        likes: number;
        replies: number;
    };
    likes: { userId: string }[];
};

export default function HomePage() {
    const router = useRouter();
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchTweets();
        fetchMe();
    }, []);

    async function fetchMe() {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
            router.push("/login");
            return;
        }
        const data = await res.json();
        setUserId(data.user.id);
    }

    async function fetchTweets() {
        const res = await fetch("/api/tweets");
        const data = await res.json();
        setTweets(data.tweets || []);
    }

    async function handleTweet(e: React.SyntheticEvent) {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);

        const res = await fetch("/api/tweets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        })

        if (res.ok) {
            setContent("");
            fetchTweets();
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        await fetch(`/api/tweets/${id}`, { method: "DELETE" });
        fetchTweets();
    }

    async function handleLike(tweetId: string) {
        await fetch(`/api/tweets/${tweetId}/like`, { method: "POST" });
        fetchTweets();
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* sidebar */}
            <Sidebar />

            {/* メインコンテンツ */}
            <main className="flex-1 ml-64 max-w-2xl border-r border-gray-800">
                {/* ヘッダー */}
                <header className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3">
                    <h1 className="text-xl font-bold">ホーム</h1>
                </header>

                {/* ツイート投稿欄 */}
                <div className="border-b border-gray-800 p-4">
                    <form onSubmit={handleTweet} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0" />
                        <div className="flex-1">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="いまどうしてる？"
                                className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg"
                                rows={3}
                                maxLength={140}
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-gray-500 text-sm">{content.length}/140</span>
                                <button
                                    type="submit"
                                    disabled={loading || !content.trim()}
                                    className="bg-blue-500 text-white font-bold px-5 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {loading ? "投稿中..." : "ポスト"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* ツイート一覧 */}
                <div className="">
                    {tweets.map((tweet) => (
                        <div key={tweet.id} className="border-b border-gray-800 p-4 hover:bg-gray-950">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{tweet.author.name}</span>
                                            <Link href={`/profile/${tweet.author.username}`} className="text-gray-500 hover:underline">
                                                @{tweet.author.username}
                                            </Link>
                                        </div>
                                        {userId === tweet.author.id && (
                                            <button
                                                onClick={() => handleDelete(tweet.id)}
                                                className="text-gray-500 hover:text-red-500 text-sm"
                                            >
                                                削除
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-1">{tweet.content}</p>
                                    <div className="flex gap-6 mt-3 text-gray-500 text-sm">
                                        <span>💬 {tweet._count.replies}</span>
                                        <button
                                            onClick={() => handleLike(tweet.id)}
                                            className={`flex items-center gap-1 hover:text-red-500 transition-colors ${tweet.likes.length > 0 ? "text-red-500" : ""
                                                }`}
                                        >
                                            ❤️ {tweet._count.likes}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );

}

