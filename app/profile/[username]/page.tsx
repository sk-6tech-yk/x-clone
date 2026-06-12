"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";

type User = {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  _count: {
    followers: number;
    following: number;
    tweets: number;
  };
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

export default function UserProfilePage(){
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [user, setUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  async function fetchProfile() {
    const meRes = await fetch("/api/auth/me");
    if (!meRes.ok) {
      router.replace("/login");
      return;
    }
    const meData = await meRes.json();

    const userRes = await fetch(`/api/users/${username}`);
    if (!userRes.ok){
      router.replace("/home");
      return;
    }
    const userData = await userRes.json();
    setUser(userData.user);
    setIsFollowing(userData.isFollowing);
    setIsMe(meData.user.id === userData.user.id);

    const tweetsRes = await fetch(`/api/users/${username}/tweets`);
    const tweetsData = await tweetsRes.json();
    setTweets(tweetsData.tweets || []);

    setLoading(false);
  }

  async function handleFollow() {
    if (!user) return;
    await fetch(`/api/users/${user.username}/follow`, { method: "POST" });
    fetchProfile();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <main className="flex-1 ml-64 max-w-2xl border-r border-gray-800">
        {/* ヘッダー */}
        <header className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-white hover:text-gray-400"
          >
            ←
          </button>
          <h1 className="text-xl font-bold">{user?.name}</h1>
        </header>

        {/* プロフィール情報 */}
        <div className="p-4 border-b border-gray-800">
          <div className="w-20 h-20 rounded-full bg-gray-600 mb-4" />

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-gray-500">@{user?.username}</p>
            </div>
            {!isMe && (
              <button
                onClick={handleFollow}
                className={`px-5 py-2 rounded-full font-bold transition-colors ${
                  isFollowing
                  ? "border border-gray-600 text-white hover:border-red-500 hover:text-red-500"
                  : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {isFollowing ? "フォロー中" : "フォローする" }
              </button>
            )}
          </div>

          {user?.bio && <p className="mt-3">{user.bio}</p>}

          <p className="text-gray-500 text-sm mt-3">
            📅 {new Date(user?.createdAt ?? "").toLocaleDateString("ja-JP")}に登録
          </p>

          <div className="flex gap-6 mt-3">
            <span>
              <span className="font-bold">{user?._count.following}</span>
              <span className="text-gray-500 ml-1">フォロー中</span>
            </span>
            <span>
              <span className="font-bold">{user?._count.followers}</span>
              <span className="text-gray-500 ml-1">フォロワー</span>
            </span>
          </div>
        </div>

        {/* ツイート一覧 */}
        <div>
          {tweets.map((tweet) => (
            <div key={tweet.id} className="border-b border-gray-800 p-4 hover:bg-gray-950">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{tweet.author.name}</span>
                    <span className="text-gray-500">@{tweet.author.username}</span>
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
      </main>
    </div>
  );
}