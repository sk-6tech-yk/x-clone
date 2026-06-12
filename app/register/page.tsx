"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage(){
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, password}),
    });

    const data = await res.json();

    if(!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    //auto login after registration
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if(loginRes.ok) {
      router.push("/home");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-sm px-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">𝕏</h1>
        <h2 className="text-2xl font-bold text-white mb-6">アカウント作成</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border border-gray-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="text"
            placeholder="ユーザー名 (@なし)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-transparent border border-gray-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border border-gray-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-blue-500"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent border border-gray-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-blue-500"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black font-bold py-3 rounded-full hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-6">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}