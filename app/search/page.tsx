"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

type User = {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
};

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
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.SyntheticEvent){
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTweets(data.tweets || []);
    setSearched(true);
    setLoading(false);
  }

  return(
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <main className="flex-1 ml-64 max-w-2xl border-r border-gray-800">
        {/* ヘッダー */}
        <header className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="検索"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-gray-900 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 disabled:opacity-50"
            >
              検索
            </button>
          </form>
        </header>

        {/* 検索結果 */}
        {loading && (
          <div className="p-8 text-center text-gray-500">検索中...</div>
        )}

        {!loading && searched && (
          <>
            {/* ユーザー結果 */}
            {users.length > 0 && (
              <div className="border-b border-gray-800">
                <h2 className="px-4 py-3 font-bold text-gray-500 text-sm">ユーザー</h2>
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-950 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0" />
                    <div className="">
                      <p className="font-bold">{user.name}</p>
                      <p className="text-gray-500 text-sm">@{user.username}</p>
                      {user.bio && <p className="text-gray-400 text-sm mt-1">{user.bio}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* ツイート結果 */}
            {tweets.length > 0 && (
              <div>
                <h2 className="px-4 py-3 font-bold text-gray-500 text-sm">ポスト</h2>
                {tweets.map((tweet) => (
                  <div key={tweet.id} className="border-b border-gray-800 p-4 hover:bg-gray-950">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{tweet.author.name}</span>
                          <Link
                            href={`/profile/${tweet.author.username}`}
                            className="text-gray-500 hover:underline"
                          >
                            @{tweet.author.username}
                          </Link>
                        </div>
                        <p className="mt-1">{tweet.content}</p>
                        <div className="flex gap-6 mt-3 text-gray-500 text-sm">
                          <span>💬 {tweet._count.replies}</span>
                          <span>❤️ {tweet._count.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 結果なし */}
            {users.length === 0 && tweets.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                「{query}」の検索結果はありませんでした
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}